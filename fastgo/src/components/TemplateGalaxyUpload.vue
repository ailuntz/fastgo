<template>
  <div class="galaxy-container">
    <div class="galaxy-stars"></div>
    <div class="galaxy-content">
      <!-- 过期横幅 -->
      <div v-if="isExpired" class="galaxy-expired-banner">
        <div class="galaxy-expired-content">
          <div class="constellation-icon">✦</div>
          <h2 class="expired-title">星际传输已终止</h2>
          <p class="expired-message">该传输通道已关闭，无法继续上传文件</p>
        </div>
      </div>
      
      <div class="galaxy-header">
        <div class="galaxy-logo">
          <div class="star-cluster">
            <span class="star">✦</span>
            <span class="star">★</span>
            <span class="star">✧</span>
          </div>
          <h1 class="galaxy-title">Galaxy Upload Station</h1>
        </div>
        <div class="nebula-effect"></div>
      </div>

      <div class="galaxy-card">
        <div class="card-glow"></div>
        
        <!-- 容量信息 -->
        <div class="capacity-info">
          <div class="cosmic-gauge">
            <div class="gauge-track"></div>
            <div 
              class="gauge-fill" 
              :style="{ width: getCapacityPercentage() + '%' }"
            ></div>
            <div class="gauge-content">
              <span class="capacity-text">存储空间</span>
              <span class="capacity-value">{{ getUsedCapacity() }} / {{ getTotalCapacity() }}</span>
            </div>
          </div>
        </div>

        <!-- 文件选择区域 -->
        <div class="upload-zone">
          <div class="zone-content">
            <div class="upload-icon">🚀</div>
            <h3 class="zone-title">选择要传输的文件</h3>
            <p class="zone-description">支持单个文件或整个文件夹的星际传输</p>
            
            <div class="file-inputs">
              <label class="file-input-label">
                <input
                  type="file"
                  multiple
                  @change="handleSingleFileChange"
                  :disabled="isExpired"
                >
                <span class="input-text">选择文件</span>
              </label>
              
              <label class="file-input-label">
                <input
                  type="file"
                  webkitdirectory
                  @change="handleFolderChange"
                  :disabled="isExpired"
                >
                <span class="input-text">选择文件夹</span>
              </label>
            </div>
          </div>
        </div>

        <!-- 选中的文件列表 -->
        <div v-if="selectedFiles.length > 0" class="selected-files">
          <h4 class="files-title">
            <span class="title-icon">📁</span>
            待传输文件 ({{ selectedFiles.length }})
          </h4>
          <div class="files-list">
            <div 
              v-for="(file, index) in selectedFiles.slice(0, 5)" 
              :key="index" 
              class="file-item"
            >
              <span class="file-icon">📄</span>
              <span class="file-name">{{ getRelativePath(file) }}</span>
              <span class="file-size">{{ formatBytes(file.size) }}</span>
            </div>
            <div v-if="selectedFiles.length > 5" class="more-files">
              +{{ selectedFiles.length - 5 }} 更多文件...
            </div>
          </div>
        </div>

        <!-- 上传按钮和进度 -->
        <div class="upload-section">
          <button 
            class="galaxy-upload-btn" 
            :class="{ 
              'uploading': uploading, 
              'disabled': uploading || selectedFiles.length === 0 || isExpired 
            }"
            @click="$emit('upload-clicked')"
            :disabled="uploading || selectedFiles.length === 0 || isExpired"
          >
            <div class="btn-background"></div>
            <span v-if="uploading" class="btn-text">
              <div class="orbit-loader">
                <div class="planet"></div>
              </div>
              星际传输中...
            </span>
            <span v-else-if="isExpired" class="btn-text">传输已终止</span>
            <span v-else class="btn-text">
              <span class="upload-icon">⬆</span>
              启动星际传输
            </span>
          </button>

          <!-- 上传进度 -->
          <div v-if="uploading && uploadProgress > 0" class="progress-container">
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: uploadProgress + '%' }"></div>
              <div class="progress-glow" :style="{ width: uploadProgress + '%' }"></div>
            </div>
            <span class="progress-text">{{ Math.round(uploadProgress) }}%</span>
          </div>

          <!-- 状态消息 -->
          <div v-if="uploadStatus" class="status-message" :class="getStatusClass()">
            <span class="status-text">{{ uploadStatus }}</span>
          </div>
        </div>

        <!-- 服务器文件列表 -->
        <div v-if="serverFiles.length > 0" class="server-files">
          <div class="server-header">
            <h4 class="server-title">
              <span class="title-icon">🌌</span>
              星际存储库
            </h4>
            <button class="refresh-btn" @click="$emit('refresh-files')">🔄</button>
          </div>
          <div class="server-files-list">
            <div 
              v-for="(file, index) in serverFiles" 
              :key="index" 
              class="server-file-item"
            >
              <span class="file-icon">📄</span>
              <span class="file-name">{{ file }}</span>
            </div>
          </div>
          <button 
            class="clear-storage-btn" 
            @click="$emit('clear-storage')"
            :disabled="isExpired"
          >
            <span class="clear-icon">🗑️</span>
            清空星际存储
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
    tokenInfo: {
      type: Object as PropType<TokenInfo>,
      required: true
    },
    uploading: {
      type: Boolean,
      default: false
    },
    uploadProgress: {
      type: Number,
      default: 0
    },
    uploadStatus: {
      type: String,
      default: ''
    },
    uploadedFiles: {
      type: Array as PropType<string[]>,
      default: () => []
    },
    serverFiles: {
      type: Array as PropType<string[]>,
      default: () => []
    },
    selectedFiles: {
      type: Array as PropType<File[]>,
      default: () => []
    },
    isExpired: {
      type: Boolean,
      default: false
    }
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

    const getRelativePath = (file: File) => {
      return (file as any).webkitRelativePath || file.name;
    };

    const formatBytes = (bytes: number) => {
      if (bytes === 0) return '0 B';
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    const getCapacityPercentage = () => {
      if (!props.tokenInfo.max_storage_bytes) return 0;
      return Math.min(((props.tokenInfo.used_bytes || 0) / props.tokenInfo.max_storage_bytes) * 100, 100);
    };

    const getUsedCapacity = () => {
      return formatBytes(props.tokenInfo.used_bytes || 0);
    };

    const getTotalCapacity = () => {
      return formatBytes(props.tokenInfo.max_storage_bytes || 0);
    };

    const getStatusClass = () => {
      if (!props.uploadStatus) return '';
      const status = props.uploadStatus.toLowerCase();
      if (status.includes('成功') || status.includes('success')) return 'success';
      if (status.includes('失败') || status.includes('failed') || status.includes('错误')) return 'error';
      if (status.includes('空间') || status.includes('storage') || status.includes('限制')) return 'warning';
      return 'info';
    };

    return {
      handleSingleFileChange,
      handleFolderChange,
      getRelativePath,
      formatBytes,
      getCapacityPercentage,
      getUsedCapacity,
      getTotalCapacity,
      getStatusClass
    };
  }
});
</script>

<style scoped>
.galaxy-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #0c0c0c 0%, #1a0b2e 25%, #16213e 50%, #0f1419 100%);
  position: relative;
  overflow-x: hidden;
  overflow-y: auto;
  font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;
}

.galaxy-stars {
  position: absolute;
  width: 100%;
  height: 100%;
  background-image: 
    radial-gradient(2px 2px at 20% 30%, #fff, transparent),
    radial-gradient(2px 2px at 40% 70%, rgba(255,255,255,0.8), transparent),
    radial-gradient(1px 1px at 90% 40%, rgba(255,255,255,0.6), transparent),
    radial-gradient(1px 1px at 60% 10%, #fff, transparent),
    radial-gradient(2px 2px at 80% 80%, rgba(255,255,255,0.7), transparent);
  background-repeat: repeat;
  background-size: 550px 400px;
  animation: twinkle 8s ease-in-out infinite;
  opacity: 0.6;
}

@keyframes twinkle {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}

.galaxy-content {
  position: relative;
  z-index: 2;
  padding: 2rem;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding-top: 4rem;
  overflow-y: auto;
}

.galaxy-expired-banner {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: linear-gradient(45deg, rgba(220, 20, 60, 0.95), rgba(139, 0, 139, 0.95));
  backdrop-filter: blur(10px);
  border-bottom: 2px solid rgba(255, 255, 255, 0.3);
  z-index: 1000;
  padding: 1.5rem 0;
}

.galaxy-expired-content {
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
  color: white;
}

.constellation-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  animation: pulse 2s ease-in-out infinite;
}

.expired-title {
  font-size: 1.8rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

.expired-message {
  font-size: 1.1rem;
  margin: 0;
  opacity: 0.9;
}

.galaxy-header {
  text-align: center;
  margin-bottom: 2rem;
  position: relative;
}

.galaxy-logo {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.star-cluster {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.star {
  color: #64ffda;
  font-size: 1.5rem;
  animation: sparkle 3s ease-in-out infinite;
}

.star:nth-child(2) {
  animation-delay: 1s;
  color: #bb86fc;
}

.star:nth-child(3) {
  animation-delay: 2s;
  color: #03dac6;
}

@keyframes sparkle {
  0%, 100% { 
    opacity: 0.5; 
    transform: scale(1);
  }
  50% { 
    opacity: 1; 
    transform: scale(1.2);
  }
}

.galaxy-title {
  font-size: 2.2rem;
  font-weight: 300;
  color: #ffffff;
  margin: 0;
  text-shadow: 0 0 20px rgba(100, 255, 218, 0.3);
  letter-spacing: 2px;
}

.nebula-effect {
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
  width: 200px;
  height: 100px;
  background: radial-gradient(ellipse, rgba(100, 255, 218, 0.1) 0%, transparent 70%);
  animation: nebula 6s ease-in-out infinite;
}

@keyframes nebula {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.6; }
}

.galaxy-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 2rem;
  width: 100%;
  max-width: 600px;
  position: relative;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  margin-bottom: 2rem;
  max-height: 70vh;
  overflow-y: auto;
}

.card-glow {
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -400px;
  background: linear-gradient(45deg, rgba(100, 255, 218, 0.3), rgba(187, 134, 252, 0.3));
  border-radius: 20px;
  z-index: -1;
  opacity: 0;
  animation: glow 4s ease-in-out infinite;
}

@keyframes glow {
  0%, 100% { opacity: 0; }
  50% { opacity: 0.5; }
}

.capacity-info {
  margin-bottom: 2rem;
}

.cosmic-gauge {
  position: relative;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 15px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.gauge-track {
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
}

.gauge-fill {
  height: 100%;
  background: linear-gradient(90deg, #64ffda, #bb86fc);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.gauge-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
}

.upload-zone {
  border: 2px dashed rgba(100, 255, 218, 0.3);
  border-radius: 15px;
  padding: 2rem;
  text-align: center;
  margin-bottom: 2rem;
  transition: all 0.3s ease;
}

.upload-zone:hover {
  border-color: rgba(100, 255, 218, 0.5);
  background: rgba(100, 255, 218, 0.02);
}

.zone-content {
  color: #ffffff;
}

.upload-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  filter: hue-rotate(180deg);
}

.zone-title {
  font-size: 1.3rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  color: #64ffda;
}

.zone-description {
  color: rgba(255, 255, 255, 0.7);
  margin: 0 0 2rem 0;
  font-size: 0.95rem;
}

.file-inputs {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.file-input-label {
  position: relative;
  cursor: pointer;
  padding: 0.8rem 2rem;
  background: transparent;
  border: 1px solid #64ffda;
  border-radius: 25px;
  color: #64ffda;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.3s ease;
  overflow: hidden;
}

.file-input-label:hover {
  box-shadow: 0 0 15px rgba(100, 255, 218, 0.3);
  transform: translateY(-1px);
}

.file-input-label input[type="file"] {
  position: absolute;
  left: -9999px;
  opacity: 0;
}

.selected-files {
  margin-bottom: 2rem;
}

.files-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #64ffda;
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.files-list {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 10px;
  padding: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.05);
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

.upload-section {
  text-align: center;
  margin-bottom: 2rem;
}

.galaxy-upload-btn {
  position: relative;
  width: 100%;
  padding: 1rem 2rem;
  background: transparent;
  border: 2px solid #64ffda;
  border-radius: 50px;
  color: #64ffda;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.btn-background {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(100, 255, 218, 0.1), transparent);
  transition: left 0.6s ease;
}

.galaxy-upload-btn:hover .btn-background {
  left: 100%;
}

.galaxy-upload-btn:hover {
  box-shadow: 
    0 0 20px rgba(100, 255, 218, 0.4),
    inset 0 0 20px rgba(100, 255, 218, 0.1);
  transform: translateY(-2px);
}

.galaxy-upload-btn.uploading {
  border-color: #bb86fc;
  color: #bb86fc;
}

.galaxy-upload-btn.disabled {
  border-color: rgba(255, 255, 255, 0.3);
  color: rgba(255, 255, 255, 0.5);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.btn-text {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.upload-icon {
  font-size: 1.2rem;
}

.orbit-loader {
  width: 20px;
  height: 20px;
  position: relative;
  margin-right: 0.5rem;
}

.planet {
  width: 6px;
  height: 6px;
  background: #bb86fc;
  border-radius: 50%;
  position: absolute;
  top: 50%;
  left: 50%;
  animation: orbit 1s linear infinite;
  transform-origin: 10px 0;
}

@keyframes orbit {
  from { transform: rotate(0deg) translateX(10px) rotate(0deg); }
  to { transform: rotate(360deg) translateX(10px) rotate(-360deg); }
}

.progress-container {
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
  background: linear-gradient(90deg, #64ffda, #bb86fc);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.progress-glow {
  position: absolute;
  top: 0;
  height: 100%;
  background: rgba(100, 255, 218, 0.3);
  border-radius: 4px;
  filter: blur(4px);
}

.progress-text {
  color: #64ffda;
  font-size: 0.9rem;
  font-weight: 600;
}

.status-message {
  margin-top: 1rem;
  padding: 0.8rem 1rem;
  border-radius: 10px;
  font-size: 0.9rem;
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
  background: rgba(100, 255, 218, 0.1);
  border: 1px solid rgba(100, 255, 218, 0.3);
  color: #64ffda;
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
  font-size: 1.1rem;
  font-weight: 600;
  color: #64ffda;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
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
  border-color: #64ffda;
  color: #64ffda;
  transform: rotate(180deg);
}

.server-files-list {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 10px;
  padding: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.05);
  margin-bottom: 1rem;
  max-height: 200px;
  overflow-y: auto;
}

.server-file-item {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
}

.server-file-item:last-child {
  border-bottom: none;
}

.clear-storage-btn {
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
}

.clear-storage-btn:hover {
  background: rgba(255, 82, 82, 0.1);
  box-shadow: 0 0 15px rgba(255, 82, 82, 0.3);
}

.clear-storage-btn:disabled {
  border-color: rgba(255, 255, 255, 0.3);
  color: rgba(255, 255, 255, 0.5);
  cursor: not-allowed;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .galaxy-content {
    padding: 1rem;
    padding-top: 2rem;
  }
  
  .galaxy-card {
    padding: 1.5rem;
  }
  
  .galaxy-title {
    font-size: 1.8rem;
  }
  
  .file-inputs {
    flex-direction: column;
    align-items: center;
  }
  
  .file-input-label {
    width: 100%;
    max-width: 300px;
    text-align: center;
  }
}
</style>