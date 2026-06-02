import { getCapabilityDisplay } from './capabilities.js';
import { createDisclaimerPayload } from './disclaimer.js';
import { MATCH_STATUSES } from './matchStatuses.js';
import { buildCommunicationMatrix } from '../utils/planningEngine.js';

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function asText(value, fallback = '') {
  return typeof value === 'string' ? value : fallback;
}

export function createOwnerDeliverables({ assessment, riskProfile }) {
  const riskConcernSummary = asArray(riskProfile?.riskConcernSummary).map((item, index) => ({
    id: item.id || `risk-${index + 1}`,
    title: item.title || `风险关注 ${index + 1}`,
    summary: item.summary || '',
    level: item.level || 'medium'
  }));

  const integratorRequirements = asArray(riskProfile?.ownerRequirements).map((item, index) => ({
    id: typeof item === 'object' ? (item.id || item.concernId || `req-${index + 1}`) : `req-${index + 1}`,
    title: `需求 ${index + 1}`,
    summary: typeof item === 'object' ? (item.text || item.summary || '') : item,
    level: typeof item === 'object' ? (item.priority || 'medium') : 'medium'
  }));

  const procurementFocus = asArray(riskProfile?.explanations).map((item, index) => ({
    id: `control-${index + 1}`,
    title: item.controlObjective || `控制目标 ${index + 1}`,
    summary: `重点核对 ${asArray(item.capabilityNeeds).map((capabilityId) => getCapabilityDisplay(capabilityId).label).join('、') || '相关能力'} 的满足方式与证据边界。`,
    level: asArray(item.capabilityNeeds).length >= 3 ? 'high' : 'medium'
  }));

  const acceptanceFocus = asArray(riskProfile?.acceptanceFocus).map((item, index) => ({
    id: `acceptance-${index + 1}`,
    title: `验收关注点 ${index + 1}`,
    summary: typeof item === 'object' ? (item.summary || item.text || '') : item,
    level: 'medium'
  }));

  return {
    audience: 'owner',
    type: 'owner-summary',
    generatedAt: new Date().toISOString(),
    summary: {
      projectName: assessment?.projectName || '未命名项目',
      headline: riskConcernSummary[0]?.summary || '已形成业主输入摘要。',
      recommendedTarget: asArray(riskProfile?.targetLevelCandidates)[0]?.level ? `SL-${asArray(riskProfile?.targetLevelCandidates)[0].level}` : ''
    },
    sections: [
      { id: 'risk-concern-summary', title: '风险关注摘要', items: riskConcernSummary },
      { id: 'integrator-requirements', title: '设计响应需求摘要', items: integratorRequirements },
      { id: 'procurement-focus', title: '对采购关注点', items: procurementFocus },
      { id: 'acceptance-focus', title: '验收关注点清单', items: acceptanceFocus }
    ],
    disclaimer: createDisclaimerPayload(),
    traceability: asArray(riskProfile?.explanations)
  };
}

export function createIntegratorDeliverables({ projectMeta, riskProfile, plan }) {
  const communicationMatrix = plan?.communicationMatrix || buildCommunicationMatrix(plan || null);

  return {
    audience: 'integrator',
    type: 'integrator-draft',
    generatedAt: new Date().toISOString(),
    summary: {
      projectName: projectMeta?.projectName || '未命名项目',
      headline: `建议目标等级 SL${plan?.targetSL || '-'}，当前已规划 ${asArray(plan?.zones).length} 个 Zone。`
    },
    sections: [
      { id: 'zones', title: 'Zone 划分建议', items: asArray(plan?.zones).map((item) => ({ id: item, title: item, summary: '纳入项目安全设计范围。' })) },
      { id: 'assets', title: '资产归组', items: asArray(plan?.assets).map((item) => ({ id: item.id, title: item.name, summary: `${item.zone || '未分区'} / ${item.role || '未分类'} / ${item.groupingReason || '未填写归组原因'}` })) },
      { id: 'flows', title: '通信矩阵', items: communicationMatrix.complete ? asArray(communicationMatrix.rows).map((item) => ({ id: item.id, title: `${item.sourceName} → ${item.targetName}`, summary: `${item.protocol} / ${item.businessReason}` })) : [{ id: 'missing-flow', title: '通信矩阵未完整生成', summary: '需先补齐源/目的/协议/业务理由。' }] },
      { id: 'requirements', title: '项目能力需求矩阵', items: asArray(plan?.capabilityRequirements).map((item) => ({ id: `${item.capabilityId}-${item.controlObjective}`, title: getCapabilityDisplay(item.capabilityId).label, summary: `${getCapabilityDisplay(item.capabilityId).frText} / ${getCapabilityDisplay(item.capabilityId).srText} / ${item.controlObjective} / ${asArray(item.sourceFR).join('、')} / SL${item.targetSL ?? '-'}` })) }
    ],
    disclaimer: createDisclaimerPayload(),
    traceability: asArray(riskProfile?.explanations)
  };
}

export function createVendorDeliverables({ capabilities = [], matchResults }) {
  const latest = asArray(capabilities)[asArray(capabilities).length - 1];
  const resultRows = asArray(matchResults?.results);
  const breakdown = {
    native: resultRows.filter((item) => item.status === 'native').length,
    configured: resultRows.filter((item) => item.status === 'configured').length,
    external: resultRows.filter((item) => item.status === 'external').length,
    compensating: resultRows.filter((item) => item.status === 'compensating').length,
    missing: resultRows.filter((item) => item.status === 'missing').length
  };

  return {
    audience: 'vendor',
    type: 'vendor-capability',
    generatedAt: new Date().toISOString(),
    summary: {
      projectName: latest?.productMeta?.productName || '未命名产品',
      headline: resultRows.length ? `已形成 ${resultRows.length} 条项目匹配结果。` : '当前仅完成能力声明，尚未形成项目匹配结论。'
    },
    sections: [
      { id: 'product', title: '产品基本信息', items: latest ? [{ id: 'meta', title: latest.productMeta.productName, summary: `${latest.productMeta.productType || '未分类'} / SL${latest.productMeta.securityLevel || '-'} / ${latest.productMeta.useCases || '未填写适用场景'}` }] : [] },
      { id: 'claims', title: '能力声明', items: asArray(latest?.capabilityClaims).map((item) => ({ id: item.capabilityId, title: getCapabilityDisplay(item.capabilityId).label, summary: `${getCapabilityDisplay(item.capabilityId).frText} / ${getCapabilityDisplay(item.capabilityId).srText} / ${MATCH_STATUSES[item.satisfaction]?.label || item.satisfaction} / 证据：${item.evidenceType || '无'} / 依赖：${item.dependencyNote || item.dependency || '无'}` })) },
      { id: 'dependencies', title: '前置依赖与限制', items: [{ id: 'deps', title: '统一依赖', summary: latest?.dependencies || '无统一依赖说明' }, { id: 'limits', title: '已知边界', summary: latest?.limitations || '无已知不适配边界说明' }] },
      { id: 'match', title: '项目匹配摘要', items: resultRows.length ? [
        { id: 'native', title: '原生满足', summary: String(breakdown.native) },
        { id: 'configured', title: '配置后满足', summary: String(breakdown.configured) },
        { id: 'external', title: '依赖外围控制满足', summary: String(breakdown.external) },
        { id: 'compensating', title: '补偿措施后可接受', summary: String(breakdown.compensating) },
        { id: 'missing', title: '不满足', summary: String(breakdown.missing) }
      ] : [] }
    ],
    disclaimer: createDisclaimerPayload(),
    traceability: resultRows
  };
}

export function createAcceptanceDeliverable({ plan, riskProfile, gapClosureItems = [] }) {
  return {
    audience: 'acceptance',
    type: 'acceptance-checklist',
    generatedAt: new Date().toISOString(),
    summary: {
      projectName: asText(plan?.designBasisSummary?.designBasis, '验收检查表'),
      headline: '面向验收阶段的检查项与风险保留说明。'
    },
    sections: [
      { id: 'acceptance-focus', title: '验收关注点', items: asArray(riskProfile?.acceptanceFocus).map((item, index) => ({ id: `accept-${index}`, title: `关注点 ${index + 1}`, summary: typeof item === 'object' ? (item.summary || item.text || '') : item })) },
      { id: 'residual-risks', title: '风险保留与补偿措施清单', items: asArray(gapClosureItems).map((item, index) => ({ id: item.id || `risk-${index}`, title: getCapabilityDisplay(item.capabilityId).label, summary: `补偿：${item.mitigation || '未填写'}；残余风险：${item.residualRisk || '未填写'}；责任方：${item.owner || '未填写'}` })) }
    ],
    disclaimer: createDisclaimerPayload(),
    traceability: asArray(riskProfile?.explanations)
  };
}
