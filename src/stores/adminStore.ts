import { create } from 'zustand';
import type { AIModelConfig } from '@/types';

interface AdminState {
  // 模型配置列表
  modelConfigs: AIModelConfig[];
  isLoading: boolean;
  error: string | null;

  // 编辑状态
  editingModel: AIModelConfig | null;
  isModalOpen: boolean;

  // Actions
  setModelConfigs: (configs: AIModelConfig[]) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setEditingModel: (model: AIModelConfig | null) => void;
  setIsModalOpen: (open: boolean) => void;

  addModelConfig: (config: AIModelConfig) => void;
  updateModelConfig: (id: string, updates: Partial<AIModelConfig>) => void;
  removeModelConfig: (id: string) => void;
}

export const useAdminStore = create<AdminState>((set) => ({
  modelConfigs: [],
  isLoading: false,
  error: null,
  editingModel: null,
  isModalOpen: false,

  setModelConfigs: (configs) => set({ modelConfigs: configs }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  setEditingModel: (model) => set({ editingModel: model }),
  setIsModalOpen: (open) => set({ isModalOpen: open }),

  addModelConfig: (config) =>
    set((state) => ({ modelConfigs: [...state.modelConfigs, config] })),

  updateModelConfig: (id, updates) =>
    set((state) => ({
      modelConfigs: state.modelConfigs.map((config) =>
        config.id === id ? { ...config, ...updates } : config
      ),
    })),

  removeModelConfig: (id) =>
    set((state) => ({
      modelConfigs: state.modelConfigs.filter((config) => config.id !== id),
    })),
}));
