<template>
  <div class="default-container">
    <!-- 简约风格过期横幅 -->
    <div v-if="isExpired" class="default-expired-banner">
      <div class="default-expired-content">
        <span class="expired-icon">⚠️</span>
        <span class="expired-message">此上传链接已过期</span>
      </div>
    </div>
    
    <div class="upload-content">
      <!-- Upload Icon -->
      <div class="upload-icon">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M17 8L12 3L7 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M12 3V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>

      <!-- Title -->
      <h1>文件上传</h1>
      
      <!-- Storage Info -->
      <div class="storage-info">
        <div class="storage-bar">
          <div 
            class="storage-fill" 
            :style="{ width: (((tokenInfo.used_bytes || 0) / (tokenInfo.max_storage_bytes || 1)) * 100) + '%' }"
          ></div>
        </div>
        <p class="storage-text">
          {{ formatBytes(tokenInfo.used_bytes || 0) }} / {{ formatBytes(tokenInfo.max_storage_bytes || 0) }} 已使用
        </p>
      </div>

      <!-- File Selection -->
      <div class="file-selectors">
        <div class="selector-row">
          <label class="file-selector" :class="{ 'disabled': uploading || isExpired, 'expired': isExpired }">
            <input 
              type="file" 
              @change="handleSingleFileChange"
              :disabled="uploading || isExpired"
              style="display: none;"
            />
            <svg class="selector-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M14 2V8H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            {{ isExpired ? '已过期' : '选择文件' }}
          </label>
          
          <label class="file-selector" :class="{ 'disabled': uploading || isExpired, 'expired': isExpired }">
            <input 
              type="file" 
              webkitdirectory 
              directory 
              multiple
              @change="handleFolderChange"
              :disabled="uploading || isExpired"
              style="display: none;"
            />
            <svg class="selector-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22 19C22 19.5304 21.7893 20.0391 21.4142 20.4142C21.0391 20.7893 20.5304 21 20 21H4C3.46957 21 2.96086 20.7893 2.58579 20.4142C2.21071 20.0391 2 19.5304 2 19V5C2 4.46957 2.21071 3.96086 2.58579 3.58579C2.96086 3.21071 3.46957 3 4 3H9L11 6H20C20.5304 6 21.0391 6.21071 21.4142 6.58579C21.7893 6.96086 22 7.46957 22 8V19Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            {{ isExpired ? '已过期' : '选择文件夹' }}
          </label>
        </div>
      </div>

      <!-- Selected Files Preview -->
      <div v-if="selectedFiles.length > 0 " class="selected-files">
        <div class="files-count">已选择 {{ selectedFiles.length }} 个文件</div>
        <div class="files-preview">
          <div 
            v-for="file in selectedFiles.slice(0, 3)" 
            :key="file.name"
            class="file-preview"
          >
            📄 {{ getRelativePath(file) }}
          </div>
          <div v-if="selectedFiles.length > 3" class="more-files">
            还有 {{ selectedFiles.length - 3 }} 个文件...
          </div>
        </div>
      </div>

      <!-- Upload Button -->
      <button 
        class="upload-button"
        :class="{ 'uploading': uploading, 'expired': isExpired }"
        :disabled="uploading || selectedFiles.length === 0 || isExpired"
        @click="$emit('upload-clicked')"
      >
        <svg v-if="!uploading && !isExpired" class="upload-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M17 8L12 3L7 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M12 3V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <svg v-if="isExpired" class="expire-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <div v-if="uploading" class="spinner"></div>
        {{ isExpired ? '功能已过期' : (uploading ? '上传中...' : '开始上传') }}
      </button>

      <!-- Progress -->
      <div v-if="uploading || uploadProgress > 0" class="progress-section" :class="{ 'completed': uploadProgress === 100 }">
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: uploadProgress + '%' }"></div>
        </div>
        <div class="progress-info">
          <span class="progress-percent">{{ Math.round(uploadProgress) }}%</span>
          <span class="progress-status">{{ uploadStatus }}</span>
        </div>
      </div>

      <!-- Uploaded Files -->
      <div v-if="serverFiles.length > 0" class="uploaded-files">
        <h3>已上传的文件</h3>
        <div class="files-list">
          <div 
            v-for="file in serverFiles" 
            :key="file"
            class="file-item"
            :class="getFileStatus(file)"
          >
            <span class="file-icon">{{ getFileIcon(file) }}</span>
            <span class="file-name">{{ file }}</span>
          </div>
        </div>
      </div>

      <!-- Clear Storage -->
      <div class="actions">
        <button 
          class="clear-button"
          :class="{ 'expired': isExpired }"
          @click="$emit('clear-storage')"
          :disabled="uploading || isExpired"
        >
          {{ isExpired ? '功能已过期' : '清空所有文件' }}
        </button>
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
      const files = Array.from(target.files);
      const hasFolder = files.some(file => file.webkitRelativePath && file.webkitRelativePath.includes('/'));
      if (!hasFolder) {
        alert('请确保选择的是文件夹，而不是单个文件');
        target.value = '';
        return;
      }
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
        return '🆕';
      }
      return '📄';
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
.default-container {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: 100vh;
  width: 100vw;
  margin: 0;
  padding: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: fixed;
  top: 0;
  left: 0;
  box-sizing: border-box;
  overflow-y: auto;
}

.upload-content {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 2rem;
  max-width: 500px;
  width: 100%;
  height: 85vh;
  text-align: center;
  box-sizing: border-box;
  margin: 2rem 0;
  overflow-y: auto;
  box-shadow: 
    0 20px 40px rgba(0, 0, 0, 0.1),
    0 8px 32px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.18);
}

.upload-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #007AFF, #5856D6);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 2rem;
  color: white;
  box-shadow: 0 8px 16px rgba(0, 122, 255, 0.3);
}

.upload-icon svg {
  width: 40px;
  height: 40px;
}

h1 {
  font-size: 2rem;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0 0 2rem 0;
  line-height: 1.2;
}

.storage-info {
  margin-bottom: 2rem;
}

.storage-bar {
  width: 100%;
  height: 8px;
  background: #e5e5e7;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.storage-fill {
  height: 100%;
  background: linear-gradient(90deg, #007AFF, #5856D6);
  transition: width 0.3s ease;
  border-radius: 4px;
}

.storage-text {
  font-size: 0.9rem;
  color: #86868b;
  margin: 0;
}

.file-selectors {
  margin-bottom: 2rem;
}

.selector-row {
  display: flex;
  gap: 1rem;
}

.file-selector {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1.5rem;
  background: #f5f5f7;
  border: 2px dashed #c7c7cc;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
  font-weight: 500;
  color: #1d1d1f;
}

.file-selector:hover:not(.disabled) {
  background: #e8e8ed;
  border-color: #007AFF;
  color: #007AFF;
}

.file-selector.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.file-selector.expired {
  background: #ffebee;
  border-color: #f44336;
  color: #d32f2f;
  opacity: 0.8;
}

.file-selector.expired:hover {
  background: #ffebee;
  border-color: #f44336;
  color: #d32f2f;
  transform: none;
}

.selector-icon {
  width: 24px;
  height: 24px;
  color: currentColor;
}

.selected-files {
  background: #f5f5f7;
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 2rem;
  text-align: left;
  max-height: 120px;
}

.files-count {
  font-size: 0.9rem;
  color: #86868b;
  font-weight: 500;
  margin-bottom: 0.75rem;
}

.files-preview {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 80px;
  overflow-y: auto;
}

.file-preview {
  font-size: 0.85rem;
  color: #1d1d1f;
  padding: 0.25rem 0;
}

.more-files {
  font-size: 0.8rem;
  color: #86868b;
  font-style: italic;
}

.upload-button {
  width: 100%;
  padding: 1rem 2rem;
  font-size: 1.1rem;
  font-weight: 600;
  background: linear-gradient(135deg, #007AFF, #5856D6);
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  box-shadow: 0 4px 16px rgba(0, 122, 255, 0.3);
}

.upload-button:hover:not(:disabled) {
  background: linear-gradient(135deg, #0051D5, #4C49C7);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 122, 255, 0.4);
}

.upload-button.uploading {
  background: linear-gradient(135deg, #FF9500, #FF6347);
  cursor: not-allowed;
  animation: uploading-pulse 1.5s infinite;
}

.upload-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.upload-button.expired {
  background: linear-gradient(135deg, #f44336, #d32f2f);
  box-shadow: 0 4px 16px rgba(244, 67, 54, 0.3);
}

.upload-button.expired:hover {
  background: linear-gradient(135deg, #f44336, #d32f2f);
  transform: none;
  box-shadow: 0 4px 16px rgba(244, 67, 54, 0.3);
}

.expire-icon {
  width: 20px;
  height: 20px;
}

.upload-button .upload-icon {
  width: 20px;
  height: 20px;
  background: none;
  margin: 0;
  box-shadow: none;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes uploading-pulse {
  0%, 100% { 
    box-shadow: 0 4px 16px rgba(255, 149, 0, 0.4);
  }
  50% { 
    box-shadow: 0 6px 24px rgba(255, 149, 0, 0.6);
  }
}

.progress-section {
  margin-bottom: 2rem;
  transition: all 0.5s ease;
}

.progress-section.completed {
  animation: fadeOut 3s ease forwards;
}

@keyframes fadeOut {
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
    transform: translateY(-10px);
  }
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #e5e5e7;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.75rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #007AFF, #5856D6);
  transition: width 0.3s ease;
  border-radius: 4px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.progress-percent {
  font-size: 0.9rem;
  font-weight: 600;
  color: #1d1d1f;
}

.progress-status {
  font-size: 0.8rem;
  color: #86868b;
}

.uploaded-files {
  background: #f5f5f7;
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 2rem;
  text-align: left;
  max-height: 200px;
}

.uploaded-files h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0 0 0.75rem 0;
}

.files-list {
  max-height: 140px;
  overflow-y: auto;
  scrollbar-width: thin;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  margin-bottom: 0.25rem;
  background: white;
  border-radius: 8px;
  border: 1px solid #e5e5e7;
  transition: all 0.3s ease;
}

.file-item:hover {
  background: #f9f9f9;
  border-color: #d1d1d6;
}

.file-item.newly-uploaded {
  background: rgba(0, 122, 255, 0.05);
  border-color: rgba(0, 122, 255, 0.2);
}

.file-icon {
  font-size: 1rem;
}

.file-name {
  font-size: 0.85rem;
  color: #1d1d1f;
  word-break: break-all;
  flex: 1;
}

.actions {
  display: flex;
  justify-content: center;
}

.clear-button {
  padding: 0.75rem 1.5rem;
  font-size: 0.9rem;
  font-weight: 500;
  background: #ff3b30;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.clear-button:hover:not(:disabled) {
  background: #d70015;
  transform: translateY(-1px);
}

.clear-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.clear-button.expired {
  background: #9e9e9e;
  color: #ffffff;
}

.clear-button.expired:hover {
  background: #9e9e9e;
  transform: none;
}

/* 简约风格过期横幅 */
.default-expired-banner {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(239, 68, 68, 0.95);
  color: white;
  border: 1px solid #ef4444;
  border-radius: 8px;
  padding: 12px 20px;
  z-index: 100;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
  animation: default-fade-pulse 2s ease-in-out infinite;
}

.default-expired-content {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
}

.expired-icon {
  font-size: 16px;
}

.expired-message {
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

@keyframes default-fade-pulse {
  0%, 100% { 
    opacity: 0.95;
    transform: translateX(-50%) scale(1);
  }
  50% { 
    opacity: 1;
    transform: translateX(-50%) scale(1.02);
  }
}

/* 自定义滚动条样式 */
.files-list::-webkit-scrollbar,
.files-preview::-webkit-scrollbar,
.upload-content::-webkit-scrollbar {
  width: 6px;
}

.files-list::-webkit-scrollbar-track,
.files-preview::-webkit-scrollbar-track,
.upload-content::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 3px;
}

.files-list::-webkit-scrollbar-thumb,
.files-preview::-webkit-scrollbar-thumb,
.upload-content::-webkit-scrollbar-thumb {
  background: rgba(0, 122, 255, 0.5);
  border-radius: 3px;
}

.files-list::-webkit-scrollbar-thumb:hover,
.files-preview::-webkit-scrollbar-thumb:hover,
.upload-content::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 122, 255, 0.7);
}

@media (max-width: 768px) {
  .default-container {
    padding: 1rem;
    align-items: flex-start;
  }
  
  .upload-content {
    padding: 1.5rem;
    max-height: calc(100vh - 2rem);
    margin: 1rem 0;
  }
  
  h1 {
    font-size: 1.5rem;
  }
  
  .selector-row {
    flex-direction: column;
  }
  
  .selected-files,
  .uploaded-files {
    max-height: 100px;
  }
  
  .files-list {
    max-height: 80px;
  }
  
  .files-preview {
    max-height: 60px;
  }
}
</style>