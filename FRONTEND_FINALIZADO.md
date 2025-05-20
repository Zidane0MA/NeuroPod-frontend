# 🎯 Frontend NeuroPod - Correcciones Finalizadas y Especificaciones para Backend

## 📋 Resumen de Cambios Completados

Este documento detalla **todas las correcciones aplicadas** al frontend de NeuroPod y especifica **exactamente qué debe implementar el backend** para que el sistema funcione completamente.

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
