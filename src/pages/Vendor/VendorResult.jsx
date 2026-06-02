import { Link, useSearchParams } from 'react-router-dom';
import { Button, DataTable, NotePanel, SectionBlock, StatusBadge, StatusSummaryPanel, SummaryStatGrid } from '../../components/Common';
import { ProjectStageShell } from '../../components/ProjectFlow';
import { useVendorPath } from '../../hooks/useProject';
import { getVendorResultViewModel } from '../../domain/viewModels/dashboardVendorViewModels';
import styles from './VendorResult.module.css';

export function VendorResult() {
  const [searchParams] = useSearchParams();
  const isReviewMode = searchParams.get('review') === '1';
  const vendorPath = useVendorPath();
  const viewModel = getVendorResultViewModel(vendorPath);

  if (!viewModel.hasCapability) {
    return <ProjectStageShell stageNumber="03" title="能力声明摘要" projectName={viewModel.projectName} outputLabel="产品响应摘要"><div className={styles.empty}><Link to="/vendor"><Button variant="primary">前往能力声明</Button></Link></div></ProjectStageShell>;
  }

  return (
    <ProjectStageShell stageNumber="03" title="能力声明摘要" projectName={viewModel.projectName} outputLabel="产品响应摘要" statusText={viewModel.statusSummary.headline} guidance={{ summary: '您可在本页查看设备能力对项目需求的满足情况、依赖条件与限制说明。' }} statusPanel={<StatusSummaryPanel label={viewModel.statusSummary.title} value={viewModel.statusSummary.headline} note={viewModel.statusSummary.detail} pills={viewModel.statusSummary.pills} />}>
      {({ statusBar }) => (
      <>
      <div className={styles.hero}><div><span className={styles.eyebrow}>能力声明摘要</span><h2>{viewModel.latest.productMeta?.productName || '未命名产品'}</h2><p>{viewModel.latest.productMeta?.deploymentScope || '未填写部署范围'} / SL-{viewModel.latest.productMeta?.securityLevel || 2}</p></div></div>
      <SectionBlock title="声明概览"><SummaryStatGrid items={[{ label: '原生满足', value: viewModel.groups.fulfilled.length }, { label: '配置/补偿', value: viewModel.groups.partial.length }, { label: '不满足', value: viewModel.groups.missing.length }, { label: '共同实现', value: viewModel.groups.external.length }]} /></SectionBlock>
      <SectionBlock title="项目能力响应表">
        <DataTable><thead><tr><th>能力要求</th><th>满足状态</th><th>实现方式</th><th>证据类型</th><th>处置判断</th></tr></thead><tbody>{viewModel.claims.length ? viewModel.claims.map((item) => <tr key={item.capabilityId}><td><strong>{item.label || item.capabilityId}</strong></td><td><StatusBadge tone={item.closureRequired ? 'warning' : 'success'}>{item.statusLabel}</StatusBadge></td><td>{item.implementationTypeLabel}</td><td>{item.evidenceType || '未填写'}</td><td>{item.closureRequired ? '需在匹配闭环中确认责任、条件或补偿' : '可作为当前声明满足项'}</td></tr>) : <tr><td colSpan="5" className={styles.empty}>尚未声明能力项。</td></tr>}</tbody></DataTable>
      </SectionBlock>
      <SectionBlock title="适用边界、依赖与限制">
        <DataTable><thead><tr><th>能力要求</th><th>适用范围</th><th>依赖条件</th><th>限制说明</th></tr></thead><tbody>{viewModel.claims.length ? viewModel.claims.map((item) => <tr key={item.capabilityId}><td><strong>{item.label || item.capabilityId}</strong></td><td>{item.claimScope || '未填写'}</td><td>{item.dependencyNote || '未填写'}</td><td>{item.limitationNote || '未填写'}</td></tr>) : <tr><td colSpan="4" className={styles.empty}>尚未填写边界与依赖。</td></tr>}</tbody></DataTable>
      </SectionBlock>
      <SectionBlock title="需进入闭环确认的声明项">
        <DataTable><thead><tr><th>能力要求</th><th>原因</th><th>建议处理</th></tr></thead><tbody>{viewModel.closureRows.length ? viewModel.closureRows.map((item) => <tr key={item.capabilityId}><td><strong>{item.label || item.capabilityId}</strong></td><td>{item.statusLabel}</td><td>{item.status === 'external' ? '确认外部系统、责任边界和验收证据。' : item.status === 'configured' ? '确认配置条件、授权许可和启用记录。' : item.status === 'compensating' ? '确认补偿控制与残余风险接受。' : '补充实现路径或登记缺口。'}</td></tr>) : <tr><td colSpan="3" className={styles.empty}>当前没有需要闭环确认的声明项。</td></tr>}</tbody></DataTable>
      </SectionBlock>
      <SectionBlock title="统一依赖与限制"><SummaryStatGrid columns={2} compact items={[{ label: '统一依赖', value: viewModel.latest.dependencies || '未填写' }, { label: '统一限制', value: viewModel.latest.limitations || '未填写' }]} /></SectionBlock>
      {statusBar}
      <NotePanel title="结果说明" notes={["该页用于把声明结果压缩为可沟通摘要；真正的项目级处置在匹配闭环中完成。"]} />
      <div className={styles.actions}><Link to={isReviewMode ? '/report' : '/selection'}><Button variant={isReviewMode ? 'ghost' : 'primary'} size="medium">{isReviewMode ? '返回交付摘要' : '进入匹配闭环'}</Button></Link></div>
      </>
      )}
    </ProjectStageShell>
  );
}
