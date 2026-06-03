import styles from './Iec62443Tutorial.module.css';

const FRAMEWORK_LAYERS = [
  {
    title: '系统层',
    text: '关注系统目标、系统要求、边界划分、区域/管道、通信关系和整体实现，典型会看到 3-2、3-3。'
  },
  {
    title: '组件层',
    text: '关注组件本身具备什么技术安全能力，典型会看到 4-2。'
  },
  {
    title: '开发流程层',
    text: '关注供应商是否具备安全开发、漏洞处理、版本管理和可信交付实践，典型会看到 4-1。'
  },
  {
    title: '运行维护层',
    text: '关注交付后控制如何持续成立，包括补丁、账号、变更、日志、远程维护和持续改进。'
  }
];

const ROLE_CARDS = [
  {
    role: '业主 / 资产所有者',
    focus: '提出业务目标、后果判断与运行约束。',
    responsibilities: ['明确不可接受的业务后果', '说明关键资产、远程维护、停机窗口与外部连接', '给后续设计、能力匹配和验收判断提供边界'],
    expression: ['“我们的重点关注是连续生产和远程维护边界。”', '“请先按业务约束和运行方式理解安全目标。”']
  },
  {
    role: '系统集成商 / 服务提供方',
    focus: '把输入转成系统实现、边界设计和责任分工。',
    responsibilities: ['把需求转成 Zone、Conduit、通信矩阵和控制措施', '说明系统层如何响应 SR', '识别哪些要求需要系统、产品和运行方共同完成'],
    expression: ['“这个目标会通过分区隔离、边界控制和审计链路来实现。”', '“这里属于系统层响应，不能只靠单一组件声明。”']
  },
  {
    role: '产品供应商 / 开发方',
    focus: '说明组件能力、开发支撑和适用边界。',
    responsibilities: ['说明产品原生支持什么、依赖条件是什么、限制在哪里', '理解 4-2 与 4-1 如何支撑系统级目标', '把能力边界、测试依据和开发可信度表达清楚'],
    expression: ['“该能力原生支持，但需要特定配置与许可条件。”', '“这部分可以支撑系统目标，但仍依赖项目侧边界控制。”']
  },
  {
    role: '维护方 / 运行方',
    focus: '让控制要求在交付后持续成立。',
    responsibilities: ['持续落实补丁、变更、账号、日志和远程维护控制', '保证运行期不会因为执行松散而破坏既有控制', '通过记录和流程支撑后续复核与审核'],
    expression: ['“这项控制在运行期通过变更流程和审计记录持续支撑。”', '“远程维护不是开通即可，还要持续管理身份、授权和会话。”']
  },
  {
    role: '审核者 / 评估者',
    focus: '从证据链完整性判断项目结论是否成立。',
    responsibilities: ['关注输入、设计、能力、运行和责任是否前后一致', '关注满足结论是否有证据支撑', '关注系统、产品、开发和维护之间是否存在断层'],
    expression: ['“请说明该要求由谁承担，并提供对应证据。”', '“请说明这里是系统层满足、产品层满足，还是依赖外部补偿。”']
  }
];

const FR_MAPPING_ROWS = [
  { fr: 'FR 1 识别与认证', sr: 'SR 1.x：系统如何识别并认证用户、设备或软件实体。', cr: 'CR 1.x：组件是否支持身份、认证、账号和认证机制。' },
  { fr: 'FR 2 使用控制', sr: 'SR 2.x：系统如何控制授权、角色、权限和会话。', cr: 'CR 2.x：组件是否支持授权、权限控制和使用限制。' },
  { fr: 'FR 3 系统完整性', sr: 'SR 3.x：系统如何防篡改、验证完整性并保护通信。', cr: 'CR 3.x：组件是否支持完整性保护、恶意代码防护和安全更新相关能力。' },
  { fr: 'FR 4 数据机密性', sr: 'SR 4.x：系统如何保护传输和存储中的敏感数据。', cr: 'CR 4.x：组件是否支持保密性保护和相关加密能力。' },
  { fr: 'FR 5 受限数据流', sr: 'SR 5.x：系统如何通过区域、管道和边界控制限制数据流。', cr: 'CR 5.x：组件是否支持网络边界、接口和通信流向控制能力。' },
  { fr: 'FR 6 事件及时响应', sr: 'SR 6.x：系统如何形成审计、日志、告警和事件响应基础。', cr: 'CR 6.x：组件是否支持事件记录、审计和安全状态输出。' },
  { fr: 'FR 7 资源可用性', sr: 'SR 7.x：系统如何维持资源、抗拒绝服务并支持恢复。', cr: 'CR 7.x：组件是否支持可用性、资源管理和抗拒绝服务相关能力。' }
];

const FAQ_ITEMS = [
  {
    question: 'SL2 和 SL3 指的是设备能力等级吗？',
    answer: '不完全是。SL 首先表达的是系统或区域希望达到的目标强度。设备能力可以支撑这个目标，但 SL 不能简单等同为单个设备的能力等级。'
  },
  {
    question: '一个设备具备若干安全功能，就可以说它“通过 SL3”吗？',
    answer: '通常不能这样说。设备可以声明某些能力可支撑更高目标，但是否达到 SL3，要结合系统设计、集成方式、边界控制、运行维护和证据一起判断。'
  },
  {
    question: '4-2 设备能力强，是不是就代表系统一定满足 3-3？',
    answer: '不是。4-2 说明组件能力，3-3 关注系统设计与系统级满足。组件能力是基础，但不能自动替代系统级结论。'
  },
  {
    question: '作为设备供应商，是不是只需要理解 4-2？',
    answer: '不够。设备供应商至少需要理解 4-2、4-1 以及这些能力如何被项目用于响应系统级需求，否则很难把能力边界说清楚。'
  },
  {
    question: '设备供应商最应该准备什么材料？',
    answer: '至少要准备能力说明、适用边界、依赖条件、限制说明、测试或验证依据，以及必要时的开发与缺陷处理相关证据。'
  },
  {
    question: '有测试截图就足够了吗？',
    answer: '通常不够。项目还会关注输入来源、设计逻辑、责任闭环、过程记录和运行期证据。截图只是其中一类证据。'
  },
  {
    question: 'VPN 有 MFA 就代表远程维护完全满足要求吗？',
    answer: '不代表。VPN 只是进入路径的一部分，还需要看到达关键系统后的身份、授权、审计、边界和会话控制。'
  }
];

export function Iec62443Tutorial() {
  return (
    <main className={styles.page}>
      <article className={styles.article}>
        <header className={styles.hero}>
          <span className={styles.eyebrow}>IEC 62443 简明教程</span>
          <h1>IEC 62443 简明教程</h1>
          <p>帮助你建立一条清晰主线：先理解体系定义，再理解体系分层、核心概念、概念对应关系，最后进入典型场景与常见问题。</p>
        </header>

        <section className={styles.section}>
          <h2>1. IEC 62443 体系定义</h2>
          <p>IEC 62443 是面向工业自动化与控制系统安全的体系化标准框架。它关注的不是单一设备功能，而是一个工业场景如何在目标、设计、能力、运行和审核上整体成立。</p>
          <div className={styles.compareNote}><strong>重点区分：</strong><span>IEC 62443 面向的是工业自动化与控制系统安全，不是仅仅面向通信网络本身，也不是只检查某个设备有没有若干安全功能。</span></div>
          <div className={styles.note}>阅读顺序建议是：体系定义 → 体系分层 → 核心概念 → 概念对应关系 → 典型场景 → FAQ。</div>
        </section>

        <section className={styles.section}>
          <h2>2. IEC 62443 体系分层</h2>
          <p>IEC 62443 可以从四个层面理解：系统层、组件层、开发流程层、运行维护层。先把层面分清，再看概念和编号，理解会更稳定。</p>
          <div className={styles.compareNote}><strong>重点区分：</strong><span>IEC 62443 是分层理解的体系，不要把它理解成只讨论设备功能，或只讨论网络边界的一套规则。</span></div>
          <div className={styles.grid2}>
            {FRAMEWORK_LAYERS.map((item) => (
              <article key={item.title} className={styles.card}><strong>{item.title}</strong><p>{item.text}</p></article>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <h2>3. IEC 62443 核心概念</h2>
          <p>先掌握 Zone、Conduit、FR、SR、CR、SL 六个核心概念。它们构成后续理解系统设计、组件能力和项目判断的基础。</p>
          <table className={styles.table}>
            <thead><tr><th>概念</th><th>定义</th><th>它通常回答什么问题</th></tr></thead>
            <tbody>
              <tr><td>Zone</td><td>具有相近安全需求或风险特征的一组资产/对象</td><td>哪些对象应该被归在一起看、一起定义边界</td></tr>
              <tr><td>Conduit</td><td>Zone 之间受控通信的路径</td><td>哪些跨区通信应该存在、如何被限制和审计</td></tr>
              <tr><td>FR</td><td>七类共同安全目标</td><td>总体上要保护什么能力领域</td></tr>
              <tr><td>SR</td><td>系统要求</td><td>系统层应该如何设计和落实</td></tr>
              <tr><td>CR</td><td>组件要求</td><td>组件需要具备什么能力来支撑系统</td></tr>
              <tr><td>SL</td><td>目标强度 / 目标等级</td><td>项目希望达到什么安全目标强度</td></tr>
            </tbody>
          </table>
          <div className={styles.compareNote}><strong>重点区分：</strong><span>Zone / Conduit 用于理解系统边界与跨边界通信；FR / SR / CR / SL 用于理解安全目标、要求与目标强度，它们不是同一层面的概念。</span></div>
          <div className={styles.note}>主线顺序可以概括为：业务输入 → 目标强度 → 架构与边界 → 系统要求 → 组件能力 → 运行维护 → 审核判断。</div>
        </section>

        <section className={styles.section}>
          <h2>4. IEC 62443 概念对应关系</h2>
          <p>FR、SR、CR、SL 各有明确位置。FR 定义安全目标领域，SR 说明系统如何满足，CR 说明组件如何支撑，SL 表达目标强度。它们不能割裂理解。</p>
          <table className={styles.table}>
            <thead><tr><th>概念</th><th>重点</th><th>一句话理解</th></tr></thead>
            <tbody>
              <tr><td>FR</td><td>共同安全目标</td><td>定义要保护哪些能力领域。</td></tr>
              <tr><td>SR</td><td>系统要求</td><td>说明系统应如何设计和实现。</td></tr>
              <tr><td>CR</td><td>组件要求</td><td>说明组件应具备什么能力。</td></tr>
              <tr><td>SL</td><td>目标强度</td><td>表达项目或区域希望达到的保护强度。</td></tr>
            </tbody>
          </table>
          <div className={styles.compareNote}><strong>重点区分：</strong><span>FR 定义保护目标，SR / CR 定义落实方式，SL 定义目标强度；SL 不是另一套功能列表。</span></div>
          <div className={styles.tip}>FR 提出目标，SR 从系统侧回应，CR 从组件侧支撑，SL 表示目标强度。</div>
        </section>

        <section className={styles.section}>
          <h2>5. FR、SR、CR 对应关系</h2>
          <p>FR、SR、CR 围绕的是同一组安全目标。FR 定义目标领域，SR 说明系统如何满足，CR 说明组件如何支撑。这样理解后，就不会把系统要求和组件能力割裂开看。</p>
          <table className={styles.table}>
            <thead><tr><th>共同 FR 领域</th><th>系统侧 SR 怎么看</th><th>组件侧 CR 怎么支撑</th></tr></thead>
            <tbody>
              {FR_MAPPING_ROWS.map((row) => (
                <tr key={row.fr}>
                  <td>{row.fr}</td>
                  <td>{row.sr}</td>
                  <td>{row.cr}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className={styles.section}>
          <h2>6. 角色在体系中的位置</h2>
          <p>同一个项目里，不同角色负责不同问题。把角色分清，才能把目标、设计、能力、运行和审核分清。</p>
          <div className={styles.roleGrid}>
            {ROLE_CARDS.map((card) => (
              <article key={card.role} className={styles.roleCard}>
                <div className={styles.roleHead}>
                  <strong>{card.role}</strong>
                  <span>{card.focus}</span>
                </div>
                <div className={styles.roleBlock}>
                  <h3>核心职责</h3>
                  <ul>{card.responsibilities.map((item) => <li key={item}>{item}</li>)}</ul>
                </div>
                <div className={styles.roleBlock}>
                  <h3>典型表达</h3>
                  <div className={styles.quoteList}>
                    {card.expression.map((item) => <blockquote key={item}>{item}</blockquote>)}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <h2>7. 典型场景</h2>
          <p>下面用一个最小场景说明，体系分层、核心概念、概念对应关系和角色分工如何在同一个项目中连起来。</p>
          <div className={styles.caseBlock}>
            <div className={styles.caseItem}><strong>1. 场景</strong><p>某离散制造车间需要允许设备商对产线中的 PLC 与 HMI 进行受控远程维护。</p></div>
            <div className={styles.caseItem}><strong>2. 业务关注</strong><p>业主最关心的是生产连续性、远程访问失控以及误操作影响生产。</p></div>
            <div className={styles.caseItem}><strong>3. 目标理解</strong><p>这个场景希望做到远程维护可控、可限制、可审计，因此身份、授权、边界和日志都是重点。</p></div>
            <div className={styles.caseItem}><strong>4. Zone / Conduit</strong><p>可把工程师站、HMI、PLC 所在控制网络视作关键控制区，把远程接入网关或跳板区视作边界区，远程维护链路就是需要被受控的 Conduit。</p></div>
            <div className={styles.caseItem}><strong>5. FR 视角</strong><p>这里至少涉及 FR 1、FR 2、FR 5、FR 6。</p></div>
            <div className={styles.caseItem}><strong>6. SR 视角</strong><p>系统层需要回答：谁可以远程进入、进入后可访问哪些对象、边界如何隔离、操作如何记录和追溯。</p></div>
            <div className={styles.caseItem}><strong>7. CR 视角</strong><p>组件层需要回答：网关、HMI、工程师站及相关设备是否支持认证、授权、审计、会话和边界控制能力。</p></div>
            <div className={styles.caseItem}><strong>8. 角色分工</strong><p>业主提出约束，集成商完成系统设计，产品供应商说明能力，维护方落实流程，审核者判断这条链是否有足够证据。</p></div>
            <div className={styles.caseItem}><strong>9. 审核判断</strong><p>最终判断的不是“某个设备有没有某项功能”，而是这个场景是否在系统、产品、运行和证据上整体成立。</p></div>
          </div>
        </section>

        <section className={styles.section}>
          <h2>8. 常见边界问题</h2>
          <div className={styles.grid2}>
            <article className={styles.card}><strong>系统层 vs 组件层</strong><p>系统层关注具体场景如何整体成立；组件层关注单个设备或软件具备什么能力。组件能力不能自动替代系统级满足。</p></article>
            <article className={styles.card}><strong>4-1 vs 4-2</strong><p>4-1 更偏开发可信度，4-2 更偏组件能力。两者相关，但回答的问题不同。</p></article>
            <article className={styles.card}><strong>SL vs FR / SR / CR</strong><p>SL 表达目标强度；FR、SR、CR 表达目标领域及落实方式。SL 不是另一套功能清单。</p></article>
          </div>
          <div className={styles.compareNote}><strong>重点区分：</strong><span>这部分不是再下定义，而是帮助区分边界。看到相近概念时，先判断它属于“目标、要求、能力、强度”中的哪一类。</span></div>
        </section>

        <section className={styles.section}>
          <h2>9. 常见组件类型</h2>
          <table className={styles.table}>
            <thead><tr><th>缩写</th><th>中文</th><th>典型对象</th></tr></thead>
            <tbody>
              <tr><td>EDR</td><td>嵌入式设备要求</td><td>PLC、RTU、传感器、执行器等</td></tr>
              <tr><td>HDR</td><td>主机设备要求</td><td>工业 PC、HMI、工程师站、服务器等</td></tr>
              <tr><td>NDR</td><td>网络设备要求</td><td>交换机、路由器、防火墙、网关等</td></tr>
              <tr><td>SAR</td><td>软件应用要求</td><td>SCADA、配置软件、应用服务等</td></tr>
            </tbody>
          </table>
          <p className={styles.tip}>组件能力很重要，但组件证书或能力清单并不能自动替代系统级设计、配置、集成、运行维护和验收判断。</p>
        </section>

        <section className={styles.section}>
          <h2>10. FAQ</h2>
          <div className={styles.faqList}>
            {FAQ_ITEMS.map((item) => (
              <article key={item.question} className={styles.faqCard}>
                <strong>{item.question}</strong>
                <p>{item.answer}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <h2>11. 本平台学习路径</h2>
          <div className={styles.grid2}>
            <article className={styles.card}><strong>先看教程</strong><p>先建立体系、概念和对应关系的整体认知。</p></article>
            <article className={styles.card}><strong>再进共享案例</strong><p>从提出目标到形成判断，观察它们如何在一个案例里串起来。</p></article>
          </div>
          <div className={styles.note}>教程负责建立认知地图，平台负责把这些认知放进案例中串联和验证。</div>
        </section>
      </article>
    </main>
  );
}
