import React from 'react';
import { Icon } from 'tdesign-icons-react';
import styles from './StatusIndicator.module.css';

type StatusType = 'idle' | 'loading' | 'success' | 'error' | 'warning';

interface StatusIndicatorProps {
  status: StatusType;
  message?: string;
  size?: 'small' | 'medium' | 'large';
  showIcon?: boolean;
}

/**
 * 状态指示器组件
 * 用于显示操作状态
 */
export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  message,
  size = 'medium',
  showIcon = true,
}) => {
  const iconMap: Record<StatusType, string> = {
    idle: 'info-circle',
    loading: 'loading',
    success: 'check-circle',
    error: 'error-circle',
    warning: 'info-circle',
  };

  const sizeMap = {
    small: '14px',
    medium: '18px',
    large: '24px',
  };

  return (
    <div className={`${styles.indicator} ${styles[status]} ${styles[size]}`}>
      {showIcon && (
        <Icon
          name={iconMap[status]}
          size={sizeMap[size]}
          className={status === 'loading' ? styles.spinning : ''}
        />
      )}
      {message && <span className={styles.message}>{message}</span>}
    </div>
  );
};
