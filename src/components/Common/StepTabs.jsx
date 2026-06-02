import styles from './StepTabs.module.css';

export function StepTabs({ items, currentIndex, onChange }) {
  return (
    <div className={styles.tabs}>
      {items.map((item, index) => (
        <button
          key={item.id}
          type="button"
          className={`${styles.tab} ${index === currentIndex ? styles.active : ''}`.trim()}
          onClick={() => onChange(index)}
        >
          {String(index + 1).padStart(2, '0')} {item.title}
        </button>
      ))}
    </div>
  );
}
