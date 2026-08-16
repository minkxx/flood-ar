import { useEffect, useRef, useState } from 'react';
import type { LocalityStatus, ProcessedReading } from 'shared';

type FeedMessage =
   | { type: 'snapshot'; readings: Record<string, ProcessedReading> }
   | { type: 'reading'; reading: ProcessedReading }
   | { type: 'locality-snapshot'; localities: LocalityStatus[] }
   | { type: 'locality-update'; locality: LocalityStatus };

interface FloodFeedState {
   readings: Record<string, ProcessedReading>;
   localities: Record<string, LocalityStatus>;
}

export function useFloodFeed(wsUrl: string) {
   const [state, setState] = useState<FloodFeedState>({
      readings: {},
      localities: {},
   });
   const socketRef = useRef<WebSocket | null>(null);

   useEffect(() => {
      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;

      socket.onmessage = (event) => {
         const message: FeedMessage = JSON.parse(event.data);

         setState((prev) => {
            switch (message.type) {
               case 'snapshot':
                  return { ...prev, readings: message.readings };
               case 'reading':
                  return {
                     ...prev,
                     readings: {
                        ...prev.readings,
                        [message.reading.nodeId]: message.reading,
                     },
                  };
               case 'locality-snapshot':
                  return {
                     ...prev,
                     localities: Object.fromEntries(
                        message.localities.map((locality) => [
                           locality.localityId,
                           locality,
                        ]),
                     ),
                  };
               case 'locality-update':
                  return {
                     ...prev,
                     localities: {
                        ...prev.localities,
                        [message.locality.localityId]: message.locality,
                     },
                  };
               default:
                  return prev;
            }
         });
      };

      return () => socket.close();
   }, [wsUrl]);

   return {
      readings: Object.values(state.readings),
      localities: Object.values(state.localities),
   };
}
