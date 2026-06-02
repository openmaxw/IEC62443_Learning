import styles from './SummaryStatGrid.module.css';

export function SummaryStatGrid({ items = [], columns = 4, compact = false }) {
  return (
    <div className={`${styles.grid} ${compact ? styles.compact : ''}`} style={{ '--summary-columns': columns }}>
      {items.map((item) => (
        <div key={item.label} className={styles.item}>
          <span>{item.label}</span>
          <strong>{item.value}</strong>
        </div>
      ))}
    </div>
  );
}
