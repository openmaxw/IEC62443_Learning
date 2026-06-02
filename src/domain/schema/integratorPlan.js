function asText(value) {
  return typeof value === 'string' ? value : '';
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function asObject(value, fallback = {}) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : fallback;
}

function normalizeStringArray(value) {
  return asArray(value).filter((item) => typeof item === 'string');
}

function normalizeAsset(value, index) {
  const source = asObject(value);
  return {
    id: asText(source.id) || `asset-${index + 1}`,
    name: asText(source.name),
    zone: asText(source.zone),
    role: asText(source.role),
    groupingReason: asText(source.groupingReason)
  };
}

function normalizeFlow(value, index) {
  const source = asObject(value);
  return {
    id: asText(source.id) || `flow-${index + 1}`,
    source: asText(source.source),
    target: asText(source.target),
    protocol: asText(source.protocol),
    direction: asText(source.direction),
    necessity: asText(source.necessity),
    businessReason: asText(source.businessReason),
    boundaryControl: asText(source.boundaryControl)
  };
}

function normalizeCapabilityRequirement(value, index) {
  const source = asObject(value);
  return {
    id: asText(source.id) || `capability-${index + 1}`,
    capabilityId: asText(source.capabilityId),
    controlObjective: asText(source.controlObjective),
    implementationHint: asText(source.implementationHint),
    sourceFR: normalizeStringArray(source.sourceFR),
    targetSL: source.targetSL ?? null,
    requirementLevel: asText(source.requirementLevel),
    traceability: {
      inputConditions: normalizeStringArray(source.traceability?.inputConditions),
      riskConcerns: normalizeStringArray(source.traceability?.riskConcerns)
    }
  };
}

function normalizeDesignBasisSummary(value, fallbackDesignBasis = '') {
  const source = asObject(value);
  return {
    keySystems: asText(source.keySystems),
    externalConnections: asText(source.externalConnections),
    maintenanceAccessPath: asText(source.maintenanceAccessPath),
    initialBoundaryNotes: asText(source.initialBoundaryNotes),
    continuityRequirements: asText(source.continuityRequirements),
    designBasis: asText(source.designBasis) || fallbackDesignBasis
  };
}

function normalizeCommunicationMatrix(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return {
    complete: Boolean(value.complete),
    missingFields: normalizeStringArray(value.missingFields),
    rows: asArray(value.rows)
  };
}

export const EMPTY_INTEGRATOR_PLAN = {
  targetSL: null,
  designBasis: '',
  zones: [],
  conduits: [],
  assets: [],
  communicationFlows: [],
  capabilityRequirements: [],
  designBasisSummary: {
    keySystems: '',
    externalConnections: '',
    maintenanceAccessPath: '',
    initialBoundaryNotes: '',
    continuityRequirements: '',
    designBasis: ''
  },
  communicationMatrix: null
};

export function normalizeIntegratorPlan(value) {
  const source = asObject(value, null);
  if (!source) return null;

  const designBasis = asText(source.designBasis);

  return {
    targetSL: source.targetSL ?? null,
    designBasis,
    zones: normalizeStringArray(source.zones),
    conduits: normalizeStringArray(source.conduits),
    assets: asArray(source.assets).map(normalizeAsset),
    communicationFlows: asArray(source.communicationFlows).map(normalizeFlow),
    capabilityRequirements: asArray(source.capabilityRequirements).map(normalizeCapabilityRequirement),
    designBasisSummary: normalizeDesignBasisSummary(source.designBasisSummary, designBasis),
    communicationMatrix: normalizeCommunicationMatrix(source.communicationMatrix)
  };
}
