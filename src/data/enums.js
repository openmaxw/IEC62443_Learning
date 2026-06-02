export const CONSEQUENCE_LEVEL_OPTIONS = [
  { value: 'low', label: '低', description: '影响有限，可按标准流程处理', badge: 'success' },
  { value: 'medium', label: '中', description: '会造成明显影响，需要重点关注', badge: 'warning' },
  { value: 'high', label: '高', description: '会造成重大影响，应优先纳入安全设计', badge: 'danger' }
];

export const REMOTE_ACCESS_OPTIONS = [
  { value: 'none', label: '无远程运维', description: '主要通过现场人员操作和维护' },
  { value: 'limited', label: '有限远程运维', description: '偶尔远程诊断或访问' },
  { value: 'extensive', label: '广泛远程运维', description: '经常性远程维护、远程监控或远程控制' }
];

export const THIRD_PARTY_ACCESS_OPTIONS = [
  { value: 'none', label: '无第三方接入', description: '无外部厂商接入项目网络' },
  { value: 'occasional', label: '偶尔接入', description: '特定场景下由厂商远程支持' },
  { value: 'regular', label: '频繁接入', description: '厂商、集成商或运维方经常访问系统' }
];

export const ACCEPTANCE_PREFERENCE_OPTIONS = [
  { value: 'function-first', label: '功能优先', description: '优先确保系统能上线运行' },
  { value: 'security-first', label: '安全优先', description: '优先验证账户、日志、边界和配置控制' },
  { value: 'operations-first', label: '运维优先', description: '优先确认变更、恢复和日常可操作性' }
];

export const REMOTE_OWNERSHIP_OPTIONS = [
  { value: 'owner', label: '业主负责', description: '远程运维账号、审批和执行由业主主导' },
  { value: 'integrator', label: '集成商负责', description: '主要由集成商承担远程接入和维护责任' },
  { value: 'vendor', label: '设备商负责', description: '主要由设备商提供远程运维支持' },
  { value: 'shared', label: '联合负责', description: '由多方共同参与远程运维与审计' }
];
