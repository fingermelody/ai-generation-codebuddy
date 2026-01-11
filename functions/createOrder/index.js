/**
 * 创建订单云函数
 * 处理支付订单创建和支付接口调用
 */
const cloud = require('@cloudbase/node-sdk');
const crypto = require('crypto');

const app = cloud.init({
  env: cloud.SYMBOL_CURRENT_ENV,
});

const db = app.database();
const ordersCollection = db.collection('orders');
const generationsCollection = db.collection('generations');

exports.main = async (event) => {
  const { resourceId, resourceType, payMethod } = event;

  try {
    // 验证参数
    if (!resourceId || !resourceType || !payMethod) {
      return { success: false, message: '缺少必填参数' };
    }

    // 获取资源信息
    const resourceResult = await generationsCollection.doc(resourceId).get();
    if (!resourceResult.data) {
      return { success: false, message: '资源不存在' };
    }

    const resource = resourceResult.data;
    const amount = resource.price || calculatePrice(resourceType, resource);

    // 创建订单
    const orderId = generateOrderId();
    const now = new Date();
    const expiredAt = new Date(now.getTime() + 30 * 60 * 1000); // 30分钟过期

    const order = {
      _id: orderId,
      resourceId,
      resourceType,
      amount,
      status: 'pending',
      payMethod,
      createdAt: now,
      expiredAt,
    };

    await ordersCollection.add(order);

    // 调用支付接口
    let paymentResult;
    if (payMethod === 'wechat') {
      paymentResult = await createWechatPayment(orderId, amount, resourceType);
    } else if (payMethod === 'alipay') {
      paymentResult = await createAlipayPayment(orderId, amount, resourceType);
    } else {
      return { success: false, message: '不支持的支付方式' };
    }

    return {
      success: true,
      data: {
        orderId,
        amount,
        ...paymentResult,
      },
    };
  } catch (error) {
    console.error('创建订单失败:', error);
    return { success: false, message: error.message || '创建订单失败' };
  }
};

/**
 * 创建微信支付订单
 */
async function createWechatPayment(orderId, amount, resourceType) {
  // 这里应该调用微信支付 API
  // 由于需要商户号等配置，这里返回模拟数据
  
  // 实际实现示例：
  // const WxPay = require('wechatpay-node-v3');
  // const pay = new WxPay({
  //   appid: process.env.WECHAT_APPID,
  //   mchid: process.env.WECHAT_MCHID,
  //   publicKey: fs.readFileSync('./apiclient_cert.pem'),
  //   privateKey: fs.readFileSync('./apiclient_key.pem'),
  // });
  // 
  // const result = await pay.transactions_native({
  //   description: `${resourceType === 'image' ? '图片' : '3D模型'}下载`,
  //   out_trade_no: orderId,
  //   notify_url: 'https://your-domain.com/api/pay-callback',
  //   amount: { total: amount, currency: 'CNY' },
  // });

  return {
    payUrl: null,
    qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=weixin://wxpay/bizpayurl?pr=${orderId}`,
  };
}

/**
 * 创建支付宝支付订单
 */
async function createAlipayPayment(orderId, amount, resourceType) {
  // 这里应该调用支付宝 API
  // 由于需要商户配置，这里返回模拟数据
  
  // 实际实现示例：
  // const AlipaySdk = require('alipay-sdk').default;
  // const alipaySdk = new AlipaySdk({
  //   appId: process.env.ALIPAY_APPID,
  //   privateKey: process.env.ALIPAY_PRIVATE_KEY,
  //   alipayPublicKey: process.env.ALIPAY_PUBLIC_KEY,
  // });
  //
  // const result = await alipaySdk.exec('alipay.trade.page.pay', {
  //   bizContent: {
  //     out_trade_no: orderId,
  //     total_amount: (amount / 100).toFixed(2),
  //     subject: `${resourceType === 'image' ? '图片' : '3D模型'}下载`,
  //     product_code: 'FAST_INSTANT_TRADE_PAY',
  //   },
  //   returnUrl: 'https://your-domain.com/pay-success',
  //   notifyUrl: 'https://your-domain.com/api/pay-callback',
  // });

  return {
    payUrl: `https://openapi.alipay.com/gateway.do?out_trade_no=${orderId}`,
    qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=alipays://platformapi/startapp?appId=20000067%26url=${encodeURIComponent(`https://example.com/pay/${orderId}`)}`,
  };
}

/**
 * 计算价格（单位：分）
 */
function calculatePrice(resourceType, resource) {
  if (resourceType === 'image') {
    // 图片价格根据分辨率
    const resolution = resource.resolution || '512x512';
    return resolution === '1024x1024' ? 500 : 300; // 5元或3元
  } else {
    // 3D 模型价格根据精度和格式
    const qualityPrices = { low: 500, medium: 1000, high: 1500 };
    const formatPrices = { GLB: 0, OBJ: 200, FBX: 500, GLTF: 0 };
    
    const basePrice = qualityPrices[resource.quality] || 1000;
    const formatExtra = formatPrices[resource.format] || 0;
    
    return basePrice + formatExtra;
  }
}

/**
 * 生成订单号
 */
function generateOrderId() {
  const timestamp = Date.now().toString();
  const random = crypto.randomBytes(4).toString('hex');
  return `ORD${timestamp}${random}`.toUpperCase();
}
