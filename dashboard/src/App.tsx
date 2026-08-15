import { SensorCard } from './components/SensorCard';
import { useSensorFeed } from './hooks/useSensorFeed';

const WS_URL =
   (import.meta.env.VITE_WS_URL as string | undefined) ??
   `ws://${window.location.hostname}:3000`;

export default function App() {
   const readings = useSensorFeed(WS_URL);
   const nodes = Object.values(readings).sort((a, b) =>
      a.nodeId.localeCompare(b.nodeId),
   );

   return (
      <main className="page">
         <h1>Flood sensor dashboard</h1>
         <p className="sub">Live readings delivered over MQTT and WebSocket.</p>
         <div className="grid">
            {nodes.map((reading) => (
               <SensorCard key={reading.nodeId} reading={reading} />
            ))}
         </div>
      </main>
   );
}
