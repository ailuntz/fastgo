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
          <p class="expired-message">ACCESS_DENIED: SESSION_EXPIRED</p>
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
          <h1 class="matrix-title">FILE TRANSMISSION PROTOCOL</h1>
        </div>
      </div>

      <div class="matrix-card">
        <div class="card-border"></div>
        <div class="terminal-header">
          <span class="terminal-prompt">root@matrix:~$</span>
          <span class="terminal-command">ls -la /transmission/{{ tokenInfo.file_name }}</span>
        </div>
        
        <div class="file-details">
          <div class="detail-line">
            <span class="label">FILE_NAME:</span>
            <span class="value">{{ tokenInfo.file_name }}</span>
          </div>
          <div class="detail-line">
            <span class="label">DOWNLOADS_REMAINING:</span>
            <span class="value">{{ tokenInfo.downloads_left || 'UNLIMITED' }}</span>
          </div>
          <div class="detail-line">
            <span class="label">STATUS:</span>
            <span class="value status-active">READY_FOR_TRANSMISSION</span>
          </div>
        </div>

        <div class="download-section">
          <div class="matrix-prompt">
            <span class="prompt-text">root@matrix:~$</span>
            <span class="command-text">./download --secure --file={{ tokenInfo.file_name }}</span>
          </div>
          
          <button 
            class="matrix-download-btn" 
            :class="{ 
              'downloading': downloading, 
              'disabled': downloading || downloadExhausted || isExpired 
            }"
            @click="$emit('download-clicked')"
            :disabled="downloading || downloadExhausted || isExpired"
          >
            <div class="btn-scan-line"></div>
            <span v-if="downloading" class="btn-text">
              <div class="matrix-loader">
                <span class="loader-char">|</span>
                <span class="loader-char">/</span>
                <span class="loader-char">-</span>
                <span class="loader-char">\</span>
              </div>
              TRANSMITTING_DATA...
            </span>
            <span v-else-if="downloadExhausted" class="btn-text">ACCESS_DENIED</span>
            <span v-else-if="isExpired" class="btn-text">CONNECTION_TERMINATED</span>
            <span v-else class="btn-text">
              &gt; INITIATE_DOWNLOAD &lt;
            </span>
          </button>
          
          <div v-if="downloadExhausted" class="status-message error">
            <span class="error-prefix">[ERROR]</span>
            DOWNLOAD_LIMIT_EXCEEDED
          </div>
        </div>

        <div class="matrix-footer">
          <div class="system-info">
            <span class="info-line">SECURE_TRANSMISSION_PROTOCOL_v2.1</span>
            <span class="info-line">ENCRYPTION: AES-256 | STATUS: ACTIVE</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, onUnmounted, ref } from 'vue';
import type { TokenInfo } from '@/api/token';

export default defineComponent({
  props: {
    tokenInfo: {
      type: Object as () => TokenInfo,
      required: true
    },
    downloadLink: String,
    downloading: Boolean,
    downloadExhausted: Boolean,
    isExpired: Boolean
  },
  emits: ['download-clicked'],
  setup() {
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

    onMounted(() => {
      initMatrixRain();
    });

    onUnmounted(() => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
    });

    return {
      matrixCanvas
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
  justify-content: center;
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
  margin-bottom: 3rem;
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
  font-size: 1.8rem;
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
  max-width: 600px;
  position: relative;
  box-shadow: 
    0 0 20px rgba(0, 255, 0, 0.3),
    inset 0 0 20px rgba(0, 255, 0, 0.05);
}

.card-border {
  position: absolute;
  top: -1px;
  left: -1px;
  right: -1px;
  bottom: -1px;
  background: linear-gradient(90deg, #00ff00, transparent, #00ff00);
  animation: border-scan 3s linear infinite;
  z-index: -1;
}

@keyframes border-scan {
  0% { background-position: 0% 50%; }
  100% { background-position: 200% 50%; }
}

.terminal-header {
  color: #00ff00;
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
  padding: 0.5rem;
  background: rgba(0, 255, 0, 0.05);
  border-left: 3px solid #00ff00;
}

.terminal-prompt {
  color: #00ff00;
  font-weight: bold;
}

.terminal-command {
  color: #ffffff;
  margin-left: 0.5rem;
}

.file-details {
  margin-bottom: 2rem;
}

.detail-line {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid rgba(0, 255, 0, 0.1);
  font-size: 0.95rem;
}

.detail-line:last-child {
  border-bottom: none;
}

.label {
  color: #00ff00;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.value {
  color: #ffffff;
  font-family: 'Courier New', monospace;
}

.status-active {
  color: #00ff00 !important;
  animation: pulse 2s ease-in-out infinite;
}

.download-section {
  text-align: center;
  margin-bottom: 2rem;
}

.matrix-prompt {
  margin-bottom: 1rem;
  padding: 0.8rem;
  background: rgba(0, 255, 0, 0.05);
  border: 1px solid rgba(0, 255, 0, 0.2);
  border-radius: 3px;
  text-align: left;
  font-size: 0.9rem;
}

.prompt-text {
  color: #00ff00;
  font-weight: bold;
}

.command-text {
  color: #ffffff;
  margin-left: 0.5rem;
}

.matrix-download-btn {
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

.matrix-download-btn:hover {
  background: rgba(0, 255, 0, 0.1);
  box-shadow: 
    0 0 20px rgba(0, 255, 0, 0.5),
    inset 0 0 20px rgba(0, 255, 0, 0.1);
  text-shadow: 0 0 10px #00ff00;
}

.matrix-download-btn.downloading {
  color: #ffff00;
  border-color: #ffff00;
  background: rgba(255, 255, 0, 0.1);
}

.matrix-download-btn.disabled {
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

.status-message {
  margin-top: 1rem;
  padding: 0.8rem 1rem;
  border: 1px solid #ff0000;
  background: rgba(255, 0, 0, 0.1);
  color: #ff0000;
  font-size: 0.9rem;
  font-family: 'Courier New', monospace;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.error-prefix {
  font-weight: bold;
  margin-right: 0.5rem;
}

.matrix-footer {
  border-top: 1px solid rgba(0, 255, 0, 0.2);
  padding-top: 1rem;
  margin-top: 1rem;
}

.system-info {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  font-size: 0.8rem;
  color: rgba(0, 255, 0, 0.7);
  text-align: center;
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

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .matrix-container {
    min-height: auto;
    height: auto;
  }
  
  .matrix-content {
    padding: 1rem;
  }
  
  .matrix-card {
    padding: 1.5rem;
  }
  
  .matrix-title {
    font-size: 1.4rem;
  }
  
  .logo-text {
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .matrix-char {
    font-size: 1.5rem;
  }
  
  .detail-line {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.3rem;
  }
}
</style>