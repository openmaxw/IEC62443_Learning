// IEC 62443 规则与映射底座
// 说明：本项目用于辅助规划与选型，不用于自动认证、合规裁定或生成唯一正确架构。

export const DISCLAIMER = {
  short: '本系统用于 IEC 62443 驱动的安全规划辅助，不替代专家评审、正式风险分析或合规认证。',
  full: '本系统基于 IEC 62443 方法论提供需求翻译、规划建议与能力匹配结果，输出仅用于项目前期沟通、方案辅助和交付准备，不应被视为认证结论、唯一正确架构或最终合规判断。所有建议均应结合具体工艺、威胁场景、资产关键性和专家审查进一步确认。'
};

export const VIEW_MODES = {
  beginner: { id: 'beginner', label: '小白视图', description: '只看结论、建议与注意事项' },
  advanced: { id: 'advanced', label: '进阶视图', description: '查看 FR 与控制逻辑' },
  professional: { id: 'professional', label: '专业视图', description: '查看映射来源、能力声明与证据字段' }
};

export const SECURITY_LEVEL_TYPES = {
  SL_T: {
    code: 'SL-T',
    name: '目标安全等级',
    description: '根据业务后果、威胁场景和安全目标建议的目标等级'
  },
  SL_A: {
    code: 'SL-A',
    name: '达成安全等级',
    description: '结合补偿措施后，系统实际可达成的等级'
  },
  SL_C: {
    code: 'SL-C',
    name: '能力安全等级',
    description: '产品或组件声称支持的能力等级'
  }
};

export const SECURITY_LEVELS = {
  SL1: {
    level: 1,
    name: '安全级别 1',
    description: '针对非故意或偶发违规提供基础防护',
    target: '适用于基础工业环境和初始分段控制场景'
  },
  SL2: {
    level: 2,
    name: '安全级别 2',
    description: '针对具备基础能力的故意攻击提供防护',
    target: '适用于已有边界控制、远程运维和第三方接入场景'
  },
  SL3: {
    level: 3,
    name: '安全级别 3',
    description: '针对具备专业资源与针对性手段的攻击提供增强防护',
    target: '适用于高连续性、高暴露面或高后果工业场景'
  },
  SL4: {
    level: 4,
    name: '安全级别 4',
    description: '针对高度复杂且资源充足的攻击场景提供强化防护',
    target: '适用于极高后果和高度敏感的关键工业场景'
  }
};

export const FR_CATEGORIES = {
  FR1: {
    name: '标识与鉴别控制',
    nameEn: 'Identification and Authentication Control',
    description: '对人员、设备和会话进行身份标识与鉴别',
    sr: ['SR1.1', 'SR1.2', 'SR1.3', 'SR1.4', 'SR1.5', 'SR1.6', 'SR1.7']
  },
  FR2: {
    name: '使用控制',
    nameEn: 'Use Control',
    description: '基于职责、最小权限和会话控制管理访问行为',
    sr: ['SR2.1', 'SR2.2', 'SR2.3', 'SR2.4', 'SR2.5', 'SR2.6', 'SR2.8']
  },
  FR3: {
    name: '系统完整性',
    nameEn: 'System Integrity',
    description: '防止系统、配置、软件和数据被未授权篡改',
    sr: ['SR3.1', 'SR3.2', 'SR3.3', 'SR3.4', 'SR3.8']
  },
  FR4: {
    name: '数据机密性',
    nameEn: 'Data Confidentiality',
    description: '保护敏感数据与凭据不被未授权获取',
    sr: ['SR4.1', 'SR4.2', 'SR4.3']
  },
  FR5: {
    name: '受限数据流',
    nameEn: 'Restricted Data Flow',
    description: '通过区域边界和通信规则限制不必要的数据流与访问路径',
    sr: ['SR5.1', 'SR5.2']
  },
  FR6: {
    name: '对事件的及时响应',
    nameEn: 'Timely Response to Events',
    description: '提供日志、告警、审计和事件响应支持',
    sr: ['SR6.1', 'SR6.2']
  },
  FR7: {
    name: '资源可用性',
    nameEn: 'Resource Availability',
    description: '保障关键系统和资源在需要时可用并具备恢复能力',
    sr: ['SR7.1', 'SR7.2', 'SR7.3', 'SR7.4']
  }
};

export const OWNER_INPUT_ENUMS = {
  consequenceLevels: ['low', 'medium', 'high'],
  maturityLevels: ['low', 'medium', 'high'],
  remoteAccessNeed: ['none', 'limited', 'extensive'],
  thirdPartyAccess: ['none', 'occasional', 'regular'],
  acceptancePreference: ['function-first', 'security-first', 'operations-first'],
  remoteOwnership: ['owner', 'integrator', 'vendor', 'shared']
};

export const DRIVER_DEFINITIONS = {
  safetyImpact: {
    label: '人身安全后果',
    values: {
      low: 0,
      medium: 2,
      high: 4
    }
  },
  environmentalImpact: {
    label: '环境后果',
    values: {
      low: 0,
      medium: 2,
      high: 4
    }
  },
  productionImpact: {
    label: '产能影响',
    values: {
      low: 1,
      medium: 2,
      high: 3
    }
  },
  financialImpact: {
    label: '财务影响',
    values: {
      low: 1,
      medium: 2,
      high: 3
    }
  },
  complianceImpact: {
    label: '合规影响',
    values: {
      low: 0,
      medium: 2,
      high: 3
    }
  },
  qualityImpact: {
    label: '质量影响',
    values: {
      low: 1,
      medium: 2,
      high: 3
    }
  },
  brandImpact: {
    label: '品牌影响',
    values: {
      low: 0,
      medium: 2,
      high: 3
    }
  },
  remoteAccessNeed: {
    label: '远程运维暴露面',
    values: {
      none: 0,
      limited: 2,
      extensive: 3
    }
  },
  thirdPartyAccess: {
    label: '第三方接入频率',
    values: {
      none: 0,
      occasional: 1,
      regular: 3
    }
  },
  networkSegmentationMaturity: {
    label: '现有网络隔离成熟度',
    values: {
      low: 3,
      medium: 2,
      high: 0
    }
  },
  identityMaturity: {
    label: '账号与身份管理成熟度',
    values: {
      low: 3,
      medium: 2,
      high: 0
    }
  },
  loggingMaturity: {
    label: '日志审计成熟度',
    values: {
      low: 2,
      medium: 1,
      high: 0
    }
  },
  patchMaturity: {
    label: '补丁与维护成熟度',
    values: {
      low: 2,
      medium: 1,
      high: 0
    }
  },
  remoteOperationsOwnership: {
    label: '远程运维责任归属',
    values: {
      owner: 0,
      integrator: 1,
      vendor: 2,
      shared: 2
    }
  }
};

export const RISK_CONCERNS = {
  availability: {
    id: 'availability',
    title: '连续运行与恢复能力',
    description: '生产、控制和运维活动应尽量避免中断，并具备恢复能力',
    fr: ['FR7']
  },
  remoteAccess: {
    id: 'remoteAccess',
    title: '远程访问与身份边界',
    description: '远程运维、第三方接入和账户使用应被严格识别、限制和审计',
    fr: ['FR1', 'FR2', 'FR6']
  },
  dataProtection: {
    id: 'dataProtection',
    title: '敏感数据与配置保护',
    description: '关键工艺、配置、凭据和业务数据应受到机密性与完整性保护',
    fr: ['FR3', 'FR4']
  },
  segmentation: {
    id: 'segmentation',
    title: '分区分域与受限数据流',
    description: '应按职责和暴露面划分区域，并通过边界控制约束通信',
    fr: ['FR5', 'FR2']
  },
  monitoring: {
    id: 'monitoring',
    title: '可见性与事件响应',
    description: '应保留日志、告警和审计信息以支持问题追溯和响应',
    fr: ['FR6']
  }
};

export const OWNER_TO_CONCERNS = {
  safetyImpact: ['availability'],
  environmentalImpact: ['availability'],
  productionImpact: ['availability'],
  financialImpact: ['availability', 'dataProtection'],
  complianceImpact: ['monitoring', 'dataProtection'],
  qualityImpact: ['availability', 'dataProtection'],
  brandImpact: ['monitoring', 'remoteAccess'],
  remoteAccessNeed: ['remoteAccess', 'segmentation'],
  thirdPartyAccess: ['remoteAccess', 'monitoring'],
  networkSegmentationMaturity: ['segmentation'],
  identityMaturity: ['remoteAccess'],
  loggingMaturity: ['monitoring'],
  patchMaturity: ['dataProtection'],
  remoteOperationsOwnership: ['remoteAccess', 'monitoring']
};

export const CONTROL_OBJECTIVES = {
  identity: {
    id: 'identity',
    title: '身份与会话控制',
    fr: ['FR1', 'FR2'],
    capabilities: ['auth-password', 'auth-session', 'access-rbac']
  },
  boundary: {
    id: 'boundary',
    title: '区域边界与通信约束',
    fr: ['FR5', 'FR2'],
    capabilities: ['access-policy', 'access-whitelist', 'access-privilege']
  },
  integrity: {
    id: 'integrity',
    title: '配置与系统完整性保护',
    fr: ['FR3'],
    capabilities: ['integrity-firmware', 'integrity-crypto']
  },
  confidentiality: {
    id: 'confidentiality',
    title: '敏感数据保护',
    fr: ['FR4'],
    capabilities: ['encryption-tls', 'encryption-key']
  },
  monitoring: {
    id: 'monitoring',
    title: '日志、审计与告警',
    fr: ['FR6'],
    capabilities: ['logging-event', 'logging-alarm', 'audit-report']
  },
  resilience: {
    id: 'resilience',
    title: '可用性与恢复',
    fr: ['FR7'],
    capabilities: ['integrity-crc', 'audit-compliance']
  }
};

export const TARGET_LEVEL_CANDIDATES = [
  {
    level: 1,
    label: '建议目标等级候选 SL1',
    condition: '适用于低后果、低暴露面和基础分段场景'
  },
  {
    level: 2,
    label: '建议目标等级候选 SL2',
    condition: '适用于存在远程运维、第三方接入和边界控制需求的常见工业场景'
  },
  {
    level: 3,
    label: '建议目标等级候选 SL3',
    condition: '适用于高连续性、高后果或高暴露面的重点工业场景'
  },
  {
    level: 4,
    label: '建议目标等级候选 SL4',
    condition: '适用于极高后果和高度敏感的关键工业系统'
  }
];

export const BUSINESS_IMPACT_GUIDANCE = {
  availability: ['识别关键连续运行资产', '为关键区域定义停机窗口与恢复优先级'],
  remoteAccess: ['对远程运维建立身份鉴别和会话边界', '对第三方接入定义审批、时效和留痕要求'],
  dataProtection: ['对配方、配置、凭据和敏感数据定义保护要求', '明确完整性保护和加密边界'],
  segmentation: ['按职责与风险划分 Zone/Conduit', '对跨区通信定义允许条件和最小开放范围'],
  monitoring: ['定义日志留存、审计对象和告警处置责任', '为关键访问和关键变更建立可追溯性']
};
