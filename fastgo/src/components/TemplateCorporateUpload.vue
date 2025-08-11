<template>
  <div class="corporate-container">
    <!-- Corporate过期横幅 -->
    <div v-if="isExpired" class="corporate-expired-banner">
      <div class="corporate-expired-content">
        <div class="corporate-expired-icon">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <span class="expired-message">此上传链接已过期</span>
      </div>
    </div>
    
    <div class="corporate-content">
      <div class="corporate-header">
        <div class="corporate-logo">
          <div class="logo-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M17 8L12 3L7 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M12 3V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="logo-text">
            <h1>FastGo</h1>
            <p>企业文件上传服务</p>
          </div>
        </div>
      </div>

      <!-- 存储信息 -->
      <div class="storage-section">
        <h3>存储空间使用情况</h3>
        <div class="storage-bar-container">
          <div class="storage-bar">
            <div 
              class="storage-fill" 
              :style="{ width: (((tokenInfo.used_bytes || 0) / (tokenInfo.max_storage_bytes || 1)) * 100) + '%' }"
            ></div>
          </div>
          <div class="storage-info">
            <span class="storage-used">{{ formatBytes(tokenInfo.used_bytes || 0) }}</span>
            <span class="storage-separator">/</span>
            <span class="storage-total">{{ formatBytes(tokenInfo.max_storage_bytes || 0) }}</span>
          </div>
        </div>
      </div>

      <!-- 文件选择 -->
      <div class="upload-section">
        <div class="upload-options">
          <label class="upload-option" :class="{ 'disabled': uploading || isExpired, 'expired': isExpired }">
            <input 
              type="file" 
              @change="handleSingleFileChange"
              :disabled="uploading || isExpired"
              style="display: none;"
            />
            <div class="option-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M14 2V8H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="option-content">
              <h4>{{ isExpired ? '已过期' : '选择文件' }}</h4>
              <p>{{ isExpired ? '功能不可用' : '选择单个文件上传' }}</p>
            </div>
          </label>
          
          <label class="upload-option" :class="{ 'disabled': uploading || isExpired, 'expired': isExpired }">
            <input 
              type="file" 
              webkitdirectory 
              directory 
              multiple
              @change="handleFolderChange"
              :disabled="uploading || isExpired"
              style="display: none;"
            />
            <div class="option-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 19C22 19.5304 21.7893 20.0391 21.4142 20.4142C21.0391 20.7893 20.5304 21 20 21H4C3.46957 21 2.96086 20.7893 2.58579 20.4142C2.21071 20.0391 2 19.5304 2 19V5C2 4.46957 2.21071 3.96086 2.58579 3.58579C2.96086 3.21071 3.46957 3 4 3H9L11 6H20C20.5304 6 21.0391 6.21071 21.4142 6.58579C21.7893 6.96086 22 7.46957 22 8V19Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="option-content">
              <h4>{{ isExpired ? '已过期' : '选择文件夹' }}</h4>
              <p>{{ isExpired ? '功能不可用' : '批量上传整个文件夹' }}</p>
            </div>
          </label>
        </div>
      </div>

      <!-- 选中文件预览 -->
      <div v-if="selectedFiles.length > 0 && !uploading && uploadProgress === 0 && showSelectedFilesPreview" class="selected-files-section">
        <div class="selected-header">
          <h4>已选择文件</h4>
          <span class="file-count">{{ selectedFiles.length }} 个文件</span>
        </div>
        <div class="files-preview-list">
          <div 
            v-for="file in selectedFiles.slice(0, 5)" 
            :key="file.name"
            class="file-preview-item"
          >
            <div class="file-preview-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M14 2V8H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <span class="file-preview-name">{{ getRelativePath(file) }}</span>
          </div>
          <div v-if="selectedFiles.length > 5" class="more-files-indicator">
            还有 {{ selectedFiles.length - 5 }} 个文件...
          </div>
        </div>
      </div>

      <!-- 上传按钮 -->
      <div class="upload-action">
        <button 
          class="corporate-upload-btn"
          :class="{ 'uploading': uploading, 'expired': isExpired }"
          :disabled="uploading || selectedFiles.length === 0 || isExpired"
          @click="$emit('upload-clicked')"
        >
          <div class="btn-icon">
            <svg v-if="!uploading && !isExpired" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M17 8L12 3L7 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M12 3V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <svg v-if="isExpired" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <div v-if="uploading" class="corporate-spinner"></div>
          </div>
          <span>{{ isExpired ? '功能已过期' : (uploading ? '上传中...' : '开始上传') }}</span>
        </button>
      </div>

      <!-- 上传进度 -->
      <div v-if="uploading || uploadProgress > 0" class="progress-section" :class="{ 'completed': uploadProgress === 100 }">
        <div class="progress-header">
          <span class="progress-label">上传进度</span>
          <span class="progress-percent">{{ Math.round(uploadProgress) }}%</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: uploadProgress + '%' }"></div>
        </div>
        <div class="progress-status">{{ uploadStatus }}</div>
      </div>

      <!-- 已上传文件 -->
      <div v-if="serverFiles.length > 0" class="uploaded-files-section">
        <div class="uploaded-header">
          <h4>已上传的文件</h4>
          <span class="uploaded-count">{{ serverFiles.length }} 个文件</span>
        </div>
        <div class="uploaded-files-list">
          <div 
            v-for="file in serverFiles" 
            :key="file"
            class="uploaded-file-item"
            :class="getFileStatus(file)"
          >
            <div class="uploaded-file-icon">
              {{ getFileIcon(file) }}
            </div>
            <span class="uploaded-file-name">{{ file }}</span>
            <div v-if="getFileStatus(file) === 'newly-uploaded'" class="new-file-badge">新上传</div>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="actions-section">
        <button 
          class="clear-storage-btn"
          :class="{ 'expired': isExpired }"
          @click="$emit('clear-storage')"
          :disabled="uploading || isExpired"
        >
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 6H5H21M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          {{ isExpired ? '功能已过期' : '清空所有文件' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue';
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
    const progressBarTimeout = ref<number | null>(null);

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
        return '🆕';
      }
      return '📄';
    };

    // Watch for upload completion to auto-hide file selectors
    watch(() => props.uploadProgress, (newProgress: number, oldProgress: number) => {
      // Clear existing timeout
      if (progressBarTimeout.value) {
        clearTimeout(progressBarTimeout.value);
      }
      
      // If upload is complete (100%)
      if (newProgress === 100 && oldProgress < 100) {
        // Hide file selectors after 2 seconds for normal uploads
        // For instant uploads (秒传), wait 3 seconds to show progress longer
        const delay = props.uploadStatus?.includes('秒传') || props.uploadStatus?.includes('instant') ? 3000 : 2000;
        
        progressBarTimeout.value = window.setTimeout(() => {
          showSelectedFilesPreview.value = false;
          // Reset file inputs
          const fileInputs = document.querySelectorAll('input[type="file"]') as NodeListOf<HTMLInputElement>;
          fileInputs.forEach(input => {
            input.value = '';
          });
        }, delay);
      }
    });
    
    // Watch for new file selection to show preview again
    watch(() => props.selectedFiles.length, (newLength: number) => {
      if (newLength > 0) {
        showSelectedFilesPreview.value = true;
      }
    });
    
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
.corporate-container {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: 100vh;
  width: 100vw;
  margin: 0;
  padding: 2rem;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  position: fixed;
  top: 0;
  left: 0;
  box-sizing: border-box;
  overflow-y: auto;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

/* Corporate过期横幅 */
.corporate-expired-banner {
  position: absolute;
  top: 30px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, #dc3545, #c82333);
  color: white;
  border: 1px solid #dc3545;
  border-radius: 12px;
  padding: 16px 24px;
  z-index: 100;
  box-shadow: 
    0 8px 25px rgba(220, 53, 69, 0.3),
    0 4px 10px rgba(220, 53, 69, 0.2);
  animation: corporate-fade-pulse 2s ease-in-out infinite;
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.corporate-expired-content {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 15px;
  font-weight: 600;
}

.corporate-expired-icon {
  width: 24px;
  height: 24px;
  color: white;
}

.corporate-expired-icon svg {
  width: 100%;
  height: 100%;
}

@keyframes corporate-fade-pulse {
  0%, 100% { 
    opacity: 0.95;
    transform: translateX(-50%) scale(1);
    box-shadow: 
      0 8px 25px rgba(220, 53, 69, 0.3),
      0 4px 10px rgba(220, 53, 69, 0.2);
  }
  50% { 
    opacity: 1;
    transform: translateX(-50%) scale(1.02);
    box-shadow: 
      0 12px 35px rgba(220, 53, 69, 0.4),
      0 6px 15px rgba(220, 53, 69, 0.3);
  }
}

.corporate-content {
  background: white;
  border-radius: 16px;
  padding: 2.5rem;
  max-width: 600px;
  width: 100%;
  max-height: calc(90vh - 4rem);
  box-sizing: border-box;
  margin: 2rem 0;
  overflow-y: auto;
  scrollbar-width: none;
  box-shadow: 
    0 20px 40px rgba(0, 0, 0, 0.08),
    0 8px 16px rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(0, 0, 0, 0.06);
}

.corporate-header {
  text-align: center;
  margin-bottom: 2.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #e9ecef;
}

.corporate-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.logo-icon {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #0066cc, #004499);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 4px 12px rgba(0, 102, 204, 0.3);
}

.logo-icon svg {
  width: 28px;
  height: 28px;
}

.logo-text h1 {
  font-size: 1.8rem;
  font-weight: 700;
  color: #0066cc;
  margin: 0 0 0.25rem 0;
  letter-spacing: -0.02em;
}

.logo-text p {
  color: #6c757d;
  font-size: 0.95rem;
  font-weight: 500;
  margin: 0;
}

.storage-section {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 12px;
  border: 1px solid #e9ecef;
}

.storage-section h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #212529;
  margin: 0 0 1rem 0;
}

.storage-bar-container {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.storage-bar {
  width: 100%;
  height: 8px;
  background: #dee2e6;
  border-radius: 4px;
  overflow: hidden;
}

.storage-fill {
  height: 100%;
  background: linear-gradient(90deg, #0066cc, #004499);
  transition: width 0.3s ease;
  border-radius: 4px;
}

.storage-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  font-weight: 500;
}

.storage-used {
  color: #0066cc;
}

.storage-separator {
  color: #6c757d;
}

.storage-total {
  color: #6c757d;
}

.upload-section {
  margin-bottom: 2rem;
}

.upload-options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.upload-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: #f8f9fa;
  border: 2px dashed #dee2e6;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.upload-option:hover:not(.disabled) {
  background: #e9ecef;
  border-color: #0066cc;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 102, 204, 0.15);
}

.upload-option.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.upload-option.expired {
  background: #fff5f5;
  border-color: #dc3545;
  opacity: 0.8;
}

.upload-option.expired:hover {
  background: #fff5f5;
  border-color: #dc3545;
  transform: none;
  box-shadow: none;
}

.option-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #0066cc, #004499);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.upload-option.expired .option-icon {
  background: linear-gradient(135deg, #dc3545, #c82333);
}

.option-icon svg {
  width: 24px;
  height: 24px;
}

.option-content h4 {
  font-size: 1rem;
  font-weight: 600;
  color: #212529;
  margin: 0 0 0.25rem 0;
}

.option-content p {
  font-size: 0.85rem;
  color: #6c757d;
  margin: 0;
  line-height: 1.4;
}

.upload-option.expired .option-content h4 {
  color: #dc3545;
}

.upload-option.expired .option-content p {
  color: #dc3545;
}

.selected-files-section {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  border: 1px solid #e9ecef;
}

.selected-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.selected-header h4 {
  font-size: 1rem;
  font-weight: 600;
  color: #212529;
  margin: 0;
}

.file-count {
  background: #0066cc;
  color: white;
  font-size: 0.8rem;
  font-weight: 600;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
}

.files-preview-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 120px;
  overflow-y: auto;
}

.file-preview-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem;
  background: white;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.file-preview-icon {
  width: 20px;
  height: 20px;
  color: #0066cc;
  flex-shrink: 0;
}

.file-preview-icon svg {
  width: 100%;
  height: 100%;
}

.file-preview-name {
  font-size: 0.9rem;
  color: #212529;
  word-break: break-all;
  flex: 1;
}

.more-files-indicator {
  font-size: 0.85rem;
  color: #6c757d;
  font-style: italic;
  padding: 0.5rem;
  text-align: center;
}

.upload-action {
  margin-bottom: 2rem;
}

.corporate-upload-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1.25rem 2rem;
  font-size: 1.1rem;
  font-weight: 600;
  background: linear-gradient(135deg, #0066cc, #004499);
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 
    0 8px 20px rgba(0, 102, 204, 0.3),
    0 4px 8px rgba(0, 102, 204, 0.2);
  letter-spacing: 0.01em;
}

.corporate-upload-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #0052a3, #003d7a);
  transform: translateY(-2px);
  box-shadow: 
    0 12px 28px rgba(0, 102, 204, 0.4),
    0 6px 12px rgba(0, 102, 204, 0.3);
}

.corporate-upload-btn.uploading {
  background: linear-gradient(135deg, #ffc107, #e0a800);
  cursor: not-allowed;
  animation: corporate-uploading-pulse 1.5s infinite;
}

.corporate-upload-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.corporate-upload-btn.expired {
  background: linear-gradient(135deg, #dc3545, #c82333);
  box-shadow: 0 4px 15px rgba(220, 53, 69, 0.3);
}

.corporate-upload-btn.expired:hover {
  background: linear-gradient(135deg, #dc3545, #c82333);
  transform: none;
  box-shadow: 0 4px 15px rgba(220, 53, 69, 0.3);
}

.btn-icon {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-icon svg {
  width: 100%;
  height: 100%;
}

.corporate-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: corporate-spin 1s linear infinite;
}

@keyframes corporate-spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes corporate-uploading-pulse {
  0%, 100% { 
    box-shadow: 
      0 8px 20px rgba(255, 193, 7, 0.4),
      0 4px 8px rgba(255, 193, 7, 0.3);
  }
  50% { 
    box-shadow: 
      0 12px 28px rgba(255, 193, 7, 0.5),
      0 6px 12px rgba(255, 193, 7, 0.4);
  }
}

.progress-section {
  margin-bottom: 2rem;
  transition: all 0.5s ease;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 12px;
  border: 1px solid #e9ecef;
}

.progress-section.completed {
  animation: corporate-fadeOut 3s ease forwards;
}

@keyframes corporate-fadeOut {
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

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.progress-label {
  font-size: 0.95rem;
  font-weight: 600;
  color: #212529;
}

.progress-percent {
  font-size: 1.1rem;
  font-weight: 700;
  color: #0066cc;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #dee2e6;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.75rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #0066cc, #004499);
  transition: width 0.3s ease;
  border-radius: 4px;
}

.progress-status {
  font-size: 0.85rem;
  color: #6c757d;
  text-align: center;
  font-weight: 500;
}

.uploaded-files-section {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  border: 1px solid #e9ecef;
  max-height: 240px;
}

.uploaded-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.uploaded-header h4 {
  font-size: 1rem;
  font-weight: 600;
  color: #212529;
  margin: 0;
}

.uploaded-count {
  background: #28a745;
  color: white;
  font-size: 0.8rem;
  font-weight: 600;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
}

.uploaded-files-list {
  max-height: 160px;
  overflow-y: auto;
  scrollbar-width: none;  
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.uploaded-file-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: white;
  border-radius: 8px;
  border: 1px solid #e9ecef;
  transition: all 0.3s ease;
}

.uploaded-file-item:hover {
  background: #f8f9fa;
  border-color: #dee2e6;
}

.uploaded-file-item.newly-uploaded {
  background: rgba(0, 102, 204, 0.05);
  border-color: rgba(0, 102, 204, 0.2);
}

.uploaded-file-icon {
  font-size: 1.2rem;
  flex-shrink: 0;
}

.uploaded-file-name {
  font-size: 0.9rem;
  color: #212529;
  word-break: break-all;
  flex: 1;
}

.new-file-badge {
  background: #0066cc;
  color: white;
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.2rem 0.5rem;
  border-radius: 8px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.actions-section {
  display: flex;
  justify-content: center;
}

.clear-storage-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  font-size: 0.9rem;
  font-weight: 500;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.clear-storage-btn:hover:not(:disabled) {
  background: #c82333;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3);
}

.clear-storage-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.clear-storage-btn.expired {
  background: #6c757d;
  color: white;
}

.clear-storage-btn.expired:hover {
  background: #6c757d;
  transform: none;
  box-shadow: none;
}

.clear-storage-btn svg {
  width: 16px;
  height: 16px;
}

/* 滚动条样式 */
.files-preview-list::-webkit-scrollbar,
.uploaded-files-list::-webkit-scrollbar,
.corporate-content::-webkit-scrollbar {
  width: 6px;
}

.files-preview-list::-webkit-scrollbar-track,
.uploaded-files-list::-webkit-scrollbar-track,
.corporate-content::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 3px;
}

.files-preview-list::-webkit-scrollbar-thumb,
.uploaded-files-list::-webkit-scrollbar-thumb,
.corporate-content::-webkit-scrollbar-thumb {
  background: rgba(0, 102, 204, 0.5);
  border-radius: 3px;
}

.files-preview-list::-webkit-scrollbar-thumb:hover,
.uploaded-files-list::-webkit-scrollbar-thumb:hover,
.corporate-content::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 102, 204, 0.7);
}

@media (max-width: 768px) {
  .corporate-container {
    padding: 1rem;
    align-items: flex-start;
  }
  
  .corporate-content {
    padding: 2rem;
    max-height: calc(100vh - 2rem);
    margin: 1rem 0;
  }
  
  .upload-options {
    grid-template-columns: 1fr;
  }
  
  .storage-info {
    flex-direction: column;
    gap: 0.25rem;
  }
  
  .selected-files-section,
  .uploaded-files-section {
    max-height: 160px;
  }
  
  .files-preview-list,
  .uploaded-files-list {
    max-height: 100px;
  }

  .corporate-expired-banner {
    top: 20px;
    left: 20px;
    right: 20px;
    transform: none;
    max-width: calc(100vw - 40px);
  }
}

@media (max-width: 480px) {
  .corporate-content {
    padding: 1.5rem;
  }
  
  .logo-text h1 {
    font-size: 1.5rem;
  }
  
  .upload-option {
    padding: 1rem;
  }
  
  .option-icon {
    width: 40px;
    height: 40px;
  }
  
  .option-icon svg {
    width: 20px;
    height: 20px;
  }
}
</style>