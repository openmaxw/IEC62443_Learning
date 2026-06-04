import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useProject } from '../../hooks/useProject';
import styles from './Header.module.css';

const TOP_ITEMS = [
  { to: '/tutorial', number: '01', label: '入门教程', type: 'link' },
  { to: '/owner', number: '02', label: '案例演示', type: 'demo' },
  { to: '/owner', number: '03', label: '动手演练', type: 'reset' }
];

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { state, actions } = useProject();
  const isPathActive = (path) => location.pathname === path || location.pathname.startsWith(`${path}/`);

  const isActive = (item) => {
    if (item.type === 'link') return isPathActive(item.to);
    if (!isPathActive(item.to)) return false;

    const projectStatus = state.projectMeta?.status;
    if (item.type === 'demo') return projectStatus === 'demo-loaded';
    if (item.type === 'reset') return projectStatus !== 'demo-loaded';
    return false;
  };

  const handleTopItemClick = (item) => {
    if (item.type === 'demo') {
      actions.loadDemoProject();
      navigate(item.to);
      return;
    }
    if (item.type === 'reset') {
      actions.resetProject();
      navigate(item.to);
    }
  };

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
            <span>帮助你从概念、角色和案例出发理解 IEC 62443</span>
          </div>
        </Link>

        <nav className={styles.nav}>
          {TOP_ITEMS.map((item) => (
            item.type === 'link'
              ? <Link key={item.number} to={item.to} className={`${styles.topLink} ${isActive(item) ? styles.active : ''}`}><span className={styles.topNumber}>{item.number}</span><span>{item.label}</span></Link>
              : <button key={item.number} type="button" onClick={() => handleTopItemClick(item)} className={`${styles.topLink} ${item.type === 'reset' ? styles.tertiary : ''} ${isActive(item) ? styles.active : ''}`}><span className={styles.topNumber}>{item.number}</span><span>{item.label}</span></button>
          ))}
        </nav>
      </div>
    </header>
  );
}
