import styles from './StatusSummaryPanel.module.css';

export function StatusSummaryPanel({ label, value, note, pills = [] }) {
  return (
    <div className={styles.aside}>
      <div className={styles.noteCard}>
        <span>{label}</span>
        <strong>{value}</strong>
        {note ? <em>{note}</em> : null}
      </div>
      {pills.length ? (
        <div className={styles.pills}>
          {pills.map((pill) => <span key={pill} className={styles.pill}>{pill}</span>)}
        </div>
      ) : null}
    </div>
  );
}
