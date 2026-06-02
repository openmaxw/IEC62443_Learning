import styles from './Footer.module.css';

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.shell}>
        <p className={styles.meta}>本系统用于 IEC 62443 学习、演示与项目前期对齐参考，不构成认证、合规或正式工程设计结论。</p>
        <p className={styles.meta}>欢迎浏览和评估本公开演示；未经许可请勿复制、部署、分发或商用，详情见 <a className={styles.link} href={`${import.meta.env.BASE_URL}LICENSE.html`} target="_blank" rel="noreferrer">LICENSE</a>。</p>
        <p className={styles.meta}>© 2026 <a className={styles.link} href="mailto:openmax@139.com">Max Wang</a>. All rights reserved.</p>
      </div>
    </footer>
  );
}
