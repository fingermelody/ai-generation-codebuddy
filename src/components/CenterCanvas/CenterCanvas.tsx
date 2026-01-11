import React from 'react';
import { useAppStore } from '@/stores/appStore';
import { useGeneration } from '@/hooks/useGeneration';
import { Icon } from 'tdesign-icons-react';
import { Button, Progress } from 'tdesign-react';
import styles from './CenterCanvas.module.css';

export const CenterCanvas: React.FC = () => {
  const { imageProgress, model3DProgress, isGeneratingImage, isGenerating3D } =
    useAppStore();

  const {
    generatedImages,
    selectedImageId,
    selectImage,
    handleGenerate3DModel,
  } = useGeneration();

  // 计算进度百分比
  const currentProgress = isGenerating3D
    ? model3DProgress?.progress || 0
    : imageProgress?.progress || 0;

  const progressMessage = isGenerating3D
    ? '正在生成 3D 模型...'
    : '正在生成图像...';

  const estimatedTime = model3DProgress?.estimatedTime
    ? `预计剩余 ${model3DProgress.estimatedTime} 秒`
    : '';

  return (
    <section className={styles.centerCanvas}>
      <div className={styles.canvasHeader}>
        <h1 className={styles.canvasTitle}>生成结果</h1>
        <div className={styles.canvasActions}>
          <Button variant="outline" className={styles.actionBtn}>
            <Icon name="view-module" />
            网格视图
          </Button>
          <Button
            variant="outline"
            className={styles.actionBtn}
            disabled={generatedImages.length === 0}
          >
            <Icon name="download" />
            批量下载
          </Button>
          <Button
            theme="primary"
            className={styles.actionBtnPrimary}
            disabled={!selectedImageId || isGenerating3D}
            onClick={handleGenerate3DModel}
          >
            <Icon name="arrow-right" />
            选中图像生成 3D
          </Button>
        </div>
      </div>

      <div className={styles.imageGallery}>
        {generatedImages.length === 0 ? (
          // 占位符
          Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className={styles.galleryItem}>
              <div className={styles.galleryPlaceholder}>
                <Icon name="image" size="48px" />
                <span>等待生成</span>
              </div>
            </div>
          ))
        ) : (
          generatedImages.map((image) => (
            <div
              key={image.id}
              className={`${styles.galleryItem} ${
                selectedImageId === image.id ? styles.selected : ''
              }`}
              onClick={() => selectImage(image.id)}
            >
              {image.status === 'generating' ? (
                <div className={styles.galleryPlaceholder}>
                  <Icon name="loading" size="48px" className={styles.spinning} />
                  <span>生成中...</span>
                </div>
              ) : image.status === 'failed' ? (
                <div className={styles.galleryPlaceholder}>
                  <Icon name="error-circle" size="48px" />
                  <span>生成失败</span>
                </div>
              ) : (
                <>
                  <img
                    className={styles.galleryImage}
                    src={image.url}
                    alt={image.prompt}
                  />
                  <div className={styles.galleryOverlay}>
                    <div className={styles.overlayActions}>
                      <button className={styles.overlayBtn} title="放大查看">
                        <Icon name="fullscreen" />
                      </button>
                      <button className={styles.overlayBtn} title="下载">
                        <Icon name="download" />
                      </button>
                    </div>
                    {selectedImageId === image.id && (
                      <div className={styles.selectIndicator}>
                        <Icon name="check" size="12px" />
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>

      {/* 进度条 */}
      {(isGeneratingImage || isGenerating3D) && (
        <div className={styles.progressContainer}>
          <div className={styles.progressHeader}>
            <span className={styles.progressLabel}>
              <Icon name="loading" className={styles.spinning} />
              {progressMessage}
            </span>
            <span className={styles.progressTime}>{estimatedTime}</span>
          </div>
          <Progress
            percentage={currentProgress}
            theme="plump"
            color={{
              from: 'var(--color-primary)',
              to: 'var(--color-accent)',
            }}
          />
        </div>
      )}
    </section>
  );
};
