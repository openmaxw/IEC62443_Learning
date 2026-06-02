const DEFAULT_STATUS = 'new';

const SOURCE_LABELS = {
  owner: '业主陈述',
  vendor: '设备商声明',
  integrator: '设计响应分析',
  system: '系统生成'
};

const REMOTE_KEYWORDS = ['remote', 'vpn', '跳板', '堡垒机', '远程', 'vendor', '供应商'];
const AUTH_KEYWORDS = ['auth', '认证', 'account', '账号', 'certificate', '证书'];
const LOG_KEYWORDS = ['log', '日志', 'audit', '审计'];
const RECOVERY_KEYWORDS = ['backup', '恢复', '灾备', 'restore'];

function slugify(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'item';
}

function createEvidence(sourceType, sourceName, role, note) {
  return {
    id: `evidence-${slugify(sourceType)}-${slugify(sourceName)}-${Math.random().toString(36).slice(2, 7)}`,
    sourceType,
    sourceName,
    role,
    note,
    status: sourceType === 'generated' ? 'generated' : 'confirmed',
    recordedAt: new Date().toISOString(),
    label: SOURCE_LABELS[role] || sourceName
  };
}

function pushUniqueById(list, item) {
  if (!item?.id || list.some((existing) => existing.id === item.id)) return list;
  list.push(item);
  return list;
}

function inferZoneType(assetType = '') {
  const text = assetType.toLowerCase();
  if (text.includes('sis') || text.includes('safety')) return 'safety';
  if (text.includes('scada') || text.includes('hist') || text.includes('server')) return 'supervisory';
  if (text.includes('plc') || text.includes('hmi') || text.includes('controller')) return 'cell';
  return 'ot';
}

function inferFocusTags(itemText = '') {
  const text = itemText.toLowerCase();
  const tags = new Set();
  if (REMOTE_KEYWORDS.some((keyword) => text.includes(keyword))) tags.add('远程访问控制');
  if (AUTH_KEYWORDS.some((keyword) => text.includes(keyword))) tags.add('身份鉴别');
  if (LOG_KEYWORDS.some((keyword) => text.includes(keyword))) tags.add('日志审计');
  if (RECOVERY_KEYWORDS.some((keyword) => text.includes(keyword))) tags.add('备份恢复');
  if (text.includes('隔离') || text.includes('boundary') || text.includes('zone') || text.includes('dmz')) tags.add('网络分隔');
  if (text.includes('patch') || text.includes('补丁') || text.includes('maintenance') || text.includes('维护')) tags.add('补丁与维护');
  if (text.includes('white') || text.includes('allow') || text.includes('least') || text.includes('最小')) tags.add('访问控制');
  if (tags.size === 0) tags.add('访问控制');
  return [...tags];
}

function mapStatus(raw) {
  const normalized = String(raw || '').toLowerCase();
  if (['confirmed', '已确认'].includes(normalized)) return 'confirmed';
  if (['pending', '待确认'].includes(normalized)) return 'pending';
  if (['assumed', '假设项'].includes(normalized)) return 'assumed';
  if (['disputed', '有争议', '争议项'].includes(normalized)) return 'disputed';
  if (['retired', '废弃项', 'obsolete'].includes(normalized)) return 'retired';
  return DEFAULT_STATUS;
}

export function buildStructuredWorkspace({ projectMeta, ownerAssessment, riskProfile, integratorPlan, vendorCapabilities }) {
  const evidences = [];
  const assets = [];
  const zones = [];
  const conduits = [];
  const externalConnections = [];
  const constraints = [];
  const reviewItems = [];
  const normalizedOwnerAssets = ownerAssessment?.keyAssets || ownerAssessment?.assets || (ownerAssessment?.criticalAssets || []).map((item) => ({
    name: item,
    label: item,
    type: item,
    system: ownerAssessment?.keySystems || '',
    constraint: ownerAssessment?.continuityRequirements || ''
  }));
  const normalizedRemoteConnections = ownerAssessment?.remoteConnections || ownerAssessment?.remoteAccessModes || (ownerAssessment?.remoteAccessNeed ? [{
    name: ownerAssessment.maintenanceAccessPath || '远程接入',
    mode: ownerAssessment.remoteAccessNeed,
    type: 'remote-access',
    direction: 'inbound',
    owner: ownerAssessment.remoteOperationsOwnership || 'owner',
    boundary: ownerAssessment.initialBoundaryNotes || '外部到控制域',
    status: 'pending'
  }] : []);
  const normalizedOwnerConstraints = ownerAssessment?.constraintsList || ownerAssessment?.constraints || [
    ownerAssessment?.continuityRequirements,
    ownerAssessment?.complianceNotes,
    ownerAssessment?.externalConnections
  ].filter(Boolean).map((item) => ({ title: item, description: item, category: 'owner-constraint', appliesTo: [] }));

  const ownerEvidence = createEvidence('interview', projectMeta?.projectName || 'owner-assessment', 'owner', '来自业主调研与访谈');
  pushUniqueById(evidences, ownerEvidence);

  normalizedOwnerAssets.forEach((asset, index) => {
    const zoneName = asset.zoneName || asset.system || asset.networkZone || `${asset.name || asset}-${inferZoneType(asset.type || '')}区域`;
    const zoneId = `zone-${slugify(zoneName)}`;
    const assetId = `asset-${slugify(asset.name || asset.label || `${index}`)}`;
    pushUniqueById(zones, {
      id: zoneId,
      name: zoneName,
      zoneType: inferZoneType(asset.type || ''),
      criticality: asset.criticality || ownerAssessment?.productionImpact || 'medium',
      businessFunction: asset.businessFunction || asset.system || '待补充',
      scope: asset.location || projectMeta?.siteName || '现场区域',
      status: mapStatus(asset.status),
      sourceIds: [ownerEvidence.id],
      sourceRole: 'owner',
      reviewStatus: 'confirmed',
      focusTags: inferFocusTags(`${zoneName} ${asset.type || ''}`)
    });
    assets.push({
      id: assetId,
      name: asset.name || asset.label || `资产${index + 1}`,
      assetType: asset.type || '工业资产',
      location: asset.location || projectMeta?.siteName || '待确认',
      system: asset.system || zoneName,
      vendor: asset.vendor || '待确认',
      criticality: asset.criticality || ownerAssessment?.productionImpact || 'medium',
      operatingConstraint: asset.constraint || ownerAssessment?.constraintsSummary || '',
      zoneId,
      status: mapStatus(asset.status),
      sourceIds: [ownerEvidence.id],
      sourceRole: 'owner',
      focusTags: inferFocusTags(`${asset.name || ''} ${asset.type || ''}`)
    });
  });

  normalizedRemoteConnections.forEach((item, index) => {
    const name = item.name || item.mode || item;
    const id = `ext-${slugify(name)}-${index}`;
    externalConnections.push({
      id,
      name,
      connectionType: item.type || 'remote-access',
      direction: item.direction || 'inbound',
      method: item.method || item.mode || name,
      owner: item.owner || 'owner',
      boundary: item.boundary || '外部到控制域',
      status: mapStatus(item.status || 'pending'),
      sourceIds: [ownerEvidence.id],
      sourceRole: 'owner',
      focusTags: inferFocusTags(`${name} remote`) 
    });
  });

  normalizedOwnerConstraints.forEach((item, index) => {
    const content = item.name || item.title || item;
    constraints.push({
      id: `constraint-owner-${slugify(content)}-${index}`,
      title: content,
      category: item.category || 'owner-constraint',
      description: item.description || content,
      appliesTo: item.appliesTo || [],
      status: mapStatus(item.status || 'pending'),
      sourceIds: [ownerEvidence.id],
      sourceRole: 'owner',
      focusTags: inferFocusTags(content)
    });
  });

  const vendorEvidenceIds = [];
  (vendorCapabilities || []).forEach((vendor, vendorIndex) => {
    const vendorEvidence = createEvidence('vendor-declaration', vendor?.productMeta?.productName || `vendor-${vendorIndex + 1}`, 'vendor', '来自设备商能力声明');
    pushUniqueById(evidences, vendorEvidence);
    vendorEvidenceIds.push(vendorEvidence.id);

    (vendor?.capabilityClaims || []).forEach((claim, index) => {
      const title = claim.capabilityId || `capability-${index}`;
      const unsupported = claim.satisfaction === 'missing';
      constraints.push({
        id: `constraint-vendor-${slugify(title)}-${vendorIndex}-${index}`,
        title: `${vendor?.productMeta?.productName || '设备'}:${title}`,
        category: unsupported ? 'capability-gap' : 'capability-boundary',
        description: claim.limitation || claim.dependency || '来自设备商声明的能力边界',
        appliesTo: [vendor?.id || `vendor-${vendorIndex}`],
        status: unsupported ? 'pending' : 'confirmed',
        sourceIds: [vendorEvidence.id],
        sourceRole: 'vendor',
        focusTags: inferFocusTags(`${title} ${claim.limitation || ''} ${claim.dependency || ''}`)
      });
    });
  });

  const integratorEvidence = createEvidence('integrator-analysis', projectMeta?.projectName || 'design-input', 'integrator', '来自设计响应归并');
  pushUniqueById(evidences, integratorEvidence);

  (integratorPlan?.communicationFlows || []).forEach((flow, index) => {
    const sourceName = flow.sourceName || flow.source || '待确认源';
    const targetName = flow.targetName || flow.target || '待确认目标';
    const sourceZoneId = `zone-${slugify(sourceName)}`;
    const targetZoneId = `zone-${slugify(targetName)}`;

    if (!zones.some((zone) => zone.id === sourceZoneId)) {
      zones.push({
        id: sourceZoneId,
        name: sourceName,
        zoneType: 'inferred',
        criticality: 'medium',
        businessFunction: '待补充',
        scope: projectMeta?.siteName || '项目范围',
        status: 'assumed',
        sourceIds: [integratorEvidence.id],
        sourceRole: 'integrator',
        reviewStatus: 'pending',
        focusTags: inferFocusTags(sourceName)
      });
    }

    if (!zones.some((zone) => zone.id === targetZoneId)) {
      zones.push({
        id: targetZoneId,
        name: targetName,
        zoneType: 'inferred',
        criticality: 'medium',
        businessFunction: '待补充',
        scope: projectMeta?.siteName || '项目范围',
        status: 'assumed',
        sourceIds: [integratorEvidence.id],
        sourceRole: 'integrator',
        reviewStatus: 'pending',
        focusTags: inferFocusTags(targetName)
      });
    }

    conduits.push({
      id: `conduit-${slugify(sourceName)}-${slugify(targetName)}-${index}`,
      name: `${sourceName} → ${targetName}`,
      sourceZoneId,
      targetZoneId,
      purpose: flow.businessReason || '待补充业务用途',
      protocol: flow.protocol || '待确认',
      direction: flow.direction || 'bidirectional',
      accessMethod: flow.accessMethod || 'network',
      isExternal: Boolean(flow.isExternal),
      status: flow.source && flow.target && flow.protocol && flow.businessReason ? 'pending' : 'assumed',
      sourceIds: [integratorEvidence.id],
      sourceRole: 'integrator',
      focusTags: inferFocusTags(`${flow.protocol || ''} ${flow.businessReason || ''}`)
    });
  });

  (integratorPlan?.constraints || []).forEach((item, index) => {
    const content = item.title || item.name || item;
    constraints.push({
      id: `constraint-integrator-${slugify(content)}-${index}`,
      title: content,
      category: item.category || 'design-constraint',
      description: item.description || content,
      appliesTo: item.appliesTo || [],
      status: mapStatus(item.status || 'pending'),
      sourceIds: [integratorEvidence.id],
      sourceRole: 'integrator',
      focusTags: inferFocusTags(content)
    });
  });

  zones.forEach((zone) => {
    const missingEvidence = !zone.sourceIds?.length;
    if (missingEvidence || zone.status === 'assumed') {
      reviewItems.push({
        id: `review-zone-${zone.id}`,
        type: 'zone',
        title: `待确认区域：${zone.name}`,
        status: zone.status === 'assumed' ? 'pending' : 'new',
        role: zone.sourceRole,
        reason: missingEvidence ? '缺少来源信息' : '来自设计响应草案，待他方确认',
        focusTags: zone.focusTags || []
      });
    }
  });

  conduits.forEach((conduit) => {
    if (conduit.status !== 'confirmed') {
      reviewItems.push({
        id: `review-conduit-${conduit.id}`,
        type: 'conduit',
        title: `待确认通道：${conduit.name}`,
        status: conduit.status === 'assumed' ? 'pending' : 'new',
        role: conduit.sourceRole,
        reason: conduit.protocol === '待确认' ? '通信协议未明确' : '待确认跨区通信用途与边界',
        focusTags: conduit.focusTags || []
      });
    }
  });

  externalConnections.forEach((connection) => {
    reviewItems.push({
      id: `review-external-${connection.id}`,
      type: 'externalConnection',
      title: `外部连接确认：${connection.name}`,
      status: connection.status === 'confirmed' ? 'confirmed' : 'pending',
      role: connection.sourceRole,
      reason: '远程访问和第三方接入应单独确认',
      focusTags: connection.focusTags || []
    });
  });

  const remoteAccessPaths = externalConnections.filter((item) => item.focusTags.includes('远程访问控制'));
  const crossZoneCommunications = conduits.map((item) => ({
    id: item.id,
    name: item.name,
    sourceZoneId: item.sourceZoneId,
    targetZoneId: item.targetZoneId,
    protocol: item.protocol,
    direction: item.direction,
    purpose: item.purpose,
    required: item.status !== 'assumed'
  }));

  const deviceCapabilitySummary = (vendorCapabilities || []).map((vendor, index) => ({
    id: vendor.id || `vendor-${index}`,
    vendorName: vendor?.productMeta?.productName || `设备${index + 1}`,
    securityLevel: vendor?.productMeta?.securityLevel || 1,
    supportedCapabilities: (vendor?.capabilityClaims || []).filter((item) => item.satisfaction !== 'missing').map((item) => item.capabilityId),
    declaredGaps: (vendor?.capabilityClaims || []).filter((item) => item.satisfaction === 'missing').map((item) => item.capabilityId),
    dependencies: vendor?.dependencies || '',
    limitations: vendor?.limitations || ''
  }));

  const designConstraintList = constraints.filter((item) => item.category.includes('constraint') || item.category.includes('gap') || item.category.includes('boundary'));

  const focusCoverage = [
    ...zones.flatMap((item) => item.focusTags || []),
    ...conduits.flatMap((item) => item.focusTags || []),
    ...externalConnections.flatMap((item) => item.focusTags || []),
    ...constraints.flatMap((item) => item.focusTags || [])
  ].reduce((accumulator, tag) => {
    accumulator[tag] = (accumulator[tag] || 0) + 1;
    return accumulator;
  }, {});

  const designInputPackage = {
    summary: {
      projectName: projectMeta?.projectName || '未命名项目',
      organizationName: projectMeta?.organizationName || '',
      siteName: projectMeta?.siteName || '',
      objective: projectMeta?.projectObjective || '',
      targetLevelHint: riskProfile?.summary?.recommendedTarget || '面向 IEC 62443 设计输入整理'
    },
    zoneDrafts: zones,
    conduitDrafts: conduits,
    externalConnectionList: externalConnections,
    crossZoneCommunicationList: crossZoneCommunications,
    remoteAccessPaths,
    designConstraints: designConstraintList,
    reviewChecklist: reviewItems,
    deviceCapabilitySummary,
    focusCoverage
  };

  return {
    assets,
    zones,
    conduits,
    externalConnections,
    constraints,
    evidences,
    reviewItems,
    designInputPackage,
    roleViews: {
      owner: {
        keyConnections: externalConnections,
        pendingReviews: reviewItems.filter((item) => item.status !== 'confirmed'),
        riskHints: Object.keys(focusCoverage)
      },
      integrator: {
        zoneDrafts: zones,
        conduitDrafts: conduits,
        designConstraints: designConstraintList,
        crossZoneCommunicationList: crossZoneCommunications,
        remoteAccessPaths,
        deviceCapabilitySummary
      },
      vendor: {
        deviceCapabilitySummary,
        capabilityConstraints: constraints.filter((item) => item.sourceRole === 'vendor'),
        pendingReviews: reviewItems.filter((item) => item.role === 'vendor' || item.type === 'externalConnection')
      }
    }
  };
}
