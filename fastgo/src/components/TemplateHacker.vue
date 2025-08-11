<template>
  <div class="terminal-container">
    <div class="terminal-header">
      <div class="terminal-controls">
        <span class="control-btn close"></span>
        <span class="control-btn minimize"></span>
        <span class="control-btn maximize"></span>
      </div>
      <div class="terminal-title">FastGo Terminal v2.1.0 - Secure File Transfer Protocol</div>
    </div>
    
    <div class="terminal-content">
      <!-- 黑客终端风格过期横幅 -->
      <div v-if="isExpired" class="hacker-expired-banner">
        <div class="hacker-expired-content">
          <div class="terminal-error-block">
            <div class="error-line">[ERROR] Connection timeout</div>
            <div class="error-line">[ERROR] Authentication failed</div>
            <div class="error-line">[FATAL] Access token expired</div>
            <div class="error-line status-line">> CONNECTION TERMINATED &lt;</div>
          </div>
        </div>
      </div>
      
      <div class="terminal-output">
        <div class="output-line">
          <span class="prompt">root@fastgo:~$</span>
          <span class="command">ls -la /secure_files/</span>
        </div>
        <div class="output-line">
          <span class="file-info">-rw-r--r-- 1 root root {{ getFileSize() }} {{ getCurrentDate() }} {{ tokenInfo.file_name }}</span>
        </div>
        <div class="output-line">
          <span class="prompt">root@fastgo:~$</span>
          <span class="command">check_download_permissions {{ tokenInfo.file_name }}</span>
        </div>
        <div class="output-line success">
          <span class="status">[OK] File access granted</span>
        </div>
        <div class="output-line success">
          <span class="status">[OK] Download attempts remaining: {{ tokenInfo.downloads_left || 'UNLIMITED' }}</span>
        </div>
        <div class="output-line warning">
          <span class="status">[WARNING] Secure connection required</span>
        </div>
        <div class="output-line">
          <span class="prompt">root@fastgo:~$</span>
          <span class="command">initiate_secure_download</span>
        </div>
      </div>
      
      <div class="download-interface">
        <div class="scan-lines"></div>
        <div class="file-display">
          <div class="file-grid">
            <span class="grid-label">FILENAME:</span>
            <span class="grid-value">{{ tokenInfo.file_name }}</span>
            <span class="grid-label">STATUS:</span>
            <span class="grid-value" :class="{
              'status-ready': !downloading && !downloadExhausted && !isExpired,
              'status-downloading': downloading,
              'status-exhausted': downloadExhausted,
              'status-expired': isExpired
            }">
              {{ isExpired ? 'EXPIRED' : downloadExhausted ? 'EXHAUSTED' : downloading ? 'DOWNLOADING' : 'READY' }}
            </span>
            <span class="grid-label">ENCRYPTION:</span>
            <span class="grid-value">AES-256</span>
            <span class="grid-label">PROTOCOL:</span>
            <span class="grid-value">HTTPS/TLS</span>
          </div>
        </div>
        
        <button 
          class="download-execute"
          :class="{ 
            'execute-downloading': downloading, 
            'execute-exhausted': downloadExhausted,
            'execute-expired': isExpired
          }"
          :disabled="downloading || downloadExhausted || isExpired"
          @click="$emit('download-clicked')"
        >
          <span class="execute-text">
            {{ isExpired ? '&gt; LINK EXPIRED &lt;' : downloadExhausted ? '&gt; ACCESS DENIED &lt;' : downloading ? '&gt; DOWNLOADING... &lt;' : '&gt; EXECUTE DOWNLOAD &lt;' }}
          </span>
          <div class="button-glow" v-if="!downloadExhausted && !isExpired"></div>
        </button>
        
        <div class="terminal-footer">
          <div class="typing-line">
            <span class="prompt">root@fastgo:~$</span>
            <span class="typing-text">{{ typingText }}</span>
            <span class="cursor">█</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onUnmounted } from 'vue';
import type { PropType } from 'vue';
import type { TokenInfo } from '@/api/token';

export default defineComponent({
  props: {
    tokenInfo: { type: Object as PropType<TokenInfo>, required: true },
    downloadLink: { type: String, required: true },
    downloading: { type: Boolean, default: false },
    downloadExhausted: { type: Boolean, default: false },
    isExpired: { type: Boolean, default: false }
  },
  emits: ['download-clicked'],
  setup() {
    const typingText = ref('');
    const fullText = 'waiting for user input...';
    let typingInterval: number | null = null;
    
    const typeText = () => {
      let i = 0;
      typingInterval = setInterval(() => {
        if (i < fullText.length) {
          typingText.value += fullText.charAt(i);
          i++;
        } else {
          setTimeout(() => {
            typingText.value = '';
            i = 0;
          }, 2000);
        }
      }, 100);
    };
    
    onMounted(() => {
      typeText();
    });
    
    onUnmounted(() => {
      if (typingInterval) {
        clearInterval(typingInterval);
      }
    });
    
    const getFileSize = () => {
      return Math.floor(Math.random() * 999) + 1 + 'KB';
    };
    
    const getCurrentDate = () => {
      return new Date().toLocaleDateString('en-US', { 
        month: 'short', 
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    };
    
    return {
      typingText,
      getFileSize,
      getCurrentDate
    };
  }
});
</script>

<style scoped>
.terminal-container {
  height: 100vh;
  width: 100vw;
  margin: 0;
  padding: 0;
  background: #0a0a0a;
  color: #00ff00;
  font-family: 'Courier New', monospace;
  position: fixed;
  top: 0;
  left: 0;
  overflow-y: auto;
  box-sizing: border-box;
}

.terminal-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    repeating-linear-gradient(
      0deg,
      transparent,
      transparent 2px,
      rgba(0, 255, 0, 0.03) 2px,
      rgba(0, 255, 0, 0.03) 4px
    );
  pointer-events: none;
  z-index: 1;
}

.terminal-header {
  background: #1a1a1a;
  border-bottom: 1px solid #333;
  padding: 0.5rem 1rem;
  display: flex;
  align-items: center;
  position: relative;
  z-index: 2;
}

.terminal-controls {
  display: flex;
  gap: 0.5rem;
  margin-right: 1rem;
}

.control-btn {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.control-btn.close { background: #ff5f56; }
.control-btn.minimize { background: #ffbd2e; }
.control-btn.maximize { background: #27ca3f; }

.terminal-title {
  color: #888;
  font-size: 0.9rem;
}

.terminal-content {
  padding: 1rem;
  position: relative;
  z-index: 2;
}

.terminal-output {
  margin-bottom: 2rem;
}

.output-line {
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.prompt {
  color: #00ff00;
  font-weight: bold;
}

.command {
  color: #ffffff;
  margin-left: 0.5rem;
}

.file-info {
  color: #00ffff;
}

.status {
  font-weight: bold;
}

.output-line.success .status {
  color: #00ff00;
}

.output-line.warning .status {
  color: #ffff00;
}

.download-interface {
  background: rgba(0, 50, 0, 0.3);
  border: 1px solid #00ff00;
  border-radius: 4px;
  padding: 2rem;
  position: relative;
  margin-top: 2rem;
}

.scan-lines {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, #00ff00, transparent);
  animation: scan 2s infinite;
}

@keyframes scan {
  0% { top: 0; opacity: 1; }
  100% { top: 100%; opacity: 0; }
}

.file-display {
  margin-bottom: 2rem;
}

.file-grid {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.5rem 2rem;
  align-items: center;
}

.grid-label {
  color: #888;
  font-weight: bold;
  text-align: right;
}

.grid-value {
  color: #00ffff;
  word-break: break-all;
}

.status-ready {
  color: #00ff00 !important;
  animation: blink 1s infinite;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0.5; }
}

.download-execute {
  width: 100%;
  background: transparent;
  border: 2px solid #00ff00;
  color: #00ff00;
  padding: 1rem 2rem;
  font-family: 'Courier New', monospace;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  margin-bottom: 2rem;
}

.download-execute:hover:not(:disabled) {
  background: rgba(0, 255, 0, 0.1);
  box-shadow: 
    0 0 20px rgba(0, 255, 0, 0.5),
    inset 0 0 20px rgba(0, 255, 0, 0.1);
}

.download-execute.execute-downloading {
  border-color: #ffff00;
  color: #ffff00;
  background: rgba(255, 255, 0, 0.1);
  cursor: not-allowed;
  animation: execute-pulse 1s infinite;
}

.download-execute.execute-exhausted {
  border-color: #ff0000;
  color: #ff0000;
  background: rgba(255, 0, 0, 0.1);
  cursor: not-allowed;
  opacity: 0.6;
}

.download-execute.execute-expired {
  border-color: #ff0000;
  color: #ff0000;
  background: rgba(255, 0, 0, 0.1);
  cursor: not-allowed;
  opacity: 0.7;
  animation: execute-expired-pulse 2s infinite;
}

.status-downloading {
  color: #ffff00 !important;
  animation: status-downloading 1s infinite;
}

.status-exhausted {
  color: #ff0000 !important;
}

.status-expired {
  color: #ff0000 !important;
  animation: status-expired-blink 1.5s infinite;
}

@keyframes execute-pulse {
  0%, 100% { 
    box-shadow: 
      0 0 20px rgba(255, 255, 0, 0.5),
      inset 0 0 20px rgba(255, 255, 0, 0.1);
  }
  50% { 
    box-shadow: 
      0 0 30px rgba(255, 255, 0, 0.8),
      inset 0 0 30px rgba(255, 255, 0, 0.2);
  }
}

@keyframes status-downloading {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0.5; }
}

@keyframes execute-expired-pulse {
  0%, 100% { 
    box-shadow: 
      0 0 20px rgba(255, 0, 0, 0.5),
      inset 0 0 20px rgba(255, 0, 0, 0.1);
  }
  50% { 
    box-shadow: 
      0 0 30px rgba(255, 0, 0, 0.8),
      inset 0 0 30px rgba(255, 0, 0, 0.2);
  }
}

@keyframes status-expired-blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0.3; }
}

.execute-text {
  position: relative;
  z-index: 2;
}

.button-glow {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(0, 255, 0, 0.3), transparent);
  animation: glow-sweep 2s infinite;
}

@keyframes glow-sweep {
  0% { left: -100%; }
  100% { left: 100%; }
}

.terminal-footer {
  border-top: 1px solid #333;
  padding-top: 1rem;
}

.typing-line {
  display: flex;
  align-items: center;
}

.typing-text {
  color: #ffffff;
  margin-left: 0.5rem;
}

.cursor {
  color: #00ff00;
  animation: cursor-blink 1s infinite;
  margin-left: 2px;
}

@keyframes cursor-blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

/* 黑客终端风格过期横幅 */
.hacker-expired-banner {
  position: absolute;
  top: 10px;
  left: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.95);
  border: 2px solid #ff0000;
  border-radius: 4px;
  z-index: 100;
  box-shadow: 
    0 0 20px rgba(255, 0, 0, 0.5),
    inset 0 0 20px rgba(255, 0, 0, 0.1);
}

.hacker-expired-content {
  padding: 15px;
}

.terminal-error-block {
  font-family: 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.4;
}

.error-line {
  color: #ff0000;
  margin-bottom: 3px;
  animation: error-blink 1s infinite;
}

.error-line:nth-child(1) { animation-delay: 0s; }
.error-line:nth-child(2) { animation-delay: 0.2s; }
.error-line:nth-child(3) { animation-delay: 0.4s; }

.status-line {
  color: #ffff00;
  font-weight: bold;
  margin-top: 8px;
  text-align: center;
  animation: hacker-flash 0.5s infinite;
}

@keyframes error-blink {
  0%, 70%, 100% { opacity: 1; }
  85% { opacity: 0.3; }
}

@keyframes hacker-flash {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0.7; }
}

@media (max-width: 768px) {
  .terminal-container {
    font-size: 0.8rem;
    padding: 0;
  }
  
  .terminal-header {
    padding: 0.5rem;
  }
  
  .terminal-content {
    padding: 0.5rem;
  }
  
  .download-interface {
    padding: 1rem;
  }
  
  .file-grid {
    grid-template-columns: 1fr;
    gap: 0.3rem;
  }
  
  .grid-label {
    text-align: left;
    color: #00ff00;
  }
}
</style>