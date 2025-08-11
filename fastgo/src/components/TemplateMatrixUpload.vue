<template>
  <div class="matrix-container">
    <div class="matrix-rain" ref="matrixCanvas"></div>
    <div class="matrix-content">
      <!-- 过期横幅 -->
      <div v-if="isExpired" class="matrix-expired-banner">
        <div class="matrix-expired-content">
          <div class="matrix-skull">
            <pre class="ascii-art">
 ╭─────╮
 │ X X │
 │  ─  │
 ╰─────╯
            </pre>
          </div>
          <h2 class="expired-title">CONNECTION TERMINATED</h2>
          <p class="expired-message">ACCESS_DENIED: UPLOAD_SESSION_EXPIRED</p>
        </div>
      </div>
      
      <div class="matrix-header">
        <div class="matrix-logo">
          <div class="logo-text">
            <span class="matrix-char">M</span>
            <span class="matrix-char">A</span>
            <span class="matrix-char">T</span>
            <span class="matrix-char">R</span>
            <span class="matrix-char">I</span>
            <span class="matrix-char">X</span>
          </div>
          <h1 class="matrix-title">DATA UPLOAD TERMINAL</h1>
        </div>
      </div>

      <div class="matrix-card">
        <div class="card-border"></div>
        
        <!-- 存储容量显示 -->
        <div class="capacity-section">
          <div class="terminal-line">
            <span class="prompt">root@matrix:~$</span>
            <span class="command">df -h /data/storage</span>
          </div>
          <div class="capacity-bar">
            <div class="bar-container">
              <div class="bar-fill" :style="{ width: getCapacityPercentage() + '%' }"></div>
              <div class="bar-text">
                <span>STORAGE: {{ getUsedCapacity() }} / {{ getTotalCapacity() }}</span>
                <span class="percentage">{{ Math.round(getCapacityPercentage()) }}%</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 文件上传区域 -->
        <div class="upload-zone">
          <div class="zone-header">
            <span class="prompt">root@matrix:~$</span>
            <span class="command">./upload --secure --target=/data/storage</span>
          </div>
          
          <div class="zone-content">
            <div class="upload-icon">
              <div class="data-stream">
                <span class="stream-char">1</span>
                <span class="stream-char">0</span>
                <span class="stream-char">1</span>
                <span class="stream-char">1</span>
                <span class="stream-char">0</span>
              </div>
            </div>
            <h3 class="zone-title">SELECT_DATA_FOR_TRANSMISSION</h3>
            <p class="zone-description">CHOOSE FILES OR DIRECTORIES TO UPLOAD TO THE MATRIX</p>
            
            <div class="file-inputs">
              <label class="file-input-label">
                <input 
                  type="file" 
                  multiple 
                  @change="handleSingleFileChange"
                  :disabled="isExpired"
                >
                <span class="input-text">&gt; SELECT_FILES &lt;</span>
              </label>
              
              <label class="file-input-label">
                <input 
                  type="file" 
                  webkitdirectory 
                  @change="handleFolderChange"
                  :disabled="isExpired"
                >
                <span class="input-text">&gt; SELECT_DIRECTORY &lt;</span>
              </label>
            </div>
          </div>
        </div>

        <!-- 选中的文件列表 -->
        <div v-if="selectedFiles.length > 0" class="selected-files">
          <div class="files-header">
            <span class="prompt">root@matrix:~$</span>
            <span class="command">ls -la /tmp/selected_files ({{ selectedFiles.length }})</span>
          </div>
          <div class="files-list">
            <div 
              v-for="(file, index) in selectedFiles.slice(0, 5)" 
              :key="index" 
              class="file-item"
            >
              <span class="file-permissions">-rw-r--r--</span>
              <span class="file-name">{{ getRelativePath(file) }}</span>
              <span class="file-size">{{ formatBytes(file.size) }}</span>
            </div>
            <div v-if="selectedFiles.length > 5" class="more-files">
              [INFO] {{ selectedFiles.length - 5 }} more files in buffer...
            </div>
          </div>
        </div>

        <!-- 上传按钮和进度 -->
        <div class="upload-section">
          <div class="upload-command">
            <span class="prompt">root@matrix:~$</span>
            <span class="command">./execute_upload --confirm</span>
          </div>
          
          <button 
            class="matrix-upload-btn" 
            :class="{ 
              'uploading': uploading, 
              'disabled': uploading || selectedFiles.length === 0 || isExpired 
            }"
            @click="$emit('upload-clicked')"
            :disabled="uploading || selectedFiles.length === 0 || isExpired"
          >
            <div class="btn-scan-line"></div>
            <span v-if="uploading" class="btn-text">
              <div class="matrix-loader">
                <span class="loader-char">|</span>
                <span class="loader-char">/</span>
                <span class="loader-char">-</span>
                <span class="loader-char">\</span>
              </div>
              TRANSMITTING_DATA...
            </span>
            <span v-else-if="isExpired" class="btn-text">CONNECTION_TERMINATED</span>
            <span v-else class="btn-text">
              &gt; EXECUTE_UPLOAD &lt;
            </span>
          </button>

          <!-- 上传进度 -->
          <div v-if="uploading && uploadProgress > 0" class="progress-container">
            <div class="progress-line">
              <span class="prompt">root@matrix:~$</span>
              <span class="command">upload --progress</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: uploadProgress + '%' }"></div>
              <div class="progress-text">
                <span>[{{ '='.repeat(Math.floor(uploadProgress / 5)) }}{{ ' '.repeat(20 - Math.floor(uploadProgress / 5)) }}] {{ Math.round(uploadProgress) }}%</span>
              </div>
            </div>
          </div>

          <!-- 状态消息 -->
          <div v-if="uploadStatus" class="status-message" :class="getStatusClass()">
            <span class="status-prefix">[{{ getStatusPrefix() }}]</span>
            <span class="status-text">{{ formatStatus(uploadStatus) }}</span>
          </div>
        </div>

        <!-- 服务器文件列表 -->
        <div v-if="serverFiles.length > 0" class="server-files">
          <div class="server-header">
            <div class="server-command">
              <span class="prompt">root@matrix:~$</span>
              <span class="command">ls -la /data/storage</span>
              <button class="refresh-btn" @click="$emit('refresh-files')" title="Refresh">⟲</button>
            </div>
          </div>
          <div class="server-files-list">
            <div 
              v-for="(file, index) in serverFiles" 
              :key="index" 
              class="server-file-item"
            >
              <span class="file-permissions">-rw-r--r--</span>
              <span class="file-owner">root matrix</span>
              <span class="file-name">{{ file }}</span>
            </div>
          </div>
          <div class="clear-section">
            <div class="clear-command">
              <span class="prompt">root@matrix:~$</span>
              <span class="command">rm -rf /data/storage/*</span>
            </div>
            <button 
              class="clear-storage-btn" 
              @click="$emit('clear-storage')"
              :disabled="isExpired"
            >
              <span class="clear-text">&gt; PURGE_ALL_DATA &lt;</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, onUnmounted, ref } from 'vue';
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
    const matrixCanvas = ref<HTMLElement | null>(null);
    let animationFrame: number;

    const initMatrixRain = () => {
      if (!matrixCanvas.value) return;
      
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      matrixCanvas.value.appendChild(canvas);

      const resizeCanvas = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      };

      resizeCanvas();
      window.addEventListener('resize', resizeCanvas);

      const characters = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const fontSize = 14;
      const columns = canvas.width / fontSize;
      const drops: number[] = [];

      for (let i = 0; i < columns; i++) {
        drops[i] = 1;
      }

      const draw = () => {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#00ff00';
        ctx.font = `${fontSize}px monospace`;

        for (let i = 0; i < drops.length; i++) {
          const text = characters[Math.floor(Math.random() * characters.length)];
          ctx.fillText(text, i * fontSize, drops[i] * fontSize);

          if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
            drops[i] = 0;
          }

          drops[i]++;
        }

        animationFrame = requestAnimationFrame(draw);
      };

      draw();

      return () => {
        window.removeEventListener('resize', resizeCanvas);
        if (animationFrame) cancelAnimationFrame(animationFrame);
        if (matrixCanvas.value && canvas) {
          matrixCanvas.value.removeChild(canvas);
        }
      };
    };

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
      if (bytes === 0) return '0_B';
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + '_' + sizes[i];
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

    const getStatusPrefix = () => {
      const status = props.uploadStatus?.toLowerCase() || '';
      if (status.includes('成功') || status.includes('success')) return 'OK';
      if (status.includes('失败') || status.includes('failed') || status.includes('错误')) return 'ERROR';
      if (status.includes('空间') || status.includes('storage') || status.includes('限制')) return 'WARNING';
      return 'INFO';
    };

    const formatStatus = (status: string) => {
      return status.replace(/[：:]/g, ': ').toUpperCase();
    };

    onMounted(() => {
      initMatrixRain();
    });

    onUnmounted(() => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
    });

    return {
      matrixCanvas,
      handleSingleFileChange,
      handleFolderChange,
      getRelativePath,
      formatBytes,
      getCapacityPercentage,
      getUsedCapacity,
      getTotalCapacity,
      getStatusClass,
      getStatusPrefix,
      formatStatus
    };
  }
});
</script>

<style scoped>
.matrix-container {
  min-height: 100vh;
  background: #000000;
  position: relative;
  overflow-x: hidden;
  overflow-y: auto;
  font-family: 'Courier New', monospace;
}

.matrix-rain {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  opacity: 0.3;
}

.matrix-content {
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

.matrix-expired-banner {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: linear-gradient(45deg, rgba(255, 0, 0, 0.95), rgba(139, 0, 0, 0.95));
  border-bottom: 2px solid #ff0000;
  z-index: 1000;
  padding: 1.5rem 0;
  font-family: 'Courier New', monospace;
}

.matrix-expired-content {
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
  color: #00ff00;
}

.matrix-skull .ascii-art {
  font-size: 1rem;
  line-height: 1;
  margin: 0;
  color: #ff0000;
  animation: flicker 1s ease-in-out infinite;
}

.expired-title {
  font-size: 1.8rem;
  font-weight: 700;
  margin: 1rem 0 0.5rem 0;
  color: #ff0000;
  letter-spacing: 2px;
  animation: glitch 2s ease-in-out infinite;
}

.expired-message {
  font-size: 1.1rem;
  margin: 0;
  color: #00ff00;
  letter-spacing: 1px;
}

.matrix-header {
  text-align: center;
  margin-bottom: 2rem;
}

.matrix-logo {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.logo-text {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.matrix-char {
  font-size: 2rem;
  color: #00ff00;
  font-weight: bold;
  animation: matrix-glow 2s ease-in-out infinite;
  text-shadow: 0 0 10px #00ff00;
}

.matrix-char:nth-child(2) { animation-delay: 0.2s; }
.matrix-char:nth-child(3) { animation-delay: 0.4s; }
.matrix-char:nth-child(4) { animation-delay: 0.6s; }
.matrix-char:nth-child(5) { animation-delay: 0.8s; }
.matrix-char:nth-child(6) { animation-delay: 1s; }

@keyframes matrix-glow {
  0%, 100% { 
    opacity: 1; 
    text-shadow: 0 0 10px #00ff00;
  }
  50% { 
    opacity: 0.7; 
    text-shadow: 0 0 20px #00ff00, 0 0 30px #00ff00;
  }
}

.matrix-title {
  font-size: 1.6rem;
  font-weight: 400;
  color: #00ff00;
  margin: 0;
  letter-spacing: 3px;
  text-shadow: 0 0 10px #00ff00;
}

.matrix-card {
  background: rgba(0, 0, 0, 0.9);
  border: 2px solid #00ff00;
  border-radius: 5px;
  padding: 2rem;
  width: 100%;
  max-width: 700px;
  position: relative;
  box-shadow: 
    0 0 20px rgba(0, 255, 0, 0.3),
    inset 0 0 20px rgba(0, 255, 0, 0.05);
  margin-bottom: 2rem;
  max-height: 70vh;
  overflow-y: auto;
}

.card-border {
  position: absolute;
  top: -1px;
  left: -1px;
  right: -1px;
  bottom: -300px;
  background: linear-gradient(90deg, #00ff00, transparent, #00ff00);
  animation: border-scan 3s linear infinite;
  z-index: -1;
}

@keyframes border-scan {
  0% { background-position: 0% 50%; }
  100% { background-position: 200% 50%; }
}

.terminal-line, .zone-header, .files-header, .upload-command, .progress-line, .server-command, .clear-command {
  color: #00ff00;
  font-size: 0.9rem;
  margin-bottom: 0.8rem;
  padding: 0.3rem;
  background: rgba(0, 255, 0, 0.05);
  border-left: 3px solid #00ff00;
}

.prompt {
  color: #00ff00;
  font-weight: bold;
}

.command {
  color: #ffffff;
  margin-left: 0.5rem;
}

.capacity-section {
  margin-bottom: 2rem;
}

.capacity-bar {
  margin-top: 0.5rem;
}

.bar-container {
  position: relative;
  background: rgba(0, 255, 0, 0.1);
  border: 1px solid #00ff00;
  height: 30px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #00ff00, #ffff00);
  transition: width 0.3s ease;
}

.bar-text {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  transform: translateY(-50%);
  display: flex;
  justify-content: space-between;
  padding: 0 0.5rem;
  font-size: 0.8rem;
  font-weight: bold;
  color: #000000;
  text-shadow: 1px 1px 0 #00ff00;
}

.upload-zone {
  border: 2px dashed rgba(0, 255, 0, 0.3);
  border-radius: 5px;
  padding: 2rem;
  text-align: center;
  margin-bottom: 2rem;
  transition: all 0.3s ease;
}

.upload-zone:hover {
  border-color: rgba(0, 255, 0, 0.5);
  background: rgba(0, 255, 0, 0.02);
}

.zone-content {
  color: #ffffff;
}

.upload-icon {
  margin-bottom: 1rem;
}

.data-stream {
  display: flex;
  justify-content: center;
  gap: 0.2rem;
  font-size: 2rem;
  font-weight: bold;
}

.stream-char {
  color: #00ff00;
  animation: stream-flow 1.5s ease-in-out infinite;
  text-shadow: 0 0 10px #00ff00;
}

.stream-char:nth-child(1) { animation-delay: 0s; }
.stream-char:nth-child(2) { animation-delay: 0.3s; }
.stream-char:nth-child(3) { animation-delay: 0.6s; }
.stream-char:nth-child(4) { animation-delay: 0.9s; }
.stream-char:nth-child(5) { animation-delay: 1.2s; }

@keyframes stream-flow {
  0%, 100% { 
    opacity: 0.3; 
    transform: translateY(0);
  }
  50% { 
    opacity: 1; 
    transform: translateY(-5px);
  }
}

.zone-title {
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  color: #00ff00;
  letter-spacing: 2px;
}

.zone-description {
  color: rgba(255, 255, 255, 0.7);
  margin: 0 0 2rem 0;
  font-size: 0.9rem;
  letter-spacing: 1px;
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
  padding: 0.8rem 1.5rem;
  background: transparent;
  border: 1px solid #00ff00;
  color: #00ff00;
  font-size: 0.9rem;
  font-weight: bold;
  transition: all 0.3s ease;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.file-input-label:hover {
  background: rgba(0, 255, 0, 0.1);
  box-shadow: 0 0 15px rgba(0, 255, 0, 0.3);
  text-shadow: 0 0 5px #00ff00;
}

.file-input-label input[type="file"] {
  position: absolute;
  left: -9999px;
  opacity: 0;
}

.selected-files {
  margin-bottom: 2rem;
}

.files-list {
  background: rgba(0, 255, 0, 0.03);
  border: 1px solid rgba(0, 255, 0, 0.1);
  padding: 1rem;
}

.file-item {
  display: grid;
  grid-template-columns: 100px 1fr 80px;
  gap: 0.5rem;
  align-items: center;
  padding: 0.3rem 0;
  border-bottom: 1px solid rgba(0, 255, 0, 0.1);
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.8rem;
}

.file-item:last-child {
  border-bottom: none;
}

.file-permissions {
  color: #00ff00;
  font-size: 0.7rem;
}

.file-name {
  word-break: break-all;
}

.file-size {
  color: rgba(0, 255, 0, 0.7);
  font-size: 0.7rem;
  text-align: right;
}

.more-files {
  color: rgba(0, 255, 0, 0.6);
  font-style: italic;
  text-align: center;
  padding: 0.5rem 0;
  font-size: 0.8rem;
}

.upload-section {
  text-align: center;
  margin-bottom: 2rem;
}

.matrix-upload-btn {
  position: relative;
  width: 100%;
  padding: 1.2rem 2rem;
  background: transparent;
  border: 2px solid #00ff00;
  color: #00ff00;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;
  text-transform: uppercase;
  letter-spacing: 2px;
  font-family: 'Courier New', monospace;
  margin-top: 0.5rem;
}

.btn-scan-line {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 2px;
  background: #00ff00;
  animation: scan-line 2s linear infinite;
}

@keyframes scan-line {
  0% { left: -100%; }
  100% { left: 100%; }
}

.matrix-upload-btn:hover {
  background: rgba(0, 255, 0, 0.1);
  box-shadow: 
    0 0 20px rgba(0, 255, 0, 0.5),
    inset 0 0 20px rgba(0, 255, 0, 0.1);
  text-shadow: 0 0 10px #00ff00;
}

.matrix-upload-btn.uploading {
  color: #ffff00;
  border-color: #ffff00;
  background: rgba(255, 255, 0, 0.1);
}

.matrix-upload-btn.disabled {
  border-color: #ff0000;
  color: #ff0000;
  cursor: not-allowed;
  animation: error-blink 1s ease-in-out infinite;
}

@keyframes error-blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.btn-text {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.matrix-loader {
  display: flex;
  gap: 0.1rem;
}

.loader-char {
  animation: spin-char 1s linear infinite;
}

.loader-char:nth-child(1) { animation-delay: 0s; }
.loader-char:nth-child(2) { animation-delay: 0.25s; }
.loader-char:nth-child(3) { animation-delay: 0.5s; }
.loader-char:nth-child(4) { animation-delay: 0.75s; }

@keyframes spin-char {
  0% { opacity: 0; }
  25% { opacity: 1; }
  50% { opacity: 0; }
  75% { opacity: 0; }
  100% { opacity: 0; }
}

.progress-container {
  margin-top: 1rem;
}

.progress-bar {
  position: relative;
  background: rgba(0, 255, 0, 0.1);
  border: 1px solid #00ff00;
  height: 25px;
  overflow: hidden;
  margin-top: 0.5rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #00ff00, #ffff00);
  transition: width 0.3s ease;
}

.progress-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 0.8rem;
  font-weight: bold;
  color: #000000;
  text-shadow: 1px 1px 0 #00ff00;
}

.status-message {
  margin-top: 1rem;
  padding: 0.8rem 1rem;
  border: 1px solid #00ff00;
  background: rgba(0, 255, 0, 0.1);
  color: #00ff00;
  font-size: 0.9rem;
  font-family: 'Courier New', monospace;
  text-align: left;
}

.status-message.success {
  border-color: #00ff00;
  background: rgba(0, 255, 0, 0.1);
  color: #00ff00;
}

.status-message.error {
  border-color: #ff0000;
  background: rgba(255, 0, 0, 0.1);
  color: #ff0000;
}

.status-message.warning {
  border-color: #ffff00;
  background: rgba(255, 255, 0, 0.1);
  color: #ffff00;
}

.status-prefix {
  font-weight: bold;
  margin-right: 0.5rem;
}

.server-files {
  border-top: 1px solid rgba(0, 255, 0, 0.2);
  padding-top: 2rem;
}

.server-header {
  margin-bottom: 1rem;
}

.server-command {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.refresh-btn {
  background: transparent;
  border: 1px solid #00ff00;
  color: #00ff00;
  padding: 0.3rem 0.5rem;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.3s ease;
  margin-left: 1rem;
}

.refresh-btn:hover {
  background: rgba(0, 255, 0, 0.1);
  text-shadow: 0 0 5px #00ff00;
}

.server-files-list {
  background: rgba(0, 255, 0, 0.03);
  border: 1px solid rgba(0, 255, 0, 0.1);
  padding: 1rem;
  margin-bottom: 1rem;
  max-height: 200px;
  overflow-y: auto;
}

.server-file-item {
  display: grid;
  grid-template-columns: 100px 100px 1fr;
  gap: 0.5rem;
  align-items: center;
  padding: 0.3rem 0;
  border-bottom: 1px solid rgba(0, 255, 0, 0.1);
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.8rem;
}

.server-file-item:last-child {
  border-bottom: none;
}

.file-owner {
  color: rgba(0, 255, 0, 0.7);
  font-size: 0.7rem;
}

.clear-section {
  margin-top: 1rem;
}

.clear-storage-btn {
  width: 100%;
  padding: 0.8rem 1.5rem;
  background: transparent;
  border: 1px solid #ff0000;
  color: #ff0000;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'Courier New', monospace;
  font-weight: bold;
  letter-spacing: 1px;
  text-transform: uppercase;
  margin-top: 0.5rem;
}

.clear-storage-btn:hover {
  background: rgba(255, 0, 0, 0.1);
  box-shadow: 0 0 15px rgba(255, 0, 0, 0.3);
  text-shadow: 0 0 5px #ff0000;
}

.clear-storage-btn:disabled {
  border-color: rgba(255, 255, 255, 0.3);
  color: rgba(255, 255, 255, 0.5);
  cursor: not-allowed;
}

@keyframes flicker {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
}

@keyframes glitch {
  0%, 100% { transform: translateX(0); }
  10% { transform: translateX(-2px); }
  20% { transform: translateX(2px); }
  30% { transform: translateX(-1px); }
  40% { transform: translateX(1px); }
  50% { transform: translateX(0); }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .matrix-content {
    padding: 1rem;
    padding-top: 2rem;
  }
  
  .matrix-card {
    padding: 1.5rem;
  }
  
  .matrix-title {
    font-size: 1.3rem;
  }
  
  .logo-text {
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .matrix-char {
    font-size: 1.5rem;
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
  
  .file-item, .server-file-item {
    grid-template-columns: 1fr;
    gap: 0.2rem;
    text-align: left;
  }
  
  .bar-text {
    flex-direction: column;
    gap: 0.2rem;
    font-size: 0.7rem;
  }
}
</style>