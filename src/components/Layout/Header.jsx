import { Link, useLocation } from 'react-router-dom';
import styles from './Header.module.css';

const TOP_ITEMS = [
  { to: '/tutorial', label: '入门教程' },
  { to: '/owner', label: '案例演示' }
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
            <span>用于理解 IEC 62443 如何在项目中形成完整闭环的教学系统</span>
          </div>
        </Link>

        <nav className={styles.nav}>
          {TOP_ITEMS.map((item) => <Link key={item.to} to={item.to} className={`${styles.topLink} ${isActive(item.to) ? styles.active : ''}`}><span>{item.label}</span></Link>)}
        </nav>
      </div>
    </header>
  );
}
