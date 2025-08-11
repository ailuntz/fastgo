<template>
  <div class="neon-container">
    <div class="neon-grid"></div>
    <div class="neon-content">
      <!-- 过期横幅 -->
      <div v-if="isExpired" class="neon-expired-banner">
        <div class="neon-expired-content">
          <div class="neon-skull">⚠</div>
          <h2 class="expired-title">CONNECTION LOST</h2>
          <p class="expired-message">Upload service terminated • Access denied</p>
        </div>
      </div>
      
      <div class="neon-header">
        <div class="neon-logo">
          <div class="logo-glow">
            <span class="neon-text">N</span>
            <span class="neon-text">E</span>
            <span class="neon-text">O</span>
            <span class="neon-text">N</span>
          </div>
          <h1 class="neon-title">UPLOAD STATION</h1>
          <div class="subtitle">CYBERNET PROTOCOL v3.0</div>
        </div>
      </div>

      <div class="neon-card">
        <div class="card-glow-border"></div>
        <div class="card-content">
          <!-- 存储容量 -->
          <div class="capacity-display">
            <div class="display-header">
              <div class="status-indicators">
                <span class="indicator active"></span>
                <span class="indicator" :class="{ 'warn': ((tokenInfo.used_bytes || 0) / (tokenInfo.max_storage_bytes || 1)) * 100 > 80 }"></span>
                <span class="indicator" :class="{ 'error': ((tokenInfo.used_bytes || 0) / (tokenInfo.max_storage_bytes || 1)) * 100 > 95 }"></span>
              </div>
              <div class="header-text">STORAGE_CAPACITY.SYS</div>
            </div>
            
            <div class="capacity-bar">
              <div class="bar-track">
                <div class="bar-fill" :style="{ width: (((tokenInfo.used_bytes || 0) / (tokenInfo.max_storage_bytes || 1)) * 100) + '%' }"></div>
                <div class="bar-glow" :style="{ width: (((tokenInfo.used_bytes || 0) / (tokenInfo.max_storage_bytes || 1)) * 100) + '%' }"></div>
              </div>
              <div class="capacity-text">
                <span>{{ formatBytes(tokenInfo.used_bytes || 0) }} / {{ formatBytes(tokenInfo.max_storage_bytes || 0) }}</span>
                <span class="percentage">{{ Math.round(((tokenInfo.used_bytes || 0) / (tokenInfo.max_storage_bytes || 1)) * 100) }}%</span>
              </div>
            </div>
          </div>

          <!-- 文件选择区域 -->
          <div class="upload-zone">
            <div class="zone-header">
              <span class="zone-icon">⚡</span>
              <span class="zone-title">SELECT DATA FOR UPLOAD</span>
            </div>
            
            <div class="file-inputs">
              <label class="neon-input-label">
                <input 
                  type="file" 
                  multiple 
                  @change="handleSingleFileChange"
                  :disabled="isExpired"
                >
                <div class="input-content">
                  <span class="input-icon">📁</span>
                  <span class="input-text">SELECT FILES</span>
                </div>
                <div class="input-glow"></div>
              </label>
              
              <label class="neon-input-label">
                <input 
                  type="file" 
                  webkitdirectory 
                  @change="handleFolderChange"
                  :disabled="isExpired"
                >
                <div class="input-content">
                  <span class="input-icon">📂</span>
                  <span class="input-text">SELECT FOLDER</span>
                </div>
                <div class="input-glow"></div>
              </label>
            </div>
          </div>

          <!-- 选中文件列表 -->
          <div v-if="selectedFiles.length > 0" class="selected-files">
            <div class="files-header">
              <span class="files-icon">📋</span>
              <span class="files-title">SELECTED FILES ({{ selectedFiles.length }})</span>
            </div>
            <div class="files-list">
              <div 
                v-for="(file, index) in selectedFiles.slice(0, 4)" 
                :key="index" 
                class="file-item"
              >
                <span class="file-icon">💾</span>
                <span class="file-name">{{ getRelativePath(file) }}</span>
                <span class="file-size">{{ formatBytes(file.size) }}</span>
              </div>
              <div v-if="selectedFiles.length > 4" class="more-files">
                +{{ selectedFiles.length - 4 }} more files...
              </div>
            </div>
          </div>

          <!-- 上传控制 -->
          <div class="upload-control">
            <button 
              class="neon-upload-btn" 
              :class="{ 
                'uploading': uploading, 
                'disabled': uploading || selectedFiles.length === 0 || isExpired 
              }"
              @click="$emit('upload-clicked')"
              :disabled="uploading || selectedFiles.length === 0 || isExpired"
            >
              <div class="btn-glow"></div>
              <div class="btn-content">
                <span v-if="uploading" class="btn-text">
                  <div class="neon-spinner">
                    <div class="spinner-ring"></div>
                  </div>
                  UPLOADING...
                </span>
                <span v-else-if="isExpired" class="btn-text">CONNECTION LOST</span>
                <span v-else class="btn-text">
                  <span class="upload-arrow">↑</span>
                  START UPLOAD
                </span>
              </div>
            </button>

            <!-- 上传进度 -->
            <div v-if="uploading && uploadProgress > 0" class="progress-display">
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: uploadProgress + '%' }"></div>
                <div class="progress-glow" :style="{ width: uploadProgress + '%' }"></div>
                <div class="progress-text">{{ Math.round(uploadProgress) }}%</div>
              </div>
            </div>

            <!-- 状态消息 -->
            <div v-if="uploadStatus" class="status-message">
              <span class="status-icon">●</span>
              <span class="status-text">{{ uploadStatus }}</span>
            </div>
          </div>

          <!-- 服务器文件 -->
          <div v-if="serverFiles.length > 0" class="server-files">
            <div class="server-header">
              <span class="server-icon">🗄️</span>
              <span class="server-title">SERVER FILES</span>
              <button class="refresh-btn" @click="$emit('refresh-files')" title="Refresh">🔄</button>
            </div>
            <div class="server-list">
              <div 
                v-for="(file, index) in serverFiles" 
                :key="index" 
                class="server-file"
              >
                <span class="file-icon">💾</span>
                <span class="file-name">{{ file }}</span>
              </div>
            </div>
            <button 
              class="clear-btn" 
              @click="$emit('clear-storage')"
              :disabled="isExpired"
            >
              <span class="clear-icon">🗑️</span>
              CLEAR STORAGE
            </button>
          </div>
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
  setup(_, { emit }) {

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
      const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getRelativePath = (file: File) => {
      return (file as any).webkitRelativePath || file.name;
    };

    return {
      handleSingleFileChange,
      handleFolderChange,
      formatBytes,
      getRelativePath
    };
  }
});
</script>

<style scoped>
.neon-container {
  min-height: 100vh;
  background: 
    radial-gradient(circle at 20% 50%, rgba(255, 0, 150, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(0, 255, 255, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 40% 80%, rgba(255, 0, 255, 0.1) 0%, transparent 50%),
    linear-gradient(135deg, #0a0a0a 0%, #1a0f1a 50%, #0f0a1a 100%);
  position: relative;
  overflow-x: hidden;
  overflow-y: auto;
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', monospace;
}

.neon-grid {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    linear-gradient(rgba(255, 0, 150, 0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 0, 150, 0.1) 1px, transparent 1px);
  background-size: 50px 50px;
  animation: grid-pulse 4s ease-in-out infinite;
}

@keyframes grid-pulse {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.6; }
}

.neon-content {
  position: relative;
  z-index: 2;
  padding: 2rem;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding-top: 3rem;
  overflow-y: auto;
}

.neon-expired-banner {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: linear-gradient(45deg, rgba(255, 0, 150, 0.95), rgba(255, 0, 255, 0.95));
  backdrop-filter: blur(10px);
  border-bottom: 2px solid #ff0096;
  box-shadow: 0 0 20px rgba(255, 0, 150, 0.5);
  z-index: 1000;
  padding: 1.5rem 0;
}

.neon-expired-content {
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
  color: white;
}

.neon-skull {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #ff0096;
  text-shadow: 0 0 20px #ff0096;
  animation: neon-flicker 2s ease-in-out infinite;
}

.expired-title {
  font-size: 1.8rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  color: #00ffff;
  text-shadow: 0 0 20px #00ffff;
  letter-spacing: 3px;
}

.expired-message {
  font-size: 1.1rem;
  margin: 0;
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
}

.neon-header {
  text-align: center;
  margin-bottom: 2rem;
}

.neon-logo {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.logo-glow {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.neon-text {
  font-size: 3rem;
  font-weight: bold;
  color: #ff0096;
  text-shadow: 
    0 0 5px #ff0096,
    0 0 10px #ff0096,
    0 0 20px #ff0096,
    0 0 40px #ff0096;
  animation: neon-glow 3s ease-in-out infinite;
}

.neon-text:nth-child(2) {
  color: #00ffff;
  text-shadow: 
    0 0 5px #00ffff,
    0 0 10px #00ffff,
    0 0 20px #00ffff,
    0 0 40px #00ffff;
  animation-delay: 0.5s;
}

.neon-text:nth-child(3) {
  color: #ff00ff;
  text-shadow: 
    0 0 5px #ff00ff,
    0 0 10px #ff00ff,
    0 0 20px #ff00ff,
    0 0 40px #ff00ff;
  animation-delay: 1s;
}

.neon-text:nth-child(4) {
  color: #ffff00;
  text-shadow: 
    0 0 5px #ffff00,
    0 0 10px #ffff00,
    0 0 20px #ffff00,
    0 0 40px #ffff00;
  animation-delay: 1.5s;
}

@keyframes neon-glow {
  0%, 100% { 
    opacity: 1;
    transform: scale(1);
  }
  50% { 
    opacity: 0.8;
    transform: scale(1.05);
  }
}

.neon-title {
  font-size: 2.2rem;
  font-weight: 300;
  color: #ffffff;
  margin: 0;
  text-shadow: 
    0 0 5px #ffffff,
    0 0 10px #00ffff,
    0 0 20px #00ffff;
  letter-spacing: 6px;
}

.subtitle {
  color: rgba(255, 255, 255, 0.7);
  font-size: 1rem;
  letter-spacing: 2px;
  text-transform: uppercase;
  margin-top: 0.5rem;
}

.neon-card {
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 0, 150, 0.3);
  border-radius: 15px;
  padding: 0;
  width: 100%;
  max-width: 600px;
  position: relative;
  overflow: hidden;
  box-shadow: 
    0 0 30px rgba(255, 0, 150, 0.3),
    inset 0 0 30px rgba(255, 0, 150, 0.1);
  margin-bottom: 2rem;
  max-height: 70vh;
  overflow-y: auto;
}

.card-glow-border {
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -800px;
  background: linear-gradient(45deg, #ff0096, #00ffff, #ff00ff, #ffff00);
  border-radius: 15px;
  z-index: -1;
  opacity: 0;
  animation: border-glow 4s ease-in-out infinite;
}

@keyframes border-glow {
  0%, 100% { opacity: 0; }
  50% { opacity: 0.5; }
}

.card-content {
  padding: 2rem;
}

.capacity-display {
  margin-bottom: 2rem;
}

.display-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
  padding: 0.8rem 1rem;
  background: rgba(255, 0, 150, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(255, 0, 150, 0.2);
}

.status-indicators {
  display: flex;
  gap: 0.5rem;
}

.indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  animation: indicator-pulse 2s ease-in-out infinite;
}

.indicator.active {
  background: #00ff00;
  box-shadow: 0 0 10px #00ff00;
}

.indicator.warn {
  background: #ffff00;
  box-shadow: 0 0 10px #ffff00;
  animation-delay: 1s;
}

.indicator.error {
  background: #ff0000;
  box-shadow: 0 0 10px #ff0000;
  animation-delay: 2s;
}

@keyframes indicator-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.header-text {
  color: #ff0096;
  font-weight: bold;
  text-shadow: 0 0 5px #ff0096;
  letter-spacing: 1px;
}

.capacity-bar {
  margin-top: 1rem;
}

.bar-track {
  position: relative;
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #ff0096, #00ffff, #ff00ff);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.bar-glow {
  position: absolute;
  top: 0;
  height: 100%;
  background: rgba(255, 0, 150, 0.5);
  border-radius: 4px;
  filter: blur(4px);
}

.capacity-text {
  display: flex;
  justify-content: space-between;
  margin-top: 0.5rem;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.8);
}

.upload-zone {
  border: 2px dashed rgba(255, 0, 150, 0.3);
  border-radius: 15px;
  padding: 2rem;
  text-align: center;
  margin-bottom: 2rem;
  transition: all 0.3s ease;
}

.upload-zone:hover {
  border-color: rgba(255, 0, 150, 0.5);
  background: rgba(255, 0, 150, 0.05);
  box-shadow: 0 0 20px rgba(255, 0, 150, 0.2);
}

.zone-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  color: #ff0096;
  font-weight: bold;
  font-size: 1.1rem;
  text-shadow: 0 0 10px #ff0096;
}

.file-inputs {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.neon-input-label {
  position: relative;
  cursor: pointer;
  display: inline-block;
}

.neon-input-label input[type="file"] {
  position: absolute;
  left: -9999px;
  opacity: 0;
}

.input-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  background: rgba(0, 255, 255, 0.1);
  border: 2px solid #00ffff;
  border-radius: 25px;
  color: #00ffff;
  font-weight: bold;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.input-glow {
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: linear-gradient(45deg, #00ffff, transparent, #00ffff);
  border-radius: 25px;
  z-index: -1;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.neon-input-label:hover .input-glow {
  opacity: 0.5;
}

.neon-input-label:hover .input-content {
  background: rgba(0, 255, 255, 0.2);
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.5);
  text-shadow: 0 0 10px #00ffff;
  transform: translateY(-2px);
}

.selected-files {
  margin-bottom: 2rem;
}

.files-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  color: #ff0096;
  font-weight: bold;
  text-shadow: 0 0 5px #ff0096;
}

.files-list {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 1rem;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
}

.file-item:last-child {
  border-bottom: none;
}

.file-name {
  flex: 1;
  word-break: break-all;
}

.file-size {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.8rem;
}

.more-files {
  color: rgba(255, 255, 255, 0.6);
  font-style: italic;
  text-align: center;
  padding: 0.5rem 0;
}

.upload-control {
  text-align: center;
  margin-bottom: 2rem;
}

.neon-upload-btn {
  position: relative;
  width: 100%;
  padding: 1.2rem 2rem;
  background: rgba(255, 0, 150, 0.1);
  border: 2px solid #ff0096;
  border-radius: 50px;
  color: #ff0096;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;
  text-transform: uppercase;
  letter-spacing: 2px;
}

.btn-glow {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255, 0, 150, 0.1) 0%, transparent 70%);
  animation: btn-rotate 3s linear infinite;
  opacity: 0;
  transition: opacity 0.3s ease;
}

@keyframes btn-rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.neon-upload-btn:hover .btn-glow {
  opacity: 1;
}

.neon-upload-btn:hover {
  background: rgba(255, 0, 150, 0.2);
  box-shadow: 
    0 0 20px rgba(255, 0, 150, 0.5),
    inset 0 0 20px rgba(255, 0, 150, 0.1);
  text-shadow: 0 0 10px #ff0096;
  transform: translateY(-2px);
}

.neon-upload-btn.uploading {
  border-color: #00ffff;
  color: #00ffff;
  background: rgba(0, 255, 255, 0.1);
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.5);
}

.neon-upload-btn.disabled {
  border-color: #666;
  color: #666;
  cursor: not-allowed;
  background: rgba(255, 255, 255, 0.05);
  transform: none;
  box-shadow: none;
}

.btn-content {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.8rem;
}

.upload-arrow {
  font-size: 1.3rem;
  animation: arrow-bounce 2s ease-in-out infinite;
}

@keyframes arrow-bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-3px); }
}

.neon-spinner {
  position: relative;
  width: 20px;
  height: 20px;
}

.spinner-ring {
  position: absolute;
  width: 20px;
  height: 20px;
  border: 2px solid transparent;
  border-top: 2px solid #00ffff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.progress-display {
  margin-top: 1rem;
}

.progress-bar {
  position: relative;
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #ff0096, #00ffff);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.progress-glow {
  position: absolute;
  top: 0;
  height: 100%;
  background: rgba(255, 0, 150, 0.3);
  border-radius: 4px;
  filter: blur(4px);
}

.progress-text {
  color: #ff0096;
  font-size: 0.9rem;
  font-weight: 600;
  text-shadow: 0 0 5px #ff0096;
}

.status-message {
  margin-top: 1rem;
  padding: 0.8rem 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.status-message.success {
  background: rgba(76, 175, 80, 0.1);
  border: 1px solid rgba(76, 175, 80, 0.3);
  color: #4caf50;
}

.status-message.error {
  background: rgba(255, 82, 82, 0.1);
  border: 1px solid rgba(255, 82, 82, 0.3);
  color: #ff5252;
}

.status-message.warning {
  background: rgba(255, 193, 7, 0.1);
  border: 1px solid rgba(255, 193, 7, 0.3);
  color: #ffc107;
}

.status-message.info {
  background: rgba(255, 0, 150, 0.1);
  border: 1px solid rgba(255, 0, 150, 0.3);
  color: #ff0096;
}

.server-files {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 2rem;
}

.server-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.server-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #ff0096;
  font-weight: bold;
  text-shadow: 0 0 5px #ff0096;
}

.refresh-btn {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.refresh-btn:hover {
  border-color: #00ffff;
  color: #00ffff;
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.3);
  transform: rotate(180deg);
}

.server-list {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 1rem;
  margin-bottom: 1rem;
  max-height: 200px;
  overflow-y: auto;
}

.server-file {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
}

.server-file:last-child {
  border-bottom: none;
}

.clear-btn {
  width: 100%;
  padding: 0.8rem 1.5rem;
  background: transparent;
  border: 1px solid #ff5252;
  border-radius: 25px;
  color: #ff5252;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  text-transform: uppercase;
  font-weight: bold;
}

.clear-btn:hover {
  background: rgba(255, 82, 82, 0.1);
  box-shadow: 0 0 15px rgba(255, 82, 82, 0.3);
  text-shadow: 0 0 5px #ff5252;
}

.clear-btn:disabled {
  border-color: rgba(255, 255, 255, 0.3);
  color: rgba(255, 255, 255, 0.5);
  cursor: not-allowed;
}

@keyframes neon-flicker {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
  75% { opacity: 0.9; }
  85% { opacity: 0.7; }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .neon-content {
    padding: 1rem;
    padding-top: 2rem;
  }
  
  .card-content {
    padding: 1.5rem;
  }
  
  .neon-title {
    font-size: 1.8rem;
  }
  
  .logo-glow {
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.5rem;
  }
  
  .neon-text {
    font-size: 2rem;
  }
  
  .file-inputs {
    flex-direction: column;
    align-items: center;
  }
  
  .neon-input-label {
    width: 100%;
    max-width: 300px;
  }
  
  .input-content {
    width: 100%;
    justify-content: center;
  }
  
  .display-header {
    flex-direction: column;
    gap: 0.5rem;
    text-align: center;
  }
  
  .server-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
}
</style>