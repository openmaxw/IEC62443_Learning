import styles from './StructuredRecordTable.module.css';

export function StructuredRecordTable({ columns = [], rows = [], emptyText = '暂无数据' }) {
  return (
    <div className={styles.wrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.indexCol}>序号</th>
            {columns.map((column) => <th key={column.key}>{column.label}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.length ? rows.map((row, index) => (
            <tr key={row.id || index}>
              <td className={styles.indexCell}>{String(index + 1).padStart(2, '0')}</td>
              {columns.map((column) => <td key={column.key}>{row[column.key] ?? '—'}</td>)}
            </tr>
          )) : (
            <tr>
              <td colSpan={columns.length + 1} className={styles.empty}>{emptyText}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
