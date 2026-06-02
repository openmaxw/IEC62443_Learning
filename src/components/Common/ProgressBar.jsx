import styles from './ProgressBar.module.css';

export function ProgressBar({
  value = 0,
  max = 100,
  variant = 'primary',
  showLabel = false,
  size = 'medium',
  className = '',
}) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className={`${styles.container} ${styles[size]} ${className}`}>
      <div className={styles.track}>
        <div
          className={`${styles.fill} ${styles[variant]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <span className={styles.label}>{Math.round(percentage)}%</span>
      )}
    </div>
  );
}
