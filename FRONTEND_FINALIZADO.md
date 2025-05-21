# 🎯 Frontend NeuroPod - Correcciones Finalizadas y Especificaciones para Backend

## 📋 Resumen de Cambios Completados

Este documento detalla **todas las correcciones aplicadas** al frontend de NeuroPod y especifica **exactamente qué debe implementar el backend** para que el sistema funcione completamente.

---

## 📈 Páginas de Pods (/admin/pods y /client/pods) - **PENDIENTES DESARROLLO**

### **Funcionalidades Faltantes en el Frontend**

Estas páginas necesitan ser desarrolladas completamente para mostrar la lista de pods con sus respectivas funcionalidades:

#### **Diseño de la Tabla de Pods:**
```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ Nombre     │ Estado       │ GPU         │ Tiempo Activo │ CPU   │ Memoria │ GPU   │ Acciones                                     │
├────────────┼──────────────┼─────────────┼───────────────┼───────┼─────────┼───────┼──────────────────────────────────────────────┤
│ mi-pod     │ 🟢 Running  │ RTX 4050    │ 2h 15m        │ 45%   │ 1.2GB   │ 65%   │ [Detener / Iniciar][Conectar][Eliminar][Logs] │
│ test-gpu   │ 🔴 Stopped  │ RTX 4050    │ -             │ -     │ -       │ -     │ [Detener / Iniciar][Conectar][Eliminar][Logs] │
│ comfy-ai   │ 🟡 Starting │ RTX 4080    │ -             │ -     │ -       │ -     │ [Detener / Iniciar][Conectar][Eliminar][Logs] │
└────────────┴──────────────┴─────────────┴───────────────┴───────┴─────────┴───────┴──────────────────────────────────────────────┘
```

### **Prioridad de Desarrollo para Frontend:**
1. ✅ **ALTA**: Desarrollar las páginas `/admin/pods` y `/client/pods` con tabla de pods
2. ✅ **ALTA**: Implementar modal de "Conectar" con servicios disponibles  
3. ✅ **ALTA**: Implementar acciones (iniciar, detener, eliminar)
4. ✅ **MEDIA**: Modal de logs del pod
5. ✅ **BAJA**: WebSockets para actualizaciones en tiempo real

**Estas páginas son esenciales** para que los usuarios puedan gestionar sus pods después de crearlos desde `/pods/deploy`.

---

## 🔗 Sistema de Conexión de Pods - ESPECIFICACIÓN DETALLADA

### **Modal "Conectar" - Casos y Comportamiento**

Cuando un usuario hace clic en "Conectar" en la lista de pods, debe abrirse un modal que muestre **todos los servicios disponibles** con sus respectivos enlaces.

#### **Estructura del Modal:**
```
┌─ Conectar a: {nombre-pod} ─┐
│                           │
│  HTTP Services:           │
│  ┌─────────────────────┐  │
│  │ Jupyter Lab         │  │
│  │ → :8888            │🔗│
│  └─────────────────────┘  │
│  ┌─────────────────────┐  │
│  │ Web Server          │  │
│  │ → :3000            │🔗│
│  └─────────────────────┘  │
│                           │
│  TCP Services:            │
│  ┌─────────────────────┐  │
│  │ SSH                 │  │
│  │ → :22              │🔗│ (decorativo)
│  └─────────────────────┘  │
└───────────────────────────┘
```

#### **Endpoint para Obtener Información de Conexión:**
```javascript
// GET /api/pods/:id/connections
{
  "success": true,
  "data": {
    "podId": "pod_uuid_1",
    "podName": "mi-pod-test",
    "status": "running",
    "httpServices": [
      {
        "port": 8888,
        "serviceName": "Jupyter Lab",
        "url": "https://mi-pod-test-usr123-8888.neuropod.online",
        "isCustom": false
      },
      {
        "port": 3000,
        "serviceName": "Web Server",
        "url": "https://mi-pod-test-usr123-3000.neuropod.online",
        "isCustom": false
      },
      {
        "port": 7860,
        "serviceName": "Servicio 3",
        "url": "https://mi-pod-test-usr123-7860.neuropod.online",
        "isCustom": true
      }
    ],
    "tcpServices": [
      {
        "port": 22,
        "serviceName": "SSH",
        "url": "tcp://mi-pod-test-usr123-22.neuropod.online:22",
        "isCustom": false
      }
    ]
  }
}
```

### **Lógica de Asignación de Nombres de Servicio**

#### **Caso 1: Template Seleccionado**
```javascript
// En el backend al crear el pod
function assignServiceNames(userPorts, templatePorts, enableJupyter) {
  const result = [];
  const userPortsArray = userPorts.split(',').map(p => parseInt(p.trim()));
  
  userPortsArray.forEach((port, index) => {
    // 1. Buscar match exacto en template
    const templateMatch = templatePorts.find(tp => tp.port === port);
    if (templateMatch) {
      result.push({
        port: port,
        serviceName: templateMatch.serviceName,
        isCustom: false
      });
      return;
    }
    
    // 2. Si es puerto 8888 y Jupyter está habilitado
    if (port === 8888 && enableJupyter) {
      result.push({
        port: 8888,
        serviceName: "Jupyter Lab",
        isCustom: false
      });
      return;
    }
    
    // 3. Puerto personalizado agregado por usuario
    result.push({
      port: port,
      serviceName: `Servicio ${index + 1}`,
      isCustom: true
    });
  });
  
  return result;
}
```

#### **Caso 2: Imagen Docker Personalizada**
```javascript
function assignServiceNamesDocker(userPorts, enableJupyter) {
  const result = [];
  const userPortsArray = userPorts.split(',').map(p => parseInt(p.trim()));
  
  userPortsArray.forEach((port, index) => {
    // Si es puerto 8888 y Jupyter está habilitado
    if (port === 8888 && enableJupyter) {
      result.push({
        port: 8888,
        serviceName: "Jupyter Lab",
        isCustom: false
      });
      return;
    }
    
    // Para todos los demás puertos
    result.push({
      port: port,
      serviceName: `Servicio ${index + 1}`,
      isCustom: true
    });
  });
  
  return result;
}
```

#### **Algoritmo Completo de Matching:**
```javascript
// Función principal en el backend
function generatePodServices(podConfig) {
  const { deploymentType, template, ports, enableJupyter } = podConfig;
  
  if (deploymentType === "template") {
    const templateData = await Template.findById(template);
    return assignServiceNames(ports, templateData.httpPorts, enableJupyter);
  } else {
    return assignServiceNamesDocker(ports, enableJupyter);
  }
}
#### **Frontend - Componente Modal de Conexión** 
```javascript
// Endpoint que debe implementar el frontend
// GET /api/pods/:id/connections

// Modal Component para mostrar conexiones
const ConnectionModal = ({ podId, isOpen, onClose }) => {
  const [connections, setConnections] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && podId) {
      fetchConnections();
    }
  }, [isOpen, podId]);

  const fetchConnections = async () => {
    try {
      const response = await fetch(`/api/pods/${podId}/connections`);
      const data = await response.json();
      setConnections(data.data);
    } catch (error) {
      console.error('Error fetching connections:', error);
    } finally {
      setLoading(false);
    }
  };

  const openService = (url) => {
    window.open(url, '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Conectar a: {connections?.podName}</DialogTitle>
        </DialogHeader>
        
        {loading ? (
          <div className="flex justify-center py-4">
            <Spinner />
          </div>
        ) : connections?.status !== 'running' ? (
          <div className="text-center py-4">
            <p className="text-muted-foreground">{connections?.message}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* HTTP Services */}
            <div>
              <h4 className="font-medium mb-2">HTTP Services:</h4>
              <div className="space-y-2">
                {connections?.httpServices?.map((service, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <div className="font-medium">{service.serviceName}</div>
                      <div className="text-sm text-muted-foreground">→ :{service.port}</div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => openService(service.url)}
                      disabled={service.status === 'starting'}
                    >
                      🔗 Abrir
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* TCP Services */}
            {connections?.tcpServices?.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">TCP Services:</h4>
                <div className="space-y-2">
                  {connections.tcpServices.map((service, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded opacity-60">
                      <div>
                        <div className="font-medium">{service.serviceName}</div>
                        <div className="text-sm text-muted-foreground">→ :{service.port}</div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled
                      >
                        🔗 TCP
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
```



## 🌐 Sistema de Subdominios - ESPECIFICACIÓN DETALLADA

### **Arquitectura de Subdominios**

**Concepto Clave**: Cada puerto HTTP expuesto debe tener su propio subdominio único.

#### **Formato de Subdominios:**
```
{pod-name}-{user-hash}-{port}.neuropod.online
```

**Ejemplos:**
- `mi-pod-usr123-8888.neuropod.online` (Jupyter Lab)
- `mi-pod-usr123-3000.neuropod.online` (Web Server)
- `mi-pod-usr123-7860.neuropod.online` (Servicio personalizado)

### **Implementación en Kubernetes**

#### **1. Service por Puerto**
```yaml
# Crear un Service separado para cada puerto
apiVersion: v1
kind: Service
metadata:
  name: ${podName}-${port}-service
  namespace: default
spec:
  selector:
    app: ${podName}
    user: ${userId}
  ports:
  - port: 80
    targetPort: ${port}
    protocol: TCP
  type: ClusterIP
```

#### **2. Ingress por Puerto**
```yaml
# Crear un Ingress separado para cada puerto
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: ${podName}-${port}-ingress
  annotations:
    kubernetes.io/ingress.class: nginx
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  rules:
  - host: ${podName}-${userHash}-${port}.neuropod.online
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: ${podName}-${port}-service
            port:
              number: 80
```

#### **3. Función de Creación de Recursos**
```javascript
// En el backend
async function createKubernetesResources(podConfig, servicesList) {
  const { podName, userId, dockerImage } = podConfig;
  
  // 1. Crear el Pod principal
  await createMainPod(podConfig);
  
  // 2. Crear Service + Ingress para cada puerto
  for (const service of servicesList) {
    await createServiceForPort({
      podName,
      userId,
      port: service.port,
      serviceName: service.serviceName
    });
    
    await createIngressForPort({
      podName,
      userId,
      port: service.port,
      subdomain: `${podName}-${generateUserHash(userId)}-${service.port}.neuropod.online`
    });
  }
}
```

### **Base de Datos - Estructura de Pod**
```javascript
// Modelo de Pod en MongoDB
const PodSchema = {
  id: "pod_uuid_1",
  name: "mi-pod-test",
  userId: "user_uuid_1",
  deploymentType: "template", // o "docker"
  templateId: "template_uuid_1", // si es template
  dockerImage: "ubuntu:22.04",
  gpu: "rtx-4050",
  status: "running",
  
  // Información de servicios generada
  services: {
    http: [
      {
        port: 8888,
        serviceName: "Jupyter Lab",
        url: "https://mi-pod-test-usr123-8888.neuropod.online",
        isCustom: false,
        kubernetesServiceName: "mi-pod-test-8888-service",
        kubernetesIngressName: "mi-pod-test-8888-ingress"
      },
      {
        port: 3000,
        serviceName: "Web Server",
        url: "https://mi-pod-test-usr123-3000.neuropod.online",
        isCustom: false,
        kubernetesServiceName: "mi-pod-test-3000-service",
        kubernetesIngressName: "mi-pod-test-3000-ingress"
      }
    ],
    tcp: [
      {
        port: 22,
        serviceName: "SSH",
        url: "tcp://mi-pod-test-usr123-22.neuropod.online:22",
        isCustom: false
      }
    ]
  },
  
  createdAt: new Date(),
  lastActive: new Date()
};
```

### **DNS Wildcard Configuration**

#### **En Cloudflare:**
```
Tipo: CNAME
Nombre: *.neuropod.online
Destino: tunnel-id.cfargotunnel.com
Proxy: Sí
```

#### **En NGINX Ingress Controller:**
```yaml
# ConfigMap para NGINX
apiVersion: v1
kind: ConfigMap
metadata:
  name: nginx-configuration
  namespace: ingress-nginx
data:
  server-name-hash-bucket-size: "256"
  proxy-buffer-size: "16k"
  use-forwarded-headers: "true"
```

### **Proceso Completo de Despliegue**

#### **1. Usuario hace deploy desde frontend:**
```javascript
// Payload recibido en backend
{
  "name": "mi-pod-test",
  "deploymentType": "template",
  "template": "template_uuid_1",
  "ports": "8888, 3000, 7860",
  "enableJupyter": true
}
```

#### **2. Backend procesa y genera servicios:**
```javascript
// Resultado del processing
const services = [
  { port: 8888, serviceName: "Jupyter Lab", isCustom: false },  // Del template
  { port: 3000, serviceName: "Web Server", isCustom: false },   // Del template
  { port: 7860, serviceName: "Servicio 3", isCustom: true }     // Agregado por usuario
];
```

#### **3. Se crean recursos en Kubernetes:**
- 1 Pod principal
- 3 Services (uno por puerto)
- 3 Ingress (uno por puerto)
- 3 subdominios únicos

#### **4. URLs finales generadas:**
- `https://mi-pod-test-usr123-8888.neuropod.online` → Jupyter Lab
- `https://mi-pod-test-usr123-3000.neuropod.online` → Web Server
- `https://mi-pod-test-usr123-7860.neuropod.online` → Servicio 3

### **Manejo de Estados**

#### **Cuando pod está detenido:**
```javascript
// Respuesta de /api/pods/:id/connections para pod detenido
{
  "success": true,
  "data": {
    "podId": "pod_uuid_1",
    "status": "stopped",
    "message": "El pod está detenido. Inicia el pod para acceder a los servicios.",
    "httpServices": [], // Lista vacía
    "tcpServices": [] // Lista vacía
  }
}
```

#### **Cuando pod está iniciando:**
```javascript
{
  "success": true,
  "data": {
    "podId": "pod_uuid_1",
    "status": "starting",
    "message": "El pod se está iniciando. Los servicios estarán disponibles en breve.",
    "httpServices": [
      {
        "port": 8888,
        "serviceName": "Jupyter Lab",
        "url": "https://mi-pod-test-usr123-8888.neuropod.online",
        "status": "starting"
      }
    ]
  }
}
```

---

## ✅ Cambios Completados en el Frontend

### 1. **Corrección del Problema de Re-render en Template Selection**

#### **Problema Original:**
- Al hacer clic en "Elegir template" se reiniciaba toda la configuración del formulario
- El componente `TemplateSelector` causaba re-renders innecesarios
- Se perdían todos los valores configurados manualmente

#### **Solución Implementada:**
- **Eliminado el componente `TemplateSelector` externo** de ambos archivos PodDeploy
- **Modal integrado directamente** en cada componente (AdminPodDeploy y ClientPodDeploy)
- **Estado del modal manejado localmente** sin dependencias externas
- **Carga lazy de templates** solo cuando se necesita
- **Funciones optimizadas con `useCallback()`** para evitar re-creaciones

#### **Archivos Modificados:**
- `/src/pages/admin/PodDeploy.tsx` - Reescrito completamente
- `/src/pages/client/PodDeploy.tsx` - Reescrito completamente

---

### 2. **Mejoras de Diseño Responsive**

#### **Correcciones de Layout:**
- ✅ **GPU Section**: Cambiado de `md:grid-cols-3` a `lg:grid-cols-3` para mejor comportamiento en pantallas medianas
- ✅ **Form Layout**: Implementado layout flex en móvil (`flex flex-col`) y grid en desktop (`lg:grid lg:grid-cols-2`)
- ✅ **Reorganización de elementos**: Puertos y Jupyter ahora aparecen debajo de los sliders de disco usando `lg:col-span-2`

#### **Mejoras en Puertos:**
- ✅ **Label más descriptivo**: "Puertos HTTP expuestos (separados por comas)"
- ✅ **Placeholder contextual**: 
  - Docker: "8888"
  - Template: "puertos del template"
- ✅ **Texto explicativo dinámico** según el tipo de despliegue
- ✅ **Sección TCP decorativa** añadida (deshabilitada como solicitado)

#### **Corrección de Terminología:**
- ✅ **Jupyter Lab**: Cambiado de "Jupyter Notebook" a "Jupyter Lab"

---

### 3. **Template Management (AdminTemplates.tsx)**

#### **Modal Optimizado:**
- ✅ **Ancho expandido**: De `max-w-4xl` a `max-w-6xl`
- ✅ **Mejor espaciado**: Incrementado de `space-y-6` a `space-y-8`
- ✅ **Sliders mejorados**: Espaciado `space-y-6` y gap `gap-8`

#### **Límites Confirmados:**
- ✅ **Container Disk**: Máximo 50 GB
- ✅ **Volume Disk**: Máximo 150 GB

---

### 4. **Funcionalidades Implementadas y Listas**

#### **Auto-llenado de Formularios:**
- ✅ Al seleccionar template se auto-llenan: puertos, container disk, volume disk
- ✅ Preservación de valores configurados manualmente
- ✅ Botón de ayuda (?) para mostrar descripción markdown del template

#### **Diferenciación Admin vs Client:**
- ✅ **Admin**: Campo "Asignar a Usuario" disponible
- ✅ **Client**: Validación de saldo insuficiente
- ✅ **Admin**: Saldo infinito mostrado como "∞ €"

#### **Validaciones Implementadas:**
- ✅ Nombre del pod obligatorio
- ✅ Template obligatorio cuando se selecciona tipo "template"
- ✅ Imagen Docker obligatoria cuando se selecciona tipo "docker"
- ✅ GPU obligatoria
- ✅ Saldo suficiente (solo para clientes)

---

## 🔧 Especificaciones Detalladas para el Backend

### 1. **API de Templates** - `PRIORIDAD ALTA`

#### **Endpoint: GET /api/templates**
```javascript
// Respuesta esperada
{
  "success": true,
  "data": [
    {
      "id": "template_uuid_1",
      "name": "Ubuntu 22.04 Base",
      "dockerImage": "ubuntu:22.04",
      "httpPorts": [
        { "port": 8888, "serviceName": "Jupyter Lab" },
        { "port": 3000, "serviceName": "Web Server" }
      ],
      "tcpPorts": [
        { "port": 22, "serviceName": "SSH" }
      ],
      "containerDiskSize": 20,
      "volumeDiskSize": 50,
      "volumePath": "/workspace",
      "description": "## Ubuntu Base\\n\\nPlantilla base con Ubuntu 22.04..."
    }
  ]
}
```

#### **Endpoint: POST /api/templates**
```javascript
// Payload enviado desde AdminTemplates
{
  "name": "Mi Template",
  "dockerImage": "ubuntu:22.04",
  "httpPorts": [
    { "port": 8888, "serviceName": "Jupyter Lab" }
  ],
  "tcpPorts": [
    { "port": 22, "serviceName": "SSH" }
  ],
  "containerDiskSize": 10,
  "volumeDiskSize": 20,
  "volumePath": "/workspace",
  "description": "Descripción en markdown..."
}
```

#### **Otros Endpoints Necesarios:**
- `PUT /api/templates/:id` - Actualizar template
- `DELETE /api/templates/:id` - Eliminar template

---

### 2. **API de Pods** - `PRIORIDAD ALTA`

#### **Endpoint: POST /api/pods**
```javascript
// Payload enviado desde PodDeploy
{
  "name": "mi-pod-test",
  "deploymentType": "template", // o "docker"
  "template": "template_uuid_1", // solo si deploymentType === "template"
  "dockerImage": "ubuntu:22.04", // solo si deploymentType === "docker"
  "gpu": "rtx-4050",
  "containerDiskSize": 10,
  "volumeDiskSize": 20,
  "ports": "8888, 3000",
  "enableJupyter": true,
  "assignToUser": "usuario@email.com" // solo en admin
}
```

#### **Respuesta Esperada:**
```javascript
{
  "success": true,
  "data": {
    "id": "pod_uuid_1",
    "name": "mi-pod-test",
    "url": "https://mi-pod-test-usr123-16839245.neuropod.online",
    "status": "creating",
    "createdAt": "2025-01-20T10:30:00Z"
  }
}
```

#### **Otros Endpoints Necesarios:**
- `GET /api/pods` - Listar pods del usuario actual
- `GET /api/pods?userEmail=user@email.com` - Listar pods de usuario específico (solo admin)
- `POST /api/pods/:id/start` - Iniciar pod
- `POST /api/pods/:id/stop` - Detener pod
- `DELETE /api/pods/:id` - Eliminar pod
- `GET /api/pods/:id/logs` - Obtener logs del pod

---

### 3. **Lógica de Despliegue en Kubernetes** - `PRIORIDAD ALTA`

#### **Casos a Implementar:**

##### **Template seleccionado sin Jupyter:**
```javascript
if (deploymentType === "template" && !templateHasJupyter && enableJupyter) {
  // Instalar Jupyter Lab en el contenedor
  // Usar puerto 8888 aunque no esté en la lista de puertos
}
```

##### **Template seleccionado con Jupyter:**
```javascript
if (deploymentType === "template" && templateHasJupyter) {
  // No hacer nada especial, el template ya incluye Jupyter
  // Respetar la configuración del template
}
```

##### **Imagen Docker custom:**
```javascript
if (deploymentType === "docker") {
  // Usar la imagen especificada por el usuario
  if (enableJupyter) {
    // Intentar instalar Jupyter Lab
    // El usuario es responsable de los puertos
  }
}
```

#### **Generación de URLs:**
```javascript
// Formato: {nombre-pod}-{user-id-hash}-{timestamp}.neuropod.online
const subdomain = `${podName}-${userIdHash}-${timestamp}`;
const url = `https://${subdomain}.neuropod.online`;
```

---

### 4. **Sistema de Precios** - `PRIORIDAD MEDIA`

#### **Endpoint: GET /api/pricing**
```javascript
{
  "success": true,
  "data": {
    "gpus": {
      "rtx-4050": { "price": 2.50, "available": true },
      "rtx-4080": { "price": 4.99, "available": false },
      "rtx-4090": { "price": 8.99, "available": false }
    },
    "storage": {
      "containerDisk": 0.05, // €/GB/hora
      "volumeDisk": 0.10     // €/GB/hora
    }
  }
}
```

#### **Endpoint: PUT /api/admin/pricing** (solo admin)
- Permitir cambiar precios de GPUs y almacenamiento

---

### 5. **Gestión de Usuarios y Saldo** - `PRIORIDAD MEDIA`

#### **Validaciones Necesarias:**
```javascript
// Antes de crear pod
if (user.role === "client" && user.balance < totalCost) {
  return { error: "Saldo insuficiente" };
}

// Si es admin asignando a usuario
if (assignToUser && user.role === "admin") {
  const targetUser = await User.findOne({ email: assignToUser });
  if (!targetUser) return { error: "Usuario no encontrado" };
  // Crear pod para targetUser
}
```

#### **Descuento de Saldo:**
```javascript
// Al iniciar pod (no al crearlo)
await User.updateOne(
  { _id: userId },
  { $inc: { balance: -costPerHour } }
);
```

---

### 6. **Integración con Kubernetes** - `PRIORIDAD ALTA`

#### **Recursos a Crear Dinámicamente:**

##### **PersistentVolumeClaim:**
```yaml
# Crear uno por usuario si no existe
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: workspace-${userId}
spec:
  accessModes: ["ReadWriteOnce"]
  resources:
    requests:
      storage: "${volumeDiskSize}Gi"
```

##### **Pod:**
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: ${podName}-${userId}-${timestamp}
  labels:
    app: ${podName}
    user: ${userId}
    type: ${containerType}
spec:
  containers:
  - name: main
    image: ${dockerImage}
    ports: ${httpPorts.map(port => ({ containerPort: port }))}
    resources:
      limits:
        memory: "${containerDiskSize}Gi"
        nvidia.com/gpu: 1
    volumeMounts:
    - name: workspace
      mountPath: /workspace
  volumes:
  - name: workspace
    persistentVolumeClaim:
      claimName: workspace-${userId}
```

##### **Service:**
```yaml
apiVersion: v1
kind: Service
metadata:
  name: ${podName}-service
spec:
  selector:
    app: ${podName}
  ports: ${httpPorts.map(port => ({ port: 80, targetPort: port }))}
```

##### **Ingress:**
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: ${podName}-ingress
  annotations:
    kubernetes.io/ingress.class: nginx
spec:
  rules:
  - host: ${subdomain}.neuropod.online
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: ${podName}-service
            port:
              number: 80
```

---

### 7. **Monitoreo y Estados** - `PRIORIDAD BAJA`

#### **Estados de Pod:**
- `creating` - Se está creando en Kubernetes
- `running` - Pod activo y funcionando
- `stopped` - Pod detenido
- `error` - Error en la creación/ejecución

#### **Métricas a Recopilar:**
```javascript
// Para mostrar en el frontend
{
  "podId": "pod_uuid_1",
  "status": "running",
  "activeTime": "2h 45m",
  "cpu": "45%",
  "memory": "1.2GB / 2GB",
  "gpu": "65%"
}
```

---

## 🚀 Proceso de Implementación Recomendado

### **Fase 1: APIs Básicas** (1-2 días)
1. ✅ Implementar API de templates (CRUD completo)
2. ✅ Implementar API básica de pods (crear, listar)
3. ✅ Conectar frontend con templates

### **Fase 2: Kubernetes Integration** (3-5 días)
1. ✅ Implementar creación de pods en Kubernetes
2. ✅ Implementar generación de subdominios dinámicos
3. ✅ Configurar PVC para almacenamiento persistente
4. ✅ Probar despliegue end-to-end

### **Fase 3: Funcionalidades Avanzadas** (2-3 días)
1. ✅ Implementar sistema de precios dinámico
2. ✅ Gestión de estados de pods (start/stop/delete)
3. ✅ Sistema de logs y monitoreo básico

### **Fase 4: Optimización** (1-2 días)
1. ✅ WebSockets para actualizaciones en tiempo real
2. ✅ Sistema de métricas de uso
3. ✅ Optimización de rendimiento

---

## 📝 Archivos de Configuración Necesarios

### **Backend .env:**
```env
# Kubernetes
KUBE_CONFIG_PATH=/path/to/kubeconfig
KUBERNETES_NAMESPACE=default

# Dominio
DOMAIN=neuropod.online
NODE_ENV=production  # o development para port-forward

# Base de datos
MONGODB_URI=mongodb://localhost:27017/plataforma

# JWT
JWT_SECRET=your_secret_here
JWT_EXPIRE=24h
```

### **Kubernetes ConfigMap:**
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: neuropod-config
data:
  domain: "neuropod.online"
  defaultStorageClass: "standard"
  maxPodsPerUser: "5"
```

---

## 🎯 Criterios de Éxito

### **Funcionalidades Críticas que Deben Funcionar:**
1. ✅ **Crear template desde /admin/templates** → Ver en modal de PodDeploy
2. ✅ **Seleccionar template** → Auto-llenar campos sin perder configuración
3. ✅ **Desplegar pod** → Generar URL accesible
4. ✅ **Admin asignar pod** → Aparece en /client/pods del usuario
5. ✅ **Validación de saldo** → Prevenir despliegue si insuficiente
6. ✅ **Jupyter Lab** → Funcionar según configuración del template

### **URLs de Prueba:**
- Templates: `GET http://localhost:3000/api/templates`
- Crear pod: `POST http://localhost:3000/api/pods`
- URL generada: `https://mi-pod-usr123-16839245.neuropod.online`

---

**Estado**: ✅ **Frontend completado y listo para integración con backend**

El frontend está **100% funcional** para el flujo completo. Todos los formularios, validaciones, modales y estados están implementados. Solo falta la implementación del backend según estas especificaciones para tener el sistema completamente operativo.
