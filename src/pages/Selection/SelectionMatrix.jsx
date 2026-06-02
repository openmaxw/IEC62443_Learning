import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, DataTable, NotePanel, SectionBlock, StatusBadge, StatusSummaryPanel, StepTabs, WorkflowNavBar } from '../../components/Common';
import { ProjectStageShell } from '../../components/ProjectFlow';
import { getCapabilityDisplay } from '../../data/capabilities';
import { useIntegratorPath, useProject, useVendorPath } from '../../hooks/useProject';
import { getSelectionViewModel } from '../../domain/viewModels/selectionReportViewModels';
import styles from './SelectionMatrix.module.css';

const STEPS = [
  { id: 'overview', title: '匹配结果总览', guidance: '查看设计能力需求与能力说明的匹配情况，确认哪些能力满足、部分满足或需要外部补偿。' },
  { id: 'gaps', title: '待处置项', guidance: '集中查看需要处置的能力差距、严重度和责任建议，优先处理影响验收的项目。' },
  { id: 'mitigation', title: '补偿措施', guidance: '为每个差距填写项目级补偿措施、替代控制或实施动作。' },
  { id: 'risk', title: '验收与风险', guidance: '补充责任方、验收影响和残余风险，明确差距关闭条件。' },
  { id: 'review', title: '闭环确认', guidance: '复核闭环信息并保存结果，保存后进入学习总结查看汇总。' }
];

const STATUS_LABELS = { native: '产品原生满足', fulfilled: '产品原生满足', configured: '配置后满足', partial: '配置后满足', external: '需外部系统共同实现', compensating: '需补偿措施后接受', missing: '当前不满足', na: '不适用' };

function hasSavedClosure(item) {
  return Boolean(item?.saved && item?.mitigation && item?.owner && item?.acceptanceImpact && item?.residualRisk);
}

function isSameObject(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function SelectionMatrix({ initialStep = 0 }) {
  const navigate = useNavigate();
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
    if (dirtyGapItems || isSameObject(viewModel.gapItems, gapItems)) return undefined;

    const timer = window.setTimeout(() => {
      setGapItems(viewModel.gapItems);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [viewModel.gapItems, gapItems, dirtyGapItems]);

  const handleSaveSelection = () => {
    const nextResults = { results: viewModel.selection.rows, summary: viewModel.selection.summary };
    if (!isSameObject(state.selectionAnalysis?.results, nextResults)) {
      actions.setMatchResults(nextResults);
    }
  };

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
      content = <section className={styles.page}><div className={styles.hero}><div><strong>匹配概览</strong><p>请先确认当前设计能力需求与最新能力说明的匹配结果。</p><span className={styles.meta}>{viewModel.latestCapability ? '已识别最新能力说明。' : '尚未生成能力说明，结果将显示为待满足。'}</span></div><div className={styles.actions}><Button variant="secondary" size="medium" onClick={handleSaveSelection}>保存匹配结果</Button><Button variant="primary" size="medium" onClick={() => goToStepWithValidation(1)}>查看待处置项</Button></div></div><table className={styles.table}><thead><tr><th>能力项</th><th>控制目标</th><th>满足情况</th><th>证据类型</th><th>差距说明</th></tr></thead><tbody>{viewModel.selection.rows.length ? viewModel.selection.rows.map((item) => <tr key={item.id}><td>{getCapabilityDisplay(item.capabilityId).label}</td><td>{item.controlObjective}</td><td><StatusBadge tone={item.status === 'missing' ? 'danger' : item.status === 'external' || item.status === 'configured' || item.status === 'compensating' || item.status === 'partial' ? 'warning' : 'success'}>{STATUS_LABELS[item.status] || item.status}</StatusBadge></td><td>{item.evidenceType}</td><td>{item.gapNote}</td></tr>) : <tr><td colSpan="5" className={styles.empty}>当前没有可分析的能力需求，请先返回方案转译与能力说明页面补充输入。</td></tr>}</tbody></table></section>;
      break;
    case 'gaps':
      content = <section className={styles.page}><div className={styles.hero}><div><strong>待处置项</strong><p>{pendingGapItems.length ? '以下差距仍需补充补偿措施、责任方、验收影响或残余风险。' : '当前差距项均已完成处置记录。'}</p><span className={styles.meta}>已处置 {closedGapItems.length} / {gapItems.length}</span></div></div><table className={styles.table}><thead><tr><th>能力项</th><th>控制目标</th><th>严重度</th><th>差距说明</th><th>责任建议</th></tr></thead><tbody>{pendingGapItems.length ? pendingGapItems.map((item) => <tr key={item.id}><td>{getCapabilityDisplay(item.capabilityId).label}</td><td>{item.controlObjective}</td><td><StatusBadge tone={item.severity === 'high' ? 'danger' : item.severity === 'medium' ? 'warning' : 'success'}>{item.severity}</StatusBadge></td><td>{item.gapNote}</td><td>{item.owner || '未填写'}</td></tr>) : <tr><td colSpan="5" className={styles.empty}>当前没有待处置差距项；如需查看已处置内容，请前往“闭环确认”。</td></tr>}</tbody></table></section>;
      break;
    case 'mitigation':
      content = <section className={styles.page}>{gapItems.length ? <table className={styles.formTable}><thead><tr><th>能力项</th><th>控制目标</th><th>补偿措施</th></tr></thead><tbody>{gapItems.map((item) => <tr key={item.id}><th>{getCapabilityDisplay(item.capabilityId).label}</th><td>{item.controlObjective}</td><td className={invalidClass(`${item.id}:mitigation`)}><textarea value={item.mitigation || ''} onChange={(event) => updateGapItem(item.id, 'mitigation', event.target.value)} rows="3" placeholder="填写项目级补偿措施、替代控制或实施动作" /></td></tr>)}</tbody></table> : <div className={styles.empty}>当前没有需要闭环的差距项。</div>}</section>;
      break;
    case 'risk':
      content = <section className={styles.page}>{gapItems.length ? <table className={styles.formTable}><thead><tr><th>能力项</th><th>责任方</th><th>验收影响</th><th>残余风险</th></tr></thead><tbody>{gapItems.map((item) => <tr key={item.id}><th><div><strong>{getCapabilityDisplay(item.capabilityId).label}</strong><span className={styles.meta}>{item.status} / {item.severity}</span></div></th><td className={invalidClass(`${item.id}:owner`)}><input value={item.owner || ''} onChange={(event) => updateGapItem(item.id, 'owner', event.target.value)} placeholder="示例：设备商 / 集成商 / 业主" /></td><td className={invalidClass(`${item.id}:acceptanceImpact`)}><textarea value={item.acceptanceImpact || ''} onChange={(event) => updateGapItem(item.id, 'acceptanceImpact', event.target.value)} rows="2" placeholder="填写是否影响验收、前置条件和确认方式" /></td><td className={invalidClass(`${item.id}:residualRisk`)}><textarea value={item.residualRisk || ''} onChange={(event) => updateGapItem(item.id, 'residualRisk', event.target.value)} rows="2" placeholder="填写是否登记残余风险及后续跟踪要求" /></td></tr>)}</tbody></table> : <div className={styles.empty}>当前没有需要闭环的差距项。</div>}</section>;
      break;
    default:
      content = <section className={styles.page}><div className={styles.hero}><div><strong>闭环确认</strong><p>确认匹配结果与闭环信息后生成闭环结果，随后进入学习总结查看汇总。</p><span className={styles.meta}>{savedAtLeastOnce || gapClosureItems.length ? '已保存部分或全部闭环决策。' : '尚未保存闭环决策。'}</span></div></div><table className={styles.table}><thead><tr><th>能力项</th><th>补偿措施</th><th>验收影响</th><th>残余风险</th><th>责任方</th></tr></thead><tbody>{gapItems.length ? gapItems.map((item) => <tr key={item.id}><td>{getCapabilityDisplay(item.capabilityId).label}</td><td>{item.mitigation || '未填写'}</td><td>{item.acceptanceImpact || '未填写'}</td><td>{item.residualRisk || '未填写'}</td><td>{item.owner || '未填写'}</td></tr>) : <tr><td colSpan="5" className={styles.empty}>当前没有需要闭环的差距项。</td></tr>}</tbody></table></section>;
  }

  return (
    <ProjectStageShell stageNumber="04" title="差距分析" projectName={viewModel.projectName} outputLabel="匹配差距闭环" statusText={viewModel.statusSummary.headline} guidance={{ summary: step.guidance }} statusPanel={<StatusSummaryPanel label={viewModel.statusSummary.title} value={viewModel.statusSummary.headline} note={validationMessage || viewModel.statusSummary.detail} pills={viewModel.statusSummary.pills} />}>
      {({ statusBar }) => (
        <section className={styles.page}>
          <StepTabs items={STEPS} currentIndex={currentStep} onChange={goToStepWithValidation} />
          <div>{content}</div>
          {statusBar}
          <SectionBlock title="运行期控制计划（服务提供方细分视角）"><DataTable><thead><tr><th>控制项</th><th>执行频率</th><th>执行方</th><th>输入</th><th>输出记录</th></tr></thead><tbody><tr><td>远程维护账号审查</td><td>每月</td><td>维护方 / 业主运维</td><td>账号清单、远程访问日志</td><td>审查记录、异常关闭记录</td></tr><tr><td>日志留存与转发检查</td><td>每周</td><td>维护方</td><td>Syslog 转发状态、平台告警</td><td>检查记录、异常工单</td></tr><tr><td>补丁评估与变更审批</td><td>每季度或按需</td><td>维护方 / 集成商</td><td>厂商补丁说明、风险评估</td><td>变更审批单、回退计划</td></tr><tr><td>第三方远程接入审批</td><td>按次</td><td>业主 / 维护方</td><td>访问申请、任务单</td><td>审批记录、会话审计记录</td></tr></tbody></DataTable></SectionBlock>
        <NotePanel title="差距处置说明" notes={["请完整填写补偿措施、责任归属、验收影响与残余风险信息。", "如需补充能力说明或设计依据，请返回前序页面更新后再继续差距处置。"]} />
          <WorkflowNavBar leftLabel={currentStep === 0 ? '返回设备结果' : '上一步'} rightLabel={isReviewStep ? '生成闭环结果' : '下一步'} onLeftClick={currentStep === 0 ? () => navigate('/vendor/result') : () => setCurrentStep((prev) => Math.max(prev - 1, 0))} onRightClick={isReviewStep ? handleFinalSave : handleNextStep} />
        </section>
      )}
    </ProjectStageShell>
  );
}
