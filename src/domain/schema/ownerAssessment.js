const IMPACT_LEVELS = new Set(['low', 'medium', 'high']);
const REMOTE_ACCESS_LEVELS = new Set(['none', 'limited', 'extensive']);
const THIRD_PARTY_ACCESS_LEVELS = new Set(['none', 'occasional', 'regular']);
const INTEGRATION_LEVELS = new Set(['low', 'moderate', 'high']);
const MATURITY_LEVELS = new Set(['low', 'medium', 'high']);
const REMOTE_OWNERSHIP = new Set(['owner', 'integrator', 'vendor', 'shared']);
const ACCEPTANCE_PREFERENCE = new Set(['function-first', 'security-first', 'operations-first']);

function asText(value) {
  return typeof value === 'string' ? value : '';
}

function asEnum(value, allowed) {
  return typeof value === 'string' && allowed.has(value) ? value : '';
}

function asStringArray(value) {
  return Array.isArray(value) ? value.filter((item) => typeof item === 'string') : [];
}

export const EMPTY_OWNER_ASSESSMENT = {
  projectName: '',
  industry: '',
  safetyImpact: '',
  environmentalImpact: '',
  productionImpact: '',
  qualityImpact: '',
  financialImpact: '',
  complianceImpact: '',
  brandImpact: '',
  remoteAccessNeed: '',
  thirdPartyAccess: '',
  itOtIntegration: '',
  networkSegmentationMaturity: '',
  identityMaturity: '',
  loggingMaturity: '',
  patchMaturity: '',
  maintenanceWindow: '',
  upgradeWindow: '',
  remoteOperationsOwnership: '',
  acceptancePreference: '',
  criticalAssets: [],
  keySystems: '',
  externalConnections: '',
  maintenanceAccessPath: '',
  initialBoundaryNotes: '',
  continuityRequirements: '',
  complianceNotes: ''
};

export function normalizeOwnerAssessment(value) {
  const source = value && typeof value === 'object' && !Array.isArray(value) ? value : {};

  return {
    projectName: asText(source.projectName),
    industry: asText(source.industry),
    safetyImpact: asEnum(source.safetyImpact, IMPACT_LEVELS),
    environmentalImpact: asEnum(source.environmentalImpact, IMPACT_LEVELS),
    productionImpact: asEnum(source.productionImpact, IMPACT_LEVELS),
    qualityImpact: asEnum(source.qualityImpact, IMPACT_LEVELS),
    financialImpact: asEnum(source.financialImpact, IMPACT_LEVELS),
    complianceImpact: asEnum(source.complianceImpact, IMPACT_LEVELS),
    brandImpact: asEnum(source.brandImpact, IMPACT_LEVELS),
    remoteAccessNeed: asEnum(source.remoteAccessNeed, REMOTE_ACCESS_LEVELS),
    thirdPartyAccess: asEnum(source.thirdPartyAccess, THIRD_PARTY_ACCESS_LEVELS),
    itOtIntegration: asEnum(source.itOtIntegration, INTEGRATION_LEVELS),
    networkSegmentationMaturity: asEnum(source.networkSegmentationMaturity, MATURITY_LEVELS),
    identityMaturity: asEnum(source.identityMaturity, MATURITY_LEVELS),
    loggingMaturity: asEnum(source.loggingMaturity, MATURITY_LEVELS),
    patchMaturity: asEnum(source.patchMaturity, MATURITY_LEVELS),
    maintenanceWindow: asText(source.maintenanceWindow),
    upgradeWindow: asText(source.upgradeWindow),
    remoteOperationsOwnership: asEnum(source.remoteOperationsOwnership, REMOTE_OWNERSHIP),
    acceptancePreference: asEnum(source.acceptancePreference, ACCEPTANCE_PREFERENCE),
    criticalAssets: asStringArray(source.criticalAssets),
    keySystems: asText(source.keySystems),
    externalConnections: asText(source.externalConnections),
    maintenanceAccessPath: asText(source.maintenanceAccessPath),
    initialBoundaryNotes: asText(source.initialBoundaryNotes),
    continuityRequirements: asText(source.continuityRequirements),
    complianceNotes: asText(source.complianceNotes)
  };
}

export function hasOwnerAssessmentContent(value) {
  const normalized = normalizeOwnerAssessment(value);
  return Boolean(
    normalized.projectName
    || normalized.industry
    || normalized.criticalAssets.length
    || normalized.keySystems
    || normalized.externalConnections
  );
}
