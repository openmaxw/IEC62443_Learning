export const UNIFIED_DISCLAIMER = '本系统用于 IEC 62443 驱动的安全规划辅助，不替代正式风险评估、详细设计评审、专家审核或认证合规审查。所有输出仅用于项目沟通、方案辅助与交付准备，不应视为认证结论或唯一正确架构。';

export function createDisclaimerPayload() {
  return {
    title: '使用边界说明',
    text: UNIFIED_DISCLAIMER,
    printable: true
  };
}
