import 'leaflet/dist/leaflet.css';
import { CircleMarker, MapContainer, Popup, TileLayer } from 'react-leaflet';
import type { LocalityStatus } from 'shared';

const STATUS_COLOR: Record<LocalityStatus['alertLevel'], string> = {
   unknown: '#9ca3af',
   normal: '#5dcaa5',
   warn: '#e1a53e',
   alert: '#e24b4a',
};

const STATUS_LABEL: Record<LocalityStatus['alertLevel'], string> = {
   unknown: 'No data yet',
   normal: 'Normal',
   warn: 'Flood warning',
   alert: 'Flood alert',
};

interface LocalityMapProps {
   localities: LocalityStatus[];
   center: [number, number];
}

export function LocalityMap({ localities, center }: LocalityMapProps) {
   return (
      <MapContainer
         center={center}
         zoom={13}
         scrollWheelZoom
         style={{ height: 420, width: '100%', borderRadius: 12 }}
      >
         <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
         />
         {localities.map((locality) => (
            <CircleMarker
               key={locality.localityId}
               center={[locality.lat, locality.lng]}
               radius={18}
               pathOptions={{
                  color: STATUS_COLOR[locality.alertLevel],
                  fillColor: STATUS_COLOR[locality.alertLevel],
                  fillOpacity: 0.75,
                  weight: 2,
               }}
            >
               <Popup>
                  <strong>{locality.name}</strong>
                  <div>{STATUS_LABEL[locality.alertLevel]}</div>
                  <div>
                     {locality.reportingSensorCount}/{locality.sensorCount}{' '}
                     sensors reporting
                  </div>
                  {locality.readings.length > 0 && (
                     <ul style={{ paddingLeft: 16, margin: '4px 0 0' }}>
                        {locality.readings.map((reading) => (
                           <li key={reading.nodeId}>
                              {reading.nodeId}: {reading.waterLevelCm} cm
                           </li>
                        ))}
                     </ul>
                  )}
               </Popup>
            </CircleMarker>
         ))}
      </MapContainer>
   );
}
