import { Link, useNavigate } from 'react-router-dom';
import { Button, SectionBlock } from '../../components/Common';
import { useProject } from '../../hooks/useProject';
import learningStyles from '../Learning/LearningMode.module.css';
import styles from './Landing.module.css';

const POSITIONING = [
  '本平台通过一个共享案例，把 IEC 62443 中的主角色、协作关系、能力边界与判断逻辑串起来。',
  '它不是正式认证工具，也不是替代工程设计的软件，而是一个帮助学习者先看懂“谁在做什么、为什么这样配合”的学习与演示平台。',
  '学习者可以先通过首页建立对标准框架的基本理解，再进入案例页面查看角色如何在同一个实例中推进。'
];

const ROLE_CARDS = [
  {
    role: '业主 / Asset Owner',
    focus: '决定为什么要做、目标是什么、约束在哪里。',
    know: ['业务后果、关键资产和运行约束决定了系统输入', '目标等级和验收关注会影响后续设计与能力要求', '如果输入不清晰，后续各方都会偏离'],
    say: ['“我们的关键关注是远程维护边界和审计责任。”', '“这个场景下我们更关注连续性与维护约束。”']
  },
  {
    role: '服务提供方 / Service Provider',
    focus: '把输入变成系统级实现与责任分配，涵盖集成与维护活动。',
    know: ['系统级要求不等于单设备功能', '要把分区、通道、边界控制和依赖条件解释清楚', '要识别哪些要求需要产品供应商和维护活动一起完成'],
    say: ['“这个目标需要通过系统分区与边界控制共同实现。”', '“这里的部分要求需要配合集中身份或日志平台。”']
  },
  {
    role: '产品供应商 / Product Supplier',
    focus: '说明产品层能支撑什么，并在需要时包含开发支撑。',
    know: ['必须区分产品原生能力和项目级整体满足', '证据、限制、依赖条件必须说清楚', '产品满足不代表系统整体一定满足'],
    say: ['“设备可提供该能力，但完整闭环还依赖外围系统。”', '“这里需要明确声明该能力的适用边界和证据类型。”']
  },
  {
    role: '开发者 / Developer（扩展视角，非标准主角色）',
    focus: '把产品要求落实为可审核的开发与验证活动。',
    know: ['审核不会只看功能界面，还会看开发流程、测试与缺陷管理', '开发证据是产品可信度的重要组成部分', '当产品供应商和开发者是同一家公司时，这部分尤其要分清'],
    say: ['“这里不仅要有功能，还要有测试和开发过程证据。”', '“该能力要结合缺陷处置和验证活动一起说明。”']
  },
  {
    role: '维护视角 / Maintenance（服务提供方细分）',
    focus: '保证系统在运行期持续满足要求。',
    know: ['补丁、变更、账号、日志、远程访问都属于持续控制', '如果只在交付时满足而运行中失控，审核同样会关注', '维护可能来自业主，也可能来自外部服务商'],
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
  '误区：达到某个 SL 目标只靠设备商。实际上通常需要业主、服务提供方、产品供应商、维护等多方共同完成。',
  '误区：有测试截图就够了。审核往往还会关注输入、设计逻辑、过程记录和责任闭环。'
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
      <section className={styles.hero}>
        <div className={styles.heroText}>
          <span className={styles.eyebrow}>IEC 62443 Learning Hub</span>
          <h1>这个平台是做什么的</h1>
          <p>
            本平台通过一个共享案例，把 IEC 62443 中的主角色、协作关系、能力边界与判断逻辑串起来。
            它不是正式认证工具，也不是替代工程设计的软件，而是一个帮助学习者先看懂“谁在做什么、为什么这样配合”的学习与演示平台。
          </p>
          <div className={styles.actions}>
            <Button onClick={handleLoadDemo}>加载案例数据</Button>
            <Button onClick={handleReset} variant="secondary">全新输入</Button>
          </div>
        </div>
      </section>

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

      <SectionBlock title="IEC 62443 简明教程">
        <div className={learningStyles.conceptGrid}>
          {CONCEPT_CARDS.map((item) => (
            <article key={item.title} className={learningStyles.conceptCard}>
              <span>{item.tag}</span>
              <strong>{item.title}</strong>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </SectionBlock>

      <SectionBlock title="角色理解">
        <div className={learningStyles.roleGrid}>
          {ROLE_CARDS.map((card) => (
            <article key={card.role} className={learningStyles.roleCard}>
              <strong>{card.role}</strong>
              <p className={learningStyles.meta}>{card.focus}</p>
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
        <div className={learningStyles.misconceptionList}>
          {MISCONCEPTIONS.map((item) => (
            <article key={item} className={learningStyles.misconceptionCard}>
              <strong>提醒</strong>
              <p>{item}</p>
            </article>
          ))}
        </div>
      </SectionBlock>

      <div className={learningStyles.memoryBanner}>先理解主角色，再理解扩展视角，最后进入案例页面看它们如何在同一个实例中被串起来。</div>

    </main>
  );
}
