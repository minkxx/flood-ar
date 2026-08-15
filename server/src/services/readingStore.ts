import type { ProcessedReading } from 'shared';

export class ReadingStore {
   private readings = new Map<string, ProcessedReading>();

   upsert(reading: ProcessedReading): void {
      this.readings.set(reading.nodeId, reading);
   }

   getAll(): Record<string, ProcessedReading> {
      return Object.fromEntries(this.readings);
   }

   get(nodeId: string): ProcessedReading | undefined {
      return this.readings.get(nodeId);
   }
}
