import type { ProcessedReading } from 'shared';

interface SensorCardProps {
   reading: ProcessedReading;
}

const STATUS_LABEL: Record<ProcessedReading['alertLevel'], string> = {
   normal: 'Normal',
   warn: 'Flood warning',
   alert: 'Flood alert',
};

export function SensorCard({ reading }: SensorCardProps) {
   return (
      <div className={`card card-${reading.alertLevel}`}>
         <h2>{reading.nodeId}</h2>
         <div className="value">
            {reading.waterLevelCm}
            <span className="unit">cm</span>
         </div>
         <div className={`status status-${reading.alertLevel}`}>
            {STATUS_LABEL[reading.alertLevel]}
         </div>
         <div className="ts">
            {new Date(reading.timestamp).toLocaleTimeString()}
         </div>
      </div>
   );
}
