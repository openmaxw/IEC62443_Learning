import { useContext } from 'react';
import { ProjectContext } from '../context/projectContextInstance';

const STAGES = [
  { id: 'project', label: '项目建立', route: '/owner' },
  { id: 'owner', label: '需求澄清', route: '/owner' },
  { id: 'integrator', label: '设计响应', route: '/integrator' },
  { id: 'vendor', label: '能力声明', route: '/vendor' },
  { id: 'selection', label: '匹配闭环', route: '/selection' },
  { id: 'report', label: '交付摘要', route: '/report' }
];

function ensureArray(value) {
  return Array.isArray(value) ? value : [];
}

function ensureObject(value, fallback = {}) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : fallback;
}

function isFilled(value) {
  return typeof value === 'string' ? value.trim().length > 0 : Boolean(value);
}

function isNonEmptyArray(value) {
  return Array.isArray(value) && value.length > 0;
}

function isGapStatus(status) {
  return status === 'missing' || status === 'external' || status === 'configured' || status === 'compensating' || status === 'partial';
}

function hasSavedClosure(item) {
  return Boolean(item?.mitigation && item?.owner && item?.acceptanceImpact && item?.residualRisk);
}

const OWNER_SUBSTEPS = [
  { id: '01-01', label: '项目场景', done: (state) => isFilled(state.projectMeta?.projectName) && isFilled(state.projectMeta?.industry) },
  { id: '01-02', label: '业务后果', done: (state) => { const assessment = state.ownerProfile?.assessment; return Boolean(assessment?.safetyImpact && assessment?.environmentalImpact && assessment?.productionImpact); } },
  { id: '01-03', label: '暴露面', done: (state) => { const assessment = state.ownerProfile?.assessment; return Boolean(assessment?.remoteAccessNeed && assessment?.thirdPartyAccess); } },
  { id: '01-04', label: '现状基础', done: (state) => { const assessment = state.ownerProfile?.assessment; return Boolean(assessment?.networkSegmentationMaturity && assessment?.identityMaturity && assessment?.loggingMaturity && assessment?.patchMaturity); } },
  { id: '01-05', label: '约束与对象', done: (state) => { const assessment = state.ownerProfile?.assessment; return Boolean(assessment?.criticalAssets?.length && assessment?.keySystems && assessment?.externalConnections); } }
];

const INTEGRATOR_SUBSTEPS = [
  { id: '02-01', label: '设计依据', done: (state) => isFilled(state.integratorDesign?.draft?.designBasis ?? state.integratorDesign?.plan?.designBasis) },
  { id: '02-02', label: '分区与通道', done: (state) => { const plan = state.integratorDesign?.draft ?? state.integratorDesign?.plan; return Boolean(plan?.zones?.length && plan?.conduits?.length); } },
  { id: '02-03', label: '资产归组', done: (state) => { const plan = state.integratorDesign?.draft ?? state.integratorDesign?.plan; return Boolean(plan?.assets?.length); } },
  { id: '02-04', label: '跨区通信', done: (state) => { const plan = state.integratorDesign?.draft ?? state.integratorDesign?.plan; return Boolean(plan?.communicationFlows?.length); } },
  { id: '02-05', label: '设计校核', done: (state) => { const plan = state.integratorDesign?.plan; return Boolean(plan?.capabilityRequirements?.length); } }
];

const VENDOR_SUBSTEPS = [
  { id: '03-01', label: '产品信息', done: (state) => { const draft = ensureObject(state.vendorCatalog?.draft, null); return Boolean(draft?.productMeta?.productName && draft?.productMeta?.productType && draft?.productMeta?.deploymentScope); } },
  { id: '03-02', label: '能力声明', done: (state) => { const draft = ensureObject(state.vendorCatalog?.draft, null); return Boolean(draft?.capabilityClaims?.length); } },
  { id: '03-03', label: '边界与依赖', done: (state) => { const draft = ensureObject(state.vendorCatalog?.draft, null); return Boolean(draft?.dependencies || draft?.capabilityClaims?.some((item) => item.claimScope || item.dependencyNote)); } },
  { id: '03-04', label: '证据与限制', done: (state) => { const draft = ensureObject(state.vendorCatalog?.draft, null); return Boolean(draft?.capabilityClaims?.some((item) => item.evidenceType) || draft?.limitations); } },
  { id: '03-05', label: '声明汇总', done: (state) => Boolean(ensureArray(state.vendorCatalog?.capabilities).length) }
];

const SELECTION_SUBSTEPS = [
  { id: '04-01', label: '匹配结果总览', done: (state) => Boolean(state.selectionAnalysis?.results?.results?.length) },
  { id: '04-02', label: '待处置项', done: (state) => { const rows = ensureArray(state.selectionAnalysis?.results?.results); return rows.some((item) => isGapStatus(item.status)); } },
  { id: '04-03', label: '补偿措施', done: (state) => { const items = ensureArray(state.gapClosure?.items); return items.some((item) => isFilled(item.mitigation)); } },
  { id: '04-04', label: '验收与风险', done: (state) => { const items = ensureArray(state.gapClosure?.items); return items.some((item) => isFilled(item.acceptanceImpact) || isFilled(item.residualRisk) || isFilled(item.owner)); } },
  { id: '04-05', label: '处置确认', done: (state) => { const rows = ensureArray(state.selectionAnalysis?.results?.results).filter((item) => isGapStatus(item.status)); const items = ensureArray(state.gapClosure?.items); return rows.length === 0 || rows.every((row) => hasSavedClosure(items.find((item) => item.id === row.id))); } }
];

function getSubstepProgress(state, items) {
  return {
    completed: items.filter((item) => item.done(state)).length,
    total: items.length,
    items: items.map((item) => ({
      id: item.id,
      label: item.label,
      completed: item.done(state)
    }))
  };
}

function getStageStatus(state) {
  return {
    project: isFilled(state.projectMeta?.projectName) && isFilled(state.projectMeta?.industry),
    owner: Boolean(state.ownerProfile?.assessment),
    integrator: Boolean(state.integratorDesign?.plan),
    vendor: isNonEmptyArray(state.vendorCatalog?.capabilities),
    selection: Boolean(state.selectionAnalysis?.results),
    report: isNonEmptyArray(state.deliverables?.reports)
  };
}

function getMissingInputs(state) {
  const items = [];
  const projectMeta = ensureObject(state.projectMeta, {});
  const assessment = state.ownerProfile?.assessment;
  const riskProfile = ensureObject(state.riskTranslation?.profile, null);
  const plan = state.integratorDesign?.plan;
  const capabilities = ensureArray(state.vendorCatalog?.capabilities);
  const matchResults = state.selectionAnalysis?.results;
  const reports = ensureArray(state.deliverables?.reports);
  const gapRows = ensureArray(matchResults?.results).filter((item) => isGapStatus(item.status));
  const gapClosureItems = ensureArray(state.gapClosure?.items);
  const pendingGapRows = gapRows.filter((row) => !hasSavedClosure(gapClosureItems.find((item) => item.id === row.id)));

  if (!isFilled(projectMeta.projectName)) items.push({ id: 'project-name', label: '在需求澄清中补充项目名称', route: '/owner' });
  if (!isFilled(projectMeta.industry)) items.push({ id: 'project-industry', label: '在需求澄清中补充行业/场景', route: '/owner' });
  if (!isFilled(projectMeta.organizationName)) items.push({ id: 'project-organization', label: '在需求澄清中补充业主单位', route: '/owner' });
  if (!isFilled(projectMeta.siteName)) items.push({ id: 'project-site', label: '在需求澄清中补充工厂/装置/站点', route: '/owner' });
  if (!isFilled(projectMeta.scenarioType)) items.push({ id: 'project-scenario', label: '在需求澄清中补充项目类型', route: '/owner' });
  if (!assessment) items.push({ id: 'owner-assessment', label: '完成需求澄清输入', route: '/owner' });
  if (assessment && !isFilled(assessment.keySystems)) items.push({ id: 'owner-key-systems', label: '在需求澄清中补充关键系统/角色', route: '/owner' });
  if (assessment && !isFilled(assessment.externalConnections)) items.push({ id: 'owner-external-connections', label: '在需求澄清中补充外部连接方式', route: '/owner' });
  if (assessment && !isFilled(assessment.maintenanceAccessPath)) items.push({ id: 'owner-maintenance-path', label: '在需求澄清中补充维护接入方式', route: '/owner' });
  if (assessment && !isFilled(assessment.initialBoundaryNotes)) items.push({ id: 'owner-boundary-notes', label: '在需求澄清中补充初始网络边界', route: '/owner' });
  if (assessment && !isFilled(assessment.continuityRequirements)) items.push({ id: 'owner-continuity', label: '在需求澄清中补充工艺连续性要求', route: '/owner' });
  if (assessment && !isFilled(assessment.complianceNotes)) items.push({ id: 'owner-compliance-notes', label: '在需求澄清中补充合规补充说明', route: '/owner' });
  if (assessment && !riskProfile) items.push({ id: 'owner-summary', label: '生成需求澄清摘要', route: '/owner/result' });
  if (!plan) items.push({ id: 'integrator-plan', label: '完成设计响应草案', route: '/integrator' });
  if (!isNonEmptyArray(capabilities)) items.push({ id: 'vendor-capability', label: '录入能力声明', route: '/vendor' });
  if (!matchResults) items.push({ id: 'selection-analysis', label: '完成匹配闭环结果', route: '/selection' });
  if (pendingGapRows.length) items.push({ id: 'gap-closure', label: '补全差距处置措施并保存', route: '/selection' });
  if (riskProfile && plan && capabilities.length && matchResults && !reports.length) items.push({ id: 'report-export', label: '在交付摘要中生成 Markdown 文档', route: '/report' });

  return items;
}

function getNextRecommendedRoute(state) {
  const missingInputs = getMissingInputs(state);
  if (missingInputs.length) {
    return {
      id: missingInputs[0].id,
      label: missingInputs[0].label,
      route: missingInputs[0].route
    };
  }

  const stageStatus = getStageStatus(state);
  return STAGES.find((stage) => !stageStatus[stage.id]) || null;
}

function getProjectProgress(state) {
  const stageStatus = getStageStatus(state);
  const completed = STAGES.filter((stage) => stageStatus[stage.id]).length;
  return {
    completed,
    total: STAGES.length,
    percentage: Math.round((completed / STAGES.length) * 100),
    stageStatus,
    stages: STAGES,
    substeps: {
      owner: getSubstepProgress(state, OWNER_SUBSTEPS),
      integrator: getSubstepProgress(state, INTEGRATOR_SUBSTEPS),
      vendor: getSubstepProgress(state, VENDOR_SUBSTEPS),
      selection: getSubstepProgress(state, SELECTION_SUBSTEPS)
    }
  };
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within ProjectProvider');
  }
  return context;
}

export function useProjectStatus() {
  const { state } = useProject();
  return {
    progress: getProjectProgress(state),
    missingInputs: getMissingInputs(state),
    nextAction: getNextRecommendedRoute(state)
  };
}

export function useOwnerPath() {
  const { state } = useProject();
  return {
    projectMeta: ensureObject(state.projectMeta, {}) || {},
    assessment: state.ownerProfile?.assessment || null,
    riskProfile: ensureObject(state.riskTranslation?.profile, null)
  };
}

export function useIntegratorPath() {
  const { state } = useProject();
  return {
    projectMeta: ensureObject(state.projectMeta, {}) || {},
    assessment: state.ownerProfile?.assessment || null,
    riskProfile: ensureObject(state.riskTranslation?.profile, null),
    plan: state.integratorDesign?.plan || null
  };
}

export function useVendorPath() {
  const { state } = useProject();
  return {
    projectMeta: ensureObject(state.projectMeta, {}) || {},
    plan: state.integratorDesign?.plan || null,
    capabilities: ensureArray(state.vendorCatalog?.capabilities),
    matchResults: state.selectionAnalysis?.results || null,
    gapClosureItems: ensureArray(state.gapClosure?.items)
  };
}
