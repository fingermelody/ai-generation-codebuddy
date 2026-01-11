/**
 * 订单查询云函数
 * 查询订单状态和下载权限
 */
const cloud = require('@cloudbase/node-sdk');

const app = cloud.init({
  env: cloud.SYMBOL_CURRENT_ENV,
});

const db = app.database();
const ordersCollection = db.collection('orders');
const permissionsCollection = db.collection('download_permissions');
const generationsCollection = db.collection('generations');

exports.main = async (event) => {
  const { orderId, action } = event;

  try {
    if (action === 'list') {
      return await listOrders(event);
    }

    if (!orderId) {
      return { success: false, message: '缺少订单号' };
    }

    return await getOrderStatus(orderId);
  } catch (error) {
    console.error('订单查询失败:', error);
    return { success: false, message: error.message || '查询失败' };
  }
};

/**
 * 获取订单状态
 */
async function getOrderStatus(orderId) {
  const result = await ordersCollection.doc(orderId).get();

  if (!result.data) {
    return { success: false, message: '订单不存在' };
  }

  const order = result.data;

  // 检查订单是否过期
  if (order.status === 'pending' && new Date() > new Date(order.expiredAt)) {
    await ordersCollection.doc(orderId).update({
      status: 'expired',
      updatedAt: new Date(),
    });
    order.status = 'expired';
  }

  // 如果已支付，获取下载链接
  let downloadUrl = null;
  if (order.status === 'paid') {
    const permission = await checkDownloadPermission(orderId, order.resourceId);
    if (permission && permission.downloadCount < permission.maxDownloads) {
      downloadUrl = await getDownloadUrl(order.resourceId);
    }
  }

  return {
    success: true,
    data: {
      orderId: order._id,
      status: order.status,
      amount: order.amount,
      payMethod: order.payMethod,
      createdAt: order.createdAt,
      paidAt: order.paidAt,
      downloadUrl,
    },
  };
}

/**
 * 获取用户订单列表
 */
async function listOrders(params) {
  const { limit = 20, offset = 0 } = params;

  const result = await ordersCollection
    .orderBy('createdAt', 'desc')
    .skip(offset)
    .limit(limit)
    .get();

  const orders = result.data.map((order) => ({
    orderId: order._id,
    resourceId: order.resourceId,
    resourceType: order.resourceType,
    amount: order.amount,
    status: order.status,
    payMethod: order.payMethod,
    createdAt: order.createdAt,
    paidAt: order.paidAt,
  }));

  return { success: true, data: orders };
}

/**
 * 检查下载权限
 */
async function checkDownloadPermission(orderId, resourceId) {
  const result = await permissionsCollection
    .where({ orderId, resourceId })
    .limit(1)
    .get();

  return result.data[0] || null;
}

/**
 * 获取下载链接
 */
async function getDownloadUrl(resourceId) {
  const result = await generationsCollection.doc(resourceId).get();

  if (!result.data) {
    return null;
  }

  const resource = result.data;
  
  // 如果是图片，返回图片 URL
  if (resource.type === 'image') {
    return resource.url;
  }

  // 如果是 3D 模型，返回模型 URL
  return resource.modelUrl;
}
