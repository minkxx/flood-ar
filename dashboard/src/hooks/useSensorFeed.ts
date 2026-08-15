import { useEffect, useRef, useState } from 'react';
import type { ProcessedReading } from 'shared';

type FeedMessage =
   | { type: 'snapshot'; readings: Record<string, ProcessedReading> }
   | { type: 'reading'; reading: ProcessedReading };

export function useSensorFeed(wsUrl: string): Record<string, ProcessedReading> {
   const [readings, setReadings] = useState<Record<string, ProcessedReading>>(
      {},
   );
   const socketRef = useRef<WebSocket | null>(null);

   useEffect(() => {
      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;

      socket.onmessage = (event) => {
         const message: FeedMessage = JSON.parse(event.data);
         if (message.type === 'snapshot') {
            setReadings(message.readings);
         } else {
            setReadings((prev) => ({
               ...prev,
               [message.reading.nodeId]: message.reading,
            }));
         }
      };

      return () => socket.close();
   }, [wsUrl]);

   return readings;
}
