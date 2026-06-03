import styles from './HeroPanel.module.css';

export function HeroPanel({ children, className = '', align = 'split' }) {
  return <section className={`${styles.hero} ${styles[align] || ''} ${className}`.trim()}>{children}</section>;
}
