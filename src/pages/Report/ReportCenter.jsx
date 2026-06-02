import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, DataTable, SectionBlock, StatusSummaryPanel, SummaryStatGrid } from '../../components/Common';
import { ProjectStageShell } from '../../components/ProjectFlow';
import { useProject, useOwnerPath, useIntegratorPath, useVendorPath } from '../../hooks/useProject';
import { getReportCenterViewModel } from '../../domain/viewModels/selectionReportViewModels';
import { copyMarkdownToClipboard, exportReportAsMarkdown } from '../../utils/reportGenerator';
import styles from './ReportCenter.module.css';

export function ReportCenter() {
  const { state, actions } = useProject();
  const { projectMeta, riskProfile } = useOwnerPath();
  const { plan } = useIntegratorPath();
  const { capabilities, matchResults, gapClosureItems } = useVendorPath();
  const viewModel = getReportCenterViewModel({ projectMeta, riskProfile, plan, capabilities, matchResults, gapClosureItems });
  const [exportStatus, setExportStatus] = useState('');
  const [markdownPreview, setMarkdownPreview] = useState('');
  const [markdownFilename, setMarkdownFilename] = useState('');
  const handleExportMarkdown = async () => {
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
    setExportStatus(copied ? `已生成 Markdown，并复制到剪贴板。建议保存为：${result.filename}` : `已生成 Markdown，请从下方文本框复制并保存为：${result.filename}`);
  };

  return (
    <ProjectStageShell
      stageNumber="05"
      title="符合性判断"
      projectName={viewModel.projectName}
      outputLabel={`协作差距与补偿措施 ${viewModel.gapClosureItems.length} / 高严重度 ${viewModel.highRiskCount}`}
      statusText={viewModel.statusSummary.headline}
      statusPanel={<StatusSummaryPanel label={viewModel.statusSummary.title} value={viewModel.statusSummary.headline} note={viewModel.statusSummary.detail} pills={viewModel.statusSummary.pills} />}
      prevAction={{ to: '/selection', label: '上一步' }}
      guidance={{ summary: '符合性判断用于汇总业主输入、系统实现、产品与开发、差距分析以及审核视角下的判断。' }}
    >
      {({ statusBar }) => (
        <section className={styles.page}>
        <section className={styles.deliveryHero}>
          <div>
            <span>当前产出</span>
            <strong>{viewModel.gapClosureReady ? '可导出阶段性符合性判断说明' : '仍需补齐案例证据与闭环信息'}</strong>
            <p>Markdown 总结与审核会汇总案例背景、目标、系统实现、产品与开发、协作差距、IEC 映射和免责声明。</p>
          </div>
          <div className={styles.exportActions}><Button variant="primary" size="small" onClick={handleExportMarkdown}>生成 Markdown 总结与审核</Button>{exportStatus ? <span>{exportStatus}</span> : null}</div>
        </section>

        {markdownPreview ? <SectionBlock title={`Markdown 内容预览：${markdownFilename}`}><textarea className={styles.markdownPreview} value={markdownPreview} readOnly onFocus={(event) => event.target.select()} /></SectionBlock> : null}

        <SectionBlock title="案例阶段成果">
          <DataTable><thead><tr><th>案例阶段成果</th><th>状态</th><th>说明</th><th>入口</th></tr></thead><tbody>{viewModel.items.map((item) => <tr key={item.title}><td>{item.title}</td><td>{item.ready ? '已具备' : '待补齐'}</td><td>{item.desc}</td><td>{item.ready ? <Link to={item.route} className={styles.link}>查看</Link> : '—'}</td></tr>)}</tbody></DataTable>
        </SectionBlock>

        <SectionBlock title="协作差距与补偿措施">
          <SummaryStatGrid items={[{ label: '待闭环差距', value: viewModel.gapRows.length }, { label: '已保存协作差距与补偿措施', value: viewModel.gapClosureItems.length }, { label: '高严重度', value: viewModel.highRiskCount }, { label: '依赖外部补偿', value: viewModel.externalCount }]} />
          {viewModel.gapClosureItems.length ? <div className={styles.list}>{viewModel.gapClosureItems.map((item) => <article key={item.id} className={styles.item}><strong>{item.display.label}</strong><div className={styles.capabilityMeta}><span className={styles.standardTag}>{item.display.frText}</span><span className={styles.standardTag}>{item.display.srText}</span></div><span>{item.owner || '责任方未填写'}</span><p><strong>补偿措施：</strong>{item.mitigation || '未填写'}</p><p><strong>验收影响：</strong>{item.acceptanceImpact || '未填写'}</p><p><strong>残余风险：</strong>{item.residualRisk || '未填写'}</p></article>)}</div> : <div className={styles.empty}>当前还没有已保存的差距处置决策，请先前往协作与差距页面完成保存。</div>}
        </SectionBlock>

        <SectionBlock title="IEC 62443 映射依据">
          <DataTable><thead><tr><th>能力项</th><th>Part</th><th>FR / SR</th><th>条款摘要</th><th>系统解释</th><th>当前限制</th></tr></thead><tbody>{viewModel.mappingRows.length ? viewModel.mappingRows.map((item) => <tr key={item.requirement.id || item.requirement.capabilityId}><td>{item.display.label}</td><td>{item.mapping.part}</td><td>{item.mapping.fr} / {item.mapping.sr}</td><td>{item.mapping.requirementSummary}</td><td>{item.mapping.systemInterpretation}</td><td>{item.mapping.limitation}</td></tr>) : <tr><td colSpan="6">当前还没有可展示的能力映射，请先完成方案转译中的能力需求。</td></tr>}</tbody></DataTable>
        </SectionBlock>
        {statusBar}
        <SectionBlock title="审核判断样例（审核视角，非标准主角色）"><div className={styles.list}><article className={styles.item}><strong>示例判断：本案例是否可支撑 SL2 目标说明</strong><p><strong>已具备：</strong>边界访问控制、事件日志、Syslog 输出、远程访问边界控制具备明确设计与产品支撑。</p><p><strong>部分具备：</strong>细粒度 RBAC 仍需开发版本或集中管理平台配合。</p><p><strong>依赖外部补偿：</strong>项目级审计报表依赖集中日志/SIEM 平台与运行期维护流程。</p><p><strong>教学型结论：</strong>若补充集中日志平台、权限管理补偿措施及对应运行记录，本案例可作为“支撑 SL2 目标说明”的示例；若缺少这些补充，则当前证据更适合表述为“部分满足，需补偿闭环”。</p></article><article className={styles.item}><strong>关于 3-3 / 4-1 / 4-2</strong><p>当前平台先提供审核视角框架和教学型判断示例，后续可在此基础上继续细化到更具体的认证关注点说明。</p></article></div></SectionBlock>
      </section>
      )}
    </ProjectStageShell>
  );
}
