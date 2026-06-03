import styles from './SummaryStatGrid.module.css';

export function SummaryStatGrid({ items = [], columns = 4, compact = false, valueTone = 'default' }) {
  return (
    <div className={`${styles.grid} ${compact ? styles.compact : ''} ${styles[valueTone] || ''}`} style={{ '--summary-columns': columns }}>
      {items.map((item) => (
        <div key={item.label} className={styles.item}>
          <span>{item.label}</span>
          <strong className={typeof item.value === 'string' && item.value.length > 24 ? styles.longValue : ''}>{item.value}</strong>
        </div>
      ))}
    </div>
  );
}
