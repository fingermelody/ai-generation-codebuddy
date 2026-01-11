import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';

interface LoadingState {
  visible: boolean;
  message: string;
  progress?: number;
}

interface ConfirmState {
  visible: boolean;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'danger';
  onConfirm: () => void;
}

/**
 * UI 反馈 Hook
 * 统一管理加载状态、确认对话框、Toast 通知
 */
export function useUIFeedback() {
  const [loading, setLoading] = useState<LoadingState>({
    visible: false,
    message: '',
    progress: undefined,
  });

  const [confirm, setConfirm] = useState<ConfirmState>({
    visible: false,
    title: '',
    message: '',
    type: 'info',
    onConfirm: () => {},
  });

  // 显示加载状态
  const showLoading = useCallback((message: string, progress?: number) => {
    setLoading({ visible: true, message, progress });
  }, []);

  // 更新加载进度
  const updateLoadingProgress = useCallback((progress: number, message?: string) => {
    setLoading((prev) => ({
      ...prev,
      progress,
      message: message || prev.message,
    }));
  }, []);

  // 隐藏加载状态
  const hideLoading = useCallback(() => {
    setLoading({ visible: false, message: '', progress: undefined });
  }, []);

  // 显示确认对话框
  const showConfirm = useCallback(
    (options: {
      title?: string;
      message: string;
      type?: 'info' | 'warning' | 'danger';
      onConfirm: () => void;
    }) => {
      setConfirm({
        visible: true,
        title: options.title || '确认操作',
        message: options.message,
        type: options.type || 'info',
        onConfirm: options.onConfirm,
      });
    },
    []
  );

  // 隐藏确认对话框
  const hideConfirm = useCallback(() => {
    setConfirm((prev) => ({ ...prev, visible: false }));
  }, []);

  // 成功通知
  const notifySuccess = useCallback((message: string) => {
    toast.success(message, {
      icon: '✓',
      style: {
        background: 'var(--color-surface)',
        color: 'var(--color-success)',
        border: '1px solid var(--color-success)',
      },
    });
  }, []);

  // 错误通知
  const notifyError = useCallback((message: string) => {
    toast.error(message, {
      icon: '✕',
      style: {
        background: 'var(--color-surface)',
        color: 'var(--color-error)',
        border: '1px solid var(--color-error)',
      },
    });
  }, []);

  // 警告通知
  const notifyWarning = useCallback((message: string) => {
    toast(message, {
      icon: '⚠',
      style: {
        background: 'var(--color-surface)',
        color: 'var(--color-warning)',
        border: '1px solid var(--color-warning)',
      },
    });
  }, []);

  // 信息通知
  const notifyInfo = useCallback((message: string) => {
    toast(message, {
      icon: 'ℹ',
      style: {
        background: 'var(--color-surface)',
        color: 'var(--color-primary)',
        border: '1px solid var(--color-primary)',
      },
    });
  }, []);

  // 带进度的加载通知
  const notifyLoading = useCallback((message: string) => {
    return toast.loading(message, {
      style: {
        background: 'var(--color-surface)',
        color: 'var(--color-text)',
        border: '1px solid var(--color-border)',
      },
    });
  }, []);

  // 关闭指定通知
  const dismissNotify = useCallback((toastId: string) => {
    toast.dismiss(toastId);
  }, []);

  return {
    // 加载状态
    loading,
    showLoading,
    updateLoadingProgress,
    hideLoading,

    // 确认对话框
    confirm,
    showConfirm,
    hideConfirm,

    // Toast 通知
    notifySuccess,
    notifyError,
    notifyWarning,
    notifyInfo,
    notifyLoading,
    dismissNotify,
  };
}
