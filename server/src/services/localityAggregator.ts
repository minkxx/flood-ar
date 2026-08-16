import type { LocalityStatus, ProcessedReading } from 'shared';
import { aggregateAlertLevel, findLocalityForSensor, LOCALITIES } from 'shared';

export class LocalityAggregator {
   private latestByNode = new Map<string, ProcessedReading>();

   ingest(reading: ProcessedReading): LocalityStatus | undefined {
      this.latestByNode.set(reading.nodeId, reading);

      const locality = findLocalityForSensor(reading.nodeId);
      if (!locality) {
         console.warn(
            `Reading from unknown sensor "${reading.nodeId}" -- not part of any configured locality`,
         );
         return undefined;
      }

      return this.buildStatus(locality.id);
   }

   getAll(): LocalityStatus[] {
      return LOCALITIES.map((locality) => this.buildStatus(locality.id));
   }

   private buildStatus(localityId: string): LocalityStatus {
      const locality = LOCALITIES.find((entry) => entry.id === localityId);
      if (!locality) {
         throw new Error(`Unknown locality id "${localityId}"`);
      }

      const readings = locality.sensorIds
         .map((nodeId) => this.latestByNode.get(nodeId))
         .filter(
            (reading): reading is ProcessedReading => reading !== undefined,
         );

      return {
         localityId: locality.id,
         name: locality.name,
         lat: locality.lat,
         lng: locality.lng,
         alertLevel: aggregateAlertLevel(
            readings.map((reading) => reading.alertLevel),
         ),
         sensorCount: locality.sensorIds.length,
         reportingSensorCount: readings.length,
         readings,
      };
   }
}
