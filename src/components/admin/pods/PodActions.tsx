
import React from "react";
import { Button } from "@/components/ui/button";
import { Play, StopCircle, Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { PodConnectDialog } from "./PodConnectDialog";
import { PodLogsDialog } from "./PodLogsDialog";
import { Pod } from "@/utils/podUtils";

interface PodActionsProps {
  pod: Pod;
  onTogglePod: (podId: string) => void;
  onDeletePod: (podId: string) => void;
  viewLogs: (podName: string) => void;
  logs: string;
}

export const PodActions: React.FC<PodActionsProps> = ({
  pod,
  onTogglePod,
  onDeletePod,
  viewLogs,
  logs
}) => {
  return (
    <div className="flex flex-wrap justify-end items-center gap-3">
      {pod.status === "running" ? (
        <Button 
          variant="outline" 
          className="flex gap-2 items-center"
          onClick={() => onTogglePod(pod.id)}
        >
          <StopCircle className="h-4 w-4" />
          Detener
        </Button>
      ) : (
        <Button 
          variant="outline" 
          className="flex gap-2 items-center"
          onClick={() => onTogglePod(pod.id)}
        >
          <Play className="h-4 w-4" />
          Iniciar
        </Button>
      )}
      
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="outline" className="flex gap-2 items-center text-red-500">
            <Trash2 className="h-4 w-4" />
            Eliminar
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará el pod "{pod.name}" y no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => onDeletePod(pod.id)}
              className="bg-red-500 hover:bg-red-600"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <PodConnectDialog pod={pod} />
      <PodLogsDialog pod={pod} viewLogs={viewLogs} logs={logs} />
    </div>
  );
};
