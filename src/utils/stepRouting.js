export function resolveStepIndex(stepParam, totalSteps) {
  const numericStep = Number(stepParam);
  if (!Number.isInteger(numericStep)) return null;
  const targetIndex = numericStep - 1;
  if (targetIndex < 0 || targetIndex >= totalSteps) return null;
  return targetIndex;
}
