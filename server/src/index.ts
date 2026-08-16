import { createServer } from 'node:http';
import express from 'express';
import { env } from './config/env.js';
import { pool } from './db/pool.js';
import { createMqttClient } from './mqtt/client.js';
import { createReadingsRouter } from './routes/readings.js';
import { LocalityAggregator } from './services/localityAggregator.js';
import { ReadingStore } from './services/readingStore.js';
import { createWsServer } from './ws/server.js';

const app = express();
const httpServer = createServer(app);
const store = new ReadingStore();
const localityAggregator = new LocalityAggregator();
const wss = createWsServer(httpServer, store, localityAggregator);

app.use(express.json());
app.use('/api/readings', createReadingsRouter(store));
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

const mqttClient = createMqttClient({
   brokerUrl: env.MQTT_URL,
   onReading: (reading) => {
      store.upsert(reading);
      wss.broadcast({ type: 'reading', reading });

      const localityStatus = localityAggregator.ingest(reading);
      if (localityStatus) {
         wss.broadcast({ type: 'locality-update', locality: localityStatus });
      }

      pool
         .query(
            `insert into readings (node_id, locality_id, water_level_cm, alert_level, lat, lng, recorded_at)
         values ($1, $2, $3, $4, $5, $6, $7)`,
            [
               reading.nodeId,
               reading.localityId,
               reading.waterLevelCm,
               reading.alertLevel,
               reading.lat,
               reading.lng,
               reading.timestamp,
            ],
         )
         .catch((err: unknown) => {
            console.error('Failed to persist reading', err);
         });
   },
});

httpServer.listen(env.PORT, () => {
   console.log(`Server listening on port ${env.PORT}`);
});

function shutdown(): void {
   console.log('Shutting down...');
   mqttClient.end();
   httpServer.close();
   void pool.end();
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
