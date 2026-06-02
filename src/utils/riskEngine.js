import {
  DRIVER_DEFINITIONS,
  OWNER_TO_CONCERNS,
  RISK_CONCERNS,
  FR_CATEGORIES,
  TARGET_LEVEL_CANDIDATES,
  CONTROL_OBJECTIVES,
  BUSINESS_IMPACT_GUIDANCE,
  SECURITY_LEVELS,
  DISCLAIMER
} from '../data/rules.js';
import { UNIFIED_DISCLAIMER } from '../data/disclaimer';

function normalizeValue(field, value) {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  const definition = DRIVER_DEFINITIONS[field];
  if (!definition) return value;
  return Object.prototype.hasOwnProperty.call(definition.values, value) ? value : null;
}

export function collectDrivers(assessment = {}) {
  return Object.entries(DRIVER_DEFINITIONS)
    .map(([key, definition]) => {
      const normalizedValue = normalizeValue(key, assessment[key]);
      if (!normalizedValue) return null;

      return {
        key,
        label: definition.label,
        value: normalizedValue,
        score: definition.values[normalizedValue]
      };
    })
    .filter(Boolean)
    .sort((left, right) => right.score - left.score);
}

export function deriveRiskConcerns(drivers = []) {
  const concernMap = new Map();

  drivers.forEach((driver) => {
    const linkedConcerns = OWNER_TO_CONCERNS[driver.key] || [];
    linkedConcerns.forEach((concernId) => {
      const baseConcern = RISK_CONCERNS[concernId];
      if (!baseConcern) return;

      const existing = concernMap.get(concernId) || {
        ...baseConcern,
        score: 0,
        drivers: []
      };

      existing.score += driver.score;
      existing.drivers.push({
        key: driver.key,
        label: driver.label,
        value: driver.value,
        score: driver.score
      });

      concernMap.set(concernId, existing);
    });
  });

  return Array.from(concernMap.values())
    .sort((left, right) => right.score - left.score)
    .map((concern) => ({
      ...concern,
      level: concern.score >= 7 ? 'high' : concern.score >= 4 ? 'medium' : 'baseline'
    }));
}

export function deriveFRFocus(riskConcerns = []) {
  const frMap = new Map();

  riskConcerns.forEach((concern) => {
    concern.fr.forEach((frCode) => {
      const existing = frMap.get(frCode) || {
        code: frCode,
        ...FR_CATEGORIES[frCode],
        score: 0,
        sources: []
      };

      existing.score += concern.score;
      existing.sources.push({
        concernId: concern.id,
        concernTitle: concern.title,
        level: concern.level
      });

      frMap.set(frCode, existing);
    });
  });

  return Array.from(frMap.values()).sort((left, right) => right.score - left.score);
}

export function recommendTargetLevels(drivers = [], riskConcerns = []) {
  const totalDriverScore = drivers.reduce((sum, item) => sum + item.score, 0);
  const highConcernCount = riskConcerns.filter((item) => item.level === 'high').length;

  let recommendedMin = 1;
  let recommendedMax = 2;
  let rationale = '当前场景以基础防护和分段控制为主，建议从 SL1-SL2 起步。';

  if (totalDriverScore >= 18 || highConcernCount >= 3) {
    recommendedMin = 3;
    recommendedMax = 4;
    rationale = '当前场景具有较高后果或较高暴露面，建议以 SL3 为主，并评估是否存在需要提高到 SL4 的关键区域。';
  } else if (totalDriverScore >= 10 || highConcernCount >= 1) {
    recommendedMin = 2;
    recommendedMax = 3;
    rationale = '当前场景存在明显的远程接入、第三方接入或高连续性要求，建议以 SL2 为基础，并对重点区域评估 SL3。';
  }

  return {
    recommendedMin,
    recommendedMax,
    rationale,
    candidates: TARGET_LEVEL_CANDIDATES.filter((candidate) => (
      candidate.level >= recommendedMin && candidate.level <= recommendedMax
    )).map((candidate) => ({
      ...candidate,
      ...SECURITY_LEVELS[`SL${candidate.level}`]
    }))
  };
}

export function deriveControlObjectives(frFocus = []) {
  return Object.values(CONTROL_OBJECTIVES)
    .map((objective) => {
      const matchedFR = frFocus.filter((fr) => objective.fr.includes(fr.code));
      if (matchedFR.length === 0) return null;

      return {
        ...objective,
        priority: matchedFR.reduce((sum, fr) => sum + fr.score, 0),
        matchedFR: matchedFR.map((fr) => fr.code)
      };
    })
    .filter(Boolean)
    .sort((left, right) => right.priority - left.priority);
}

function buildConcernSummary(riskConcerns = []) {
  return riskConcerns.slice(0, 3).map((concern) => ({
    id: concern.id,
    title: concern.title,
    level: concern.level,
    summary: concern.description
  }));
}

function buildOwnerRequirements(riskConcerns = [], targetLevels) {
  const recommendations = [];

  riskConcerns.forEach((concern) => {
    const guidance = BUSINESS_IMPACT_GUIDANCE[concern.id] || [];
    guidance.forEach((item) => {
      recommendations.push({
        concernId: concern.id,
        priority: concern.level,
        text: item
      });
    });
  });

  recommendations.push({
    concernId: 'target-level',
    priority: targetLevels.recommendedMax >= 3 ? 'high' : 'medium',
    text: `向设计响应方明确提出“重点区域目标安全等级建议位于 SL${targetLevels.recommendedMin}-SL${targetLevels.recommendedMax} 区间”的设计要求。`
  });

  return recommendations;
}

function buildAcceptanceFocus(assessment = {}, frFocus = []) {
  const items = [
    '关键远程访问路径应具备身份鉴别、审批与留痕机制。',
    '关键跨区通信应具备明确业务理由、方向限制和边界控制。'
  ];

  if (assessment.acceptancePreference === 'security-first') {
    items.push('验收时优先检查日志、审计、账户边界和配置变更控制。');
  }

  if (assessment.acceptancePreference === 'operations-first') {
    items.push('验收时应同时确认运维窗口、恢复路径和变更执行可操作性。');
  }

  if (frFocus.some((item) => item.code === 'FR7')) {
    items.push('针对高连续性资产，应检查备份恢复、冗余或故障处置预案。');
  }

  return items;
}

function buildExplanations(drivers = [], riskConcerns = [], controlObjectives = []) {
  return controlObjectives.map((objective) => ({
    controlObjective: objective.title,
    inputConditions: drivers
      .filter((driver) => objective.matchedFR.some((frCode) => {
        const linkedConcernIds = OWNER_TO_CONCERNS[driver.key] || [];
        return linkedConcernIds.some((concernId) => {
          const concern = riskConcerns.find((item) => item.id === concernId);
          return concern?.fr.includes(frCode);
        });
      }))
      .map((driver) => `${driver.label}: ${driver.value}`),
    riskConcerns: riskConcerns
      .filter((concern) => objective.matchedFR.some((frCode) => concern.fr.includes(frCode)))
      .map((concern) => concern.title),
    fr: objective.matchedFR,
    systemControls: [objective.title],
    capabilityNeeds: objective.capabilities
  }));
}

export function generateRiskProfile(assessment = {}) {
  const drivers = collectDrivers(assessment);
  const riskConcerns = deriveRiskConcerns(drivers);
  const frFocus = deriveFRFocus(riskConcerns);
  const targetLevels = recommendTargetLevels(drivers, riskConcerns);
  const controlObjectives = deriveControlObjectives(frFocus);
  const ownerRequirements = buildOwnerRequirements(riskConcerns, targetLevels);
  const acceptanceFocus = buildAcceptanceFocus(assessment, frFocus);
  const explanations = buildExplanations(drivers, riskConcerns, controlObjectives);

  return {
    generatedAt: new Date().toISOString(),
    disclaimer: UNIFIED_DISCLAIMER || DISCLAIMER,
    drivers,
    riskConcerns,
    riskConcernSummary: buildConcernSummary(riskConcerns),
    frFocus,
    targetLevelCandidates: targetLevels.candidates,
    targetLevelRange: {
      min: targetLevels.recommendedMin,
      max: targetLevels.recommendedMax,
      rationale: targetLevels.rationale
    },
    controlObjectives,
    ownerRequirements,
    acceptanceFocus,
    explanations,
    summary: {
      title: `${assessment.projectName || '当前项目'} 风险转译结果`,
      description: `系统已根据业务后果、暴露面和现状成熟度生成风险关注画像，建议重点关注 ${riskConcerns.slice(0, 2).map((item) => item.title).join('、') || '基础分段与访问控制'}。`,
      recommendedTarget: `建议重点区域按 SL${targetLevels.recommendedMin}-SL${targetLevels.recommendedMax} 进行目标等级评估。`
    }
  };
}

export function recommendSecurityLevelFromProfile(profile) {
  return profile?.targetLevelCandidates || [];
}
