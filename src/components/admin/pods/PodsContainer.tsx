
import React from "react";
import { Pod } from "@/utils/podUtils";
import { PodCard } from "./PodCard";
import { EmptyPodsList } from "./EmptyPodsList";

interface PodsContainerProps {
  pods: Pod[];
  logs: string;
  onTogglePod: (podId: string) => void;
  onDeletePod: (podId: string) => void;
  viewLogs: (podName: string) => void;
}

export const PodsContainer: React.FC<PodsContainerProps> = ({
  pods,
  logs,
  onTogglePod,
  onDeletePod,
  viewLogs,
}) => {
  return (
    <div className="grid gap-6">
      {pods.length > 0 ? (
        pods.map((pod) => (
          <PodCard
            key={pod.id}
            pod={pod}
            logs={logs}
            onTogglePod={onTogglePod}
            onDeletePod={onDeletePod}
            viewLogs={viewLogs}
          />
        ))
      ) : (
        <EmptyPodsList />
      )}
    </div>
  );
};
