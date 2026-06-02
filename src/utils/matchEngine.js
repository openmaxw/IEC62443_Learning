import { MATCH_STATUSES } from '../data/matchStatuses';

function classifyClaimStatus(claim, requirement) {
  if (!claim || claim.satisfaction === 'missing') return MATCH_STATUSES.missing.id;

  if (claim.satisfaction === MATCH_STATUSES.native.id && claim.securityLevel >= requirement.targetSL) {
    return MATCH_STATUSES.native.id;
  }

  if (claim.satisfaction === MATCH_STATUSES.configured.id && claim.securityLevel >= Math.max(1, requirement.targetSL - 1)) {
    return MATCH_STATUSES.configured.id;
  }

  if (claim.satisfaction === MATCH_STATUSES.external.id) {
    return MATCH_STATUSES.external.id;
  }

  if (claim.satisfaction === MATCH_STATUSES.compensating.id) {
    return MATCH_STATUSES.compensating.id;
  }

  return MATCH_STATUSES.missing.id;
}

function buildRecommendation(score) {
  if (score >= 85) return { level: 'excellent', label: '强烈推荐', description: '原生满足度较高，可优先纳入候选。' };
  if (score >= 65) return { level: 'good', label: '推荐', description: '整体满足度较好，但仍需确认配置或外围依赖。' };
  if (score >= 45) return { level: 'warning', label: '有条件推荐', description: '存在明显差距，需要补偿措施或外围控制支持。' };
  return { level: 'danger', label: '不推荐', description: '关键需求缺口较多，不建议直接选型。' };
}

export function performMatching(integratorPlan, vendorCapabilities = []) {
  const requirements = integratorPlan?.capabilityRequirements || [];

  const results = vendorCapabilities.map((vendor) => {
    const claims = vendor.capabilityClaims || [];

    const details = requirements.map((requirement) => {
      const claim = claims.find((item) => item.capabilityId === requirement.capabilityId);
      const status = classifyClaimStatus(claim, requirement);

      return {
        capabilityId: requirement.capabilityId,
        controlObjective: requirement.controlObjective,
        sourceFR: requirement.sourceFR,
        targetSL: requirement.targetSL,
        status,
        providedBy: claim?.satisfaction || 'none',
        evidenceType: claim?.evidenceType || 'none',
        limitation: claim?.limitation || '',
        dependency: claim?.dependency || ''
      };
    });

    const statusBreakdown = {
      native: details.filter((item) => item.status === 'native').length,
      configured: details.filter((item) => item.status === 'configured').length,
      external: details.filter((item) => item.status === 'external').length,
      compensating: details.filter((item) => item.status === 'compensating').length,
      missing: details.filter((item) => item.status === 'missing').length
    };

    const weightedScore = (
      (statusBreakdown.native * MATCH_STATUSES.native.score) +
      (statusBreakdown.configured * MATCH_STATUSES.configured.score) +
      (statusBreakdown.external * MATCH_STATUSES.external.score) +
      (statusBreakdown.compensating * MATCH_STATUSES.compensating.score)
    );

    const overallScore = requirements.length > 0
      ? Math.round((weightedScore / requirements.length) * 100)
      : 0;

    return {
      vendorId: vendor.id,
      vendorName: vendor.productMeta?.productName || '未命名产品',
      overallScore,
      statusBreakdown,
      matched: details.filter((item) => item.status === 'native'),
      partial: details.filter((item) => item.status === 'configured'),
      external: details.filter((item) => item.status === 'external'),
      compensating: details.filter((item) => item.status === 'compensating'),
      missing: details.filter((item) => item.status === 'missing'),
      recommendations: buildRecommendation(overallScore),
      details,
      capability: vendor
    };
  });

  results.sort((left, right) => right.overallScore - left.overallScore);

  return {
    overallScore: results[0]?.overallScore || 0,
    statusBreakdown: results[0]?.statusBreakdown || { native: 0, configured: 0, external: 0, compensating: 0, missing: 0 },
    matched: results[0]?.matched || [],
    partial: results[0]?.partial || [],
    external: results[0]?.external || [],
    compensating: results[0]?.compensating || [],
    missing: results[0]?.missing || [],
    recommendations: results[0]?.recommendations || buildRecommendation(0),
    results
  };
}
