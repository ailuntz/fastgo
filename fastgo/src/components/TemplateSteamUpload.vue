<template>
  <div class="steam-container">
    <!-- Steam风格过期横幅 -->
    <div v-if="isExpired" class="steam-expired-banner">
      <div class="steam-expired-content">
        <span class="expired-icon">🔒</span>
        <span class="expired-message">Service Offline - Upload functionality disabled</span>
      </div>
    </div>
    
    <div class="steam-window">
      <div class="window-header">
        <div class="window-controls">
          <div class="control-btn minimize"></div>
          <div class="control-btn maximize"></div>
          <div class="control-btn close"></div>
        </div>
        <div class="window-title">Steam File Uploader</div>
      </div>
      
      <div class="window-content">
        <div class="storage-stats">
          <div class="stat-item">
            <span class="stat-label">Used Space:</span>
            <span class="stat-value">{{ formatBytes(tokenInfo.used_bytes || 0) }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Total Space:</span>
            <span class="stat-value">{{ formatBytes(tokenInfo.max_storage_bytes || 0) }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Available:</span>
            <span class="stat-value">{{ formatBytes((tokenInfo.max_storage_bytes || 0) - (tokenInfo.used_bytes || 0)) }}</span>
          </div>
        </div>

        <div class="upload-section">
          <div class="section-header">📁 Select Files for Upload</div>
          
          <div class="file-selectors">
            <div class="selector-group">
              <label class="steam-file-selector" :class="{ 'disabled': uploading, 'expired': isExpired }">
                <span class="selector-label">Single File:</span>
                <input 
                  type="file" 
                  class="file-input-hidden"
                  @change="handleSingleFileChange"
                  :disabled="uploading || isExpired"
                  style="display: none;"
                />
                <div class="selector-button">
                  <span class="selector-icon">{{ isExpired ? '⛔' : '📁' }}</span>
                  <span class="selector-text">{{ isExpired ? 'Expired' : 'Choose File' }}</span>
                </div>
              </label>
            </div>
            
            <div class="selector-group">
              <label class="steam-file-selector" :class="{ 'disabled': uploading, 'expired': isExpired }">
                <span class="selector-label">Folder:</span>
                <input 
                  type="file" 
                  class="file-input-hidden"
                  webkitdirectory 
                  directory 
                  multiple
                  @change="handleFolderChange"
                  :disabled="uploading || isExpired"
                  style="display: none;"
                />
                <div class="selector-button">
                  <span class="selector-icon">{{ isExpired ? '⛔' : '🗂️' }}</span>
                  <span class="selector-text">{{ isExpired ? 'Expired' : 'Choose Folder' }}</span>
                </div>
              </label>
            </div>
          </div>

          <button 
            class="steam-btn upload-btn"
            :class="{ 'uploading': uploading, 'btn-expired': isExpired }"
            :disabled="uploading || selectedFiles.length === 0 || isExpired"
            @click="$emit('upload-clicked')"
          >
            {{ isExpired ? 'SERVICE UNAVAILABLE' : uploading ? 'UPLOADING...' : 'START UPLOAD' }}
          </button>

          <div v-if="uploading || uploadProgress > 0" class="progress-section">
            <div class="progress-label">Upload Progress</div>
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: uploadProgress + '%' }"></div>
              <div class="progress-text">{{ Math.round(uploadProgress) }}%</div>
            </div>
            <div class="status-text">{{ uploadStatus }}</div>
          </div>
        </div>

        <div class="file-lists">
          <div class="list-section">
            <div class="list-header">📚 Uploaded Files</div>
            <div class="file-list uploaded-files">
              <div v-if="serverFiles.length === 0" class="empty-list">No files uploaded</div>
              <div v-else class="file-grid">
                <div 
                  v-for="file in serverFiles" 
                  :key="file"
                  class="file-entry"
                  :class="getFileStatus(file)"
                >
                  <div class="file-icon">{{ getFileIcon(file) }}</div>
                  <div class="file-name">{{ file }}</div>
                </div>
              </div>
            </div>
          </div>

          <div class="list-section">
            <div class="list-header">📦 Ready to Upload</div>
            <div class="file-list pending-files">
              <div v-if="selectedFiles.length === 0" class="empty-list">Select files to upload</div>
              <div v-else class="file-grid">
                <div 
                  v-for="file in selectedFiles" 
                  :key="file.name"
                  class="file-entry pending"
                >
                  <div class="file-icon">📄</div>
                  <div class="file-name">{{ getRelativePath(file) }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="action-bar">
          <button 
            class="steam-btn danger"
            :class="{ 'expired': isExpired }"
            @click="$emit('clear-storage')"
            :disabled="uploading || isExpired"
          >
            {{ isExpired ? '⛔ EXPIRED' : '🗑️ CLEAR ALL' }}
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
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap');

/* Steam风格过期横幅 */
.steam-expired-banner {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, #c75450, #8b0000);
  color: #ffffff;
  border: 1px solid #c75450;
  border-radius: 3px;
  padding: 12px 20px;
  z-index: 100;
  box-shadow: 
    0 4px 12px rgba(199, 84, 80, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  animation: steam-warning-pulse 2s ease-in-out infinite;
  font-family: 'Roboto', sans-serif;
}

.steam-expired-content {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 500;
}

.steam-expired-banner .expired-icon {
  font-size: 14px;
  animation: steam-icon-flash 1.5s ease-in-out infinite;
}

.steam-expired-banner .expired-message {
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  letter-spacing: 0.5px;
}

@keyframes steam-warning-pulse {
  0%, 100% { 
    opacity: 0.95;
    transform: translateX(-50%) scale(1);
    box-shadow: 
      0 4px 12px rgba(199, 84, 80, 0.4),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
  }
  50% { 
    opacity: 1;
    transform: translateX(-50%) scale(1.01);
    box-shadow: 
      0 6px 16px rgba(199, 84, 80, 0.6),
      inset 0 1px 0 rgba(255, 255, 255, 0.15);
  }
}

@keyframes steam-icon-flash {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.steam-container {
  font-family: 'Roboto', sans-serif;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: 100vh;
  width: 100vw;
  margin: 0;
  padding: 2rem;
  background: linear-gradient(135deg, #1b2838 0%, #2a475e 100%);
  position: fixed;
  top: 0;
  left: 0;
  box-sizing: border-box;
  overflow-y: auto;
}

.steam-window {
  background: #16202d;
  border: 1px solid #3c5a78;
  border-radius: 3px;
  max-width: 1000px;
  width: 100%;
  max-height: calc(100vh - 4rem);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.8);
  overflow: hidden;
  box-sizing: border-box;
  margin: 2rem 0;
}

.window-header {
  background: linear-gradient(to bottom, #4c6b8a 0%, #3c5a78 100%);
  padding: 8px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #2a475e;
}

.window-controls {
  display: flex;
  gap: 8px;
}

.control-btn {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  cursor: pointer;
}

.control-btn.minimize { background: #ff9500; }
.control-btn.maximize { background: #00ca56; }
.control-btn.close { background: #ff5f57; }

.window-title {
  color: #c7d5e0;
  font-weight: 500;
  font-size: 14px;
  flex: 1;
  text-align: center;
  margin-right: 68px; /* Compensate for controls width */
}

.window-content {
  padding: 20px;
  background: #16202d;
  color: #c7d5e0;
  overflow-y: auto;
  max-height: calc(100vh - 8rem);
}

.storage-stats {
  display: flex;
  justify-content: space-between;
  background: #1e2328;
  padding: 15px;
  border-radius: 3px;
  margin-bottom: 20px;
  border: 1px solid #3c5a78;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}

.stat-label {
  font-size: 12px;
  color: #8f98a0;
  text-transform: uppercase;
}

.stat-value {
  font-size: 14px;
  font-weight: 500;
  color: #66c0f4;
}

.upload-section {
  background: #1e2328;
  border: 1px solid #3c5a78;
  border-radius: 3px;
  padding: 20px;
  margin-bottom: 20px;
}

.section-header {
  color: #66c0f4;
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 15px;
  padding-bottom: 8px;
  border-bottom: 1px solid #3c5a78;
}

.file-selectors {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

.selector-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.steam-file-selector {
  display: flex;
  flex-direction: column;
  gap: 8px;
  cursor: pointer;
}

.steam-file-selector.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.steam-file-selector.expired {
  opacity: 0.7;
  cursor: not-allowed;
}

.steam-file-selector.expired .selector-button {
  background: linear-gradient(to bottom, #8b0000 0%, #5a0000 100%);
  border-color: #8b0000;
  color: #ffcccb;
}

.steam-file-selector.expired:hover .selector-button {
  background: linear-gradient(to bottom, #8b0000 0%, #5a0000 100%);
  border-color: #8b0000;
  box-shadow: none;
  transform: none;
}

.selector-label {
  color: #8f98a0;
  font-size: 13px;
  font-weight: 500;
}

.selector-button {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 15px;
  background: linear-gradient(to bottom, #2a475e 0%, #1e2328 100%);
  border: 1px solid #3c5a78;
  border-radius: 3px;
  color: #c7d5e0;
  transition: all 0.3s ease;
  font-size: 13px;
  font-weight: 500;
}

.steam-file-selector:hover:not(.disabled) .selector-button {
  background: linear-gradient(to bottom, #3c5a78 0%, #2a475e 100%);
  border-color: #66c0f4;
  box-shadow: 0 0 10px rgba(102, 192, 244, 0.3);
  transform: translateY(-1px);
}

.selector-icon {
  font-size: 16px;
  filter: drop-shadow(0 0 3px rgba(102, 192, 244, 0.5));
}

.selector-text {
  font-weight: 500;
  letter-spacing: 0.5px;
}

.file-input {
  padding: 10px;
  background: #0e1419;
  border: 1px solid #3c5a78;
  border-radius: 3px;
  color: #c7d5e0;
  font-size: 13px;
  transition: border-color 0.3s ease;
}

.file-input:hover:not(:disabled) {
  border-color: #66c0f4;
}

.file-input:disabled {
  opacity: 0.5;
}

.steam-btn {
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 500;
  text-transform: uppercase;
  border: 1px solid;
  border-radius: 3px;
  cursor: pointer;
  transition: all 0.3s ease;
  letter-spacing: 0.5px;
}

.upload-btn {
  width: 100%;
  background: linear-gradient(to bottom, #75b022 0%, #588a1b 100%);
  color: white;
  border-color: #588a1b;
  margin-bottom: 20px;
}

.upload-btn:hover:not(:disabled) {
  background: linear-gradient(to bottom, #83c629 0%, #6ba023 100%);
  transform: translateY(-1px);
}

.upload-btn.uploading {
  background: linear-gradient(to bottom, #ff9500 0%, #cc7700 100%);
  border-color: #cc7700;
  cursor: not-allowed;
  animation: steam-uploading 1.5s infinite;
}

.upload-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.upload-btn.expired {
  background: linear-gradient(to bottom, #8b0000 0%, #5a0000 100%);
  border-color: #8b0000;
  color: #ffcccb;
}

.upload-btn.expired:hover {
  background: linear-gradient(to bottom, #8b0000 0%, #5a0000 100%);
  transform: none;
}

@keyframes steam-uploading {
  0%, 100% { 
    box-shadow: 0 0 10px rgba(255, 149, 0, 0.5);
  }
  50% { 
    box-shadow: 0 0 20px rgba(255, 149, 0, 0.8);
  }
}

.progress-section {
  background: #0e1419;
  border: 1px solid #3c5a78;
  border-radius: 3px;
  padding: 15px;
}

.progress-label {
  color: #8f98a0;
  font-size: 12px;
  text-transform: uppercase;
  margin-bottom: 8px;
}

.progress-bar {
  position: relative;
  width: 100%;
  height: 20px;
  background: #1e2328;
  border: 1px solid #3c5a78;
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(to right, #66c0f4, #4cb4e7);
  transition: width 0.3s ease;
}

.progress-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #c7d5e0;
  font-size: 11px;
  font-weight: 500;
}

.status-text {
  color: #8f98a0;
  font-size: 12px;
}

.file-lists {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

.list-section {
  background: #1e2328;
  border: 1px solid #3c5a78;
  border-radius: 3px;
  overflow: hidden;
}

.list-header {
  background: #3c5a78;
  color: #c7d5e0;
  padding: 12px 15px;
  font-size: 13px;
  font-weight: 500;
}

.file-list {
  padding: 15px;
  max-height: 200px;
  overflow-y: auto;
}

.empty-list {
  color: #8f98a0;
  font-style: italic;
  text-align: center;
  padding: 20px 0;
}

.file-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.file-entry {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px;
  border-radius: 3px;
  background: #0e1419;
  border: 1px solid transparent;
  transition: all 0.3s ease;
}

.file-entry:hover {
  background: #16202d;
  border-color: #3c5a78;
}

.file-entry.newly-uploaded {
  background: rgba(117, 176, 34, 0.1);
  border-color: rgba(117, 176, 34, 0.3);
}

.file-entry.pending {
  background: rgba(102, 192, 244, 0.1);
  border-color: rgba(102, 192, 244, 0.3);
}

.file-icon {
  font-size: 16px;
  flex-shrink: 0;
}

.file-name {
  font-family: 'Courier New', monospace;
  font-size: 12px;
  word-break: break-all;
  color: #c7d5e0;
}

.action-bar {
  display: flex;
  gap: 15px;
}

.steam-btn.secondary {
  background: linear-gradient(to bottom, #67c1f5 0%, #417a9b 100%);
  color: white;
  border-color: #417a9b;
  flex: 1;
}

.steam-btn.secondary:hover:not(:disabled) {
  background: linear-gradient(to bottom, #7bcbf7 0%, #4a8bb0 100%);
}

.steam-btn.danger {
  background: linear-gradient(to bottom, #d94c3d 0%, #b23a2e 100%);
  color: white;
  border-color: #b23a2e;
  flex: 1;
}

.steam-btn.danger:hover:not(:disabled) {
  background: linear-gradient(to bottom, #e55a4b 0%, #c44235 100%);
}

.steam-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.steam-btn.expired {
  background: linear-gradient(to bottom, #666666 0%, #444444 100%);
  color: #cccccc;
  border-color: #666666;
}

.steam-btn.expired:hover {
  background: linear-gradient(to bottom, #666666 0%, #444444 100%);
  transform: none;
}

/* Custom scrollbar */
.file-list::-webkit-scrollbar {
  width: 8px;
}

.file-list::-webkit-scrollbar-track {
  background: #0e1419;
}

.file-list::-webkit-scrollbar-thumb {
  background: #3c5a78;
  border-radius: 4px;
}

.file-list::-webkit-scrollbar-thumb:hover {
  background: #4c6b8a;
}

@media (max-width: 768px) {
  .steam-container {
    padding: 1rem;
    align-items: flex-start;
  }
  
  .steam-window {
    max-height: calc(100vh - 2rem);
    margin: 1rem 0;
  }
  
  .window-content {
    padding: 15px;
  }
  
  .storage-stats {
    flex-direction: column;
    gap: 10px;
  }
  
  .file-selectors,
  .file-lists {
    grid-template-columns: 1fr;
  }
  
  .action-bar {
    flex-direction: column;
  }
}
</style>