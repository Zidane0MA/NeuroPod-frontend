
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Server } from "lucide-react";
import { Pod } from "@/utils/podUtils";
import { PodStats } from "./PodStats";
import { PodActions } from "./PodActions";

interface PodCardProps {
  pod: Pod;
  logs: string;
  onTogglePod: (podId: string) => void;
  onDeletePod: (podId: string) => void;
  viewLogs: (podName: string) => void;
}

export const PodCard: React.FC<PodCardProps> = ({ 
  pod, 
  logs,
  onTogglePod, 
  onDeletePod, 
  viewLogs 
}) => {
  return (
    <Card key={pod.id}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl flex items-center gap-2">
            <Server className="h-5 w-5 text-primary" />
            {pod.name}
            <Badge variant={pod.status === "running" ? "default" : "secondary"} className="ml-2">
              {pod.status === "running" ? "Ejecutando" : "Detenido"}
            </Badge>
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <PodStats pod={pod} />
          <PodActions 
            pod={pod}
            logs={logs}
            onTogglePod={onTogglePod}
            onDeletePod={onDeletePod}
            viewLogs={viewLogs}
          />
        </div>
      </CardContent>
    </Card>
  );
};
