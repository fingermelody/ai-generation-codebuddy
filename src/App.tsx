import React, { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { Header } from '@/components/Layout/Header';
import { LeftPanel } from '@/components/LeftPanel/LeftPanel';
import { CenterCanvas } from '@/components/CenterCanvas/CenterCanvas';
import { RightPanel } from '@/components/RightPanel/RightPanel';
import { PaymentModal } from '@/components/PaymentModal/PaymentModal';
import { AdminPanel } from '@/components/AdminPanel/AdminPanel';
import '@/styles/global.css';
import styles from './App.module.css';

const App: React.FC = () => {
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);

  return (
    <div className={styles.app}>
      {/* 背景效果 */}
      <div className="bg-pattern" />
      <div className="noise-overlay" />

      {/* 顶部导航 */}
      <Header onAdminClick={() => setIsAdminPanelOpen(true)} />

      {/* 主布局 */}
      <main className={styles.mainContainer}>
        {/* 左侧面板 - 提示词和参数 */}
        <LeftPanel />

        {/* 中央画布 - 图像展示 */}
        <CenterCanvas />

        {/* 右侧面板 - 3D 预览 */}
        <RightPanel />
      </main>

      {/* 支付弹窗 */}
      <PaymentModal />

      {/* 管理员面板 */}
      <AdminPanel
        visible={isAdminPanelOpen}
        onClose={() => setIsAdminPanelOpen(false)}
      />

      {/* Toast 通知 */}
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: 'var(--color-surface)',
            color: 'var(--color-text)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            fontFamily: 'var(--font-body)',
          },
          success: {
            iconTheme: {
              primary: 'var(--color-success)',
              secondary: 'white',
            },
          },
          error: {
            iconTheme: {
              primary: 'var(--color-error)',
              secondary: 'white',
            },
          },
        }}
      />
    </div>
  );
};

export default App;
