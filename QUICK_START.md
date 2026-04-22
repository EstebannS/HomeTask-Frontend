# 🚀 Inicio Rápido - HomeTask

Guía para poner en marcha la aplicación Frontend + Backend.

## Requisitos

- Node.js 16+
- PostgreSQL 12+
- npm o yarn

## Paso 1: Configurar el Backend

```bash
cd HOME.PROJECT.BACK

# Instalar dependencias
npm install

# Copiar y editar variables de entorno
cp .env.example .env

# Editar .env y configurar:
# - DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD
# - JWT_SECRET
# - Otros según sea necesario
```

### Crear la Base de Datos

```bash
# Crear la base de datos en PostgreSQL
psql -U postgres -c "CREATE DATABASE task_manager_db;"

# Ejecutar migraciones
npm run migrate

# (Opcional) Cargar datos de prueba
npm run seed
```

### Iniciar el Backend

```bash
npm run dev
# El servidor estará en http://localhost:3000
```

## Paso 2: Configurar el Frontend

```bash
cd hometask-frontend

# Instalar dependencias
npm install

# Copiar variables de entorno (opcional)
cp .env.example .env.local
```

### Iniciar el Frontend

```bash
npm run dev
# El servidor estará en http://localhost:5173
```

## Paso 3: Usar la Aplicación

1. Abre `http://localhost:5173` en tu navegador
2. Haz clic en "Crear cuenta" o "Iniciar sesión"
3. ¡Listo! Ahora puedes crear y gestionar tareas

## Estructura de Carpetas

```
hometask-frontend/
├── src/
│   ├── services/
│   │   └── api.js              # ← Comunicación con el backend
│   ├── context/
│   │   └── AuthContext.jsx     # ← Autenticación global
│   ├── hooks/
│   │   └── useTasks.js         # ← Manejo de tareas
│   ├── App.jsx                 # ← Componente principal
│   └── ...
├── .env.example
└── CONEXION_BACKEND.md         # ← Documentación detallada
```

## Servicios Disponibles

### Autenticación (`authService`)

```javascript
import { authService } from './services/api';

// Registrarse
await authService.register(email, password, name);

// Iniciar sesión
await authService.login(email, password);

// Obtener datos del usuario
const user = await authService.me();

// Cerrar sesión
await authService.logout();
```

### Tareas (`taskService`)

```javascript
import { taskService } from './services/api';

// Obtener todas las tareas
const result = await taskService.list(filters, page, limit);

// Obtener una tarea
const task = await taskService.getById(id);

// Crear tarea
const newTask = await taskService.create(taskData);

// Actualizar tarea
const updated = await taskService.update(id, taskData);

// Cambiar estado
const task = await taskService.changeStatus(id, 'process');

// Eliminar tarea
await taskService.delete(id);
```

## Usando los Hooks y Contextos

### Contexto de Autenticación

```jsx
import { useAuth, AuthProvider } from './context/AuthContext';

function MyComponent() {
  const { user, loading, login, register, logout } = useAuth();
  
  if (loading) return <Loading />;
  if (!user) return <Login />;
  
  return <Dashboard user={user} />;
}

export default function App() {
  return (
    <AuthProvider>
      <MyComponent />
    </AuthProvider>
  );
}
```

### Hook de Tareas

```jsx
import { useTasks } from './hooks/useTasks';

function TaskList() {
  const { 
    tasks, 
    loading, 
    error, 
    loadTasks, 
    createTask, 
    updateTask, 
    changeTaskStatus, 
    deleteTask 
  } = useTasks();

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  if (loading) return <Loading />;
  if (error) return <Error message={error} />;

  return (
    <div>
      {tasks.map(task => (
        <TaskCard 
          key={task.id} 
          task={task}
          onUpdate={() => updateTask(task.id, {...})}
          onDelete={() => deleteTask(task.id)}
        />
      ))}
    </div>
  );
}
```

## Troubleshooting

### Error: "Cannot connect to http://localhost:3000"

- Asegúrate de que el backend está corriendo
- Verifica que `npm run dev` se ejecutó en la carpeta del backend
- Comprueba que el puerto 3000 no está en uso por otra aplicación

### Error: "Database connection failed"

- Verifica que PostgreSQL está corriendo
- Comprueba las credenciales en `.env`
- Ejecuta `npm run migrate` para crear las tablas

### El token no se guarda

- Abre DevTools → Application → Local Storage
- Verifica que `token` esté guardado después de login
- Si no aparece, probablemente haya un error en el backend

### CORS Error

- Verifica que el backend tiene CORS habilitado
- Comprueba que `CORS_ORIGIN` en `.env` del backend incluye `http://localhost:5173`

## Documentación Completa

Para más detalles sobre cómo funciona la conexión entre frontend y backend, lee:
[CONEXION_BACKEND.md](./CONEXION_BACKEND.md)

## Próximos Pasos

1. ✅ Conexión Frontend-Backend implementada
2. 📝 Todavía necesitas:
   - [ ] Configurar la base de datos real
   - [ ] Implementar validaciones más completas
   - [ ] Agregar notificaciones en tiempo real (Socket.io)
   - [ ] Tests automatizados
   - [ ] Desplegar a producción

¡Que disfrutes! 🎉
