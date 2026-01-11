import cloudbase from '@cloudbase/js-sdk';
import type {
  ModelInfo,
  AIModelConfig,
  GenerationParams,
  Model3DParams,
  GeneratedImage,
  Generated3DModel,
  PaymentRequest,
  PaymentResponse,
  HistoryItem,
  ModelConfigForm,
} from '@/types';

// 初始化 CloudBase
const app = cloudbase.init({
  env: 'ai-generator-1gp9p3g64d04e869',
});

const db = app.database();

// ==================== 模型管理 API ====================

/**
 * 获取可用的 AI 模型列表（前端可见信息）
 */
export async function getAvailableModels(): Promise<ModelInfo[]> {
  try {
    const res = await app.callFunction({
      name: 'modelProxy',
      data: { action: 'list' },
    });

    if (res.result?.success) {
      return res.result.data as ModelInfo[];
    }
    throw new Error(res.result?.message || '获取模型列表失败');
  } catch (error) {
    console.error('获取模型列表失败:', error);
    throw error;
  }
}

/**
 * 管理员：获取完整模型配置列表
 */
export async function getModelConfigs(): Promise<AIModelConfig[]> {
  try {
    const res = await app.callFunction({
      name: 'modelProxy',
      data: { action: 'listAdmin' },
    });

    if (res.result?.success) {
      return res.result.data as AIModelConfig[];
    }
    throw new Error(res.result?.message || '获取模型配置失败');
  } catch (error) {
    console.error('获取模型配置失败:', error);
    throw error;
  }
}

/**
 * 管理员：添加模型配置
 */
export async function addModelConfig(
  config: ModelConfigForm
): Promise<AIModelConfig> {
  try {
    const res = await app.callFunction({
      name: 'modelProxy',
      data: { action: 'add', config },
    });

    if (res.result?.success) {
      return res.result.data as AIModelConfig;
    }
    throw new Error(res.result?.message || '添加模型配置失败');
  } catch (error) {
    console.error('添加模型配置失败:', error);
    throw error;
  }
}

/**
 * 管理员：更新模型配置
 */
export async function updateModelConfig(
  id: string,
  updates: Partial<ModelConfigForm>
): Promise<AIModelConfig> {
  try {
    const res = await app.callFunction({
      name: 'modelProxy',
      data: { action: 'update', id, updates },
    });

    if (res.result?.success) {
      return res.result.data as AIModelConfig;
    }
    throw new Error(res.result?.message || '更新模型配置失败');
  } catch (error) {
    console.error('更新模型配置失败:', error);
    throw error;
  }
}

/**
 * 管理员：删除模型配置
 */
export async function deleteModelConfig(id: string): Promise<void> {
  try {
    const res = await app.callFunction({
      name: 'modelProxy',
      data: { action: 'delete', id },
    });

    if (!res.result?.success) {
      throw new Error(res.result?.message || '删除模型配置失败');
    }
  } catch (error) {
    console.error('删除模型配置失败:', error);
    throw error;
  }
}

/**
 * 管理员：切换模型状态
 */
export async function toggleModelStatus(
  id: string,
  status: 'active' | 'inactive'
): Promise<void> {
  try {
    const res = await app.callFunction({
      name: 'modelProxy',
      data: { action: 'toggleStatus', id, status },
    });

    if (!res.result?.success) {
      throw new Error(res.result?.message || '切换模型状态失败');
    }
  } catch (error) {
    console.error('切换模型状态失败:', error);
    throw error;
  }
}

// ==================== 文生图 API ====================

/**
 * 生成图像
 */
export async function generateImages(
  params: GenerationParams
): Promise<{ taskId: string }> {
  try {
    const res = await app.callFunction({
      name: 'text2img',
      data: params,
    });

    if (res.result?.success) {
      return { taskId: res.result.taskId };
    }
    throw new Error(res.result?.message || '生成图像失败');
  } catch (error) {
    console.error('生成图像失败:', error);
    throw error;
  }
}

/**
 * 查询图像生成进度
 */
export async function getImageGenerationProgress(taskId: string): Promise<{
  progress: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  images?: GeneratedImage[];
  message?: string;
}> {
  try {
    const res = await app.callFunction({
      name: 'text2img',
      data: { action: 'progress', taskId },
    });

    if (res.result?.success) {
      return res.result.data;
    }
    throw new Error(res.result?.message || '查询进度失败');
  } catch (error) {
    console.error('查询图像生成进度失败:', error);
    throw error;
  }
}

// ==================== 图生3D API ====================

/**
 * 生成 3D 模型
 */
export async function generate3DModel(
  params: Model3DParams
): Promise<{ taskId: string }> {
  try {
    const res = await app.callFunction({
      name: 'img2model3d',
      data: params,
    });

    if (res.result?.success) {
      return { taskId: res.result.taskId };
    }
    throw new Error(res.result?.message || '生成3D模型失败');
  } catch (error) {
    console.error('生成3D模型失败:', error);
    throw error;
  }
}

/**
 * 查询 3D 模型生成进度
 */
export async function get3DModelProgress(taskId: string): Promise<{
  progress: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  model?: Generated3DModel;
  message?: string;
}> {
  try {
    const res = await app.callFunction({
      name: 'img2model3d',
      data: { action: 'progress', taskId },
    });

    if (res.result?.success) {
      return res.result.data;
    }
    throw new Error(res.result?.message || '查询进度失败');
  } catch (error) {
    console.error('查询3D模型生成进度失败:', error);
    throw error;
  }
}

// ==================== 支付 API ====================

/**
 * 创建支付订单
 */
export async function createPaymentOrder(
  request: PaymentRequest
): Promise<PaymentResponse> {
  try {
    const res = await app.callFunction({
      name: 'createOrder',
      data: request,
    });

    if (res.result?.success) {
      return res.result.data as PaymentResponse;
    }
    throw new Error(res.result?.message || '创建订单失败');
  } catch (error) {
    console.error('创建支付订单失败:', error);
    throw error;
  }
}

/**
 * 查询订单状态
 */
export async function getOrderStatus(orderId: string): Promise<{
  status: 'pending' | 'paid' | 'refunded' | 'expired';
  downloadUrl?: string;
}> {
  try {
    const res = await app.callFunction({
      name: 'orderQuery',
      data: { orderId },
    });

    if (res.result?.success) {
      return res.result.data;
    }
    throw new Error(res.result?.message || '查询订单状态失败');
  } catch (error) {
    console.error('查询订单状态失败:', error);
    throw error;
  }
}

// ==================== 历史记录 API ====================

/**
 * 获取用户历史记录
 */
export async function getHistory(
  limit = 20,
  offset = 0
): Promise<HistoryItem[]> {
  try {
    const res = await db
      .collection('generations')
      .orderBy('createdAt', 'desc')
      .skip(offset)
      .limit(limit)
      .get();

    return (res.data || []).map((item: Record<string, unknown>) => ({
      id: item._id as string,
      type: item.type as 'image' | '3d',
      title: item.prompt
        ? (item.prompt as string).slice(0, 20)
        : '未命名',
      thumbnailUrl: item.thumbnailUrl as string | undefined,
      modelName: item.modelName as string,
      createdAt: new Date(item.createdAt as string),
    }));
  } catch (error) {
    console.error('获取历史记录失败:', error);
    throw error;
  }
}

/**
 * 删除历史记录
 */
export async function deleteHistoryItem(id: string): Promise<void> {
  try {
    await db.collection('generations').doc(id).remove();
  } catch (error) {
    console.error('删除历史记录失败:', error);
    throw error;
  }
}

export { app, db };
