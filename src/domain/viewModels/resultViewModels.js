import { INDUSTRIES } from '../../data/industries.js';
import { ACCEPTANCE_PREFERENCE_OPTIONS } from '../../data/enums.js';
import { getCapabilityDisplay } from '../../data/capabilities.js';
import { buildCommunicationMatrix } from '../../utils/planningEngine.js';

const IMPACT_LABEL = { low: '低', medium: '中', high: '高' };
const PRIORITY_LABEL = { high: '高优先级', medium: '中优先级', baseline: '基础要求', low: '低优先级' };
const REQUIREMENT_SOURCE_LABEL = {
  availability: '连续运行与恢复能力',
  remoteAccess: '远程访问与身份边界',
  dataProtection: '敏感数据与配置保护',
  segmentation: '分区分域与受限数据流',
  monitoring: '可见性与事件响应',
  'target-level': '目标安全等级建议'
};
const ASSET_LABELS = {
  plc: 'PLC',
  scada: 'SCADA',
  engineering: '工程师站',
  historian: '历史数据库',
  mes: 'MES / MOM',
  safety: '安全仪表系统',
  network: '工业网络设备',
  remote: '远程接入通道',
  'remote-gateway': '远程接入通道'
};

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function buildIntegratorMatchRows(assessment, plan, communicationMatrix) {
  if (!assessment || !plan) return [];

  const rows = [];

  if (assessment.remoteAccessNeed || assessment.thirdPartyAccess) {
    const remoteLabel = assessment.remoteAccessNeed === 'extensive' ? '广泛远程运维' : assessment.remoteAccessNeed === 'limited' ? '有限远程运维' : '无远程运维';
    const thirdPartyLabel = assessment.thirdPartyAccess === 'regular' ? '频繁第三方接入' : assessment.thirdPartyAccess === 'occasional' ? '偶尔第三方接入' : '无第三方接入';
    const hasStrongResponse = assessment.remoteAccessNeed === 'extensive' || assessment.thirdPartyAccess === 'regular';

    rows.push({
      id: 'remote-access',
      ownerNeed: `${remoteLabel}；${thirdPartyLabel}`,
      designResponse: hasStrongResponse
        ? '设计中单独识别了远程/外部接入边界，并为跨区通信填写了必要性与边界控制建议。'
        : '当前设计按一般外部接入场景考虑，建议继续根据实际远程维护模式细化边界控制。',
      matchLevel: hasStrongResponse ? 'high' : 'partial'
    });
  }

  if (assessment.safetyImpact || assessment.productionImpact) {
    const ownerNeed = `人身安全（${IMPACT_LABEL[assessment.safetyImpact] || '未填写'}）／产能连续性（${IMPACT_LABEL[assessment.productionImpact] || '未填写'}）`;
    const strongConcern = assessment.safetyImpact === 'high' || assessment.productionImpact === 'high';

    rows.push({
      id: 'critical-boundary',
      ownerNeed,
      designResponse: `当前设计形成 ${plan.zones.length} 个 Zone，并梳理 ${plan.communicationFlows.length} 条关键通信流。`,
      matchLevel: strongConcern ? (plan.zones.length > 0 && plan.communicationFlows.length > 0 ? 'high' : 'partial') : 'partial'
    });
  }

  if (assessment.criticalAssets?.length) {
    rows.push({
      id: 'critical-assets',
      ownerNeed: `关键对象：${assessment.criticalAssets.slice(0, 4).map((item) => ASSET_LABELS[item] || item).join('、')}`,
      designResponse: plan.assets.length
        ? `已录入 ${plan.assets.length} 个关键资产/对象，并补充归组原因。`
        : '当前尚未形成明确资产清单，建议先将关键对象映射到设计资产表。',
      matchLevel: plan.assets.length ? 'high' : 'todo'
    });
  }

  rows.push({
    id: 'communication-completeness',
    ownerNeed: '需要把需求转化为可实施、可核对的具体设计输入。',
    designResponse: communicationMatrix.complete
      ? '通信矩阵已完整形成，源区、目标区、协议、必要性和边界控制建议已可追溯。'
      : '通信矩阵尚未完整，仍需补齐源、目标、协议和业务理由。',
    matchLevel: communicationMatrix.complete ? 'high' : 'todo'
  });

  return rows;
}

export function resolveMatchLabel(level) {
  if (level === 'high') return '高匹配';
  if (level === 'partial') return '部分匹配';
  return '待补充';
}

export function getOwnerResultViewModel({ projectMeta, assessment, riskProfile }) {
  const selectedIndustry = INDUSTRIES.find((item) => item.id === projectMeta?.industry) || null;
  const acceptanceOption = ACCEPTANCE_PREFERENCE_OPTIONS.find((item) => item.value === assessment?.acceptancePreference) || null;
  const ownerRequirements = asArray(riskProfile?.ownerRequirements).map((item, index) => (
    typeof item === 'object'
      ? {
          id: `${item.concernId || index}-${index}`,
          text: item.text || '未填写',
          priority: PRIORITY_LABEL[item.priority] || item.priority || '未分级',
          sourceLabel: REQUIREMENT_SOURCE_LABEL[item.concernId] || '设计输入建议'
        }
      : { id: `owner-requirement-${index}`, text: item, priority: '未分级', sourceLabel: '设计输入建议' }
  ));
  const acceptanceFocus = asArray(riskProfile?.acceptanceFocus).map((item, index) => ({
    id: `${item?.id || item?.concernId || index}-${index}`,
    text: typeof item === 'object' ? (item.summary || item.text || '未填写') : item
  }));

  return {
    hasAssessment: Boolean(assessment),
    projectName: projectMeta?.projectName || '',
    industryName: selectedIndustry?.name || '未填写',
    siteName: projectMeta?.siteName || '未填写',
    projectObjective: projectMeta?.projectObjective || '未填写',
    ownerRequirements,
    acceptanceFocus,
    acceptancePreferenceLabel: acceptanceOption?.label || '未填写',
    criticalAssets: asArray(assessment?.criticalAssets).map((item) => ({ id: item, label: ASSET_LABELS[item] || item })),
    assessment: assessment || null,
    summary: {
      designInputCount: ownerRequirements.length,
      criticalAssetCount: asArray(assessment?.criticalAssets).length,
      acceptanceFocusCount: acceptanceFocus.length
    },
    statusSummary: {
      title: ownerRequirements.length ? '当前交接判断' : '当前待补充项',
      headline: ownerRequirements.length ? '已具备进入设计响应的基础输入' : '仍需补充可转化为设计的明确输入',
      detail: ownerRequirements.length ? '建议进入设计响应阶段，继续把项目输入转化为分区、通信与能力需求。' : '请先补齐关键系统、外部连接、连续性要求与验收关注点。',
      pills: [`设计输入 ${ownerRequirements.length}`, `验收关注 ${acceptanceFocus.length}`]
    }
  };
}

export function getIntegratorResultViewModel({ projectMeta, assessment, plan }) {
  const communicationMatrix = plan ? (plan.communicationMatrix || buildCommunicationMatrix(plan)) : { complete: false, rows: [], missingFields: [] };
  const matchRows = buildIntegratorMatchRows(assessment, plan, communicationMatrix);

  return {
    hasPlan: Boolean(plan),
    projectName: projectMeta?.projectName || '',
    targetSL: plan?.targetSL ?? '-',
    communicationMatrix,
    matchRows,
    summary: {
      zoneCount: plan?.zones?.length || 0,
      flowCount: plan?.communicationFlows?.length || 0,
      capabilityCount: plan?.capabilityRequirements?.length || 0,
      assetCount: plan?.assets?.length || 0
    },
    designBasisSummary: plan?.designBasisSummary || null,
    assets: asArray(plan?.assets),
    communicationFlows: asArray(plan?.communicationFlows),
    capabilityRequirements: asArray(plan?.capabilityRequirements).map((item) => ({
      ...item,
      display: getCapabilityDisplay(item.capabilityId)
    })),
    statusSummary: {
      title: communicationMatrix.complete ? '当前设计判断' : '当前待补充项',
      headline: communicationMatrix.complete ? '设计响应已可进入设备能力核对' : '通信矩阵仍未完整，暂不建议直接进入匹配闭环',
      detail: communicationMatrix.complete ? '建议继续核对能力声明与项目能力需求之间的满足情况。' : '请优先补齐源区、目标区、协议、业务理由与边界控制建议。',
      pills: [`Zone ${plan?.zones?.length || 0}`, `能力需求 ${plan?.capabilityRequirements?.length || 0}`]
    }
  };
}
