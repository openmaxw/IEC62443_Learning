import styles from './NotePanel.module.css';

export function NotePanel({ title, notes = [] }) {
  return (
    <section className={styles.panel}>
      <strong>{title}</strong>
      {notes.map((note) => <em key={note}>{note}</em>)}
    </section>
  );
}
