import { Link, useLocation } from 'react-router-dom';
import styles from './Header.module.css';

const NAV_ITEMS = [
  { to: '/owner', label: '业主', hint: '目标 / 约束 / 业主输入' },
  { to: '/integrator', label: '服务提供方', hint: '集成 / 维护 / 系统实现' },
  { to: '/vendor', label: '产品供应商', hint: '产品 / 开发 / 能力证明' },
  { to: '/translation-center', label: '追溯关系', hint: '输入 / 设计 / 能力 / 责任对应' },
  { to: '/selection', label: '差距分析', hint: '满足情况 / 补偿措施 / 责任闭环' },
  { to: '/report', label: '符合性判断', hint: '审核视角 / 证据判断 / 目标说明' }
];

export function Header() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path || location.pathname.startsWith(`${path}/`);

  return (
    <header className={styles.header}>
      <div className={styles.shell}>
        <Link to="/" className={styles.brand}>
          <div className={styles.brandMark}>
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 1 3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4Zm0 4.06 5 2.17v3.94c0 3.56-2.12 6.97-5 8.37-2.88-1.4-5-4.81-5-8.37V7.23l5-2.17Z" />
            </svg>
          </div>
          <div className={styles.brandText}>
            <strong>IEC 62443 Learning Hub</strong>
            <span>通过一个共享案例理解 IEC 62443 的主角色、协作关系与判断逻辑</span>
          </div>
        </Link>

        <nav className={styles.nav}>
          {NAV_ITEMS.map((item) => (
            <Link key={item.to} to={item.to} className={`${styles.navLink} ${isActive(item.to) ? styles.active : ''}`}>
              <span>{item.label}</span>
              <small>{item.hint}</small>
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
