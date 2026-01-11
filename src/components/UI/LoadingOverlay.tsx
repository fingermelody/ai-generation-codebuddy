import React from 'react';
import { Icon } from 'tdesign-icons-react';
import styles from './LoadingOverlay.module.css';

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
  progress?: number;
  showProgress?: boolean;
}

/**
 * 全局加载遮罩组件
 * 用于显示加载状态和进度
 */
export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  visible,
  message = '加载中...',
  progress,
  showProgress = false,
}) => {
  if (!visible) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.content}>
        <div className={styles.spinner}>
          <Icon name="loading" size="48px" className={styles.spinning} />
        </div>
        <p className={styles.message}>{message}</p>
        {showProgress && progress !== undefined && (
          <div className={styles.progressContainer}>
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className={styles.progressText}>{Math.round(progress)}%</span>
          </div>
        )}
      </div>
    </div>
  );
};
