# NeuroPod - Frontend

## Descripción del Frontend

El frontend de NeuroPod es una aplicación web desarrollada en React que proporciona una interfaz intuitiva para gestionar contenedores Docker personalizados. Permite a los usuarios autenticarse, crear y gestionar sus propios contenedores, y acceder a ellos a través de subdominios personalizados.

## Tecnologías Utilizadas

- **Framework**: React
- **Bundler**: Vite
- **Lenguaje**: TypeScript
- **Estilos**: TailwindCSS
- **Componentes UI**: shadcn-ui
- **Autenticación**: Google OAuth2 con JWT
- **Comunicación en tiempo real**: WebSockets

## Estructura del Proyecto

### Componentes Principales

```
src/
├── components/          # Componentes reutilizables
│   ├── ProtectedRoute.tsx     # Control de acceso basado en roles
│   ├── ui/                    # Componentes UI base (shadcn)
│   ├── dashboard/             # Componentes específicos del dashboard
│   ├── modals/                # Componentes de modal
│   └── pods/                  # Componentes relacionados con contenedores
│
├── context/             # Contextos de React
│   ├── AuthContext.tsx        # Gestión de autenticación
│   └── BalanceContext.tsx     # Gestión del saldo del usuario
│
├── pages/               # Páginas principales
│   ├── Index.tsx              # Página de inicio
│   ├── Login.tsx              # Inicio de sesión
│   ├── Signup.tsx             # Registro
│   ├── Dashboard.tsx          # Panel principal
│   ├── Pricing.tsx            # Planes y precios
│   ├── NotFound.tsx           # Página 404
│   ├── admin/                 # Páginas exclusivas para administradores
│   │   ├── Pods.tsx           # Gestión de todos los contenedores
│   │   ├── PodDeploy.tsx      # Creación de nuevos contenedores
│   │   ├── Users.tsx          # Gestión de usuarios
│   │   ├── Settings.tsx       # Configuración del sistema
│   │   └── Help.tsx           # Documentación para admins
│   │
│   └── client/                # Páginas exclusivas para clientes
│       ├── Stats.tsx          # Estadísticas de uso
│       ├── Pods.tsx           # Gestión de contenedores propios
│       ├── PodDeploy.tsx      # Creación de nuevos contenedores
│       ├── Settings.tsx       # Configuración de cuenta
│       └── Help.tsx           # Documentación para usuarios
│
├── services/            # Servicios para API y WebSockets
│   ├── api.ts                 # Cliente Axios para la API
│   └── websocket.ts           # Cliente WebSocket
│
└── utils/               # Utilidades y helpers
    ├── auth.ts                # Funciones de autenticación
    ├── format.ts              # Formateo de datos
    └── validation.ts          # Validación de formularios
```

## Rutas del Frontend

### Páginas Públicas
- **/** - Página de inicio con información sobre NeuroPod
- **/login** - Autenticación con email/contraseña o Google OAuth
- **/signup** - Registro de nuevos usuarios
- **/pricing** - Planes y precios disponibles

### Rutas Protegidas
- **/dashboard** - Panel principal con redirección según rol del usuario

### Panel de Administrador (requiere rol "admin")
- **/admin/pods** - Visualización y gestión de todos los contenedores del sistema
- **/admin/pods/deploy** - Interfaz para crear nuevos contenedores (propios o para usuarios)
- **/admin/users** - Gestión de usuarios (asignar saldo, suspender cuentas)
- **/admin/settings** - Configuración de precios, plantillas y sistema
- **/admin/help** - Documentación para administradores

### Panel de Cliente (requiere rol "client")
- **/client/stats** - Estadísticas de uso, costos y recursos
- **/client/pods** - Visualización y gestión de contenedores propios
- **/client/pods/deploy** - Interfaz para crear nuevos contenedores
- **/client/settings** - Configuración de cuenta y preferencias
- **/client/help** - Documentación para usuarios

## Funcionalidades del Frontend

### Implementadas
- ✅ Estructura básica de rutas y navegación
- ✅ Diseño UI con TailwindCSS y shadcn-ui
- ✅ Componente de ruta protegida con control de acceso basado en roles

### Pendientes de Implementar
- ⏳ **Contexto de Saldo**: 
  - Mostrar saldo infinito para admin (decorativo)
  - Mostrar saldo real para clientes (10€ iniciales)
  - Actualización en tiempo real al usar contenedores

- ⏳ **Autenticación**:
  - Integración con Google OAuth2
  - Almacenamiento y gestión de JWT
  - Redirección basada en roles (admin/client)

- ⏳ **Gestión de Pods**:
  - Listar todos los pods con estado actual
  - Controles para iniciar/detener/eliminar pods
  - Modal de conexión con servicios y puertos disponibles
  - Visualización de logs del contenedor

- ⏳ **Despliegue de Pods**:
  - Formulario para configurar nuevos contenedores
  - Selección de plantillas (Ubuntu, ComfyUI, etc.)
  - Configuración de recursos (CPU, memoria, volumen)
  - Cálculo de costo en tiempo real

- ⏳ **Estadísticas**:
  - Gráficos de uso de recursos
  - Historial de costos
  - Logs de actividad

- ⏳ **Panel de Administración**:
  - Gestión de usuarios (asignar saldo, suspender)
  - Configuración de precios para distintos tipos de recursos
  - Gestión de plantillas de contenedores

## Integración con Backend

El frontend se comunica con el backend a través de:

1. **API REST** (`api.neuropod.online`):
   - Endpoints de autenticación: `/api/auth/login`, `/api/auth/verify`
   - Gestión de pods: `/api/pods/start`, `/api/pods/stop`
   - Administración: `/api/admin/users`, `/api/admin/settings`

2. **WebSockets**:
   - Actualizaciones en tiempo real del estado de los pods
   - Notificaciones de eventos del sistema
   - Actualización de saldo al consumir recursos

## Desarrollo Local

### Requisitos
- Node.js v16 o superior
- npm o yarn

### Configuración
1. Clona el repositorio:
   ```bash
   git clone https://github.com/tu-usuario/neuropod-frontend.git
   cd neuropod-frontend
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Crea un archivo `.env.local` con las siguientes variables:
   ```
   VITE_API_URL=http://localhost:3000
   VITE_WS_URL=ws://localhost:3000
   VITE_GOOGLE_CLIENT_ID=tu-google-client-id
   ```

4. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

5. Accede a la aplicación en `http://localhost:5173`

## Nota Importante

El frontend está diseñado para trabajar con:
- Backend en `http://localhost:3000` (o `api.neuropod.online` en producción)
- Cloudflare Tunnel para exponer la aplicación a Internet
- Kubernetes para gestionar los contenedores de usuario

## Contacto
Para más información sobre el desarrollo del frontend, contacta a lolerodiez@gmail.com
