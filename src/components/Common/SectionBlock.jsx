import styles from './SectionBlock.module.css';

export function SectionBlock({ title, children, className = '' }) {
  return (
    <section className={`${styles.section} ${className}`.trim()}>
      {title ? <h3>{title}</h3> : null}
      {children}
    </section>
  );
}
