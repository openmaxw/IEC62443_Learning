import { Link, useSearchParams } from 'react-router-dom';
import { ActionBar, Button, DataTable, PillTag, StatusSummaryPanel } from '../../components/Common';
import { CaseStageLayout, ProjectStageShell } from '../../components/ProjectFlow';
import { useOwnerPath } from '../../hooks/useProject';
import { getOwnerResultViewModel } from '../../domain/viewModels/resultViewModels';
import styles from './OwnerResult.module.css';

const IMPACT_LABEL = { low: '低', medium: '中', high: '高' };
const IMPACT_FIELDS = [{ key: 'safetyImpact', label: '人身安全' }, { key: 'environmentalImpact', label: '环境影响' }, { key: 'productionImpact', label: '产能连续性' }, { key: 'financialImpact', label: '财务影响' }, { key: 'complianceImpact', label: '合规影响' }];

export function OwnerResult() {
  const [searchParams] = useSearchParams();
  const isReviewMode = searchParams.get('review') === '1';
  const ownerPath = useOwnerPath();
  const viewModel = getOwnerResultViewModel(ownerPath);

  if (!viewModel.hasAssessment) {
    return <CaseStageLayout><ProjectStageShell stageNumber="01" title="项目输入摘要" projectName={viewModel.projectName} outputLabel="待生成" ><div className={styles.emptyState}><strong>尚未形成项目输入</strong><Link to="/owner"><Button variant="primary" size="medium">进入本页</Button></Link></div></ProjectStageShell></CaseStageLayout>;
  }

  const boundaryItems = [
    { label: '项目名称', value: viewModel.projectName || '未填写' },
    { label: '行业场景', value: viewModel.industryName },
    { label: '项目站点', value: viewModel.siteName },
    { label: '项目目标', value: viewModel.projectObjective }
  ];

  const constraintItems = [
    { label: '关键系统/角色', value: viewModel.assessment.keySystems || '未填写' },
    { label: '外部连接方式', value: viewModel.assessment.externalConnections || '未填写' },
    { label: '维护接入方式', value: viewModel.assessment.maintenanceAccessPath || '未填写' },
    { label: '初始网络边界', value: viewModel.assessment.initialBoundaryNotes || '未填写' }
  ];

  return (
    <CaseStageLayout><ProjectStageShell stageNumber="01" title="项目输入摘要" projectName={viewModel.projectName} outputLabel="标准化项目输入" statusText={viewModel.statusSummary.headline} guidance={{ summary: '本页用于回看业主侧已经澄清出的项目输入，确认项目边界、重点要求和验收关注能否作为后续阶段的统一起点。' }} statusPanel={<StatusSummaryPanel label={viewModel.statusSummary.title} value={viewModel.statusSummary.headline} note={viewModel.statusSummary.detail} pills={viewModel.statusSummary.pills} />}>
      {({ statusBar }) => (
      <>
      <article className={styles.document}>
        <section className={styles.section}><h3>一、项目边界</h3><DataTable><thead><tr><th>项目</th><th>内容</th></tr></thead><tbody>{boundaryItems.map((item) => <tr key={item.label}><td>{item.label}</td><td className={styles.contentCell}>{item.value}</td></tr>)}</tbody></DataTable></section>
        <section className={styles.section}><h3>二、业务后果判断</h3><DataTable><thead><tr><th>项目</th><th>等级</th></tr></thead><tbody>{IMPACT_FIELDS.map((field) => <tr key={field.key}><td className={styles.contentCell}>{field.label}</td><td><PillTag tone="primary">{IMPACT_LABEL[viewModel.assessment[field.key]] || '未填写'}</PillTag></td></tr>)}</tbody></DataTable></section>
        <section className={styles.section}><h3>三、关键对象与外部约束</h3><div className={styles.assetRow}>{viewModel.criticalAssets.length ? viewModel.criticalAssets.map((item) => <PillTag key={item.id} tone="primary">{item.label}</PillTag>) : <span className={styles.emptyText}>未填写关键对象</span>}</div><DataTable><thead><tr><th>项目</th><th>内容</th></tr></thead><tbody>{constraintItems.map((item) => <tr key={item.label}><td>{item.label}</td><td className={styles.contentCell}>{item.value}</td></tr>)}</tbody></DataTable></section>
        <section className={styles.section}><h3>四、设计输入</h3>{viewModel.ownerRequirements.length ? <DataTable><thead><tr><th>来源</th><th>内容</th><th>优先级</th></tr></thead><tbody>{viewModel.ownerRequirements.map((item) => <tr key={item.id}><td>{item.sourceLabel}</td><td className={styles.contentCell}>{item.text}</td><td><PillTag tone="primary">{item.priority}</PillTag></td></tr>)}</tbody></DataTable> : <p className={styles.emptyText}>暂无设计输入。</p>}</section>
        <section className={styles.section}><h3>五、验收关注</h3><DataTable><thead><tr><th>项目</th><th>内容</th></tr></thead><tbody>{viewModel.acceptanceFocus.length ? viewModel.acceptanceFocus.map((item, index) => <tr key={item.id}><td>{`关注点 ${index + 1}`}</td><td className={styles.contentCell}>{item.text}</td></tr>) : <tr><td colSpan="2" className={styles.emptyText}>暂无验收关注。</td></tr>}<tr><td>验收偏好</td><td><PillTag tone="primary">{viewModel.acceptancePreferenceLabel}</PillTag></td></tr></tbody></DataTable></section>
      </article>
      {statusBar}
      <ActionBar align="between">
        <Link to={isReviewMode ? '/report' : '/owner?step=6'}><Button variant="ghost" size="medium">{isReviewMode ? '返回上一页' : '返回上一步'}</Button></Link>
        {isReviewMode ? null : <Link to="/integrator"><Button variant="primary" size="medium">进入下一步</Button></Link>}
      </ActionBar>
      </>
      )}
    </ProjectStageShell></CaseStageLayout>
  );
}
