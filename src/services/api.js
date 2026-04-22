/**
 * API Service - Maneja todas las llamadas HTTP al backend
 * Base URL: configurada en variables de entorno
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Función helper para hacer requests HTTP
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Agregar token JWT si existe
  const token = localStorage.getItem('token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Parsear respuesta
    const data = await response.json();

    // Manejar errores
    if (!response.ok) {
      throw new Error(data.message || `Error ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error(`API Error: ${endpoint}`, error);
    throw error;
  }
}

/**
 * SERVICIOS DE AUTENTICACIÓN
 */
export const authService = {
  /**
   * Registrar nuevo usuario
   * POST /auth/register
   */
  register: async (email, password, name) => {
    const data = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
    // Guardar token si viene en la respuesta
    if (data.data?.token) {
      localStorage.setItem('token', data.data.token);
    }
    return data.data;
  },

  /**
   * Iniciar sesión
   * POST /auth/login
   */
  login: async (email, password) => {
    const data = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    // Guardar token
    if (data.data?.token) {
      localStorage.setItem('token', data.data.token);
    }
    return data.data;
  },

  /**
   * Obtener datos del usuario autenticado
   * GET /auth/me
   */
  me: async () => {
    const data = await request('/auth/me', {
      method: 'GET',
    });
    return data.data;
  },

  /**
   * Cerrar sesión
   * POST /auth/logout
   */
  logout: async () => {
    await request('/auth/logout', {
      method: 'POST',
    });
    localStorage.removeItem('token');
  },

  /**
   * Solicitar reset de contraseña
   * POST /auth/reset-request
   */
  requestPasswordReset: async (email) => {
    const data = await request('/auth/reset-request', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
    return data;
  },

  /**
   * Resetear contraseña
   * POST /auth/reset-password
   */
  resetPassword: async (token, password) => {
    const data = await request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    });
    return data;
  },
};

/**
 * SERVICIOS DE TAREAS
 */
export const taskService = {
  /**
   * Obtener todas las tareas con filtros
   * GET /tasks?page=1&limit=20&...filters
   */
  list: async (filters = {}, page = 1, limit = 20) => {
    const queryParams = new URLSearchParams({
      page,
      limit,
      ...filters,
    });
    const data = await request(`/tasks?${queryParams}`, {
      method: 'GET',
    });
    return data.data;
  },

  /**
   * Obtener una tarea por ID
   * GET /tasks/:id
   */
  getById: async (id) => {
    const data = await request(`/tasks/${id}`, {
      method: 'GET',
    });
    return data.data;
  },

  /**
   * Crear nueva tarea
   * POST /tasks
   */
  create: async (taskData) => {
    const data = await request('/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
    return data.data;
  },

  /**
   * Actualizar tarea
   * PUT /tasks/:id
   */
  update: async (id, taskData) => {
    const data = await request(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(taskData),
    });
    return data.data;
  },

  /**
   * Cambiar estado de tarea
   * PATCH /tasks/:id/status
   */
  changeStatus: async (id, status) => {
    const data = await request(`/tasks/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    return data.data;
  },

  /**
   * Eliminar tarea
   * DELETE /tasks/:id
   */
  delete: async (id) => {
    const data = await request(`/tasks/${id}`, {
      method: 'DELETE',
    });
    return data;
  },
};

/**
 * Función para verificar si hay token y usuario autenticado
 */
export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

/**
 * Función para limpiar autenticación
 */
export const clearAuth = () => {
  localStorage.removeItem('token');
};

export default { authService, taskService, isAuthenticated, clearAuth };
