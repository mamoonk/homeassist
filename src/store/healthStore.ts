import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { HealthMetric } from '../types';
import { randomId } from '../services/storage';

interface HealthStore {
  metrics: HealthMetric[];
  addMetric: (metric: Omit<HealthMetric, 'id'>) => void;
}

export const useHealthStore = create<HealthStore>()(
  persist(
    (set, get) => ({
      metrics: [],
      addMetric: (metric) => set({ metrics: [...get().metrics, { ...metric, id: randomId('health') }] }),
    }),
    { name: 'gloss-health-metrics' },
  ),
);
