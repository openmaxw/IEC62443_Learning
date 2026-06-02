import { Link } from 'react-router-dom';
import { Badge, Button, NotePanel, SectionBlock } from '../../components/Common';
import styles from './LearningMode.module.css';

const ROLE_CARDS = [
  {
    role: '业主 / Asset Owner',
    focus: '决定为什么要做、目标是什么、约束在哪里。',
    know: ['业务后果、关键资产和运行约束决定了系统输入', '目标等级和验收关注会影响后续设计与能力要求', '如果输入不清晰，后续各方都会偏离'],
    say: ['“我们的关键关注是远程维护边界和审计责任。”', '“这个场景下我们更关注连续性与维护约束。”']
  },
  {
    role: '集成商 / System Integrator',
    focus: '把输入变成系统级实现与责任分配。',
    know: ['系统级要求不等于单设备功能', '要把分区、通道、边界控制和依赖条件解释清楚', '要识别哪些要求需要设备商、维护方一起完成'],
    say: ['“这个目标需要通过系统分区与边界控制共同实现。”', '“这里的部分要求需要配合集中身份或日志平台。”']
  },
  {
    role: '产品供应商 / Product Supplier（标准主角色）',
    focus: '说明产品层能支撑什么、边界在哪里。',
    know: ['必须区分产品原生能力和项目级整体满足', '证据、限制、依赖条件必须说清楚', '产品满足不代表系统整体一定满足'],
    say: ['“设备可提供该能力，但完整闭环还依赖外围系统。”', '“这里需要明确声明该能力的适用边界和证据类型。”']
  },
  {
    role: '开发者 / Developer（扩展视角，非标准主角色）',
    focus: '把产品要求落实为可审核的开发与验证活动。',
    know: ['审核不会只看功能界面，还会看开发流程、测试与缺陷管理', '开发证据是产品可信度的重要组成部分', '当设备商和开发者是同一家公司时，这部分尤其要分清'] ,
    say: ['“这里不仅要有功能，还要有测试和开发过程证据。”', '“该能力要结合缺陷处置和验证活动一起说明。”']
  },
  {
    role: '维护视角 / Maintenance（服务提供方细分）',
    focus: '保证系统在运行期持续满足要求。',
    know: ['补丁、变更、账号、日志、远程访问都属于持续控制', '如果只在交付时满足而运行中失控，审核同样会关注', '维护方可能来自业主，也可能来自外部服务商'],
    say: ['“这项要求后续要依赖运维流程持续落实。”', '“远程维护和日志留存需要在运行阶段持续执行。”']
  },
  {
    role: '审核者 / Assessor（审核视角，非标准主角色）',
    focus: '从通过条件与证据链角度看完整闭环。',
    know: ['关注输入是否清楚、设计是否合理、证据是否足够', '关注系统、产品、开发和维护之间是否断层', '关注通过时到底是凭什么证明而不是凭口头描述'],
    say: ['“请说明该要求由谁承担，并提供对应证据。”', '“请说明这里是系统层满足、产品层满足，还是依赖外部补偿。”']
  }
];

const CONCEPT_CARDS = [
  { title: '需求与目标', tag: 'INPUT', text: '解释为什么要做、做到什么程度、有哪些业务与运行约束。' },
  { title: '系统实现', tag: 'SYSTEM', text: '解释系统层如何通过架构、边界和控制措施回应目标。' },
  { title: '产品与开发', tag: 'PRODUCT', text: '解释产品层能力和开发实践如何支撑系统目标。' },
  { title: '维护与审核', tag: 'ASSURE', text: '解释系统如何持续满足，以及审核为什么这样看证据。' }
];

const MISCONCEPTIONS = [
  '误区：IEC 62443 只是设备功能列表。实际上它同时关注系统、产品、开发、运行维护和审核证明。',
  '误区：达到某个 SL 目标只靠设备商。实际上通常需要业主、集成商、设备商、维护方等多方共同完成。',
  '误区：有测试截图就够了。审核往往还会关注输入、设计逻辑、过程记录和责任闭环。'
];

export function LearningMode() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div>
          <Badge variant="info" size="large">角色知识卡</Badge>
          <h1>按参与方理解 IEC 62443 在一个实例里如何运作</h1>
          <p>这一页用角色知识卡帮助你快速理解 IEC 62443 不是单一角色或单一产品完成的事情，而是一套围绕目标、实现、持续控制和审核证明展开的协作框架。</p>
        </div>
        <div className={styles.heroActions}>
          <Link to="/dashboard"><Button variant="primary" size="medium">进入框架总览</Button></Link>
          <Link to="/platform-guide"><Button variant="secondary" size="medium">查看框架导读</Button></Link>
        </div>
      </section>

      <SectionBlock title="四个核心概念">
        <div className={styles.conceptGrid}>
          {CONCEPT_CARDS.map((item) => (
            <article key={item.title} className={styles.conceptCard}>
              <span>{item.tag}</span>
              <strong>{item.title}</strong>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </SectionBlock>

      <SectionBlock title="六类参与方知识卡">
        <div className={styles.roleGrid}>
          {ROLE_CARDS.map((card) => (
            <article key={card.role} className={styles.roleCard}>
              <strong>{card.role}</strong>
              <p className={styles.meta}>{card.focus}</p>
              <div>
                <strong>你需要理解</strong>
                <ul>{card.know.map((item) => <li key={item}>{item}</li>)}</ul>
              </div>
              <div>
                <strong>典型表达</strong>
                <blockquote>{card.say[0]}</blockquote>
                <blockquote>{card.say[1]}</blockquote>
              </div>
            </article>
          ))}
        </div>
      </SectionBlock>

      <SectionBlock title="常见误区">
        <div className={styles.misconceptionList}>
          {MISCONCEPTIONS.map((item) => (
            <article key={item} className={styles.misconceptionCard}>
              <strong>提醒</strong>
              <p>{item}</p>
            </article>
          ))}
        </div>
      </SectionBlock>

      <div className={styles.memoryBanner}>先看谁做什么，再看如何配合，最后看如何被审核证明。</div>

      <NotePanel title="使用建议" notes={[
        '可先看本页建立角色框架，再回到各核心页面看该角色在实例中具体做了什么。',
        '如需完整链路，请继续查看需求与目标、系统实现、产品与开发、协作与差距、总结与审核。'
      ]} />
    </div>
  );
}
