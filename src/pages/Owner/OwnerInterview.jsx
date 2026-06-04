import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StatusSummaryPanel, StepTabs, WorkflowNavBar } from '../../components/Common';
import { CaseStageLayout, ProjectStageShell } from '../../components/ProjectFlow';
import { useProject } from '../../hooks/useProject';
import { generateRiskProfile } from '../../utils/riskEngine';
import { ACCEPTANCE_PREFERENCE_OPTIONS, REMOTE_OWNERSHIP_OPTIONS } from '../../data/enums';
import { INDUSTRIES } from '../../data/industries';
import styles from './OwnerInterview.module.css';

const IMPACT_LEVEL_SCORE = { low: 1, medium: 2, high: 3 };

const STEPS = [
  { id: 'industry', title: '项目场景', guidance: '项目场景用于交代案例背景与目标边界；由业主视角提供项目名称、行业、站点和项目目标，作为后续风险转译的基础上下文。' },
  { id: 'impacts', title: '业务后果', guidance: '业务后果用于判断一旦受影响会产生多大后果；由业主视角评估安全、环境、生产、质量、财务和合规影响，为后续判断关注强度提供依据。' },
  { id: 'exposure', title: '暴露面', guidance: '暴露面用于说明外部访问如何进入系统；由业主视角交代远程运维、第三方接入和外部路径，为后续边界控制提供依据。' },
  { id: 'maturity', title: '现状基础', guidance: '现状基础用于说明当前防护起点；由业主视角评估网络隔离、身份管理、日志审计和补丁维护成熟度，识别需要补强的基础能力。' },
  { id: 'constraints', title: '约束条件', guidance: '约束条件用于说明设计不能脱离哪些现场现实；由业主视角补充维护窗口、改造窗口、远程责任和验收偏好。' },
  { id: 'assets', title: '关键对象', guidance: '关键对象用于明确后续重点保护和重点讨论的对象；由业主视角选择关键资产，并补充系统、连接、边界和连续性要求。' },
  { id: 'summary', title: '需求汇总', guidance: '需求汇总用于确认前面输入是否已经整理成可交接的项目基础；由业主视角复核摘要，确认后进入后续风险转译与设计阶段。' }
];

function isSameObject(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

function ImpactRadarChart({ fields, values }) {
  const size = 320;
  const center = size / 2;
  const maxRadius = 96;
  const levels = 3;

  const points = fields.map((field, index) => {
    const angle = (-Math.PI / 2) + ((Math.PI * 2) / fields.length) * index;
    const score = IMPACT_LEVEL_SCORE[values[field.key]] || 0;
    const radius = (score / levels) * maxRadius;
    const labelRadius = maxRadius + 42;
    const rawLabelX = center + Math.cos(angle) * labelRadius;
    const rawLabelY = center + Math.sin(angle) * labelRadius;
    const labelX = Math.max(34, Math.min(size - 34, rawLabelX));
    const labelY = Math.max(22, Math.min(size - 22, rawLabelY));
    const textAnchor = rawLabelX < center - 10 ? 'end' : rawLabelX > center + 10 ? 'start' : 'middle';

    return {
      ...field,
      score,
      angle,
      x: center + Math.cos(angle) * radius,
      y: center + Math.sin(angle) * radius,
      axisX: center + Math.cos(angle) * maxRadius,
      axisY: center + Math.sin(angle) * maxRadius,
      labelX,
      labelY,
      textAnchor
    };
  });

  const polygon = points.map((point) => `${point.x},${point.y}`).join(' ');
  const rings = Array.from({ length: levels }, (_, index) => {
    const radius = ((index + 1) / levels) * maxRadius;
    return points.map((point) => `${center + Math.cos(point.angle) * radius},${center + Math.sin(point.angle) * radius}`).join(' ');
  });

  return (
    <div className={styles.radarCard}>
      <div className={styles.radarHeader}><div><strong>安全需求画像</strong></div></div>
      <div className={styles.radarLayout}>
        <svg viewBox={`0 0 ${size} ${size}`} className={styles.radarSvg} role="img" aria-label="安全需求关注画像雷达图">
          {rings.map((ring, index) => <polygon key={index} points={ring} className={styles.radarRing} />)}
          {points.map((point) => <line key={point.key} x1={center} y1={center} x2={point.axisX} y2={point.axisY} className={styles.radarAxis} />)}
          <polygon points={polygon} className={styles.radarArea} />
          {points.map((point) => <circle key={`${point.key}-dot`} cx={point.x} cy={point.y} r="4" className={styles.radarDot} />)}
          {points.map((point) => (
            <text
              key={`${point.key}-label`}
              x={point.labelX}
              y={point.labelY}
              textAnchor={point.textAnchor}
              dominantBaseline="middle"
              className={styles.radarLabel}
            >
              {point.label}
            </text>
          ))}
        </svg>
      </div>
    </div>
  );
}

const IMPACT_FIELDS = [
  { key: 'safetyImpact', label: '人身安全', hint: '关注异常情况下对人员伤害、误操作和现场安全事件的影响。', levels: { low: '局部影响，可通过现场处置避免人员伤害。', medium: '存在人员受伤风险，需要专项控制和干预。', high: '可能导致严重伤害或重大安全事故。' } },
  { key: 'environmentalImpact', label: '环境影响', hint: '关注异常情况下对排放、泄漏、污染和环境事件的影响。', levels: { low: '影响局限，可在现场快速控制和恢复。', medium: '可能造成明显环境事件，需要外部协同处理。', high: '可能引发重大污染、泄漏或长期环境影响。' } },
  { key: 'productionImpact', label: '产能连续性', hint: '关注异常情况下对生产节拍、关键工序和连续运行的影响。', levels: { low: '局部波动，对整体产能影响有限。', medium: '会造成明显降产或阶段性中断。', high: '可能导致关键产线停产或长时间中断。' } },
  { key: 'qualityImpact', label: '质量一致性', hint: '关注异常情况下对产品质量、批次稳定性和工艺参数的影响。', levels: { low: '对质量影响有限，通常可通过复检或调整恢复。', medium: '会造成批次波动、返工或部分报废。', high: '可能导致大批量报废或关键质量失控。' } },
  { key: 'financialImpact', label: '财务损失', hint: '关注异常情况下带来的停机损失、恢复成本、赔付或额外支出。', levels: { low: '经济损失可控，通常在日常处置范围内。', medium: '会形成明显损失，需要专项预算或补救措施。', high: '可能带来重大经济损失或长期财务影响。' } },
  { key: 'complianceImpact', label: '监管合规', hint: '关注异常情况下对监管要求、审计结论和合规义务的影响。', levels: { low: '影响有限，可通过整改闭环解决。', medium: '可能触发审计问题、整改要求或合同约束。', high: '可能导致重大违规、处罚或许可风险。' } },
  { key: 'brandImpact', label: '品牌声誉', hint: '关注异常情况下对客户信任、市场形象和公众舆论的影响。', levels: { low: '影响局部，通常不会造成持续性声誉损伤。', medium: '会造成明显客户疑虑或外部负面反馈。', high: '可能引发重大舆情、客户流失或长期信任受损。' } }
];

const EXPOSURE_FIELDS = [
  { key: 'remoteAccessNeed', label: '远程运维', hint: '判断项目是否存在跨区域、跨组织或长期保留的远程诊断、维护与支持场景。', options: [ { value: 'none', label: '无远程运维', description: '维护和诊断主要依赖现场人员，不保留常态远程访问路径。' }, { value: 'limited', label: '有限远程运维', description: '仅在特定故障、调试或支持场景下临时远程接入。' }, { value: 'extensive', label: '广泛远程运维', description: '远程访问较常见，涉及日常监控、维护或远程支持。' } ] },
  { key: 'thirdPartyAccess', label: '第三方接入', hint: '判断设备商、集成商、运维服务商等外部单位是否需要接入项目系统。', options: [ { value: 'none', label: '无第三方接入', description: '系统访问主要由业主内部团队承担，不涉及外部单位接入。' }, { value: 'occasional', label: '偶尔接入', description: '仅在项目交付、故障处理或专项支持时由第三方接入。' }, { value: 'regular', label: '频繁接入', description: '第三方接入较常见，涉及持续维护、驻场支持或远程服务。' } ] }
];

const MATURITY_FIELDS = [
  { key: 'networkSegmentationMaturity', label: '网络隔离', hint: '判断现有工业网络是否已按区域、边界和访问路径进行基本隔离。', levels: { low: '网络边界不清，生产、管理或远程访问之间缺少有效隔离。', medium: '已存在部分区域划分和边界控制，但仍有例外链路或临时放通。', high: '已形成较清晰的分区分域和访问控制机制，边界管理相对完善。' } },
  { key: 'identityMaturity', label: '身份管理', hint: '判断账号、权限、共享口令和身份责任是否已得到基本控制。', levels: { low: '共享账号较多，权限边界不清，身份管理依赖人工约定。', medium: '关键账号已有区分和管理，但审批、回收或审计仍不完整。', high: '账号分级、权限控制和身份责任较清晰，管理机制相对稳定。' } },
  { key: 'loggingMaturity', label: '日志审计', hint: '判断关键操作、登录行为和事件追溯是否具备基本记录与查看能力。', levels: { low: '日志留存有限，出现问题时较难还原过程。', medium: '关键系统已有日志，但覆盖范围、留存周期或分析能力不足。', high: '关键行为具备较稳定的留痕与审计基础，支持追溯和复盘。' } },
  { key: 'patchMaturity', label: '补丁维护', hint: '判断系统更新、补丁评估和版本维护是否具备基本流程。', levels: { low: '补丁更新依赖临时安排，缺少稳定评估和发布机制。', medium: '关键设备有补丁维护安排，但节奏、窗口或兼容性管理不稳定。', high: '已形成相对明确的补丁评估、测试和发布维护机制。' } }
];

const ASSETS = [
  { id: 'plc', name: 'PLC' },
  { id: 'scada', name: 'SCADA' },
  { id: 'engineering', name: '工程师站' },
  { id: 'historian', name: '历史库' },
  { id: 'network', name: '工业网络' },
  { id: 'safety', name: '安全系统' },
  { id: 'remote-gateway', name: '远程接入' },
  { id: 'server', name: '工业服务器' }
];

function OptionCards({ field, value, onChange, options, invalid = false }) {
  return <div className={`${styles.optionGroup} ${invalid ? styles.invalidField : ''}`}>{field?.hint ? <div className={styles.optionExplain}>{field.hint}</div> : null}<div className={styles.optionHints}>{options.map((option) => <button key={option.value} type="button" className={`${styles.optionHint} ${value === option.value ? styles.optionHintActive : ''}`} onClick={() => onChange(option.value)}><strong>{option.label}</strong><span>{option.description}</span></button>)}</div></div>;
}
function LevelCards({ field, value, onChange, invalid = false }) {
  return <div className={invalid ? styles.invalidField : ''}>{field?.hint ? <div className={styles.optionExplain}>{field.hint}</div> : null}<div className={styles.optionHints}>{Object.entries(field.levels).map(([level, text]) => <button key={level} type="button" className={`${styles.optionHint} ${value === level ? styles.optionHintActive : ''}`} onClick={() => onChange(level)}><strong>{level === 'low' ? '低' : level === 'medium' ? '中' : '高'}</strong><span>{text}</span></button>)}</div></div>;
}
function resolveLevel(value) { return value === 'low' ? '低' : value === 'medium' ? '中' : value === 'high' ? '高' : '未填写'; }

function FieldHint({ title, hint }) {
  return <div className={styles.fieldHint}><strong>{title}</strong>{hint ? <span>{hint}</span> : null}</div>;
}

export function OwnerInterview() {
  const navigate = useNavigate();
  const { state, actions } = useProject();
  const [currentStep, setCurrentStep] = useState(0);
  const [activeGuidance, setActiveGuidance] = useState('');
  const [validationMessage, setValidationMessage] = useState('');
  const [missingFields, setMissingFields] = useState([]);
  const [formData, setFormData] = useState(() => state.ownerProfile?.draft || state.ownerProfile?.assessment || {
    projectName: state.projectMeta?.projectName || '',
    industry: state.projectMeta?.industry || '',
    safetyImpact: '', environmentalImpact: '', productionImpact: '', qualityImpact: '', financialImpact: '', complianceImpact: '', brandImpact: '',
    remoteAccessNeed: '', thirdPartyAccess: '',
    networkSegmentationMaturity: '', identityMaturity: '', loggingMaturity: '', patchMaturity: '',
    maintenanceWindow: '', upgradeWindow: '', remoteOperationsOwnership: '', acceptancePreference: '', criticalAssets: [],
    keySystems: '', externalConnections: '', maintenanceAccessPath: '', initialBoundaryNotes: '', continuityRequirements: '', complianceNotes: ''
  });

  useEffect(() => {
    if (!isSameObject(state.ownerProfile?.draft, formData)) {
      actions.setOwnerDraft(formData);
    }
  }, [formData, state.ownerProfile?.draft, actions]);


  const step = STEPS[currentStep];
  const updateField = (field, value) => setFormData((prev) => ({ ...prev, [field]: value }));
  const clearValidation = () => {
    setValidationMessage('');
    setMissingFields([]);
  };
  const isMissing = (field) => missingFields.includes(field);
  const invalidClass = (field) => (isMissing(field) ? styles.invalidField : '');
  const updateFieldWithValidation = (field, value) => {
    clearValidation();
    updateField(field, value);
  };
  const toggleAsset = (item) => {
    clearValidation();
    setFormData((prev) => ({ ...prev, criticalAssets: prev.criticalAssets.includes(item) ? prev.criticalAssets.filter((entry) => entry !== item) : [...prev.criticalAssets, item] }));
  };

  const selectedIndustry = INDUSTRIES.find((item) => item.id === (state.projectMeta?.industry || formData.industry));
  const acceptanceOption = ACCEPTANCE_PREFERENCE_OPTIONS.find((item) => item.value === formData.acceptancePreference);
  const updateProjectMeta = (field, value) => {
    clearValidation();
    actions.setProjectMeta({ [field]: value });
  };
  const ownershipOption = REMOTE_OWNERSHIP_OPTIONS.find((item) => item.value === formData.remoteOperationsOwnership);

  const showGuidance = (title, description) => {
    setActiveGuidance(`${title}：${description}`);
  };

  const getStepValidationResult = (stepId = step.id) => {
    if (stepId === 'industry') {
      const fields = [!(state.projectMeta?.projectName || formData.projectName) ? 'projectName' : '', !(state.projectMeta?.industry || formData.industry) ? 'industry' : ''].filter(Boolean);
      if (fields.length) return { message: '请先填写项目名称并选择行业场景，再进入下一步。', fields };
    }
    if (stepId === 'impacts') {
      const fields = IMPACT_FIELDS.filter((field) => !formData[field.key]).map((field) => field.key);
      if (fields.length) return { message: '请完成所有业务后果等级选择，再进入下一步。', fields };
    }
    if (stepId === 'exposure') {
      const fields = EXPOSURE_FIELDS.filter((field) => !formData[field.key]).map((field) => field.key);
      if (fields.length) return { message: '请完成远程运维和第三方接入选择，再进入下一步。', fields };
    }
    if (stepId === 'maturity') {
      const fields = MATURITY_FIELDS.filter((field) => !formData[field.key]).map((field) => field.key);
      if (fields.length) return { message: '请完成所有现状基础成熟度选择，再进入下一步。', fields };
    }
    if (stepId === 'constraints') {
      const fields = ['maintenanceWindow', 'upgradeWindow', 'keySystems', 'externalConnections', 'maintenanceAccessPath', 'initialBoundaryNotes', 'continuityRequirements', 'complianceNotes', 'remoteOperationsOwnership', 'acceptancePreference'].filter((field) => !formData[field]);
      if (fields.length) return { message: '请补充本页窗口约束、系统边界信息和约束选择，再进入下一步。', fields };
    }
    if (stepId === 'assets') {
      const fields = !formData.criticalAssets.length ? ['criticalAssets'] : [];
      if (fields.length) return { message: '请至少选择一个关键对象，再进入下一步。', fields };
    }
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
    setActiveGuidance('');
    setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
  };

  const validateBeforeStepChange = (targetStep) => {
    setActiveGuidance('');
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

  const handleFinalizeSummary = (targetRoute = '/integrator') => {
    const projectName = formData.projectName || state.projectMeta?.projectName || `${formData.industry || '工业项目'} IEC 62443 需求访谈`;
    const nextForm = { ...formData, projectName, industry: formData.industry || state.projectMeta?.industry || '' };
    actions.setProjectMeta({ projectName, industry: nextForm.industry, status: 'owner-completed' });
    if (!isSameObject(state.ownerProfile?.assessment, nextForm)) {
      actions.setOwnerAssessment(nextForm);
    }
    actions.setProjectName(projectName);
    const nextRiskProfile = generateRiskProfile(nextForm);
    if (!isSameObject(state.riskTranslation?.profile, nextRiskProfile)) {
      actions.setRiskProfile(nextRiskProfile);
    }
    navigate(targetRoute);
  };

  let content;
  switch (step.id) {
    case 'industry':
      content = <div className={styles.stack}><table className={styles.tableForm}><tbody><tr><th>项目名称</th><td><div className={`${styles.tableField} ${invalidClass('projectName')}`}><div className={styles.tableFieldHint}>填写本次案例或项目的正式名称。</div><input value={state.projectMeta?.projectName || ''} onChange={(event) => updateProjectMeta('projectName', event.target.value)} placeholder="示例：某化工装置 OT 安全分区协同演示" /></div></td></tr><tr><th>行业场景</th><td><div className={`${styles.tableField} ${invalidClass('industry')}`}><div className={styles.tableFieldHint}>选择最接近当前案例的行业，用于影响风险转译和要求提示。</div><select value={state.projectMeta?.industry || ''} onChange={(event) => updateProjectMeta('industry', event.target.value)}><option value="">请选择行业</option>{INDUSTRIES.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></div></td></tr><tr><th>业主单位</th><td><div className={styles.tableField}><div className={styles.tableFieldHint}>填写项目所属业主或资产所有者单位。</div><input value={state.projectMeta?.organizationName || ''} onChange={(event) => updateProjectMeta('organizationName', event.target.value)} placeholder="示例：某石化有限公司" /></div></td></tr><tr><th>工厂/装置/站点</th><td><div className={styles.tableField}><div className={styles.tableFieldHint}>填写该项目所在厂区、产线、装置或站点。</div><input value={state.projectMeta?.siteName || ''} onChange={(event) => updateProjectMeta('siteName', event.target.value)} placeholder="示例：乙烯装置 A 区" /></div></td></tr><tr><th>项目类型</th><td><div className={styles.tableField}><div className={styles.tableFieldHint}>用于说明本次工作是新建、改造、扩建还是评估。</div><select value={state.projectMeta?.scenarioType || ''} onChange={(event) => updateProjectMeta('scenarioType', event.target.value)}><option value="">请选择项目类型</option><option value="new-build">新建</option><option value="retrofit">改造</option><option value="expansion">扩建</option><option value="assessment">评估</option></select></div></td></tr><tr><th>项目目标</th><td><div className={styles.tableField}><div className={styles.tableFieldHint}>简要描述本次项目希望达成的系统或边界控制目标。</div><input value={state.projectMeta?.projectObjective || ''} onChange={(event) => updateProjectMeta('projectObjective', event.target.value)} placeholder="示例：完成控制区分段与远程维护边界加固" /></div></td></tr></tbody></table></div>;
      break;
    case 'impacts':
      content = <table className={styles.levelMatrix}><thead><tr><th>项目</th><th>说明</th><th>等级选择</th><th>当前解释</th></tr></thead><tbody>{IMPACT_FIELDS.map((field) => { const currentValue = formData[field.key]; return <tr key={field.key}><th>{field.label}</th><td className={styles.levelExplain}>{field.hint}</td><td className={isMissing(field.key) ? styles.invalidField : ''}><div className={styles.levelOptions}>{Object.keys(field.levels).map((level) => <button key={level} type="button" className={`${styles.levelOption} ${currentValue === level ? styles.levelOptionActive : ''}`.trim()} onClick={() => { updateFieldWithValidation(field.key, level); showGuidance(`${field.label} / ${level}`, field.levels[level]); }}>{level === 'low' ? '低' : level === 'medium' ? '中' : '高'}</button>)}</div></td><td className={styles.levelExplain}>{currentValue ? field.levels[currentValue] : '未填写'}</td></tr>; })}</tbody></table>;
      break;
    case 'exposure':
      content = <table className={styles.levelMatrix}><thead><tr><th>项目</th><th>说明</th><th>选项</th><th>当前解释</th></tr></thead><tbody>{EXPOSURE_FIELDS.map((field) => { const option = field.options?.find((item) => item.value === formData[field.key]); return <tr key={field.key}><th>{field.label}</th><td className={styles.levelExplain}>{field.hint}</td><td className={isMissing(field.key) ? styles.invalidField : ''}><div className={styles.levelOptions}>{field.options.map((item) => <button key={item.value} type="button" className={`${styles.levelOption} ${formData[field.key] === item.value ? styles.levelOptionActive : ''}`.trim()} onClick={() => { updateFieldWithValidation(field.key, item.value); showGuidance(`${field.label} / ${item.label}`, item.description || field.hint); }}>{item.label}</button>)}</div></td><td className={styles.levelExplain}>{option?.description || '未填写'}</td></tr>; })}</tbody></table>;
      break;
    case 'maturity':
      content = <table className={styles.levelMatrix}><thead><tr><th>项目</th><th>说明</th><th>等级选择</th><th>当前解释</th></tr></thead><tbody>{MATURITY_FIELDS.map((field) => { const currentValue = formData[field.key]; return <tr key={field.key}><th>{field.label}</th><td className={styles.levelExplain}>{field.hint}</td><td className={isMissing(field.key) ? styles.invalidField : ''}><div className={styles.levelOptions}>{Object.keys(field.levels).map((level) => <button key={level} type="button" className={`${styles.levelOption} ${currentValue === level ? styles.levelOptionActive : ''}`.trim()} onClick={() => { updateFieldWithValidation(field.key, level); showGuidance(`${field.label} / ${level}`, field.levels[level]); }}>{level === 'low' ? '低' : level === 'medium' ? '中' : '高'}</button>)}</div></td><td className={styles.levelExplain}>{currentValue ? field.levels[currentValue] : '未填写'}</td></tr>; })}</tbody></table>;
      break;
    case 'constraints':
      content = <div className={styles.stack}><table className={styles.tableForm}><tbody><tr><th>常规维护窗口</th><td><div className={`${styles.tableField} ${invalidClass('maintenanceWindow')}`}><div className={styles.tableFieldHint}>填写日常维护、巡检或临时调整通常可实施的时间窗口。</div><input value={formData.maintenanceWindow} onChange={(event) => updateFieldWithValidation('maintenanceWindow', event.target.value)} placeholder="示例：每周三 14:00-16:00" /></div></td></tr><tr><th>改造窗口</th><td><div className={`${styles.tableField} ${invalidClass('upgradeWindow')}`}><div className={styles.tableFieldHint}>填写允许进行升级、停机切换或较大范围变更的窗口。</div><input value={formData.upgradeWindow} onChange={(event) => updateFieldWithValidation('upgradeWindow', event.target.value)} placeholder="示例：月度停车窗口 / 法定检修期" /></div></td></tr><tr><th>关键系统/角色</th><td><div className={`${styles.tableField} ${invalidClass('keySystems')}`}><div className={styles.tableFieldHint}>列出后续方案设计、权限控制和访问审计需要重点关注的系统与岗位。</div><textarea value={formData.keySystems} onChange={(event) => updateFieldWithValidation('keySystems', event.target.value)} placeholder="示例：DCS 控制器、操作员站、工程师站、历史数据库、远程运维跳板" rows={4} /></div></td></tr><tr><th>外部连接方式</th><td><div className={`${styles.tableField} ${invalidClass('externalConnections')}`}><div className={styles.tableFieldHint}>说明与上层系统、第三方平台或外部单位之间的数据交换和连接方式。</div><textarea value={formData.externalConnections} onChange={(event) => updateFieldWithValidation('externalConnections', event.target.value)} placeholder="示例：与 MES 交换生产数据；设备商通过受控远程维护通道接入" rows={4} /></div></td></tr><tr><th>维护接入方式</th><td><div className={`${styles.tableField} ${invalidClass('maintenanceAccessPath')}`}><div className={styles.tableFieldHint}>描述现场或厂外运维人员进入目标系统的典型路径。</div><textarea value={formData.maintenanceAccessPath} onChange={(event) => updateFieldWithValidation('maintenanceAccessPath', event.target.value)} placeholder="示例：厂外 VPN -> DMZ 跳板机 -> 工程师站" rows={4} /></div></td></tr><tr><th>初始网络边界</th><td><div className={`${styles.tableField} ${invalidClass('initialBoundaryNotes')}`}><div className={styles.tableFieldHint}>记录现有网络隔离、边界设备和明显薄弱点，便于后续做分区设计。</div><textarea value={formData.initialBoundaryNotes} onChange={(event) => updateFieldWithValidation('initialBoundaryNotes', event.target.value)} placeholder="示例：现有控制网与信息网之间已有防火墙，但工程师站与控制器仍在同一扁平网段" rows={4} /></div></td></tr><tr><th>工艺连续性要求</th><td><div className={`${styles.tableField} ${invalidClass('continuityRequirements')}`}><div className={styles.tableFieldHint}>填写不可中断的关键控制要求、允许切换的窗口和连续运行约束。</div><textarea value={formData.continuityRequirements} onChange={(event) => updateFieldWithValidation('continuityRequirements', event.target.value)} placeholder="示例：裂解炉控制不可中断，停车切换必须在计划窗口内执行" rows={4} /></div></td></tr><tr><th>合规补充说明</th><td><div className={`${styles.tableField} ${invalidClass('complianceNotes')}`}><div className={styles.tableFieldHint}>补充安环、审计、留痕或行业监管方面的特殊要求。</div><textarea value={formData.complianceNotes} onChange={(event) => updateFieldWithValidation('complianceNotes', event.target.value)} placeholder="示例：涉及安环与关键工艺连续性要求，远程访问必须留痕" rows={4} /></div></td></tr><tr><th>责任归属</th><td className={isMissing('remoteOperationsOwnership') ? styles.invalidField : ''}><div className={styles.tableField}><div className={styles.tableFieldHint}>确定远程运维、持续控制或外部支持的责任落点。</div><OptionCards value={formData.remoteOperationsOwnership} onChange={(value) => updateFieldWithValidation('remoteOperationsOwnership', value)} options={REMOTE_OWNERSHIP_OPTIONS} invalid={isMissing('remoteOperationsOwnership')} /></div></td></tr><tr><th>验收偏好</th><td className={isMissing('acceptancePreference') ? styles.invalidField : ''}><div className={styles.tableField}><div className={styles.tableFieldHint}>说明本项目更偏重文档、演示、测试记录还是综合证据。</div><OptionCards value={formData.acceptancePreference} onChange={(value) => updateFieldWithValidation('acceptancePreference', value)} options={ACCEPTANCE_PREFERENCE_OPTIONS} invalid={isMissing('acceptancePreference')} /></div></td></tr></tbody></table></div>;
      break;
    case 'assets':
      content = <table className={styles.tableForm}><tbody><tr><th>关键对象</th><td className={invalidClass('criticalAssets')}><div className={styles.tableField}><div className={styles.tableFieldHint}>请选择本项目优先纳入安全设计、边界控制和能力验证范围的对象。</div><div className={styles.assetMatrix}>{ASSETS.map((asset) => <button key={asset.id} type="button" className={`${styles.assetCell} ${formData.criticalAssets.includes(asset.id) ? styles.assetActive : ''}`} onClick={() => toggleAsset(asset.id)}>{asset.name}</button>)}</div></div></td></tr></tbody></table>;
      break;
    default:
      content = (
        <article className={styles.documentPage}>
          <header className={styles.documentHeader}>
            <span>IEC 62443 需求访谈摘要</span>
            <h2>{state.projectMeta?.projectName || formData.projectName || '未命名项目'}</h2>
          </header>

          <div className={styles.summaryTop}>
          <section className={styles.documentSection}>
            <h3>一、项目概况</h3>
            <div className={styles.documentGrid}>
              <div><span>项目名称</span><strong>{state.projectMeta?.projectName || formData.projectName || '未填写'}</strong></div>
              <div><span>行业场景</span><strong>{selectedIndustry?.name || '未填写'}</strong></div>
              <div><span>业主单位</span><strong>{state.projectMeta?.organizationName || '未填写'}</strong></div>
              <div><span>项目站点</span><strong>{state.projectMeta?.siteName || '未填写'}</strong></div>
              <div><span>项目类型</span><strong>{state.projectMeta?.scenarioType || '未填写'}</strong></div>
              <div><span>项目目标</span><strong>{state.projectMeta?.projectObjective || '未填写'}</strong></div>
            </div>
          </section>

          <section className={styles.documentSection}>
            <ImpactRadarChart fields={IMPACT_FIELDS} values={formData} />
          </section>
          </div>

          <section className={styles.documentSection}>
            <h3>二、业务后果判断</h3>
            <div className={styles.documentQuadList}>
              {IMPACT_FIELDS.map((field) => {
                const currentLevel = formData[field.key];
                const currentText = currentLevel ? field.levels[currentLevel] : '未填写';
                return <div key={field.key} className={styles.documentEntry}><div className={styles.documentEntryHead}><strong>{field.label}</strong><span>{resolveLevel(currentLevel)}</span></div><p>{currentText}</p></div>;
              })}
            </div>
          </section>

          <section className={styles.documentSection}>
            <h3>三、暴露面与运维方式</h3>
            <div className={styles.documentQuadList}>
              {EXPOSURE_FIELDS.map((field) => {
                const currentOption = field.options.find((item) => item.value === formData[field.key]);
                return <div key={field.key} className={styles.documentEntry}><div className={styles.documentEntryHead}><strong>{field.label}</strong><span>{currentOption?.label || '未填写'}</span></div><p>{currentOption?.description || '未填写'}</p></div>;
              })}
              <div className={styles.documentEntry}><div className={styles.documentEntryHead}><strong>责任归属</strong><span>{ownershipOption?.label || '未填写'}</span></div><p>{ownershipOption?.description || '未填写'}</p></div>
            </div>
          </section>

          <section className={styles.documentSection}>
            <h3>四、现状基础</h3>
            <div className={styles.documentQuadList}>
              {MATURITY_FIELDS.map((field) => {
                const currentLevel = formData[field.key];
                const currentText = currentLevel ? field.levels[currentLevel] : '未填写';
                return <div key={field.key} className={styles.documentEntry}><div className={styles.documentEntryHead}><strong>{field.label}</strong><span>{resolveLevel(currentLevel)}</span></div><p>{currentText}</p></div>;
              })}
            </div>
          </section>

          <section className={styles.documentSection}>
            <h3>五、关键约束与对象</h3>
            <div className={styles.documentQuadList}>
              <div className={styles.documentEntry}><div className={styles.documentEntryHead}><strong>常规维护窗口</strong><span>{formData.maintenanceWindow || '未填写'}</span></div></div>
              <div className={styles.documentEntry}><div className={styles.documentEntryHead}><strong>改造窗口</strong><span>{formData.upgradeWindow || '未填写'}</span></div></div>
              <div className={styles.documentEntry}><div className={styles.documentEntryHead}><strong>验收偏好</strong><span>{acceptanceOption?.label || '未填写'}</span></div><p>{acceptanceOption?.description || '未填写'}</p></div>
              <div className={`${styles.documentEntry} ${styles.documentEntryWide}`}><div className={styles.documentEntryHead}><strong>关键对象</strong><span>{formData.criticalAssets.length} 个</span></div><div className={styles.assetSummary}>{formData.criticalAssets.length ? formData.criticalAssets.map((item) => <span key={item} className={styles.assetTag}>{ASSETS.find((asset) => asset.id === item)?.name || item}</span>) : <span className={styles.emptyText}>未选择</span>}</div></div>
            </div>
          </section>

          <section className={styles.documentSection}>
            <h3>六、系统与边界补充</h3>
            <div className={styles.documentColumns}>
              <div className={styles.documentEntry}><div className={styles.documentEntryHead}><strong>关键系统/角色</strong><span>{formData.keySystems ? '已填写' : '未填写'}</span></div><p>{formData.keySystems || '未填写'}</p></div>
              <div className={styles.documentEntry}><div className={styles.documentEntryHead}><strong>外部连接方式</strong><span>{formData.externalConnections ? '已填写' : '未填写'}</span></div><p>{formData.externalConnections || '未填写'}</p></div>
              <div className={styles.documentEntry}><div className={styles.documentEntryHead}><strong>维护接入方式</strong><span>{formData.maintenanceAccessPath ? '已填写' : '未填写'}</span></div><p>{formData.maintenanceAccessPath || '未填写'}</p></div>
              <div className={styles.documentEntry}><div className={styles.documentEntryHead}><strong>初始网络边界</strong><span>{formData.initialBoundaryNotes ? '已填写' : '未填写'}</span></div><p>{formData.initialBoundaryNotes || '未填写'}</p></div>
              <div className={styles.documentEntry}><div className={styles.documentEntryHead}><strong>工艺连续性要求</strong><span>{formData.continuityRequirements ? '已填写' : '未填写'}</span></div><p>{formData.continuityRequirements || '未填写'}</p></div>
              <div className={styles.documentEntry}><div className={styles.documentEntryHead}><strong>合规补充说明</strong><span>{formData.complianceNotes ? '已填写' : '未填写'}</span></div><p>{formData.complianceNotes || '未填写'}</p></div>
            </div>
          </section>
        </article>
      );
  }

  const isSummaryStep = currentStep === STEPS.length - 1;

  return (
    <CaseStageLayout><ProjectStageShell
      stageNumber="01"
      title="提出目标"
      projectName={state.projectMeta?.projectName || formData.projectName}
      outputLabel="标准化项目输入"
      statusText={isSummaryStep ? '已形成业主输入与目标摘要，可生成需求与目标摘要' : '正在梳理业主输入、目标要求和约束条件'}
      statusPanel={<StatusSummaryPanel label="当前步骤" value={`${currentStep + 1} / ${STEPS.length}`} note={validationMessage || (isSummaryStep ? '复核无误后可生成需求与目标摘要。' : '点击下一步时会检查当前页必填内容。')} pills={[step.title, isSummaryStep ? '可生成需求与目标摘要' : '待继续完善']} />}
      guidance={{ summary: activeGuidance || step.guidance }}
    >
      {({ statusBar }) => (
        <>
          <section className={styles.workspace}>
            <StepTabs items={STEPS} currentIndex={currentStep} onChange={validateBeforeStepChange} />
                        <div className={`${styles.panel} ${isSummaryStep ? styles.documentPanel : ''}`}>{content}</div>
            {statusBar}
          </section>
          <WorkflowNavBar
            leftLabel={currentStep === 0 ? '返回框架总览' : '上一步'}
            rightLabel={isSummaryStep ? '生成需求与目标摘要' : '下一步'}
            onLeftClick={currentStep === 0 ? () => navigate('/dashboard') : () => setCurrentStep((prev) => Math.max(prev - 1, 0))}
            onRightClick={isSummaryStep ? () => handleFinalizeSummary('/owner/result') : handleNextStep}
          />
        </>
      )}
    </ProjectStageShell></CaseStageLayout>
  );
}
