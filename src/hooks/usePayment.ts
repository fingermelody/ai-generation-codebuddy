import { useCallback, useRef, useState } from 'react';
import { useAppStore } from '@/stores/appStore';
import { createPaymentOrder, getOrderStatus } from '@/services/cloudbase';
import toast from 'react-hot-toast';

/**
 * 支付功能的 Hook
 */
export function usePayment() {
  const {
    current3DModel,
    selectedPayMethod,
    isPaymentModalOpen,
    setIsPaymentModalOpen,
    setSelectedPayMethod,
  } = useAppStore();

  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);

  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // 停止轮询
  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  // 打开支付弹窗
  const openPaymentModal = useCallback(() => {
    if (!current3DModel) {
      toast.error('请先生成 3D 模型');
      return;
    }
    setIsPaymentModalOpen(true);
  }, [current3DModel, setIsPaymentModalOpen]);

  // 关闭支付弹窗
  const closePaymentModal = useCallback(() => {
    setIsPaymentModalOpen(false);
    setPaymentUrl(null);
    setQrCode(null);
    setCurrentOrderId(null);
    stopPolling();
  }, [setIsPaymentModalOpen, stopPolling]);

  // 创建支付订单
  const createOrder = useCallback(async () => {
    if (!current3DModel) {
      toast.error('请先生成 3D 模型');
      return;
    }

    setIsProcessing(true);
    const loadingToast = toast.loading('正在创建订单...');

    try {
      const response = await createPaymentOrder({
        resourceId: current3DModel.id,
        resourceType: 'model3d',
        payMethod: selectedPayMethod,
      });

      setCurrentOrderId(response.orderId);

      if (response.qrCode) {
        setQrCode(response.qrCode);
      }
      if (response.payUrl) {
        setPaymentUrl(response.payUrl);
      }

      toast.dismiss(loadingToast);
      toast.success('订单创建成功，请完成支付');

      // 开始轮询订单状态
      pollingRef.current = setInterval(async () => {
        try {
          const status = await getOrderStatus(response.orderId);

          if (status.status === 'paid') {
            stopPolling();
            setIsProcessing(false);
            closePaymentModal();
            toast.success('支付成功！');

            // 自动开始下载
            if (status.downloadUrl) {
              window.open(status.downloadUrl, '_blank');
              toast.success('下载已开始');
            }
          } else if (status.status === 'expired') {
            stopPolling();
            setIsProcessing(false);
            toast.error('订单已过期，请重新下单');
          }
        } catch (error) {
          console.error('查询订单状态失败:', error);
        }
      }, 3000);
    } catch (error) {
      setIsProcessing(false);
      toast.dismiss(loadingToast);
      toast.error('创建订单失败，请重试');
      console.error('创建订单失败:', error);
    }
  }, [
    current3DModel,
    selectedPayMethod,
    stopPolling,
    closePaymentModal,
  ]);

  // 计算价格
  const calculatePrice = useCallback(() => {
    if (!current3DModel) return 0;

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

    const basePrice =
      qualityPrices[current3DModel.quality as keyof typeof qualityPrices] || 10;
    const formatExtra =
      formatPrices[current3DModel.format as keyof typeof formatPrices] || 0;

    return basePrice + formatExtra;
  }, [current3DModel]);

  return {
    // 状态
    isPaymentModalOpen,
    selectedPayMethod,
    isProcessing,
    paymentUrl,
    qrCode,
    currentOrderId,
    price: calculatePrice(),

    // 操作
    openPaymentModal,
    closePaymentModal,
    setSelectedPayMethod,
    createOrder,
    stopPolling,
  };
}
