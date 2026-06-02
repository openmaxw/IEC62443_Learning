import { EXPLANATION_VIEW_MODES } from '../../data/viewModes';
import styles from './ViewModeTabs.module.css';

export function ViewModeTabs({ value, onChange }) {
  return (
    <div className={styles.tabs}>
      {EXPLANATION_VIEW_MODES.map((mode) => (
        <button
          key={mode.id}
          className={`${styles.tab} ${value === mode.id ? styles.active : ''}`}
          onClick={() => onChange(mode.id)}
        >
          <strong>{mode.label}</strong>
          <span>{mode.description}</span>
        </button>
      ))}
    </div>
  );
}
