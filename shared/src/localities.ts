export interface LocalityConfig {
   id: string;
   name: string;
   lat: number;
   lng: number;
   sensorIds: string[];
}

export const LOCALITIES: LocalityConfig[] = [
   {
      id: 'zoo-road',
      name: 'Zoo Road',
      lat: 26.1583,
      lng: 91.7773,
      sensorIds: ['zoo-road-a', 'zoo-road-b', 'zoo-road-c', 'zoo-road-d'],
   },
   {
      id: 'rukminigaon',
      name: 'Rukminigaon',
      lat: 26.1215,
      lng: 91.7898,
      sensorIds: [
         'rukminigaon-a',
         'rukminigaon-b',
         'rukminigaon-c',
         'rukminigaon-d',
      ],
   },
   {
      id: 'anil-nagar',
      name: 'Anil Nagar',
      lat: 26.1352,
      lng: 91.7645,
      sensorIds: [
         'anil-nagar-a',
         'anil-nagar-b',
         'anil-nagar-c',
         'anil-nagar-d',
      ],
   },
];

export function findLocalityForSensor(
   nodeId: string,
): LocalityConfig | undefined {
   return LOCALITIES.find((locality) => locality.sensorIds.includes(nodeId));
}
