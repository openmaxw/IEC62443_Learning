import { DataTable, StatusBadge, StatusSummaryPanel } from '../../components/Common';
import { CaseStageLayout, ProjectStageShell } from '../../components/ProjectFlow';
import { useOwnerPath, useIntegratorPath, useVendorPath } from '../../hooks/useProject';
import { getTranslationCenterViewModel } from '../../domain/viewModels/workspaceTranslationViewModels';
import styles from './TranslationCenter.module.css';

export function TranslationCenter() {
  const { projectMeta, assessment, riskProfile } = useOwnerPath();
  const { plan } = useIntegratorPath();
  const { capabilities, matchResults, gapClosureItems } = useVendorPath();
  const viewModel = getTranslationCenterViewModel({ projectMeta, assessment, riskProfile, plan, capabilities, matchResults, gapClosureItems });

  return (
    <CaseStageLayout><ProjectStageShell stageNumber="06" title="项目建立对应" projectName={viewModel.projectName} outputLabel="项目输入 → 风险关注 → 设计响应 → 能力 / 差距" statusText={viewModel.summary.pendingGapCount ? '当前仍有差距待解释与处置' : '项目响应链已基本连通'} guidance={{ summary: '您可在本页查看项目输入、风险关注、设计响应与能力差距之间的对应关系。', details: [{ label: '本页作用', text: '把项目输入、风险关注、设计响应、能力声明和差距状态连成一张追溯矩阵。' }, { label: '阅读重点', text: '先看项目输入如何映射到设计响应，再看能力匹配和差距状态。' }, { label: '完成标志', text: '形成可跨角色复核的对应关系视图。' }] }} statusPanel={<StatusSummaryPanel label={viewModel.summary.pendingGapCount ? '当前追溯重点' : '当前追溯状态'} value={viewModel.summary.pendingGapCount ? `仍有 ${viewModel.summary.pendingGapCount} 项差距待处置` : '差距项已完成处置记录'} note={viewModel.summary.pendingGapCount ? '建议重点核对差距项为何产生、由谁负责、如何处置。' : '可用于跨角色复核项目输入、设计响应与能力声明之间的映射关系。'} pills={[`矩阵行 ${viewModel.summary.matrixCount}`, `设计需求 ${viewModel.summary.requirementCount}`, `待处置 ${viewModel.summary.pendingGapCount}`, `差距项 ${viewModel.summary.gapCount}`]} />}>
      {({ statusBar }) => (
      <div className={styles.page}>
        <div className={styles.headerRow}><strong>{viewModel.projectName || '项目建立对应'}</strong><span>{viewModel.projectDescription}</span></div>

        <section className={styles.matrixSection}>
          <div className={styles.sectionHead}>
            <div>
              <h3>追溯矩阵</h3>
              <p>每一行对应一项设计能力需求，用于查看它如何从项目输入和风险关注一路映射到设计响应、能力声明和差距状态。</p>
            </div>
            <span>{viewModel.matrixRows.length ? `${viewModel.matrixRows.length} 条映射` : '暂无映射'}</span>
          </div>
          <DataTable className={styles.traceTable}>
            <thead>
              <tr>
                <th>项目输入</th>
                <th>风险关注</th>
                <th>设计响应</th>
                <th>能力需求</th>
                <th>能力匹配 / 差距</th>
              </tr>
            </thead>
            <tbody>
              {viewModel.matrixRows.length ? viewModel.matrixRows.map((row) => (
                <tr key={row.id}>
                  <td>{row.projectInput}</td>
                  <td>{row.riskConcern}</td>
                  <td><strong>{row.designResponse}</strong><span>{row.implementationHint}</span></td>
                  <td><strong>{row.capabilityNeed}</strong><span>{row.standardRef} · {row.targetSL}</span></td>
                  <td><StatusBadge tone={row.matchTone}>{row.matchStatus}</StatusBadge><span>证据：{row.evidenceType}</span><span>{row.gapNote}</span></td>
                </tr>
              )) : <tr><td colSpan="5" className={styles.empty}>暂无可展示的追溯矩阵，请先完成需求澄清和设计响应。</td></tr>}
            </tbody>
          </DataTable>
        </section>

        

        {statusBar}
      </div>
      )}
    </ProjectStageShell></CaseStageLayout>
  );
}
