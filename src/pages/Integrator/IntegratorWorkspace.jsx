import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, DataTable, PillTag, StatusSummaryPanel, StepTabs, StructuredRecordTable, SummaryStatGrid, SurfacePanel, WorkflowNavBar } from '../../components/Common';
import { CaseStageLayout, ProjectStageShell } from '../../components/ProjectFlow';
import { useOwnerPath, useProject } from '../../hooks/useProject';
import { getIntegratorWorkspaceViewModel } from '../../domain/viewModels/workspaceTranslationViewModels';
import { ZONE_TEMPLATES, CONDUIT_TEMPLATES } from '../../data/zones';
import { getCapabilityDisplay } from '../../data/capabilities';
import { FR_CATEGORIES } from '../../data/rules';
import { buildCapabilityRequirementMatrix, buildCommunicationMatrix, buildSystemRules } from '../../utils/planningEngine';
import styles from './IntegratorWorkspace.module.css';

const DEFAULT_ASSET = { name: '', zone: '', role: 'control', groupingReason: '' };
const DEFAULT_FLOW = { source: '', target: '', protocol: '', businessReason: '', direction: '双向', necessity: '', boundaryControl: '' };
const ASSET_ROLES = [{ value: 'control', label: '控制' }, { value: 'monitoring', label: '监控' }, { value: 'engineering', label: '工程' }, { value: 'server', label: '服务' }];
const PROTOCOL_GROUPS = [{ label: 'IT/通用协议', items: ['HTTP', 'HTTPS', 'SSH', 'MQTT', '普通TCP/IP'] }, { label: '工业以太网协议', items: ['Modbus TCP', 'OPC UA', 'EtherNet/IP', 'EtherNet/IP (CIP)', 'PROFINET', 'EtherCAT', 'DNP3'] }, { label: '现场总线/传统协议', items: ['Foundation Fieldbus', 'PROFIBUS', 'HART', 'Modbus RTU', 'BACnet'] }];
const FLOW_DIRECTIONS = ['单向', '双向'];
const STEPS = [
  { id: 'basis', title: '设计依据', guidance: '查看业主输入摘要，填写本轮分区、通信和边界设计的总体原则。' },
  { id: 'zones', title: '分区与通道', guidance: '选择适用的 Zone 与 Conduit 类型，建立后续资产归组和跨区通信的结构基础。' },
  { id: 'assets', title: '资产归组', guidance: '把关键资产归入对应 Zone，并说明归组依据，便于后续追溯设计边界。' },
  { id: 'flows', title: '跨区通信', guidance: '补充源区、目标区、协议、业务理由和边界控制，形成可核对通信矩阵。' },
  { id: 'review', title: '设计校核', guidance: '复核通信完整性、能力需求和系统规则，确认后生成系统实现摘要。' }
];

function isSameObject(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

function splitDisplayItems(value) {
  if (!value) return [];
  return value.split(/[、，,；;\n]+/).map((item) => item.trim()).filter(Boolean);
}

function DisplayChips({ value }) {
  const items = splitDisplayItems(value);
  if (!items.length) return <strong>未填写</strong>;
  return <div className={styles.displayChips}>{items.map((item) => <span key={item} className={styles.displayChip}>{item}</span>)}</div>;
}

function groupRequirementRows(rows) {
  const grouped = new Map();
  rows.forEach((item) => {
    const key = item.controlObjective || '其他控制目标';
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(item);
  });
  return Array.from(grouped.entries()).map(([title, items]) => ({ title, items }));
}

function summarizeTraceability(item) {
  const conditions = item.traceability?.inputConditions || [];
  const concerns = item.traceability?.riskConcerns || [];
  const parts = [];
  if (conditions.length) parts.push(conditions.slice(0, 2).join('、'));
  if (concerns.length) parts.push(concerns.slice(0, 2).join('、'));
  return parts.length ? parts.join('；') : '来源于风险转译结果与当前设计响应输入';
}

function formatFrFocus(codes = []) {
  return [...new Set(codes)]
    .sort((left, right) => Number(left.replace('FR', '')) - Number(right.replace('FR', '')))
    .map((code) => ({ code, ...(FR_CATEGORIES[code] || { name: '未定义功能要求', description: '暂无说明' }) }));
}

function FieldHint({ text }) {
  return <div className={styles.blockHint}>{text}</div>;
}

function getScenarioTypeLabel(value) {
  if (value === 'new-build') return '新建';
  if (value === 'retrofit') return '改造';
  if (value === 'expansion') return '扩建';
  if (value === 'assessment') return '评估';
  return value || '未填写';
}

export function IntegratorWorkspace() {
  const navigate = useNavigate();
  const { assessment, riskProfile, projectMeta } = useOwnerPath();
  const { state, actions } = useProject();
  const integratorDraft = state.integratorDesign?.draft;
  const integratorPlan = state.integratorDesign?.plan;
  const workspaceViewModel = getIntegratorWorkspaceViewModel({ projectMeta, assessment, riskProfile, plan: integratorPlan, draftPlan: integratorDraft });
  const [currentStep, setCurrentStep] = useState(0);
  const [validationMessage, setValidationMessage] = useState('');
  const [missingFields, setMissingFields] = useState([]);
  const [newAsset, setNewAsset] = useState(DEFAULT_ASSET);
  const [newFlow, setNewFlow] = useState(DEFAULT_FLOW);
  const [plan, setPlan] = useState(workspaceViewModel.initialPlan);
  const communicationMatrix = useMemo(() => buildCommunicationMatrix(plan), [plan]);
  const requirementMatrix = useMemo(() => {
    if (Array.isArray(plan.capabilityRequirements) && plan.capabilityRequirements.length) {
      return { complete: plan.communicationMatrix?.complete ?? communicationMatrix.complete, rows: plan.capabilityRequirements };
    }
    return buildCapabilityRequirementMatrix(riskProfile, plan.targetSL, communicationMatrix);
  }, [plan.capabilityRequirements, plan.communicationMatrix?.complete, plan.targetSL, riskProfile, communicationMatrix]);
  const systemRules = useMemo(() => buildSystemRules(plan, riskProfile, communicationMatrix), [plan, riskProfile, communicationMatrix]);
  const requirementGroups = useMemo(() => groupRequirementRows(requirementMatrix.rows), [requirementMatrix.rows]);

  useEffect(() => {
    if (!isSameObject(state.integratorDesign?.draft, plan)) {
      actions.setIntegratorDraft(plan);
    }
  }, [plan, state.integratorDesign?.draft, actions]);

  if (!workspaceViewModel.hasPrerequisites) {
    return <CaseStageLayout><ProjectStageShell stageNumber="02" title="形成方案" projectName={state.projectMeta?.projectName} outputLabel="设计响应结果" prevAction={{ to: '/owner', label: '上一步' }} ><div className={styles.empty}>请先完成需求与目标阶段。</div></ProjectStageShell></CaseStageLayout>;
  }

  const step = STEPS[currentStep];
  const isReviewStep = currentStep === STEPS.length - 1;

  const clearValidation = () => {
    setValidationMessage('');
    setMissingFields([]);
  };
  const isMissing = (field) => missingFields.includes(field);
  const invalidClass = (field) => (isMissing(field) ? styles.invalidField : '');

  const updatePlan = (updater) => {
    clearValidation();
    setPlan(updater);
  };

  const toggleItem = (field, value) => updatePlan((prev) => ({
    ...prev,
    [field]: prev[field].includes(value) ? prev[field].filter((item) => item !== value) : [...prev[field], value]
  }));

  const addAsset = () => {
    if (!newAsset.name || !newAsset.zone) return;
    updatePlan((prev) => ({ ...prev, assets: [...prev.assets, { ...newAsset, id: `${newAsset.zone}-${Date.now()}` }] }));
    setNewAsset(DEFAULT_ASSET);
  };

  const addFlow = () => {
    if (!newFlow.source || !newFlow.target || !newFlow.protocol || !newFlow.businessReason) return;
    updatePlan((prev) => ({ ...prev, communicationFlows: [...prev.communicationFlows, { ...newFlow, id: `flow-${Date.now()}` }] }));
    setNewFlow(DEFAULT_FLOW);
  };

  const getStepValidationResult = (stepId = step.id) => {
    if (stepId === 'basis' && !plan.designBasis) return { message: '请先填写设计原则说明，再进入下一步。', fields: ['designBasis'] };
    if (stepId === 'zones') {
      const fields = [!plan.zones?.length ? 'zones' : '', !plan.conduits?.length ? 'conduits' : ''].filter(Boolean);
      if (fields.length) return { message: '请至少选择一个 Zone 和一个 Conduit 类型，再进入下一步。', fields };
    }
    if (stepId === 'assets' && !plan.assets?.length) return { message: '请至少添加一个资产归组，再进入下一步。', fields: ['assets'] };
    if (stepId === 'flows' && !plan.communicationFlows?.length) return { message: '请至少添加一条跨区通信流，再进入下一步。', fields: ['flows'] };
    return { message: '', fields: [] };
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

  const finalizePlan = (targetRoute = '/integrator/result') => {
    actions.setProjectMeta({ status: 'integrator-completed' });
    const nextPlan = { ...plan, communicationMatrix, capabilityRequirements: requirementMatrix.rows, systemRules, residualRisks: communicationMatrix.complete ? ['仍需结合现场专家审查与设备能力核对。'] : ['通信流未完整，尚不能形成完整边界控制设计。'], designBasisSummary: { keySystems: assessment.keySystems, externalConnections: assessment.externalConnections, maintenanceAccessPath: assessment.maintenanceAccessPath, initialBoundaryNotes: assessment.initialBoundaryNotes, continuityRequirements: assessment.continuityRequirements, complianceNotes: assessment.complianceNotes, designBasis: plan.designBasis } };
    if (JSON.stringify(state.integratorDesign?.plan) !== JSON.stringify(nextPlan)) {
      actions.setIntegratorPlan(nextPlan);
    }
    navigate(targetRoute);
  };

  let content;

  switch (step.id) {
    case 'basis':
      content = <div className={styles.workspace}><table className={styles.tableForm}><tbody><tr><th>项目类型</th><td><div className={styles.tableField}><div className={styles.tableFieldHint}>用于说明当前设计背景属于新建、改造、扩建还是评估。</div><strong>{getScenarioTypeLabel(projectMeta?.scenarioType)}</strong></div></td></tr><tr><th>目标安全等级</th><td><div className={styles.tableField}><div className={styles.tableFieldHint}>选择本轮系统形成方案对应的目标安全等级。</div><select value={plan.targetSL} onChange={(event) => updatePlan((prev) => ({ ...prev, targetSL: Number(event.target.value) }))}>{[1, 2, 3, 4].map((level) => <option key={level} value={level}>SL-{level}</option>)}</select></div></td></tr><tr><th>关键系统/角色</th><td><div className={styles.tableField}><div className={styles.tableFieldHint}>来自业主输入，表示后续系统实现需要重点照看的系统与岗位。</div><DisplayChips value={assessment.keySystems} /></div></td></tr><tr><th>外部连接方式</th><td><div className={styles.tableField}><div className={styles.tableFieldHint}>来自业主输入，表示与外部系统或第三方的连接方式。</div><DisplayChips value={assessment.externalConnections} /></div></td></tr><tr><th>维护接入方式</th><td><div className={styles.tableField}><div className={styles.tableFieldHint}>来自业主输入，表示远程或现场运维进入目标系统的典型路径。</div><DisplayChips value={assessment.maintenanceAccessPath} /></div></td></tr><tr><th>初始网络边界</th><td><div className={styles.tableField}><div className={styles.tableFieldHint}>来自业主输入，表示现有网络隔离与边界设备状态。</div><DisplayChips value={assessment.initialBoundaryNotes} /></div></td></tr><tr><th>工艺连续性要求</th><td><div className={styles.tableField}><div className={styles.tableFieldHint}>来自业主输入，表示不可中断控制和连续运行方面的限制。</div><DisplayChips value={assessment.continuityRequirements} /></div></td></tr><tr><th>合规补充说明</th><td><div className={styles.tableField}><div className={styles.tableFieldHint}>来自业主输入，表示安环、审计、留痕或行业监管方面的补充要求。</div><DisplayChips value={assessment.complianceNotes} /></div></td></tr><tr><th>设计原则说明</th><td className={invalidClass('designBasis')}><div className={styles.tableField}><div className={styles.tableFieldHint}>说明本轮系统实现的总体原则。</div><textarea className={styles.fullText} value={plan.designBasis || ''} onChange={(event) => updatePlan((prev) => ({ ...prev, designBasis: event.target.value }))} placeholder="示例：按照关键控制区与远程接入区隔离的原则设计，优先控制远程维护边界与跨区通信。" /></div></td></tr></tbody></table><div className={styles.block}><div className={styles.blockTitle}>功能需求关注点</div><div className={styles.blockHint}>系统根据需求澄清结果推导出的 IEC 62443 FR 关注方向，按 FR1-FR7 顺序展示。</div><div className={styles.noteList}>{(plan.requiredFR || []).length ? formatFrFocus(plan.requiredFR).map((item) => <div key={item.code} className={styles.note}><strong>{item.code} · {item.name}</strong><span>{item.description}</span></div>) : <div className={styles.emptyCell}>暂无 FR 关注项</div>}</div></div></div>;
      break;
    case 'zones':
      content = <table className={styles.tableForm}><tbody><tr><th>Zone 草案</th><td className={invalidClass('zones')}><div className={styles.tableField}><div className={styles.tableFieldHint}>选择本轮系统实现中需要使用的安全分区类型。</div><div className={styles.optionGrid}>{ZONE_TEMPLATES.map((zone) => <button key={zone.id} type="button" className={`${styles.optionCell} ${plan.zones.includes(zone.id) ? styles.optionCellActive : ''}`} onClick={() => toggleItem('zones', zone.id)}><strong>{zone.name}</strong><span>{zone.description}</span></button>)}</div></div></td></tr><tr><th>Conduit 类型</th><td className={invalidClass('conduits')}><div className={styles.tableField}><div className={styles.tableFieldHint}>选择本轮系统实现中需要的通道类型，用于描述跨区连接方式。</div><div className={styles.optionGrid}>{CONDUIT_TEMPLATES.map((conduit) => <button key={conduit.id} type="button" className={`${styles.optionCell} ${plan.conduits.includes(conduit.id) ? styles.optionCellActive : ''}`} onClick={() => toggleItem('conduits', conduit.id)}><strong>{conduit.name}</strong><span>{conduit.description}</span></button>)}</div></div></td></tr></tbody></table>;
      break;
    case 'assets':
      content = <div className={invalidClass('assets')}><table className={styles.tableForm}><tbody><tr><th>资产名称</th><td><div className={styles.tableField}><div className={styles.tableFieldHint}>填写需要纳入本轮分区设计的关键资产或系统对象。</div><input value={newAsset.name} onChange={(event) => setNewAsset((prev) => ({ ...prev, name: event.target.value }))} placeholder="资产名称，如：操作员站" /></div></td></tr><tr><th>归属 Zone</th><td><div className={styles.tableField}><div className={styles.tableFieldHint}>为该资产选择当前已建立的安全分区。</div><select value={newAsset.zone} onChange={(event) => setNewAsset((prev) => ({ ...prev, zone: event.target.value }))}><option value="">归属 Zone</option>{plan.zones.map((zoneId) => <option key={zoneId} value={zoneId}>{ZONE_TEMPLATES.find((item) => item.id === zoneId)?.name || zoneId}</option>)}</select></div></td></tr><tr><th>资产角色</th><td><div className={styles.tableField}><div className={styles.tableFieldHint}>说明该资产在系统中的角色，例如控制、监控、工程或服务。</div><select value={newAsset.role} onChange={(event) => setNewAsset((prev) => ({ ...prev, role: event.target.value }))}>{ASSET_ROLES.map((role) => <option key={role.value} value={role.value}>{role.label}</option>)}</select></div></td></tr><tr><th>归组原因</th><td><div className={styles.tableField}><div className={styles.tableFieldHint}>用于说明为什么把该资产归入当前 Zone，常见依据包括工艺单元、信任边界和运维方式。</div><input value={newAsset.groupingReason} onChange={(event) => setNewAsset((prev) => ({ ...prev, groupingReason: event.target.value }))} placeholder="归组原因，如：同工艺单元、相同信任边界" /></div></td></tr></tbody></table><Button variant="secondary" size="small" onClick={addAsset}>添加资产</Button><StructuredRecordTable columns={[{ key: 'name', label: '资产名称' }, { key: 'zoneLabel', label: '归属 Zone' }, { key: 'roleLabel', label: '角色' }, { key: 'groupingReason', label: '归组原因' }]} rows={plan.assets.map((asset) => ({ ...asset, zoneLabel: ZONE_TEMPLATES.find((item) => item.id === asset.zone)?.name || asset.zone, roleLabel: ASSET_ROLES.find((item) => item.value === asset.role)?.label || asset.role, groupingReason: asset.groupingReason || '未填写归组原因' }))} emptyText="暂无资产" /></div>;
      break;
    case 'flows':
      content = <div className={invalidClass('flows')}><table className={styles.tableForm}><tbody><tr><th>源 Zone</th><td><div className={styles.tableField}><div className={styles.tableFieldHint}>选择该通信流的起点分区。</div><select value={newFlow.source} onChange={(event) => setNewFlow((prev) => ({ ...prev, source: event.target.value }))}><option value="">源 Zone</option>{plan.zones.map((zoneId) => <option key={zoneId} value={zoneId}>{ZONE_TEMPLATES.find((item) => item.id === zoneId)?.name || zoneId}</option>)}</select></div></td></tr><tr><th>目标 Zone</th><td><div className={styles.tableField}><div className={styles.tableFieldHint}>选择该通信流的终点分区。</div><select value={newFlow.target} onChange={(event) => setNewFlow((prev) => ({ ...prev, target: event.target.value }))}><option value="">目标 Zone</option>{plan.zones.map((zoneId) => <option key={zoneId} value={zoneId}>{ZONE_TEMPLATES.find((item) => item.id === zoneId)?.name || zoneId}</option>)}</select></div></td></tr><tr><th>协议</th><td><div className={styles.tableField}><div className={styles.tableFieldHint}>选择该通信流使用的主要协议。</div><select value={newFlow.protocol} onChange={(event) => setNewFlow((prev) => ({ ...prev, protocol: event.target.value }))}><option value="">选择协议</option>{PROTOCOL_GROUPS.map((group) => <optgroup key={group.label} label={group.label}>{group.items.map((protocol) => <option key={protocol} value={protocol}>{protocol}</option>)}</optgroup>)}</select></div></td></tr><tr><th>方向</th><td><div className={styles.tableField}><div className={styles.tableFieldHint}>用于说明该通信是单向还是双向。</div><select value={newFlow.direction} onChange={(event) => setNewFlow((prev) => ({ ...prev, direction: event.target.value }))}>{FLOW_DIRECTIONS.map((direction) => <option key={direction} value={direction}>{direction}</option>)}</select></div></td></tr><tr><th>跨区必要性</th><td><div className={styles.tableField}><div className={styles.tableFieldHint}>用于说明这条通信为什么必须存在。</div><input value={newFlow.necessity} onChange={(event) => setNewFlow((prev) => ({ ...prev, necessity: event.target.value }))} placeholder="示例：操作员站需要读取工艺数据并下发受控指令。" /></div></td></tr><tr><th>业务用途</th><td><div className={styles.tableField}><div className={styles.tableFieldHint}>说明这条通信承载的具体业务用途，而不是只写协议名称。</div><textarea value={newFlow.businessReason} onChange={(event) => setNewFlow((prev) => ({ ...prev, businessReason: event.target.value }))} placeholder="示例：MES 读取产量数据；工程师站维护 PLC 程序。" /></div></td></tr><tr><th>边界控制</th><td><div className={styles.tableField}><div className={styles.tableFieldHint}>描述这条通信应通过哪些边界控制措施受到限制和审计。</div><textarea value={newFlow.boundaryControl} onChange={(event) => setNewFlow((prev) => ({ ...prev, boundaryControl: event.target.value }))} placeholder="示例：通过工业防火墙、白名单、跳板审批和日志审计控制。" /></div></td></tr></tbody></table><Button variant="secondary" size="small" onClick={addFlow}>添加通信流</Button><StructuredRecordTable columns={[{ key: 'path', label: '路径' }, { key: 'protocolDirection', label: '协议 / 方向' }, { key: 'businessReason', label: '业务用途' }, { key: 'necessity', label: '跨区必要性' }, { key: 'boundaryControl', label: '边界控制' }]} rows={plan.communicationFlows.map((flow) => ({ ...flow, path: `${ZONE_TEMPLATES.find((item) => item.id === flow.source)?.name || flow.source} → ${ZONE_TEMPLATES.find((item) => item.id === flow.target)?.name || flow.target}`, protocolDirection: `${flow.protocol} / ${flow.direction}`, businessReason: flow.businessReason || '未填写', necessity: flow.necessity || '未填写', boundaryControl: flow.boundaryControl || '未填写' }))} emptyText="暂无通信流" /></div>;
      break;
    default:
      content = <div className={styles.reviewStack}><table className={styles.tableForm}><tbody><tr><th>规则建议</th><td><div className={styles.tableField}><div className={styles.tableFieldHint}>系统根据当前设计结果给出的优先复核建议。</div><div className={styles.compactNoteList}>{systemRules.slice(0, 6).map((rule) => <div key={rule} className={styles.compactNote}>{rule}</div>)}</div></div></td></tr></tbody></table><div className={styles.block}><div className={styles.blockTitle}>本项目重点能力要求</div><div className={styles.blockHint}>以下为系统根据业主输入和设计上下文整理出的项目级能力要求，不是 IEC 62443 原文条款名；FR / SR 标签用于辅助追溯标准方向。</div><DataTable className={styles.reviewTable}><thead><tr><th>控制目标 / 分组</th><th>能力要求</th><th>来源依据</th></tr></thead><tbody>{requirementGroups.length === 0 ? <tr><td colSpan="3" className={styles.emptyCell}>暂无数据</td></tr> : requirementGroups.map((group) => group.items.map((item, index) => <tr key={item.id}><td>{index === 0 ? <div className={styles.groupTitle}>{group.title}</div> : ''}</td><td><div className={styles.capabilityCode}>{getCapabilityDisplay(item.capabilityId).label}</div><div className={styles.capabilityMeta}><PillTag tone="info">{getCapabilityDisplay(item.capabilityId).frText}</PillTag><PillTag tone="info">{getCapabilityDisplay(item.capabilityId).srText}</PillTag></div></td><td>{summarizeTraceability(item)}</td></tr>))}</tbody></DataTable></div></div>;
  }

  return (
    <CaseStageLayout><ProjectStageShell
      stageNumber="02"
      title="形成方案"
      projectName={state.projectMeta?.projectName}
      outputLabel="系统实现结果"
      statusText={isReviewStep ? '设计输入已形成规划结果候选' : '正在完善系统规划输入'}
      statusPanel={<StatusSummaryPanel label="当前步骤" value={`${currentStep + 1} / ${STEPS.length}`} note={validationMessage || (isReviewStep ? '复核无误后可生成摘要。' : '当前步骤完成后可进入下一步。')} pills={[step.title, isReviewStep ? '可生成系统实现摘要' : '待继续补齐']} />}
      guidance={{ summary: `${step.guidance}${step.id === 'basis' ? ' 建议先核对项目输入，再进入分区、通信与边界设计。' : step.id === 'zones' ? ' 建议先看关键对象，再看分区归属与归组原因。' : step.id === 'flows' ? ' 建议先看源区与目标区，再看协议、业务理由和必要性。' : step.id === 'conduits' ? ' 建议先看分区边界，再看控制措施与默认策略。' : step.id === 'requirements' ? ' 建议先看控制目标，再看需要供应商支撑的能力项。' : ' 建议按设计依据、资产归组、通信、边界和能力需求的顺序复核。'}` }}
    >
      {({ statusBar }) => (
      <section className={styles.workspace}>
        <StepTabs items={STEPS} currentIndex={currentStep} onChange={validateBeforeStepChange} />
        <SurfacePanel className={styles.panel}>{content}</SurfacePanel>
        {statusBar}
        <WorkflowNavBar
          leftLabel={currentStep === 0 ? '返回需求结果' : '上一步'}
          rightLabel={isReviewStep ? '生成系统实现摘要' : '下一步'}
          onLeftClick={currentStep === 0 ? () => navigate('/owner/result') : () => setCurrentStep((prev) => Math.max(prev - 1, 0))}
          onRightClick={isReviewStep ? () => finalizePlan('/integrator/result') : handleNextStep}
        />
      </section>
      )}
    </ProjectStageShell></CaseStageLayout>
  );
}
