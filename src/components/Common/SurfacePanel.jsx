import styles from './SurfacePanel.module.css';

export function SurfacePanel({ children, className = '' }) {
  return <div className={`${styles.panel} ${className}`.trim()}>{children}</div>;
}
