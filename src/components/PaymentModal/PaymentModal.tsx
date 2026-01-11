import React from 'react';
import { useAppStore } from '@/stores/appStore';
import { usePayment } from '@/hooks/usePayment';
import { Icon } from 'tdesign-icons-react';
import { Button } from 'tdesign-react';
import styles from './PaymentModal.module.css';

export const PaymentModal: React.FC = () => {
  const { outputFormat, modelQuality } = useAppStore();

  const {
    isPaymentModalOpen,
    selectedPayMethod,
    isProcessing,
    qrCode,
    price,
    closePaymentModal,
    setSelectedPayMethod,
    createOrder,
  } = usePayment();

  if (!isPaymentModalOpen) return null;

  const qualityLabels = {
    low: '低精度',
    medium: '中精度',
    high: '高精度',
  };

  return (
    <div
      className={`${styles.modalOverlay} ${isPaymentModalOpen ? styles.active : ''}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) closePaymentModal();
      }}
    >
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>确认支付</h2>
          <button className={styles.modalClose} onClick={closePaymentModal}>
            <Icon name="close" />
          </button>
        </div>

        {/* 支付方式选择 */}
        <div className={styles.paymentOptions}>
          <div
            className={`${styles.paymentOption} ${
              selectedPayMethod === 'wechat' ? styles.selected : ''
            }`}
            onClick={() => setSelectedPayMethod('wechat')}
          >
            <div className={`${styles.paymentOptionIcon} ${styles.wechat}`}>
              <Icon name="logo-wechat" size="24px" />
            </div>
            <div className={styles.paymentOptionInfo}>
              <div className={styles.paymentOptionName}>微信支付</div>
              <div className={styles.paymentOptionDesc}>扫码或确认支付</div>
            </div>
            <div className={styles.paymentOptionCheck}>
              {selectedPayMethod === 'wechat' && (
                <Icon name="check" size="12px" style={{ color: 'white' }} />
              )}
            </div>
          </div>

          <div
            className={`${styles.paymentOption} ${
              selectedPayMethod === 'alipay' ? styles.selected : ''
            }`}
            onClick={() => setSelectedPayMethod('alipay')}
          >
            <div className={`${styles.paymentOptionIcon} ${styles.alipay}`}>
              <span style={{ fontSize: '14px', fontWeight: 600 }}>支付宝</span>
            </div>
            <div className={styles.paymentOptionInfo}>
              <div className={styles.paymentOptionName}>支付宝</div>
              <div className={styles.paymentOptionDesc}>扫码或跳转支付</div>
            </div>
            <div className={styles.paymentOptionCheck}>
              {selectedPayMethod === 'alipay' && (
                <Icon name="check" size="12px" style={{ color: 'white' }} />
              )}
            </div>
          </div>
        </div>

        {/* 二维码展示区域 */}
        {qrCode && (
          <div className={styles.qrCodeSection}>
            <img src={qrCode} alt="支付二维码" className={styles.qrCodeImage} />
            <p className={styles.qrCodeTip}>请使用{selectedPayMethod === 'wechat' ? '微信' : '支付宝'}扫码支付</p>
          </div>
        )}

        {/* 订单摘要 */}
        <div className={styles.orderSummary}>
          <div className={styles.orderItem}>
            <span>商品</span>
            <span>3D 模型</span>
          </div>
          <div className={styles.orderItem}>
            <span>格式</span>
            <span>{outputFormat} ({qualityLabels[modelQuality]})</span>
          </div>
          <div className={styles.orderItem}>
            <span>下载次数</span>
            <span>3 次</span>
          </div>
          <div className={styles.orderItem}>
            <span>应付金额</span>
            <span className={styles.amount}>¥{price.toFixed(2)}</span>
          </div>
        </div>

        {/* 确认支付按钮 */}
        <Button
          className={styles.confirmPaymentBtn}
          theme="primary"
          size="large"
          block
          loading={isProcessing}
          onClick={createOrder}
        >
          {isProcessing ? (
            '处理中...'
          ) : (
            <>
              <Icon name="lock-on" />
              确认支付 ¥{price.toFixed(2)}
            </>
          )}
        </Button>

        {/* 支付提示 */}
        <p className={styles.paymentTip}>
          支付即表示同意《用户服务协议》和《隐私政策》
        </p>
      </div>
    </div>
  );
};
