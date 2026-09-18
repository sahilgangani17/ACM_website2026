import { QualityTier } from '../state/useCityStore';

export interface QualityPreset {
  dpr: number;
  shadows: boolean;
  shadowMapSize: number;
  maxVehicles: number;
  maxDrones: number;
  particleCount: number;
  buildingDetail: 'high' | 'medium' | 'low';
  bloomEnabled: boolean;
}

export const QUALITY_PRESETS: Record<QualityTier, QualityPreset> = {
  HIGH: {
    dpr: Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 1, 2),
    shadows: true,
    shadowMapSize: 2048,
    maxVehicles: 30,
    maxDrones: 16,
    particleCount: 800,
    buildingDetail: 'high',
    bloomEnabled: true,
  },
  MEDIUM: {
    dpr: Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 1, 1.5),
    shadows: false,
    shadowMapSize: 1024,
    maxVehicles: 16,
    maxDrones: 8,
    particleCount: 400,
    buildingDetail: 'medium',
    bloomEnabled: false,
  },
  LOW: {
    dpr: 1.0,
    shadows: false,
    shadowMapSize: 512,
    maxVehicles: 8,
    maxDrones: 4,
    particleCount: 150,
    buildingDetail: 'low',
    bloomEnabled: false,
  },
};

/**
 * Detect hardware capability and return appropriate quality tier
 */
export function detectQualityTier(): QualityTier {
  if (typeof window === 'undefined') return 'HIGH';

  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
  const memory = (navigator as unknown as { deviceMemory?: number }).deviceMemory || 8;
  const cores = navigator.hardwareConcurrency || 4;

  if (isMobile || memory < 4 || cores < 4) {
    return 'LOW';
  } else if (memory <= 8 || cores <= 6) {
    return 'MEDIUM';
  }

  return 'HIGH';
}
