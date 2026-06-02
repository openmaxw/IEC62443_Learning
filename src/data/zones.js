// Zone 和 Conduit 模板库
// 参考标准: IEC 62443-3-3

export const ZONE_TEMPLATES = [
  {
    id: 'zone-enterprise',
    name: '企业网络',
    description: '企业IT网络区域，用于办公和管理',
    securityLevel: 1,
    assets: ['办公终端', '服务器', '打印机'],
    typicalConduits: ['zone-dmz', 'zone-ot'],
    boundaryControls: ['防火墙', 'IDS', 'VPN集中器'],
    maxSL: 2
  },
  {
    id: 'zone-dmz',
    name: 'DMZ',
    description: '隔离区，用于对外服务',
    securityLevel: 2,
    assets: ['Web服务器', '邮件网关', 'VPN网关'],
    typicalConduits: ['zone-enterprise', 'zone-ot'],
    boundaryControls: ['工业防火墙', '负载均衡器', 'WAF'],
    maxSL: 3
  },
  {
    id: 'zone-ot',
    name: 'OT网络',
    description: '运营技术网络区域，包含工业控制系统',
    securityLevel: 2,
    assets: ['PLC', 'DCS', 'SCADA服务器', '工业交换机'],
    typicalConduits: ['zone-dmz', 'zone-cell'],
    boundaryControls: ['工业防火墙', '工业交换机VLAN隔离', '数据二极管'],
    maxSL: 3
  },
  {
    id: 'zone-cell',
    name: '单元区域',
    description: '生产单元内部网络',
    securityLevel: 3,
    assets: ['PLC', 'HMI', '传感器', '执行器'],
    typicalConduits: ['zone-ot'],
    boundaryControls: ['工业防火墙', '深度包检测(DPI)', '802.1X认证'],
    maxSL: 4
  },
  {
    id: 'zone-safety',
    name: '安全系统',
    description: '安全仪表系统区域',
    securityLevel: 4,
    assets: ['SIS控制器', '安全阀', '紧急停车按钮'],
    typicalConduits: ['zone-cell', 'zone-ot'],
    boundaryControls: ['物理隔离', '单向数据二极管', '安全PLC冗余'],
    maxSL: 4
  },
  {
    id: 'zone-supervisory',
    name: '监控区域',
    description: '监控和数据采集区域',
    securityLevel: 2,
    assets: ['SCADA服务器', '历史数据库', '报警服务器'],
    typicalConduits: ['zone-cell', 'zone-ot'],
    boundaryControls: ['工业防火墙', '日志采集器', '堡垒机'],
    maxSL: 3
  }
];

export const CONDUIT_TEMPLATES = [
  {
    id: 'conduit-ethernet',
    name: '标准以太网',
    type: 'ethernet',
    description: '标准以太网连接，适用于办公和一般工业环境',
    typicalBandwidth: '100Mbps - 1Gbps',
    securityMeasures: ['VLAN隔离', '端口安全', '802.1X认证'],
    maxSL: 2,
    typicalProtocols: ['TCP', 'UDP', 'HTTP', 'HTTPS']
  },
  {
    id: 'conduit-industrial-ethernet',
    name: '工业以太网',
    type: 'industrial-ethernet',
    description: '工业级以太网，支持冗余和实时通信',
    typicalBandwidth: '1Gbps',
    securityMeasures: ['工业防火墙', 'MRP环网冗余', 'DPI检测'],
    maxSL: 3,
    typicalProtocols: ['Modbus TCP', 'EtherNet/IP', 'PROFINET', 'OPC UA', 'EtherCAT', 'MQTT']
  },
  {
    id: 'conduit-fieldbus',
    name: '现场总线',
    type: 'fieldbus',
    description: '工业现场总线通信，稳健可靠',
    typicalBandwidth: '1Mbps - 10Mbps',
    securityMeasures: ['网络分段', '物理隔离'],
    maxSL: 3,
    typicalProtocols: ['PROFIBUS', 'Foundation Fieldbus', 'DeviceNet']
  },
  {
    id: 'conduit-serial',
    name: '串行通信',
    type: 'serial',
    description: 'RS-232/RS-485串行通信，传统设备接口',
    typicalBandwidth: '115Kbps - 10Mbps',
    securityMeasures: ['串口隔离器', '协议转换器防火墙'],
    maxSL: 3,
    typicalProtocols: ['Modbus RTU', 'DNP3', 'ASCII']
  },
  {
    id: 'conduit-wireless',
    name: '工业无线',
    type: 'wireless',
    description: '工业无线通信，支持移动设备接入',
    typicalBandwidth: '54Mbps - 300Mbps',
    securityMeasures: ['WPA3-Enterprise', 'VPN隧道', '网络准入控制'],
    maxSL: 3,
    typicalProtocols: ['WirelessHART', 'ISA100.11a', 'Wi-Fi', 'MQTT']
  },
  {
    id: 'conduit-opcua',
    name: 'OPC UA 安全通道',
    type: 'opcua',
    description: 'OPC UA 统一架构，提供端到端安全通信',
    typicalBandwidth: '取决于底层网络',
    securityMeasures: ['TLS加密', '证书认证', '信息模型安全'],
    maxSL: 4,
    typicalProtocols: ['OPC UA']
  }
];

export const PROTOCOL_TEMPLATES = [
  { id: 'http', name: 'HTTP', port: 80, layer: 7, security: 'basic' },
  { id: 'https', name: 'HTTPS', port: 443, layer: 7, security: 'high' },
  { id: 'ssh', name: 'SSH', port: 22, layer: 7, security: 'high' },
  { id: 'mqtt', name: 'MQTT', port: 1883, layer: 7, security: 'medium' },
  { id: 'tcp-ip', name: '普通TCP/IP', port: null, layer: 4, security: 'basic' },
  { id: 'ethercat', name: 'EtherCAT', port: null, layer: 2, security: 'medium' },
  { id: 'modbus-tcp', name: 'Modbus TCP', port: 502, layer: 4, security: 'basic' },
  { id: 'opc-ua', name: 'OPC UA', port: 4840, layer: 4, security: 'high' },
  { id: 'ethernet-ip', name: 'EtherNet/IP', port: 44818, layer: 4, security: 'medium' },
  { id: 'dnp3', name: 'DNP3', port: 20000, layer: 4, security: 'medium' },
  { id: 'foundation-fieldbus', name: 'Foundation Fieldbus', port: null, layer: 1, security: 'low' },
  { id: 'profibus', name: 'PROFIBUS', port: null, layer: 1, security: 'low' },
  { id: 'profinet', name: 'PROFINET', port: null, layer: 2, security: 'medium' },
  { id: 'hart', name: 'HART', port: null, layer: 1, security: 'low' },
  { id: 'modbus-rtu', name: 'Modbus RTU', port: null, layer: 1, security: 'low' },
  { id: 'bacnet', name: 'BACnet', port: 47808, layer: 4, security: 'medium' },
  { id: 'enip', name: 'EtherNet/IP (CIP)', port: 44818, layer: 4, security: 'medium' }
];

// 安全等级与协议匹配建议
export const SL_PROTOCOL_RECOMMENDATION = {
  1: {
    protocols: ['modbus-tcp', 'bacnet', 'http', 'tcp-ip'],
    minSecurity: 'basic',
    description: '基础安全，适合SL1，使用标准工业协议'
  },
  2: {
    protocols: ['modbus-tcp', 'ethernet-ip', 'dnp3', 'bacnet', 'https', 'ssh', 'mqtt', 'tcp-ip'],
    minSecurity: 'medium',
    description: '标准安全，适合SL2，需启用协议安全特性'
  },
  3: {
    protocols: ['opc-ua', 'ethernet-ip', 'dnp3', 'https', 'ssh', 'mqtt', 'ethercat'],
    minSecurity: 'high',
    description: '高级安全，适合SL3，推荐使用OPC UA或加密隧道'
  },
  4: {
    protocols: ['opc-ua', 'https', 'ssh'],
    minSecurity: 'high',
    description: '最高安全，适合SL4，必须使用端到端加密和证书认证'
  }
};

// 默认分区方案
export const DEFAULT_ZONE_PLAN = [
  { zone: 'zone-enterprise', label: '企业网络' },
  { zone: 'zone-dmz', label: 'DMZ' },
  { zone: 'zone-supervisory', label: '监控区域' },
  { zone: 'zone-ot', label: 'OT网络' },
  { zone: 'zone-cell', label: '单元区域' },
  { zone: 'zone-safety', label: '安全系统' }
];
