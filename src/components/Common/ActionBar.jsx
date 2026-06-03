import styles from './ActionBar.module.css';

export function ActionBar({ children, align = 'between', className = '' }) {
  return <div className={`${styles.bar} ${styles[align] || ''} ${className}`.trim()}>{children}</div>;
}
