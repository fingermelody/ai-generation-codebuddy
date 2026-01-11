/**
 * 文生图云函数
 * 调用 AI 模型 API 生成图像
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

    // 默认为生成图像
    return await generateImages(params);
  } catch (error) {
    console.error('文生图操作失败:', error);
    return { success: false, message: error.message || '操作失败' };
  }
};

/**
 * 生成图像
 */
async function generateImages(params) {
  const { prompt, negativePrompt, resolution, count, modelId } = params;

  // 验证参数
  if (!prompt || !modelId) {
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
    type: 'text2img',
    status: 'processing',
    progress: 0,
    params: { prompt, negativePrompt, resolution, count, modelId },
    modelName: model.name,
    createdAt: now,
    updatedAt: now,
  });

  // 异步调用 AI 模型 API
  processImageGeneration(taskId, {
    prompt,
    negativePrompt,
    resolution,
    count,
    model,
    credentials,
  });

  return { success: true, taskId };
}

/**
 * 异步处理图像生成
 */
async function processImageGeneration(taskId, params) {
  const { prompt, negativePrompt, resolution, count, model, credentials } = params;

  try {
    // 更新进度
    await updateTaskProgress(taskId, 10, 'processing', '正在连接 AI 模型...');

    // 解析分辨率
    const [width, height] = resolution.split('x').map(Number);

    // 根据不同提供商调用不同的 API
    let images = [];

    if (model.provider === 'hunyuan') {
      images = await callHunyuanAPI({
        apiUrl: model.apiUrl,
        accessKey: credentials.accessKey,
        secretKey: credentials.secretKey,
        prompt,
        negativePrompt,
        width,
        height,
        count,
      });
    } else if (model.provider === 'doubao') {
      images = await callDoubaoAPI({
        apiUrl: model.apiUrl,
        accessKey: credentials.accessKey,
        secretKey: credentials.secretKey,
        prompt,
        negativePrompt,
        width,
        height,
        count,
      });
    } else {
      // 自定义模型
      images = await callCustomAPI({
        apiUrl: model.apiUrl,
        accessKey: credentials.accessKey,
        secretKey: credentials.secretKey,
        prompt,
        negativePrompt,
        width,
        height,
        count,
      });
    }

    // 保存生成结果
    const generatedImages = [];
    for (let i = 0; i < images.length; i++) {
      const imageId = generateTaskId();
      const imageData = {
        _id: imageId,
        type: 'image',
        url: images[i].url,
        prompt,
        negativePrompt,
        resolution,
        modelId: model._id,
        modelName: model.name,
        taskId,
        status: 'completed',
        createdAt: new Date(),
      };

      await generationsCollection.add(imageData);
      generatedImages.push({
        id: imageId,
        url: images[i].url,
        prompt,
        modelId: model._id,
        modelName: model.name,
        resolution,
        createdAt: imageData.createdAt,
        status: 'completed',
      });

      // 更新进度
      const progress = 30 + Math.floor((i + 1) / images.length * 70);
      await updateTaskProgress(taskId, progress, 'processing', `已生成 ${i + 1}/${images.length} 张图像`);
    }

    // 完成任务
    await tasksCollection.doc(taskId).update({
      status: 'completed',
      progress: 100,
      images: generatedImages,
      updatedAt: new Date(),
    });

  } catch (error) {
    console.error('图像生成失败:', error);
    await tasksCollection.doc(taskId).update({
      status: 'failed',
      message: error.message || '生成失败',
      updatedAt: new Date(),
    });
  }
}

/**
 * 调用混元 API
 */
async function callHunyuanAPI(params) {
  const { apiUrl, accessKey, secretKey, prompt, negativePrompt, width, height, count } = params;

  // 模拟 API 调用（实际实现需要根据混元 API 文档）
  // 这里返回模拟数据
  await sleep(3000);

  const images = [];
  for (let i = 0; i < count; i++) {
    images.push({
      url: `https://picsum.photos/seed/${Date.now() + i}/${width}/${height}`,
    });
  }

  return images;
}

/**
 * 调用豆包 API
 */
async function callDoubaoAPI(params) {
  const { apiUrl, accessKey, secretKey, prompt, negativePrompt, width, height, count } = params;

  // 模拟 API 调用
  await sleep(3000);

  const images = [];
  for (let i = 0; i < count; i++) {
    images.push({
      url: `https://picsum.photos/seed/${Date.now() + i + 100}/${width}/${height}`,
    });
  }

  return images;
}

/**
 * 调用自定义 API
 */
async function callCustomAPI(params) {
  const { apiUrl, accessKey, secretKey, prompt, negativePrompt, width, height, count } = params;

  // 模拟 API 调用
  await sleep(2000);

  const images = [];
  for (let i = 0; i < count; i++) {
    images.push({
      url: `https://picsum.photos/seed/${Date.now() + i + 200}/${width}/${height}`,
    });
  }

  return images;
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
      images: task.images,
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
