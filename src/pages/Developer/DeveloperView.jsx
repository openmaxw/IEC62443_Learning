import { Link } from 'react-router-dom';
import { Badge, Button, SectionBlock, SummaryStatGrid } from '../../components/Common';
import styles from '../Learning/LearningMode.module.css';

const ITEMS = [
  { label: '主要职责', value: '安全开发与验证' },
  { label: '上游输入', value: '产品需求与系统目标' },
  { label: '下游输出', value: '设备商 / 审核者' },
  { label: '典型证据', value: '测试、缺陷、开发记录' }
];

const BLOCKS = [
  { title: '开发者在做什么', points: ['将产品要求落实为设计、编码、测试、验证和缺陷处置活动', '把“产品有能力”进一步落实为“产品有开发与验证证据”', '支撑设备商向审核者解释产品为什么可信'] },
  { title: '输入来自哪里', points: ['来自系统目标、产品需求和目标安全等级', '来自设备商对能力边界和适用场景的定义', '来自需要落实的开发与验证要求'] },
  { title: '决策依据', points: ['依据产品架构、开发流程、测试策略、缺陷管理和版本边界', '依据哪些要求需要通过设计与验证活动来证明', '依据产品是否承担了相关能力实现责任'] },
  { title: '输出流向哪里', points: ['输出给设备商，形成产品与开发页的能力可信度基础', '输出给审核者，用于判断该能力是否可证明', '输出给系统团队，帮助识别产品层可支撑与不可支撑的边界'] },
  { title: '与谁协作', points: ['与设备商协作，统一能力声明与证据边界', '与集成商协作，澄清哪些要求是产品层还是系统层承担', '与审核者间接衔接，支撑通过条件说明'] }
];

export function DeveloperView() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div>
          <Badge variant="info" size="large">开发者视角</Badge>
          <h1>开发者如何支撑 IEC 62443 框架中的产品可信性</h1>
          <p>开发者负责把产品要求落实为可审核的开发与验证活动。对学习者来说，本页的意义在于理解为什么审核往往不只看“有无功能”，还会关注测试、缺陷管理和开发过程证据。</p>
        </div>
        <div className={styles.heroActions}>
          <Link to="/vendor"><Button variant="primary" size="medium">查看设备商页</Button></Link>
          <Link to="/report"><Button variant="secondary" size="medium">查看总结与审核</Button></Link>
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
