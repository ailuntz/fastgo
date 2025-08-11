<template>
  <div class="apple-container">
    <!-- Apple风格过期横幅 -->
    <div v-if="isExpired" class="apple-expired-banner">
      <div class="apple-expired-content">
        <span class="expired-icon">❌</span>
        <span class="expired-message">Service Unavailable: Link Expired</span>
      </div>
    </div>
    
    <div class="apple-content">
      <div class="upload-preview">
        <div class="upload-icon-container">
          <div class="upload-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M17 8L12 3L7 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M12 3V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </div>
      </div>
      
      <div class="upload-details">
        <h1 class="upload-title">File Upload</h1>
        <p class="upload-subtitle">Drag and drop files or click to select</p>
        
        <div class="storage-display">
          <div class="storage-visual">
            <div class="storage-bar">
              <div 
                class="storage-fill" 
                :style="{ width: (((tokenInfo.used_bytes || 0) / (tokenInfo.max_storage_bytes || 1)) * 100) + '%' }"
              ></div>
            </div>
            <div class="storage-text">
              {{ formatBytes(tokenInfo.used_bytes || 0) }} of {{ formatBytes(tokenInfo.max_storage_bytes || 0) }} used
            </div>
          </div>
        </div>

        <div class="file-selectors">
          <div class="selector-row">
            <label class="selector-button" :class="{ 'disabled': uploading || isExpired, 'expired': isExpired }">
              <input 
                type="file" 
                @change="handleSingleFileChange"
                :disabled="uploading || isExpired"
                style="display: none;"
              />
              <svg class="selector-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" v-if="!isExpired">
                <path d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M14 2V8H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <svg class="selector-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" v-if="isExpired">
                <path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              {{ isExpired ? 'Service Unavailable' : 'Choose Files' }}
            </label>
            
            <label class="selector-button" :class="{ 'disabled': uploading || isExpired, 'expired': isExpired }">
              <input 
                type="file" 
                webkitdirectory 
                directory 
                multiple
                @change="handleFolderChange"
                :disabled="uploading || isExpired"
                style="display: none;"
              />
              <svg class="selector-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" v-if="!isExpired">
                <path d="M22 19C22 19.5304 21.7893 20.0391 21.4142 20.4142C21.0391 20.7893 20.5304 21 20 21H4C3.46957 21 2.96086 20.7893 2.58579 20.4142C2.21071 20.0391 2 19.5304 2 19V5C2 4.46957 2.21071 3.96086 2.58579 3.58579C2.96086 3.21071 3.46957 3 4 3H9L11 6H20C20.5304 6 21.0391 6.21071 21.4142 6.58579C21.7893 6.96086 22 7.46957 22 8V19Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <svg class="selector-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" v-if="isExpired">
                <path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              {{ isExpired ? 'Service Unavailable' : 'Choose Folder' }}
            </label>
          </div>
        </div>

        <div v-if="selectedFiles.length > 0" class="selected-files">
          <div class="files-header">
            <span class="files-count">{{ selectedFiles.length }} file{{ selectedFiles.length !== 1 ? 's' : '' }} selected</span>
          </div>
          <div class="files-list">
            <div 
              v-for="file in selectedFiles.slice(0, 5)" 
              :key="file.name"
              class="file-item"
            >
              <div class="file-info">
                <div class="file-name">{{ getRelativePath(file) }}</div>
                <div class="file-size">{{ formatBytes(file.size) }}</div>
              </div>
            </div>
            <div v-if="selectedFiles.length > 5" class="more-files">
              +{{ selectedFiles.length - 5 }} more files
            </div>
          </div>
        </div>

        <button 
          class="upload-button"
          :class="{ 
            'btn-uploading': uploading,
            'btn-expired': isExpired
          }"
          :disabled="uploading || selectedFiles.length === 0 || isExpired"
          @click="$emit('upload-clicked')"
        >
          <svg class="upload-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" v-if="!uploading && !isExpired">
            <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M17 8L12 3L7 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M12 3V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <svg class="upload-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" v-if="isExpired">
            <path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <div class="spinner" v-if="uploading"></div>
          {{ isExpired ? 'Service Unavailable' : (uploading ? 'Uploading...' : 'Upload Files') }}
        </button>

        <div v-if="uploading || uploadProgress > 0" class="progress-section">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: uploadProgress + '%' }"></div>
          </div>
          <div class="progress-details">
            <span class="progress-percent">{{ Math.round(uploadProgress) }}%</span>
            <span class="progress-status">{{ uploadStatus }}</span>
          </div>
        </div>

        <div class="file-lists">
          <div class="list-section">
            <h3 class="list-title">Uploaded Files</h3>
            <div class="files-container">
              <div v-if="serverFiles.length === 0" class="empty-state">
                No files uploaded yet
              </div>
              <div v-else class="files-grid">
                <div 
                  v-for="file in serverFiles" 
                  :key="file"
                  class="file-card"
                  :class="getFileStatus(file)"
                >
                  <div class="file-card-icon">{{ getFileIcon(file) }}</div>
                  <div class="file-card-name">{{ file }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="action-buttons">
          <button 
            class="secondary-button"
            :class="{ 'expired': isExpired }"
            @click="$emit('refresh-files')"
            :disabled="uploading || isExpired"
          >
            <svg class="button-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" v-if="!isExpired">
              <path d="M1 4V10H7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M23 20V14H17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M20.49 9C20.0474 7.58463 19.2741 6.31565 18.2407 5.31235C17.2074 4.30905 15.9474 3.61119 14.5678 3.28349C13.1882 2.95579 11.7449 3.01248 10.3975 3.44845C9.05007 3.88442 7.84284 4.68479 6.89 5.76L1 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M3.51 15C3.95256 16.4154 4.72595 17.6843 5.75926 18.6876C6.79256 19.691 8.05257 20.3888 9.43217 20.7165C10.8118 21.0442 12.2551 20.9875 13.6025 20.5516C14.9499 20.1156 16.1572 19.3152 17.11 18.24L23 14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <svg class="button-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" v-if="isExpired">
              <path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            {{ isExpired ? 'Expired' : 'Refresh' }}
          </button>
          <button 
            class="danger-button"
            :class="{ 'expired': isExpired }"
            @click="$emit('clear-storage')"
            :disabled="uploading || isExpired"
          >
            <svg class="button-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" v-if="!isExpired">
              <path d="M3 6H5H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <svg class="button-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" v-if="isExpired">
              <path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            {{ isExpired ? 'Expired' : 'Clear All' }}
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
@import url('https://fonts.googleapis.com/css2?family=SF+Pro+Display:wght@300;400;500;600;700&display=swap');

/* Apple风格过期横幅 */
.apple-expired-banner {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(255, 59, 48, 0.95);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 14px 22px;
  z-index: 100;
  box-shadow: 
    0 8px 32px rgba(255, 59, 48, 0.3),
    0 4px 16px rgba(255, 59, 48, 0.2);
  animation: apple-smooth-pulse 3s ease-in-out infinite;
  font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

.apple-expired-content {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: -0.01em;
}

.apple-expired-banner .expired-icon {
  font-size: 16px;
  animation: apple-icon-subtle 2s ease-in-out infinite;
}

.apple-expired-banner .expired-message {
  text-shadow: none;
  font-weight: 500;
}

@keyframes apple-smooth-pulse {
  0%, 100% { 
    opacity: 0.95;
    transform: translateX(-50%) scale(1);
    box-shadow: 
      0 8px 32px rgba(255, 59, 48, 0.3),
      0 4px 16px rgba(255, 59, 48, 0.2);
  }
  50% { 
    opacity: 1;
    transform: translateX(-50%) scale(1.01);
    box-shadow: 
      0 12px 40px rgba(255, 59, 48, 0.4),
      0 6px 20px rgba(255, 59, 48, 0.3);
  }
}

@keyframes apple-icon-subtle {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
}

.apple-container {
  font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: 100vh;
  width: 100vw;
  margin: 0;
  padding: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: fixed;
  top: 0;
  left: 0;
  box-sizing: border-box;
  overflow-y: auto;
}

.apple-content {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 2rem;
  max-width: 600px;
  width: 100%;
  max-height: calc(100vh - 2rem);
  overflow-y: auto;
  box-sizing: border-box;
  margin: 0;
  box-shadow: 
    0 20px 40px rgba(0, 0, 0, 0.1),
    0 8px 32px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.18);
}

.upload-preview {
  text-align: center;
  margin-bottom: 2rem;
}

.upload-icon-container {
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
}

.upload-icon-container .upload-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #007AFF, #5856D6);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 8px 16px rgba(0, 122, 255, 0.3);
}

.upload-icon-container .upload-icon svg {
  width: 40px;
  height: 40px;
}

.upload-details {
  text-align: center;
}

.upload-title {
  font-size: 2rem;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0 0 0.5rem 0;
  line-height: 1.2;
}

.upload-subtitle {
  font-size: 1rem;
  color: #86868b;
  margin: 0 0 2rem 0;
  font-weight: 400;
}

.storage-display {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: #f5f5f7;
  border-radius: 12px;
}

.storage-visual {
  text-align: center;
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
  font-weight: 400;
}

.file-selectors {
  margin-bottom: 2rem;
}

.selector-row {
  display: flex;
  gap: 1rem;
}

.selector-button {
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

.selector-button:hover:not(.disabled) {
  background: #e8e8ed;
  border-color: #007AFF;
  color: #007AFF;
}

.selector-button.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.selector-button.expired {
  background: #ffebee;
  border-color: #f44336;
  color: #d32f2f;
  opacity: 0.8;
}

.selector-button.expired:hover {
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
  margin-bottom: 2rem;
  text-align: left;
}

.files-header {
  margin-bottom: 1rem;
}

.files-count {
  font-size: 0.9rem;
  color: #86868b;
  font-weight: 500;
}

.files-list {
  background: #f5f5f7;
  border-radius: 12px;
  padding: 1rem;
}

.file-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #e5e5e7;
}

.file-item:last-child {
  border-bottom: none;
}

.file-info {
  flex: 1;
}

.file-name {
  font-size: 0.9rem;
  color: #1d1d1f;
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.file-size {
  font-size: 0.8rem;
  color: #86868b;
}

.more-files {
  text-align: center;
  color: #86868b;
  font-size: 0.9rem;
  padding: 0.5rem 0;
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
  margin-bottom: 1.5rem;
  box-shadow: 0 4px 16px rgba(0, 122, 255, 0.3);
}

.upload-button:hover:not(:disabled) {
  background: linear-gradient(135deg, #0051D5, #4C49C7);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 122, 255, 0.4);
}

.upload-button.btn-uploading {
  background: linear-gradient(135deg, #FF9500, #FF6347);
  cursor: not-allowed;
  animation: uploading-pulse 1.5s infinite;
}

.upload-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.upload-button.btn-expired {
  background: linear-gradient(135deg, #f44336, #d32f2f);
  box-shadow: 0 4px 16px rgba(244, 67, 54, 0.3);
}

.upload-button.btn-expired:hover {
  background: linear-gradient(135deg, #f44336, #d32f2f);
  transform: none;
  box-shadow: 0 4px 16px rgba(244, 67, 54, 0.3);
}

.upload-button .upload-icon {
  width: 20px;
  height: 20px;
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

.progress-details {
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

.file-lists {
  margin-bottom: 2rem;
  text-align: left;
}

.list-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0 0 1rem 0;
}

.files-container {
  background: #f5f5f7;
  border-radius: 12px;
  padding: 1rem;
  max-height: 200px;
  overflow-y: auto;
}

.empty-state {
  text-align: center;
  color: #86868b;
  padding: 2rem;
  font-style: italic;
}

.files-grid {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.file-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: white;
  border-radius: 8px;
  border: 1px solid #e5e5e7;
  transition: all 0.3s ease;
}

.file-card:hover {
  background: #f9f9f9;
  border-color: #d1d1d6;
}

.file-card.newly-uploaded {
  background: rgba(0, 122, 255, 0.05);
  border-color: rgba(0, 122, 255, 0.2);
}

.file-card-icon {
  font-size: 1.2rem;
}

.file-card-name {
  font-size: 0.9rem;
  color: #1d1d1f;
  font-weight: 500;
  word-break: break-all;
}

.action-buttons {
  display: flex;
  gap: 1rem;
}

.secondary-button, .danger-button {
  flex: 1;
  padding: 0.75rem 1rem;
  font-size: 0.9rem;
  font-weight: 500;
  border: 1px solid;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.secondary-button {
  background: #f5f5f7;
  color: #1d1d1f;
  border-color: #d1d1d6;
}

.secondary-button:hover:not(:disabled) {
  background: #e8e8ed;
  border-color: #c7c7cc;
}

.danger-button {
  background: #ff3b30;
  color: white;
  border-color: #ff3b30;
}

.danger-button:hover:not(:disabled) {
  background: #d70015;
  border-color: #d70015;
}

.secondary-button:disabled, .danger-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.secondary-button.expired {
  background: #e0e0e0;
  color: #9e9e9e;
  border-color: #bdbdbd;
}

.secondary-button.expired:hover {
  background: #e0e0e0;
  border-color: #bdbdbd;
  transform: none;
}

.danger-button.expired {
  background: #9e9e9e;
  color: #ffffff;
  border-color: #9e9e9e;
}

.danger-button.expired:hover {
  background: #9e9e9e;
  border-color: #9e9e9e;
  transform: none;
}

.button-icon {
  width: 16px;
  height: 16px;
}

@media (max-width: 768px) {
  .apple-container {
    padding: 0.5rem;
    align-items: flex-start;
  }
  
  .apple-content {
    padding: 1.5rem;
    max-height: calc(100vh - 1rem);
    margin: 0;
  }
  
  .upload-icon-container .upload-icon {
    width: 60px;
    height: 60px;
    border-radius: 15px;
  }
  
  .upload-icon-container .upload-icon svg {
    width: 30px;
    height: 30px;
  }
  
  .upload-title {
    font-size: 1.5rem;
  }
  
  .selector-row {
    flex-direction: column;
  }
  
  .action-buttons {
    flex-direction: column;
  }
}
</style>