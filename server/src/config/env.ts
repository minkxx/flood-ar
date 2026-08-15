import { z } from 'zod';

const envSchema = z.object({
   PORT: z.coerce.number().default(3000),
   MQTT_URL: z.string().default('mqtt://localhost:1883'),
   DATABASE_URL: z
      .string()
      .default('postgres://postgres:postgres@localhost:5432/flood'),
});

export const env = envSchema.parse(process.env);
