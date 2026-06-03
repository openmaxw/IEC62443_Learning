import { Link, useNavigate } from 'react-router-dom';
import { Button, HeroPanel, InfoBanner, SectionBlock } from '../../components/Common';
import { useProject } from '../../hooks/useProject';
import learningStyles from '../Learning/LearningMode.module.css';
import styles from './Landing.module.css';

const POSITIONING = [
  '本平台通过一个共享案例，把 IEC 62443 从提出目标、形成方案、提供能力、建立对应、分析差距到形成判断的主线串起来。',
  '它不是正式认证工具，也不是替代工程设计的软件，而是一个帮助学习者理解角色协作、概念落地和证据链逻辑的教学与演示平台。',
  '如果你是第一次接触 IEC 62443，建议先阅读简明教程，再进入案例工作台。'
];

const ROLE_CARDS = [
  { role: '业主 / Asset Owner', focus: '提出业务目标、后果判断与运行约束。' },
  { role: '服务提供方 / Service Provider', focus: '把输入转成系统设计、边界控制与责任分工。' },
  { role: '产品供应商 / Product Supplier', focus: '说明产品能力、适用边界和支撑证据。' },
  { role: '审核者 / Assessor', focus: '判断整条证据链是否前后一致并可被证明。' }
];

const TEACHING_FEATURES = [
  '按项目主线组织学习：从提出目标到形成判断，理解 IEC 62443 在项目里如何流转。',
  '按角色协作组织学习：理解不同参与方各自在回答什么问题。',
  '按案例产出组织学习：输入、设计、能力、对应关系、差距与判断可以前后追溯。'
];

const LEARNING_PATH = [
  { title: '先看简明教程', text: '先建立 IEC 62443 的框架、角色、概念和对应关系认知，再进入系统。', action: '打开教程', to: '/tutorial' },
  { title: '再走共享案例', text: '按六个阶段体验同一个项目如何从目标走到判断，理解每一步的输入与输出。', action: '进入案例', to: '/owner' },
  { title: '最后看协作闭环', text: '重点理解为什么系统、产品、开发、维护和审核必须放在同一条证据链里看。', action: '查看总览', to: '/report' }
];

export function Landing() {
  const { actions } = useProject();
  const navigate = useNavigate();

  const handleLoadDemo = () => {
    if (window.confirm('将加载当前共享案例数据，用于直接查看 IEC 62443 角色协作与案例链路。是否继续？')) {
      actions.loadDemoProject();
      navigate('/owner');
    }
  };

  const handleReset = () => {
    if (window.confirm('将清空当前输入并回到全新输入状态。是否继续？')) {
      actions.resetProject();
      navigate('/owner');
    }
  };

  return (
    <main className={styles.page}>
      <HeroPanel className={styles.hero} align="stack">
        <div className={styles.heroText}>
          <span className={styles.eyebrow}>IEC 62443 Learning Hub</span>
          <h1>这是一个帮助你学会 IEC 62443 项目协作逻辑的教学系统</h1>
          <p>
            本平台通过一个共享案例，把 IEC 62443 从提出目标、形成方案、提供能力、建立对应、分析差距到形成判断的主线串起来。
            它重点帮助学习者理解“谁在做什么、为什么这样配合、这些概念为什么要连成证据链”。
          </p>
          <div className={styles.actions}>
            <Button onClick={handleLoadDemo}>加载案例数据</Button>
            <Button onClick={handleReset} variant="secondary">全新输入</Button>
            <Link to="/tutorial"><Button variant="ghost">先看 10 分钟教程</Button></Link>
          </div>
        </div>
      </HeroPanel>

      <section className={styles.sectionBlock}>
        <header>
          <span>平台定位</span>
          <h2>通过共享案例理解 IEC 62443</h2>
        </header>
        <div className={styles.cardGrid}>
          {POSITIONING.map((item) => (
            <article key={item} className={styles.infoCard}>
              <p>{item}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.sectionBlock}>
        <header>
          <span>教学价值</span>
          <h2>你可以在这里学到什么</h2>
        </header>
        <div className={styles.cardGrid}>
          {TEACHING_FEATURES.map((item) => (
            <article key={item} className={styles.infoCard}>
              <p>{item}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.sectionBlock}>
        <header>
          <span>学习路径</span>
          <h2>建议按这个顺序进入</h2>
        </header>
        <div className={styles.cardGrid}>
          {LEARNING_PATH.map((item) => (
            <article key={item.title} className={styles.infoCard}>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
              <div className={styles.inlineAction}><Link to={item.to}><Button variant="ghost" size="medium">{item.action}</Button></Link></div>
            </article>
          ))}
        </div>
      </section>

      <SectionBlock title="角色理解（平台视角）">
        <div className={learningStyles.misconceptionList}>
          {ROLE_CARDS.map((item) => (
            <article key={item.role} className={learningStyles.misconceptionCard}>
              <strong>{item.role}</strong>
              <p>{item.focus}</p>
            </article>
          ))}
        </div>
      </SectionBlock>

      <InfoBanner className={learningStyles.memoryBanner} tone="warning">首页负责带你进入这个教学系统；完整的 IEC 62443 入门认知，请从顶部导航右侧的“IEC 62443 简明教程”进入。</InfoBanner>
    </main>
  );
}
