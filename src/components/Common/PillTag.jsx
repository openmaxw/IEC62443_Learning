import styles from './PillTag.module.css';

export function PillTag({ children, tone = 'primary', size = 'medium', className = '' }) {
  return <span className={`${styles.tag} ${styles[tone] || ''} ${styles[size] || ''} ${className}`.trim()}>{children}</span>;
}
