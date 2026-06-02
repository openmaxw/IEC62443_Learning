import styles from './StatusBadge.module.css';

export function StatusBadge({ tone = 'neutral', children, className = '' }) {
  return <span className={`${styles.badge} ${styles[tone] || ''} ${className}`.trim()}>{children}</span>;
}
