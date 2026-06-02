export const MATCH_STATUSES = {
  native: {
    id: 'native',
    label: '原生满足',
    group: 'matched',
    score: 1,
    badge: 'success',
    description: '产品原生提供该能力，且目标等级满足项目要求。'
  },
  configured: {
    id: 'configured',
    label: '配置后满足',
    group: 'partial',
    score: 0.8,
    badge: 'info',
    description: '通过合理配置或启用附加选项后可满足要求。'
  },
  external: {
    id: 'external',
    label: '依赖外围控制满足',
    group: 'external',
    score: 0.6,
    badge: 'warning',
    description: '需要配合外围系统或边界控制共同满足要求。'
  },
  compensating: {
    id: 'compensating',
    label: '补偿措施后可接受',
    group: 'compensating',
    score: 0.4,
    badge: 'warning',
    description: '存在缺口，但可通过补偿措施降低风险并达到可接受状态。'
  },
  missing: {
    id: 'missing',
    label: '不满足',
    group: 'missing',
    score: 0,
    badge: 'danger',
    description: '当前缺少关键能力或无法提供可接受的实现路径。'
  }
};

export const MATCH_STATUS_OPTIONS = [
  MATCH_STATUSES.native,
  MATCH_STATUSES.configured,
  MATCH_STATUSES.external,
  MATCH_STATUSES.compensating,
  MATCH_STATUSES.missing
];
