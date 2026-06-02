import styles from './DataTable.module.css';

export function DataTable({ children, className = '' }) {
  return (
    <div className={styles.wrap}>
      <table className={`${styles.table} ${className}`.trim()}>{children}</table>
    </div>
  );
}
