import { Link } from 'react-router-dom';
import { Badge, Button } from '../Common';
import styles from './ProjectStageShell.module.css';

export function ProjectStageShell({
  stageNumber,
  title,
  toolbar,
  statusPanel,
  prevAction,
  nextAction,
  guidance,
  children,
  hideStatus = false
}) {
  const statusBar = hideStatus ? null : (
    statusPanel ? (
      <section className={styles.statusPanel}>
        <div className={styles.statusAside}>{statusPanel}</div>
      </section>
    ) : null
  );

  return (
    <div className={styles.page}>
      <section className={styles.toolbarRow}>
        <div className={styles.titleGroup}>
          <Badge variant="primary" size="medium">阶段 {stageNumber}</Badge>
          <strong>{title}</strong>
        </div>
        <div className={styles.actionGroup}>
          {toolbar}
        </div>
      </section>
      {guidance ? (
        <section className={styles.guidanceRow}>
          <p>{guidance.summary}</p>
        </section>
      ) : null}
      <section className={styles.body}>{typeof children === 'function' ? children({ statusBar }) : children}</section>
      {typeof children === 'function' ? null : statusBar}
      {(prevAction || nextAction) ? (
        <section className={styles.navRow}>
          <div className={styles.navActions}>
            {prevAction ? <Link to={prevAction.to}><Button variant="ghost" size="medium">{prevAction.label}</Button></Link> : null}
            {nextAction ? <Link to={nextAction.to}><Button variant="primary" size="medium">{nextAction.label}</Button></Link> : null}
          </div>
        </section>
      ) : null}
    </div>
  );
}
