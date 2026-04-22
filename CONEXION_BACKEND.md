# Guía de Conexión Frontend - Backend

Este documento explica cómo están conectados el frontend React con el backend Express.

## Estructura de Conexión

```
Frontend (React + Vite)
    ↓
[API Service] (src/services/api.js)
    ↓
Backend (Express)
    ↓
Controllers → Services → Repositories → Database (PostgreSQL)
```

## Cómo Funciona

### 1. **Servicio de API** (`src/services/api.js`)

El servicio API es el puente entre el frontend y el backend. Contiene funciones para:

- **Autenticación** (`authService`)
  - `register()` - POST `/api/auth/register`
  - `login()` - POST `/api/auth/login`
  - `logout()` - POST `/api/auth/logout`
  - `me()` - GET `/api/auth/me` (requiere token)
  - `requestPasswordReset()` - POST `/api/auth/reset-request`
  - `resetPassword()` - POST `/api/auth/reset-password`

- **Tareas** (`taskService`)
  - `list()` - GET `/api/tasks?page=1&limit=20`
  - `getById()` - GET `/api/tasks/:id`
  - `create()` - POST `/api/tasks`
  - `update()` - PUT `/api/tasks/:id`
  - `changeStatus()` - PATCH `/api/tasks/:id/status`
  - `delete()` - DELETE `/api/tasks/:id`

### 2. **Contexto de Autenticación** (`src/context/AuthContext.jsx`)

Maneja el estado global de autenticación usando React Context API:

```jsx
import { useAuth, AuthProvider } from './context/AuthContext';

function MyComponent() {
  const { user, login, logout } = useAuth();
}
```

### 3. **Hook de Tareas** (`src/hooks/useTasks.js`)

Hook personalizado para gestionar tareas:

```jsx
import { useTasks } from './hooks/useTasks';

function MyComponent() {
  const { tasks, loadTasks, createTask, updateTask } = useTasks();
}
```

## Requisitos para Que Funcione

### Backend debe estar corriendo en `http://localhost:3000`

1. **Iniciar el servidor backend:**
   ```bash
   cd HOME.PROJECT.BACK
   npm install
   npm run migrate  # crear base de datos
   npm run dev      # iniciar servidor
   ```

2. **Variables de entorno del backend** (`.env`):
   ```
   PORT=3000
   NODE_ENV=development
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=task_manager_db
   DB_USER=postgres
   DB_PASSWORD=tu_contraseña
   JWT_SECRET=tu_secret_super_seguro
   ```

### Frontend debe estar en un puerto diferente

1. **Iniciar el servidor frontend:**
   ```bash
   cd hometask-frontend
   npm install
   npm run dev
   ```

El frontend correrá en `http://localhost:5173` (o puerto que indique Vite)

## Flujo de Autenticación

### 1. Registrarse

```jsx
const { register } = useAuth();

// En el componente
await register(email, password, name);
// Automáticamente guarda el token en localStorage
```

### 2. Iniciar Sesión

```jsx
const { login } = useAuth();

await login(email, password);
// Token se guarda automáticamente en localStorage
```

### 3. Usar Token en Requests

El servicio de API envía automáticamente el token en el header:

```javascript
// En src/services/api.js
const token = localStorage.getItem('token');
if (token) {
  headers['Authorization'] = `Bearer ${token}`;
}
```

### 4. Verificar Autenticación

```jsx
const { user, loading } = useAuth();

if (loading) return <Loading />;
if (!user) return <Login />;

return <Dashboard />;
```

## Flujo de Tareas

### Cargar Tareas

```jsx
const { tasks, loadTasks } = useTasks();

useEffect(() => {
  loadTasks(); // Carga desde GET /api/tasks
}, []);
```

### Crear Tarea

```jsx
const { createTask } = useTasks();

const newTask = await createTask({
  name: "Mi tarea",
  desc: "Descripción",
  status: "pending",
  // ... otros campos
});
```

### Actualizar Estado de Tarea

```jsx
const { changeTaskStatus } = useTasks();

await changeTaskStatus(taskId, "process");
```

## CORS

El backend tiene CORS habilitado en `src/app.js`:

```javascript
app.use(cors());
```

Esto permite que el frontend (en otro puerto) haga requests al backend.

## Estructura de Respuestas del Backend

Todas las respuestas del backend siguen este formato:

```json
{
  "success": true,
  "message": "Operación exitosa",
  "data": { /* datos aquí */ }
}
```

En caso de error:

```json
{
  "success": false,
  "message": "Descripción del error",
  "error": "ERROR_CODE"
}
```

## Endpoints Disponibles

### Auth
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/me` - Obtener datos del usuario actual (requiere token)
- `POST /api/auth/logout` - Cerrar sesión
- `POST /api/auth/reset-request` - Solicitar reset de contraseña
- `POST /api/auth/reset-password` - Confirmar reset de contraseña

### Tasks
- `GET /api/tasks` - Listar tareas con filtros y paginación
- `GET /api/tasks/:id` - Obtener una tarea específica
- `POST /api/tasks` - Crear nueva tarea (requiere token)
- `PUT /api/tasks/:id` - Actualizar tarea (requiere token)
- `PATCH /api/tasks/:id/status` - Cambiar estado de tarea (requiere token)
- `DELETE /api/tasks/:id` - Eliminar tarea (requiere token)

## Debugging

Si tienes problemas de conexión:

1. **Verifica que el backend está corriendo:**
   ```bash
   curl http://localhost:3000/health
   ```

2. **Revisa la consola del navegador** para errores de fetch

3. **Verifica que el token se guardó:**
   ```javascript
   localStorage.getItem('token')
   ```

4. **Revisa los logs del backend** para mensajes de error

## Notas Importantes

- El token se guarda automáticamente en `localStorage` después de login
- El token se envía automáticamente en los headers de cada request autenticado
- El token expira después de cierto tiempo (configurable en el backend)
- Si el backend devuelve 401 (Unauthorized), significa que el token expiró o es inválido
