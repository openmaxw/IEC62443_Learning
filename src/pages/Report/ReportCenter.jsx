import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Card, DataTable, PillTag, SectionBlock, StatusSummaryPanel, SummaryStatGrid, StatusBadge } from '../../components/Common';
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
      navigate('/selection?step=5');
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

  const conclusionReady = viewModel.gapClosureReady;
  const conclusionTone = conclusionReady ? 'statusNative' : 'statusMissing';
  const conclusionText = conclusionReady ? '本轮案例已形成可交付结论' : '本轮案例暂未形成可交付结论';
  const conclusionNote = conclusionReady
    ? '前序目标、系统设计、能力说明和差距闭环已经形成完整链路，可导出本轮 Markdown。'
    : `仍有 ${viewModel.gapRows.length} 项差距未完成闭环，当前结论只能作为待完善状态查看。`;

  return (
    <CaseStageLayout><ProjectStageShell
      stageNumber="06"
      title="形成结论"
      projectName={viewModel.projectName}
      outputLabel={`闭环状态 ${viewModel.gapClosureReady ? '已完成' : '未完成'} / 高严重度 ${viewModel.highRiskCount}`}
      statusText={viewModel.statusSummary.headline}
      statusPanel={<StatusSummaryPanel label={viewModel.statusSummary.title} value={viewModel.statusSummary.headline} note={viewModel.statusSummary.detail} pills={viewModel.statusSummary.pills} />}
      prevAction={{ to: '/selection?step=5', label: '返回闭环确认' }}
      guidance={{ summary: '这里不是重复展示材料，而是基于前面五个阶段，给出这一个项目当前是否已经形成完整结论。' }}
    >
      {({ statusBar }) => (
        <section className={styles.page}>
        <div className={styles.exportActionsInline}><Button variant="primary" size="small" onClick={handleExportMarkdown}>完成本轮判断并生成 Markdown</Button>{exportStatus ? <span>{exportStatus}</span> : null}</div>

        <SectionBlock title="结论摘要">
          <div className={styles.conclusionCard}>
            <div className={styles.conclusionHeader}>
              <StatusBadge tone={conclusionTone}>{conclusionText}</StatusBadge>
              <span>{conclusionNote}</span>
            </div>
            <SummaryStatGrid items={[
              { label: '阶段成果', value: `${viewModel.items.filter((item) => item.ready).length} / ${viewModel.items.length}` },
              { label: '待闭环差距', value: viewModel.gapRows.length },
              { label: '高严重度', value: viewModel.highRiskCount },
              { label: '外部补偿项', value: viewModel.externalCount }
            ]} />
          </div>
        </SectionBlock>

        <SectionBlock title="结论依据">
          <DataTable><thead><tr><th>结论项</th><th>当前判断</th><th>依据说明</th><th>入口</th></tr></thead><tbody>{viewModel.items.map((item) => <tr key={item.title}><td>{item.title}</td><td>{item.ready ? '已具备' : '待补齐'}</td><td>{item.desc}</td><td>{item.ready ? <Link to={item.route} className={styles.link}>查看</Link> : '—'}</td></tr>)}</tbody></DataTable>
        </SectionBlock>

        <SectionBlock title="未闭环事项">
          <SummaryStatGrid items={[{ label: '待闭环差距', value: viewModel.gapRows.length }, { label: '已记录闭环项', value: viewModel.gapClosureItems.length }, { label: '高严重度', value: viewModel.highRiskCount }, { label: '外部补偿项', value: viewModel.externalCount }]} />
          {viewModel.gapClosureItems.length ? <div className={styles.list}>{viewModel.gapClosureItems.map((item) => <Card key={item.id} className={styles.item}><strong>{item.display.label}</strong><div className={styles.capabilityMeta}><PillTag tone="primary">{item.display.frText}</PillTag><PillTag tone="primary">{item.display.srText}</PillTag><PillTag tone={item.severity === 'high' ? 'levelHigh' : item.severity === 'medium' ? 'levelMedium' : 'levelLow'}>{item.severity === 'high' ? '高严重度' : item.severity === 'medium' ? '中严重度' : '低严重度'}</PillTag></div><span>{item.owner || '责任方未填写'}</span><p><strong>补偿措施：</strong>{item.mitigation || '未填写'}</p><p><strong>验收影响：</strong>{item.acceptanceImpact || '未填写'}</p><p><strong>残余风险：</strong>{item.residualRisk || '未填写'}</p></Card>)}</div> : <div className={styles.empty}>当前没有已记录的闭环事项。</div>}
        </SectionBlock>

        <SectionBlock title="标准映射依据">
          <DataTable><thead><tr><th>能力项</th><th>对应条款</th><th>为什么会进入本轮结论</th><th>当前限制</th></tr></thead><tbody>{viewModel.mappingRows.length ? viewModel.mappingRows.map((item) => <tr key={item.requirement.id || item.requirement.capabilityId}><td>{item.display.label}</td><td>{item.mapping.part} · {item.mapping.fr} / {item.mapping.sr}</td><td>{item.mapping.systemInterpretation}</td><td>{item.mapping.limitation}</td></tr>) : <tr><td colSpan="4">暂无映射依据，请先完成前序输入。</td></tr>}</tbody></DataTable>
        </SectionBlock>

        {markdownPreview ? <SectionBlock title={`Markdown 内容预览：${markdownFilename}`}><textarea className={styles.markdownPreview} value={markdownPreview} readOnly onFocus={(event) => event.target.select()} /></SectionBlock> : null}
        {statusBar}
      </section>
      )}
    </ProjectStageShell></CaseStageLayout>
  );
}
