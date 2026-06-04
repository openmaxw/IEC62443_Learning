import { Link, useLocation } from 'react-router-dom';
import styles from './CaseStageLayout.module.css';

const CASE_ITEMS = [
  { to: '/owner', number: '01', label: '目标定义', note: '业主主导，明确目标、约束与后果判断' },
  { to: '/integrator', number: '02', label: '系统设计', note: '服务商 / 集成商主导，形成系统设计与边界控制' },
  { to: '/vendor', number: '03', label: '能力说明', note: '产品供应商主导，说明组件能力与支撑证据' },
  { to: '/translation-center', number: '04', label: '关系追溯', note: '跨角色协同，串联输入、设计、能力与差距' },
  { to: '/selection', number: '05', label: '差距闭环', note: '跨角色协同，识别差距、补偿措施与闭环责任' },
  { to: '/report', number: '06', label: '形成结论', note: '审核视角，汇总依据并形成判断结论' }
];

export function CaseStageLayout({ children }) {
  const location = useLocation();
  const isActive = (path) => location.pathname === path || location.pathname.startsWith(`${path}/`);

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <strong>教学主线</strong>
          <span>按项目流程理解 IEC 62443</span>
        </div>
        <nav className={styles.nav}>
          {CASE_ITEMS.map((item) => (
            <Link key={item.to} to={item.to} className={`${styles.navItem} ${isActive(item.to) ? styles.active : ''}`}>
              <span className={styles.number}>{item.number}</span>
              <span className={styles.itemText}><span className={styles.label}>{item.label}</span><small className={styles.note}>{item.note}</small></span>
            </Link>
          ))}
        </nav>
      </aside>
      <div className={styles.content}>{children}</div>
    </div>
  );
}
