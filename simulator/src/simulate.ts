import mqtt from 'mqtt';
import type { SensorReading } from 'shared';
import { LOCALITIES } from 'shared';

const BROKER_URL = process.env.MQTT_URL ?? 'mqtt://localhost:1883';

interface SimulatedSensor {
   nodeId: string;
   localityId: string;
   lat: number;
   lng: number;
}

const SENSORS: SimulatedSensor[] = LOCALITIES.flatMap((locality) =>
   locality.sensorIds.map((nodeId, index) => ({
      nodeId,
      localityId: locality.id,
      lat: locality.lat + (index - 1.5) * 0.0015,
      lng: locality.lng + (index % 2 === 0 ? 1 : -1) * 0.0015,
   })),
);

const FLOOD_NODE = SENSORS[0]?.nodeId;
const FLOOD_START_TICK = 12;

const state = new Map<string, number>(
   SENSORS.map((sensor) => [sensor.nodeId, 20]),
);
let tick = 0;

function nextReading(nodeId: string): number {
   const current = state.get(nodeId) ?? 10;
   const delta =
      nodeId === FLOOD_NODE && tick >= FLOOD_START_TICK
         ? 3 + Math.random() * 3
         : -0.5 + Math.random() * 1.3;
   const level = Math.max(0, current + delta);
   state.set(nodeId, level);
   return Math.round(level * 10) / 10;
}

const client = mqtt.connect(BROKER_URL);

client.on('connect', () => {
   console.log(`Connected to MQTT broker at ${BROKER_URL}`);
   console.log(
      `Simulator running with ${SENSORS.length} sensors across ${LOCALITIES.length} localities.`,
   );

   setInterval(() => {
      for (const sensor of SENSORS) {
         const reading: SensorReading = {
            nodeId: sensor.nodeId,
            localityId: sensor.localityId,
            waterLevelCm: nextReading(sensor.nodeId),
            lat: sensor.lat,
            lng: sensor.lng,
            timestamp: new Date().toISOString(),
         };
         const topic = `sensors/${sensor.nodeId}/data`;
         client.publish(topic, JSON.stringify(reading));
      }
      tick += 1;
   }, 5000);
});

client.on('error', (err) => {
   console.error('MQTT connection error', err);
});
