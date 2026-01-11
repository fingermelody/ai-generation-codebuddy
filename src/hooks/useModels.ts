import { useEffect, useCallback } from 'react';
import { useAppStore } from '@/stores/appStore';
import { getAvailableModels } from '@/services/cloudbase';
import toast from 'react-hot-toast';

/**
 * 获取和管理 AI 模型列表的 Hook
 */
export function useModels() {
  const {
    models,
    selectedImageModel,
    selected3DModel,
    isLoadingModels,
    setModels,
    setSelectedImageModel,
    setSelected3DModel,
    setIsLoadingModels,
  } = useAppStore();

  // 获取模型列表
  const fetchModels = useCallback(async () => {
    setIsLoadingModels(true);
    try {
      const modelList = await getAvailableModels();
      setModels(modelList);

      // 自动选择第一个可用的图像模型和3D模型
      const imageModels = modelList.filter(
        (m) => m.type === 'text2img' && m.status === 'active'
      );
      const model3DList = modelList.filter(
        (m) => m.type === 'img2model3d' && m.status === 'active'
      );

      if (imageModels.length > 0 && !selectedImageModel) {
        setSelectedImageModel(imageModels[0].id);
      }
      if (model3DList.length > 0 && !selected3DModel) {
        setSelected3DModel(model3DList[0].id);
      }
    } catch (error) {
      toast.error('获取模型列表失败，请刷新重试');
      console.error('获取模型列表失败:', error);
    } finally {
      setIsLoadingModels(false);
    }
  }, [
    setModels,
    setSelectedImageModel,
    setSelected3DModel,
    setIsLoadingModels,
    selectedImageModel,
    selected3DModel,
  ]);

  // 组件挂载时获取模型列表
  useEffect(() => {
    fetchModels();
  }, [fetchModels]);

  // 获取图像生成模型列表
  const imageModels = models.filter((m) => m.type === 'text2img');

  // 获取 3D 生成模型列表
  const model3DList = models.filter((m) => m.type === 'img2model3d');

  // 获取当前选中的图像模型信息
  const currentImageModel = models.find((m) => m.id === selectedImageModel);

  // 获取当前选中的 3D 模型信息
  const current3DModel = models.find((m) => m.id === selected3DModel);

  return {
    models,
    imageModels,
    model3DList,
    selectedImageModel,
    selected3DModel,
    currentImageModel,
    current3DModel,
    isLoadingModels,
    setSelectedImageModel,
    setSelected3DModel,
    refreshModels: fetchModels,
  };
}
