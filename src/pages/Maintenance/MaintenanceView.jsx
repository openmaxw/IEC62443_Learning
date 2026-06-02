import { Link } from 'react-router-dom';
import { Badge, Button, SectionBlock, SummaryStatGrid } from '../../components/Common';
import styles from '../Learning/LearningMode.module.css';

const ITEMS = [
  { label: '主要职责', value: '运行期持续控制' },
  { label: '上游输入', value: '系统交付与责任边界' },
  { label: '下游输出', value: '业主 / 审核者' },
  { label: '典型活动', value: '补丁、变更、账号、日志' }
];

const BLOCKS = [
  { title: '维护方在做什么', points: ['让系统在运行期持续满足要求，而不是只在交付瞬间满足', '落实补丁、变更、账号、日志和远程维护控制', '承担系统交付后的持续执行责任'] },
  { title: '输入来自哪里', points: ['来自业主的运行要求和维护约束', '来自集成商定义的系统边界、责任和控制措施', '来自设备商和开发者提供的维护建议、限制和版本条件'] },
  { title: '决策依据', points: ['依据系统运行方式、维护窗口、远程接入方式和审计要求', '依据哪些控制需要在运行期持续执行', '依据责任分工和补偿措施安排'] },
  { title: '输出流向哪里', points: ['输出给业主，体现系统是否持续受控', '输出给审核者，证明运维活动不是空白', '反馈给系统和产品团队，支持持续改进'] },
  { title: '与谁协作', points: ['与业主协作，落实维护制度和资源安排', '与集成商协作，保证系统控制措施在运行中延续', '与审核者间接衔接，支撑运行期证据链'] }
];

export function MaintenanceView() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div>
          <Badge variant="info" size="large">维护方视角</Badge>
          <h1>维护方如何保证 IEC 62443 要求在运行期持续成立</h1>
          <p>维护方关注的是系统交付之后的持续满足。对学习者来说，本页用来解释为什么很多要求不仅是“设计出来”，还必须“长期执行出来”。</p>
        </div>
        <div className={styles.heroActions}>
          <Link to="/selection"><Button variant="primary" size="medium">查看协作与差距</Button></Link>
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
