<template>
  <div class="terminal-container">
    <!-- Hacker风格过期横幅 -->
    <div v-if="isExpired" class="hacker-expired-banner">
      <div class="hacker-expired-content">
        <span class="expired-icon">❌</span>
        <span class="expired-message">ACCESS_DENIED: SESSION_EXPIRED</span>
      </div>
    </div>
    
    <div class="terminal-header">
      <div class="terminal-controls">
        <span class="control-btn close"></span>
        <span class="control-btn minimize"></span>
        <span class="control-btn maximize"></span>
      </div>
      <div class="terminal-title">FastGo Terminal v2.1.0 - Secure File Upload Protocol</div>
    </div>
    
    <div class="terminal-content">
      <div class="terminal-output">
        <div class="output-line">
          <span class="prompt">root@fastgo:~$</span>
          <span class="command">df -h /secure_upload/</span>
        </div>
        <div class="output-line">
          <span class="file-info">Filesystem      Size  Used Avail Use% Mounted on</span>
        </div>
        <div class="output-line">
          <span class="file-info">/dev/upload     {{ formatBytes(tokenInfo.max_storage_bytes || 0) }}  {{ formatBytes(tokenInfo.used_bytes || 0) }} {{ formatBytes((tokenInfo.max_storage_bytes || 0) - (tokenInfo.used_bytes || 0)) }}  {{ Math.round(((tokenInfo.used_bytes || 0) / (tokenInfo.max_storage_bytes || 1)) * 100) }}% /secure_upload</span>
        </div>
        <div class="output-line">
          <span class="prompt">root@fastgo:~$</span>
          <span class="command">check_upload_permissions</span>
        </div>
        <div class="output-line" :class="isExpired ? 'error' : 'success'">
          <span class="status">{{ isExpired ? '[ERROR] Upload access denied' : '[OK] Upload access granted' }}</span>
        </div>
        <div class="output-line" :class="isExpired ? 'error' : 'success'">
          <span class="status">{{ isExpired ? '[ERROR] System offline' : '[OK] Storage capacity: ' + formatBytes((tokenInfo.max_storage_bytes || 0) - (tokenInfo.used_bytes || 0)) + ' available' }}</span>
        </div>
        <div class="output-line warning">
          <span class="status">[WARNING] Secure connection required</span>
        </div>
        <div class="output-line">
          <span class="prompt">root@fastgo:~$</span>
          <span class="command">initiate_secure_upload_session</span>
        </div>
      </div>
      
      <div class="upload-interface">
        <div class="scan-lines"></div>
        <div class="file-controls">
          <div class="control-section">
            <div class="section-title">>>> FILE INPUT SELECTION <<<</div>
            <div class="input-grid">
              <label class="input-wrapper" :class="{ 'disabled': uploading, 'expired': isExpired }">
                <span class="input-label">{{ isExpired ? '[ACCESS_DENIED]' : '[SINGLE_FILE_MODE]' }}</span>
                <input 
                  type="file" 
                  class="terminal-input-hidden"
                  @change="handleSingleFileChange"
                  :disabled="uploading || isExpired"
                  style="display: none;"
                />
                <div class="terminal-file-selector" :class="{ 'selector-expired': isExpired }">
                  <span class="selector-text">{{ isExpired ? 'ACCESS_DENIED.exe' : 'SELECT_FILE.exe' }}</span>
                  <span class="selector-prompt">{{ isExpired ? 'X' : '>' }}</span>
                </div>
              </label>
              
              <label class="input-wrapper" :class="{ 'disabled': uploading, 'expired': isExpired }">
                <span class="input-label">{{ isExpired ? '[ACCESS_DENIED]' : '[DIRECTORY_MODE]' }}</span>
                <input 
                  type="file" 
                  class="terminal-input-hidden"
                  webkitdirectory 
                  directory 
                  multiple
                  @change="handleFolderChange"
                  :disabled="uploading || isExpired"
                  style="display: none;"
                />
                <div class="terminal-file-selector" :class="{ 'selector-expired': isExpired }">
                  <span class="selector-text">{{ isExpired ? 'ACCESS_DENIED.exe' : 'SCAN_DIRECTORY.exe' }}</span>
                  <span class="selector-prompt">{{ isExpired ? 'X' : '>' }}</span>
                </div>
              </label>
            </div>
          </div>

          <div class="upload-section">
            <button 
              class="terminal-button"
              :class="{ 'uploading': uploading, 'expired': isExpired }"
              :disabled="uploading || selectedFiles.length === 0 || isExpired"
              @click="$emit('upload-clicked')"
            >
              <span class="button-text">
                {{ isExpired ? '>>> ACCESS DENIED <<<' : uploading ? '>>> UPLOADING FILES <<<' : '>>> EXECUTE UPLOAD <<<' }}
              </span>
              <div class="button-glow" v-if="!uploading && !isExpired"></div>
            </button>

            <div v-if="uploading || uploadProgress > 0" class="progress-display">
              <div class="progress-label">[UPLOAD_PROGRESS]</div>
              <div class="progress-container">
                <div class="progress-bar" :style="{ width: uploadProgress + '%' }"></div>
                <div class="progress-text">{{ Math.round(uploadProgress) }}%</div>
              </div>
              <div class="status-line">{{ uploadStatus }}</div>
            </div>
          </div>
        </div>

        <div class="file-matrices">
          <div class="matrix-section">
            <div class="matrix-header">[UPLOADED_FILES_DATABASE]</div>
            <div class="file-matrix">
              <div v-if="serverFiles.length === 0" class="empty-matrix">
                <span class="blinking">NO_DATA_FOUND</span>
              </div>
              <div v-else class="matrix-grid">
                <div 
                  v-for="file in serverFiles" 
                  :key="file"
                  class="matrix-entry"
                  :class="getFileStatus(file)"
                >
                  <span class="file-marker">{{ getFileIcon(file) }}</span>
                  <span class="file-path">{{ file }}</span>
                  <span class="file-hash">[{{ generateFileHash(file) }}]</span>
                </div>
              </div>
            </div>
          </div>

          <div class="matrix-section">
            <div class="matrix-header">[PENDING_UPLOAD_QUEUE]</div>
            <div class="file-matrix">
              <div v-if="selectedFiles.length === 0" class="empty-matrix">
                <span class="blinking">AWAITING_INPUT</span>
              </div>
              <div v-else class="matrix-grid">
                <div 
                  v-for="file in selectedFiles" 
                  :key="file.name"
                  class="matrix-entry pending"
                >
                  <span class="file-marker">></span>
                  <span class="file-path">{{ getRelativePath(file) }}</span>
                  <span class="file-size">[{{ formatBytes(file.size) }}]</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="command-bar">
          <button 
            class="cmd-button danger"
            :class="{ 'expired': isExpired }"
            @click="$emit('clear-storage')"
            :disabled="uploading || isExpired"
          >
            {{ isExpired ? '[LOCKED]' : '[PURGE_ALL]' }}
          </button>
        </div>

        <div class="system-info">
          <span class="info-line" :class="{ 'expired-status': isExpired }">SYSTEM_STATUS: {{ isExpired ? 'ACCESS_DENIED' : uploading ? 'PROCESSING' : 'READY' }}</span>
          <span class="info-line" :class="{ 'expired-status': isExpired }">CONNECTION: {{ isExpired ? 'TERMINATED' : 'SECURE_TLS' }}</span>
          <span class="info-line">TIMESTAMP: {{ getCurrentTimestamp() }}</span>
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
      if (bytes === 0) return '0B';
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + sizes[i];
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
        return '+';
      }
      return '*';
    };

    const generateFileHash = (_fileName: string) => {
      // Generate a fake hash for display purposes
      let hash = '';
      for (let i = 0; i < 8; i++) {
        hash += Math.floor(Math.random() * 16).toString(16);
      }
      return hash.toUpperCase();
    };

    const getCurrentTimestamp = () => {
      return new Date().toISOString().replace('T', '_').split('.')[0];
    };

    return {
      handleSingleFileChange,
      handleFolderChange,
      formatBytes,
      getRelativePath,
      getFileStatus,
      getFileIcon,
      generateFileHash,
      getCurrentTimestamp
    };
  }
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;700&display=swap');

/* Hacker风格过期横幅 */
.hacker-expired-banner {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, #ff0000, #cc0000);
  color: #ffffff;
  border: 1px solid #ff0000;
  border-radius: 2px;
  padding: 12px 20px;
  z-index: 100;
  box-shadow: 
    0 4px 12px rgba(255, 0, 0, 0.4),
    0 0 20px rgba(255, 0, 0, 0.2);
  animation: hacker-error-pulse 1.5s ease-in-out infinite;
  font-family: 'JetBrains Mono', 'Courier New', monospace;
}

.hacker-expired-content {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 1px;
}

.hacker-expired-banner .expired-icon {
  font-size: 14px;
  animation: hacker-icon-blink 1s step-start infinite;
}

.hacker-expired-banner .expired-message {
  text-shadow: 0 0 5px rgba(255, 255, 255, 0.8);
  font-weight: bold;
}

@keyframes hacker-error-pulse {
  0%, 100% { 
    opacity: 1;
    transform: translateX(-50%) scale(1);
    box-shadow: 
      0 4px 12px rgba(255, 0, 0, 0.4),
      0 0 20px rgba(255, 0, 0, 0.2);
  }
  50% { 
    opacity: 0.9;
    transform: translateX(-50%) scale(1.01);
    box-shadow: 
      0 6px 16px rgba(255, 0, 0, 0.6),
      0 0 30px rgba(255, 0, 0, 0.4);
  }
}

@keyframes hacker-icon-blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

.terminal-container {
  font-family: 'JetBrains Mono', 'Courier New', monospace;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100vw;
  margin: 0;
  background: #0a0a0a;
  color: #00ff00;
  position: fixed;
  top: 0;
  left: 0;
  box-sizing: border-box;
  overflow-x: hidden;
  overflow-y: auto;
}

.terminal-header {
  background: linear-gradient(to bottom, #333, #222);
  padding: 8px 16px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #555;
  min-height: 32px;
}

.terminal-controls {
  display: flex;
  gap: 8px;
  margin-right: 16px;
}

.control-btn {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.control-btn.close { background: #ff5f57; }
.control-btn.minimize { background: #ffbd2e; }
.control-btn.maximize { background: #28ca42; }

.terminal-title {
  color: #ccc;
  font-size: 13px;
  font-weight: 500;
}

.terminal-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background: radial-gradient(ellipse at center, #001100 0%, #000000 70%);
  min-height: 0;
}

.terminal-output {
  margin-bottom: 20px;
  font-size: 13px;
  line-height: 1.6;
}

.output-line {
  margin-bottom: 4px;
  font-family: 'JetBrains Mono', monospace;
}

.prompt {
  color: #00ffff;
  font-weight: 500;
}

.command {
  color: #ffffff;
  margin-left: 8px;
}

.file-info {
  color: #888;
  font-size: 12px;
}

.status {
  font-weight: 500;
}

.success .status {
  color: #00ff00;
}

.warning .status {
  color: #ffff00;
}

.error .status {
  color: #ff0000;
}

.upload-interface {
  background: rgba(0, 17, 0, 0.3);
  border: 1px solid #00ff00;
  border-radius: 4px;
  padding: 20px;
  position: relative;
  overflow: hidden;
}

.scan-lines {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(0, 255, 0, 0.03) 2px,
    rgba(0, 255, 0, 0.03) 4px
  );
  pointer-events: none;
  animation: scan 2s linear infinite;
}

@keyframes scan {
  0% { transform: translateY(-100%); }
  100% { transform: translateY(100%); }
}

.file-controls {
  margin-bottom: 20px;
}

.control-section {
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid #00aa00;
  padding: 15px;
  margin-bottom: 15px;
}

.section-title {
  color: #00ffff;
  font-weight: 700;
  margin-bottom: 10px;
  text-align: center;
  font-size: 14px;
  letter-spacing: 1px;
}

.input-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 15px;
  align-items: stretch;
}

.input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 8px;
  cursor: pointer;
}

.input-wrapper.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.input-wrapper.expired {
  opacity: 0.7;
  cursor: not-allowed;
}

.input-wrapper.expired .input-label {
  color: #ff0000;
}

.terminal-file-selector.selector-expired {
  background: linear-gradient(to right, #330000, #440000);
  border-color: #ff0000;
  color: #ff6666;
}

.input-wrapper.expired:hover .terminal-file-selector {
  background: linear-gradient(to right, #330000, #440000);
  border-color: #ff0000;
  box-shadow: none;
}

.input-label {
  color: #00ff00;
  font-size: 11px;
  font-weight: 500;
  text-align: left;
}

.terminal-file-selector {
  background: linear-gradient(to right, #001100, #002200);
  border: 1px solid #00aa00;
  color: #00ff00;
  padding: 12px 15px;
  font-family: inherit;
  font-size: 12px;
  border-radius: 2px;
  transition: all 0.3s ease;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  overflow: hidden;
}

.input-wrapper:hover:not(.disabled) .terminal-file-selector {
  border-color: #00ff00;
  box-shadow: 0 0 10px rgba(0, 255, 0, 0.3);
  background: linear-gradient(to right, #002200, #003300);
}

.selector-text {
  font-weight: 500;
  letter-spacing: 0.5px;
}

.selector-prompt {
  color: #00ffff;
  font-weight: 700;
  font-size: 14px;
  animation: blink-prompt 1.5s infinite;
}

@keyframes blink-prompt {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0.3; }
}

.terminal-input {
  background: #000;
  border: 1px solid #00aa00;
  color: #00ff00;
  padding: 8px;
  font-family: inherit;
  font-size: 12px;
  border-radius: 2px;
  transition: all 0.3s ease;
}

.terminal-input:hover:not(:disabled) {
  border-color: #00ff00;
  box-shadow: 0 0 5px rgba(0, 255, 0, 0.3);
}

.terminal-input:disabled {
  opacity: 0.5;
}

.upload-section {
  text-align: center;
}

.terminal-button {
  background: linear-gradient(to bottom, #003300, #001100);
  border: 2px solid #00aa00;
  color: #00ff00;
  padding: 12px 30px;
  font-family: inherit;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 15px;
}

.terminal-button:hover:not(:disabled) {
  background: linear-gradient(to bottom, #004400, #002200);
  box-shadow: 0 0 20px rgba(0, 255, 0, 0.4);
  transform: translateY(-2px);
}

.terminal-button.uploading {
  background: linear-gradient(to bottom, #332200, #221100);
  border-color: #ffaa00;
  color: #ffff00;
  animation: terminal-uploading 1.5s infinite;
}

.terminal-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.terminal-button.expired {
  background: linear-gradient(to bottom, #330000, #220000);
  border-color: #ff0000;
  color: #ff6666;
}

.terminal-button.expired:hover {
  background: linear-gradient(to bottom, #330000, #220000);
  box-shadow: none;
  transform: none;
}

.button-glow {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(0,255,0,0.2), transparent);
  animation: button-shine 3s infinite;
}

@keyframes button-shine {
  0% { left: -100%; }
  100% { left: 100%; }
}

@keyframes terminal-uploading {
  0%, 100% { 
    box-shadow: 0 0 10px rgba(255, 170, 0, 0.6);
  }
  50% { 
    box-shadow: 0 0 25px rgba(255, 170, 0, 0.9);
  }
}

.progress-display {
  background: rgba(0, 0, 0, 0.7);
  border: 1px solid #00aa00;
  padding: 10px;
  text-align: left;
}

.progress-label {
  color: #00ffff;
  font-size: 11px;
  font-weight: 500;
  margin-bottom: 5px;
}

.progress-container {
  position: relative;
  background: #000;
  border: 1px solid #00aa00;
  height: 20px;
  margin-bottom: 5px;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(to right, #00ff00, #00aa00);
  transition: width 0.3s ease;
}

.progress-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #000;
  font-size: 11px;
  font-weight: 700;
}

.status-line {
  color: #00ff00;
  font-size: 11px;
}

.file-matrices {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

.matrix-section {
  background: rgba(0, 0, 0, 0.8);
  border: 1px solid #00aa00;
}

.matrix-header {
  background: #00aa00;
  color: #000;
  padding: 8px;
  font-size: 11px;
  font-weight: 700;
  text-align: center;
}

.file-matrix {
  padding: 10px;
  max-height: 200px;
  overflow-y: auto;
}

.empty-matrix {
  text-align: center;
  padding: 20px;
  color: #666;
}

.blinking {
  animation: blink 1s infinite;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0.3; }
}

.matrix-grid {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.matrix-entry {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 8px;
  padding: 4px;
  border-bottom: 1px dotted #003300;
  font-size: 11px;
  align-items: center;
}

.matrix-entry.newly-uploaded {
  background: rgba(0, 255, 0, 0.1);
  color: #00ff00;
  font-weight: 500;
}

.matrix-entry.pending {
  background: rgba(0, 255, 255, 0.1);
  color: #00ffff;
}

.file-marker {
  color: #00ff00;
  font-weight: 700;
}

.file-path {
  word-break: break-all;
  font-family: inherit;
}

.file-hash, .file-size {
  color: #666;
  font-size: 10px;
}

.command-bar {
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
}

.cmd-button {
  flex: 1;
  background: #000;
  border: 1px solid #00aa00;
  color: #00ff00;
  padding: 8px 12px;
  font-family: inherit;
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.cmd-button:hover:not(:disabled) {
  background: rgba(0, 170, 0, 0.2);
  box-shadow: 0 0 10px rgba(0, 255, 0, 0.3);
}

.cmd-button.danger {
  border-color: #aa0000;
  color: #ff0000;
}

.cmd-button.danger:hover:not(:disabled) {
  background: rgba(170, 0, 0, 0.2);
  box-shadow: 0 0 10px rgba(255, 0, 0, 0.3);
}

.cmd-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.cmd-button.expired {
  background: #666666;
  border-color: #999999;
  color: #cccccc;
}

.cmd-button.expired:hover {
  background: #666666;
  box-shadow: none;
}

.info-line.expired-status {
  color: #ff6666;
}

.system-info {
  display: flex;
  justify-content: space-between;
  font-size: 10px;
  color: #666;
  padding-top: 10px;
  border-top: 1px solid #333;
}

.info-line {
  font-family: inherit;
}

/* Custom scrollbar */
.file-matrix::-webkit-scrollbar {
  width: 6px;
}

.file-matrix::-webkit-scrollbar-track {
  background: #000;
}

.file-matrix::-webkit-scrollbar-thumb {
  background: #00aa00;
}

.file-matrix::-webkit-scrollbar-thumb:hover {
  background: #00ff00;
}

@media (max-width: 768px) {
  .terminal-container {
    min-height: 100vh;
  }
  
  .terminal-content {
    padding: 10px;
    flex: 1;
    min-height: 0;
  }
  
  .input-grid {
    grid-template-columns: 1fr;
  }
  
  .input-label {
    text-align: left;
    margin-bottom: 5px;
  }
  
  .file-matrices {
    grid-template-columns: 1fr;
  }
  
  .command-bar {
    flex-direction: column;
  }
  
  .system-info {
    flex-direction: column;
    gap: 5px;
  }
}
</style>