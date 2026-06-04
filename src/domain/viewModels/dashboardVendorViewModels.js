function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeClaimStatus(value, implementationType) {
  if (value === 'fulfilled') return implementationType === 'external' || implementationType === 'shared' ? 'external' : 'native';
  if (value === 'partial') return 'configured';
  if (value === 'native' && (implementationType === 'external' || implementationType === 'shared')) return 'external';
  return value || 'missing';
}

function claimStatusLabel(status) {
  const labels = { native: '产品原生满足', configured: '配置后满足', external: '需外部系统共同实现', compensating: '需补偿措施后接受', missing: '当前不满足', na: '不适用' };
  return labels[status] || status || '未填写';
}

function implementationTypeLabel(value) {
  const labels = { product: '产品内置实现', external: '外部系统实现', shared: '产品+系统共同实现' };
  return labels[value] || value || '未填写';
}

function needsClosure(status) {
  return status === 'configured' || status === 'external' || status === 'compensating' || status === 'missing';
}

function normalizeSubsteps(value) {
  return {
    completed: value?.completed || 0,
    total: value?.total || 0,
    items: asArray(value?.items)
  };
}

export function getDashboardViewModel({ projectMeta, assessment, riskProfile, plan, capabilities, matchResults, progress, missingInputs, nextAction }) {
  const cards = [
    {
      id: 'owner',
      title: '需求澄清',
      ready: progress.stageStatus.owner,
      detail: assessment ? `已形成风险关注与项目输入摘要${riskProfile ? '，可进入设计响应' : ''}` : '待完成项目场景、业务后果与约束输入',
      route: progress.stageStatus.owner ? '/owner?step=7' : '/owner',
      substeps: normalizeSubsteps(progress.substeps.owner)
    },
    {
      id: 'integrator',
      title: '设计响应',
      ready: progress.stageStatus.integrator,
      detail: plan ? `已形成 ${asArray(plan?.zones).length} 个 zone、${asArray(plan?.communicationFlows).length} 条通信流` : '待完成 Zone / Conduit 与通信响应',
      route: progress.stageStatus.integrator ? '/integrator?step=6' : '/integrator',
      substeps: normalizeSubsteps(progress.substeps.integrator)
    },
    {
      id: 'vendor',
      title: '能力声明',
      ready: progress.stageStatus.vendor,
      detail: asArray(capabilities).length ? `已录入 ${asArray(capabilities).length} 份能力声明` : '待录入产品能力、边界与证据',
      route: progress.stageStatus.vendor ? '/vendor?step=6' : '/vendor',
      substeps: normalizeSubsteps(progress.substeps.vendor)
    },
    {
      id: 'selection',
      title: '匹配闭环',
      ready: progress.stageStatus.selection,
      detail: asArray(matchResults?.results).length ? `已生成 ${asArray(matchResults?.results).length} 条匹配闭环结果` : '待完成要求-能力匹配与差距处置',
      route: '/selection',
      substeps: normalizeSubsteps(progress.substeps.selection)
    }
  ];

  return {
    projectName: projectMeta?.projectName || '',
    projectDescription: [projectMeta?.organizationName, projectMeta?.siteName, projectMeta?.industry, projectMeta?.scenarioType].filter(Boolean).join(' / ') || '先从需求澄清 01 填写项目场景与基础信息，再按阶段推进 IEC 62443 响应链路。',
    cards,
    missingInputs,
    nextAction,
    progress,
    statusSummary: {
      title: nextAction ? '当前阻塞' : '当前状态',
      headline: nextAction?.label || '主链关键步骤已基本齐备',
      detail: nextAction ? '建议优先处理当前推荐动作，再继续推进后续阶段。' : '可以进入交付摘要查看成果，或回到具体阶段继续细化。',
      pills: [`缺失输入 ${missingInputs.length}`, `阶段完成 ${progress.completed}/${progress.total}`]
    },
    overviewStats: [
      { label: '已完成阶段', value: `${progress.completed} / ${progress.total}` },
      { label: '待补齐输入', value: missingInputs.length },
      { label: '当前推荐动作', value: nextAction?.label || '查看交付摘要' }
    ]
  };
}
