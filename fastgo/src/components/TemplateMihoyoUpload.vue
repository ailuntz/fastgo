<template>
  <div class="genshin-container">
    <!-- 背景装饰 -->
    <div class="background-decoration">
      <div class="floating-particles"></div>
      <div class="wind-current"></div>
    </div>

    <!-- 原神风格过期横幅 -->
    <div v-if="isExpired" class="genshin-expired-banner">
      <div class="expired-particles"></div>
      <div class="genshin-expired-content">
        <div class="expired-icon">⚠️</div>
        <div class="expired-text">
          <div class="expired-title">原神传送锚点失效</div>
          <div class="expired-subtitle">提瓦特传送通道已关闭，无法传送冒险物品</div>
        </div>
      </div>
    </div>

    <!-- 主界面容器 -->
    <div class="adventure-wrapper">
      <div class="adventure-interface">
      <!-- 标题区域 -->
      <div class="interface-header">
        <div class="header-ornament left"></div>
        <div class="title-section">
          <h1 class="adventure-title">原神 · 物品传送系统</h1>
          <div class="subtitle">Genshin Impact · File Transfer</div>
          <div class="location-tag">
            <div class="location-icon">🏛️</div>
            <span>提瓦特大陆 · 蒙德城传送锚点</span>
          </div>
        </div>
        <div class="header-ornament right"></div>
      </div>

      <!-- 存储状态面板 -->
      <div class="inventory-panel">
        <div class="panel-header">
          <div class="panel-icon">🎒</div>
          <span>原神冒险者背包</span>
          <div class="capacity-indicator">
            <div class="capacity-gems">
              <div class="gem" v-for="i in Math.min(5, Math.ceil(((tokenInfo.used_bytes || 0) / (tokenInfo.max_storage_bytes || 1)) * 5))" :key="i"></div>
            </div>
          </div>
        </div>
        <div class="storage-details">
          <div class="storage-bar-container">
            <div class="storage-bar">
              <div class="storage-fill" :style="{ width: (((tokenInfo.used_bytes || 0) / (tokenInfo.max_storage_bytes || 1)) * 100) + '%' }"></div>
              <div class="storage-glow"></div>
            </div>
          </div>
          <div class="storage-info">
            <span class="used">已使用: {{ formatBytes(tokenInfo.used_bytes || 0) }}</span>
            <span class="total">总容量: {{ formatBytes(tokenInfo.max_storage_bytes || 0) }}</span>
          </div>
        </div>
      </div>

      <!-- 上传操作区 -->
      <div class="transfer-section">
        <div class="section-title">
          <div class="title-decoration"></div>
          <span>原神物品传送选择</span>
          <div class="title-decoration"></div>
        </div>

        <!-- 文件选择器 -->
        <div class="item-selectors">
          <div class="selector-container">
            <label class="item-selector" :class="{ 'disabled': uploading || isExpired, 'expired': isExpired }">
              <input 
                type="file" 
                @change="handleSingleFileChange"
                :disabled="uploading || isExpired"
                style="display: none;"
              />
              <div class="selector-icon">
                <div class="element-symbol wind">🍃</div>
              </div>
              <div class="selector-content">
                <div class="selector-title">原石道具</div>
                <div class="selector-desc">选择单个原神物品</div>
              </div>
              <div class="element-particles wind-particles"></div>
            </label>
          </div>
          
          <div class="selector-container">
            <label class="item-selector" :class="{ 'disabled': uploading || isExpired, 'expired': isExpired }">
              <input 
                type="file" 
                webkitdirectory 
                directory 
                multiple
                @change="handleFolderChange"
                :disabled="uploading || isExpired"
                style="display: none;"
              />
              <div class="selector-icon">
                <div class="element-symbol geo">🗿</div>
              </div>
              <div class="selector-content">
                <div class="selector-title">原神宝箱</div>
                <div class="selector-desc">选择整个物品宝箱</div>
              </div>
              <div class="element-particles geo-particles"></div>
            </label>
          </div>
        </div>

        <!-- 选中文件预览 -->
        <div v-if="selectedFiles.length > 0 && !uploading && uploadProgress === 0" class="selected-items">
          <div class="items-header">
            <div class="items-icon">✨</div>
            <span>已选择物品 ({{ selectedFiles.length }})</span>
          </div>
          <div class="items-list">
            <div v-for="(file, index) in selectedFiles.slice(0, 3)" :key="index" class="item-preview">
              <div class="item-rarity"></div>
              <div class="item-name">{{ getRelativePath(file) }}</div>
            </div>
            <div v-if="selectedFiles.length > 3" class="more-items">
              还有 {{ selectedFiles.length - 3 }} 个物品...
            </div>
          </div>
        </div>

        <!-- 传送按钮 -->
        <div class="transfer-action">
          <button 
            class="transfer-button"
            :class="{ 
              'transferring': uploading, 
              'expired': isExpired,
              'ready': selectedFiles.length > 0 && !uploading && !isExpired
            }"
            :disabled="uploading || selectedFiles.length === 0 || isExpired"
            @click="$emit('upload-clicked')"
          >
            <div class="button-bg"></div>
            <div class="button-glow"></div>
            <div class="button-content">
              <div v-if="!uploading && !isExpired" class="button-icon">⚡</div>
              <div v-if="uploading" class="button-spinner"></div>
              <span class="button-text">
                {{ isExpired ? '传送通道已关闭' : (uploading ? '传送中...' : '开始传送') }}
              </span>
            </div>
          </button>
        </div>

        <!-- 传送进度 -->
        <div v-if="uploading || uploadProgress > 0" class="transfer-progress">
          <div class="progress-header">
            <div class="progress-icon">⚡</div>
            <span>传送进度</span>
            <span class="progress-percentage">{{ Math.round(uploadProgress) }}%</span>
          </div>
          <div class="progress-bar-container">
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: uploadProgress + '%' }"></div>
              <div class="progress-spark"></div>
            </div>
          </div>
          <div class="progress-status">{{ uploadStatus }}</div>
        </div>
      </div>

      <!-- 已传送物品 -->
      <div v-if="serverFiles.length > 0" class="inventory-section">
        <div class="section-title">
          <div class="title-decoration"></div>
          <span>原神传送完成的物品</span>
          <div class="title-decoration"></div>
        </div>
        <div class="inventory-grid">
          <div 
            v-for="(file, index) in serverFiles" 
            :key="index"
            class="inventory-item"
            :class="getFileStatus(file)"
          >
            <div class="item-frame">
              <div class="item-bg"></div>
              <div class="item-content">
                <div class="item-icon">{{ getFileIcon(file) }}</div>
                <div class="item-info">
                  <div class="item-name">{{ file }}</div>
                </div>
              </div>
              <div class="item-shine" v-if="getFileStatus(file) === 'newly-uploaded'"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 管理操作 -->
      <div class="management-section">
        <button 
          class="clear-button"
          :class="{ 'expired': isExpired }"
          @click="$emit('clear-storage')"
          :disabled="uploading || isExpired"
        >
          <div class="clear-icon">🗑️</div>
          <span>{{ isExpired ? '功能已关闭' : '清理所有物品' }}</span>
        </button>
      </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import type { PropType } from 'vue';
import type { TokenInfo } from '@/api/token';

export default defineComponent({
  props: {
    tokenInfo: { type: Object as PropType<TokenInfo>, required: true },
    uploading: { type: Boolean, default: false },
    uploadProgress: { type: Number, default: 0 },
    uploadStatus: { type: String, default: '' },
    uploadedFiles: { type: Array as PropType<string[]>, default: () => [] },
    serverFiles: { type: Array as PropType<string[]>, default: () => [] },
    selectedFiles: { type: Array as PropType<File[]>, default: () => [] },
    isExpired: { type: Boolean, default: false }
  },
  emits: ['file-selected', 'folder-selected', 'upload-clicked', 'clear-storage', 'refresh-files'],
  setup(props, { emit }) {

    const handleSingleFileChange = (event: Event) => {
      const target = event.target as HTMLInputElement;
      if (target.files && target.files.length > 0) {
        emit('file-selected', target.files);
      }
    };

    const handleFolderChange = (event: Event) => {
      const target = event.target as HTMLInputElement;
      if (target.files && target.files.length > 0) {
        emit('folder-selected', target.files);
      }
    };

    const formatBytes = (bytes: number) => {
      if (bytes === 0) return '0 B';
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getRelativePath = (file: File) => {
      return (file as any).webkitRelativePath || file.name;
    };

    const getFileStatus = (fileName: string) => {
      if (props.uploadedFiles.includes(fileName)) {
        return 'newly-uploaded';
      }
      return 'existing';
    };

    const getFileIcon = (fileName: string) => {
      if (props.uploadedFiles.includes(fileName)) {
        return '✨';
      }
      return '📜';
    };

    return {
      handleSingleFileChange,
      handleFolderChange,
      formatBytes,
      getRelativePath,
      getFileStatus,
      getFileIcon
    };
  }
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@300;400;500;600;700&display=swap');

.genshin-container {
  font-family: 'Noto Sans SC', sans-serif;
  min-height: 100vh;
  width: 100%;
  background: linear-gradient(135deg, #e6f3ff 0%, #cce7ff 25%, #b3dbff 50%, #99cfff 75%, #80c3ff 100%);
  padding: 20px;
  box-sizing: border-box;
}

/* 原神风格过期横幅 */
.genshin-expired-banner {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, rgba(255, 182, 193, 0.95), rgba(255, 160, 180, 0.95));
  border: 2px solid #ff6b8a;
  border-radius: 16px;
  padding: 16px 24px;
  z-index: 100;
  box-shadow: 
    0 8px 32px rgba(255, 107, 138, 0.3),
    0 4px 16px rgba(255, 107, 138, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  animation: genshin-warning-float 3s ease-in-out infinite;
  backdrop-filter: blur(10px);
  min-width: 320px;
  overflow: hidden;
}

.expired-particles {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    radial-gradient(2px 2px at 20px 15px, rgba(255, 255, 255, 0.8), transparent),
    radial-gradient(1px 1px at 40px 25px, rgba(255, 182, 193, 0.6), transparent),
    radial-gradient(1px 1px at 60px 10px, rgba(255, 255, 255, 0.5), transparent);
  animation: particles-float 4s ease-in-out infinite;
}

.genshin-expired-content {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.expired-icon {
  font-size: 24px;
  animation: icon-pulse 2s ease-in-out infinite;
  filter: drop-shadow(0 2px 4px rgba(255, 107, 138, 0.4));
}

.expired-text {
  flex: 1;
}

.expired-title {
  font-size: 16px;
  font-weight: 600;
  color: #4a4a4a;
  margin-bottom: 4px;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8);
}

.expired-subtitle {
  font-size: 13px;
  color: #666;
  line-height: 1.4;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.6);
}

@keyframes genshin-warning-float {
  0%, 100% { 
    transform: translateX(-50%) translateY(0px);
    box-shadow: 
      0 8px 32px rgba(255, 107, 138, 0.3),
      0 4px 16px rgba(255, 107, 138, 0.2);
  }
  50% { 
    transform: translateX(-50%) translateY(-6px);
    box-shadow: 
      0 12px 40px rgba(255, 107, 138, 0.4),
      0 6px 20px rgba(255, 107, 138, 0.3);
  }
}

@keyframes particles-float {
  0%, 100% { opacity: 0.6; transform: translateY(0px); }
  50% { opacity: 1; transform: translateY(-4px); }
}

@keyframes icon-pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.8; }
}

/* 背景装饰 */
.background-decoration {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  min-height: 100vh;
  pointer-events: none;
  z-index: 1;
}

.floating-particles {
  position: absolute;
  width: 100%;
  height: 100%;
  background-image: 
    radial-gradient(2px 2px at 100px 50px, rgba(255, 255, 255, 0.6), transparent),
    radial-gradient(1px 1px at 200px 150px, rgba(173, 216, 230, 0.4), transparent),
    radial-gradient(1px 1px at 300px 100px, rgba(255, 255, 255, 0.5), transparent),
    radial-gradient(2px 2px at 400px 200px, rgba(173, 216, 230, 0.3), transparent);
  background-size: 500px 300px;
  animation: particles-drift 20s linear infinite;
}

.wind-current {
  position: absolute;
  top: 20%;
  left: -10%;
  width: 120%;
  height: 200px;
  background: linear-gradient(90deg, transparent 0%, rgba(173, 216, 230, 0.1) 50%, transparent 100%);
  transform: rotate(-15deg);
  animation: wind-flow 15s ease-in-out infinite;
}

@keyframes particles-drift {
  0% { transform: translateX(-50px) translateY(-50px); }
  100% { transform: translateX(50px) translateY(50px); }
}

@keyframes wind-flow {
  0%, 100% { opacity: 0.3; transform: rotate(-15deg) translateX(0px); }
  50% { opacity: 0.6; transform: rotate(-15deg) translateX(30px); }
}

/* 主界面容器 - 可滚动 */
.adventure-wrapper {
  max-width: 800px;
  margin: 0 auto;
  max-height: calc(100vh - 40px);
  overflow-y: auto;
  overflow-x: hidden;
  position: relative;
  z-index: 10;
  box-sizing: border-box;
  /* 自定义滚动条 */
  scrollbar-width: thin;
  scrollbar-color: rgba(135, 206, 235, 0.5) transparent;
}

.adventure-wrapper::-webkit-scrollbar {
  width: 8px;
}

.adventure-wrapper::-webkit-scrollbar-track {
  background: transparent;
}

.adventure-wrapper::-webkit-scrollbar-thumb {
  background: rgba(135, 206, 235, 0.5);
  border-radius: 4px;
}

.adventure-wrapper::-webkit-scrollbar-thumb:hover {
  background: rgba(135, 206, 235, 0.7);
}

/* 主界面 */
.adventure-interface {
  width: 100%;
  background: rgba(255, 255, 255, 0.85);
  border-radius: 20px;
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.1),
    0 8px 32px rgba(0, 0, 0, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  position: relative;
  box-sizing: border-box;
}

/* 标题区域 */
.interface-header {
  padding: 30px 40px 20px;
  text-align: center;
  position: relative;
  background: linear-gradient(135deg, rgba(173, 216, 230, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%);
  border-bottom: 1px solid rgba(173, 216, 230, 0.2);
}

.header-ornament {
  position: absolute;
  top: 50%;
  width: 60px;
  height: 2px;
  background: linear-gradient(90deg, transparent, #87ceeb, transparent);
  transform: translateY(-50%);
}

.header-ornament.left { left: 40px; }
.header-ornament.right { right: 40px; }

.title-section {
  padding: 0 100px;
}

.adventure-title {
  font-size: 28px;
  font-weight: 600;
  color: #2c5282;
  margin: 0 0 8px;
  text-shadow: 0 2px 4px rgba(44, 82, 130, 0.2);
  letter-spacing: 1px;
}

.subtitle {
  font-size: 14px;
  color: #4a5568;
  margin-bottom: 15px;
  font-weight: 300;
  letter-spacing: 2px;
}

.location-tag {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(135, 206, 235, 0.2);
  border: 1px solid rgba(135, 206, 235, 0.3);
  border-radius: 20px;
  font-size: 13px;
  color: #2d3748;
  backdrop-filter: blur(10px);
}

.location-icon {
  font-size: 16px;
  filter: drop-shadow(0 1px 2px rgba(135, 206, 235, 0.4));
}

/* 存储面板 */
.inventory-panel {
  margin: 25px 40px;
  padding: 20px;
  background: rgba(173, 216, 230, 0.1);
  border: 1px solid rgba(173, 216, 230, 0.2);
  border-radius: 16px;
  backdrop-filter: blur(10px);
}

.panel-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
  font-size: 16px;
  font-weight: 500;
  color: #2d3748;
}

.panel-icon {
  font-size: 20px;
  filter: drop-shadow(0 2px 4px rgba(173, 216, 230, 0.4));
}

.capacity-indicator {
  margin-left: auto;
}

.capacity-gems {
  display: flex;
  gap: 4px;
}

.gem {
  width: 12px;
  height: 12px;
  background: linear-gradient(135deg, #87ceeb, #4682b4);
  border-radius: 50%;
  box-shadow: 
    0 2px 4px rgba(70, 130, 180, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.5);
  animation: gem-sparkle 2s ease-in-out infinite;
}

.gem:nth-child(odd) { animation-delay: 0.5s; }

@keyframes gem-sparkle {
  0%, 100% { transform: scale(1); box-shadow: 0 2px 4px rgba(70, 130, 180, 0.3); }
  50% { transform: scale(1.1); box-shadow: 0 4px 8px rgba(70, 130, 180, 0.5); }
}

.storage-bar-container {
  margin-bottom: 10px;
}

.storage-bar {
  height: 8px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 4px;
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(173, 216, 230, 0.3);
}

.storage-fill {
  height: 100%;
  background: linear-gradient(90deg, #87ceeb, #4682b4);
  border-radius: 4px;
  transition: width 0.5s ease;
  position: relative;
}

.storage-glow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  animation: storage-shine 3s ease-in-out infinite;
}

@keyframes storage-shine {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.storage-info {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #4a5568;
}

/* 传送区域 */
.transfer-section {
  padding: 0 40px 30px;
}

.section-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  margin-bottom: 25px;
  font-size: 18px;
  font-weight: 500;
  color: #2d3748;
}

.title-decoration {
  width: 40px;
  height: 1px;
  background: linear-gradient(90deg, transparent, #87ceeb, transparent);
}

/* 文件选择器 */
.item-selectors {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 25px;
}

.selector-container {
  position: relative;
}

.item-selector {
  display: block;
  width: 100%;
  padding: 20px;
  background: rgba(255, 255, 255, 0.6);
  border: 2px solid rgba(173, 216, 230, 0.3);
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(10px);
}

.item-selector:hover:not(.disabled) {
  background: rgba(255, 255, 255, 0.8);
  border-color: #87ceeb;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(135, 206, 235, 0.2);
}

.item-selector.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.item-selector.expired {
  background: rgba(255, 182, 193, 0.3);
  border-color: rgba(255, 107, 138, 0.5);
}

.selector-icon {
  text-align: center;
  margin-bottom: 12px;
  position: relative;
}

.element-symbol {
  font-size: 32px;
  display: inline-block;
  filter: drop-shadow(0 4px 8px rgba(135, 206, 235, 0.3));
  animation: element-float 3s ease-in-out infinite;
}

.element-symbol.wind { animation-delay: 0s; }
.element-symbol.geo { animation-delay: 1s; }

@keyframes element-float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-6px) rotate(5deg); }
}

.selector-content {
  text-align: center;
}

.selector-title {
  font-size: 16px;
  font-weight: 500;
  color: #2d3748;
  margin-bottom: 4px;
}

.selector-desc {
  font-size: 13px;
  color: #4a5568;
}

.element-particles {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.wind-particles {
  background-image: 
    radial-gradient(1px 1px at 20% 30%, rgba(173, 216, 230, 0.4), transparent),
    radial-gradient(1px 1px at 80% 70%, rgba(173, 216, 230, 0.3), transparent);
  animation: wind-particles-flow 4s ease-in-out infinite;
}

.geo-particles {
  background-image: 
    radial-gradient(1px 1px at 30% 20%, rgba(218, 165, 32, 0.4), transparent),
    radial-gradient(1px 1px at 70% 80%, rgba(218, 165, 32, 0.3), transparent);
  animation: geo-particles-pulse 3s ease-in-out infinite;
}

@keyframes wind-particles-flow {
  0%, 100% { opacity: 0.3; transform: translateY(0px); }
  50% { opacity: 0.7; transform: translateY(-4px); }
}

@keyframes geo-particles-pulse {
  0%, 100% { opacity: 0.2; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(1.05); }
}

/* 选中物品预览 */
.selected-items {
  margin-bottom: 25px;
  padding: 18px;
  background: rgba(173, 216, 230, 0.1);
  border: 1px solid rgba(173, 216, 230, 0.2);
  border-radius: 12px;
  backdrop-filter: blur(10px);
}

.items-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
  font-size: 14px;
  font-weight: 500;
  color: #2d3748;
}

.items-icon {
  font-size: 16px;
  filter: drop-shadow(0 2px 4px rgba(173, 216, 230, 0.4));
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.item-preview {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.4);
  border-radius: 8px;
  font-size: 13px;
}

.item-rarity {
  width: 12px;
  height: 12px;
  background: linear-gradient(135deg, #87ceeb, #4682b4);
  border-radius: 50%;
  box-shadow: 0 1px 3px rgba(70, 130, 180, 0.3);
}

.more-items {
  padding: 8px 12px;
  font-size: 12px;
  color: #4a5568;
  font-style: italic;
  text-align: center;
}

/* 传送按钮 */
.transfer-action {
  margin-bottom: 25px;
  text-align: center;
}

.transfer-button {
  position: relative;
  padding: 16px 48px;
  background: transparent;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  color: white;
  overflow: hidden;
  transition: all 0.3s ease;
  min-width: 200px;
}

.button-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #4682b4, #87ceeb);
  border-radius: 25px;
  transition: all 0.3s ease;
}

.button-glow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.2), transparent);
  border-radius: 25px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.transfer-button:hover:not(:disabled) .button-glow {
  opacity: 1;
}

.transfer-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(70, 130, 180, 0.3);
}

.transfer-button.ready .button-bg {
  background: linear-gradient(135deg, #32cd32, #90ee90);
  animation: ready-pulse 2s ease-in-out infinite;
}

.transfer-button.transferring .button-bg {
  background: linear-gradient(135deg, #ffd700, #ffff99);
}

.transfer-button.expired .button-bg {
  background: linear-gradient(135deg, #ff6b8a, #ffb6c1);
}

.transfer-button:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

@keyframes ready-pulse {
  0%, 100% { box-shadow: 0 4px 15px rgba(50, 205, 50, 0.3); }
  50% { box-shadow: 0 6px 20px rgba(50, 205, 50, 0.5); }
}

.button-content {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  z-index: 1;
}

.button-icon {
  font-size: 18px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.button-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 传送进度 */
.transfer-progress {
  margin-bottom: 25px;
  padding: 18px;
  background: rgba(255, 255, 255, 0.4);
  border: 1px solid rgba(173, 216, 230, 0.3);
  border-radius: 12px;
  backdrop-filter: blur(10px);
}

.progress-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
  font-size: 14px;
  font-weight: 500;
  color: #2d3748;
}

.progress-icon {
  font-size: 16px;
  animation: progress-pulse 1.5s ease-in-out infinite;
  filter: drop-shadow(0 2px 4px rgba(173, 216, 230, 0.4));
}

.progress-percentage {
  margin-left: auto;
  font-weight: 600;
  color: #4682b4;
}

@keyframes progress-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.progress-bar-container {
  margin-bottom: 10px;
}

.progress-bar {
  height: 10px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 5px;
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(173, 216, 230, 0.3);
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #32cd32, #90ee90);
  border-radius: 5px;
  transition: width 0.3s ease;
  position: relative;
}

.progress-spark {
  position: absolute;
  top: 0;
  right: -10px;
  bottom: 0;
  width: 20px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.8), transparent);
  animation: spark-move 2s ease-in-out infinite;
}

@keyframes spark-move {
  0% { transform: translateX(-20px); }
  100% { transform: translateX(20px); }
}

.progress-status {
  font-size: 12px;
  color: #4a5568;
  text-align: center;
}

/* 物品库存 */
.inventory-section {
  padding: 0 40px 30px;
}

.inventory-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
}

.inventory-item {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.3s ease;
}

.inventory-item:hover {
  transform: translateY(-4px);
}

.item-frame {
  position: relative;
  padding: 15px;
  background: rgba(255, 255, 255, 0.6);
  border: 2px solid rgba(173, 216, 230, 0.3);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.inventory-item.newly-uploaded .item-frame {
  background: rgba(50, 205, 50, 0.1);
  border-color: rgba(50, 205, 50, 0.5);
  box-shadow: 0 4px 15px rgba(50, 205, 50, 0.2);
}

.item-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(173, 216, 230, 0.1), rgba(255, 255, 255, 0.1));
  border-radius: 10px;
}

.item-content {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
}

.item-icon {
  font-size: 24px;
  filter: drop-shadow(0 2px 4px rgba(173, 216, 230, 0.4));
}

.item-info {
  flex: 1;
  min-width: 0;
}

.item-name {
  font-size: 13px;
  color: #2d3748;
  font-weight: 500;
  word-break: break-all;
  line-height: 1.3;
}

.item-shine {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6), transparent);
  animation: item-shine 3s ease-in-out infinite;
}

@keyframes item-shine {
  0% { left: -100%; }
  100% { left: 100%; }
}

/* 管理区域 */
.management-section {
  padding: 0 40px 40px;
  text-align: center;
}

.clear-button {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 12px 24px;
  background: rgba(255, 99, 71, 0.1);
  border: 2px solid rgba(255, 99, 71, 0.3);
  border-radius: 20px;
  color: #ff6347;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.clear-button:hover:not(:disabled) {
  background: rgba(255, 99, 71, 0.2);
  border-color: rgba(255, 99, 71, 0.5);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 99, 71, 0.2);
}

.clear-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.clear-button.expired {
  background: rgba(128, 128, 128, 0.1);
  border-color: rgba(128, 128, 128, 0.3);
  color: #808080;
}

.clear-icon {
  font-size: 16px;
  filter: drop-shadow(0 2px 4px rgba(255, 99, 71, 0.3));
}

/* 响应式设计 */
@media (max-width: 768px) {
  .genshin-container {
    padding: 10px;
  }
  
  .adventure-wrapper {
    max-height: calc(100vh - 20px);
  }
  
  .adventure-interface {
    border-radius: 16px;
  }
  
  .interface-header {
    padding: 20px;
  }
  
  .title-section {
    padding: 0 30px;
  }
  
  .adventure-title {
    font-size: 22px;
  }
  
  .header-ornament {
    width: 30px;
  }
  
  .header-ornament.left { left: 20px; }
  .header-ornament.right { right: 20px; }
  
  .inventory-panel,
  .transfer-section,
  .inventory-section {
    margin: 15px 20px;
  }
  
  .item-selectors {
    grid-template-columns: 1fr;
    gap: 15px;
  }
  
  .inventory-grid {
    grid-template-columns: 1fr;
  }
  
  .management-section {
    padding: 0 20px 30px;
  }
  
  .genshin-expired-banner {
    left: 10px;
    right: 10px;
    transform: none;
    min-width: auto;
  }
}

@media (max-width: 480px) {
  .genshin-container {
    padding: 8px;
  }
  
  .adventure-wrapper {
    max-height: calc(100vh - 16px);
  }
  
  .title-section {
    padding: 0 10px;
  }
  
  .adventure-title {
    font-size: 18px;
  }
  
  .header-ornament {
    display: none;
  }
  
  .interface-header {
    padding: 15px;
  }
  
  .inventory-panel,
  .transfer-section,
  .inventory-section {
    margin: 10px 15px;
  }
  
  .management-section {
    padding: 0 15px 20px;
  }
  
  .transfer-button {
    min-width: 160px;
    padding: 12px 24px;
    font-size: 14px;
  }
}
</style>