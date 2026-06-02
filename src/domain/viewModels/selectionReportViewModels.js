import { getCapabilityDisplay } from '../../data/capabilities.js';
import { getIecMappingByCapability } from '../../data/iec62443Mappings.js';

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

const LEGACY_CAPABILITY_ID_MAP = {
  'identity-authentication': 'auth-password',
  'identity-session-control': 'auth-session',
  'identity-rbac': 'access-rbac',
  'boundary-firewall': 'access-policy',
  'boundary-allowlist': 'access-whitelist',
  'boundary-remote-access-gateway': 'access-privilege',
  'integrity-signed-update': 'integrity-firmware',
  'integrity-config-protection': 'integrity-crypto',
  'confidentiality-encryption': 'encryption-tls',
  'confidentiality-key-management': 'encryption-key',
  'monitoring-security-log': 'logging-event',
  'monitoring-alerting': 'logging-alarm',
  'monitoring-audit-export': 'audit-report',
  'resilience-backup-restore': 'integrity-crc',
  'resilience-redundancy': 'audit-compliance'
};

export function normalizeSelectionCapabilityId(capabilityId) {
  return LEGACY_CAPABILITY_ID_MAP[capabilityId] || capabilityId;
}

export function normalizeSelectionStatus(value, implementationType) {
  if (value === 'fulfilled') return implementationType === 'external' || implementationType === 'shared' ? 'external' : 'native';
  if (value === 'partial') return 'configured';
  if (value === 'native' && (implementationType === 'external' || implementationType === 'shared')) return 'external';
  return value || 'missing';
}

function isGapStatus(status) {
  return status === 'missing' || status === 'external' || status === 'configured' || status === 'compensating';
}

function hasSavedClosure(item) {
  return Boolean(item?.saved && item?.mitigation && item?.owner && item?.acceptanceImpact && item?.residualRisk);
}

function hasPersistedClosure(item) {
  return Boolean(item?.mitigation && item?.owner && item?.acceptanceImpact && item?.residualRisk);
}

function buildSelectionResults(plan, latestCapability) {
  const requirements = asArray(plan?.capabilityRequirements);
  const claimMap = new Map(asArray(latestCapability?.capabilityClaims).map((item) => [normalizeSelectionCapabilityId(item.capabilityId), item]));
  const rows = requirements.map((requirement) => {
    const capabilityId = normalizeSelectionCapabilityId(requirement.capabilityId);
    const claim = claimMap.get(capabilityId);
    const status = normalizeSelectionStatus(claim?.satisfaction, claim?.implementationType);
    const severity = status === 'missing' ? 'high' : status === 'external' || status === 'compensating' || status === 'configured' ? 'medium' : 'low';
    return {
      id: requirement.id,
      capabilityId,
      controlObjective: requirement.controlObjective,
      status,
      evidenceType: claim?.evidenceType || '未填写',
      gapNote: status === 'missing' ? '当前未形成可接受实现路径。' : status === 'external' ? '需通过外围系统或边界控制共同实现。' : status === 'compensating' ? '需通过补偿措施降低风险后接受。' : status === 'configured' ? '需启用配置、授权或实施条件后满足。' : '当前可满足项目要求。',
      severity,
      owner: status === 'external' ? '集成商/业主' : status === 'missing' ? '设备商/集成商' : '设备商'
    };
  });

  return {
    rows,
    summary: {
      high: rows.filter((item) => item.severity === 'high').length,
      medium: rows.filter((item) => item.severity === 'medium').length,
      low: rows.filter((item) => item.severity === 'low').length
    }
  };
}

function buildGapItems(selectionRows, savedItems = []) {
  const rows = asArray(selectionRows).filter((item) => isGapStatus(item.status));
  const savedMap = new Map(asArray(savedItems).map((item) => [item.id, item]));
  return rows.map((item) => {
    const saved = savedMap.get(item.id);
    return {
      ...item,
      mitigation: saved?.mitigation || (item.status === 'missing'
        ? '建议更换设备、调整架构或补充外围控制后再评估。'
        : item.status === 'external'
          ? '建议由边界防护、跳板、日志平台或集中身份管理进行补偿。'
          : item.status === 'compensating'
            ? '建议明确补偿控制、责任边界和残余风险接受条件。'
            : '建议通过配置加固、功能启用或实施条件补齐后关闭差距。'),
      acceptanceImpact: saved?.acceptanceImpact || (item.severity === 'high' ? '高，可能影响验收' : '中，需在验收前确认关闭路径'),
      residualRisk: saved?.residualRisk || (item.severity === 'high' ? '建议纳入残余风险登记' : '建议视补偿措施有效性决定是否登记'),
      owner: saved?.owner || item.owner,
      saved: Boolean(saved && hasPersistedClosure(saved))
    };
  });
}

export function getSelectionViewModel({ projectMeta, plan, capabilities, gapClosureItems }) {
  const latestCapability = asArray(capabilities)[asArray(capabilities).length - 1] || null;
  const selection = buildSelectionResults(plan, latestCapability);
  const gapItems = buildGapItems(selection.rows, gapClosureItems);
  const closedCount = gapItems.filter(hasSavedClosure).length;
  const pendingGapItems = gapItems.filter((item) => !hasSavedClosure(item));

  return {
    projectName: projectMeta?.projectName || '',
    latestCapability,
    selection,
    gapItems,
    closedCount,
    statusSummary: {
      title: pendingGapItems.length ? '当前处置重点' : '当前处置状态',
      headline: pendingGapItems.length ? `仍有 ${pendingGapItems.length} 项差距待处置` : (gapItems.length ? '差距项已完成处置记录' : '当前没有待处置差距项'),
      detail: pendingGapItems.length ? `${pendingGapItems.filter((item) => item.severity === 'high').length} 项为高严重度，请优先补充措施、责任与验收影响。` : '可进入交付摘要或继续复核匹配结果。',
      pills: [`高严重度 ${pendingGapItems.filter((item) => item.severity === 'high').length}`, `已处置 ${closedCount}/${gapItems.length || 0}`]
    }
  };
}

export function getReportCenterViewModel({ projectMeta, riskProfile, plan, capabilities, matchResults, gapClosureItems }) {
  const latestCapability = asArray(capabilities)[asArray(capabilities).length - 1] || null;
  const liveSelection = buildSelectionResults(plan, latestCapability);
  const gapRows = liveSelection.rows.filter((item) => isGapStatus(item.status));
  const savedClosureMap = new Map(asArray(gapClosureItems).map((item) => [item.id, item]));
  const pendingGapRows = gapRows.filter((item) => !hasPersistedClosure(savedClosureMap.get(item.id)));
  const gapClosureReady = pendingGapRows.length === 0;
  const highRiskCount = asArray(gapClosureItems).filter((item) => item.severity === 'high').length;
  const externalCount = asArray(gapClosureItems).filter((item) => item.status === 'external').length;
  const mappingRows = asArray(plan?.capabilityRequirements)
    .map((item) => ({ requirement: item, display: getCapabilityDisplay(item.capabilityId), mapping: getIecMappingByCapability(item.capabilityId) }))
    .filter((item) => item.mapping);

  const items = [
    { title: '项目输入摘要', ready: Boolean(riskProfile), desc: '查看需求澄清摘要与标准化项目输入。', route: '/owner/result?review=1' },
    { title: '设计响应摘要', ready: Boolean(plan), desc: '查看 Zone / Conduit、通信响应与能力需求。', route: '/integrator/result?review=1' },
    { title: '能力声明摘要', ready: Boolean(latestCapability), desc: '查看产品能力声明摘要。', route: '/vendor/result?review=1' },
    { title: '匹配闭环', ready: Boolean(asArray(matchResults?.results).length || liveSelection.rows.length) && gapClosureReady, desc: gapRows.length ? '查看差距项、补偿措施、责任方、验收影响与残余风险。' : '当前没有待处置差距项。', route: '/selection' },
    { title: '需求追溯链', ready: Boolean(riskProfile && plan), desc: '查看从项目输入到能力/差距的追溯。', route: '/translation-center' }
  ];

  return {
    projectName: projectMeta?.projectName || '',
    items,
    gapRows,
    gapClosureReady,
    highRiskCount,
    externalCount,
    statusSummary: {
      title: gapClosureReady ? '交付判断' : '当前交付阻塞',
      headline: gapClosureReady ? '主要交付项已具备' : `仍有 ${pendingGapRows.length} 项差距影响交付完整度`,
      detail: gapClosureReady ? '可集中查看和导出阶段成果。' : '请先完成闭环措施、责任方、验收影响与残余风险补充。',
      pills: [`高严重度 ${highRiskCount}`, `外部补偿 ${externalCount}`]
    },
    gapClosureItems: asArray(gapClosureItems).map((item) => ({
      ...item,
      display: getCapabilityDisplay(item.capabilityId)
    })),
    mappingRows,
    reportPayload: {
      projectMeta,
      riskProfile,
      plan,
      latestCapability,
      gapClosureItems: asArray(gapClosureItems),
      mappingRows
    }
  };
}
