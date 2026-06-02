import styles from './Badge.module.css';

export function Badge({
  children,
  variant = 'default',
  size = 'medium',
  className = '',
}) {
  const classNames = [
    styles.badge,
    styles[variant],
    styles[size],
    className
  ].filter(Boolean).join(' ');

  return (
    <span className={classNames}>
      {children}
    </span>
  );
}
