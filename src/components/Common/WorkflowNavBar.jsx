import { Button } from './Button';
import styles from './WorkflowNavBar.module.css';

export function WorkflowNavBar({
  leftLabel = '上一步',
  rightLabel = '下一步',
  secondaryRightLabel,
  onLeftClick,
  onRightClick,
  onSecondaryRightClick,
  leftDisabled = false,
  rightDisabled = false,
  secondaryRightDisabled = false,
  leftVariant = 'ghost',
  rightVariant = 'primary',
  secondaryRightVariant = 'ghost'
}) {
  return (
    <div className={styles.navBar}>
      <Button variant={leftVariant} size="medium" onClick={onLeftClick} disabled={leftDisabled}>{leftLabel}</Button>
      <div className={styles.rightActions}>
        {secondaryRightLabel ? <Button variant={secondaryRightVariant} size="medium" onClick={onSecondaryRightClick} disabled={secondaryRightDisabled}>{secondaryRightLabel}</Button> : null}
        <Button variant={rightVariant} size="medium" onClick={onRightClick} disabled={rightDisabled}>{rightLabel}</Button>
      </div>
    </div>
  );
}
