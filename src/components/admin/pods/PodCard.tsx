
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Server } from "lucide-react";
import { Pod } from "@/utils/podUtils";
import { PodStats } from "./PodStats";
import { PodActions } from "./PodActions";

interface PodCardProps {
  pod: Pod;
  onTogglePod: (podId: string) => void;
  onDeletePod: (podId: string) => void;
  viewLogs: (podName: string) => void;
  logs: string;
}

export const PodCard: React.FC<PodCardProps> = ({
  pod,
  onTogglePod,
  onDeletePod,
  viewLogs,
  logs
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
          <div className="text-sm text-muted-foreground">
            Usuario: {pod.user}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-4">
            <PodStats pod={pod} />
          </div>
          <div className="lg:col-span-2">
            <PodActions 
              pod={pod}
              onTogglePod={onTogglePod}
              onDeletePod={onDeletePod}
              viewLogs={viewLogs}
              logs={logs}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
