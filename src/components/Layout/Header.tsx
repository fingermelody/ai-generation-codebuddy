import React from 'react';
import { useModels } from '@/hooks/useModels';
import { Icon } from 'tdesign-icons-react';
import styles from './Header.module.css';

interface HeaderProps {
  onAdminClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onAdminClick }) => {
  const { currentImageModel, isLoadingModels } = useModels();

  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <div className={styles.logoIcon}>
          <Icon name="cube" size="20px" />
        </div>
        <span className={styles.logoText}>AI Create 3D</span>
      </div>

      <div className={styles.headerActions}>
        {/* 当前模型状态 */}
        <div className={styles.modelStatus}>
          <span
            className={`${styles.statusIndicator} ${
              currentImageModel?.status === 'active' ? styles.active : styles.inactive
            }`}
          />
          <span className={styles.modelName}>
            {isLoadingModels
              ? '加载中...'
              : currentImageModel?.name || '未选择模型'}
          </span>
        </div>

        {/* API 状态标签 */}
        <div
          className={`${styles.statusTag} ${
            currentImageModel?.status === 'active' ? styles.success : styles.warning
          }`}
        >
          <span className={styles.statusDot} />
          {currentImageModel?.status === 'active' ? 'API 正常' : 'API 异常'}
        </div>

        {/* 管理员入口 */}
        <button className={styles.adminBtn} onClick={onAdminClick} title="管理员配置">
          <Icon name="setting" size="18px" />
        </button>

        {/* 用户头像 */}
        <div className={styles.userAvatar}>
          <Icon name="user" size="16px" />
        </div>
      </div>
    </header>
  );
};
