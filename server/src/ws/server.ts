import type { Server } from 'node:http';
import type { LocalityStatus, ProcessedReading } from 'shared';
import { WebSocketServer } from 'ws';
import type { LocalityAggregator } from '../services/localityAggregator.js';
import type { ReadingStore } from '../services/readingStore.js';

type BroadcastMessage =
   | { type: 'snapshot'; readings: Record<string, ProcessedReading> }
   | { type: 'reading'; reading: ProcessedReading }
   | { type: 'locality-snapshot'; localities: LocalityStatus[] }
   | { type: 'locality-update'; locality: LocalityStatus };

export function createWsServer(
   httpServer: Server,
   store: ReadingStore,
   localityAggregator: LocalityAggregator,
) {
   const wss = new WebSocketServer({ server: httpServer });

   wss.on('connection', (socket) => {
      const readingsSnapshot: BroadcastMessage = {
         type: 'snapshot',
         readings: store.getAll(),
      };
      const localitySnapshot: BroadcastMessage = {
         type: 'locality-snapshot',
         localities: localityAggregator.getAll(),
      };
      socket.send(JSON.stringify(readingsSnapshot));
      socket.send(JSON.stringify(localitySnapshot));
   });

   function broadcast(message: BroadcastMessage): void {
      const payload = JSON.stringify(message);
      for (const client of wss.clients) {
         if (client.readyState === client.OPEN) {
            client.send(payload);
         }
      }
   }

   return { broadcast };
}
