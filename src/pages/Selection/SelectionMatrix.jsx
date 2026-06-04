import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button, DataTable, SectionBlock, StatusBadge, StatusSummaryPanel, StepTabs, WorkflowNavBar } from '../../components/Common';
import { CaseStageLayout, ProjectStageShell } from '../../components/ProjectFlow';
import { getCapabilityDisplay } from '../../data/capabilities';
import { useIntegratorPath, useProject, useVendorPath } from '../../hooks/useProject';
import { getSelectionViewModel } from '../../domain/viewModels/selectionReportViewModels';
import styles from './SelectionMatrix.module.css';
import { resolveStepIndex } from '../../utils/stepRouting';

const STEPS = [
  { id: 'overview', title: '未对齐项总览', guidance: '基于上一页三阶段对应总表，先查看哪些项已经对应、哪些项仍未对齐，再进入具体处置。' },
  { id: 'gaps', title: '待处置项', guidance: '集中查看仍未对齐的能力项、严重度和责任建议，优先处理影响验收的项目。' },
  { id: 'mitigation', title: '补偿措施', guidance: '为每个差距填写项目级补偿措施、替代控制或实施动作。' },
  { id: 'risk', title: '验收与风险', guidance: '补充责任方、验收影响和残余风险，明确差距关闭条件。' },
  { id: 'review', title: '闭环确认', guidance: '复核未对齐项的闭环信息并保存结果，保存后进入形成结论查看综合结论。' }
];

const STATUS_LABELS = { native: '产品原生满足', fulfilled: '产品原生满足', configured: '配置后满足', partial: '配置后满足', external: '需外部系统共同实现', compensating: '需补偿措施后接受', missing: '当前不满足', na: '不适用' };

function FieldExplain({ title, hint }) {
  return <div><strong>{title}</strong><span className={styles.meta}>{hint}</span></div>;
}

function hasSavedClosure(item) {
  return Boolean(item?.saved && item?.mitigation && item?.owner && item?.acceptanceImpact && item?.residualRisk);
}

function isSameObject(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function SelectionMatrix({ initialStep = 0 }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { state, actions } = useProject();
  const { projectMeta, plan } = useIntegratorPath();
  const { capabilities, gapClosureItems } = useVendorPath();
  const viewModel = getSelectionViewModel({ projectMeta, plan, capabilities, gapClosureItems });
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [validationMessage, setValidationMessage] = useState('');
  const [missingFields, setMissingFields] = useState([]);
  const [savedAtLeastOnce, setSavedAtLeastOnce] = useState(false);
  const [dirtyGapItems, setDirtyGapItems] = useState(false);
  const [gapItems, setGapItems] = useState(viewModel.gapItems);
  const pendingGapItems = gapItems.filter((item) => !hasSavedClosure(item));
  const closedGapItems = gapItems.filter(hasSavedClosure);
  const step = STEPS[currentStep];
  const isReviewStep = currentStep === STEPS.length - 1;

  useEffect(() => {
    const targetIndex = resolveStepIndex(searchParams.get('step'), STEPS.length);
    if (targetIndex !== null) {
      setCurrentStep(targetIndex);
    }
  }, [searchParams]);

  useEffect(() => {
    if (dirtyGapItems || isSameObject(viewModel.gapItems, gapItems)) return undefined;

    const timer = window.setTimeout(() => {
      setGapItems(viewModel.gapItems);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [viewModel.gapItems, gapItems, dirtyGapItems]);


  const updateGapItem = (id, field, value) => {
    setValidationMessage('');
    setMissingFields([]);
    setDirtyGapItems(true);
    setGapItems((prev) => prev.map((item) => (item.id === id ? { ...item, [field]: value, saved: false } : item)));
  };

  const handleSaveGap = (targetRoute) => {
    if (!isSameObject(state.selectionAnalysis?.results, { results: viewModel.selection.rows, summary: viewModel.selection.summary })) {
      actions.setMatchResults({ results: viewModel.selection.rows, summary: viewModel.selection.summary });
    }
    if (!isSameObject(state.gapClosure?.items, gapItems)) {
      actions.setGapClosureItems(gapItems.map((item) => ({ ...item, saved: true })));
    }
    setDirtyGapItems(false);
    setSavedAtLeastOnce(true);
    if (targetRoute) navigate(targetRoute);
  };

  const isMissing = (field) => missingFields.includes(field);
  const invalidClass = (field) => (isMissing(field) ? styles.invalidField : '');

  const getStepValidationResult = (stepId = step.id) => {
    if (stepId === 'mitigation') {
      const fields = gapItems.filter((item) => !item.mitigation).map((item) => `${item.id}:mitigation`);
      if (fields.length) return { message: '请为每个差距填写补偿措施，再进入下一步。', fields };
    }
    if (stepId === 'risk') {
      const fields = gapItems.flatMap((item) => ['owner', 'acceptanceImpact', 'residualRisk'].filter((field) => !item[field]).map((field) => `${item.id}:${field}`));
      if (fields.length) return { message: '请补齐每个差距的责任方、验收影响和残余风险。', fields };
    }
    return { message: '', fields: [] };
  };

  const goToStepWithValidation = (targetStep) => {
    if (targetStep <= currentStep) {
      setValidationMessage('');
      setMissingFields([]);
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

    setValidationMessage('');
    setMissingFields([]);
    setCurrentStep(targetStep);
  };

  const handleNextStep = () => {
    goToStepWithValidation(Math.min(currentStep + 1, STEPS.length - 1));
  };

  const handleFinalSave = () => {
    const mitigationResult = getStepValidationResult('mitigation');
    if (mitigationResult.message) {
      setCurrentStep(2);
      setValidationMessage(mitigationResult.message);
      setMissingFields(mitigationResult.fields);
      return;
    }

    const riskResult = getStepValidationResult('risk');
    if (riskResult.message) {
      setCurrentStep(3);
      setValidationMessage(riskResult.message);
      setMissingFields(riskResult.fields);
      return;
    }

    handleSaveGap('/report');
  };

  let content;
  switch (step.id) {
    case 'overview':
      content = <section className={styles.page}><div className={styles.hero}><div><strong>未对齐项总览</strong><p>这里承接上一页的三阶段对应总表，专门识别哪些项已经形成有效回应，哪些项仍存在未对齐。</p></div></div><DataTable><thead><tr><th>能力项</th><th>控制目标</th><th>当前状态</th><th>证据类型</th><th>未对齐说明</th></tr></thead><tbody>{viewModel.selection.rows.length ? viewModel.selection.rows.map((item) => <tr key={item.id}><td>{getCapabilityDisplay(item.capabilityId).label}</td><td>{item.controlObjective}</td><td><StatusBadge tone={item.status === 'missing' ? 'statusMissing' : item.status === 'external' || item.status === 'configured' || item.status === 'compensating' || item.status === 'partial' ? 'statusConfigured' : item.status === 'na' ? 'statusNa' : 'statusNative'}>{STATUS_LABELS[item.status] || item.status}</StatusBadge></td><td>{item.evidenceType}</td><td>{item.gapNote}</td></tr>) : <tr><td colSpan="5" className={styles.empty}>当前没有可分析的能力需求，请先返回方案转译与能力说明页面补充输入。</td></tr>}</tbody></DataTable></section>;
      break;
    case 'gaps':
      content = <section className={styles.page}><div className={styles.hero}><div><strong>待处置项</strong><p>{pendingGapItems.length ? '以下差距仍需补充补偿措施、责任方、验收影响或残余风险。' : '当前差距项均已完成处置记录。'}</p><span className={styles.meta}>已处置 {closedGapItems.length} / {gapItems.length}</span></div></div><DataTable><thead><tr><th>能力项</th><th>控制目标</th><th>严重度</th><th>差距说明</th><th>责任建议</th></tr></thead><tbody>{pendingGapItems.length ? pendingGapItems.map((item) => <tr key={item.id}><td>{getCapabilityDisplay(item.capabilityId).label}</td><td>{item.controlObjective}</td><td><StatusBadge tone={item.severity === 'high' ? 'levelHigh' : item.severity === 'medium' ? 'levelMedium' : 'levelLow'}>{item.severity === 'high' ? '高' : item.severity === 'medium' ? '中' : '低'}</StatusBadge></td><td>{item.gapNote}</td><td>{item.owner || '未填写'}</td></tr>) : <tr><td colSpan="5" className={styles.empty}>当前没有待处置差距项；如需查看已处置内容，请前往“闭环确认”。</td></tr>}</tbody></DataTable></section>;
      break;
    case 'mitigation':
      content = <section className={styles.page}>{gapItems.length ? <DataTable className={styles.formTable}><thead><tr><th>能力项</th><th>控制目标</th><th>补偿措施</th></tr></thead><tbody>{gapItems.map((item) => <tr key={item.id}><th>{getCapabilityDisplay(item.capabilityId).label}</th><td>{item.controlObjective}</td><td className={invalidClass(`${item.id}:mitigation`)}><FieldExplain title="补偿措施" hint="填写项目级替代控制、实施动作或闭环安排。" /><textarea value={item.mitigation || ''} onChange={(event) => updateGapItem(item.id, 'mitigation', event.target.value)} rows="3" placeholder="填写补偿措施、替代控制或实施动作" /></td></tr>)}</tbody></DataTable> : <div className={styles.empty}>暂无待闭环项。</div>}</section>;
      break;
    case 'risk':
      content = <section className={styles.page}>{gapItems.length ? <DataTable className={styles.formTable}><thead><tr><th>能力项</th><th>责任方</th><th>验收影响</th><th>残余风险</th></tr></thead><tbody>{gapItems.map((item) => <tr key={item.id}><th><div><strong>{getCapabilityDisplay(item.capabilityId).label}</strong><span className={styles.meta}>{item.status} / {item.severity}</span></div></th><td className={invalidClass(`${item.id}:owner`)}><FieldExplain title="责任方" hint="填写最终负责落实或协调该项闭环的角色。" /><input value={item.owner || ''} onChange={(event) => updateGapItem(item.id, 'owner', event.target.value)} placeholder="示例：设备商 / 集成商 / 业主" /></td><td className={invalidClass(`${item.id}:acceptanceImpact`)}><FieldExplain title="验收影响" hint="说明该差距对当前验收结论和通过条件的影响。" /><textarea value={item.acceptanceImpact || ''} onChange={(event) => updateGapItem(item.id, 'acceptanceImpact', event.target.value)} rows="2" placeholder="填写验收影响与确认方式" /></td><td className={invalidClass(`${item.id}:residualRisk`)}><FieldExplain title="残余风险" hint="说明闭环后仍需跟踪、接受或转移的剩余风险。" /><textarea value={item.residualRisk || ''} onChange={(event) => updateGapItem(item.id, 'residualRisk', event.target.value)} rows="2" placeholder="填写残余风险与后续跟踪要求" /></td></tr>)}</tbody></DataTable> : <div className={styles.empty}>暂无待闭环项。</div>}</section>;
      break;
    default:
      content = <section className={styles.page}><DataTable><thead><tr><th>能力项</th><th>补偿措施</th><th>验收影响</th><th>残余风险</th><th>责任方</th></tr></thead><tbody>{gapItems.length ? gapItems.map((item) => <tr key={item.id}><td><strong>{getCapabilityDisplay(item.capabilityId).label}</strong><span className={styles.meta}>{item.saved || savedAtLeastOnce || gapClosureItems.length ? '已保存' : '待确认'}</span></td><td>{item.mitigation || '未填写'}</td><td>{item.acceptanceImpact || '未填写'}</td><td>{item.residualRisk || '未填写'}</td><td>{item.owner || '未填写'}</td></tr>) : <tr><td colSpan="5" className={styles.empty}>暂无待闭环项。</td></tr>}</tbody></DataTable></section>;
  }

  return (
    <CaseStageLayout><ProjectStageShell stageNumber="05" title="差距闭环" projectName={viewModel.projectName} outputLabel="基于对应总表识别未对齐项并完成闭环" statusText={viewModel.statusSummary.headline} guidance={{ summary: `${step.guidance}${step.id === 'overview' ? ' 建议先确认哪些项已经对应、哪些项仍未对齐，再进入待处置项。' : step.id === 'gaps' ? ' 建议先看高影响未对齐项，再判断哪些项需要优先闭环。' : step.id === 'mitigation' ? ' 建议先写补偿措施，再进入责任与验收影响说明。' : step.id === 'risk' ? ' 建议先明确责任方，再写验收影响与残余风险。' : ' 建议先确认补偿措施，再确认责任、验收影响和残余风险是否齐备。'}` }} statusPanel={<StatusSummaryPanel label={viewModel.statusSummary.title} value={viewModel.statusSummary.headline.replace('仍有 ', '有 ')} note={(validationMessage || viewModel.statusSummary.detail).replace('仍有 ', '有 ')} pills={viewModel.statusSummary.pills} />}>
      {({ statusBar }) => (
        <section className={styles.page}>
          <StepTabs items={STEPS} currentIndex={currentStep} onChange={goToStepWithValidation} />
          <div>{content}</div>
          {statusBar}
          <WorkflowNavBar leftLabel={currentStep === 0 ? '返回上一步' : '上一步'} rightLabel={isReviewStep ? '进入形成结论' : '下一步'} onLeftClick={currentStep === 0 ? () => navigate('/vendor?step=6') : () => setCurrentStep((prev) => Math.max(prev - 1, 0))} onRightClick={isReviewStep ? handleFinalSave : handleNextStep} />
        </section>
      )}
    </ProjectStageShell></CaseStageLayout>
  );
}
