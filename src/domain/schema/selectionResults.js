const RESULT_STATUS = new Set(['native', 'configured', 'external', 'compensating', 'missing', 'fulfilled', 'partial', 'na']);
const SEVERITY_LEVELS = new Set(['low', 'medium', 'high']);

function asText(value) {
  return typeof value === 'string' ? value : '';
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function asObject(value, fallback = {}) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : fallback;
}

function asEnum(value, allowed) {
  return typeof value === 'string' && allowed.has(value) ? value : '';
}

function asCount(value) {
  return Number.isFinite(value) ? value : 0;
}

function normalizeResultRow(value, index) {
  const source = asObject(value);
  return {
    id: asText(source.id) || `result-${index + 1}`,
    capabilityId: asText(source.capabilityId),
    controlObjective: asText(source.controlObjective),
    status: asEnum(source.status, RESULT_STATUS),
    evidenceType: asText(source.evidenceType),
    gapNote: asText(source.gapNote),
    severity: asEnum(source.severity, SEVERITY_LEVELS),
    owner: asText(source.owner)
  };
}

function normalizeSummary(value) {
  const source = asObject(value);
  return {
    native: asCount(source.native),
    configured: asCount(source.configured),
    external: asCount(source.external),
    compensating: asCount(source.compensating),
    missing: asCount(source.missing),
    overallScore: asCount(source.overallScore),
    high: asCount(source.high),
    medium: asCount(source.medium),
    low: asCount(source.low)
  };
}

export const EMPTY_SELECTION_RESULTS = {
  results: [],
  summary: {
    native: 0,
    configured: 0,
    external: 0,
    compensating: 0,
    missing: 0,
    overallScore: 0,
    high: 0,
    medium: 0,
    low: 0
  }
};

export function normalizeSelectionResults(value) {
  const source = asObject(value, null);
  if (!source) return null;

  return {
    results: asArray(source.results).map(normalizeResultRow),
    summary: normalizeSummary(source.summary)
  };
}
