import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage, useGLTF } from '@react-three/drei';
import { useAppStore } from '@/stores/appStore';
import { useModels } from '@/hooks/useModels';
import { usePayment } from '@/hooks/usePayment';
import { Icon } from 'tdesign-icons-react';
import { Select, Slider, Button } from 'tdesign-react';
import styles from './RightPanel.module.css';

// 3D 模型预览组件
const Model3DPreview: React.FC<{ url?: string }> = ({ url }) => {
  if (!url) {
    return (
      <mesh>
        <boxGeometry args={[2, 2, 2]} />
        <meshStandardMaterial color="#00D9FF" wireframe />
      </mesh>
    );
  }

  const { scene } = useGLTF(url);
  return <primitive object={scene} />;
};

// 占位符 3D 预览
const PlaceholderPreview: React.FC = () => {
  return (
    <mesh rotation={[0, 0, 0]}>
      <boxGeometry args={[2, 2, 2]} />
      <meshStandardMaterial
        color="#00D9FF"
        wireframe
        transparent
        opacity={0.6}
      />
    </mesh>
  );
};

export const RightPanel: React.FC = () => {
  const {
    outputFormat,
    modelQuality,
    current3DModel,
    selected3DModel,
    isGenerating3D,
    setOutputFormat,
    setModelQuality,
  } = useAppStore();

  const { model3DList, setSelected3DModel } = useModels();
  const { openPaymentModal, price } = usePayment();

  // 3D 模型选项
  const model3DOptions = model3DList.map((model) => ({
    label: model.name,
    value: model.id,
    disabled: model.status !== 'active',
  }));

  // 格式选项
  const formatOptions = ['GLB', 'OBJ', 'FBX', 'GLTF'] as const;

  // 质量等级映射
  const qualityMap = {
    1: 'low',
    2: 'medium',
    3: 'high',
  } as const;

  const qualityLabels = {
    low: '低精度',
    medium: '中精度',
    high: '高精度',
  };

  const qualityValue = Object.entries(qualityMap).find(
    ([, v]) => v === modelQuality
  )?.[0];

  return (
    <aside className={styles.rightPanel}>
      {/* 3D 模型选择 */}
      <div className={styles.panelSection}>
        <div className={styles.sectionTitle}>
          <Icon name="cube" />
          3D 模型
        </div>
        <Select
          value={selected3DModel || undefined}
          onChange={(value) => setSelected3DModel(value as string)}
          options={model3DOptions}
          placeholder="选择 3D 生成模型"
          style={{ width: '100%' }}
        />
      </div>

      {/* 3D 预览 */}
      <div className={styles.previewContainer}>
        <Canvas camera={{ position: [5, 5, 5], fov: 50 }}>
          <Suspense fallback={null}>
            <Stage environment="city" intensity={0.6}>
              {current3DModel?.modelUrl ? (
                <Model3DPreview url={current3DModel.modelUrl} />
              ) : (
                <PlaceholderPreview />
              )}
            </Stage>
          </Suspense>
          <OrbitControls
            autoRotate={!current3DModel}
            autoRotateSpeed={2}
            enablePan={false}
          />
        </Canvas>

        {/* 预览控制按钮 */}
        <div className={styles.previewControls}>
          <button className={`${styles.controlBtn} ${styles.active}`} title="旋转">
            <Icon name="refresh" />
          </button>
          <button className={styles.controlBtn} title="缩放">
            <Icon name="zoom-in" />
          </button>
          <button className={styles.controlBtn} title="平移">
            <Icon name="move" />
          </button>
          <button className={styles.controlBtn} title="重置视角">
            <Icon name="rollback" />
          </button>
        </div>

        {/* 生成中状态 */}
        {isGenerating3D && (
          <div className={styles.previewOverlay}>
            <Icon name="loading" size="48px" className={styles.spinning} />
            <span>正在生成 3D 模型...</span>
          </div>
        )}
      </div>

      {/* 输出格式 */}
      <div className={styles.settingsSection}>
        <div className={styles.sectionTitle}>
          <Icon name="setting" />
          输出格式
        </div>
        <div className={styles.formatOptions}>
          {formatOptions.map((format) => (
            <div
              key={format}
              className={`${styles.formatChip} ${
                outputFormat === format ? styles.active : ''
              }`}
              onClick={() => setOutputFormat(format)}
            >
              {format}
            </div>
          ))}
        </div>
      </div>

      {/* 精度级别 */}
      <div className={styles.settingsSection}>
        <div className={styles.sectionTitle}>
          <Icon name="layers" />
          精度级别
        </div>
        <div className={styles.paramGroup}>
          <div className={styles.paramLabel}>
            <span>模型精度</span>
            <span className={styles.paramValue}>
              {qualityLabels[modelQuality]}
            </span>
          </div>
          <Slider
            value={Number(qualityValue) || 3}
            onChange={(value) => {
              const quality = qualityMap[value as keyof typeof qualityMap];
              if (quality) setModelQuality(quality);
            }}
            min={1}
            max={3}
            step={1}
          />
        </div>
      </div>

      {/* 下载区域 */}
      <div className={styles.downloadSection}>
        <div className={styles.priceDisplay}>
          <span className={styles.priceLabel}>下载价格</span>
          <span className={styles.priceValue}>
            ¥{price} <span>/ {qualityLabels[modelQuality]} {outputFormat}</span>
          </span>
        </div>
        <Button
          className={styles.downloadBtn}
          theme="success"
          size="large"
          block
          disabled={!current3DModel}
          onClick={openPaymentModal}
        >
          <Icon name="download" />
          付费下载 3D 模型
        </Button>
        <div className={styles.paymentMethods}>
          <Icon name="logo-wechat" className={`${styles.paymentIcon} ${styles.wechat}`} />
          <span className={`${styles.paymentIcon} ${styles.alipay}`}>支付宝</span>
        </div>
      </div>
    </aside>
  );
};
