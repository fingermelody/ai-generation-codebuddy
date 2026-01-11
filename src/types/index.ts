// AI 模型配置类型
export interface AIModelConfig {
  id: string;
  name: string;
  type: 'text2img' | 'img2model3d';
  provider: 'hunyuan' | 'doubao' | 'custom';
  apiUrl: string;
  status: 'active' | 'inactive' | 'error';
  latency?: number;
  createdAt: Date;
  updatedAt: Date;
}

// 模型凭证（仅后端使用，前端不可见）
export interface ModelCredentials {
  modelId: string;
  accessKey: string;
  secretKey: string;
}

// 前端可见的模型信息
export interface ModelInfo {
  id: string;
  name: string;
  type: 'text2img' | 'img2model3d';
  provider: string;
  status: 'active' | 'inactive' | 'error';
  latency?: number;
}

// 生成参数
export interface GenerationParams {
  prompt: string;
  negativePrompt?: string;
  resolution: '512x512' | '1024x1024';
  count: number;
  modelId: string;
}

// 3D 生成参数
export interface Model3DParams {
  imageId: string;
  imageUrl: string;
  modelId: string;
  format: 'GLB' | 'OBJ' | 'FBX' | 'GLTF';
  quality: 'low' | 'medium' | 'high';
}

// 生成的图像
export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  modelId: string;
  modelName: string;
  resolution: string;
  createdAt: Date;
  status: 'generating' | 'completed' | 'failed';
}

// 生成的 3D 模型
export interface Generated3DModel {
  id: string;
  sourceImageId: string;
  sourceImageUrl: string;
  modelUrl?: string;
  format: string;
  quality: string;
  modelId: string;
  modelName: string;
  createdAt: Date;
  status: 'generating' | 'completed' | 'failed';
  price: number;
}

// 历史记录
export interface HistoryItem {
  id: string;
  type: 'image' | '3d';
  title: string;
  thumbnailUrl?: string;
  modelName: string;
  createdAt: Date;
}

// 订单
export interface Order {
  id: string;
  userId: string;
  resourceId: string;
  resourceType: 'image' | 'model3d';
  amount: number;
  status: 'pending' | 'paid' | 'refunded' | 'expired';
  payMethod?: 'wechat' | 'alipay';
  transactionId?: string;
  createdAt: Date;
  paidAt?: Date;
}

// 下载权限
export interface DownloadPermission {
  id: string;
  userId: string;
  resourceId: string;
  orderId: string;
  downloadCount: number;
  maxDownloads: number;
  expiresAt: Date;
}

// 支付请求
export interface PaymentRequest {
  resourceId: string;
  resourceType: 'image' | 'model3d';
  payMethod: 'wechat' | 'alipay';
}

// 支付响应
export interface PaymentResponse {
  orderId: string;
  payUrl?: string;
  qrCode?: string;
  amount: number;
}

// 生成进度
export interface GenerationProgress {
  taskId: string;
  progress: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  estimatedTime?: number;
  message?: string;
}

// Toast 通知类型
export type ToastType = 'success' | 'error' | 'loading' | 'info';

// UI 反馈状态
export interface UIFeedback {
  type: ToastType;
  message: string;
  duration?: number;
}

// 管理员模型配置表单
export interface ModelConfigForm {
  name: string;
  type: 'text2img' | 'img2model3d';
  provider: 'hunyuan' | 'doubao' | 'custom';
  apiUrl: string;
  accessKey: string;
  secretKey: string;
}
