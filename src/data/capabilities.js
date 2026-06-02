// 设备能力标签定义

export const FR_DISPLAY = {
  FR1: { code: 'FR1', short: 'IAC', name: '标识与鉴别控制', description: 'Identification and Authentication Control' },
  FR2: { code: 'FR2', short: 'UC', name: '使用控制', description: 'Use Control' },
  FR3: { code: 'FR3', short: 'SI', name: '系统完整性', description: 'System Integrity' },
  FR4: { code: 'FR4', short: 'DC', name: '数据机密性', description: 'Data Confidentiality' },
  FR5: { code: 'FR5', short: 'RDF', name: '受限数据流', description: 'Restricted Data Flow' },
  FR6: { code: 'FR6', short: 'TRE', name: '事件及时响应', description: 'Timely Response to Events' },
  FR7: { code: 'FR7', short: 'RA', name: '资源可用性', description: 'Resource Availability' }
};

export const CAPABILITY_CATEGORIES = {
  auth: {
    name: '身份认证',
    nameEn: 'Authentication',
    description: '用户和设备身份验证能力'
  },
  access: {
    name: '访问控制',
    nameEn: 'Access Control',
    description: '基于角色的访问控制能力'
  },
  integrity: {
    name: '完整性保护',
    nameEn: 'Integrity Protection',
    description: '数据和系统完整性保护能力'
  },
  encryption: {
    name: '加密能力',
    nameEn: 'Encryption',
    description: '数据加密和解密能力'
  },
  logging: {
    name: '日志记录',
    nameEn: 'Logging',
    description: '安全事件日志记录能力'
  },
  audit: {
    name: '审计能力',
    nameEn: 'Audit',
    description: '安全审计和合规检查能力'
  }
};

export const CAPABILITY_OPTIONS = {
  auth: [
    { id: 'auth-password', label: '密码鉴别', controlObjective: '远程接入控制', description: '用于远程接入账号鉴别。', fr: 'FR1', sr: ['SR1.1'] },
    { id: 'auth-multi-factor', label: '多因素鉴别', controlObjective: '远程接入控制', description: '用于提升远程接入鉴别强度。', fr: 'FR1', sr: ['SR1.3'] },
    { id: 'auth-certificate', label: '证书鉴别', controlObjective: '远程接入控制', description: '用于基于证书建立可信身份。', fr: 'FR1', sr: ['SR1.2'] },
    { id: 'auth-biometric', label: '生物特征鉴别', controlObjective: '身份鉴别加强', description: '用于高敏感场景下的增强鉴别。', fr: 'FR1', sr: ['SR1.4'] },
    { id: 'auth-single-sign', label: '单点登录', controlObjective: '统一身份接入', description: '用于统一身份访问体验与集中控制。', fr: 'FR1', sr: ['SR1.5'] },
    { id: 'auth-session', label: '会话管理', controlObjective: '远程接入控制', description: '用于控制登录会话的建立、保持和失效。', fr: 'FR1', sr: ['SR1.6'] }
  ],
  access: [
    { id: 'access-rbac', label: '角色授权控制', controlObjective: '远程接入控制', description: '用于受控授权和角色隔离。', fr: 'FR2', sr: ['SR2.1'] },
    { id: 'access-whitelist', label: '白名单访问控制', controlObjective: '边界与审计控制', description: '用于限制允许的访问路径、对象或通信。', fr: 'FR5', sr: ['SR5.2'] },
    { id: 'access-privilege', label: '最小权限控制', controlObjective: '权限与职责边界', description: '用于限制账户仅具备完成任务所需权限。', fr: 'FR2', sr: ['SR2.3'] },
    { id: 'access-policy', label: '安全策略执行', controlObjective: '访问控制执行', description: '用于把访问控制规则稳定落地执行。', fr: 'FR2', sr: ['SR2.4'] },
    { id: 'access-revoke', label: '权限撤销机制', controlObjective: '权限生命周期管理', description: '用于及时撤销不再需要的访问权限。', fr: 'FR2', sr: ['SR2.5'] }
  ],
  integrity: [
    { id: 'integrity-crc', label: 'CRC 校验', controlObjective: '完整性保护', description: '用于发现传输或存储过程中的数据损坏。', fr: 'FR3', sr: ['SR3.1'] },
    { id: 'integrity-crypto', label: '数字签名', controlObjective: '完整性保护', description: '用于验证数据或软件未被篡改。', fr: 'FR3', sr: ['SR3.2'] },
    { id: 'integrity-hash', label: '哈希校验', controlObjective: '完整性保护', description: '用于校验关键文件和数据的一致性。', fr: 'FR3', sr: ['SR3.3'] },
    { id: 'integrity-firmware', label: '固件完整性验证', controlObjective: '系统完整性', description: '用于启动或升级时验证固件可信性。', fr: 'FR3', sr: ['SR3.4'] },
    { id: 'integrity-malware', label: '恶意软件检测', controlObjective: '系统完整性', description: '用于识别已知恶意代码或异常行为。', fr: 'FR3', sr: ['SR3.5'] }
  ],
  encryption: [
    { id: 'encryption-tls', label: 'TLS/SSL 加密', controlObjective: '通信机密性保护', description: '用于保护通信链路中的数据机密性。', fr: 'FR4', sr: ['SR4.1'] },
    { id: 'encryption-ipsec', label: 'IPsec VPN', controlObjective: '远程通信保护', description: '用于远程链路的加密与隧道保护。', fr: 'FR4', sr: ['SR4.2'] },
    { id: 'encryption-aes', label: 'AES 加密', controlObjective: '数据机密性保护', description: '用于静态或传输数据加密。', fr: 'FR4', sr: ['SR4.3'] },
    { id: 'encryption-key', label: '密钥管理', controlObjective: '加密体系管理', description: '用于生成、分发、轮换和保护密钥。', fr: 'FR4', sr: ['SR4.4'] }
  ],
  logging: [
    { id: 'logging-event', label: '安全事件记录', controlObjective: '边界与审计控制', description: '记录关键安全事件与访问行为。', fr: 'FR6', sr: ['SR6.1'] },
    { id: 'logging-audit', label: '审计日志', controlObjective: '边界与审计控制', description: '用于记录审计所需的关键操作轨迹。', fr: 'FR6', sr: ['SR6.2'] },
    { id: 'logging-syslog', label: '集中日志上报', controlObjective: '边界与审计控制', description: '用于向集中日志平台传送安全事件。', fr: 'FR6', sr: ['SR6.3'] },
    { id: 'logging-alarm', label: '告警记录', controlObjective: '安全事件响应', description: '用于记录告警触发与处置过程。', fr: 'FR6', sr: ['SR6.1'] }
  ],
  audit: [
    { id: 'audit-compliance', label: '合规检查', controlObjective: '审计与合规证明', description: '用于支撑合规检查与控制验证。', fr: 'FR6', sr: ['SR6.2'] },
    { id: 'audit-report', label: '审计报表生成', controlObjective: '审计与合规证明', description: '用于输出审计和检查结果。', fr: 'FR6', sr: ['SR6.2'] },
    { id: 'audit-forage', label: '取证支持', controlObjective: '事件分析与取证', description: '用于支持事后分析和证据留存。', fr: 'FR6', sr: ['SR6.3'] }
  ]
};


const LEGACY_CAPABILITY_DISPLAY = {
  'identity-authentication': { label: '身份鉴别能力', controlObjective: '身份与会话控制', description: '用于确认用户、设备或维护会话身份。', fr: 'FR1', sr: ['SR1.1'] },
  'identity-session-control': { label: '会话控制能力', controlObjective: '身份与会话控制', description: '用于限制远程维护会话建立、保持和超时。', fr: 'FR1', sr: ['SR1.6'] },
  'identity-rbac': { label: '角色权限控制能力', controlObjective: '身份与会话控制', description: '用于按角色限制操作权限和职责边界。', fr: 'FR2', sr: ['SR2.1'] },
  'boundary-firewall': { label: '边界防护能力', controlObjective: '区域边界与通信约束', description: '用于在区域边界执行访问控制和通信限制。', fr: 'FR5', sr: ['SR5.1'] },
  'boundary-allowlist': { label: '通信白名单能力', controlObjective: '区域边界与通信约束', description: '用于限制允许的源、目的、协议和访问路径。', fr: 'FR5', sr: ['SR5.2'] },
  'boundary-remote-access-gateway': { label: '远程接入网关能力', controlObjective: '区域边界与通信约束', description: '用于将远程维护接入收敛到受控入口。', fr: 'FR5', sr: ['SR5.1'] },
  'integrity-signed-update': { label: '签名更新校验能力', controlObjective: '配置与系统完整性保护', description: '用于验证软件、固件或更新包来源和完整性。', fr: 'FR3', sr: ['SR3.4'] },
  'integrity-config-protection': { label: '配置完整性保护能力', controlObjective: '配置与系统完整性保护', description: '用于保护关键配置不被未授权篡改。', fr: 'FR3', sr: ['SR3.1'] },
  'confidentiality-encryption': { label: '通信与数据加密能力', controlObjective: '敏感数据保护', description: '用于保护传输或存储数据的机密性。', fr: 'FR4', sr: ['SR4.1'] },
  'confidentiality-key-management': { label: '密钥管理能力', controlObjective: '敏感数据保护', description: '用于管理密钥生成、分发、轮换和保护。', fr: 'FR4', sr: ['SR4.3'] },
  'monitoring-security-log': { label: '安全日志记录能力', controlObjective: '日志、审计与告警', description: '用于记录登录、配置变更和安全事件。', fr: 'FR6', sr: ['SR6.1'] },
  'monitoring-alerting': { label: '安全告警能力', controlObjective: '日志、审计与告警', description: '用于发现并提示关键安全事件。', fr: 'FR6', sr: ['SR6.1'] },
  'monitoring-audit-export': { label: '审计导出能力', controlObjective: '日志、审计与告警', description: '用于导出审计记录或形成验收证据。', fr: 'FR6', sr: ['SR6.2'] },
  'resilience-backup-restore': { label: '备份恢复能力', controlObjective: '可用性与恢复', description: '用于支撑关键配置、系统或数据恢复。', fr: 'FR7', sr: ['SR7.3'] },
  'resilience-redundancy': { label: '冗余与连续运行能力', controlObjective: '可用性与恢复', description: '用于降低单点故障对连续运行的影响。', fr: 'FR7', sr: ['SR7.1'] }
};

const CAPABILITY_LOOKUP = Object.values(CAPABILITY_OPTIONS).flat().reduce((acc, item) => {
  acc[item.id] = item;
  return acc;
}, {});

export function getCapabilityDefinition(capabilityId) {
  return CAPABILITY_LOOKUP[capabilityId] || LEGACY_CAPABILITY_DISPLAY[capabilityId] || null;
}

export function getCapabilityDisplay(capabilityId) {
  const item = getCapabilityDefinition(capabilityId);
  if (!item) {
    return {
      id: capabilityId,
      label: capabilityId,
      controlObjective: '待确认控制目标',
      description: '该能力要求尚未配置展示描述，请补充能力字典或映射依据。',
      frText: '标准方向待确认',
      frBadge: '',
      srText: 'SR 细项待确认'
    };
  }

  const frMeta = FR_DISPLAY[item.fr] || null;
  return {
    ...item,
    frText: frMeta ? `对应 ${frMeta.code} / ${frMeta.short}` : `对应 ${item.fr}`,
    frBadge: frMeta ? `${frMeta.code} / ${frMeta.short}` : item.fr,
    srText: item.sr?.length ? `细项：${item.sr.map((entry) => entry.replace('SR', 'SR ')).join('、')}` : ''
  };
}

export const CAPABILITY_MATURITY = [
  { level: 1, name: '基础', description: '具备基本安全能力，满足最低要求' },
  { level: 2, name: '标准', description: '符合行业安全标准和最佳实践' },
  { level: 3, name: '高级', description: '增强型安全防护，主动威胁检测' },
  { level: 4, name: '卓越', description: '全面级安全防护，高级持续性威胁防护' }
];

export const PRODUCT_TYPES = [
  { id: 'plc', name: 'PLC控制器', icon: 'cpu' },
  { id: 'scada', name: 'SCADA系统', icon: 'monitor' },
  { id: 'hmi', name: 'HMI人机界面', icon: 'display' },
  { id: 'firewall', name: '工业防火墙', icon: 'shield' },
  { id: 'switch', name: '工业交换机', icon: 'network' },
  { id: 'ids', name: '工业IDS/IPS', icon: 'radar' },
  { id: 'endpoint', name: '工控主机/终端', icon: 'computer' },
  { id: 'gateway', name: '通信网关', icon: 'router' },
  { id: 'sensor', name: '传感器/执行器', icon: 'thermometer' },
  { id: 'sis', name: '安全仪表系统', icon: 'alert-triangle' }
];
