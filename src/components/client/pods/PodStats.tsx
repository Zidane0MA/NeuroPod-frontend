
import React from "react";
import { Progress } from "@/components/ui/progress";
import { Pod } from "@/utils/podUtils";

interface PodStatsProps {
  pod: Pod;
}

export const PodStats: React.FC<PodStatsProps> = ({ pod }) => {
  return (
    <div className="space-y-4">
      <div>
        <div className="flex justify-between text-sm mb-1">
          <span>Tiempo Activo</span>
          <span>{pod.uptime}</span>
        </div>
      </div>
      <div>
        <div className="flex justify-between text-sm mb-1">
          <span>CPU</span>
          <span>{pod.status === "running" ? `${pod.cpu}%` : "No disponible"}</span>
        </div>
        {pod.status === "running" && (
          <Progress value={pod.cpu} className="h-2" />
        )}
      </div>
      <div>
        <div className="flex justify-between text-sm mb-1">
          <span>Memoria</span>
          <span>{pod.status === "running" ? pod.memory : "No disponible"}</span>
        </div>
        {pod.status === "running" && (
          <Progress value={parseInt(pod.memory.split('/')[0].replace('GB', '')) / parseInt(pod.memory.split('/')[1].replace('GB', '')) * 100} className="h-2" />
        )}
      </div>
      <div>
        <div className="flex justify-between text-sm mb-1">
          <span>GPU</span>
          <span>{pod.status === "running" ? `${pod.gpu}%` : "No disponible"}</span>
        </div>
        {pod.status === "running" && (
          <Progress value={pod.gpu} className="h-2" />
        )}
      </div>
    </div>
  );
};
