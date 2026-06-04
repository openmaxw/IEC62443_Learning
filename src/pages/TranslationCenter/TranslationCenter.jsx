import { DataTable, StatusBadge, StatusSummaryPanel, StepTabs, WorkflowNavBar } from '../../components/Common';
import { CaseStageLayout, ProjectStageShell } from '../../components/ProjectFlow';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useOwnerPath, useIntegratorPath, useVendorPath } from '../../hooks/useProject';
import { getTranslationCenterViewModel } from '../../domain/viewModels/workspaceTranslationViewModels';
import styles from './TranslationCenter.module.css';
import { resolveStepIndex } from '../../utils/stepRouting';

const STEPS = [
  { id: 'overview', title: '整体对应', guidance: '先把 01、02、03 三个阶段形成的结果拉到同一张总表中，确认它们是否已经前后对应。' },
  { id: 'trace', title: '对应关系总表', guidance: '逐行查看同一项能力需求在目标、系统设计和产品响应三个阶段中的传递与回应情况。' }
];

export function TranslationCenter() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [currentStep, setCurrentStep] = useState(0);
  const step = STEPS[currentStep];
  useEffect(() => {
    const targetIndex = resolveStepIndex(searchParams.get('step'), STEPS.length);
    if (targetIndex !== null) {
      setCurrentStep(targetIndex);
    }
  }, [searchParams]);
  const { projectMeta, assessment, riskProfile } = useOwnerPath();
  const { plan } = useIntegratorPath();
  const { capabilities, matchResults, gapClosureItems } = useVendorPath();
  const viewModel = getTranslationCenterViewModel({ projectMeta, assessment, riskProfile, plan, capabilities, matchResults, gapClosureItems });

  const overviewContent = <div className={styles.page}><div className={styles.headerRow}><strong>{viewModel.projectName || '关系追溯'}</strong><span>{viewModel.projectDescription}</span></div><section className={styles.matrixSection}><div className={styles.sectionHead}><div><h3>为什么先看整体对应</h3><p>差距分析不是直接开始打分，而是先确认 01 目标定义、02 系统设计、03 能力说明 三个阶段是否已经围绕同一组能力需求前后拉通。</p></div><span>{viewModel.matrixRows.length ? `${viewModel.matrixRows.length} 条对应线索` : '暂无对应线索'}</span></div><DataTable className={styles.traceTable}><thead><tr><th>阶段</th><th>本阶段形成了什么</th><th>下一阶段如何承接</th></tr></thead><tbody><tr><td>01 目标定义</td><td>项目目标、后果、暴露面、约束、关键对象</td><td>在 02 中转成系统目标、设计原则和能力需求</td></tr><tr><td>02 系统设计</td><td>系统目标、分区、跨区通信、能力需求</td><td>在 03 中转成产品声明、边界、证据和限制说明</td></tr><tr><td>03 能力说明</td><td>对能力依据的正式响应</td><td>在本阶段第 2 步中与前两阶段拉通，确认哪些项仍未对齐</td></tr></tbody></DataTable></section></div>;

  const traceContent = <div className={styles.page}><div className={styles.headerRow}><strong>{viewModel.projectName || '关系追溯'}</strong><span>{viewModel.projectDescription}</span></div><section className={styles.matrixSection}><div className={styles.sectionHead}><div><h3>三阶段对应总表</h3><p>每一行展示同一项能力需求在 01 目标定义、02 系统设计、03 能力说明 三个阶段中的传递与回应情况，用于先确认整体是否对应，再进入差距分析。</p></div><span>{viewModel.matrixRows.length ? `${viewModel.matrixRows.length} 条映射` : '暂无映射'}</span></div><DataTable className={styles.traceTable}><thead><tr><th>01 目标定义</th><th>01 风险关注</th><th>02 系统设计</th><th>03 能力说明</th><th>当前对应状态</th></tr></thead><tbody>{viewModel.matrixRows.length ? viewModel.matrixRows.map((row) => (<tr key={row.id}><td><strong>{row.stage1Input}</strong></td><td>{row.stage1Risk}</td><td><strong>{row.stage2Objective}</strong><span>{row.stage2Need}</span><span>{row.stage2Ref} · {row.stage2TargetSL}</span><span>{row.stage2Hint}</span></td><td><StatusBadge tone={row.stage3Tone === 'danger' ? 'statusMissing' : row.stage3Tone === 'warning' ? 'statusConfigured' : 'statusNative'}>{row.stage3Response}</StatusBadge><span>证据：{row.stage3Evidence}</span><span>{row.stage3Boundary}</span></td><td><StatusBadge tone={row.matchTone === 'danger' ? 'statusMissing' : row.matchTone === 'warning' ? 'statusConfigured' : 'statusNative'}>{row.matchStatus}</StatusBadge><span>{row.gapNote}</span></td></tr>)) : <tr><td colSpan="5" className={styles.empty}>暂无可展示的对应关系总表，请先完成前三个阶段。</td></tr>}</tbody></DataTable></section></div>;

  return (
    <CaseStageLayout><ProjectStageShell stageNumber="04" title="关系追溯" projectName={viewModel.projectName} outputLabel="01 目标输入 → 02 系统设计 → 03 产品响应 → 当前对应状态" statusText={viewModel.summary.pendingGapCount ? '当前有差距待进入闭环处置' : '三阶段结果已形成对应关系'} guidance={{ summary: `${step.guidance}${step.id === 'overview' ? ' 建议先理解为什么必须先看整体对应，再进入对应总表。' : ' 建议逐行查看 01、02、03 是否已经围绕同一能力需求形成连续回应。'}` }} statusPanel={<StatusSummaryPanel label={viewModel.summary.pendingGapCount ? '当前追溯重点' : '当前追溯状态'} value={viewModel.summary.pendingGapCount ? `有 ${viewModel.summary.pendingGapCount} 项差距待处置` : '差距项已完成处置记录'} note={viewModel.summary.pendingGapCount ? '建议重点核对差距项为何产生、由谁负责、如何处置。' : '可用于跨角色复核项目输入、设计响应与能力声明之间的映射关系。'} pills={[step.title, `矩阵行 ${viewModel.summary.matrixCount}`, `待处置 ${viewModel.summary.pendingGapCount}`, `差距项 ${viewModel.summary.gapCount}`]} />}>
      {({ statusBar }) => (
      <section className={styles.page}>
        <StepTabs items={STEPS} currentIndex={currentStep} onChange={setCurrentStep} />
        {currentStep === 0 ? overviewContent : traceContent}
        {statusBar}
        <WorkflowNavBar leftLabel={currentStep === 0 ? '返回上一步' : '上一步'} rightLabel={currentStep === STEPS.length - 1 ? '进入下一阶段' : '下一步'} onLeftClick={currentStep === 0 ? () => navigate('/vendor?step=6') : () => setCurrentStep((prev) => Math.max(prev - 1, 0))} onRightClick={currentStep === STEPS.length - 1 ? () => navigate('/selection?step=1') : () => setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1))} />
      </section>
      )}
    </ProjectStageShell></CaseStageLayout>
  );
}
