<template>
  <div class="retro-container">
    <!-- Retro过期横幅 -->
    <div v-if="isExpired" class="retro-expired-banner">
      <div class="retro-expired-content">
        <span class="retro-expired-icon">⚠</span>
        <span class="expired-message">UPLOAD EXPIRED</span>
      </div>
    </div>
    
    <div class="retro-upload-screen">
      <!-- 8位游戏风格边框 -->
      <div class="retro-border-frame">
        <div class="retro-content">
          <div class="scanlines"></div>
          
          <!-- 顶部标题栏 -->
          <div class="retro-header">
            <div class="retro-title">
              <span class="title-icon">◆</span>
              <span class="title-text">FASTGO UPLOAD STATION</span>
              <span class="title-icon">◆</span>
            </div>
            <div class="retro-subtitle">- FILE TRANSFER TERMINAL v8.0 -</div>
          </div>

          <!-- 存储信息显示 -->
          <div class="storage-display">
            <div class="display-header">
              <span class="bracket">[</span>
              <span class="header-text">STORAGE STATUS</span>
              <span class="bracket">]</span>
            </div>
            <div class="storage-bar-container">
              <div class="storage-bar">
                <div 
                  class="storage-fill" 
                  :style="{ width: (((tokenInfo.used_bytes || 0) / (tokenInfo.max_storage_bytes || 1)) * 100) + '%' }"
                ></div>
              </div>
              <div class="storage-text">
                {{ formatBytes(tokenInfo.used_bytes || 0) }} / {{ formatBytes(tokenInfo.max_storage_bytes || 0) }}
              </div>
            </div>
          </div>

          <!-- 文件选择区域 -->
          <div class="upload-selectors">
            <div class="selector-header">
              <span class="bracket">[</span>
              <span class="header-text">SELECT INPUT</span>
              <span class="bracket">]</span>
            </div>
            
            <div class="selector-grid">
              <label class="retro-selector" :class="{ 'disabled': uploading || isExpired, 'expired': isExpired }">
                <input 
                  type="file" 
                  @change="handleSingleFileChange"
                  :disabled="uploading || isExpired"
                  style="display: none;"
                />
                <div class="selector-content">
                  <div class="selector-icon">
                    <div class="pixel-icon file-pixel"></div>
                  </div>
                  <div class="selector-text">
                    <div class="selector-title">{{ isExpired ? 'EXPIRED' : 'FILE MODE' }}</div>
                    <div class="selector-desc">{{ isExpired ? 'NO ACCESS' : 'SINGLE FILE' }}</div>
                  </div>
                  <div class="selector-arrow">{{ isExpired ? '✕' : '►' }}</div>
                </div>
                <div class="selector-glow" v-if="!isExpired"></div>
              </label>
              
              <label class="retro-selector" :class="{ 'disabled': uploading || isExpired, 'expired': isExpired }">
                <input 
                  type="file" 
                  webkitdirectory 
                  directory 
                  multiple
                  @change="handleFolderChange"
                  :disabled="uploading || isExpired"
                  style="display: none;"
                />
                <div class="selector-content">
                  <div class="selector-icon">
                    <div class="pixel-icon folder-pixel"></div>
                  </div>
                  <div class="selector-text">
                    <div class="selector-title">{{ isExpired ? 'EXPIRED' : 'FOLDER MODE' }}</div>
                    <div class="selector-desc">{{ isExpired ? 'NO ACCESS' : 'BATCH FILES' }}</div>
                  </div>
                  <div class="selector-arrow">{{ isExpired ? '✕' : '►' }}</div>
                </div>
                <div class="selector-glow" v-if="!isExpired"></div>
              </label>
            </div>
          </div>

          <!-- 选中文件显示 -->
          <div v-if="selectedFiles.length > 0 && !uploading && uploadProgress === 0 && showSelectedFilesPreview" class="selected-files-display">
            <div class="display-header">
              <span class="bracket">[</span>
              <span class="header-text">SELECTED FILES: {{ selectedFiles.length }}</span>
              <span class="bracket">]</span>
            </div>
            <div class="files-list">
              <div 
                v-for="file in selectedFiles.slice(0, 4)" 
                :key="file.name"
                class="file-item"
              >
                <span class="file-bullet">►</span>
                <span class="file-name">{{ getRelativePath(file) }}</span>
              </div>
              <div v-if="selectedFiles.length > 4" class="more-files">
                ▼ {{ selectedFiles.length - 4 }} MORE FILES...
              </div>
            </div>
          </div>

          <!-- 上传按钮 -->
          <div class="upload-action">
            <div class="action-prompt">
              {{ isExpired ? '> SYSTEM ERROR: UPLOAD EXPIRED' :
                 uploading ? '> TRANSFERRING DATA... PLEASE WAIT' :
                 selectedFiles.length === 0 ? '> SELECT FILES TO UPLOAD' :
                 '> PRESS TO START UPLOAD SEQUENCE' }}
            </div>
            
            <button 
              class="retro-upload-btn"
              :class="{ 'uploading': uploading, 'expired': isExpired }"
              :disabled="uploading || selectedFiles.length === 0 || isExpired"
              @click="$emit('upload-clicked')"
            >
              <div class="btn-content">
                <div class="btn-brackets">[</div>
                <div class="btn-text">
                  <span v-if="!uploading && !isExpired">▲ UPLOAD</span>
                  <span v-else-if="uploading" class="uploading-text">⟪ TRANSMIT ⟫</span>
                  <span v-else-if="isExpired">✕ EXPIRED</span>
                </div>
                <div class="btn-brackets">]</div>
              </div>
              <div class="btn-glow" v-if="!isExpired && selectedFiles.length > 0 && !uploading"></div>
            </button>
          </div>

          <!-- 上传进度 -->
          <div v-if="uploading || uploadProgress > 0" class="progress-display" :class="{ 'completed': uploadProgress === 100 }">
            <div class="display-header">
              <span class="bracket">[</span>
              <span class="header-text">UPLOAD PROGRESS: {{ Math.round(uploadProgress) }}%</span>
              <span class="bracket">]</span>
            </div>
            <div class="progress-container">
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: uploadProgress + '%' }"></div>
                <div class="progress-pattern"></div>
              </div>
              <div class="progress-status">{{ uploadStatus }}</div>
            </div>
          </div>

          <!-- 已上传文件 -->
          <div v-if="serverFiles.length > 0" class="uploaded-files-display">
            <div class="display-header">
              <span class="bracket">[</span>
              <span class="header-text">UPLOADED FILES: {{ serverFiles.length }}</span>
              <span class="bracket">]</span>
            </div>
            <div class="uploaded-files-list">
              <div 
                v-for="file in serverFiles" 
                :key="file"
                class="uploaded-file-item"
                :class="getFileStatus(file)"
              >
                <span class="file-status-icon">{{ getFileIcon(file) }}</span>
                <span class="uploaded-file-name">{{ file }}</span>
                <span v-if="getFileStatus(file) === 'newly-uploaded'" class="new-badge">NEW</span>
              </div>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="actions-area">
            <button 
              class="retro-clear-btn"
              :class="{ 'expired': isExpired }"
              @click="$emit('clear-storage')"
              :disabled="uploading || isExpired"
            >
              <span class="clear-icon">🗑</span>
              {{ isExpired ? 'EXPIRED' : 'CLEAR ALL' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 浮动像素粒子效果 -->
    <div class="pixel-particles">
      <div class="pixel" v-for="i in 8" :key="i" :style="{ '--delay': i * 0.8 + 's', '--x': Math.random() * 100 + '%' }"></div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
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
    const showSelectedFilesPreview = ref<boolean>(true);

    const handleSingleFileChange = (event: Event) => {
      const target = event.target as HTMLInputElement;
      if (target.files && target.files.length > 0) {
        showSelectedFilesPreview.value = true;
        emit('file-selected', target.files);
      }
    };

    const handleFolderChange = (event: Event) => {
      const target = event.target as HTMLInputElement;
      if (target.files && target.files.length > 0) {
        showSelectedFilesPreview.value = true;
        emit('folder-selected', target.files);
      }
    };

    const formatBytes = (bytes: number) => {
      if (bytes === 0) return '0_B';
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + '_' + sizes[i];
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
        return '◆';
      }
      return '●';
    };


    return {
      showSelectedFilesPreview,
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
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap');

.retro-container {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: 100vh;
  width: 100vw;
  margin: 0;
  padding: 2rem;
  background: 
    radial-gradient(circle at 20% 30%, #ff6b35 0%, transparent 50%),
    radial-gradient(circle at 80% 70%, #f7931e 0%, transparent 50%),
    radial-gradient(circle at 40% 80%, #ffd23f 0%, transparent 50%),
    radial-gradient(circle at 60% 20%, #06ffa5 0%, transparent 50%),
    linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f1419 100%);
  color: #06ffa5;
  position: fixed;
  top: 0;
  left: 0;
  box-sizing: border-box;
  overflow-y: auto;
  font-family: 'Orbitron', 'Courier New', monospace;
}

/* Retro过期横幅 */
.retro-expired-banner {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: 
    linear-gradient(45deg, #ff3333 25%, transparent 25%),
    linear-gradient(-45deg, #ff3333 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #ff3333 75%),
    linear-gradient(-45deg, transparent 75%, #ff3333 75%);
  background-size: 8px 8px;
  background-position: 0 0, 0 4px, 4px -4px, -4px 0px;
  background-color: #cc0000;
  color: #ffff00;
  border: 3px solid #ffff00;
  padding: 12px 20px;
  z-index: 100;
  font-family: 'Orbitron', monospace;
  font-weight: 700;
  text-shadow: 2px 2px 0 #000;
  box-shadow: 
    0 0 20px #ff3333,
    inset 0 0 20px rgba(255, 255, 0, 0.2);
  animation: retro-blink 1s infinite alternate;
}

@keyframes retro-blink {
  0% { 
    opacity: 1;
    box-shadow: 
      0 0 20px #ff3333,
      inset 0 0 20px rgba(255, 255, 0, 0.2);
  }
  100% { 
    opacity: 0.7;
    box-shadow: 
      0 0 30px #ff3333,
      inset 0 0 30px rgba(255, 255, 0, 0.3);
  }
}

.retro-expired-content {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 900;
  letter-spacing: 2px;
}

.retro-expired-icon {
  font-size: 18px;
  font-weight: 900;
  animation: retro-flash 0.5s infinite alternate;
}

@keyframes retro-flash {
  0% { color: #ffff00; }
  100% { color: #ff6600; }
}

.retro-upload-screen {
  background: 
    linear-gradient(45deg, #333 25%, transparent 25%),
    linear-gradient(-45deg, #333 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #333 75%),
    linear-gradient(-45deg, transparent 75%, #333 75%);
  background-size: 4px 4px;
  background-position: 0 0, 0 2px, 2px -2px, -2px 0px;
  background-color: #222;
  padding: 8px;
  border-radius: 0;
  box-shadow: 
    0 0 40px rgba(255, 107, 53, 0.3),
    inset 0 0 40px rgba(6, 255, 165, 0.1);
  margin: 2rem 0;
}

.retro-border-frame {
  border: 4px solid #06ffa5;
  box-shadow: 
    inset 0 0 50px rgba(6, 255, 165, 0.2),
    0 0 30px rgba(6, 255, 165, 0.5);
}

.retro-content {
  background: 
    linear-gradient(rgba(6, 255, 165, 0.03) 50%, transparent 50%),
    linear-gradient(90deg, rgba(6, 255, 165, 0.03) 50%, transparent 50%),
    radial-gradient(circle at center, #0f1b0f 0%, #0a150a 100%);
  background-size: 2px 2px, 2px 2px, 100% 100%;
  padding: 2rem;
  max-width: 700px;
  width: 100%;
  max-height: calc(100vh - 8rem);
  box-sizing: border-box;
  overflow-y: auto;
  position: relative;
}

.scanlines {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    rgba(6, 255, 165, 0.03) 50%,
    transparent 50%
  );
  background-size: 100% 4px;
  pointer-events: none;
  animation: retro-scanlines 2s linear infinite;
}

@keyframes retro-scanlines {
  0% { transform: translateY(0); }
  100% { transform: translateY(4px); }
}

.retro-header {
  text-align: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px dashed #06ffa5;
}

.retro-title {
  font-size: 1.6rem;
  font-weight: 900;
  color: #ffd23f;
  text-shadow: 
    2px 2px 0 #ff6b35,
    4px 4px 0 #000;
  letter-spacing: 2px;
  margin-bottom: 0.5rem;
  animation: retro-glow 3s ease-in-out infinite alternate;
}

@keyframes retro-glow {
  0% { 
    text-shadow: 
      2px 2px 0 #ff6b35,
      4px 4px 0 #000,
      0 0 20px #ffd23f;
  }
  100% { 
    text-shadow: 
      2px 2px 0 #ff6b35,
      4px 4px 0 #000,
      0 0 30px #ffd23f,
      0 0 40px #f7931e;
  }
}

.title-icon {
  color: #ff6b35;
  margin: 0 0.5rem;
  font-size: 1.3rem;
}

.retro-subtitle {
  font-size: 0.85rem;
  color: #06ffa5;
  font-weight: 400;
  letter-spacing: 2px;
  text-shadow: 1px 1px 0 #000;
}

.display-header {
  font-size: 1rem;
  font-weight: 700;
  color: #ffd23f;
  text-align: center;
  margin-bottom: 1rem;
  text-shadow: 2px 2px 0 #000;
  letter-spacing: 1px;
}

.bracket {
  color: #ff6b35;
  font-size: 1.2rem;
  font-weight: 900;
}

.header-text {
  color: #ffd23f;
}

.storage-display {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: 
    linear-gradient(45deg, #1a1a2e 25%, transparent 25%),
    linear-gradient(-45deg, #1a1a2e 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #1a1a2e 75%),
    linear-gradient(-45deg, transparent 75%, #1a1a2e 75%);
  background-size: 6px 6px;
  background-position: 0 0, 0 3px, 3px -3px, -3px 0px;
  background-color: rgba(6, 255, 165, 0.1);
  border: 2px solid #06ffa5;
}

.storage-bar-container {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.storage-bar {
  width: 100%;
  height: 12px;
  background: 
    linear-gradient(45deg, #333 25%, transparent 25%),
    linear-gradient(-45deg, #333 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #333 75%),
    linear-gradient(-45deg, transparent 75%, #333 75%);
  background-size: 4px 4px;
  background-position: 0 0, 0 2px, 2px -2px, -2px 0px;
  background-color: #1a1a2e;
  border: 2px solid #06ffa5;
  overflow: hidden;
}

.storage-fill {
  height: 100%;
  background: linear-gradient(90deg, #06ffa5, #ffd23f, #ff6b35);
  transition: width 0.5s ease;
  animation: retro-storage-pulse 2s ease-in-out infinite alternate;
}

@keyframes retro-storage-pulse {
  0% { 
    box-shadow: inset 0 0 10px rgba(6, 255, 165, 0.5);
  }
  100% { 
    box-shadow: inset 0 0 20px rgba(6, 255, 165, 0.8);
  }
}

.storage-text {
  text-align: center;
  font-size: 0.9rem;
  font-weight: 700;
  color: #06ffa5;
  letter-spacing: 1px;
  text-shadow: 1px 1px 0 #000;
}

.upload-selectors {
  margin-bottom: 2rem;
}

.selector-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.retro-selector {
  position: relative;
  display: block;
  background: 
    linear-gradient(45deg, #1a1a2e 25%, transparent 25%),
    linear-gradient(-45deg, #1a1a2e 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #1a1a2e 75%),
    linear-gradient(-45deg, transparent 75%, #1a1a2e 75%);
  background-size: 6px 6px;
  background-position: 0 0, 0 3px, 3px -3px, -3px 0px;
  background-color: rgba(6, 255, 165, 0.1);
  border: 2px solid #06ffa5;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.retro-selector:hover:not(.disabled) {
  background-color: rgba(6, 255, 165, 0.2);
  border-color: #ffd23f;
  transform: translateY(-3px);
  box-shadow: 
    0 6px 20px rgba(6, 255, 165, 0.4),
    inset 0 0 20px rgba(255, 210, 63, 0.2);
}

.retro-selector.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.retro-selector.expired {
  background-color: rgba(255, 51, 51, 0.1);
  border-color: #ff3333;
  opacity: 0.8;
}

.retro-selector.expired:hover {
  background-color: rgba(255, 51, 51, 0.1);
  border-color: #ff3333;
  transform: none;
  box-shadow: none;
}

.selector-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.selector-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pixel-icon {
  width: 32px;
  height: 32px;
  background: 
    linear-gradient(45deg, #06ffa5 25%, transparent 25%),
    linear-gradient(-45deg, #06ffa5 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #06ffa5 75%),
    linear-gradient(-45deg, transparent 75%, #06ffa5 75%);
  background-size: 4px 4px;
  background-position: 0 0, 0 2px, 2px -2px, -2px 0px;
  background-color: #ffd23f;
  border: 2px solid #06ffa5;
  box-shadow: 0 0 15px rgba(6, 255, 165, 0.5);
}

.folder-pixel {
  background-color: #ff6b35;
  background-image: 
    linear-gradient(45deg, #06ffa5 25%, transparent 25%),
    linear-gradient(-45deg, #06ffa5 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #06ffa5 75%),
    linear-gradient(-45deg, transparent 75%, #06ffa5 75%);
}

.retro-selector.expired .pixel-icon {
  background-color: #666;
  border-color: #ff3333;
  box-shadow: 0 0 15px rgba(255, 51, 51, 0.5);
}

.selector-text {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.selector-title {
  font-size: 1rem;
  font-weight: 700;
  color: #ffd23f;
  text-shadow: 1px 1px 0 #000;
  letter-spacing: 1px;
}

.selector-desc {
  font-size: 0.8rem;
  color: #06ffa5;
  font-weight: 400;
  text-shadow: 1px 1px 0 #000;
}

.retro-selector.expired .selector-title {
  color: #ff3333;
}

.retro-selector.expired .selector-desc {
  color: #ff6666;
}

.selector-arrow {
  font-size: 1.2rem;
  color: #f7931e;
  font-weight: 900;
  text-shadow: 2px 2px 0 #000;
}

.retro-selector.expired .selector-arrow {
  color: #ff3333;
}

.selector-glow {
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: linear-gradient(45deg, #06ffa5, #ffd23f, #ff6b35, #06ffa5);
  z-index: -1;
  filter: blur(6px);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.retro-selector:hover .selector-glow {
  opacity: 0.6;
  animation: retro-selector-glow 2s linear infinite;
}

@keyframes retro-selector-glow {
  0% { opacity: 0.4; }
  50% { opacity: 0.8; }
  100% { opacity: 0.4; }
}

.selected-files-display {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: 
    linear-gradient(45deg, #1a1a2e 25%, transparent 25%),
    linear-gradient(-45deg, #1a1a2e 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #1a1a2e 75%),
    linear-gradient(-45deg, transparent 75%, #1a1a2e 75%);
  background-size: 6px 6px;
  background-position: 0 0, 0 3px, 3px -3px, -3px 0px;
  background-color: rgba(255, 210, 63, 0.1);
  border: 2px solid #ffd23f;
}

.files-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 120px;
  overflow-y: auto;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem;
  background: rgba(6, 255, 165, 0.1);
  border: 1px solid #06ffa5;
  font-size: 0.9rem;
}

.file-bullet {
  color: #ffd23f;
  font-weight: 900;
  flex-shrink: 0;
}

.file-name {
  color: #06ffa5;
  word-break: break-all;
  text-shadow: 1px 1px 0 #000;
}

.more-files {
  text-align: center;
  font-size: 0.85rem;
  color: #f7931e;
  font-weight: 700;
  letter-spacing: 1px;
  text-shadow: 1px 1px 0 #000;
  padding: 0.5rem;
}

.upload-action {
  margin-bottom: 2rem;
  text-align: center;
}

.action-prompt {
  font-size: 0.9rem;
  color: #f7931e;
  margin-bottom: 1.5rem;
  font-weight: 700;
  letter-spacing: 1px;
  text-shadow: 1px 1px 0 #000;
  animation: retro-typewriter 3s ease-in-out infinite;
}

@keyframes retro-typewriter {
  0%, 50%, 100% { opacity: 1; }
  25%, 75% { opacity: 0.7; }
}

.retro-upload-btn {
  position: relative;
  background: 
    linear-gradient(45deg, #06ffa5 25%, transparent 25%),
    linear-gradient(-45deg, #06ffa5 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #06ffa5 75%),
    linear-gradient(-45deg, transparent 75%, #06ffa5 75%);
  background-size: 8px 8px;
  background-position: 0 0, 0 4px, 4px -4px, -4px 0px;
  background-color: #004d3d;
  color: #000;
  border: 3px solid #06ffa5;
  padding: 1rem 2.5rem;
  font-family: 'Orbitron', monospace;
  font-size: 1.1rem;
  font-weight: 900;
  letter-spacing: 2px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-shadow: none;
  box-shadow: 
    0 0 20px rgba(6, 255, 165, 0.5),
    inset 0 0 20px rgba(6, 255, 165, 0.2);
}

.retro-upload-btn:hover:not(:disabled) {
  background-color: #06ffa5;
  color: #000;
  transform: translateY(-3px);
  box-shadow: 
    0 6px 30px rgba(6, 255, 165, 0.8),
    inset 0 0 30px rgba(0, 0, 0, 0.3);
}

.retro-upload-btn.uploading {
  background-color: #ffd23f;
  border-color: #f7931e;
  color: #000;
  animation: retro-processing 1s linear infinite;
}

@keyframes retro-processing {
  0% { 
    box-shadow: 
      0 0 20px rgba(255, 210, 63, 0.5),
      inset 0 0 20px rgba(255, 210, 63, 0.2);
  }
  50% { 
    box-shadow: 
      0 0 30px rgba(247, 147, 30, 0.8),
      inset 0 0 30px rgba(247, 147, 30, 0.3);
  }
  100% { 
    box-shadow: 
      0 0 20px rgba(255, 210, 63, 0.5),
      inset 0 0 20px rgba(255, 210, 63, 0.2);
  }
}

.retro-upload-btn.expired {
  background-color: #663333;
  border-color: #ff3333;
  color: #ff6666;
  cursor: not-allowed;
  opacity: 0.8;
  box-shadow: 
    0 0 20px rgba(255, 51, 51, 0.3),
    inset 0 0 20px rgba(255, 51, 51, 0.1);
}

.retro-upload-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.btn-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-brackets {
  font-size: 1.4rem;
  font-weight: 900;
  color: #ffd23f;
}

.uploading-text {
  animation: retro-loading 1s linear infinite;
}

@keyframes retro-loading {
  0% { opacity: 0.5; }
  50% { opacity: 1; }
  100% { opacity: 0.5; }
}

.btn-glow {
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: linear-gradient(45deg, #06ffa5, #ffd23f, #ff6b35, #06ffa5);
  z-index: -1;
  filter: blur(8px);
  opacity: 0.7;
  animation: retro-btn-glow 2s linear infinite;
}

@keyframes retro-btn-glow {
  0% { opacity: 0.4; }
  50% { opacity: 0.8; }
  100% { opacity: 0.4; }
}

.progress-display {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: 
    linear-gradient(45deg, #1a1a2e 25%, transparent 25%),
    linear-gradient(-45deg, #1a1a2e 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #1a1a2e 75%),
    linear-gradient(-45deg, transparent 75%, #1a1a2e 75%);
  background-size: 6px 6px;
  background-position: 0 0, 0 3px, 3px -3px, -3px 0px;
  background-color: rgba(255, 210, 63, 0.1);
  border: 2px solid #ffd23f;
  transition: all 0.5s ease;
}

.progress-display.completed {
  animation: retro-fadeOut 3s ease forwards;
}

@keyframes retro-fadeOut {
  0% { 
    opacity: 1;
    transform: translateY(0);
  }
  70% { 
    opacity: 1;
    transform: translateY(0);
  }
  100% { 
    opacity: 0;
    transform: translateY(-20px);
  }
}

.progress-container {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.progress-bar {
  position: relative;
  width: 100%;
  height: 16px;
  background: 
    linear-gradient(45deg, #333 25%, transparent 25%),
    linear-gradient(-45deg, #333 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #333 75%),
    linear-gradient(-45deg, transparent 75%, #333 75%);
  background-size: 4px 4px;
  background-position: 0 0, 0 2px, 2px -2px, -2px 0px;
  background-color: #1a1a2e;
  border: 2px solid #06ffa5;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #06ffa5, #ffd23f, #ff6b35);
  transition: width 0.3s ease;
  animation: retro-progress-pulse 1s ease-in-out infinite alternate;
}

@keyframes retro-progress-pulse {
  0% { 
    box-shadow: inset 0 0 20px rgba(6, 255, 165, 0.5);
  }
  100% { 
    box-shadow: inset 0 0 30px rgba(6, 255, 165, 0.8);
  }
}

.progress-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    linear-gradient(45deg, rgba(0, 0, 0, 0.2) 25%, transparent 25%),
    linear-gradient(-45deg, rgba(0, 0, 0, 0.2) 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, rgba(0, 0, 0, 0.2) 75%),
    linear-gradient(-45deg, transparent 75%, rgba(0, 0, 0, 0.2) 75%);
  background-size: 6px 6px;
  background-position: 0 0, 0 3px, 3px -3px, -3px 0px;
  animation: retro-progress-move 2s linear infinite;
}

@keyframes retro-progress-move {
  0% { transform: translateX(0); }
  100% { transform: translateX(12px); }
}

.progress-status {
  text-align: center;
  font-size: 0.85rem;
  color: #ffd23f;
  font-weight: 700;
  letter-spacing: 1px;
  text-shadow: 1px 1px 0 #000;
}

.uploaded-files-display {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: 
    linear-gradient(45deg, #1a1a2e 25%, transparent 25%),
    linear-gradient(-45deg, #1a1a2e 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #1a1a2e 75%),
    linear-gradient(-45deg, transparent 75%, #1a1a2e 75%);
  background-size: 6px 6px;
  background-position: 0 0, 0 3px, 3px -3px, -3px 0px;
  background-color: rgba(6, 255, 165, 0.1);
  border: 2px solid #06ffa5;
  max-height: 250px;
}

.uploaded-files-list {
  max-height: 180px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.uploaded-file-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: rgba(255, 210, 63, 0.1);
  border: 1px solid #ffd23f;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.uploaded-file-item:hover {
  background: rgba(255, 210, 63, 0.2);
  border-color: #f7931e;
}

.uploaded-file-item.newly-uploaded {
  background: rgba(6, 255, 165, 0.2);
  border-color: #06ffa5;
  box-shadow: 0 0 15px rgba(6, 255, 165, 0.3);
}

.file-status-icon {
  color: #ffd23f;
  font-weight: 900;
  font-size: 1.1rem;
  flex-shrink: 0;
}

.uploaded-file-item.newly-uploaded .file-status-icon {
  color: #06ffa5;
}

.uploaded-file-name {
  color: #06ffa5;
  word-break: break-all;
  flex: 1;
  text-shadow: 1px 1px 0 #000;
}

.new-badge {
  background: #06ffa5;
  color: #000;
  font-size: 0.7rem;
  font-weight: 900;
  padding: 0.2rem 0.5rem;
  letter-spacing: 1px;
  text-shadow: none;
  animation: retro-new-badge 2s ease-in-out infinite alternate;
}

@keyframes retro-new-badge {
  0% { 
    background: #06ffa5;
    box-shadow: 0 0 10px rgba(6, 255, 165, 0.5);
  }
  100% { 
    background: #ffd23f;
    box-shadow: 0 0 15px rgba(255, 210, 63, 0.8);
  }
}

.actions-area {
  text-align: center;
}

.retro-clear-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  font-family: 'Orbitron', monospace;
  font-size: 0.9rem;
  font-weight: 700;
  background: 
    linear-gradient(45deg, #ff3333 25%, transparent 25%),
    linear-gradient(-45deg, #ff3333 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #ff3333 75%),
    linear-gradient(-45deg, transparent 75%, #ff3333 75%);
  background-size: 6px 6px;
  background-position: 0 0, 0 3px, 3px -3px, -3px 0px;
  background-color: #cc0000;
  color: #ffff00;
  border: 2px solid #ff3333;
  cursor: pointer;
  transition: all 0.3s ease;
  letter-spacing: 1px;
  text-shadow: 1px 1px 0 #000;
  box-shadow: 0 0 15px rgba(255, 51, 51, 0.3);
}

.retro-clear-btn:hover:not(:disabled) {
  background-color: #ff3333;
  color: #ffffff;
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(255, 51, 51, 0.5);
}

.retro-clear-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.retro-clear-btn.expired {
  background-color: #666;
  border-color: #999;
  color: #ccc;
  box-shadow: none;
}

.retro-clear-btn.expired:hover {
  background-color: #666;
  color: #ccc;
  transform: none;
  box-shadow: none;
}

.clear-icon {
  font-size: 1rem;
}

/* 浮动像素粒子效果 */
.pixel-particles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
}

.pixel {
  position: absolute;
  width: 6px;
  height: 6px;
  background: #06ffa5;
  animation: retro-float 10s linear infinite;
  animation-delay: var(--delay, 0s);
  left: var(--x, 50%);
  opacity: 0;
  box-shadow: 0 0 15px #06ffa5;
}

.pixel:nth-child(2n) {
  background: #ffd23f;
  box-shadow: 0 0 15px #ffd23f;
}

.pixel:nth-child(3n) {
  background: #ff6b35;
  box-shadow: 0 0 15px #ff6b35;
}

.pixel:nth-child(4n) {
  background: #f7931e;
  box-shadow: 0 0 15px #f7931e;
}

@keyframes retro-float {
  0% {
    transform: translateY(100vh) scale(0) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: 1;
    transform: translateY(90vh) scale(1) rotate(45deg);
  }
  90% {
    opacity: 1;
    transform: translateY(-10vh) scale(1) rotate(315deg);
  }
  100% {
    transform: translateY(-20vh) scale(0) rotate(360deg);
    opacity: 0;
  }
}

/* 滚动条样式 */
.files-list::-webkit-scrollbar,
.uploaded-files-list::-webkit-scrollbar,
.retro-content::-webkit-scrollbar {
  width: 8px;
}

.files-list::-webkit-scrollbar-track,
.uploaded-files-list::-webkit-scrollbar-track,
.retro-content::-webkit-scrollbar-track {
  background: #1a1a2e;
  border: 1px solid #06ffa5;
}

.files-list::-webkit-scrollbar-thumb,
.uploaded-files-list::-webkit-scrollbar-thumb,
.retro-content::-webkit-scrollbar-thumb {
  background: #06ffa5;
  box-shadow: 0 0 10px rgba(6, 255, 165, 0.5);
}

.files-list::-webkit-scrollbar-thumb:hover,
.uploaded-files-list::-webkit-scrollbar-thumb:hover,
.retro-content::-webkit-scrollbar-thumb:hover {
  background: #ffd23f;
  box-shadow: 0 0 15px rgba(255, 210, 63, 0.8);
}

@media (max-width: 768px) {
  .retro-container {
    padding: 1rem;
    align-items: flex-start;
  }
  
  .retro-content {
    padding: 1.5rem;
    max-height: calc(100vh - 2rem);
    margin: 1rem 0;
  }
  
  .retro-title {
    font-size: 1.3rem;
    letter-spacing: 1px;
  }
  
  .selector-grid {
    grid-template-columns: 1fr;
  }
  
  .selected-files-display,
  .uploaded-files-display {
    max-height: 180px;
  }
  
  .files-list,
  .uploaded-files-list {
    max-height: 120px;
  }

  .retro-expired-banner {
    top: 10px;
    left: 10px;
    right: 10px;
    transform: none;
    max-width: calc(100vw - 20px);
  }
}

@media (max-width: 480px) {
  .retro-content {
    padding: 1rem;
  }
  
  .retro-title {
    font-size: 1.1rem;
  }
  
  .title-icon {
    display: none;
  }
  
  .retro-upload-btn {
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
    letter-spacing: 1px;
  }
  
  .btn-brackets {
    font-size: 1.2rem;
  }
  
  .storage-display,
  .selected-files-display,
  .uploaded-files-display,
  .progress-display {
    padding: 1rem;
  }
}
</style>