import { Link } from 'react-router-dom';
import { Badge, Button, HeroPanel, InfoBanner, NotePanel, SectionBlock } from '../../components/Common';
import styles from './PlatformGuide.module.css';

const FRAMEWORK_FLOW = ['业主提出目标', '集成商形成系统响应', '设备商声明产品能力', '开发者提供开发证据', '维护方落实持续控制', '审核者检查通过条件'];

const FRAMEWORK_VIEW = [
  {
    title: '标准不是只讲功能',
    points: ['IEC 62443 不只是列出若干安全功能，而是要求不同参与方共同完成目标。', '系统层、产品层、开发层和运维层关注点不同，但必须相互衔接。', 'Learning Hub 用案例把这些层次放在同一条链路上。']
  },
  {
    title: '目标不是单方完成',
    points: ['达到某个 SL 目标通常不是某一个角色单独完成。', '业主提供需求和约束，集成商完成系统响应，设备商和开发者提供产品与开发证据，维护方保证持续满足。', '审核者则从独立视角看这些内容是否被实现并可证明。']
  },
  {
    title: '审核看的是闭环',
    points: ['审核通常不会只看“有没有某个功能”，还会看设计、实现、测试、文档和责任边界。', '因此 Learning Hub 不只讲功能满足，还讲差距、补偿措施和证据。', '这也是理解 3-3、4-1、4-2 这类通过关注点的前提。']
  }
];

const ROLE_GUIDES = [
  { title: '业主 / Asset Owner', summary: '提出目标和约束。', points: ['定义业务场景与关键资产', '给出风险关注、维护方式和验收关注', '决定系统要达到什么目标及边界'] },
  { title: '集成商 / System Integrator', summary: '负责系统级实现。', points: ['形成分区、通道和边界控制设计', '把输入转化为系统级能力要求', '明确外部依赖、责任边界和补偿措施'] },
  { title: '设备商 / Product Supplier', summary: '负责产品层能力表达。', points: ['说明产品满足什么、证据是什么', '说明限制、配置前提和依赖条件', '为系统级匹配提供产品层输入'] },
  { title: '开发者 / Developer', summary: '负责开发与验证实践。', points: ['提供安全开发、测试、缺陷管理等证据', '支撑产品要求变成可审核的开发活动', '帮助解释为什么某些要求不能只看界面功能'] },
  { title: '维护方 / Service & Maintenance', summary: '负责运行期持续控制。', points: ['落实补丁、变更、账号和访问控制流程', '支撑日志、审计和远程运维要求', '保证系统不是只在交付时满足要求'] },
  { title: '审核者 / Assessor', summary: '负责从通过条件看完整闭环。', points: ['关注输入、设计、实现、证据和责任是否连贯', '关注常见不符合项和证明不足之处', '判断案例在审核视角下还缺什么'] }
];

const PAGE_USAGE = [
  { title: '需求与目标', route: '/owner', usage: '看业主做什么。', points: ['理解输入从哪里来', '理解目标与约束如何影响后续实现', '理解审核为什么先看输入完整性'] },
  { title: '系统实现', route: '/integrator', usage: '看集成商做什么。', points: ['理解系统级设计如何回应目标', '理解系统层和产品层要求如何区分', '理解哪些要求需要多方共同完成'] },
  { title: '产品与开发', route: '/vendor', usage: '看设备商与开发者做什么。', points: ['理解产品能力如何声明', '理解开发证据为什么重要', '理解为什么“有功能”不等于“可通过审核”'] },
  { title: '协作与差距', route: '/selection', usage: '看多方如何闭环责任。', points: ['理解部分满足与外部补偿', '理解责任分配和补偿措施', '理解哪些差距需要系统层或运维层解决'] },
  { title: '总结与审核', route: '/report', usage: '看审核者会关注什么。', points: ['汇总案例结论', '查看当前案例的证据与限制', '理解审核视角下的通过逻辑'] }
];

export function PlatformGuide() {
  return (
    <div className={styles.page}>
      <HeroPanel className={styles.hero}>
        <div>
          <Badge variant="info" size="large">框架导读</Badge>
          <h1>如何通过一个实例理解 IEC 62443 的角色协作框架</h1>
          <p>本页不是讲师口径，也不是公司岗位手册，而是帮助你从框架角度看懂 IEC 62443：目标如何提出，系统如何实现，产品与开发如何支撑，维护如何持续满足，以及审核为何这样关注。</p>
        </div>
        <div className={styles.heroActions}>
          <Link to="/dashboard"><Button variant="primary" size="medium">进入框架总览</Button></Link>
          <Link to="/report"><Button variant="secondary" size="medium">查看总结与审核</Button></Link>
        </div>
      </HeroPanel>

      <SectionBlock title="框架主线">
        <div className={styles.flow}>{FRAMEWORK_FLOW.map((item) => <span key={item}>{item}</span>)}</div>
      </SectionBlock>

      <SectionBlock title="先建立三个认识">
        <div className={styles.cardGrid}>{FRAMEWORK_VIEW.map((item) => <article key={item.title} className={styles.card}><strong>{item.title}</strong><ul>{item.points.map((point) => <li key={point}>{point}</li>)}</ul></article>)}</div>
      </SectionBlock>

      <SectionBlock title="六类关键参与方">
        <div className={styles.cardGrid}>{ROLE_GUIDES.map((item) => <article key={item.title} className={styles.card}><strong>{item.title}</strong><span>{item.summary}</span><ul>{item.points.map((point) => <li key={point}>{point}</li>)}</ul></article>)}</div>
      </SectionBlock>

      <SectionBlock title="各页面在解释什么">
        <div className={styles.cardGrid}>{PAGE_USAGE.map((item) => <article key={item.title} className={styles.card}><div className={styles.cardHead}><strong>{item.title}</strong><Link to={item.route}><Button variant="ghost" size="small">进入页面</Button></Link></div><span>{item.usage}</span><ul>{item.points.map((point) => <li key={point}>{point}</li>)}</ul></article>)}</div>
      </SectionBlock>

      <InfoBanner tone="info">
        <NotePanel title="说明" notes={[
          '本平台优先解释“谁负责什么、为什么这样协作”，而不是逐条替代 IEC 62443 原文。',
          '如需进入案例链路，建议从框架总览或直接进入需求与目标页面开始。',
          '若从审核视角理解本平台，可在完成案例链路后查看总结与审核页面。'
        ]} />
      </InfoBanner>
    </div>
  );
}
