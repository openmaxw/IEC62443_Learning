import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, NotePanel, StatusSummaryPanel, StepTabs, WorkflowNavBar } from '../../components/Common';
import { ProjectStageShell } from '../../components/ProjectFlow';
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
    return <ProjectStageShell stageNumber="02" title="系统实现" projectName={state.projectMeta?.projectName} outputLabel="设计响应结果" prevAction={{ to: '/owner', label: '上一步' }} ><div className={styles.empty}>请先完成需求与目标阶段。</div></ProjectStageShell>;
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
      content = <div className={styles.workspace}><div className={styles.block}><div className={styles.blockTitle}>业主输入摘要</div><div className={styles.contextGrid}><div><span>关键系统/角色</span><strong>{assessment.keySystems || '未填写'}</strong></div><div><span>外部连接方式</span><strong>{assessment.externalConnections || '未填写'}</strong></div><div><span>维护接入方式</span><strong>{assessment.maintenanceAccessPath || '未填写'}</strong></div><div><span>初始网络边界</span><strong>{assessment.initialBoundaryNotes || '未填写'}</strong></div><div><span>工艺连续性要求</span><strong>{assessment.continuityRequirements || '未填写'}</strong></div><div><span>合规补充说明</span><strong>{assessment.complianceNotes || '未填写'}</strong></div><div><span>项目类型</span><strong>{getScenarioTypeLabel(projectMeta?.scenarioType)}</strong></div><div><span>目标 SL</span><strong>SL-{plan.targetSL}</strong></div></div></div><div className={`${styles.block} ${invalidClass('designBasis')}`}><div className={styles.blockTitle}>设计原则说明</div><FieldHint text="用于说明本轮分区、通信与边界设计的总体原则，帮助后续结果页解释为什么这样设计。" /><textarea className={styles.fullText} value={plan.designBasis || ''} onChange={(event) => updatePlan((prev) => ({ ...prev, designBasis: event.target.value }))} placeholder="示例：按照关键控制区与远程接入区隔离的原则设计，优先控制远程维护边界与跨区通信。" /></div><div className={styles.grid}><div className={styles.block}><div className={styles.blockTitle}>目标安全等级</div><select value={plan.targetSL} onChange={(event) => updatePlan((prev) => ({ ...prev, targetSL: Number(event.target.value) }))}>{[1, 2, 3, 4].map((level) => <option key={level} value={level}>SL-{level}</option>)}</select></div><div className={styles.block}><div className={styles.blockTitle}>功能需求关注点</div><div className={styles.blockHint}>系统根据需求澄清结果推导出的 IEC 62443 FR 关注方向，按 FR1-FR7 顺序展示。</div><div className={styles.noteList}>{(plan.requiredFR || []).length ? formatFrFocus(plan.requiredFR).map((item) => <div key={item.code} className={styles.note}><strong>{item.code} · {item.name}</strong><span>{item.description}</span></div>) : <div className={styles.emptyCell}>暂无 FR 关注项</div>}</div></div></div></div>;
      break;
    case 'zones':
      content = <div className={styles.grid}><div className={`${styles.block} ${invalidClass('zones')}`}><div className={styles.blockTitle}>Zone 草案</div><div className={styles.optionGrid}>{ZONE_TEMPLATES.map((zone) => <button key={zone.id} type="button" className={`${styles.optionCell} ${plan.zones.includes(zone.id) ? styles.optionCellActive : ''}`} onClick={() => toggleItem('zones', zone.id)}><strong>{zone.name}</strong><span>{zone.description}</span></button>)}</div></div><div className={`${styles.block} ${invalidClass('conduits')}`}><div className={styles.blockTitle}>Conduit 类型</div><div className={styles.optionGrid}>{CONDUIT_TEMPLATES.map((conduit) => <button key={conduit.id} type="button" className={`${styles.optionCell} ${plan.conduits.includes(conduit.id) ? styles.optionCellActive : ''}`} onClick={() => toggleItem('conduits', conduit.id)}><strong>{conduit.name}</strong><span>{conduit.description}</span></button>)}</div></div></div>;
      break;
    case 'assets':
      content = <div className={`${styles.block} ${invalidClass('assets')}`}><div className={styles.blockTitle}>资产归组到 Zone</div><div className={styles.formStack}><div className={styles.inlineForm}><input value={newAsset.name} onChange={(event) => setNewAsset((prev) => ({ ...prev, name: event.target.value }))} placeholder="资产名称，如：操作员站" /><select value={newAsset.zone} onChange={(event) => setNewAsset((prev) => ({ ...prev, zone: event.target.value }))}><option value="">归属 Zone</option>{plan.zones.map((zoneId) => <option key={zoneId} value={zoneId}>{ZONE_TEMPLATES.find((item) => item.id === zoneId)?.name || zoneId}</option>)}</select></div><div className={styles.inlineForm}><select value={newAsset.role} onChange={(event) => setNewAsset((prev) => ({ ...prev, role: event.target.value }))}>{ASSET_ROLES.map((role) => <option key={role.value} value={role.value}>{role.label}</option>)}</select><input value={newAsset.groupingReason} onChange={(event) => setNewAsset((prev) => ({ ...prev, groupingReason: event.target.value }))} placeholder="归组原因，如：同工艺单元、相同信任边界" /></div><FieldHint text="用于说明为什么把该资产归入当前 Zone，常见依据包括工艺单元、信任边界和运维方式。" /><Button variant="secondary" size="small" onClick={addAsset}>添加资产</Button></div><table className={styles.table}><thead><tr><th>资产名称</th><th>归属 Zone</th><th>角色</th><th>归组原因</th></tr></thead><tbody>{plan.assets.length ? plan.assets.map((asset) => <tr key={asset.id}><td>{asset.name}</td><td>{asset.zone}</td><td>{asset.role}</td><td>{asset.groupingReason || '未填写归组原因'}</td></tr>) : <tr><td colSpan="4" className={styles.emptyCell}>暂无资产</td></tr>}</tbody></table></div>;
      break;
    case 'flows':
      content = <div className={`${styles.block} ${invalidClass('flows')}`}><div className={styles.blockTitle}>跨区通信流</div><div className={styles.formStack}><div className={styles.inlineForm}><select value={newFlow.source} onChange={(event) => setNewFlow((prev) => ({ ...prev, source: event.target.value }))}><option value="">源 Zone</option>{plan.zones.map((zoneId) => <option key={zoneId} value={zoneId}>{ZONE_TEMPLATES.find((item) => item.id === zoneId)?.name || zoneId}</option>)}</select><select value={newFlow.target} onChange={(event) => setNewFlow((prev) => ({ ...prev, target: event.target.value }))}><option value="">目标 Zone</option>{plan.zones.map((zoneId) => <option key={zoneId} value={zoneId}>{ZONE_TEMPLATES.find((item) => item.id === zoneId)?.name || zoneId}</option>)}</select></div><select value={newFlow.protocol} onChange={(event) => setNewFlow((prev) => ({ ...prev, protocol: event.target.value }))}><option value="">选择协议</option>{PROTOCOL_GROUPS.map((group) => <optgroup key={group.label} label={group.label}>{group.items.map((protocol) => <option key={protocol} value={protocol}>{protocol}</option>)}</optgroup>)}</select><FieldHint text="方向用于说明流量方向；跨区必要性用于说明这条通信为什么必须存在。" /><div className={styles.inlineForm}><select value={newFlow.direction} onChange={(event) => setNewFlow((prev) => ({ ...prev, direction: event.target.value }))}>{FLOW_DIRECTIONS.map((direction) => <option key={direction} value={direction}>{direction}</option>)}</select><input value={newFlow.necessity} onChange={(event) => setNewFlow((prev) => ({ ...prev, necessity: event.target.value }))} placeholder="示例：操作员站需要读取工艺数据并下发受控指令。" /></div><FieldHint text="用于说明这条通信承载的具体业务用途，而不是只写协议名称。" /><textarea value={newFlow.businessReason} onChange={(event) => setNewFlow((prev) => ({ ...prev, businessReason: event.target.value }))} placeholder="示例：MES 读取产量数据；工程师站维护 PLC 程序。" /><FieldHint text="用于描述这条通信应通过哪些边界控制措施受到限制和审计。" /><textarea value={newFlow.boundaryControl} onChange={(event) => setNewFlow((prev) => ({ ...prev, boundaryControl: event.target.value }))} placeholder="示例：通过工业防火墙、白名单、跳板审批和日志审计控制。" /><Button variant="secondary" size="small" onClick={addFlow}>添加通信流</Button></div><table className={styles.table}><thead><tr><th>路径</th><th>协议 / 方向</th><th>业务用途</th><th>跨区必要性</th><th>边界控制</th></tr></thead><tbody>{plan.communicationFlows.length ? plan.communicationFlows.map((flow) => <tr key={flow.id}><td>{flow.source} → {flow.target}</td><td>{flow.protocol} / {flow.direction}</td><td>{flow.businessReason || '未填写'}</td><td>{flow.necessity || '未填写'}</td><td>{flow.boundaryControl || '未填写'}</td></tr>) : <tr><td colSpan="5" className={styles.emptyCell}>暂无通信流</td></tr>}</tbody></table></div>;
      break;
    default:
      content = <div className={styles.reviewStack}><div className={styles.block}><div className={styles.blockTitle}>规则建议</div><div className={styles.compactNoteList}>{systemRules.slice(0, 6).map((rule) => <div key={rule} className={styles.compactNote}>{rule}</div>)}</div></div><div className={styles.block}><div className={styles.blockTitle}>本项目重点能力要求</div><div className={styles.blockHint}>以下为系统根据业主输入和设计上下文整理出的项目级能力要求，不是 IEC 62443 原文条款名；FR / SR 标签用于辅助追溯标准方向。</div><table className={`${styles.table} ${styles.reviewTable}`}><thead><tr><th>控制目标 / 分组</th><th>能力要求</th><th>来源依据</th></tr></thead><tbody>{requirementGroups.length === 0 ? <tr><td colSpan="3" className={styles.emptyCell}>暂无数据</td></tr> : requirementGroups.map((group) => group.items.map((item, index) => <tr key={item.id}><td>{index === 0 ? <div className={styles.groupTitle}>{group.title}</div> : ''}</td><td><div className={styles.capabilityCode}>{getCapabilityDisplay(item.capabilityId).label}</div><div className={styles.capabilityMeta}><span className={styles.standardTag}>{getCapabilityDisplay(item.capabilityId).frText}</span><span className={styles.standardTag}>{getCapabilityDisplay(item.capabilityId).srText}</span></div></td><td>{summarizeTraceability(item)}</td></tr>))}</tbody></table></div></div>;
  }

  return (
    <ProjectStageShell
      stageNumber="02"
      title="系统实现"
      projectName={state.projectMeta?.projectName}
      outputLabel="系统实现结果"
      statusText={isReviewStep ? '设计输入已形成规划结果候选' : '正在完善系统规划输入'}
      statusPanel={<StatusSummaryPanel label="当前步骤" value={`${currentStep + 1} / ${STEPS.length}`} note={validationMessage || (isReviewStep ? '复核无误后可生成系统实现摘要。' : '点击下一步时会检查当前页必填内容。')} pills={[step.title, isReviewStep ? '可生成系统实现摘要' : '待继续补齐']} />}
      guidance={{ summary: step.guidance }}
    >
      {({ statusBar }) => (
      <section className={styles.workspace}>
        <StepTabs items={STEPS} currentIndex={currentStep} onChange={validateBeforeStepChange} />
        <div className={styles.panel}>{content}</div>
        {statusBar}
        <WorkflowNavBar
          leftLabel={currentStep === 0 ? '返回需求结果' : '上一步'}
          rightLabel={isReviewStep ? '生成系统实现摘要' : '下一步'}
          onLeftClick={currentStep === 0 ? () => navigate('/owner/result') : () => setCurrentStep((prev) => Math.max(prev - 1, 0))}
          onRightClick={isReviewStep ? () => finalizePlan('/integrator/result') : handleNextStep}
        />
      </section>
      )}
    </ProjectStageShell>
  );
}
