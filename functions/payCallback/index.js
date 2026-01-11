/**
 * 支付回调云函数
 * 处理微信/支付宝支付异步通知
 */
const cloud = require('@cloudbase/node-sdk');
const crypto = require('crypto');

const app = cloud.init({
  env: cloud.SYMBOL_CURRENT_ENV,
});

const db = app.database();
const ordersCollection = db.collection('orders');
const permissionsCollection = db.collection('download_permissions');

exports.main = async (event) => {
  const { payMethod, ...params } = event;

  try {
    if (payMethod === 'wechat') {
      return await handleWechatCallback(params);
    } else if (payMethod === 'alipay') {
      return await handleAlipayCallback(params);
    } else {
      return { success: false, message: '未知支付方式' };
    }
  } catch (error) {
    console.error('支付回调处理失败:', error);
    return { success: false, message: error.message || '处理失败' };
  }
};

/**
 * 处理微信支付回调
 */
async function handleWechatCallback(params) {
  const { resource } = params;

  // 验证签名（实际实现需要根据微信支付文档）
  // const isValid = verifyWechatSignature(params);
  // if (!isValid) {
  //   return { code: 'FAIL', message: '签名验证失败' };
  // }

  // 解密数据（实际实现需要使用 AES-256-GCM 解密）
  // const decrypted = decryptWechatData(resource.ciphertext, resource.nonce, resource.associated_data);
  // const data = JSON.parse(decrypted);

  // 模拟解密后的数据
  const data = {
    out_trade_no: params.out_trade_no || 'test_order',
    transaction_id: params.transaction_id || `WX${Date.now()}`,
    trade_state: params.trade_state || 'SUCCESS',
    success_time: new Date().toISOString(),
  };

  if (data.trade_state !== 'SUCCESS') {
    return { code: 'SUCCESS', message: '支付未成功' };
  }

  // 更新订单状态
  await updateOrderStatus(data.out_trade_no, {
    status: 'paid',
    transactionId: data.transaction_id,
    paidAt: new Date(data.success_time),
  });

  return { code: 'SUCCESS', message: '处理成功' };
}

/**
 * 处理支付宝回调
 */
async function handleAlipayCallback(params) {
  // 验证签名（实际实现需要根据支付宝文档）
  // const isValid = verifyAlipaySignature(params);
  // if (!isValid) {
  //   return 'fail';
  // }

  const { out_trade_no, trade_no, trade_status } = params;

  if (trade_status !== 'TRADE_SUCCESS' && trade_status !== 'TRADE_FINISHED') {
    return 'success';
  }

  // 更新订单状态
  await updateOrderStatus(out_trade_no, {
    status: 'paid',
    transactionId: trade_no,
    paidAt: new Date(),
  });

  return 'success';
}

/**
 * 更新订单状态
 */
async function updateOrderStatus(orderId, updates) {
  // 获取订单信息
  const orderResult = await ordersCollection.doc(orderId).get();
  if (!orderResult.data) {
    throw new Error('订单不存在');
  }

  const order = orderResult.data;

  // 检查订单状态，防止重复处理
  if (order.status === 'paid') {
    console.log('订单已支付，跳过处理');
    return;
  }

  // 更新订单状态
  await ordersCollection.doc(orderId).update({
    ...updates,
    updatedAt: new Date(),
  });

  // 创建下载权限
  await createDownloadPermission(orderId, order.resourceId);
}

/**
 * 创建下载权限
 */
async function createDownloadPermission(orderId, resourceId) {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7天有效期

  await permissionsCollection.add({
    orderId,
    resourceId,
    downloadCount: 0,
    maxDownloads: 3,
    createdAt: now,
    expiresAt,
  });
}

/**
 * 验证微信支付签名
 */
function verifyWechatSignature(params) {
  // 实际实现需要根据微信支付 V3 文档
  // 使用商户 API 证书验证签名
  return true;
}

/**
 * 验证支付宝签名
 */
function verifyAlipaySignature(params) {
  // 实际实现需要根据支付宝文档
  // 使用支付宝公钥验证签名
  return true;
}

/**
 * 解密微信支付数据
 */
function decryptWechatData(ciphertext, nonce, associatedData) {
  // 实际实现需要使用 AES-256-GCM 解密
  // const key = process.env.WECHAT_API_V3_KEY;
  // const decipher = crypto.createDecipheriv('aes-256-gcm', key, nonce);
  // decipher.setAuthTag(Buffer.from(ciphertext.slice(-16), 'base64'));
  // decipher.setAAD(Buffer.from(associatedData));
  // return decipher.update(ciphertext.slice(0, -16), 'base64', 'utf8') + decipher.final('utf8');
  return '{}';
}
