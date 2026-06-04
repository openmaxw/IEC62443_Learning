import { Link, useSearchParams } from 'react-router-dom';
import { ActionBar, Button, DataTable, SectionBlock, StatusBadge, StatusSummaryPanel, SummaryStatGrid } from '../../components/Common';
import { CaseStageLayout, ProjectStageShell } from '../../components/ProjectFlow';
import { useVendorPath } from '../../hooks/useProject';
import { getVendorResultViewModel } from '../../domain/viewModels/dashboardVendorViewModels';
import styles from './VendorResult.module.css';

export function VendorResult() {
  const [searchParams] = useSearchParams();
  const isReviewMode = searchParams.get('review') === '1';
  const vendorPath = useVendorPath();
  const viewModel = getVendorResultViewModel(vendorPath);

  if (!viewModel.hasCapability) {
    return <CaseStageLayout><ProjectStageShell stageNumber="03" title="能力声明摘要" projectName={viewModel.projectName} outputLabel="产品响应摘要"><div className={styles.empty}><Link to="/vendor"><Button variant="primary">进入本页</Button></Link></div></ProjectStageShell></CaseStageLayout>;
  }

  return (
    <CaseStageLayout><ProjectStageShell stageNumber="03" title="能力声明摘要" projectName={viewModel.projectName} outputLabel="产品响应摘要" statusText={viewModel.statusSummary.headline} guidance={{ summary: '本页用于回看产品能力声明，确认满足情况、依赖条件、限制边界和证据线索能否被后续匹配与判断直接引用。' }} statusPanel={<StatusSummaryPanel label={viewModel.statusSummary.title} value={viewModel.statusSummary.headline} note={viewModel.statusSummary.detail} pills={viewModel.statusSummary.pills} />}>
      {({ statusBar }) => (
        <>
          <SectionBlock title="声明概览">
            <SummaryStatGrid items={[{ label: '原生满足', value: viewModel.groups.fulfilled.length }, { label: '配置/补偿', value: viewModel.groups.partial.length }, { label: '不满足', value: viewModel.groups.missing.length }, { label: '共同实现', value: viewModel.groups.external.length }]} />
          </SectionBlock>

          <SectionBlock title="能力响应">
            <DataTable>
              <thead><tr><th>能力要求</th><th>满足状态</th><th>实现方式</th><th>证据类型</th><th>处置判断</th></tr></thead>
              <tbody>{viewModel.claims.length ? viewModel.claims.map((item) => <tr key={item.capabilityId}><td className={styles.contentCell}>{item.label || item.capabilityId}</td><td><StatusBadge tone={item.closureRequired ? 'warning' : 'success'}>{item.statusLabel}</StatusBadge></td><td>{item.implementationTypeLabel}</td><td>{item.evidenceType || '未填写'}</td><td>{item.closureRequired ? '需在匹配闭环中确认责任、条件或补偿' : '当前可直接引用'}</td></tr>) : <tr><td colSpan="5" className={styles.empty}>暂无能力声明。</td></tr>}</tbody>
            </DataTable>
          </SectionBlock>

          <SectionBlock title="边界与依赖">
            <DataTable>
              <thead><tr><th>能力要求</th><th>适用范围</th><th>依赖条件</th><th>限制说明</th></tr></thead>
              <tbody>{viewModel.claims.length ? viewModel.claims.map((item) => <tr key={item.capabilityId}><td className={styles.contentCell}>{item.label || item.capabilityId}</td><td>{item.claimScope || '未填写'}</td><td>{item.dependencyNote || '未填写'}</td><td>{item.limitationNote || '未填写'}</td></tr>) : <tr><td colSpan="4" className={styles.empty}>暂无边界与依赖信息。</td></tr>}</tbody>
            </DataTable>
          </SectionBlock>

          <SectionBlock title="待闭环项">
            <DataTable>
              <thead><tr><th>能力要求</th><th>原因</th><th>建议处理</th></tr></thead>
              <tbody>{viewModel.closureRows.length ? viewModel.closureRows.map((item) => <tr key={item.capabilityId}><td className={styles.contentCell}>{item.label || item.capabilityId}</td><td>{item.statusLabel}</td><td>{item.status === 'external' ? '确认外部系统、责任边界和验收证据。' : item.status === 'configured' ? '确认配置条件、授权许可和启用记录。' : item.status === 'compensating' ? '确认补偿控制与残余风险接受。' : '补充实现路径或登记缺口。'}</td></tr>) : <tr><td colSpan="3" className={styles.empty}>暂无待闭环项。</td></tr>}</tbody>
            </DataTable>
          </SectionBlock>

          <SectionBlock title="统一约束">
            <DataTable>
              <thead><tr><th>项目</th><th>内容</th></tr></thead>
              <tbody><tr><td>统一依赖</td><td className={styles.contentCell}>{viewModel.latest.dependencies || '未填写'}</td></tr><tr><td>统一限制</td><td className={styles.contentCell}>{viewModel.latest.limitations || '未填写'}</td></tr></tbody>
            </DataTable>
          </SectionBlock>

          {statusBar}

          <ActionBar align="end"><Link to={isReviewMode ? '/report' : '/translation-center'}><Button variant={isReviewMode ? 'ghost' : 'primary'} size="medium">{isReviewMode ? '返回上一页' : '进入下一步'}</Button></Link></ActionBar>
        </>
      )}
    </ProjectStageShell></CaseStageLayout>
  );
}
