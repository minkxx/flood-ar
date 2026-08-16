import { LOCALITIES } from 'shared';
import { LocalityMap } from './components/LocalityMap';
import { PendingSensorCard } from './components/PendingSensorCard';
import { SensorCard } from './components/SensorCard';
import { useFloodFeed } from './hooks/useFloodFeed';

const WS_URL =
   (import.meta.env.VITE_WS_URL as string | undefined) ??
   `ws://${window.location.hostname}:3000`;

const MAP_CENTER: [number, number] = [26.1445, 91.7772];

export default function App() {
   const { localities } = useFloodFeed(WS_URL);
   const sortedLocalities = [...localities].sort((a, b) =>
      a.name.localeCompare(b.name),
   );

   return (
      <main className="page">
         <h1>Flood sensor dashboard</h1>
         <p className="sub">Live readings delivered over MQTT and WebSocket.</p>

         <LocalityMap localities={localities} center={MAP_CENTER} />

         <div className="locality-rows">
            {sortedLocalities.map((locality) => {
               const config = LOCALITIES.find(
                  (entry) => entry.id === locality.localityId,
               );
               const sensorIds =
                  config?.sensorIds ?? locality.readings.map((r) => r.nodeId);
               const readingByNode = new Map(
                  locality.readings.map((r) => [r.nodeId, r]),
               );

               return (
                  <section key={locality.localityId} className="locality-row">
                     <h2 className="section-title">
                        {locality.name}
                        <span
                           className={`locality-badge locality-badge-${locality.alertLevel}`}
                        >
                           {locality.reportingSensorCount}/
                           {locality.sensorCount} reporting
                        </span>
                     </h2>
                     <div className="grid">
                        {sensorIds.map((nodeId) => {
                           const reading = readingByNode.get(nodeId);
                           return reading ? (
                              <SensorCard key={nodeId} reading={reading} />
                           ) : (
                              <PendingSensorCard key={nodeId} nodeId={nodeId} />
                           );
                        })}
                     </div>
                  </section>
               );
            })}
         </div>
      </main>
   );
}
