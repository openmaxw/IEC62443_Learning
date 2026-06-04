import styles from './Footer.module.css';

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.shell}>
        <p className={styles.title}>IEC 62443 学习与案例演示系统</p>
        <p className={styles.meta}>用于教学、案例推演与方法理解，不直接构成正式认证、审核、合规或项目交付结论。</p>
        <p className={styles.meta}><a className={styles.link} href={`${import.meta.env.BASE_URL}LICENSE.html`} target="_blank" rel="noreferrer">LICENSE</a> · © 2026 <a className={styles.link} href="mailto:openmax@139.com">Max Wang</a></p>
      </div>
    </footer>
  );
}
