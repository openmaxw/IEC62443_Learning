import { Link, useNavigate } from 'react-router-dom';
import { Button, HeroPanel, InfoBanner } from '../../components/Common';
import { useProject } from '../../hooks/useProject';
import styles from './Landing.module.css';

const CORE_VALUE_ITEMS = [
  {
    title: '完成从零到一的认知建立',
    text: '帮助学习者从分散术语进入系统理解，建立对 IEC 62443 整体结构、核心概念与项目主线的基础认知。'
  },
  {
    title: '形成系统级理解能力',
    text: '帮助学习者不只停留在功能或条款层面，而是能够从角色、设计、能力与证据的联动关系理解项目。'
  },
  {
    title: '建立更有竞争力的认知优势',
    text: '帮助团队更早区分能力边界、项目判断与交付责任，在内部协同、客户沟通与方案表达中形成更高质量的判断力。'
  }
];

const ROLE_BENEFITS = [
  {
    role: '产品经理',
    items: [
      '从客户诉求中提炼真正影响产品路线的安全目标。',
      '建立产品能力边界与项目结论边界的清晰判断。',
      '提升需求表达、能力说明与证据准备的一致性。'
    ]
  },
  {
    role: 'FAE / TS',
    items: [
      '建立项目输入、系统设计与产品能力之间的系统对应。',
      '准确把握客户问题背后的项目语境与验证逻辑。',
      '提升能力前提、适用范围与限制条件的表达质量。'
    ]
  },
  {
    role: '销售',
    items: [
      '理解客户关注点从来不只是功能点，而是整体成立性。',
      '建立对角色责任、交付边界与证据支撑的准确判断。',
      '提升对外表述中能力说明与项目判断的区分能力。'
    ]
  },
  {
    role: '研发',
    items: [
      '理解组件能力如何支撑系统级要求与项目目标。',
      '建立功能实现、能力声明与合规表达的清晰区分。',
      '理解项目结论为何往往依赖集成设计与运行管理。'
    ]
  },
  {
    role: '交付 / 方案 / 实施',
    items: [
      '建立对各阶段输入输出衔接方式的整体把握。',
      '理解 Zone / Conduit、设计响应与差距分析在项目中的定位。',
      '形成系统设计、能力说明与最终判断的闭环组织能力。'
    ]
  }
];

const LEARNING_RESULTS = [
  'IEC 62443 的标准体系、适用对象与整体结构。',
  'FR、SR、CR、SL 之间的对应关系及常见混淆点。',
  '不同岗位在项目链路中的职责位置与协作关系。',
  '项目如何从目标输入逐步形成设计、能力说明与综合判断。'
];

const LEARNING_PATH = [
  { number: '01', title: '入门教程', text: '先建立标准框架、核心概念、角色分工与对应关系的基础认知。', action: '进入教程', to: '/tutorial' },
  { number: '02', title: '案例演示', text: '再按步骤查看同一项目如何从输入走向设计、能力说明、差距分析与判断。', action: '进入案例', to: '/owner' }
];

export function Landing() {
  const { actions } = useProject();
  const navigate = useNavigate();

  const handleEnterCase = () => {
    actions.loadDemoProject();
    navigate('/owner');
  };

  const handleReset = () => {
    actions.resetProject();
    navigate('/owner');
  };

  return (
    <main className={styles.page}>
      <HeroPanel className={styles.hero} align="stack">
        <div className={styles.heroText}>
          <span className={styles.eyebrow}>IEC 62443 Learning Hub</span>
          <h1>帮助你从概念入门走向 IEC 62443 的系统理解</h1>
          <p>
            本系统以“入门教程 + 案例演示”为主线，帮助学习者建立对 IEC 62443 概念、角色、项目链路与判断边界的系统理解。
          </p>
          <div className={styles.actions}>
            <div className={styles.primaryActions}>
              <Link to="/tutorial" className={styles.actionLink}><Button className={styles.primaryEntryButton}>进入 01 入门教程</Button></Link>
              <Button onClick={handleEnterCase} variant="secondary" className={styles.primaryEntryButton}>进入 02 案例演示</Button>
              <Button onClick={handleReset} variant="ghost" className={styles.primaryEntryButton}>进入 03 自己动手演练</Button>
            </div>

          </div>
        </div>
      </HeroPanel>

      <section className={styles.sectionBlock}>
        <header>
          <h2>本系统的核心价值</h2>
        </header>
        <div className={styles.valueLayout}>
          {CORE_VALUE_ITEMS.map((item, index) => (
            <article
              key={item.title}
              className={`${styles.infoCard} ${index === 0 ? styles.featuredCard : ''}`}
            >
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.sectionBlock}>
        <header>
          <h2>不同岗位的能力提升</h2>
        </header>
        <div className={styles.roleGrid}>
          {ROLE_BENEFITS.map((item) => (
            <article key={item.role} className={styles.roleCard}>
              <h3>{item.role}</h3>
              <ul>
                {item.items.map((text) => <li key={text}>{text}</li>)}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.sectionBlock}>
        <header>
          <h2>可建立的核心认知</h2>
        </header>
        <div className={styles.resultGrid}>
          {LEARNING_RESULTS.map((item) => (
            <article key={item} className={styles.resultCard}>
              <p>{item}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.sectionBlock}>
        <header>
          <h2>建议学习路径</h2>
        </header>
        <div className={styles.pathGrid}>
          {LEARNING_PATH.map((item) => (
            <article key={item.number} className={styles.pathCard}>
              <div className={styles.pathHead}><span>{item.number}</span><h3>{item.title}</h3></div>
              <p>{item.text}</p>
              <div className={styles.inlineAction}>
                {item.mode === 'reset'
                  ? <Button variant="ghost" size="medium" onClick={handleReset}>{item.action}</Button>
                  : <Link to={item.to}><Button variant="ghost" size="medium">{item.action}</Button></Link>}
              </div>
            </article>
          ))}
        </div>
      </section>

      <InfoBanner className={styles.banner} tone="warning">建议先完成入门教程，再进入案例演示。前者用于建立概念与结构认知，后者用于理解这些内容如何在项目中形成闭环。</InfoBanner>
    </main>
  );
}
