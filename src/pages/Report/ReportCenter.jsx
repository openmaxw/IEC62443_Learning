import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Card, DataTable, PillTag, SectionBlock, StatusSummaryPanel, SummaryStatGrid } from '../../components/Common';
import { CaseStageLayout, ProjectStageShell } from '../../components/ProjectFlow';
import { useProject, useOwnerPath, useIntegratorPath, useVendorPath } from '../../hooks/useProject';
import { getReportCenterViewModel } from '../../domain/viewModels/selectionReportViewModels';
import { copyMarkdownToClipboard, exportReportAsMarkdown } from '../../utils/reportGenerator';
import styles from './ReportCenter.module.css';

export function ReportCenter() {
  const navigate = useNavigate();
  const { state, actions } = useProject();
  const { projectMeta, riskProfile } = useOwnerPath();
  const { plan } = useIntegratorPath();
  const { capabilities, matchResults, gapClosureItems } = useVendorPath();
  const viewModel = getReportCenterViewModel({ projectMeta, riskProfile, plan, capabilities, matchResults, gapClosureItems });
  const [exportStatus, setExportStatus] = useState('');
  const [markdownPreview, setMarkdownPreview] = useState('');
  const [markdownFilename, setMarkdownFilename] = useState('');
  const handleExportMarkdown = async () => {
    if (viewModel.gapRows.length) {
      window.alert(`当前有 ${viewModel.gapRows.length} 项差距尚未完成闭环，系统将跳转到闭环确认步骤。`);
      navigate('/selection?step=4');
      return;
    }
    const result = exportReportAsMarkdown(viewModel.reportPayload);
    setMarkdownPreview(result.markdown);
    setMarkdownFilename(result.filename);
    actions.setReports([
      ...(state.deliverables?.reports || []),
      {
        id: `markdown-${Date.now()}`,
        type: 'markdown',
        title: 'Markdown 总结与审核',
        filename: result.filename,
        generatedAt: new Date().toISOString()
      }
    ]);
    const copied = await copyMarkdownToClipboard(result.markdown);
    setExportStatus(copied ? `已生成 Markdown，建议保存为：${result.filename}` : `已生成 Markdown，请从下方复制并保存为：${result.filename}`);
  };

  return (
    <CaseStageLayout><ProjectStageShell
      stageNumber="06"
      title="形成判断"
      projectName={viewModel.projectName}
      outputLabel={`协作差距与补偿措施 ${viewModel.gapClosureItems.length} / 高严重度 ${viewModel.highRiskCount}`}
      statusText={viewModel.statusSummary.headline}
      statusPanel={<StatusSummaryPanel label={viewModel.statusSummary.title} value={viewModel.statusSummary.headline} note={viewModel.statusSummary.detail} pills={viewModel.statusSummary.pills} />}
      prevAction={{ to: '/selection', label: '返回闭环环节' }}
      guidance={{ summary: '本页由审核 / 复核视角汇总前面的目标、设计、能力和差距，形成一份有依据、有边界、可复核的综合判断。' }}
    >
      {({ statusBar }) => (
        <section className={styles.page}>
        <div className={styles.exportActionsInline}><Button variant="primary" size="small" onClick={handleExportMarkdown}>完成本轮判断并生成 Markdown</Button>{exportStatus ? <span>{exportStatus}</span> : null}</div>

        {markdownPreview ? <SectionBlock title={`Markdown 内容预览：${markdownFilename}`}><textarea className={styles.markdownPreview} value={markdownPreview} readOnly onFocus={(event) => event.target.select()} /></SectionBlock> : null}

        <SectionBlock title="案例阶段成果">
          <DataTable><thead><tr><th>案例阶段成果</th><th>状态</th><th>说明</th><th>入口</th></tr></thead><tbody>{viewModel.items.map((item) => <tr key={item.title}><td>{item.title}</td><td>{item.ready ? '已具备' : '待补齐'}</td><td>{item.desc}</td><td>{item.ready ? <Link to={item.route} className={styles.link}>进入本页</Link> : '—'}</td></tr>)}</tbody></DataTable>
        </SectionBlock>

        <SectionBlock title="协作差距与补偿措施">
          <SummaryStatGrid items={[{ label: '待闭环差距', value: viewModel.gapRows.length }, { label: '已保存协作差距与补偿措施', value: viewModel.gapClosureItems.length }, { label: '高严重度', value: viewModel.highRiskCount }, { label: '依赖外部补偿', value: viewModel.externalCount }]} />
          {viewModel.gapClosureItems.length ? <div className={styles.list}>{viewModel.gapClosureItems.map((item) => <Card key={item.id} className={styles.item}><strong>{item.display.label}</strong><div className={styles.capabilityMeta}><PillTag tone="primary">{item.display.frText}</PillTag><PillTag tone="primary">{item.display.srText}</PillTag></div><span>{item.owner || '责任方未填写'}</span><p><strong>补偿措施：</strong>{item.mitigation || '未填写'}</p><p><strong>验收影响：</strong>{item.acceptanceImpact || '未填写'}</p><p><strong>残余风险：</strong>{item.residualRisk || '未填写'}</p></Card>)}</div> : <div className={styles.empty}>暂无已保存的闭环决策。</div>}
        </SectionBlock>

        <SectionBlock title="IEC 62443 映射依据">
          <DataTable><thead><tr><th>能力项</th><th>Part</th><th>FR / SR</th><th>条款摘要</th><th>系统解释</th><th>当前限制</th></tr></thead><tbody>{viewModel.mappingRows.length ? viewModel.mappingRows.map((item) => <tr key={item.requirement.id || item.requirement.capabilityId}><td>{item.display.label}</td><td>{item.mapping.part}</td><td>{item.mapping.fr} / {item.mapping.sr}</td><td>{item.mapping.requirementSummary}</td><td>{item.mapping.systemInterpretation}</td><td>{item.mapping.limitation}</td></tr>) : <tr><td colSpan="6">暂无映射依据，请先完成前序输入。</td></tr>}</tbody></DataTable>
        </SectionBlock>
        {statusBar}
        <SectionBlock title="审核判断样例（审核视角，非标准主角色）"><div className={styles.list}><Card className={styles.item}><strong>SL2 判断示例</strong><div className={styles.judgementGrid}><div><span>已具备</span><p>边界访问控制、事件日志、Syslog 输出、远程访问边界控制具备明确设计与产品支撑。</p></div><div><span>部分具备</span><p>细粒度 RBAC 仍需开发版本或集中管理平台配合。</p></div><div><span>外部补偿</span><p>项目级审计报表依赖集中日志或 SIEM 平台，以及运行期维护流程。</p></div><div><span>教学结论</span><p>补齐日志平台、权限管理补偿和运行记录后，可作为支撑 SL2 目标说明的示例。</p></div></div></Card><Card className={styles.item}><strong>认证扩展示例</strong><div className={styles.judgementGrid}><div><span>3-3</span><p>关注系统级安全需求是否完整转译，并形成可验证的设计与职责分工。</p></div><div><span>4-1</span><p>关注产品安全开发、缺陷处理和可信交付证据是否可追溯。</p></div><div><span>4-2</span><p>关注技术安全能力是否具备实现基础，以及声明边界是否清晰。</p></div><div><span>当前定位</span><p>本平台先提供教学型判断框架，后续可继续细化为更具体的审核检查点。</p></div></div></Card></div></SectionBlock>
      </section>
      )}
    </ProjectStageShell></CaseStageLayout>
  );
}
