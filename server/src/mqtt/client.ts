import mqtt from 'mqtt';
import {
   computeAlertLevel,
   type ProcessedReading,
   type SensorReading,
} from 'shared';

interface CreateMqttClientOptions {
   brokerUrl: string;
   onReading: (reading: ProcessedReading) => void;
}

function isSensorReading(value: unknown): value is SensorReading {
   if (typeof value !== 'object' || value === null) return false;
   const candidate = value as Record<string, unknown>;
   return (
      typeof candidate.nodeId === 'string' &&
      typeof candidate.localityId === 'string' &&
      typeof candidate.waterLevelCm === 'number' &&
      typeof candidate.lat === 'number' &&
      typeof candidate.lng === 'number' &&
      typeof candidate.timestamp === 'string'
   );
}

export function createMqttClient({
   brokerUrl,
   onReading,
}: CreateMqttClientOptions) {
   const client = mqtt.connect(brokerUrl);

   client.on('connect', () => {
      console.log(`Connected to MQTT broker at ${brokerUrl}`);
      client.subscribe('sensors/+/data');
   });

   client.on('message', (_topic, payloadBuffer) => {
      let parsed: unknown;
      try {
         parsed = JSON.parse(payloadBuffer.toString());
      } catch (err) {
         console.error('Received malformed MQTT payload', err);
         return;
      }

      if (!isSensorReading(parsed)) {
         console.error('Received MQTT payload with unexpected shape', parsed);
         return;
      }

      const reading: ProcessedReading = {
         ...parsed,
         alertLevel: computeAlertLevel(parsed.waterLevelCm),
      };

      onReading(reading);
   });

   client.on('error', (err) => {
      console.error('MQTT client error', err);
   });

   return client;
}
