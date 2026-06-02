import { useState, useCallback } from 'react';
import { generateRiskProfile } from '../utils/riskEngine';

/**
 * 风险评估 Hook
 */
export function useRiskAssessment() {
  const [assessment, setAssessment] = useState(null);
  const [riskProfile, setRiskProfile] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const calculateRisk = useCallback((assessmentData) => {
    setIsCalculating(true);
    setAssessment(assessmentData);

    // 模拟计算延迟
    setTimeout(() => {
      const profile = generateRiskProfile(assessmentData);
      setRiskProfile(profile);
      setIsCalculating(false);
    }, 500);
  }, []);

  const reset = useCallback(() => {
    setAssessment(null);
    setRiskProfile(null);
  }, []);

  return {
    assessment,
    riskProfile,
    isCalculating,
    calculateRisk,
    reset
  };
}
