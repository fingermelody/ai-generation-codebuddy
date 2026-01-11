/**
 * 模型管理云函数
 * 负责管理 AI 模型配置，包括 URL、AK/SK 等敏感信息
 */
const cloud = require('@cloudbase/node-sdk');

const app = cloud.init({
  env: cloud.SYMBOL_CURRENT_ENV,
});

const db = app.database();
const modelsCollection = db.collection('models');
const credentialsCollection = db.collection('model_credentials');

exports.main = async (event) => {
  const { action, ...params } = event;

  try {
    switch (action) {
      case 'list':
        return await listModels();
      case 'listAdmin':
        return await listModelsAdmin();
      case 'add':
        return await addModel(params.config);
      case 'update':
        return await updateModel(params.id, params.updates);
      case 'delete':
        return await deleteModel(params.id);
      case 'toggleStatus':
        return await toggleModelStatus(params.id, params.status);
      default:
        return { success: false, message: '未知操作' };
    }
  } catch (error) {
    console.error('模型管理操作失败:', error);
    return { success: false, message: error.message || '操作失败' };
  }
};

/**
 * 获取可用模型列表（前端可见，不含敏感信息）
 */
async function listModels() {
  const result = await modelsCollection
    .where({ status: db.command.neq('deleted') })
    .field({
      _id: true,
      name: true,
      type: true,
      provider: true,
      status: true,
      latency: true,
    })
    .get();

  const models = result.data.map((item) => ({
    id: item._id,
    name: item.name,
    type: item.type,
    provider: item.provider,
    status: item.status,
    latency: item.latency,
  }));

  return { success: true, data: models };
}

/**
 * 管理员：获取完整模型配置列表
 */
async function listModelsAdmin() {
  const result = await modelsCollection
    .where({ status: db.command.neq('deleted') })
    .get();

  const models = result.data.map((item) => ({
    id: item._id,
    name: item.name,
    type: item.type,
    provider: item.provider,
    apiUrl: item.apiUrl,
    status: item.status,
    latency: item.latency,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  }));

  return { success: true, data: models };
}

/**
 * 添加模型配置
 */
async function addModel(config) {
  const { name, type, provider, apiUrl, accessKey, secretKey } = config;

  // 验证必填字段
  if (!name || !type || !provider || !apiUrl || !accessKey || !secretKey) {
    return { success: false, message: '缺少必填字段' };
  }

  const now = new Date();

  // 创建模型记录
  const modelResult = await modelsCollection.add({
    name,
    type,
    provider,
    apiUrl,
    status: 'active',
    latency: null,
    createdAt: now,
    updatedAt: now,
  });

  const modelId = modelResult.id;

  // 创建凭证记录（加密存储）
  await credentialsCollection.add({
    modelId,
    accessKey: encryptCredential(accessKey),
    secretKey: encryptCredential(secretKey),
    createdAt: now,
    updatedAt: now,
  });

  return {
    success: true,
    data: {
      id: modelId,
      name,
      type,
      provider,
      apiUrl,
      status: 'active',
      createdAt: now,
      updatedAt: now,
    },
  };
}

/**
 * 更新模型配置
 */
async function updateModel(id, updates) {
  const { name, type, provider, apiUrl, accessKey, secretKey } = updates;

  const now = new Date();
  const modelUpdates = { updatedAt: now };

  if (name) modelUpdates.name = name;
  if (type) modelUpdates.type = type;
  if (provider) modelUpdates.provider = provider;
  if (apiUrl) modelUpdates.apiUrl = apiUrl;

  // 更新模型记录
  await modelsCollection.doc(id).update(modelUpdates);

  // 如果提供了新的凭证，更新凭证记录
  if (accessKey || secretKey) {
    const credentialUpdates = { updatedAt: now };
    if (accessKey) credentialUpdates.accessKey = encryptCredential(accessKey);
    if (secretKey) credentialUpdates.secretKey = encryptCredential(secretKey);

    await credentialsCollection
      .where({ modelId: id })
      .update(credentialUpdates);
  }

  // 获取更新后的模型信息
  const result = await modelsCollection.doc(id).get();

  return {
    success: true,
    data: {
      id: result.data._id,
      ...result.data,
    },
  };
}

/**
 * 删除模型配置
 */
async function deleteModel(id) {
  // 软删除模型
  await modelsCollection.doc(id).update({
    status: 'deleted',
    updatedAt: new Date(),
  });

  // 删除凭证
  await credentialsCollection.where({ modelId: id }).remove();

  return { success: true };
}

/**
 * 切换模型状态
 */
async function toggleModelStatus(id, status) {
  await modelsCollection.doc(id).update({
    status,
    updatedAt: new Date(),
  });

  return { success: true };
}

/**
 * 获取模型凭证（内部使用）
 */
async function getModelCredentials(modelId) {
  const result = await credentialsCollection
    .where({ modelId })
    .limit(1)
    .get();

  if (result.data.length === 0) {
    throw new Error('模型凭证不存在');
  }

  const credential = result.data[0];
  return {
    accessKey: decryptCredential(credential.accessKey),
    secretKey: decryptCredential(credential.secretKey),
  };
}

/**
 * 简单加密（生产环境应使用更安全的加密方式）
 */
function encryptCredential(value) {
  // 这里使用简单的 Base64 编码，生产环境应使用 AES 等加密算法
  return Buffer.from(value).toString('base64');
}

/**
 * 解密凭证
 */
function decryptCredential(value) {
  return Buffer.from(value, 'base64').toString('utf-8');
}

// 导出内部函数供其他云函数使用
module.exports.getModelCredentials = getModelCredentials;
module.exports.getModelById = async (modelId) => {
  const result = await modelsCollection.doc(modelId).get();
  return result.data;
};
