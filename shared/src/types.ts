export interface SensorReading {
   nodeId: string;
   waterLevelCm: number;
   timestamp: string;
}

export type AlertLevel = 'normal' | 'warn' | 'alert';

export interface ProcessedReading extends SensorReading {
   alertLevel: AlertLevel;
}

export const ALERT_THRESHOLDS_CM = {
   warn: 20,
   alert: 100,
} as const;

export function computeAlertLevel(waterLevelCm: number): AlertLevel {
   if (waterLevelCm >= ALERT_THRESHOLDS_CM.alert) return 'alert';
   if (waterLevelCm >= ALERT_THRESHOLDS_CM.warn) return 'warn';
   return 'normal';
}
