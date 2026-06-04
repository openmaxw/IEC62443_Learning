import { Link, useSearchParams } from 'react-router-dom';
import { ActionBar, Button, DataTable, PillTag, SectionBlock, StatusBadge, StatusSummaryPanel } from '../../components/Common';
import { CaseStageLayout, ProjectStageShell } from '../../components/ProjectFlow';
import { useIntegratorPath, useOwnerPath } from '../../hooks/useProject';
import { getIntegratorResultViewModel, resolveMatchLabel } from '../../domain/viewModels/resultViewModels';
import styles from './IntegratorResult.module.css';

const ROLE_LABELS = { control: '控制', monitoring: '监控', engineering: '工程', server: '服务' };
const ZONE_LABELS = { 'zone-enterprise': '企业网络', 'zone-dmz': 'DMZ', 'zone-supervisory': '监控区域', 'zone-ot': 'OT网络', 'zone-cell': '单元区域', 'zone-safety': '安全系统' };

export function IntegratorResult() {
  const [searchParams] = useSearchParams();
  const isReviewMode = searchParams.get('review') === '1';
  const integratorPath = useIntegratorPath();
  const { assessment } = useOwnerPath();
  const viewModel = getIntegratorResultViewModel({ ...integratorPath, assessment });

  if (!viewModel.hasPlan) {
    return (
      <CaseStageLayout><ProjectStageShell stageNumber="02" title="设计响应摘要" projectName={viewModel.projectName} outputLabel="设计响应与依据">
        <div className={styles.empty}><Link to="/integrator"><Button variant="primary">进入本页</Button></Link></div>
      </ProjectStageShell></CaseStageLayout>
    );
  }

  const summaryItems = [
    { label: '关键系统/角色', value: viewModel.designBasisSummary?.keySystems || '未填写' },
    { label: '外部连接方式', value: viewModel.designBasisSummary?.externalConnections || '未填写' },
    { label: '维护接入方式', value: viewModel.designBasisSummary?.maintenanceAccessPath || '未填写' },
    { label: '初始网络边界', value: viewModel.designBasisSummary?.initialBoundaryNotes || '未填写' },
    { label: '工艺连续性要求', value: viewModel.designBasisSummary?.continuityRequirements || '未填写' },
    { label: '总体设计依据', value: viewModel.designBasisSummary?.designBasis || '未填写' }
  ];

  return (
    <CaseStageLayout><ProjectStageShell stageNumber="02" title="设计响应摘要" projectName={viewModel.projectName} outputLabel="设计响应与依据" statusText={viewModel.statusSummary.headline} guidance={{ summary: '本页用于回看系统级设计响应，确认项目输入是否已经被设计层正确承接，并形成后续能力匹配与判断所需基础。' }} statusPanel={<StatusSummaryPanel label={viewModel.statusSummary.title} value={viewModel.statusSummary.headline} note={viewModel.statusSummary.detail} pills={viewModel.statusSummary.pills} />}>
      {({ statusBar }) => (
      <>
      <SectionBlock title="设计依据">
        <DataTable className={styles.compareTable}>
          <thead><tr><th>项目</th><th>内容</th></tr></thead>
          <tbody>{summaryItems.map((item) => <tr key={item.label}><td>{item.label}</td><td className={styles.assetNameCell}>{item.value}</td></tr>)}</tbody>
        </DataTable>
      </SectionBlock>

      <SectionBlock title="资产归组与 Zone 说明">
        <DataTable className={styles.compareTable}>
          <thead><tr><th>资产/对象</th><th>所属 Zone</th><th>角色</th><th>归组原因</th></tr></thead>
          <tbody>{viewModel.assets.length ? viewModel.assets.map((asset) => <tr key={asset.id}><td className={styles.assetNameCell}>{asset.name}</td><td>{ZONE_LABELS[asset.zone] || asset.zone}</td><td>{ROLE_LABELS[asset.role] || asset.role}</td><td>{asset.groupingReason || '未填写归组原因'}</td></tr>) : <tr><td colSpan="4" className={styles.emptyCell}>暂无资产归组信息。</td></tr>}</tbody>
        </DataTable>
      </SectionBlock>

      <SectionBlock title="通信矩阵与边界控制">
        <DataTable className={styles.compareTable}>
          <thead><tr><th>源区 → 目标区</th><th>协议 / 方向</th><th>业务理由</th><th>必要性 / 边界控制</th></tr></thead>
          <tbody>{viewModel.communicationFlows.length ? viewModel.communicationFlows.map((flow) => <tr key={flow.id}><td>{flow.source} → {flow.target}</td><td>{flow.protocol} / {flow.direction || '未填写'}</td><td>{flow.businessReason}</td><td>{[flow.necessity, flow.boundaryControl].filter(Boolean).join('；') || '未填写'}</td></tr>) : <tr><td colSpan="4" className={styles.emptyCell}>暂无通信流数据。</td></tr>}</tbody>
        </DataTable>
      </SectionBlock>

      <SectionBlock title="组件能力需求清单">
        <DataTable className={styles.compareTable}>
          <thead><tr><th>能力要求</th><th>FR / SR</th><th>控制目标</th><th>实现提示</th></tr></thead>
          <tbody>{viewModel.capabilityRequirements.length ? viewModel.capabilityRequirements.map((item) => <tr key={item.id}><td><strong>{item.display.label}</strong></td><td><div className={styles.capabilityMeta}><PillTag tone="primary">{item.display.frText}</PillTag><PillTag tone="primary">{item.display.srText}</PillTag></div></td><td>{item.controlObjective}</td><td>{item.implementationHint}</td></tr>) : <tr><td colSpan="4" className={styles.emptyCell}>暂无组件能力需求。</td></tr>}</tbody>
        </DataTable>
      </SectionBlock>

      <SectionBlock title="需求—设计匹配表">
        <DataTable className={styles.compareTable}>
          <thead><tr><th>项目输入</th><th>设计响应</th><th>匹配程度</th></tr></thead>
          <tbody>{viewModel.matchRows.length ? viewModel.matchRows.map((row) => <tr key={row.id}><td>{row.ownerNeed}</td><td>{row.designResponse}</td><td><StatusBadge tone={row.matchLevel === 'high' ? 'success' : row.matchLevel === 'partial' ? 'warning' : 'danger'}>{resolveMatchLabel(row.matchLevel)}</StatusBadge></td></tr>) : <tr><td colSpan="3" className={styles.emptyCell}>暂无匹配结果，请先完成前序输入。</td></tr>}</tbody>
        </DataTable>
      </SectionBlock>
      {statusBar}
      <ActionBar align="between">
        <Link to={isReviewMode ? '/report' : '/integrator'}><Button variant="ghost" size="medium">{isReviewMode ? '返回上一页' : '返回本页'}</Button></Link>
        {isReviewMode ? null : <Link to="/vendor"><Button variant="primary" size="medium">进入下一步</Button></Link>}
      </ActionBar>
      </>
      )}
    </ProjectStageShell></CaseStageLayout>
  );
}
