
import React from "react";
import { Button } from "@/components/ui/button";
import { Terminal } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Pod } from "@/utils/podUtils";

interface PodLogsDialogProps {
  pod: Pod;
  viewLogs: (podName: string) => void;
  logs: string;
}

export const PodLogsDialog: React.FC<PodLogsDialogProps> = ({ pod, viewLogs, logs }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex gap-2 items-center" onClick={() => viewLogs(pod.name)}>
          <Terminal className="h-4 w-4" />
          Logs
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Logs de {pod.name}</DialogTitle>
          <DialogDescription>
            Registro de actividad del pod
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          <div className="bg-black rounded-md p-4 h-[300px] text-white font-mono text-sm overflow-auto whitespace-pre-line">
            {logs || "No hay logs disponibles."}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
