export interface SensorReading {
   nodeId: string;
   localityId: string;
   waterLevelCm: number;
   lat: number;
   lng: number;
   timestamp: string;
}

export type AlertLevel = 'unknown' | 'normal' | 'warn' | 'alert';

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

const ALERT_RANK: Record<AlertLevel, number> = {
   unknown: -1,
   normal: 0,
   warn: 1,
   alert: 2,
};

export function aggregateAlertLevel(levels: AlertLevel[]): AlertLevel {
   const known = levels.filter((level) => level !== 'unknown');
   if (known.length === 0) return 'unknown';
   return known.reduce(
      (worst, level) => (ALERT_RANK[level] > ALERT_RANK[worst] ? level : worst),
      'normal' as AlertLevel,
   );
}

export interface LocalityStatus {
   localityId: string;
   name: string;
   lat: number;
   lng: number;
   alertLevel: AlertLevel;
   sensorCount: number;
   reportingSensorCount: number;
   readings: ProcessedReading[];
}
