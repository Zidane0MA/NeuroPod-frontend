# NeuroPod - Plataforma de Gestión de Contenedores

## Descripción del Proyecto

NeuroPod es una plataforma avanzada que permite a los usuarios iniciar sesión, gestionar y ejecutar múltiples contenedores Docker a través de una interfaz web intuitiva. Cada contenedor desplegado es accesible mediante su propio subdominio dinámico (ej. `comfy-usuario123-4567.neuropod.online`).

El sistema gestiona la autenticación, sesiones, y despliega los contenedores necesarios en Kubernetes de forma dinámica según las peticiones de los usuarios. Los contenedores tienen un directorio `/workspace` que persiste entre sesiones para almacenar datos del usuario.

## Tecnologías Principales

- **Frontend**: React, Vite, TypeScript, TailwindCSS, shadcn-ui
- **Backend**: Node.js, Express
- **Base de Datos**: MongoDB
- **Orquestación**: Kubernetes, Docker, NGINX Ingress Controller
- **Conectividad Externa**: Cloudflare Tunnel
- **Autenticación**: Google OAuth2, JWT

## Modelo de Negocio

- Usuarios reciben un saldo inicial de 10€
- El saldo se consume al ejecutar contenedores según el tipo y tiempo de uso
- El administrador cuenta con saldo ilimitado y puede configurar precios y asignar saldo adicional a los usuarios
- Sistema preparado para integrar pasarelas de pago (pendiente de implementación)

## Estructura del Frontend

### Páginas Principales
- **/** - Página de inicio
- **/login** y **/signup** - Autenticación
- **/pricing** - Planes y precios
- **/dashboard** - Panel principal

### Panel de Administrador
- **/admin/pods** - Gestión de todos los contenedores
- **/admin/pods/deploy** - Crear nuevos contenedores
- **/admin/users** - Gestión de usuarios
- **/admin/settings** - Configuración del sistema
- **/admin/help** - Documentación para administradores

### Panel de Cliente
- **/client/stats** - Estadísticas de uso
- **/client/pods** - Gestión de contenedores propios
- **/client/pods/deploy** - Crear nuevos contenedores
- **/client/settings** - Configuración de cuenta
- **/client/help** - Documentación para usuarios

## Arquitectura del Sistema

```
                           🌐 Internet
                               |
              +----------------+-----------------+
              |                                  |
       DNS Wildcard (*.neuropod.online)          |
              |                                  |
     +--------+--------+                         |
     |                 |                         |
     v                 v                         v
app.neuropod.online  api.neuropod.online  *.neuropod.online
(Frontend)           (Backend API)       (Pods de Usuario)
     |                 |                         |
     v                 v                         v
+--------------------------+ Cloudflare Tunnel +---------------------------------+
|    localhost:5173        |      localhost:3000       |     localhost:443       |
+------------+-------------+-------------+-------------+-------------+-----------+
             |                           |                           |
             v                           v                           v
     +---------------+          +------------------+         +-------------------+
     | Frontend React|          | Backend Node.js  |         | NGINX Ingress     |
     | (No container)|          | (No container)   |         | Controller        |
     +-------+-------+          +--------+---------+         +---------+---------+
             |                           |                             |
             |                           v                             v
             |                  +------------------+         +-------------------+
             |                  | MongoDB          |         | Kubernetes API    |
             |                  | (No container)   |<------->| (Minikube)        |
             |                  +------------------+         +---------+---------+
             |                           ^                             |
             |                           |                             v
             |                           |                   +-------------------+
             |                  WebSocket Events             | Pods de Usuario   |
             +--------------------------------+              | - ComfyUI         |
                                             |               | - Ubuntu          |
                                             |               | - Imágenes custom |
                                             |               +-------------------+
                                             |                        |
                                             |                        v
                                             |               +-------------------+
                                             +-------------->| Persistent Volume |
                                                             | (/workspace)      |
                                                             +-------------------+
```

## Desarrollo Local

### Requisitos Previos
- Node.js v22 o superior
- MongoDB Community Edition
- Minikube con NGINX Ingress habilitado
- Cloudflared (para Cloudflare Tunnel)
- Cuenta en Cloudflare con un dominio configurado

### Configuración Inicial
1. Clonar este repositorio
2. Instalar dependencias: `npm install`
3. Iniciar el servidor de desarrollo: `npm run dev`

### Conexión con Backend
- El frontend se conecta con el backend a través de endpoints REST en `api.neuropod.online`
- Asegúrate que el backend esté en ejecución en `localhost:3000`

### Variables de Entorno
Crea un archivo `.env` con las siguientes variables:
```
VITE_API_URL=http://localhost:3000
VITE_GOOGLE_CLIENT_ID=tu-google-client-id
```

## Funcionalidades a Implementar

- [x] Estructura básica de rutas y navegación
- [x] Diseño UI con TailwindCSS y shadcn-ui
- [ ] Integración con Google OAuth2
- [ ] Paneles de administrador y cliente
- [ ] WebSockets para notificaciones en tiempo real
- [ ] Gestión dinámica de contenedores
- [ ] Sistema de balance y pagos

## Contribución
Si deseas contribuir al proyecto:
1. Crea un fork del repositorio
2. Crea una nueva rama con tu característica o corrección
3. Envía un pull request

## Licencia
Este proyecto es privado y su código fuente es propiedad de sus desarrolladores.

## Contacto
Para más información, contacta a lolerodiez@gmail.com
