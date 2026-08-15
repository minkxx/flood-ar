import mqtt from 'mqtt';
import type { SensorReading } from 'shared';

const BROKER_URL = process.env.MQTT_URL ?? 'mqtt://localhost:1883';
const NODES = ['sensor-01', 'sensor-02', 'sensor-03', 'sensor-04'] as const;
const FLOOD_NODE: (typeof NODES)[number] = 'sensor-02';
const FLOOD_START_TICK = 12;

const state = new Map<string, number>(NODES.map((node) => [node, 20]));
let tick = 0;

function nextReading(node: string): number {
   const current = state.get(node) ?? 10;
   const delta =
      node === FLOOD_NODE && tick >= FLOOD_START_TICK
         ? 3 + Math.random() * 3
         : -0.5 + Math.random() * 1.3;
   const level = Math.max(0, current + delta);
   state.set(node, level);
   return Math.round(level * 10) / 10;
}

const client = mqtt.connect(BROKER_URL);

client.on('connect', () => {
   console.log(`Connected to MQTT broker at ${BROKER_URL}`);
   console.log(
      'Simulator running. Publishing fake sensor readings every 5s...',
   );

   setInterval(() => {
      for (const node of NODES) {
         const reading: SensorReading = {
            nodeId: node,
            waterLevelCm: nextReading(node),
            timestamp: new Date().toISOString(),
         };
         const topic = `sensors/${node}/data`;
         client.publish(topic, JSON.stringify(reading));
         console.log(`Published to ${topic}:`, reading);
      }
      tick += 1;
   }, 5000);
});

client.on('error', (err) => {
   console.error('MQTT connection error', err);
});
