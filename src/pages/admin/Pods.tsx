
import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Pod, initialAdminPods, togglePodStatus, deletePod } from "@/utils/podUtils";
import { PodsHeader } from "@/components/admin/pods/PodsHeader";
import { PodsContainer } from "@/components/admin/pods/PodsContainer";

const AdminPods = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState<string>("");
  const [pods, setPods] = useState<Pod[]>([]);
  
  // Cargar pods iniciales o desde localStorage al iniciar
  useEffect(() => {
    const savedPods = localStorage.getItem('adminPods');
    if (savedPods) {
      setPods(JSON.parse(savedPods));
    } else {
      setPods(initialAdminPods);
    }
  }, []);
  
  // Guardar pods en localStorage cuando cambien
  useEffect(() => {
    if (pods.length > 0) {
      localStorage.setItem('adminPods', JSON.stringify(pods));
    }
  }, [pods]);
  
  const viewLogs = (podName: string) => {
    // Simulate fetching logs
    setLogs(`[System] Iniciando ${podName}...\n[Info] Cargando configuración\n[Info] Conectando GPU\n[Info] Iniciando servicios\n[System] ${podName} iniciado correctamente.`);
  };

  // Manejar inicio/parada de pods
  const handleTogglePod = (podId: string) => {
    setPods(prevPods => 
      prevPods.map(pod => 
        pod.id === podId ? togglePodStatus(pod) : pod
      )
    );
  };
  
  // Manejar eliminación de pods
  const handleDeletePod = (podId: string) => {
    setPods(prevPods => deletePod(podId, prevPods));
    toast.success("Pod eliminado correctamente");
  };

  return (
    <DashboardLayout title="Administración de Pods">
      <PodsHeader user={user} />
      <PodsContainer 
        pods={pods}
        logs={logs}
        onTogglePod={handleTogglePod}
        onDeletePod={handleDeletePod}
        viewLogs={viewLogs}
      />
    </DashboardLayout>
  );
};

export default AdminPods;
