
import React from "react";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Pod } from "@/utils/podUtils";

interface PodConnectDialogProps {
  pod: Pod;
}

export const PodConnectDialog: React.FC<PodConnectDialogProps> = ({ pod }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex gap-2 items-center">
          <ExternalLink className="h-4 w-4" />
          Connect
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Conectar a {pod.name}</DialogTitle>
          <DialogDescription>
            Accede a tu pod mediante los siguientes puertos:
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {pod.ports.map((port) => (
            <div key={port.number} className="flex justify-between items-center">
              <div className="flex flex-col">
                <span className="font-medium">{port.service}</span>
                <span className="text-sm text-muted-foreground">Puerto {port.number}</span>
              </div>
              <Button variant="outline" disabled={pod.status !== "running"}>
                <ExternalLink className="mr-2 h-4 w-4" />
                Abrir
              </Button>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
