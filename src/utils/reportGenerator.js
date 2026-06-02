import { UNIFIED_DISCLAIMER } from '../data/disclaimer.js';
import { getCapabilityDisplay } from '../data/capabilities.js';

function safeText(value, fallback = '未填写') {
  if (value === null || value === undefined || value === '') return fallback;
  if (Array.isArray(value)) return value.length ? value.map((item) => safeText(item, fallback)).join('、') : fallback;
  if (typeof value === 'object') return value.text || value.summary || value.title || value.label || JSON.stringify(value);
  return String(value);
}

function ownerRequirementText(item) {
  if (!item || typeof item !== 'object') return safeText(item);
  return [
    item.text || item.summary || item.title,
    item.priority ? `优先级：${item.priority}` : '',
    item.concernId ? `来源：${item.concernId}` : ''
  ].filter(Boolean).join('；');
}

function bulletList(items, fallback = '未形成', mapper = safeText) {
  return Array.isArray(items) && items.length ? items.map((item) => `- ${mapper(item)}`).join('\n') : `- ${fallback}`;
}

function claimStatusLabel(value) {
  const labels = { native: '产品原生满足', fulfilled: '产品原生满足', configured: '配置后满足', partial: '配置后满足', external: '需外部系统共同实现', compensating: '需补偿措施后接受', missing: '当前不满足', na: '不适用' };
  return labels[value] || value || '未填写';
}

function implementationTypeLabel(value) {
  const labels = { product: '产品内置实现', external: '外部系统实现', shared: '产品+系统共同实现' };
  return labels[value] || value || '未填写';
}

function table(rows, headers, mapper) {
  const head = `| ${headers.join(' | ')} |`;
  const split = `| ${headers.map(() => '---').join(' | ')} |`;
  const body = rows.length ? rows.map((row) => `| ${mapper(row).map((cell) => safeText(cell).replace(/\n/g, '<br>')).join(' | ')} |`).join('\n') : `| ${headers.map(() => '—').join(' | ')} |`;
  return [head, split, body].join('\n');
}

export function buildReportMarkdown(report = {}) {
  const projectMeta = report.projectMeta || {};
  const riskProfile = report.riskProfile || {};
  const plan = report.plan || {};
  const latestCapability = report.latestCapability || {};
  const gapClosureItems = Array.isArray(report.gapClosureItems) ? report.gapClosureItems : [];
  const mappingRows = Array.isArray(report.mappingRows) ? report.mappingRows : [];

  return `# IEC 62443 项目交付摘要

## 1. 项目摘要

- 项目名称：${safeText(projectMeta.projectName)}
- 组织名称：${safeText(projectMeta.organizationName)}
- 现场名称：${safeText(projectMeta.siteName)}
- 行业场景：${safeText(projectMeta.industry)}
- 项目目标：${safeText(projectMeta.projectObjective)}

## 2. 项目输入与风险关注

- 目标等级候选：${safeText((riskProfile.targetLevelCandidates || []).map((item) => `SL-${item.level}`))}
- FR 重点：${safeText((riskProfile.frFocus || []).map((item) => item.code))}

### 项目要求
${bulletList(riskProfile.ownerRequirements, '未形成', ownerRequirementText)}

### 验收关注
${bulletList(riskProfile.acceptanceFocus)}

## 3. 设计响应

- 目标 SL：${plan.targetSL ? `SL-${plan.targetSL}` : '未形成'}
- Zone：${safeText(plan.zones)}
- Conduit：${safeText(plan.conduits)}
- 设计依据：${safeText(plan.designBasis)}

### 能力需求
${table(plan.capabilityRequirements || [], ['能力要求', '控制目标', '目标 SL', '实现提示'], (item) => [getCapabilityDisplay(item.capabilityId).label, item.controlObjective, item.targetSL ? `SL-${item.targetSL}` : '未填写', item.implementationHint])}

## 4. 能力声明

- 产品名称：${safeText(latestCapability.productMeta?.productName)}
- 产品类型：${safeText(latestCapability.productMeta?.productType)}
- 部署范围：${safeText(latestCapability.productMeta?.deploymentScope)}

${table(latestCapability.capabilityClaims || [], ['能力要求', '满足度', '证据类型', '实现方式'], (item) => [getCapabilityDisplay(item.capabilityId).label, claimStatusLabel(item.satisfaction), item.evidenceType, implementationTypeLabel(item.implementationType)])}

## 5. 匹配差距与闭环

${table(gapClosureItems, ['能力要求', '责任方', '补偿措施', '验收影响', '残余风险'], (item) => [getCapabilityDisplay(item.capabilityId).label, item.owner, item.mitigation, item.acceptanceImpact, item.residualRisk])}

## 6. IEC 62443 映射依据

${table(mappingRows, ['能力要求', 'Part', 'FR', 'SR', '条款摘要', '系统解释', '当前限制'], (item) => [item.display?.label || getCapabilityDisplay(item.requirement?.capabilityId).label, item.mapping?.part, item.mapping?.fr, item.mapping?.sr, item.mapping?.requirementSummary, item.mapping?.systemInterpretation, item.mapping?.limitation])}

## 7. 免责声明

${UNIFIED_DISCLAIMER}
`;
}

export async function copyMarkdownToClipboard(markdown) {
  if (!navigator.clipboard?.writeText) return false;
  try {
    await navigator.clipboard.writeText(markdown);
    return true;
  } catch {
    return false;
  }
}

export function exportReportAsMarkdown(report) {
  const projectName = report?.projectMeta?.projectName || 'iec-62443-deliverable';
  const filename = `${projectName.replace(/[\\/:*?"<>|\s]+/g, '-')}-${Date.now()}.md`;
  const markdown = buildReportMarkdown(report);
  return { ok: true, mode: 'inline', filename, markdown };
}

export function exportReportAsJSON(report) {
  const filename = `${report.type || report.audience || 'deliverable'}-${Date.now()}.json`;
  const json = JSON.stringify(report, null, 2);
  return { ok: true, mode: 'inline', filename, json };
}
