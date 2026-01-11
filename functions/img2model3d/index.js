/**
 * 图生3D云函数
 * 将 2D 图像转换为 3D 模型
 */
const cloud = require('@cloudbase/node-sdk');
const crypto = require('crypto');

const app = cloud.init({
  env: cloud.SYMBOL_CURRENT_ENV,
});

const db = app.database();
const generationsCollection = db.collection('generations');
const tasksCollection = db.collection('tasks');

exports.main = async (event) => {
  const { action, ...params } = event;

  try {
    if (action === 'progress') {
      return await getProgress(params.taskId);
    }

    // 默认为生成 3D 模型
    return await generate3DModel(params);
  } catch (error) {
    console.error('图生3D操作失败:', error);
    return { success: false, message: error.message || '操作失败' };
  }
};

/**
 * 生成 3D 模型
 */
async function generate3DModel(params) {
  const { imageId, imageUrl, modelId, format, quality } = params;

  // 验证参数
  if (!imageUrl || !modelId) {
    return { success: false, message: '缺少必填参数' };
  }

  // 获取模型信息和凭证
  const modelProxy = require('../modelProxy');
  const model = await modelProxy.getModelById(modelId);

  if (!model || model.status !== 'active') {
    return { success: false, message: '模型不可用' };
  }

  const credentials = await modelProxy.getModelCredentials(modelId);

  // 创建任务记录
  const taskId = generateTaskId();
  const now = new Date();

  await tasksCollection.add({
    _id: taskId,
    type: 'img2model3d',
    status: 'processing',
    progress: 0,
    params: { imageId, imageUrl, modelId, format, quality },
    modelName: model.name,
    createdAt: now,
    updatedAt: now,
  });

  // 异步调用 AI 模型 API
  process3DGeneration(taskId, {
    imageId,
    imageUrl,
    format,
    quality,
    model,
    credentials,
  });

  return { success: true, taskId };
}

/**
 * 异步处理 3D 模型生成
 */
async function process3DGeneration(taskId, params) {
  const { imageId, imageUrl, format, quality, model, credentials } = params;

  try {
    // 更新进度
    await updateTaskProgress(taskId, 10, 'processing', '正在分析图像...');

    // 模拟 3D 生成过程
    await sleep(2000);
    await updateTaskProgress(taskId, 30, 'processing', '正在生成 3D 网格...');

    await sleep(2000);
    await updateTaskProgress(taskId, 50, 'processing', '正在优化模型...');

    await sleep(2000);
    await updateTaskProgress(taskId, 70, 'processing', '正在生成纹理...');

    await sleep(2000);
    await updateTaskProgress(taskId, 90, 'processing', '正在导出模型...');

    // 根据不同提供商调用不同的 API
    let modelResult;

    if (model.provider === 'hunyuan') {
      modelResult = await callHunyuan3DAPI({
        apiUrl: model.apiUrl,
        accessKey: credentials.accessKey,
        secretKey: credentials.secretKey,
        imageUrl,
        format,
        quality,
      });
    } else if (model.provider === 'doubao') {
      modelResult = await callDoubao3DAPI({
        apiUrl: model.apiUrl,
        accessKey: credentials.accessKey,
        secretKey: credentials.secretKey,
        imageUrl,
        format,
        quality,
      });
    } else {
      modelResult = await callCustom3DAPI({
        apiUrl: model.apiUrl,
        accessKey: credentials.accessKey,
        secretKey: credentials.secretKey,
        imageUrl,
        format,
        quality,
      });
    }

    // 计算价格
    const price = calculatePrice(format, quality);

    // 保存生成结果
    const model3DId = generateTaskId();
    const model3DData = {
      _id: model3DId,
      type: '3d',
      sourceImageId: imageId,
      sourceImageUrl: imageUrl,
      modelUrl: modelResult.url,
      format,
      quality,
      modelId: model._id,
      modelName: model.name,
      taskId,
      price,
      status: 'completed',
      createdAt: new Date(),
    };

    await generationsCollection.add(model3DData);

    // 完成任务
    await tasksCollection.doc(taskId).update({
      status: 'completed',
      progress: 100,
      model: {
        id: model3DId,
        sourceImageId: imageId,
        sourceImageUrl: imageUrl,
        modelUrl: modelResult.url,
        format,
        quality,
        modelId: model._id,
        modelName: model.name,
        price,
        status: 'completed',
        createdAt: model3DData.createdAt,
      },
      updatedAt: new Date(),
    });

  } catch (error) {
    console.error('3D 模型生成失败:', error);
    await tasksCollection.doc(taskId).update({
      status: 'failed',
      message: error.message || '生成失败',
      updatedAt: new Date(),
    });
  }
}

/**
 * 调用混元 3D API
 */
async function callHunyuan3DAPI(params) {
  // 模拟 API 调用
  await sleep(1000);

  return {
    url: `https://example.com/models/${Date.now()}.${params.format.toLowerCase()}`,
  };
}

/**
 * 调用豆包 3D API
 */
async function callDoubao3DAPI(params) {
  // 模拟 API 调用
  await sleep(1000);

  return {
    url: `https://example.com/models/${Date.now()}.${params.format.toLowerCase()}`,
  };
}

/**
 * 调用自定义 3D API
 */
async function callCustom3DAPI(params) {
  // 模拟 API 调用
  await sleep(1000);

  return {
    url: `https://example.com/models/${Date.now()}.${params.format.toLowerCase()}`,
  };
}

/**
 * 计算价格
 */
function calculatePrice(format, quality) {
  const qualityPrices = {
    low: 5,
    medium: 10,
    high: 15,
  };

  const formatPrices = {
    GLB: 0,
    OBJ: 2,
    FBX: 5,
    GLTF: 0,
  };

  const basePrice = qualityPrices[quality] || 10;
  const formatExtra = formatPrices[format] || 0;

  return basePrice + formatExtra;
}

/**
 * 获取任务进度
 */
async function getProgress(taskId) {
  const result = await tasksCollection.doc(taskId).get();

  if (!result.data) {
    return { success: false, message: '任务不存在' };
  }

  const task = result.data;
  return {
    success: true,
    data: {
      progress: task.progress || 0,
      status: task.status,
      message: task.message,
      model: task.model,
    },
  };
}

/**
 * 更新任务进度
 */
async function updateTaskProgress(taskId, progress, status, message) {
  await tasksCollection.doc(taskId).update({
    progress,
    status,
    message,
    updatedAt: new Date(),
  });
}

/**
 * 生成任务 ID
 */
function generateTaskId() {
  return crypto.randomBytes(16).toString('hex');
}

/**
 * 延迟函数
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
