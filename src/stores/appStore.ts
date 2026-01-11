import { create } from 'zustand';
import type {
  ModelInfo,
  GeneratedImage,
  Generated3DModel,
  HistoryItem,
  GenerationProgress,
} from '@/types';

interface AppState {
  // 模型相关
  models: ModelInfo[];
  selectedImageModel: string | null;
  selected3DModel: string | null;
  isLoadingModels: boolean;

  // 生成参数
  prompt: string;
  negativePrompt: string;
  resolution: '512x512' | '1024x1024';
  imageCount: number;
  outputFormat: 'GLB' | 'OBJ' | 'FBX' | 'GLTF';
  modelQuality: 'low' | 'medium' | 'high';

  // 生成结果
  generatedImages: GeneratedImage[];
  selectedImageId: string | null;
  current3DModel: Generated3DModel | null;

  // 进度
  imageProgress: GenerationProgress | null;
  model3DProgress: GenerationProgress | null;

  // 历史记录
  history: HistoryItem[];

  // UI 状态
  isGeneratingImage: boolean;
  isGenerating3D: boolean;
  isPaymentModalOpen: boolean;
  selectedPayMethod: 'wechat' | 'alipay';

  // Actions
  setModels: (models: ModelInfo[]) => void;
  setSelectedImageModel: (modelId: string) => void;
  setSelected3DModel: (modelId: string) => void;
  setIsLoadingModels: (loading: boolean) => void;

  setPrompt: (prompt: string) => void;
  setNegativePrompt: (prompt: string) => void;
  setResolution: (resolution: '512x512' | '1024x1024') => void;
  setImageCount: (count: number) => void;
  setOutputFormat: (format: 'GLB' | 'OBJ' | 'FBX' | 'GLTF') => void;
  setModelQuality: (quality: 'low' | 'medium' | 'high') => void;

  setGeneratedImages: (images: GeneratedImage[]) => void;
  addGeneratedImage: (image: GeneratedImage) => void;
  setSelectedImageId: (id: string | null) => void;
  setCurrent3DModel: (model: Generated3DModel | null) => void;

  setImageProgress: (progress: GenerationProgress | null) => void;
  setModel3DProgress: (progress: GenerationProgress | null) => void;

  setHistory: (history: HistoryItem[]) => void;
  addHistoryItem: (item: HistoryItem) => void;

  setIsGeneratingImage: (generating: boolean) => void;
  setIsGenerating3D: (generating: boolean) => void;
  setIsPaymentModalOpen: (open: boolean) => void;
  setSelectedPayMethod: (method: 'wechat' | 'alipay') => void;

  reset: () => void;
}

const initialState = {
  models: [],
  selectedImageModel: null,
  selected3DModel: null,
  isLoadingModels: false,

  prompt: '',
  negativePrompt: '',
  resolution: '1024x1024' as const,
  imageCount: 4,
  outputFormat: 'GLB' as const,
  modelQuality: 'high' as const,

  generatedImages: [],
  selectedImageId: null,
  current3DModel: null,

  imageProgress: null,
  model3DProgress: null,

  history: [],

  isGeneratingImage: false,
  isGenerating3D: false,
  isPaymentModalOpen: false,
  selectedPayMethod: 'wechat' as const,
};

export const useAppStore = create<AppState>((set) => ({
  ...initialState,

  setModels: (models) => set({ models }),
  setSelectedImageModel: (modelId) => set({ selectedImageModel: modelId }),
  setSelected3DModel: (modelId) => set({ selected3DModel: modelId }),
  setIsLoadingModels: (loading) => set({ isLoadingModels: loading }),

  setPrompt: (prompt) => set({ prompt }),
  setNegativePrompt: (prompt) => set({ negativePrompt: prompt }),
  setResolution: (resolution) => set({ resolution }),
  setImageCount: (count) => set({ imageCount: count }),
  setOutputFormat: (format) => set({ outputFormat: format }),
  setModelQuality: (quality) => set({ modelQuality: quality }),

  setGeneratedImages: (images) => set({ generatedImages: images }),
  addGeneratedImage: (image) =>
    set((state) => ({ generatedImages: [...state.generatedImages, image] })),
  setSelectedImageId: (id) => set({ selectedImageId: id }),
  setCurrent3DModel: (model) => set({ current3DModel: model }),

  setImageProgress: (progress) => set({ imageProgress: progress }),
  setModel3DProgress: (progress) => set({ model3DProgress: progress }),

  setHistory: (history) => set({ history }),
  addHistoryItem: (item) =>
    set((state) => ({ history: [item, ...state.history] })),

  setIsGeneratingImage: (generating) => set({ isGeneratingImage: generating }),
  setIsGenerating3D: (generating) => set({ isGenerating3D: generating }),
  setIsPaymentModalOpen: (open) => set({ isPaymentModalOpen: open }),
  setSelectedPayMethod: (method) => set({ selectedPayMethod: method }),

  reset: () => set(initialState),
}));
