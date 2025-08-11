<template>
  <div class="cyberpunk-container">
    <!-- Cyberpunk风格过期横幅 -->
    <div v-if="isExpired" class="cyberpunk-expired-banner">
      <div class="cyberpunk-expired-content">
        <span class="expired-icon">🔒</span>
        <span class="expired-message">CONNECTION_TERMINATED: ACCESS_EXPIRED</span>
      </div>
    </div>
    
    <div class="neon-grid">
      <div class="grid-line horizontal" v-for="i in 10" :key="'h' + i"></div>
      <div class="grid-line vertical" v-for="i in 15" :key="'v' + i"></div>
    </div>
    
    <div class="glitch-overlay"></div>
    
    <div class="cyber-interface">
      <div class="interface-header">
        <div class="header-line">
          <span class="header-text">&gt;&gt; NEURAL LINK ESTABLISHED &lt;&lt;</span>
        </div>
        <div class="connection-status">
          <span class="status-indicator"></span>
          <span class="status-text">CONNECTION SECURE</span>
        </div>
      </div>
      
      <div class="data-panel">
        <div class="panel-header">
          <h1 class="cyber-title">DATA UPLOAD PROTOCOL</h1>
          <div class="title-glitch" data-text="DATA UPLOAD PROTOCOL">DATA UPLOAD PROTOCOL</div>
        </div>
        
        <div class="storage-matrix">
          <div class="matrix-row">
            <span class="matrix-label">TARGET_DIRECTORY:</span>
            <span class="matrix-value target-dir">SECURE_VAULT</span>
          </div>
          <div class="matrix-row">
            <span class="matrix-label">STORAGE_USED:</span>
            <span class="matrix-value storage-used">{{ formatBytes(tokenInfo.used_bytes || 0) }}</span>
          </div>
          <div class="matrix-row">
            <span class="matrix-label">TOTAL_CAPACITY:</span>
            <span class="matrix-value total-capacity">{{ formatBytes(tokenInfo.max_storage_bytes || 0) }}</span>
          </div>
          <div class="matrix-row">
            <span class="matrix-label">AVAILABLE_SPACE:</span>
            <span class="matrix-value available-space">{{ formatBytes((tokenInfo.max_storage_bytes || 0) - (tokenInfo.used_bytes || 0)) }}</span>
          </div>
          <div class="matrix-row">
            <span class="matrix-label">SECURITY_LEVEL:</span>
            <span class="matrix-value security-high">MAXIMUM</span>
          </div>
        </div>

        <div class="storage-visualization">
          <div class="storage-bar-container">
            <div class="storage-bar">
              <div 
                class="storage-fill" 
                :style="{ width: (((tokenInfo.used_bytes || 0) / (tokenInfo.max_storage_bytes || 1)) * 100) + '%' }"
              ></div>
            </div>
            <div class="storage-percentage">
              {{ Math.round(((tokenInfo.used_bytes || 0) / (tokenInfo.max_storage_bytes || 1)) * 100) }}% UTILIZED
            </div>
          </div>
        </div>

        <div class="upload-controls">
          <div class="control-section">
            <div class="section-title">[INPUT_SELECTION_MATRIX]</div>
            <div class="input-controls">
              <div class="input-row">
                <label class="cyber-input-wrapper" :class="{ 'disabled': uploading, 'expired': isExpired }">
                  <span class="cyber-input-label">{{ isExpired ? '[ACCESS_DENIED]' : '[SINGLE_FILE_MODE]' }}</span>
                  <input 
                    type="file" 
                    class="cyber-input-hidden"
                    @change="handleSingleFileChange"
                    :disabled="uploading || isExpired"
                    style="display: none;"
                  />
                  <div class="cyber-file-selector" :class="{ 'selector-expired': isExpired }">
                    <div class="selector-content">
                      <span class="selector-icon">{{ isExpired ? '🔒' : '📁' }}</span>
                      <span class="selector-text">{{ isExpired ? 'ACCESS_DENIED.exe' : 'INITIATE_FILE_SCAN.exe' }}</span>
                    </div>
                    <div class="selector-status">{{ isExpired ? '[LOCKED]' : '[READY]' }}</div>
                    <div class="cyber-glow" v-if="!isExpired"></div>
                  </div>
                </label>
              </div>
              <div class="input-row">
                <label class="cyber-input-wrapper" :class="{ 'disabled': uploading, 'expired': isExpired }">
                  <span class="cyber-input-label">{{ isExpired ? '[ACCESS_DENIED]' : '[DIRECTORY_SCAN_MODE]' }}</span>
                  <input 
                    type="file" 
                    class="cyber-input-hidden"
                    webkitdirectory 
                    directory 
                    multiple
                    @change="handleFolderChange"
                    :disabled="uploading || isExpired"
                    style="display: none;"
                  />
                  <div class="cyber-file-selector" :class="{ 'selector-expired': isExpired }">
                    <div class="selector-content">
                      <span class="selector-icon">{{ isExpired ? '🔒' : '🗂️' }}</span>
                      <span class="selector-text">{{ isExpired ? 'ACCESS_DENIED.exe' : 'RECURSIVE_DIR_SCAN.exe' }}</span>
                    </div>
                    <div class="selector-status">{{ isExpired ? '[LOCKED]' : '[READY]' }}</div>
                    <div class="cyber-glow" v-if="!isExpired"></div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <div class="upload-section">
            <button 
              class="cyber-upload-btn"
              :class="{ 
                'uploading': uploading,
                'disabled': selectedFiles.length === 0,
                'expired': isExpired
              }"
              :disabled="uploading || selectedFiles.length === 0 || isExpired"
              @click="$emit('upload-clicked')"
            >
              <div class="btn-inner">
                <div class="btn-text">
                  {{ isExpired ? '&gt;&gt; CONNECTION TERMINATED &lt;&lt;' : (uploading ? '&gt;&gt; UPLOADING DATA &lt;&lt;' : '&gt;&gt; INITIATE UPLOAD &lt;&lt;') }}
                </div>
                <div class="btn-subtext">
                  {{ isExpired ? 'ACCESS DENIED - SESSION EXPIRED' : (uploading ? 'NEURAL TRANSFER IN PROGRESS' : 'READY FOR DATA TRANSFER') }}
                </div>
              </div>
              <div class="btn-glow" v-if="!uploading && !isExpired && selectedFiles.length > 0"></div>
              <div class="btn-static" v-if="uploading"></div>
            </button>

            <div v-if="uploading || uploadProgress > 0" class="progress-matrix">
              <div class="progress-header">[TRANSFER_PROGRESS_MONITOR]</div>
              <div class="progress-display">
                <div class="progress-bar-cyber">
                  <div class="progress-fill-cyber" :style="{ width: uploadProgress + '%' }"></div>
                  <div class="progress-scan-line" :style="{ left: uploadProgress + '%' }"></div>
                </div>
                <div class="progress-data">
                  <span class="progress-percent">{{ Math.round(uploadProgress) }}%</span>
                  <span class="progress-status">{{ uploadStatus }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="data-matrices">
          <div class="matrix-panel">
            <div class="matrix-header">[UPLOADED_DATA_BANK]</div>
            <div class="data-display">
              <div v-if="serverFiles.length === 0" class="empty-matrix">
                <div class="empty-text">NO_DATA_DETECTED</div>
                <div class="empty-scan">SCANNING...</div>
              </div>
              <div v-else class="data-grid">
                <div 
                  v-for="file in serverFiles" 
                  :key="file"
                  class="data-entry"
                  :class="getFileStatus(file)"
                >
                  <div class="entry-marker">{{ getFileIcon(file) }}</div>
                  <div class="entry-path">{{ file }}</div>
                  <div class="entry-hash">[{{ generateHash(file) }}]</div>
                </div>
              </div>
            </div>
          </div>

          <div class="matrix-panel">
            <div class="matrix-header">[PENDING_UPLOAD_QUEUE]</div>
            <div class="data-display">
              <div v-if="selectedFiles.length === 0" class="empty-matrix">
                <div class="empty-text">AWAITING_INPUT</div>
                <div class="empty-scan">STANDBY...</div>
              </div>
              <div v-else class="data-grid">
                <div 
                  v-for="file in selectedFiles" 
                  :key="file.name"
                  class="data-entry pending"
                >
                  <div class="entry-marker">&gt;</div>
                  <div class="entry-path">{{ getRelativePath(file) }}</div>
                  <div class="entry-size">[{{ formatBytes(file.size) }}]</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="action-matrix">
          <button 
            class="cyber-action-btn danger"
            :class="{ 'expired': isExpired }"
            @click="$emit('clear-storage')"
            :disabled="uploading || isExpired"
          >
            <span class="btn-icon">{{ isExpired ? '🔒' : '⚠' }}</span>
            {{ isExpired ? '[DATA_LOCKED]' : '[PURGE_ALL_DATA]' }}
          </button>
        </div>

        <div class="system-monitor">
          <div class="monitor-line">
            <span class="monitor-label">SYSTEM_STATUS:</span>
            <span class="monitor-value" :class="{ 'status-expired': isExpired }">
              {{ isExpired ? 'CONNECTION_TERMINATED' : (uploading ? 'PROCESSING' : 'ONLINE') }}
            </span>
          </div>
          <div class="monitor-line">
            <span class="monitor-label">ENCRYPTION:</span>
            <span class="monitor-value" :class="{ 'status-expired': isExpired }">
              {{ isExpired ? 'ENCRYPTION_DISABLED' : 'AES-256_QUANTUM' }}
            </span>
          </div>
          <div class="monitor-line">
            <span class="monitor-label">TIMESTAMP:</span>
            <span class="monitor-value">{{ getCurrentTimestamp() }}</span>
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
        return '+';
      }
      return '*';
    };

    const generateHash = (_fileName: string) => {
      // Generate a fake hash for display
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
      generateHash,
      getCurrentTimestamp
    };
  }
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap');

/* Cyberpunk风格过期横幅 */
.cyberpunk-expired-banner {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, #ff0040, #8b0000);
  color: #ffffff;
  border: 2px solid #ff0040;
  border-radius: 4px;
  padding: 12px 20px;
  z-index: 100;
  box-shadow: 
    0 4px 20px rgba(255, 0, 64, 0.5),
    0 0 40px rgba(255, 0, 64, 0.3),
    inset 0 0 20px rgba(255, 0, 64, 0.1);
  animation: cyberpunk-critical-pulse 1.2s ease-in-out infinite;
  font-family: 'Orbitron', monospace;
  backdrop-filter: blur(5px);
}

.cyberpunk-expired-content {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 1.5px;
  text-transform: uppercase;
}

.cyberpunk-expired-banner .expired-icon {
  font-size: 16px;
  animation: cyberpunk-icon-critical 0.8s step-start infinite;
}

.cyberpunk-expired-banner .expired-message {
  text-shadow: 
    0 0 10px rgba(255, 255, 255, 0.8),
    0 0 20px rgba(255, 0, 64, 0.6);
  font-weight: 900;
}

@keyframes cyberpunk-critical-pulse {
  0%, 100% { 
    opacity: 1;
    transform: translateX(-50%) scale(1);
    box-shadow: 
      0 4px 20px rgba(255, 0, 64, 0.5),
      0 0 40px rgba(255, 0, 64, 0.3),
      inset 0 0 20px rgba(255, 0, 64, 0.1);
  }
  50% { 
    opacity: 0.8;
    transform: translateX(-50%) scale(1.02);
    box-shadow: 
      0 6px 30px rgba(255, 0, 64, 0.7),
      0 0 60px rgba(255, 0, 64, 0.5),
      inset 0 0 30px rgba(255, 0, 64, 0.2);
  }
}

@keyframes cyberpunk-icon-critical {
  0%, 30% { opacity: 1; }
  31%, 60% { opacity: 0.3; }
  61%, 100% { opacity: 1; }
}

.cyberpunk-container {
  font-family: 'Orbitron', monospace;
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  min-height: 100vh;
  background: radial-gradient(ellipse at center, #0f0f23 0%, #050507 70%);
  color: #00ffff;
  overflow-x: hidden;
  overflow-y: auto;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 2rem 0;
  box-sizing: border-box;
}

.neon-grid {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0.3;
  pointer-events: none;
}

.grid-line {
  position: absolute;
  background: linear-gradient(90deg, transparent, #00ffff, transparent);
}

.grid-line.horizontal {
  width: 100%;
  height: 1px;
  left: 0;
  animation: grid-pulse-h 4s infinite;
}

.grid-line.vertical {
  height: 100%;
  width: 1px;
  top: 0;
  animation: grid-pulse-v 4s infinite;
}

.grid-line:nth-child(1) { top: 10%; animation-delay: 0s; }
.grid-line:nth-child(2) { top: 20%; animation-delay: 0.5s; }
.grid-line:nth-child(3) { top: 30%; animation-delay: 1s; }
.grid-line:nth-child(4) { top: 40%; animation-delay: 1.5s; }
.grid-line:nth-child(5) { top: 50%; animation-delay: 2s; }
.grid-line:nth-child(6) { top: 60%; animation-delay: 2.5s; }
.grid-line:nth-child(7) { top: 70%; animation-delay: 3s; }
.grid-line:nth-child(8) { top: 80%; animation-delay: 3.5s; }
.grid-line:nth-child(9) { top: 90%; animation-delay: 4s; }

.grid-line.vertical:nth-child(11) { left: 5%; animation-delay: 0.2s; }
.grid-line.vertical:nth-child(12) { left: 15%; animation-delay: 0.7s; }
.grid-line.vertical:nth-child(13) { left: 25%; animation-delay: 1.2s; }
.grid-line.vertical:nth-child(14) { left: 35%; animation-delay: 1.7s; }
.grid-line.vertical:nth-child(15) { left: 45%; animation-delay: 2.2s; }
.grid-line.vertical:nth-child(16) { left: 55%; animation-delay: 2.7s; }
.grid-line.vertical:nth-child(17) { left: 65%; animation-delay: 3.2s; }
.grid-line.vertical:nth-child(18) { left: 75%; animation-delay: 3.7s; }
.grid-line.vertical:nth-child(19) { left: 85%; animation-delay: 4.2s; }
.grid-line.vertical:nth-child(20) { left: 95%; animation-delay: 4.7s; }

@keyframes grid-pulse-h {
  0%, 90% { opacity: 0.1; }
  5%, 85% { opacity: 0.8; }
  10%, 80% { opacity: 0.1; }
}

@keyframes grid-pulse-v {
  0%, 90% { opacity: 0.1; }
  5%, 85% { opacity: 0.6; }
  10%, 80% { opacity: 0.1; }
}

.glitch-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(0, 255, 255, 0.03) 2px,
    rgba(0, 255, 255, 0.03) 4px
  );
  pointer-events: none;
  animation: glitch-scan 3s linear infinite;
}

@keyframes glitch-scan {
  0% { transform: translateY(-100%); }
  100% { transform: translateY(100%); }
}

.cyber-interface {
  width: 90%;
  max-width: 1200px;
  background: rgba(0, 0, 0, 0.8);
  border: 2px solid #00ffff;
  border-radius: 0;
  padding: 2rem;
  position: relative;
  overflow-y: auto;
  max-height: calc(100vh - 6rem);
  box-sizing: border-box;
  box-shadow: 
    0 0 50px rgba(0, 255, 255, 0.3),
    inset 0 0 50px rgba(0, 255, 255, 0.1);
}

.interface-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #00ffff;
}

.header-text {
  font-size: 1.2rem;
  font-weight: 700;
  color: #00ffff;
  text-shadow: 0 0 10px #00ffff;
  animation: text-flicker 2s infinite;
}

@keyframes text-flicker {
  0%, 98% { opacity: 1; }
  99%, 100% { opacity: 0.8; }
}

.connection-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.status-indicator {
  width: 10px;
  height: 10px;
  background: #00ff00;
  border-radius: 50%;
  box-shadow: 0 0 10px #00ff00;
  animation: status-pulse 1s infinite;
}

@keyframes status-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.status-text {
  font-size: 0.8rem;
  color: #00ff00;
}

.data-panel {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.panel-header {
  text-align: center;
  position: relative;
  margin-bottom: 1rem;
}

.cyber-title {
  font-size: 2rem;
  font-weight: 900;
  color: #ff0080;
  text-shadow: 
    0 0 5px #ff0080,
    0 0 10px #ff0080,
    0 0 20px #ff0080;
  margin: 0;
  letter-spacing: 2px;
}

.title-glitch {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  font-size: 2rem;
  font-weight: 900;
  color: #00ffff;
  opacity: 0.7;
  animation: title-glitch 4s infinite;
  pointer-events: none;
}

@keyframes title-glitch {
  0%, 90% { 
    transform: translateX(-50%); 
    opacity: 0; 
  }
  91%, 94% { 
    transform: translateX(-48%); 
    opacity: 0.7; 
  }
  95%, 100% { 
    transform: translateX(-52%); 
    opacity: 0; 
  }
}

.storage-matrix {
  background: rgba(0, 0, 0, 0.6);
  border: 1px solid #00ffff;
  padding: 1rem;
  margin-bottom: 1rem;
}

.matrix-row {
  display: flex;
  justify-content: space-between;
  padding: 0.25rem 0;
  border-bottom: 1px dotted rgba(0, 255, 255, 0.3);
  font-family: 'Orbitron', monospace;
  font-size: 0.9rem;
}

.matrix-label {
  color: #00ffff;
  font-weight: 700;
  text-shadow: 0 0 5px #00ffff;
}

.matrix-value {
  color: #ffffff;
  font-weight: 400;
}

.security-high {
  color: #ff0080 !important;
  font-weight: 700;
  text-shadow: 0 0 5px #ff0080;
}

.storage-visualization {
  margin: 1rem 0;
}

.storage-bar-container {
  background: rgba(0, 0, 0, 0.8);
  border: 1px solid #00ffff;
  padding: 1rem;
}

.storage-bar {
  width: 100%;
  height: 20px;
  background: rgba(0, 255, 255, 0.1);
  border: 1px solid #00ffff;
  position: relative;
  overflow: hidden;
}

.storage-fill {
  height: 100%;
  background: linear-gradient(90deg, #00ffff, #ff0080);
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
  transition: width 0.5s ease;
}

.storage-percentage {
  text-align: center;
  margin-top: 0.5rem;
  color: #00ffff;
  font-size: 0.9rem;
  font-weight: 700;
}

.upload-controls {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.control-section {
  background: rgba(0, 0, 0, 0.6);
  border: 1px solid #00ffff;
  padding: 1rem;
}

.section-title {
  color: #ff0080;
  font-weight: 700;
  text-align: center;
  margin-bottom: 1rem;
  font-size: 1rem;
  text-shadow: 0 0 10px #ff0080;
}

.input-controls {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.input-row {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.cyber-input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  cursor: pointer;
  flex: 1;
}

.cyber-input-wrapper.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.cyber-input-wrapper.expired {
  opacity: 0.7;
  cursor: not-allowed;
}

.cyber-input-wrapper.expired .cyber-input-label {
  color: #ff0000;
  text-shadow: 0 0 5px #ff0000;
}

.cyber-file-selector.selector-expired {
  background: linear-gradient(135deg, rgba(139, 0, 0, 0.8), rgba(255, 0, 0, 0.1));
  border-color: #ff0000;
  color: #ff6666;
}

.cyber-input-wrapper.expired:hover .cyber-file-selector {
  background: linear-gradient(135deg, rgba(139, 0, 0, 0.8), rgba(255, 0, 0, 0.1));
  border-color: #ff0000;
  box-shadow: none;
}

.cyber-input-label {
  color: #00ffff;
  font-size: 0.8rem;
  font-weight: 700;
  text-shadow: 0 0 5px #00ffff;
}

.cyber-file-selector {
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.8), rgba(0, 255, 255, 0.1));
  border: 1px solid #00ffff;
  color: #00ffff;
  padding: 1rem;
  font-family: 'Orbitron', monospace;
  font-size: 0.8rem;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.cyber-input-wrapper:hover:not(.disabled) .cyber-file-selector {
  border-color: #ff0080;
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.9), rgba(255, 0, 128, 0.1));
  box-shadow: 0 0 15px rgba(255, 0, 128, 0.3);
}

.selector-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.selector-icon {
  font-size: 1.2rem;
  filter: drop-shadow(0 0 5px #00ffff);
}

.selector-text {
  font-weight: 700;
  letter-spacing: 1px;
  text-shadow: 0 0 5px currentColor;
}

.selector-status {
  color: #00ff00;
  font-size: 0.7rem;
  font-weight: 700;
  animation: status-blink 2s infinite;
}

@keyframes status-blink {
  0%, 80% { opacity: 1; }
  90%, 100% { opacity: 0.5; }
}

.cyber-glow {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(0, 255, 255, 0.3), transparent);
  animation: cyber-glow-sweep 3s infinite;
  pointer-events: none;
}

@keyframes cyber-glow-sweep {
  0%, 90% { left: -100%; opacity: 0; }
  95%, 100% { left: 100%; opacity: 1; }
}

.upload-section {
  text-align: center;
}

.cyber-upload-btn {
  width: 100%;
  background: linear-gradient(45deg, rgba(0, 255, 255, 0.2), rgba(255, 0, 128, 0.2));
  border: 2px solid #00ffff;
  color: #00ffff;
  padding: 1rem 2rem;
  font-family: 'Orbitron', monospace;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  text-transform: uppercase;
  margin-bottom: 1rem;
}

.cyber-upload-btn:hover:not(:disabled):not(.disabled) {
  border-color: #ff0080;
  color: #ff0080;
  box-shadow: 0 0 20px rgba(255, 0, 128, 0.5);
  transform: translateY(-2px);
}

.cyber-upload-btn.uploading {
  border-color: #ffff00;
  color: #ffff00;
  animation: uploading-glitch 1s infinite;
}

.cyber-upload-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.cyber-upload-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.cyber-upload-btn.expired {
  background: linear-gradient(45deg, rgba(139, 0, 0, 0.4), rgba(255, 0, 0, 0.2));
  border-color: #ff0000;
  color: #ff6666;
  cursor: not-allowed;
}

.cyber-upload-btn.expired:hover {
  background: linear-gradient(45deg, rgba(139, 0, 0, 0.4), rgba(255, 0, 0, 0.2));
  border-color: #ff0000;
  color: #ff6666;
  transform: none;
  box-shadow: none;
}

.btn-inner {
  position: relative;
  z-index: 2;
}

.btn-text {
  font-size: 1rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
}

.btn-subtext {
  font-size: 0.7rem;
  opacity: 0.8;
}

.btn-glow {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(0, 255, 255, 0.3), transparent);
  animation: btn-glow-sweep 2s infinite;
}

.btn-static {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: repeating-linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 0, 0.1) 2px
  );
  animation: static-noise 0.1s infinite;
}

@keyframes btn-glow-sweep {
  0% { left: -100%; }
  100% { left: 100%; }
}

@keyframes static-noise {
  0% { transform: translateX(0); }
  100% { transform: translateX(2px); }
}

@keyframes uploading-glitch {
  0%, 90% { 
    box-shadow: 0 0 10px rgba(255, 255, 0, 0.5);
  }
  91%, 100% { 
    box-shadow: 0 0 20px rgba(255, 255, 0, 0.8);
    transform: translateX(2px);
  }
}

.progress-matrix {
  background: rgba(0, 0, 0, 0.8);
  border: 1px solid #ffff00;
  padding: 1rem;
}

.progress-header {
  color: #ffff00;
  font-weight: 700;
  text-align: center;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  text-shadow: 0 0 5px #ffff00;
}

.progress-bar-cyber {
  width: 100%;
  height: 20px;
  background: rgba(0, 0, 0, 0.8);
  border: 1px solid #ffff00;
  position: relative;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill-cyber {
  height: 100%;
  background: linear-gradient(90deg, #ffff00, #ff0080);
  box-shadow: 0 0 10px rgba(255, 255, 0, 0.5);
  transition: width 0.3s ease;
}

.progress-scan-line {
  position: absolute;
  top: 0;
  width: 2px;
  height: 100%;
  background: #ffffff;
  box-shadow: 0 0 5px #ffffff;
  animation: scan-line 1s infinite;
}

@keyframes scan-line {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.progress-data {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
}

.progress-percent {
  color: #ffff00;
  font-weight: 700;
}

.progress-status {
  color: #ffffff;
}

.data-matrices {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.matrix-panel {
  background: rgba(0, 0, 0, 0.8);
  border: 1px solid #00ffff;
}

.matrix-header {
  background: #00ffff;
  color: #000000;
  padding: 0.5rem;
  font-weight: 700;
  text-align: center;
  font-size: 0.8rem;
}

.data-display {
  padding: 1rem;
  max-height: 200px;
  overflow-y: auto;
}

.empty-matrix {
  text-align: center;
  padding: 2rem 0;
}

.empty-text {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.empty-scan {
  color: #00ffff;
  font-size: 0.7rem;
  animation: empty-blink 1s infinite;
}

@keyframes empty-blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0.3; }
}

.data-grid {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.data-entry {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 0.5rem;
  padding: 0.25rem;
  border-bottom: 1px dotted rgba(0, 255, 255, 0.3);
  font-size: 0.8rem;
  align-items: center;
}

.data-entry.newly-uploaded {
  background: rgba(255, 0, 128, 0.1);
  color: #ff0080;
  text-shadow: 0 0 5px #ff0080;
}

.data-entry.pending {
  background: rgba(255, 255, 0, 0.1);
  color: #ffff00;
}

.entry-marker {
  color: #00ffff;
  font-weight: 700;
}

.entry-path {
  word-break: break-all;
  color: #ffffff;
}

.entry-hash, .entry-size {
  color: #666;
  font-size: 0.7rem;
}

.action-matrix {
  display: flex;
  gap: 1rem;
  margin: 1rem 0;
}

.cyber-action-btn {
  flex: 1;
  background: rgba(0, 0, 0, 0.8);
  border: 1px solid #00ffff;
  color: #00ffff;
  padding: 0.75rem;
  font-family: 'Orbitron', monospace;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.cyber-action-btn:hover:not(:disabled) {
  background: rgba(0, 255, 255, 0.1);
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.3);
}

.cyber-action-btn.danger {
  border-color: #ff0080;
  color: #ff0080;
}

.cyber-action-btn.danger:hover:not(:disabled) {
  background: rgba(255, 0, 128, 0.1);
  box-shadow: 0 0 10px rgba(255, 0, 128, 0.3);
}

.cyber-action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.cyber-action-btn.expired {
  background: rgba(102, 102, 102, 0.8);
  border-color: #666666;
  color: #cccccc;
  cursor: not-allowed;
}

.cyber-action-btn.expired:hover {
  background: rgba(102, 102, 102, 0.8);
  border-color: #666666;
  color: #cccccc;
  box-shadow: none;
}

.monitor-value.status-expired {
  color: #ff0000;
  text-shadow: 0 0 5px #ff0000;
}

.btn-icon {
  font-size: 1rem;
}

.system-monitor {
  background: rgba(0, 0, 0, 0.8);
  border: 1px solid #00ffff;
  padding: 1rem;
  font-size: 0.8rem;
}

.monitor-line {
  display: flex;
  justify-content: space-between;
  padding: 0.25rem 0;
  border-bottom: 1px dotted rgba(0, 255, 255, 0.2);
}

.monitor-label {
  color: #00ffff;
}

.monitor-value {
  color: #ffffff;
}

/* Custom scrollbar */
.data-display::-webkit-scrollbar {
  width: 6px;
}

.data-display::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.5);
}

.data-display::-webkit-scrollbar-thumb {
  background: #00ffff;
  border-radius: 3px;
}

.data-display::-webkit-scrollbar-thumb:hover {
  background: #ff0080;
}

@media (max-width: 768px) {
  .cyberpunk-container {
    padding: 1rem 0;
  }
  
  .cyber-interface {
    width: 95%;
    padding: 1rem;
    max-height: calc(100vh - 4rem);
  }
  
  .interface-header {
    flex-direction: column;
    gap: 1rem;
  }
  
  .cyber-title {
    font-size: 1.5rem;
  }
  
  .title-glitch {
    font-size: 1.5rem;
  }
  
  .input-row {
    flex-direction: column;
    align-items: stretch;
  }
  
  .cyber-input-label {
    min-width: auto;
    margin-bottom: 0.5rem;
  }
  
  .data-matrices {
    grid-template-columns: 1fr;
  }
  
  .action-matrix {
    flex-direction: column;
  }
}
</style>