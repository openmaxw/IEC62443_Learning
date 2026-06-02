export const DEMO_PROJECT_STATE = {
  currentRole: 'owner',
  currentStep: 0,
  projectMeta: {
    projectName: '某半导体制造企业－12 英寸晶圆厂 OT 安全协同演示',
    organizationName: '某半导体制造企业',
    siteName: '12 英寸晶圆厂',
    industry: 'electronics',
    scenarioType: 'retrofit',
    projectObjective: '完成晶圆厂制造区、厂务区与远程维护边界梳理，并验证关键边界设备能力与闭环路径',
    status: 'demo-loaded',
    experienceLevel: 'beginner'
  },
  ownerProfile: {
    assessment: {
      projectName: '某半导体制造企业－12 英寸晶圆厂 OT 安全协同演示',
      industry: 'electronics',
      safetyImpact: 'high',
      environmentalImpact: 'medium',
      productionImpact: 'high',
      qualityImpact: 'high',
      financialImpact: 'high',
      complianceImpact: 'high',
      brandImpact: 'high',
      remoteAccessNeed: 'limited',
      thirdPartyAccess: 'regular',
      itOtIntegration: 'moderate',
      networkSegmentationMaturity: 'medium',
      identityMaturity: 'medium',
      loggingMaturity: 'medium',
      patchMaturity: 'medium',
      maintenanceWindow: '每周三 02:00-04:00 计划维护窗口',
      upgradeWindow: '季度设备保养窗口与年度停机检修窗口',
      remoteOperationsOwnership: 'shared',
      acceptancePreference: 'security-first',
      criticalAssets: ['plc', 'scada', 'engineering', 'historian', 'remote-gateway'],
      keySystems: 'MES 接口服务器、SCADA/HMI 站、工程师站、历史数据库、厂务监控服务器、远程安全接入网关',
      externalConnections: '与 MES/ERP 交换生产与设备状态数据；设备供应商经受控远程维护通道接入；厂务与安防系统需与中央监控平台交换事件',
      maintenanceAccessPath: '厂外 VPN -> 制造区 DMZ 安全网关 -> 维护跳板 -> 工程师站/维护主机',
      initialBoundaryNotes: '制造执行网、厂务监控网与企业信息网之间已有边界防火墙，但部分维护工作站与生产设备控制网络仍存在跨区直达访问路径',
      continuityRequirements: '12 英寸晶圆制程须维持高可用连续生产，扩散、蚀刻与光刻关键工站不可因安全切换产生非计划停机',
      complianceNotes: '涉及客户稽核、生产良率、机密制程资料与远程维护留痕要求，所有跨区与远程访问需可审计追溯'
    },
    draft: null
  },
  riskTranslation: {
    profile: {
      drivers: [],
      riskConcerns: [
        { id: 'remoteAccess', title: '远程与第三方维护接入', level: 'high' },
        { id: 'fabContinuity', title: '晶圆制程连续性与良率影响', level: 'high' }
      ],
      riskConcernSummary: [
        { id: 'remoteAccess', title: '远程与第三方维护接入', summary: '需控制设备商远程维护入口、身份鉴别、最小权限与会话审计。' },
        { id: 'fabContinuity', title: '晶圆制程连续性与良率影响', summary: '需优先保护制造区关键控制通信，避免跨区访问影响良率与设备连续运行。' }
      ],
      frFocus: [{ code: 'FR1' }, { code: 'FR2' }, { code: 'FR5' }, { code: 'FR6' }, { code: 'FR7' }],
      targetLevelCandidates: [{ level: 2 }, { level: 3 }],
      ownerRequirements: [
        '远程维护必须通过受控入口、基于角色的权限控制与会话审计。',
        '制造区、厂务区与企业信息网之间应采用分区分域与最小通信开放策略。',
        '关键边界设备、关键账号与关键安全事件应具备日志记录与追溯能力。'
      ],
      acceptanceFocus: ['验证远程维护入口的边界受控与日志留存能力', '验证制造区跨区通信与访问白名单是否满足最小开放原则'],
      explanations: [
        {
          controlObjective: '远程维护访问控制',
          capabilityNeeds: ['auth-password', 'access-rbac', 'logging-event'],
          fr: ['FR1', 'FR2', 'FR6'],
          inputConditions: ['存在远程维护通道', '设备供应商接入频繁'],
          riskConcerns: ['远程与第三方维护接入']
        },
        {
          controlObjective: '边界防护与会话审计',
          capabilityNeeds: ['access-whitelist', 'logging-syslog', 'audit-report'],
          fr: ['FR2', 'FR6', 'FR7'],
          inputConditions: ['关键制造连续性要求高'],
          riskConcerns: ['晶圆制程连续性与良率影响']
        }
      ]
    }
  },
  integratorDesign: {
    plan: {
      zones: ['zone-cell', 'zone-dmz', 'zone-ot'],
      conduits: ['conduit-opcua', 'conduit-ethernet'],
      assets: [
        { id: 'asset-1', name: '光刻区工艺设备控制器', zone: 'zone-cell', role: 'control', groupingReason: '属于关键制造单元控制边界，需与外部访问严格隔离' },
        { id: 'asset-2', name: '制造区工程师站', zone: 'zone-ot', role: 'engineering', groupingReason: '承担配方下载与维护任务，不应与控制器处于同一信任区' },
        { id: 'asset-3', name: '工业边界安全网关 XG-9000', zone: 'zone-dmz', role: 'server', groupingReason: '部署于制造区 DMZ 作为远程维护与边界访问受控入口' }
      ],
      communicationFlows: [
        { id: 'flow-1', source: 'zone-ot', target: 'zone-cell', protocol: 'OPC UA', direction: '双向', necessity: '制程监控、设备状态读取与受控参数下发', businessReason: '工程师站与监控系统需读取设备状态并下发经审批的维护指令', boundaryControl: '通过工业防火墙、白名单与最小开放策略控制' },
        { id: 'flow-2', source: 'zone-dmz', target: 'zone-ot', protocol: 'HTTPS', direction: '双向', necessity: '供应商远程维护会话与审计接入', businessReason: '设备商经审批后通过工业边界安全网关建立受控远程维护连接，并进入维护跳板与工程师站', boundaryControl: 'VPN + NAT + 策略控制 + Syslog 审计 + 会话留痕' }
      ],
      targetSL: 3,
      requiredFR: ['FR1', 'FR2', 'FR5', 'FR6', 'FR7'],
      designBasis: '按照制造区、制造 DMZ 与企业/远程访问区分层隔离原则设计，优先确保 12 英寸晶圆产线连续性、远程维护可控性与关键边界审计能力。',
      designBasisSummary: {
        keySystems: 'MES 接口服务器、SCADA/HMI 站、工程师站、历史数据库、厂务监控服务器、远程安全接入网关',
        externalConnections: '与 MES/ERP 交换生产与设备状态数据；设备供应商经受控远程维护通道接入；厂务与安防系统需与中央监控平台交换事件',
        maintenanceAccessPath: '厂外 VPN -> 制造区 DMZ 安全网关 -> 维护跳板 -> 工程师站/维护主机',
        initialBoundaryNotes: '制造执行网、厂务监控网与企业信息网之间已有边界防火墙，但部分维护工作站与生产设备控制网络仍存在跨区直达访问路径',
        continuityRequirements: '12 英寸晶圆制程须维持高可用连续生产，扩散、蚀刻与光刻关键工站不可因安全切换产生非计划停机',
        designBasis: '按照制造区、制造 DMZ 与企业/远程访问区分层隔离原则设计，优先确保 12 英寸晶圆产线连续性、远程维护可控性与关键边界审计能力。'
      },
      communicationMatrix: {
        complete: true,
        missingFields: [],
        rows: [
          { id: 'flow-1', source: 'zone-ot', sourceName: '制造运营区', target: 'zone-cell', targetName: '制造控制单元', protocol: 'OPC UA', direction: '双向', businessReason: '工程师站与监控系统需读取设备状态并下发经审批的维护指令', boundaryControl: '通过工业防火墙、白名单与最小开放策略控制', conduit: '现场运营通道' },
          { id: 'flow-2', source: 'zone-dmz', sourceName: '制造 DMZ', target: 'zone-ot', targetName: '制造运营区', protocol: 'HTTPS', direction: '双向', businessReason: '设备商经审批后通过工业边界安全网关建立受控远程维护连接，并进入维护跳板与工程师站', boundaryControl: 'VPN + NAT + 策略控制 + Syslog 审计 + 会话留痕', conduit: '远程支持通道' }
        ]
      },
      capabilityRequirements: [
        { id: 'req-1', controlObjective: '远程维护访问控制', capabilityId: 'auth-password', sourceFR: ['FR1'], targetSL: 3, requirementLevel: 'high', implementationHint: '远程维护入口和设备管理账户需具备身份鉴别。', traceability: { inputConditions: ['存在远程维护通道', '设备供应商接入频繁'], riskConcerns: ['远程与第三方维护接入'] } },
        { id: 'req-2', controlObjective: '远程维护访问控制', capabilityId: 'access-rbac', sourceFR: ['FR2'], targetSL: 3, requirementLevel: 'high', implementationHint: '远程维护账号需按角色授权并限制管理权限。', traceability: { inputConditions: ['存在远程维护通道', '设备供应商接入频繁'], riskConcerns: ['远程与第三方维护接入'] } },
        { id: 'req-3', controlObjective: '远程维护访问控制', capabilityId: 'logging-event', sourceFR: ['FR6'], targetSL: 3, requirementLevel: 'high', implementationHint: '远程登录、策略变更和安全事件需形成日志记录。', traceability: { inputConditions: ['存在远程维护通道', '设备供应商接入频繁'], riskConcerns: ['远程与第三方维护接入'] } },
        { id: 'req-4', controlObjective: '边界防护与会话审计', capabilityId: 'access-whitelist', sourceFR: ['FR5'], targetSL: 3, requirementLevel: 'high', implementationHint: '跨区访问需通过白名单和最小开放策略控制。', traceability: { inputConditions: ['关键制造连续性要求高'], riskConcerns: ['晶圆制程连续性与良率影响'] } },
        { id: 'req-5', controlObjective: '边界防护与会话审计', capabilityId: 'logging-syslog', sourceFR: ['FR6'], targetSL: 3, requirementLevel: 'high', implementationHint: '关键边界日志需上送集中日志平台以便追溯。', traceability: { inputConditions: ['关键制造连续性要求高'], riskConcerns: ['晶圆制程连续性与良率影响'] } },
        { id: 'req-6', controlObjective: '边界防护与会话审计', capabilityId: 'audit-report', sourceFR: ['FR6'], targetSL: 3, requirementLevel: 'medium', implementationHint: '项目验收阶段需形成可审阅的审计摘要或报表。', traceability: { inputConditions: ['关键制造连续性要求高'], riskConcerns: ['晶圆制程连续性与良率影响'] } }
      ]
    }
  },
  vendorCatalog: {
    capabilities: [
      {
        id: 'vendor-demo-1',
        productMeta: { productName: '工业边界安全网关 XG-9000', productType: 'gateway', securityLevel: 3, deploymentScope: '制造区 DMZ 远程维护边界与安全出口' },
        capabilityClaims: [
          { capabilityId: 'auth-password', satisfaction: 'fulfilled', implementationType: 'product', evidenceType: '厂家声明', claimScope: '设备本机管理、VPN 维护接入与管理员登录鉴别', dependencyNote: '建议结合企业统一账号与强密码策略', limitationNote: '如需统一身份联动需结合外围系统' },
          { capabilityId: 'access-rbac', satisfaction: 'partial', implementationType: 'shared', evidenceType: '厂家声明', claimScope: '设备管理角色与策略操作分权', dependencyNote: '更细粒度权限建议结合集中管理平台', limitationNote: '单机侧角色粒度有限' },
          { capabilityId: 'logging-event', satisfaction: 'fulfilled', implementationType: 'product', evidenceType: '测试报告', claimScope: '系统事件、策略变更、VPN 与安全告警日志', dependencyNote: '建议转发至集中 Syslog/SIEM 平台保存与分析', limitationNote: '' },
          { capabilityId: 'access-whitelist', satisfaction: 'fulfilled', implementationType: 'product', evidenceType: '测试报告', claimScope: 'ACL、策略控制、NAT 与边界访问白名单', dependencyNote: '', limitationNote: '' },
          { capabilityId: 'logging-syslog', satisfaction: 'fulfilled', implementationType: 'product', evidenceType: '厂家声明', claimScope: '支持事件转发至 Syslog 服务器', dependencyNote: '需部署集中日志平台', limitationNote: '' },
          { capabilityId: 'audit-report', satisfaction: 'external', implementationType: 'external', evidenceType: '项目案例', claimScope: '设备侧提供日志来源与审计证据基础', dependencyNote: '正式审计报表需由集中日志/SIEM 平台生成', limitationNote: '设备本机不直接提供完整项目级审计报表' }
        ],
        dependencies: '建议配合集中身份管理、Syslog/SIEM 平台与远程访问审批流程使用。',
        limitations: '项目级审计报表与细粒度统一权限控制需依赖上层集中管理与日志平台。',
        requirementCoverage: 6
      }
    ],
    draft: {
      productMeta: { productName: '工业边界安全网关 XG-9000', productType: 'gateway', securityLevel: 3, deploymentScope: '制造区 DMZ 远程维护边界与安全出口' },
      capabilityClaims: [
        { capabilityId: 'auth-password', satisfaction: 'fulfilled', implementationType: 'product', evidenceType: '厂家声明', claimScope: '设备本机管理、VPN 维护接入与管理员登录鉴别', dependencyNote: '建议结合企业统一账号与强密码策略', limitationNote: '如需统一身份联动需结合外围系统' },
        { capabilityId: 'access-rbac', satisfaction: 'partial', implementationType: 'shared', evidenceType: '厂家声明', claimScope: '设备管理角色与策略操作分权', dependencyNote: '更细粒度权限建议结合集中管理平台', limitationNote: '单机侧角色粒度有限' },
        { capabilityId: 'logging-event', satisfaction: 'fulfilled', implementationType: 'product', evidenceType: '测试报告', claimScope: '系统事件、策略变更、VPN 与安全告警日志', dependencyNote: '建议转发至集中 Syslog/SIEM 平台保存与分析', limitationNote: '' },
        { capabilityId: 'access-whitelist', satisfaction: 'fulfilled', implementationType: 'product', evidenceType: '测试报告', claimScope: 'ACL、策略控制、NAT 与边界访问白名单', dependencyNote: '', limitationNote: '' },
        { capabilityId: 'logging-syslog', satisfaction: 'fulfilled', implementationType: 'product', evidenceType: '厂家声明', claimScope: '支持事件转发至 Syslog 服务器', dependencyNote: '需部署集中日志平台', limitationNote: '' },
        { capabilityId: 'audit-report', satisfaction: 'external', implementationType: 'external', evidenceType: '项目案例', claimScope: '设备侧提供日志来源与审计证据基础', dependencyNote: '正式审计报表需由集中日志/SIEM 平台生成', limitationNote: '设备本机不直接提供完整项目级审计报表' }
      ],
      dependencies: '建议配合集中身份管理、Syslog/SIEM 平台与远程访问审批流程使用。',
      limitations: '项目级审计报表与细粒度统一权限控制需依赖上层集中管理与日志平台。'
    }
  },
  selectionAnalysis: {
    results: {
      results: [
        { id: 'req-1', capabilityId: 'auth-password', controlObjective: '远程维护访问控制', status: 'fulfilled', evidenceType: '厂家声明', gapNote: '当前可满足项目要求。', severity: 'low', owner: '设备商' },
        { id: 'req-2', capabilityId: 'access-rbac', controlObjective: '远程维护访问控制', status: 'partial', evidenceType: '厂家声明', gapNote: '需结合集中管理平台或项目权限流程后满足更细粒度授权要求。', severity: 'medium', owner: '设备商/集成商' },
        { id: 'req-3', capabilityId: 'logging-event', controlObjective: '远程维护访问控制', status: 'fulfilled', evidenceType: '测试报告', gapNote: '当前可提供关键事件记录能力。', severity: 'low', owner: '设备商' },
        { id: 'req-4', capabilityId: 'access-whitelist', controlObjective: '边界防护与会话审计', status: 'fulfilled', evidenceType: '测试报告', gapNote: '当前可满足项目要求。', severity: 'low', owner: '设备商' },
        { id: 'req-5', capabilityId: 'logging-syslog', controlObjective: '边界防护与会话审计', status: 'fulfilled', evidenceType: '厂家声明', gapNote: '可向集中日志平台输出审计日志。', severity: 'low', owner: '设备商' },
        { id: 'req-6', capabilityId: 'audit-report', controlObjective: '边界防护与会话审计', status: 'external', evidenceType: '项目案例', gapNote: '需通过集中日志/SIEM 平台与项目审计流程补齐。', severity: 'medium', owner: '集成商/业主' }
      ],
      summary: { high: 0, medium: 2, low: 4 }
    }
  },
  deliverables: { reports: [] }
};
