import { Link } from 'react-router-dom';
import { Badge, Button, SectionBlock, SummaryStatGrid } from '../../components/Common';
import styles from '../Learning/LearningMode.module.css';

const ITEMS = [
  { label: '主要职责', value: '检查通过条件与证据链' },
  { label: '关注输入', value: '目标、设计、声明、维护' },
  { label: '关注输出', value: '闭环与证明是否充分' },
  { label: '典型问题', value: '责任不清、证据不足、边界模糊' }
];

const BLOCKS = [
  { title: '审核者在看什么', points: ['看输入是否完整，角色责任是否明确', '看系统实现、产品能力、开发与维护是否逻辑一致', '看证据是否足以支撑“通过”而不是停留在口头说明'] },
  { title: '输入来自哪里', points: ['来自业主的目标、约束和验收关注', '来自集成商的系统实现与责任划分', '来自设备商、开发者、维护方提供的产品、开发和运行证据'] },
  { title: '决策依据', points: ['依据案例是否形成从输入到证据的完整链条', '依据每一项要求到底由谁承担、如何证明', '依据是否存在未解释清楚的差距、外部补偿或责任空档'] },
  { title: '输出流向哪里', points: ['输出为通过、补充说明或不符合项判断', '输出会反向推动业主、集成商、设备商和维护方补足证据或闭环动作', '输出会帮助学习者理解为什么审核是全局视角'] },
  { title: '与谁协作', points: ['与所有参与方间接协作，因为审核关注的是整体链路而非单页内容', '与追溯矩阵和总结与审核页最紧密，它们最能体现闭环', '与后续更细的 3-3、4-1、4-2 关注点说明直接相关'] }
];

export function AssessorView() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div>
          <Badge variant="info" size="large">审核者视角</Badge>
          <h1>审核者如何判断一个 IEC 62443 案例是否真正形成闭环</h1>
          <p>审核者从全局视角看案例是否可通过。它不仅看功能和配置，还看角色责任、信息流转、开发证据、运行证据以及差距是否被充分解释。</p>
        </div>
        <div className={styles.heroActions}>
          <Link to="/report"><Button variant="primary" size="medium">查看总结与审核</Button></Link>
          <Link to="/translation-center"><Button variant="secondary" size="medium">查看追溯矩阵</Button></Link>
        </div>
      </section>

      <SummaryStatGrid items={ITEMS} />

      {BLOCKS.map((block) => (
        <SectionBlock key={block.title} title={block.title}>
          <ul>{block.points.map((item) => <li key={item}>{item}</li>)}</ul>
        </SectionBlock>
      ))}

    </div>
  );
}
