import React, { useState } from 'react';
import { useAppStore } from '@/stores/appStore';
import { useModels } from '@/hooks/useModels';
import { useGeneration } from '@/hooks/useGeneration';
import { Icon } from 'tdesign-icons-react';
import { Select, Slider, Button } from 'tdesign-react';
import styles from './LeftPanel.module.css';

export const LeftPanel: React.FC = () => {
  const {
    prompt,
    negativePrompt,
    resolution,
    imageCount,
    history,
    setPrompt,
    setNegativePrompt,
    setResolution,
    setImageCount,
  } = useAppStore();

  const { imageModels, selectedImageModel, setSelectedImageModel, isLoadingModels } =
    useModels();
  const { handleGenerateImages, isGeneratingImage } = useGeneration();

  const [showNegativePrompt, setShowNegativePrompt] = useState(false);

  // 模型选项
  const modelOptions = imageModels.map((model) => ({
    label: model.name,
    value: model.id,
    disabled: model.status !== 'active',
  }));

  return (
    <aside className={styles.leftPanel}>
      {/* 提示词输入 */}
      <div className={`${styles.panelSection} ${styles.animateIn} ${styles.delay1}`}>
        <div className={styles.sectionTitle}>
          <Icon name="edit" />
          提示词输入
        </div>
        <textarea
          className={styles.promptTextarea}
          placeholder="描述你想要生成的图像...&#10;&#10;例如：一只可爱的机械猫，赛博朋克风格，霓虹灯光，高细节，8K渲染"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          maxLength={2000}
        />
        <div className={styles.charCounter}>{prompt.length} / 2000</div>

        <div
          className={`${styles.negativeToggle} ${showNegativePrompt ? styles.active : ''}`}
          onClick={() => setShowNegativePrompt(!showNegativePrompt)}
        >
          <Icon name="chevron-right" size="10px" />
          添加负向提示词
        </div>

        {showNegativePrompt && (
          <textarea
            className={styles.negativeTextarea}
            placeholder="输入不想出现的元素..."
            value={negativePrompt}
            onChange={(e) => setNegativePrompt(e.target.value)}
            maxLength={500}
          />
        )}
      </div>

      {/* 模型选择 */}
      <div className={`${styles.panelSection} ${styles.animateIn} ${styles.delay2}`}>
        <div className={styles.sectionTitle}>
          <Icon name="root-list" />
          模型选择
        </div>
        <Select
          value={selectedImageModel || undefined}
          onChange={(value) => setSelectedImageModel(value as string)}
          options={modelOptions}
          placeholder="选择图像生成模型"
          loading={isLoadingModels}
          disabled={isLoadingModels}
          style={{ width: '100%' }}
        />
      </div>

      {/* 生成参数 */}
      <div className={`${styles.panelSection} ${styles.animateIn} ${styles.delay3}`}>
        <div className={styles.sectionTitle}>
          <Icon name="adjustment" />
          生成参数
        </div>

        <div className={styles.paramGroup}>
          <div className={styles.paramLabel}>
            <span>分辨率</span>
          </div>
          <div className={styles.resolutionGrid}>
            <div
              className={`${styles.resolutionOption} ${
                resolution === '512x512' ? styles.active : ''
              }`}
              onClick={() => setResolution('512x512')}
            >
              <span>标准</span>
              <div className={styles.size}>512×512</div>
            </div>
            <div
              className={`${styles.resolutionOption} ${
                resolution === '1024x1024' ? styles.active : ''
              }`}
              onClick={() => setResolution('1024x1024')}
            >
              <span>高清</span>
              <div className={styles.size}>1024×1024</div>
            </div>
          </div>
        </div>

        <div className={styles.paramGroup}>
          <div className={styles.paramLabel}>
            <span>生成数量</span>
            <span className={styles.paramValue}>{imageCount} 张</span>
          </div>
          <Slider
            value={imageCount}
            onChange={(value) => setImageCount(value as number)}
            min={1}
            max={4}
            step={1}
          />
        </div>
      </div>

      {/* 生成按钮 */}
      <Button
        className={styles.generateBtn}
        theme="primary"
        size="large"
        block
        loading={isGeneratingImage}
        disabled={!prompt.trim() || !selectedImageModel || isGeneratingImage}
        onClick={handleGenerateImages}
      >
        {isGeneratingImage ? (
          <>
            <Icon name="loading" className={styles.spinning} />
            生成中...
          </>
        ) : (
          <>
            <Icon name="lightbulb" />
            生成图像
          </>
        )}
      </Button>

      {/* 历史记录 */}
      <div className={styles.panelSection} style={{ flex: 1, minHeight: 0 }}>
        <div className={styles.sectionTitle}>
          <Icon name="time" />
          历史记录
        </div>
        <div className={styles.historyList}>
          {history.length === 0 ? (
            <div className={styles.emptyHistory}>暂无历史记录</div>
          ) : (
            history.slice(0, 10).map((item) => (
              <div key={item.id} className={styles.historyItem}>
                <div className={styles.historyThumb}>
                  {item.type === 'image' ? (
                    <Icon name="image" />
                  ) : (
                    <Icon name="cube" />
                  )}
                </div>
                <div className={styles.historyInfo}>
                  <div className={styles.historyTitle}>{item.title}</div>
                  <div className={styles.historyMeta}>
                    {new Date(item.createdAt).toLocaleString('zh-CN', {
                      month: 'numeric',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}{' '}
                    · {item.modelName}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </aside>
  );
};
