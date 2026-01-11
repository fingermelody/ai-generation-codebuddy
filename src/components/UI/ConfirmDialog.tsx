import React from 'react';
import { Icon } from 'tdesign-icons-react';
import { Button } from 'tdesign-react';
import styles from './ConfirmDialog.module.css';

interface ConfirmDialogProps {
  visible: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'info' | 'warning' | 'danger';
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

/**
 * 确认对话框组件
 * 用于需要用户确认的操作
 */
export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  visible,
  title = '确认操作',
  message,
  confirmText = '确认',
  cancelText = '取消',
  type = 'info',
  onConfirm,
  onCancel,
  loading = false,
}) => {
  if (!visible) return null;

  const iconMap = {
    info: 'info-circle-filled',
    warning: 'error-circle-filled',
    danger: 'close-circle-filled',
  };

  const themeMap = {
    info: 'primary',
    warning: 'warning',
    danger: 'danger',
  } as const;

  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
        <div className={`${styles.icon} ${styles[type]}`}>
          <Icon name={iconMap[type]} size="48px" />
        </div>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.message}>{message}</p>
        <div className={styles.actions}>
          <Button variant="outline" onClick={onCancel} disabled={loading}>
            {cancelText}
          </Button>
          <Button
            theme={themeMap[type]}
            onClick={onConfirm}
            loading={loading}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};
