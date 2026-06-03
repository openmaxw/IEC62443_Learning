import styles from './InfoBanner.module.css';

export function InfoBanner({ children, tone = 'info', className = '' }) {
  return <div className={`${styles.banner} ${styles[tone] || ''} ${className}`.trim()}>{children}</div>;
}
