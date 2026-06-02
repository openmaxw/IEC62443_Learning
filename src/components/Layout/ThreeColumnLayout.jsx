import styles from './ThreeColumnLayout.module.css';

export function ThreeColumnLayout({
  leftSidebar,
  mainContent,
  rightPanel,
  leftWidth = '250px',
  rightWidth = '300px'
}) {
  return (
    <div className={styles.container}>
      {leftSidebar && (
        <aside className={styles.sidebar} style={{ width: leftWidth }}>
          {leftSidebar}
        </aside>
      )}
      <main className={styles.main}>
        {mainContent}
      </main>
      {rightPanel && (
        <aside className={styles.rightPanel} style={{ width: rightWidth }}>
          {rightPanel}
        </aside>
      )}
    </div>
  );
}
