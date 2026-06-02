import styles from './Card.module.css';

export function Card({
  children,
  title,
  subtitle,
  variant = 'default',
  className = '',
  onClick,
  ...props
}) {
  const classNames = [
    styles.card,
    styles[variant],
    onClick ? styles.clickable : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={classNames} onClick={onClick} {...props}>
      {(title || subtitle) && (
        <div className={styles.header}>
          {title && <h3 className={styles.title}>{title}</h3>}
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>
      )}
      <div className={styles.content}>{children}</div>
    </div>
  );
}
