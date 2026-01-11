import { useCallback, useRef } from 'react';
import { useAppStore } from '@/stores/appStore';
import {
  generateImages,
  getImageGenerationProgress,
  generate3DModel,
  get3DModelProgress,
} from '@/services/cloudbase';
import toast from 'react-hot-toast';

/**
 * 图像和 3D 模型生成的 Hook
 */
export function useGeneration() {
  const {
    prompt,
    negativePrompt,
    resolution,
    imageCount,
    selectedImageModel,
    selected3DModel,
    outputFormat,
    modelQuality,
    generatedImages,
    selectedImageId,
    current3DModel,
    isGeneratingImage,
    isGenerating3D,
    setGeneratedImages,
    setSelectedImageId,
    setCurrent3DModel,
    setImageProgress,
    setModel3DProgress,
    setIsGeneratingImage,
    setIsGenerating3D,
    addHistoryItem,
  } = useAppStore();

  const imagePollingRef = useRef<NodeJS.Timeout | null>(null);
  const model3DPollingRef = useRef<NodeJS.Timeout | null>(null);

  // 停止图像生成轮询
  const stopImagePolling = useCallback(() => {
    if (imagePollingRef.current) {
      clearInterval(imagePollingRef.current);
      imagePollingRef.current = null;
    }
  }, []);

  // 停止 3D 模型生成轮询
  const stopModel3DPolling = useCallback(() => {
    if (model3DPollingRef.current) {
      clearInterval(model3DPollingRef.current);
      model3DPollingRef.current = null;
    }
  }, []);

  // 生成图像
  const handleGenerateImages = useCallback(async () => {
    if (!prompt.trim()) {
      toast.error('请输入提示词');
      return;
    }

    if (!selectedImageModel) {
      toast.error('请选择图像生成模型');
      return;
    }

    setIsGeneratingImage(true);
    setGeneratedImages([]);
    setImageProgress({ taskId: '', progress: 0, status: 'pending' });

    const loadingToast = toast.loading('正在生成图像...');

    try {
      const { taskId } = await generateImages({
        prompt,
        negativePrompt: negativePrompt || undefined,
        resolution,
        count: imageCount,
        modelId: selectedImageModel,
      });

      setImageProgress({ taskId, progress: 0, status: 'processing' });

      // 轮询查询进度
      imagePollingRef.current = setInterval(async () => {
        try {
          const result = await getImageGenerationProgress(taskId);

          setImageProgress({
            taskId,
            progress: result.progress,
            status: result.status,
            message: result.message,
          });

          if (result.status === 'completed' && result.images) {
            stopImagePolling();
            setGeneratedImages(result.images);
            setIsGeneratingImage(false);
            toast.dismiss(loadingToast);
            toast.success(`成功生成 ${result.images.length} 张图像`);

            // 添加到历史记录
            addHistoryItem({
              id: taskId,
              type: 'image',
              title: prompt.slice(0, 20),
              thumbnailUrl: result.images[0]?.url,
              modelName: '混元图像',
              createdAt: new Date(),
            });

            // 自动选中第一张图像
            if (result.images.length > 0) {
              setSelectedImageId(result.images[0].id);
            }
          } else if (result.status === 'failed') {
            stopImagePolling();
            setIsGeneratingImage(false);
            toast.dismiss(loadingToast);
            toast.error(result.message || '图像生成失败');
          }
        } catch (error) {
          console.error('查询图像生成进度失败:', error);
        }
      }, 2000);
    } catch (error) {
      setIsGeneratingImage(false);
      toast.dismiss(loadingToast);
      toast.error('图像生成请求失败');
      console.error('图像生成失败:', error);
    }
  }, [
    prompt,
    negativePrompt,
    resolution,
    imageCount,
    selectedImageModel,
    setIsGeneratingImage,
    setGeneratedImages,
    setImageProgress,
    setSelectedImageId,
    addHistoryItem,
    stopImagePolling,
  ]);

  // 生成 3D 模型
  const handleGenerate3DModel = useCallback(async () => {
    const selectedImage = generatedImages.find((img) => img.id === selectedImageId);

    if (!selectedImage) {
      toast.error('请先选择一张图像');
      return;
    }

    if (!selected3DModel) {
      toast.error('请选择 3D 生成模型');
      return;
    }

    setIsGenerating3D(true);
    setCurrent3DModel(null);
    setModel3DProgress({ taskId: '', progress: 0, status: 'pending' });

    const loadingToast = toast.loading('正在生成 3D 模型...');

    try {
      const { taskId } = await generate3DModel({
        imageId: selectedImage.id,
        imageUrl: selectedImage.url,
        modelId: selected3DModel,
        format: outputFormat,
        quality: modelQuality,
      });

      setModel3DProgress({ taskId, progress: 0, status: 'processing' });

      // 轮询查询进度
      model3DPollingRef.current = setInterval(async () => {
        try {
          const result = await get3DModelProgress(taskId);

          setModel3DProgress({
            taskId,
            progress: result.progress,
            status: result.status,
            message: result.message,
            estimatedTime: Math.ceil((100 - result.progress) * 0.6),
          });

          if (result.status === 'completed' && result.model) {
            stopModel3DPolling();
            setCurrent3DModel(result.model);
            setIsGenerating3D(false);
            toast.dismiss(loadingToast);
            toast.success('3D 模型生成成功');

            // 添加到历史记录
            addHistoryItem({
              id: taskId,
              type: '3d',
              title: prompt.slice(0, 20),
              thumbnailUrl: selectedImage.url,
              modelName: '混元 3D',
              createdAt: new Date(),
            });
          } else if (result.status === 'failed') {
            stopModel3DPolling();
            setIsGenerating3D(false);
            toast.dismiss(loadingToast);
            toast.error(result.message || '3D 模型生成失败');
          }
        } catch (error) {
          console.error('查询 3D 模型生成进度失败:', error);
        }
      }, 3000);
    } catch (error) {
      setIsGenerating3D(false);
      toast.dismiss(loadingToast);
      toast.error('3D 模型生成请求失败');
      console.error('3D 模型生成失败:', error);
    }
  }, [
    generatedImages,
    selectedImageId,
    selected3DModel,
    outputFormat,
    modelQuality,
    prompt,
    setIsGenerating3D,
    setCurrent3DModel,
    setModel3DProgress,
    addHistoryItem,
    stopModel3DPolling,
  ]);

  // 选择图像
  const selectImage = useCallback(
    (imageId: string) => {
      setSelectedImageId(imageId);
    },
    [setSelectedImageId]
  );

  return {
    // 状态
    generatedImages,
    selectedImageId,
    current3DModel,
    isGeneratingImage,
    isGenerating3D,

    // 操作
    handleGenerateImages,
    handleGenerate3DModel,
    selectImage,
    stopImagePolling,
    stopModel3DPolling,
  };
}
