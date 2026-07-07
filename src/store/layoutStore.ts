import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { LayoutsByTab, LayoutsByBreakpoint } from '../types';

interface LayoutStore {
  layouts: LayoutsByTab;
  setTabLayout: (tab: string, layouts: LayoutsByBreakpoint) => void;
}

export const useLayoutStore = create<LayoutStore>()(
  persist(
    (set) => ({
      layouts: {},
      setTabLayout: (tab, layouts) =>
        set((state) => ({ layouts: { ...state.layouts, [tab]: layouts } })),
    }),
    { name: 'gloss-layouts' },
  ),
);
