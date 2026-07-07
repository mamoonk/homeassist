import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Task } from '../types';
import { randomId } from '../services/storage';

interface TasksStore {
  tasks: Task[];
  addTask: (title: string) => void;
  toggleTask: (id: string) => void;
  removeTask: (id: string) => void;
}

export const useTasksStore = create<TasksStore>()(
  persist(
    (set, get) => ({
      tasks: [],
      addTask: (title) => set({ tasks: [...get().tasks, { id: randomId('task'), title, done: false }] }),
      toggleTask: (id) =>
        set({ tasks: get().tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)) }),
      removeTask: (id) => set({ tasks: get().tasks.filter((t) => t.id !== id) }),
    }),
    { name: 'gloss-calendar-tasks' },
  ),
);
