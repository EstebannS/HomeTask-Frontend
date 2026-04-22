import { useState, useCallback } from 'react';
import { taskService } from '../services/api';

/**
 * Hook personalizado para manejar las tareas
 */
export function useTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Cargar tareas desde el backend
   */
  const loadTasks = useCallback(async (filters = {}, page = 1, limit = 20) => {
    try {
      setLoading(true);
      setError(null);
      const result = await taskService.list(filters, page, limit);
      setTasks(result.tasks || []);
      return result;
    } catch (err) {
      setError(err.message);
      console.error('Error al cargar tareas:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Obtener una tarea por ID
   */
  const getTask = useCallback(async (id) => {
    try {
      const task = await taskService.getById(id);
      return task;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  /**
   * Crear una nueva tarea
   */
  const createTask = useCallback(async (taskData) => {
    try {
      setError(null);
      const newTask = await taskService.create(taskData);
      setTasks(prev => [newTask, ...prev]);
      return newTask;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  /**
   * Actualizar una tarea
   */
  const updateTask = useCallback(async (id, taskData) => {
    try {
      setError(null);
      const updatedTask = await taskService.update(id, taskData);
      setTasks(prev =>
        prev.map(t => t.id === id ? updatedTask : t)
      );
      return updatedTask;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  /**
   * Cambiar el estado de una tarea
   */
  const changeTaskStatus = useCallback(async (id, status) => {
    try {
      setError(null);
      const updatedTask = await taskService.changeStatus(id, status);
      setTasks(prev =>
        prev.map(t => t.id === id ? updatedTask : t)
      );
      return updatedTask;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  /**
   * Eliminar una tarea
   */
  const deleteTask = useCallback(async (id) => {
    try {
      setError(null);
      await taskService.delete(id);
      setTasks(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  return {
    tasks,
    loading,
    error,
    loadTasks,
    getTask,
    createTask,
    updateTask,
    changeTaskStatus,
    deleteTask,
  };
}
