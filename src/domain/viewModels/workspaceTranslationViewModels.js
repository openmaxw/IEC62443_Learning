import { getCapabilityDisplay } from '../../data/capabilities.js';
import { MATCH_STATUSES } from '../../data/matchStatuses.js';
import { normalizeSelectionCapabilityId, normalizeSelectionStatus } from './selectionReportViewModels.js';

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function textOrFallback(value, fallback = '未填写') {
  return value || fallback;
}

function joinList(values, fallback = '无') {
  const list = asArray(values).filter(Boolean);
  return list.length ? list.join('、') : fallback;
}

function isSavedClosure(item) {
  return Boolean(item?.mitigation && item?.owner && item?.acceptanceImpact && item?.residualRisk);
}

function isGapStatus(status) {
  return status === 'missing' || status === 'external' || status === 'configured' || status === 'compensating' || status === 'partial';
}

function findLatestMatchDetail(matchResults, capabilityId) {
  const normalizedId = normalizeSelectionCapabilityId(capabilityId);
  const rankedResult = asArray(matchResults?.results)[0];
  const detail = asArray(rankedResult?.details).find((item) => normalizeSelectionCapabilityId(item.capabilityId) === normalizedId);
  if (detail) return { ...detail, status: normalizeSelectionStatus(detail.status || detail.providedBy, detail.implementationType) };

  const legacyRow = asArray(matchResults?.results).find((item) => normalizeSelectionCapabilityId(item.capabilityId) === normalizedId);
  if (!legacyRow) return null;
  return { ...legacyRow, status: normalizeSelectionStatus(legacyRow.status, legacyRow.implementationType) };
}

function buildMatrixRows({ assessment, riskProfile, plan, matchResults, gapClosureItems }) {
  const requirements = asArray(plan?.capabilityRequirements);
  const fallbackRisks = asArray(riskProfile?.riskConcernSummary).map((item) => item.title);
  const fallbackInputs = [
    assessment?.keySystems ? `关键系统：${assessment.keySystems}` : '',
    assessment?.externalConnections ? `外部连接：${assessment.externalConnections}` : '',
    assessment?.maintenanceAccessPath ? `维护接入：${assessment.maintenanceAccessPath}` : '',
    assessment?.continuityRequirements ? `连续性：${assessment.continuityRequirements}` : ''
  ].filter(Boolean);

  return requirements.map((requirement, index) => {
    const display = getCapabilityDisplay(requirement.capabilityId);
    const matchDetail = findLatestMatchDetail(matchResults, requirement.capabilityId);
    const savedClosure = asArray(gapClosureItems).find((item) => item.id === requirement.id);
    const rawStatus = matchDetail?.status || 'missing';
    const status = isSavedClosure(savedClosure) && rawStatus !== 'native' ? 'closed' : rawStatus;
    const statusMeta = status === 'closed' ? { label: '已处置', badge: 'success', description: '差距已记录补偿措施、责任方、验收影响与残余风险。' } : (MATCH_STATUSES[status] || MATCH_STATUSES.missing);
    const traceability = requirement.traceability || {};

    return {
      id: requirement.id || `${requirement.capabilityId}-${index}`,
      projectInput: joinList(traceability.inputConditions, fallbackInputs.length ? fallbackInputs.join('；') : '未形成明确输入'),
      riskConcern: joinList(traceability.riskConcerns, fallbackRisks.length ? fallbackRisks.join('、') : '无明确风险关注'),
      designResponse: requirement.controlObjective || '未形成控制目标',
      capabilityNeed: display.label,
      standardRef: [display.frText, display.srText].filter(Boolean).join(' / ') || joinList(requirement.sourceFR),
      targetSL: requirement.targetSL ? `SL-${requirement.targetSL}` : '未填写',
      implementationHint: requirement.implementationHint || '未填写',
      matchStatus: statusMeta.label,
      matchTone: statusMeta.badge,
      evidenceType: matchDetail?.evidenceType && matchDetail.evidenceType !== 'none' ? matchDetail.evidenceType : '未提供',
      gapNote: savedClosure?.mitigation || matchDetail?.gapNote || statusMeta.description || '未形成匹配说明'
    };
  });
}

export function getTranslationCenterViewModel({ projectMeta, assessment, riskProfile, plan, capabilities, matchResults, gapClosureItems }) {
  const latestCapability = asArray(capabilities)[asArray(capabilities).length - 1] || null;
  const allGapItems = asArray(matchResults?.results).filter((item) => isGapStatus(item.status));
  const pendingGapItems = allGapItems.filter((item) => !isSavedClosure(asArray(gapClosureItems).find((closure) => closure.id === item.id)));
  const matrixRows = buildMatrixRows({ assessment, riskProfile, plan, matchResults, gapClosureItems });

  return {
    projectName: projectMeta?.projectName || '',
    projectDescription: [projectMeta?.organizationName, projectMeta?.siteName, projectMeta?.industry, projectMeta?.scenarioType].filter(Boolean).join(' / '),
    summary: {
      requirementCount: asArray(plan?.capabilityRequirements).length,
      gapCount: allGapItems.length,
      pendingGapCount: pendingGapItems.length,
      matrixCount: matrixRows.length
    },
    owner: {
      criticalAssets: joinList(assessment?.criticalAssets, '未填写'),
      keySystems: textOrFallback(assessment?.keySystems),
      externalConnections: textOrFallback(assessment?.externalConnections),
      continuityRequirements: textOrFallback(assessment?.continuityRequirements)
    },
    risk: {
      concerns: joinList(asArray(riskProfile?.riskConcernSummary).map((item) => item.title)),
      frFocus: joinList(asArray(riskProfile?.frFocus).map((item) => item.code)),
      targetLevels: joinList(asArray(riskProfile?.targetLevelCandidates).map((item) => `SL-${item.level}`)),
      ownerRequirements: asArray(riskProfile?.ownerRequirements).slice(0, 3).map((item) => item.text || item).join('；') || '无'
    },
    design: {
      zoneConduitSummary: plan ? `${asArray(plan?.zones).length} 个 Zone / ${asArray(plan?.conduits).length} 类 Conduit` : '未形成',
      communicationSummary: plan ? `${asArray(plan?.communicationFlows).length} 条通信流` : '未形成',
      designBasis: plan?.designBasisSummary?.designBasis || '未填写',
      capabilityLabels: asArray(plan?.capabilityRequirements).slice(0, 4).map((item) => getCapabilityDisplay(item.capabilityId).label).join('、') || '无'
    },
    capability: {
      productName: latestCapability?.productMeta?.productName || '未填写',
      claimCount: asArray(latestCapability?.capabilityClaims).length,
      gapCount: allGapItems.length,
      gapLabels: pendingGapItems.length ? pendingGapItems.map((item) => getCapabilityDisplay(item.capabilityId).label).join('、') : '无待处置差距'
    },
    matrixRows
  };
}

export function getIntegratorWorkspaceViewModel({ projectMeta, assessment, riskProfile, plan, draftPlan }) {
  return {
    projectName: projectMeta?.projectName || '',
    hasPrerequisites: Boolean(assessment && riskProfile),
    initialPlan: draftPlan || plan || {
      zones: [],
      conduits: [],
      assets: [],
      communicationFlows: [],
      targetSL: asArray(riskProfile?.targetLevelCandidates)[0]?.level || 2,
      requiredFR: asArray(riskProfile?.frFocus).map((item) => item.code),
      designBasis: ''
    }
  };
}

export function getVendorCapabilityViewModel({ projectMeta, plan, draft, capabilities }) {
  return {
    projectName: projectMeta?.projectName || '',
    plan,
    draft,
    latestCapability: asArray(capabilities)[asArray(capabilities).length - 1] || null,
    capabilityCount: asArray(capabilities).length
  };
}
