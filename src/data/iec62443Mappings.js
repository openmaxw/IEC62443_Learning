export const IEC_62443_MAPPING_MATRIX = [
  {
    capabilityId: 'auth-password',
    part: 'IEC 62443-3-3 / IEC 62443-4-2',
    fr: 'FR1',
    sr: 'SR1.1',
    requirementSummary: '对人类用户、软件进程或设备进行身份标识与鉴别。',
    applicability: '远程维护入口、工程师站、网关管理账户和关键操作会话。',
    evidenceExpected: '账号策略、鉴别配置截图、测试记录、产品安全手册。',
    systemInterpretation: '本系统将该能力用于判断远程维护和管理入口是否具备基础身份鉴别。',
    limitation: '仅记录映射依据，不自动判断密码策略强度或认证实现是否满足具体项目等级。'
  },
  {
    capabilityId: 'access-rbac',
    part: 'IEC 62443-3-3 / IEC 62443-4-2',
    fr: 'FR2',
    sr: 'SR2.1',
    requirementSummary: '基于授权策略限制用户、角色或系统对资源的使用。',
    applicability: '远程维护账号、工程师操作权限、设备管理权限和运维职责边界。',
    evidenceExpected: '角色权限矩阵、配置截图、账号审批记录、权限测试记录。',
    systemInterpretation: '本系统将该能力用于判断设备或系统是否能支撑最小权限和职责隔离。',
    limitation: '实际授权边界仍需结合组织流程、账号生命周期和现场配置评审。'
  },
  {
    capabilityId: 'logging-event',
    part: 'IEC 62443-3-3 / IEC 62443-4-2',
    fr: 'FR6',
    sr: 'SR6.1',
    requirementSummary: '记录与安全相关的事件，并支持后续审计、告警或追溯。',
    applicability: '登录、配置变更、策略命中、远程维护会话和关键安全告警。',
    evidenceExpected: '日志样例、事件字段清单、测试报告、日志留存和时间同步说明。',
    systemInterpretation: '本系统将该能力用于判断项目是否具备安全事件记录和验收追溯依据。',
    limitation: '不验证日志完整性、保留周期、集中分析能力或事件响应流程有效性。'
  },
  {
    capabilityId: 'access-whitelist',
    part: 'IEC 62443-3-3 / IEC 62443-4-2',
    fr: 'FR5',
    sr: 'SR5.2',
    requirementSummary: '通过网络分区、边界控制和规则限制不必要的数据流。',
    applicability: 'Zone / Conduit 边界、远程维护通道、跨区访问和最小通信开放。',
    evidenceExpected: '访问控制策略、通信矩阵、规则导出、变更记录、连通性测试记录。',
    systemInterpretation: '本系统将该能力用于判断边界设备是否能支撑白名单访问和受限数据流。',
    limitation: '不自动证明网络架构完整性，仍需结合现场拓扑、规则顺序和隐含路径检查。'
  },
  {
    capabilityId: 'logging-syslog',
    part: 'IEC 62443-3-3 / IEC 62443-4-2',
    fr: 'FR6',
    sr: 'SR6.1 / SR6.2',
    requirementSummary: '将安全事件或审计记录转发到集中平台，支撑监测和追溯。',
    applicability: '边界网关、防火墙、远程接入设备、集中日志平台或 SIEM。',
    evidenceExpected: 'Syslog 配置、转发测试记录、日志字段样例、集中平台接收截图。',
    systemInterpretation: '本系统将该能力用于判断设备声明是否能支撑集中审计和事件响应准备。',
    limitation: '不评估集中平台规则质量、告警处置 SLA 或日志防篡改能力。'
  },
  {
    capabilityId: 'audit-report',
    part: 'IEC 62443-3-3 / IEC 62443-4-2',
    fr: 'FR6',
    sr: 'SR6.2',
    requirementSummary: '支持审计记录查看、导出或报告生成，用于安全审查和验收。',
    applicability: '项目验收、客户稽核、远程维护复核和差距闭环证据归档。',
    evidenceExpected: '审计报表样例、导出记录、审查签核记录、报告生成说明。',
    systemInterpretation: '本系统将该能力用于判断项目是否能把日志和操作证据转化为可审阅交付物。',
    limitation: '不替代正式审计程序，也不判断审计记录是否覆盖所有合规场景。'
  }
];

const mappingByCapability = new Map(IEC_62443_MAPPING_MATRIX.map((item) => [item.capabilityId, item]));

export function getIecMappingByCapability(capabilityId) {
  return mappingByCapability.get(capabilityId) || null;
}
