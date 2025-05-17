import api from './api';
import { Pod, PodPort } from '@/utils/podUtils';

export interface PodCreateParams {
  name: string;
  deploymentType: string;  // 'template' o 'docker'
  template?: string;       // 'ubuntu' o 'comfyui' si deploymentType es 'template'
  dockerImage?: string;    // Si deploymentType es 'docker'
  gpu: string;
  containerDiskSize: number;
  volumeDiskSize: number;
  ports: string;
  enableJupyter: boolean;
  assignToUser?: string;   // Solo para administradores
}

export interface PodCreateResponse {
  pod: Pod;
  url: string;
}

export interface PodLogsResponse {
  logs: string;
  data: string;
}

export interface PodDetailsResponse {
  pod: Pod;
  details: {
    url: string;
    subdomain: string;
    createdAt: string;
    lastActive: string;
    cost: number;
    totalCost: number;
  };
}

export const podService = {
  // Obtener todos los pods del usuario actual
  getPods: async (): Promise<Pod[]> => {
    try {
      // Intentar obtener los pods desde el backend
      const response = await api.get<{ data: Pod[], success: boolean }>('/api/pods');
      return response.data.data || [];
    } catch (error: any) {
      console.error('Error al obtener pods:', error);
      
      // Si estamos en desarrollo y el backend no está disponible, usar datos simulados
      if (import.meta.env.DEV && 
         (error.isConnectionError || !error.response || error.code === 'ECONNABORTED')) {
        console.warn('Usando datos de pods simulados (el backend no está disponible)');
        
        // Determinar si es un administrador
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const isAdmin = user.role === 'admin';
        
        // Retornar datos simulados según el rol
        const simulatedPods: Pod[] = [];
        
        if (isAdmin) {
          // Para administradores: pods propios y de usuarios
          simulatedPods.push(
            {
              id: "pod-1",
              name: "ComfyUI-Admin",
              status: "running",
              uptime: "2h 15m",
              cpu: 25,
              memory: "4.2GB / 8GB",
              gpu: 65,
              ports: [
                { number: 8888, service: "Jupyter Notebook" },
                { number: 7860, service: "ComfyUI" }
              ],
              user: user.email
            },
            {
              id: "pod-2",
              name: "Ubuntu-Dev",
              status: "stopped",
              uptime: "-",
              cpu: 0,
              memory: "0GB / 4GB",
              gpu: 0,
              ports: [
                { number: 8888, service: "Jupyter Notebook" },
                { number: 22, service: "SSH" }
              ],
              user: user.email
            },
            {
              id: "pod-3",
              name: "DataScience-1",
              status: "running",
              uptime: "5h 43m",
              cpu: 45,
              memory: "12GB / 16GB",
              gpu: 78,
              ports: [
                { number: 8888, service: "Jupyter Notebook" },
                { number: 6006, service: "TensorBoard" }
              ],
              user: "usuario1@example.com"
            }
          );
        } else {
          // Para clientes: solo sus propios pods
          simulatedPods.push(
            {
              id: "pod-1",
              name: "ComfyUI-1",
              status: "running",
              uptime: "2h 15m",
              cpu: 25,
              memory: "4.2GB / 8GB",
              gpu: 65,
              ports: [
                { number: 8888, service: "Jupyter Notebook" },
                { number: 7860, service: "ComfyUI" }
              ]
            },
            {
              id: "pod-2",
              name: "Ubuntu-Dev",
              status: "stopped",
              uptime: "-",
              cpu: 0,
              memory: "0GB / 4GB",
              gpu: 0,
              ports: [
                { number: 8888, service: "Jupyter Notebook" },
                { number: 22, service: "SSH" }
              ]
            }
          );
        }
        
        return simulatedPods;
      }
      
      // Si no es un error de conexión o no estamos en desarrollo, propagar el error
      throw error;
    }
  },
  
  // Obtener detalles de un pod específico
  getPodDetails: async (podId: string): Promise<PodDetailsResponse> => {
    try {
      const response = await api.get<{ pod: Pod, details: any, success: boolean }>(`/api/pods/${podId}`);
      return {
        pod: response.data.pod,
        details: response.data.details
      };
    } catch (error: any) {
      console.error('Error al obtener detalles del pod:', error);
      
      // Simulación en desarrollo
      if (import.meta.env.DEV && 
         (error.isConnectionError || !error.response || error.code === 'ECONNABORTED')) {
        console.warn('Usando datos simulados de detalles de pod');
        
        return {
          pod: {
            id: podId,
            name: "Pod-Simulado",
            status: "running",
            uptime: "3h 45m",
            cpu: 30,
            memory: "2.5GB / 8GB",
            gpu: 50,
            ports: [
              { number: 8888, service: "Jupyter Notebook" },
              { number: 7860, service: "ComfyUI" }
            ]
          },
          details: {
            url: `https://pod-${podId}.neuropod.online`,
            subdomain: `pod-${podId}.neuropod.online`,
            createdAt: new Date().toISOString(),
            lastActive: new Date().toISOString(),
            cost: 0.5,
            totalCost: 1.75
          }
        };
      }
      
      throw error;
    }
  },
  
  // Crear un nuevo pod
  createPod: async (params: PodCreateParams): Promise<PodCreateResponse> => {
    try {
      // Formatear la solicitud según lo que espera el backend
      const requestData = {
        name: params.name,
        deploymentType: params.deploymentType,
        template: params.template,
        dockerImage: params.dockerImage,
        gpu: params.gpu,
        containerDiskSize: params.containerDiskSize,
        volumeDiskSize: params.volumeDiskSize,
        ports: params.ports,
        enableJupyter: params.enableJupyter,
        assignToUser: params.assignToUser
      };
      
      console.log('Enviando solicitud de creación de pod:', requestData);
      
      const response = await api.post<{ success: boolean, pod: Pod, url: string }>('/api/pods', requestData);
      
      console.log('Respuesta de creación de pod:', response.data);
      
      return {
        pod: response.data.pod,
        url: response.data.url
      };
    } catch (error: any) {
      console.error('Error al crear pod:', error);
      
      // Simulación en desarrollo
      if (import.meta.env.DEV && 
         (error.isConnectionError || !error.response || error.code === 'ECONNABORTED')) {
        console.warn('Simulando creación de pod');
        
        // Convertir los puertos de string a PodPort[]
        const portsList = params.ports.split(",").map(port => port.trim()).filter(port => port !== "");
        const portsArray: PodPort[] = [];
        
        portsList.forEach(portStr => {
          const portNum = parseInt(portStr);
          if (!isNaN(portNum)) {
            let service = "Servicio";
            
            // Asignar nombres según puertos conocidos
            switch (portNum) {
              case 8888:
                service = "Jupyter Notebook";
                break;
              case 7860:
                service = "ComfyUI";
                break;
              case 6006:
                service = "TensorBoard";
                break;
              case 22:
                service = "SSH";
                break;
              default:
                service = `Puerto ${portNum}`;
            }
            
            // Si el template es específico, personalizar el servicio
            if (params.template === "comfyui" && portNum === 7860) {
              service = "ComfyUI";
            }
            
            portsArray.push({ number: portNum, service });
          }
        });
        
        // Si se seleccionó la opción de Jupyter y no está ya en los puertos
        if (params.enableJupyter && !portsArray.some(port => port.number === 8888)) {
          portsArray.push({ number: 8888, service: "Jupyter Notebook" });
        }
        
        // Generar un ID único para el pod simulado
        const podId = `pod-${Date.now()}`;
        
        // Determinar el nombre para el subdominio
        const templatePrefix = params.deploymentType === 'docker' ? 'docker' : params.template;
        
        // Simular la respuesta de creación exitosa
        return {
          pod: {
            id: podId,
            name: params.name,
            status: "running",
            uptime: "0h 1m",
            cpu: Math.floor(Math.random() * 30) + 10,
            gpu: Math.floor(Math.random() * 50) + 30,
            memory: `${(params.containerDiskSize * 0.3).toFixed(1)}GB / ${params.containerDiskSize}GB`,
            ports: portsArray,
            ...(params.assignToUser ? { user: params.assignToUser } : {})
          },
          url: `https://${templatePrefix}-${podId.substring(4, 10)}.neuropod.online`
        };
      }
      
      throw error;
    }
  },
  
  // Iniciar un pod
  startPod: async (podId: string): Promise<Pod> => {
    try {
      const response = await api.post<{ success: boolean, pod: Pod }>(`/api/pods/${podId}/start`);
      return response.data.pod;
    } catch (error: any) {
      console.error('Error al iniciar pod:', error);
      
      // Simulación en desarrollo
      if (import.meta.env.DEV && 
         (error.isConnectionError || !error.response || error.code === 'ECONNABORTED')) {
        console.warn('Simulando inicio de pod');
        
        // Para simular, necesitaríamos el estado actual del pod
        // Asumimos un pod genérico iniciado
        return {
          id: podId,
          name: "Pod-Simulado",
          status: "running",
          uptime: "0h 1m",
          cpu: Math.floor(Math.random() * 30) + 10,
          gpu: Math.floor(Math.random() * 50) + 30,
          memory: "2.5GB / 8GB",
          ports: [
            { number: 8888, service: "Jupyter Notebook" }
          ]
        };
      }
      
      throw error;
    }
  },
  
  // Detener un pod
  stopPod: async (podId: string): Promise<Pod> => {
    try {
      const response = await api.post<{ success: boolean, pod: Pod }>(`/api/pods/${podId}/stop`);
      return response.data.pod;
    } catch (error: any) {
      console.error('Error al detener pod:', error);
      
      // Simulación en desarrollo
      if (import.meta.env.DEV && 
         (error.isConnectionError || !error.response || error.code === 'ECONNABORTED')) {
        console.warn('Simulando detención de pod');
        
        // Para simulación, asumimos un pod genérico detenido
        return {
          id: podId,
          name: "Pod-Simulado",
          status: "stopped",
          uptime: "-",
          cpu: 0,
          gpu: 0,
          memory: "0GB / 8GB",
          ports: [
            { number: 8888, service: "Jupyter Notebook" }
          ]
        };
      }
      
      throw error;
    }
  },
  
  // Eliminar un pod
  deletePod: async (podId: string): Promise<void> => {
    try {
      await api.delete(`/api/pods/${podId}`);
    } catch (error: any) {
      console.error('Error al eliminar pod:', error);
      
      // Simulación en desarrollo
      if (import.meta.env.DEV && 
         (error.isConnectionError || !error.response || error.code === 'ECONNABORTED')) {
        console.warn('Simulando eliminación de pod');
        // No necesitamos retornar datos para una eliminación
        return;
      }
      
      throw error;
    }
  },
  
  // Obtener logs de un pod
  getPodLogs: async (podId: string): Promise<string> => {
    try {
      const response = await api.get<{ success: boolean, data: string }>(`/api/pods/${podId}/logs`);
      return response.data.data;
    } catch (error: any) {
      console.error('Error al obtener logs del pod:', error);
      
      // Simulación en desarrollo
      if (import.meta.env.DEV && 
         (error.isConnectionError || !error.response || error.code === 'ECONNABORTED')) {
        console.warn('Simulando logs de pod');
        
        // Generar logs simulados según la hora actual
        const now = new Date();
        const timeStr = now.toLocaleTimeString();
        
        return `[${timeStr}] Pod iniciado correctamente
[${timeStr}] Iniciando servicios...
[${timeStr}] Servicio principal inicializado
[${timeStr}] Montando volumen de usuario en /workspace
[${timeStr}] Configurando red
[${timeStr}] Inicializando entorno de usuario
[${timeStr}] ¡Pod listo para ser utilizado!
[${timeStr}] Esperando conexiones...`;
      }
      
      throw error;
    }
  }
};
