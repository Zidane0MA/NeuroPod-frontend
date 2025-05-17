import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { Pod } from "@/utils/podUtils";
import { podService } from "@/services/pod.service";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";

interface PodConnectDialogProps {
  pod: Pod;
}

export const PodConnectDialog: React.FC<PodConnectDialogProps> = ({ pod }) => {
  const [podDetails, setPodDetails] = useState<{url: string, subdomain: string} | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPodDetails = async () => {
    if (!pod || !pod.id) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const details = await podService.getPodDetails(pod.id);
      setPodDetails({
        url: details.details.url,
        subdomain: details.details.subdomain
      });
    } catch (err) {
      console.error('Error al obtener detalles del pod:', err);
      setError('No se pudieron cargar los detalles del pod.');
    } finally {
      setLoading(false);
    }
  };

  // Cuando se abre el diálogo, cargar los detalles
  const handleOpenDialog = () => {
    fetchPodDetails();
  };

  const openService = (port: number) => {
    if (!podDetails?.url) return;
    
    // Crear URL específica para el servicio
    const baseUrl = podDetails.url.replace(/https?:\/\//, '');
    const serviceUrl = `https://${baseUrl}${port !== 80 ? `:${port}` : ''}`;
    
    // Abrir en nueva pestaña
    window.open(serviceUrl, '_blank');
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="flex gap-2 items-center"
          onClick={handleOpenDialog}
        >
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
          {loading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="text-red-500 text-center py-2">
              {error}
            </div>
          ) : (
            <>
              {podDetails && (
                <div className="mb-4 text-sm">
                  <div className="font-medium">URL del Pod:</div>
                  <div className="text-muted-foreground break-all mt-1">
                    <a 
                      href={podDetails.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      {podDetails.url}
                    </a>
                  </div>
                </div>
              )}
              
              {pod.ports.map((port) => (
                <div key={port.number} className="flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="font-medium">{port.service}</span>
                    <span className="text-sm text-muted-foreground">Puerto {port.number}</span>
                  </div>
                  <Button 
                    variant="outline" 
                    disabled={pod.status !== "running"}
                    onClick={() => openService(port.number)}
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Abrir
                  </Button>
                </div>
              ))}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
