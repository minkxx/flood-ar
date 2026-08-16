interface PendingSensorCardProps {
   nodeId: string;
}

export function PendingSensorCard({ nodeId }: PendingSensorCardProps) {
   return (
      <div className="card card-unknown">
         <h2>{nodeId}</h2>
         <div className="value value-pending">--</div>
         <div className="status status-unknown">Waiting for data</div>
      </div>
   );
}
