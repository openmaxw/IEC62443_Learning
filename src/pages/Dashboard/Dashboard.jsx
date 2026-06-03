import { Link } from 'react-router-dom';
import { Button, Card, HeroPanel, PillTag } from '../../components/Common';
import { ProjectStageShell } from '../../components/ProjectFlow';
import { useOwnerPath, useIntegratorPath, useVendorPath, useProject, useProjectStatus } from '../../hooks/useProject';
import { getDashboardViewModel } from '../../domain/viewModels/dashboardVendorViewModels';
import styles from './Dashboard.module.css';



export function Dashboard() {
  const { actions } = useProject();
  const { projectMeta, assessment, riskProfile } = useOwnerPath();
  const { plan } = useIntegratorPath();
  const { capabilities, matchResults } = useVendorPath();
  const { progress, missingInputs, nextAction } = useProjectStatus();
  const viewModel = getDashboardViewModel({ projectMeta, assessment, riskProfile, plan, capabilities, matchResults, progress, missingInputs, nextAction });

  const handleReset = () => {
    if (window.confirm('初始化后将清空当前项目及后续流程的全部已填写信息，是否继续？')) {
      actions.resetProject();
    }
  };

  const handleLoadDemo = () => {
    if (window.confirm('将加载“某半导体制造企业－12 英寸晶圆厂 + 工业边界安全网关 XG-9000”演示项目，用于快速进入完整框架演示链路。是否继续？')) {
      actions.loadDemoProject();
    }
  };


  return (
    <ProjectStageShell
      stageNumber="00"
      title="案例总览"
      projectName={viewModel.projectName}
      outputLabel={`总进度 ${viewModel.progress.completed} / ${viewModel.progress.total}`}
      statusText={viewModel.nextAction ? '待推进下一框架环节' : '当前案例已形成完整框架链路'}
      guidance={{ summary: '您可在框架总览查看案例背景、角色分工、学习路径和当前完成进度。' }}
      toolbar={<><Button variant="secondary" size="small" onClick={handleLoadDemo}>加载示例案例</Button><Button variant="danger" size="small" onClick={handleReset}>重置项目</Button></>}
      hideStatus
    >
      <section className={styles.page}>
        <HeroPanel className={styles.hero}>
          <div>
            <h1>{viewModel.projectName || '当前项目'}</h1>
            <p>{viewModel.projectDescription}</p>
            <div className={styles.heroStats}>{viewModel.overviewStats.map((item) => <div key={item.label} className={styles.heroStat}><span>{item.label}</span><strong>{item.value}</strong></div>)}</div>
          </div>
          <div className={styles.heroAction}>
            {viewModel.nextAction ? <Link to={viewModel.nextAction.route}><Button variant="primary" size="small">下一步：{viewModel.nextAction.label}</Button></Link> : <Link to="/report"><Button variant="secondary" size="small">查看总结与审核</Button></Link>}
          </div>
        </HeroPanel>

        <section className={styles.grid}>

          <Card title="建议动作">
            <div className={styles.nextActionCard}>
              <strong>{viewModel.nextAction?.label || '当前阶段已基本完成'}</strong>
              <span>{viewModel.nextAction?.description || '可以转入学习总结收束案例重点，或回到具体页面继续补充讲解内容。'}</span>
              <div className={styles.inlineActions}>
                {viewModel.nextAction ? <Link to={viewModel.nextAction.route}><Button variant="primary" size="small">前往处理</Button></Link> : <Link to="/report"><Button variant="secondary" size="small">查看总结与审核</Button></Link>}
              </div>
            </div>
          </Card>

          <Card title="缺失输入">
            <div className={styles.listBlock}>
              {viewModel.missingInputs.length ? viewModel.missingInputs.map((item) => (
                <Link key={item.id} to={item.route} className={styles.linkRow}>{item.label}</Link>
              )) : <div className={styles.empty}>当前关键输入已基本齐备，可继续完善设计和交付。</div>}
            </div>
          </Card>
        </section>

        

        

        <section className={styles.cardGrid}>
          {viewModel.cards.map((card) => (
            <article key={card.id} className={styles.statusCard}>
              <div className={styles.statusHead}>
                <strong>{card.title}</strong>
                <PillTag tone={card.ready ? 'success' : 'warning'}>{card.ready ? '已具备' : '待补齐'}</PillTag>
              </div>
              <p>{card.detail}</p>
              {card.substeps ? <div className={styles.substepBlock}><div className={styles.substepSummary}>子步骤 {card.substeps.completed} / {card.substeps.total}</div><div className={styles.substepList}>{card.substeps.items.map((item) => <div key={item.id} className={`${styles.substepItem} ${item.completed ? styles.substepDone : styles.substepTodo}`}><span>{item.id}</span><strong>{item.label}</strong></div>)}</div></div> : null}
              <Link to={card.route}><Button variant={card.ready ? 'secondary' : 'primary'} size="small">查看阶段</Button></Link>
            </article>
          ))}
        </section>
      </section>
    </ProjectStageShell>
  );
}
