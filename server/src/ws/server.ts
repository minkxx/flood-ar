import type { Server } from 'node:http';
import type { ProcessedReading } from 'shared';
import { WebSocketServer } from 'ws';
import type { ReadingStore } from '../services/readingStore.js';

type BroadcastMessage =
   | { type: 'snapshot'; readings: Record<string, ProcessedReading> }
   | { type: 'reading'; reading: ProcessedReading };

export function createWsServer(httpServer: Server, store: ReadingStore) {
   const wss = new WebSocketServer({ server: httpServer });

   wss.on('connection', (socket) => {
      const snapshot: BroadcastMessage = {
         type: 'snapshot',
         readings: store.getAll(),
      };
      socket.send(JSON.stringify(snapshot));
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
