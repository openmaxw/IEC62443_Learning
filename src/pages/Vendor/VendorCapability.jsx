import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, DataTable, StatusSummaryPanel, SummaryStatGrid, StepTabs, SurfacePanel, WorkflowNavBar } from '../../components/Common';
import { CaseStageLayout, ProjectStageShell } from '../../components/ProjectFlow';
import { useIntegratorPath, useProject } from '../../hooks/useProject';
import { getVendorCapabilityViewModel } from '../../domain/viewModels/workspaceTranslationViewModels';
import { CAPABILITY_OPTIONS, PRODUCT_TYPES, CAPABILITY_CATEGORIES, getCapabilityDisplay } from '../../data/capabilities';
import { buildCapabilityRequirementMatrix, buildCommunicationMatrix } from '../../utils/planningEngine';
import styles from './VendorCapability.module.css';

const EVIDENCE_OPTIONS = ['厂商符合性声明', '产品手册/安全功能说明', '测试报告', '第三方认证/评估', '项目配置截图/记录'];
const SATISFACTION_OPTIONS = [
  { value: 'native', label: '产品原生满足' },
  { value: 'configured', label: '配置后满足' },
  { value: 'external', label: '需外部系统共同实现' },
  { value: 'compensating', label: '需补偿措施后接受' },
  { value: 'missing', label: '当前不满足' },
  { value: 'na', label: '不适用' }
];
const FLAT_CAPABILITIES = Object.entries(CAPABILITY_OPTIONS).flatMap(([category, options]) => options.map((option) => ({ ...option, category })));
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
const PRODUCT_TYPE_HINTS = { plc: ['auth', 'access', 'integrity'], scada: ['auth', 'access', 'logging', 'audit'], hmi: ['auth', 'access', 'logging'], firewall: ['access', 'encryption', 'logging', 'audit'], switch: ['access', 'logging'], ids: ['logging', 'audit', 'integrity'], endpoint: ['auth', 'access', 'integrity', 'logging', 'audit'], gateway: ['auth', 'access', 'encryption', 'logging'], sensor: ['integrity'], sis: ['auth', 'access', 'integrity', 'logging'] };
const STEPS = [
  { id: 'product', title: '产品信息', guidance: '填写产品名称、类型、目标安全等级和部署范围，明确本次声明对象。' },
  { id: 'claims', title: '能力声明', guidance: '按项目能力要求逐项声明产品能力状态：原生满足、配置后满足、需外部系统共同实现、需补偿措施或当前不满足。' },
  { id: 'scope', title: '边界与依赖', guidance: '补充每项声明的适用范围、前置依赖和限制条件，说明该能力在什么部署边界内才成立。' },
  { id: 'evidence', title: '证据与限制', guidance: '为每项声明选择证据类型和实现路径，避免把口头承诺误认为可验收证据。' },
  { id: 'summary', title: '声明汇总', guidance: '复核产品能力、适用边界、依赖条件和证据情况，生成产品与开发摘要并进入匹配闭环。' }
];

function isSameObject(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

function resolveApplicability(productType, category) {
  if (!productType) return { label: '待选择产品类型', tone: 'neutral' };
  const suggested = PRODUCT_TYPE_HINTS[productType] || [];
  if (suggested.includes(category)) return { label: '更适用', tone: 'fit' };
  return { label: '可补充评估', tone: 'neutral' };
}

function normalizeClaimStatus(value) {
  if (value === 'fulfilled') return 'native';
  if (value === 'partial') return 'configured';
  return value || '';
}


export function VendorCapability() {
  const navigate = useNavigate();
  const { state, actions } = useProject();
  const { projectMeta, plan } = useIntegratorPath();
  const integratorDraft = state.integratorDesign?.draft;
  const riskProfile = state.riskTranslation?.profile;
  const effectivePlan = useMemo(() => {
    if (plan?.capabilityRequirements?.length) return plan;
    const sourcePlan = plan || integratorDraft;
    if (!sourcePlan || !riskProfile) return plan;

    const communicationMatrix = sourcePlan.communicationMatrix || buildCommunicationMatrix(sourcePlan);
    const requirementMatrix = buildCapabilityRequirementMatrix(riskProfile, sourcePlan.targetSL || 2, communicationMatrix);
    return { ...sourcePlan, communicationMatrix, capabilityRequirements: requirementMatrix.rows };
  }, [plan, integratorDraft, riskProfile]);
  const hasGeneratedDesignResult = Boolean(plan?.capabilityRequirements?.length);
  const capabilityViewModel = getVendorCapabilityViewModel({ projectMeta, plan: effectivePlan, draft: state.vendorCatalog?.draft, capabilities: state.vendorCatalog?.capabilities });
  const [filter, setFilter] = useState('required');
  const [currentStep, setCurrentStep] = useState(0);
  const [validationMessage, setValidationMessage] = useState('');
  const [missingFields, setMissingFields] = useState([]);
  const [formData, setFormData] = useState(() => state.vendorCatalog?.draft || { productMeta: { productName: '', productType: '', securityLevel: 2, deploymentScope: '' }, capabilityClaims: [], dependencies: '', limitations: '' });
  const selectedClaims = useMemo(() => new Map(formData.capabilityClaims.map((item) => [item.capabilityId, { ...item, satisfaction: normalizeClaimStatus(item.satisfaction) }])), [formData.capabilityClaims]);
  const requirementRows = useMemo(() => (effectivePlan?.capabilityRequirements || []).map((item) => ({
    ...item,
    capabilityId: LEGACY_CAPABILITY_ID_MAP[item.capabilityId] || item.capabilityId,
    originalCapabilityId: item.capabilityId
  })), [effectivePlan]);
  const requirementIds = useMemo(() => new Set(requirementRows.map((item) => item.capabilityId)), [requirementRows]);
  const visibleCapabilities = useMemo(() => FLAT_CAPABILITIES.filter((item) => {
    if (filter === 'required') return requirementIds.has(item.id);
    if (filter === 'claimed') return selectedClaims.has(item.id);
    return true;
  }), [filter, requirementIds, selectedClaims]);
  const selectedProductType = PRODUCT_TYPES.find((type) => type.id === formData.productMeta.productType);
  const claimedRequiredCount = requirementRows.filter((item) => {
    const claim = selectedClaims.get(item.capabilityId);
    return claim && normalizeClaimStatus(claim.satisfaction) !== 'na';
  }).length;
  const isSummaryStep = currentStep === STEPS.length - 1;
  const step = STEPS[currentStep];

  useEffect(() => {
    if (!isSameObject(state.vendorCatalog?.draft, formData)) {
      actions.setVendorDraft(formData);
    }
  }, [formData, state.vendorCatalog?.draft, actions]);

  const clearValidation = () => {
    setValidationMessage('');
    setMissingFields([]);
  };
  const isMissing = (field) => missingFields.includes(field);
  const invalidClass = (field) => (isMissing(field) ? styles.invalidField : '');
  const renderMissingHint = (field) => (isMissing(field) ? <div className={styles.fieldErrorText}>此项未填写</div> : null);

  const updateFormData = (updater) => {
    clearValidation();
    setFormData(updater);
  };

  const updateProductMeta = (field, value) => updateFormData((prev) => ({ ...prev, productMeta: { ...prev.productMeta, [field]: value } }));

  const buildDefaultClaim = (capabilityId) => ({ capabilityId, satisfaction: 'native', implementationType: 'product', evidenceType: '厂商符合性声明', claimScope: '', dependencyNote: '', limitationNote: '' });

  const updateClaim = (capabilityId, patch = {}) => updateFormData((prev) => {
    const existingIndex = prev.capabilityClaims.findIndex((item) => item.capabilityId === capabilityId);
    if (existingIndex === -1) {
      return { ...prev, capabilityClaims: [...prev.capabilityClaims, { ...buildDefaultClaim(capabilityId), ...patch }] };
    }

    const nextClaims = prev.capabilityClaims.map((item, index) => (
      index === existingIndex ? { ...item, satisfaction: normalizeClaimStatus(item.satisfaction), ...patch } : item
    ));
    return { ...prev, capabilityClaims: nextClaims };
  });

  const ensureRequiredClaims = () => {
    if (!requirementRows.length) return;
    updateFormData((prev) => {
      const existingIds = new Set(prev.capabilityClaims.map((item) => item.capabilityId));
      const missingClaims = requirementRows
        .filter((item) => !existingIds.has(item.capabilityId))
        .map((item) => buildDefaultClaim(item.capabilityId));
      return missingClaims.length ? { ...prev, capabilityClaims: [...prev.capabilityClaims, ...missingClaims] } : prev;
    });
  };

  const getStepValidationResult = (stepId = step.id) => {
    if (stepId === 'product') {
      const fields = ['productName', 'productType', 'deploymentScope'].filter((field) => !formData.productMeta[field]);
      if (fields.length) return { message: '请先填写产品名称、产品类型和部署范围，再进入下一步。', fields };
    }
    if (stepId === 'claims' && !formData.capabilityClaims.length) return { message: '请至少纳入一项产品能力声明，再进入下一步。', fields: ['capabilityClaims'] };
    if (stepId === 'scope') {
      const fields = formData.capabilityClaims.flatMap((claim) => ['claimScope', 'dependencyNote', 'limitationNote'].filter((field) => !String(claim[field] || '').trim()).map((field) => `${claim.capabilityId}:${field}`));
      if (!String(formData.dependencies || '').trim()) fields.push('dependencies');
      if (!String(formData.limitations || '').trim()) fields.push('limitations');
      if (fields.length) return { message: '请补齐每项已纳入能力的边界范围、依赖说明、限制说明，以及统一依赖和统一限制。', fields };
    }
    if (stepId === 'evidence') {
      const fields = formData.capabilityClaims.flatMap((claim) => ['evidenceType', 'implementationType'].filter((field) => !String(claim[field] || '').trim()).map((field) => `${claim.capabilityId}:${field}`));
      if (fields.length) return { message: '请为每项已纳入能力选择证据类型和实现方式。', fields };
    }
    return { message: '', fields: [] };
  };

  const validateBeforeStepChange = (targetStep) => {
    if (targetStep <= currentStep) {
      clearValidation();
      setCurrentStep(targetStep);
      return;
    }

    for (let index = currentStep; index < targetStep; index += 1) {
      const { message, fields } = getStepValidationResult(STEPS[index].id);
      if (message) {
        setCurrentStep(index);
        setValidationMessage(message);
        setMissingFields(fields);
        return;
      }
    }

    clearValidation();
    setCurrentStep(targetStep);
  };

  const handleNextStep = () => {
    const { message: nextMessage, fields } = getStepValidationResult();
    if (nextMessage) {
      setValidationMessage(nextMessage);
      setMissingFields(fields);
      return;
    }
    clearValidation();
    setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
  };

  const removeClaim = (capabilityId) => updateFormData((prev) => ({ ...prev, capabilityClaims: prev.capabilityClaims.filter((item) => item.capabilityId !== capabilityId) }));

  const clearAllClaims = () => updateFormData((prev) => ({ ...prev, capabilityClaims: [] }));

  const handleClaimStatusChange = (capabilityId, value) => {
    if (!value) {
      removeClaim(capabilityId);
      return;
    }
    updateClaim(capabilityId, { satisfaction: value });
  };

  const handleImplementationTypeChange = (capabilityId, value) => {
    if (!value) {
      removeClaim(capabilityId);
      return;
    }
    updateClaim(capabilityId, { implementationType: value });
  };

  const handleComplete = (targetRoute = '/vendor/result') => {
    const lastCapability = state.vendorCatalog?.capabilities?.[state.vendorCatalog.capabilities.length - 1];
    const nextCapability = { ...formData, requirementCoverage: requirementRows.length };
    if (!isSameObject(lastCapability ? { ...lastCapability, id: undefined } : null, nextCapability)) {
      actions.addVendorCapability({ id: `vendor-${Date.now()}`, ...nextCapability });
    }
    actions.setProjectMeta({ status: 'vendor-completed' });
    navigate(targetRoute);
  };

  let content;

  switch (step.id) {
    case 'product':
      content = <div className={styles.workspace}><table className={styles.tableForm}><tbody><tr><th>产品名称</th><td><div className={`${styles.tableField} ${invalidClass('productName')}`}><input value={formData.productMeta.productName} onChange={(event) => updateProductMeta('productName', event.target.value)} placeholder="工业边界安全网关 XG-9000" /><div className={styles.fieldCellHint}>填写用于本项目声明的产品名称。</div></div></td></tr><tr><th>产品类型</th><td><div className={`${styles.tableField} ${invalidClass('productType')}`}><select value={formData.productMeta.productType} onChange={(event) => updateProductMeta('productType', event.target.value)}><option value="">产品类型</option>{PRODUCT_TYPES.map((type) => <option key={type.id} value={type.id}>{type.name}</option>)}</select><div className={styles.fieldCellHint}>产品类型会影响能力提示和适用性判断。</div></div></td></tr><tr><th>目标安全等级</th><td><div className={styles.tableField}><div className={styles.tableFieldHint}>用于描述本产品面向当前项目的目标能力等级。</div><select value={formData.productMeta.securityLevel} onChange={(event) => updateProductMeta('securityLevel', Number(event.target.value))}>{[1, 2, 3, 4].map((level) => <option key={level} value={level}>SL-{level}</option>)}</select><div className={styles.fieldCellHint}>用于描述本产品面向当前项目的目标能力等级。</div></div></td></tr><tr><th>部署范围</th><td><div className={`${styles.tableField} ${invalidClass('deploymentScope')}`}><input value={formData.productMeta.deploymentScope} onChange={(event) => updateProductMeta('deploymentScope', event.target.value)} placeholder="制造区 DMZ 远程维护边界" /><div className={styles.fieldCellHint}>填写产品在项目中的典型部署位置或适用边界。</div></div></td></tr></tbody></table>{!hasGeneratedDesignResult ? <div className={styles.warningHint}>当前能力声明页尚未读取到已生成的设计响应摘要；系统已根据现有风险转译和设计草稿临时推导项目要求。建议返回设计响应最后一步点击“生成设计响应摘要”，再进入能力声明。</div> : null}<div className={styles.productHint}>{selectedProductType ? `当前选择：${selectedProductType.name}` : `当前项目共有 ${requirementRows.length} 条重点能力要求，请先选择产品类型，系统会给出更适用的能力提示。`}</div></div>;
      break;
    case 'claims':
      content = <div className={styles.workspace}><div className={`${styles.toolbarRow} ${invalidClass('capabilityClaims')}`}><div className={styles.toolbarActions}><Button variant={filter === 'required' ? 'primary' : 'secondary'} size="small" onClick={() => setFilter('required')}>项目要求</Button><Button variant={filter === 'claimed' ? 'primary' : 'secondary'} size="small" onClick={() => setFilter('claimed')}>已纳入声明</Button><Button variant={filter === 'all' ? 'primary' : 'secondary'} size="small" onClick={() => setFilter('all')}>产品全量能力</Button></div><div className={styles.toolbarActions}>{requirementRows.length ? <Button variant="secondary" size="small" onClick={ensureRequiredClaims}>将项目要求加入声明表</Button> : null}{formData.capabilityClaims.length ? <Button variant="ghost" size="small" onClick={clearAllClaims}>清空声明表</Button> : null}</div></div>{requirementRows.length === 0 && filter === 'required' ? <div className={styles.warningHint}><strong>当前没有项目要求。</strong><span>请先完成需求澄清汇总，并在设计响应最后一步点击“生成设计响应摘要”；也可以切换到“产品全量能力”先声明产品能力。</span></div> : null}<div className={styles.productHint}>02 中已纳入声明的能力会进入 03 边界与依赖、04 证据与限制；如有隐藏残留，请切换到“已纳入声明”查看并清除。</div><DataTable><thead><tr><th>项目要求</th><th>来源</th><th>适用提示</th><th>满足度</th><th>实现方式</th><th>操作</th></tr></thead><tbody>{visibleCapabilities.length === 0 ? <tr><td colSpan="6">{filter === 'claimed' ? '当前没有已纳入声明的能力。' : '暂无项目要求，请先生成设计响应摘要，或切换到“产品全量能力”。'}</td></tr> : visibleCapabilities.map((capability) => { const claim = selectedClaims.get(capability.id); const applicability = resolveApplicability(formData.productMeta.productType, capability.category); const requirement = requirementRows.find((item) => item.capabilityId === capability.id); return <tr key={capability.id} className={requirementIds.has(capability.id) ? styles.requiredRow : ''}><td><strong>{getCapabilityDisplay(capability.id).label}</strong><div className={styles.capabilityMeta}><span className={styles.standardTag}>{getCapabilityDisplay(capability.id).frText}</span><span className={styles.standardTag}>{getCapabilityDisplay(capability.id).srText}</span></div><div className={styles.metaText}>{getCapabilityDisplay(capability.id).description}</div></td><td>{requirement ? <div><div>{requirement.controlObjective}</div><div className={styles.metaText}>{requirement.implementationHint}</div></div> : '产品补充项'}</td><td><span className={`${styles.appTag} ${applicability.tone === 'fit' ? styles.appTagFit : styles.appTagNeutral}`}>{applicability.label}</span><div className={styles.metaText}>{CAPABILITY_CATEGORIES[capability.category]?.name || capability.category}</div></td><td><select value={normalizeClaimStatus(claim?.satisfaction)} onChange={(event) => handleClaimStatusChange(capability.id, event.target.value)}><option value="">未纳入</option>{SATISFACTION_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></td><td><select value={claim?.implementationType || ''} onChange={(event) => handleImplementationTypeChange(capability.id, event.target.value)}><option value="">未纳入</option><option value="product">产品内置实现</option><option value="external">外部系统实现</option><option value="shared">产品+系统共同实现</option></select></td><td>{claim ? <Button variant="ghost" size="small" onClick={() => removeClaim(capability.id)}>清除</Button> : <Button variant="secondary" size="small" onClick={() => updateClaim(capability.id)}>纳入</Button>}</td></tr>; })}</tbody></DataTable></div>;
      break;
    case 'scope':
      content = <div className={styles.workspace}><DataTable><thead><tr><th>能力项</th><th>边界范围</th><th>依赖说明</th><th>限制说明</th></tr></thead><tbody>{formData.capabilityClaims.length === 0 ? <tr><td colSpan="4">请先在上一步至少声明一项能力</td></tr> : formData.capabilityClaims.map((claim) => <tr key={claim.capabilityId}><td><strong>{getCapabilityDisplay(claim.capabilityId).label}</strong></td><td><div className={`${styles.tableField} ${invalidClass(`${claim.capabilityId}:claimScope`)}`}><input value={claim.claimScope || ''} onChange={(event) => updateClaim(claim.capabilityId, { claimScope: event.target.value })} placeholder="示例：仅适用于本机管理、远程接入登录或指定固件版本" />{renderMissingHint(`${claim.capabilityId}:claimScope`)}</div></td><td><div className={`${styles.tableField} ${invalidClass(`${claim.capabilityId}:dependencyNote`)}`}><input value={claim.dependencyNote || ''} onChange={(event) => updateClaim(claim.capabilityId, { dependencyNote: event.target.value })} placeholder="示例：需对接集中身份管理、日志平台、证书体系或边界网关" />{renderMissingHint(`${claim.capabilityId}:dependencyNote`)}</div></td><td><div className={`${styles.tableField} ${invalidClass(`${claim.capabilityId}:limitationNote`)}`}><input value={claim.limitationNote || ''} onChange={(event) => updateClaim(claim.capabilityId, { limitationNote: event.target.value })} placeholder="示例：细粒度授权需额外模块、授权许可或特定版本支持" />{renderMissingHint(`${claim.capabilityId}:limitationNote`)}</div></td></tr>)}</tbody></DataTable><div className={styles.bottomBar}><div className={`${styles.inputBlock} ${invalidClass('dependencies')}`}><label>统一依赖</label><div className={styles.fieldCellHint}>用于填写对所有已声明能力共同生效的外部前提。</div><textarea value={formData.dependencies} onChange={(event) => updateFormData((prev) => ({ ...prev, dependencies: event.target.value }))} placeholder="集中身份管理、日志平台、证书体系和边界防护设备" />{renderMissingHint('dependencies')}</div><div className={`${styles.inputBlock} ${invalidClass('limitations')}`}><label>统一限制</label><div className={styles.fieldCellHint}>用于填写对产品能力声明共同适用的限制说明。</div><textarea value={formData.limitations} onChange={(event) => updateFormData((prev) => ({ ...prev, limitations: event.target.value }))} placeholder="部分高级授权能力需授权开启，旧版本不支持完整审计功能" />{renderMissingHint('limitations')}</div></div></div>;
      break;
    case 'evidence':
      content = <div className={styles.workspace}><DataTable><thead><tr><th>能力项</th><th>满足度</th><th>证据类型</th><th>实现方式</th></tr></thead><tbody>{formData.capabilityClaims.length === 0 ? <tr><td colSpan="4">请先在前面步骤声明能力</td></tr> : formData.capabilityClaims.map((claim) => <tr key={claim.capabilityId}><td><strong>{getCapabilityDisplay(claim.capabilityId).label}</strong></td><td>{SATISFACTION_OPTIONS.find((option) => option.value === normalizeClaimStatus(claim.satisfaction))?.label || claim.satisfaction}</td><td><div className={`${styles.tableField} ${invalidClass(`${claim.capabilityId}:evidenceType`)}`}><div className={styles.fieldCellHint}>选择可直接支撑验收或声明的证据类型。</div><select value={claim.evidenceType || '厂家声明'} onChange={(event) => updateClaim(claim.capabilityId, { evidenceType: event.target.value })}>{EVIDENCE_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}</select></div></td><td><div className={`${styles.tableField} ${invalidClass(`${claim.capabilityId}:implementationType`)}`}><div className={styles.fieldCellHint}>说明该能力是由产品本体、外部系统还是共同实现。</div><select value={claim.implementationType || 'product'} onChange={(event) => updateClaim(claim.capabilityId, { implementationType: event.target.value })}><option value="product">产品内置实现</option><option value="external">外部系统实现</option><option value="shared">产品+系统共同实现</option></select></div></td></tr>)}</tbody></DataTable></div>;
      break;
    default:
      content = <div className={styles.page}><SummaryStatGrid columns={3} items={[{ label: '产品名称', value: formData.productMeta.productName || '未填写' }, { label: '产品类型', value: selectedProductType?.name || '未填写' }, { label: '目标安全等级', value: `SL-${formData.productMeta.securityLevel || 2}` }, { label: '部署范围', value: formData.productMeta.deploymentScope || '未填写' }, { label: '项目要求覆盖', value: `${claimedRequiredCount} / ${requirementRows.length}` }, { label: '已声明能力', value: formData.capabilityClaims.length }]} /><SummaryStatGrid columns={2} compact valueTone="soft" items={[{ label: '统一依赖', value: formData.dependencies || '未填写' }, { label: '统一限制', value: formData.limitations || '未填写' }]} /><div className={styles.modeHint}>确认上述信息后即可生成产品与开发摘要，并进入匹配闭环。</div></div>;
  }

  return (
    <CaseStageLayout><ProjectStageShell stageNumber="03" title="提供能力" projectName={capabilityViewModel.projectName} outputLabel="产品与开发结果" statusText={isSummaryStep ? '产品与开发内容已可生成结果页' : '正在完善产品能力、开发证据、依赖条件和限制说明'} statusPanel={<StatusSummaryPanel label="当前步骤" value={`${currentStep + 1} / ${STEPS.length}`} note={validationMessage || (isSummaryStep ? '复核无误后可生成摘要。' : '当前步骤完成后可进入下一步。')} pills={[step.title, `覆盖项目要求 ${claimedRequiredCount}/${requirementRows.length || 0}`]} />} guidance={{ summary: `${step.guidance}${step.id === 'meta' ? ' 建议先确认当前声明对象与部署范围。' : step.id === 'claims' ? ' 建议先看满足状态，再决定哪些项需要进入后续说明。' : step.id === 'scope' ? ' 建议先看适用范围，再看依赖条件与限制说明。' : step.id === 'evidence' ? ' 建议先看证据类型，再看实现方式是否能支撑当前声明。' : step.id === 'limits' ? ' 建议先看哪些结论受边界影响，再看限制如何表述。' : ' 建议按能力、边界、证据和限制的顺序复核。'}` }}>
      {({ statusBar }) => (
      <section className={styles.workspace}>
                <StepTabs items={STEPS} currentIndex={currentStep} onChange={validateBeforeStepChange} />
        <SurfacePanel className={styles.panel}>{content}</SurfacePanel>
        {statusBar}
        <SurfacePanel className={styles.panel}><div className={styles.productHint}>开发支撑实例：以“细粒度 RBAC 部分满足”为例，说明开发如何补充可信性证据。</div><DataTable><thead><tr><th>能力项</th><th>当前差距</th><th>开发支撑动作</th><th>验证方式</th><th>临时补偿</th></tr></thead><tbody><tr><td><strong>细粒度 RBAC</strong></td><td>当前仅支持基础管理角色，无法完全覆盖项目要求的细粒度授权</td><td>新增更细粒度角色模型、权限矩阵与版本计划；补充测试和缺陷处置记录</td><td>角色授权测试、版本发布说明、回归验证记录</td><td>在正式版本前由集中管理平台或审批流程补充控制</td></tr></tbody></DataTable></SurfacePanel>
        <WorkflowNavBar
          leftLabel={currentStep === 0 ? '返回系统实现摘要' : '上一步'}
          rightLabel={isSummaryStep ? '生成产品与开发摘要' : '下一步'}
          onLeftClick={currentStep === 0 ? () => navigate('/integrator/result') : () => setCurrentStep((prev) => Math.max(prev - 1, 0))}
          onRightClick={isSummaryStep ? () => handleComplete('/vendor/result') : handleNextStep}
        />
      </section>
      )}
    </ProjectStageShell></CaseStageLayout>
  );
}
