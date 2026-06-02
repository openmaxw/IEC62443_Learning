import { Link, useSearchParams } from 'react-router-dom';
import { Button, NotePanel, StatusSummaryPanel } from '../../components/Common';
import { ProjectStageShell } from '../../components/ProjectFlow';
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
    return <ProjectStageShell stageNumber="01" title="项目输入摘要" projectName={viewModel.projectName} outputLabel="待生成" ><div className={styles.emptyState}><strong>还没有需求澄清输入</strong><Link to="/owner"><Button variant="primary" size="medium">前往需求澄清</Button></Link></div></ProjectStageShell>;
  }

  return (
    <ProjectStageShell stageNumber="01" title="项目输入摘要" projectName={viewModel.projectName} outputLabel="标准化项目输入" statusText={viewModel.statusSummary.headline} guidance={{ summary: '您可在本页查看业主侧输入澄清后的项目边界、重点要求与验收关注事项。' }} statusPanel={<StatusSummaryPanel label={viewModel.statusSummary.title} value={viewModel.statusSummary.headline} note={viewModel.statusSummary.detail} pills={viewModel.statusSummary.pills} />}>
      {({ statusBar }) => (
      <>
      <article className={styles.document}>
        <section className={styles.section}><h3>一、项目边界</h3><div className={styles.grid}><div><span>项目名称</span><strong>{viewModel.projectName || '未填写'}</strong></div><div><span>行业场景</span><strong>{viewModel.industryName}</strong></div><div><span>项目站点</span><strong>{viewModel.siteName}</strong></div><div><span>项目目标</span><strong>{viewModel.projectObjective}</strong></div></div></section>
        <section className={styles.section}><h3>二、业务后果判断</h3><div className={styles.list}>{IMPACT_FIELDS.map((field) => <div key={field.key} className={styles.item}><div className={styles.itemHead}><strong>{field.label}</strong><span>{IMPACT_LABEL[viewModel.assessment[field.key]] || '未填写'}</span></div></div>)}</div></section>
        <section className={styles.section}><h3>三、关键对象与外部约束</h3><div className={styles.assetRow}>{viewModel.criticalAssets.length ? viewModel.criticalAssets.map((item) => <span key={item.id} className={styles.tag}>{item.label}</span>) : <span className={styles.emptyText}>未填写关键对象</span>}</div><div className={styles.grid}><div><span>关键系统/角色</span><strong>{viewModel.assessment.keySystems || '未填写'}</strong></div><div><span>外部连接方式</span><strong>{viewModel.assessment.externalConnections || '未填写'}</strong></div><div><span>维护接入方式</span><strong>{viewModel.assessment.maintenanceAccessPath || '未填写'}</strong></div><div><span>初始网络边界</span><strong>{viewModel.assessment.initialBoundaryNotes || '未填写'}</strong></div></div></section>
        <section className={styles.section}><h3>四、交付给集成商的设计关注点</h3><div className={styles.list}>{viewModel.ownerRequirements.length ? viewModel.ownerRequirements.map((item) => <div key={item.id} className={styles.item}><div className={styles.itemHead}><strong>{item.sourceLabel}</strong><span>{item.priority}</span></div><p>{item.text}</p></div>) : <p className={styles.emptyText}>尚未整理出明确的设计输入。</p>}</div></section>
        <section className={styles.section}><h3>五、验收关注点</h3><div className={styles.list}>{viewModel.acceptanceFocus.length ? viewModel.acceptanceFocus.map((item) => <div key={item.id} className={styles.item}><p>{item.text}</p></div>) : <p className={styles.emptyText}>尚未生成验收关注点。</p>}<div className={styles.item}><div className={styles.itemHead}><strong>验收偏好</strong><span>{viewModel.acceptancePreferenceLabel}</span></div></div></div></section>
      </article>
      {statusBar}
      <NotePanel title="交接说明" notes={["如需补充项目背景、业务后果或约束条件，请返回需求填写页面更新后再查看本页。"]} />
      <div className={styles.actions}>
        <Link to={isReviewMode ? '/report' : '/owner'}><Button variant="ghost" size="medium">{isReviewMode ? '返回交付摘要' : '返回需求澄清'}</Button></Link>
        {isReviewMode ? null : <Link to="/integrator"><Button variant="primary" size="medium">进入设计响应</Button></Link>}
      </div>
      </>
      )}
    </ProjectStageShell>
  );
}
