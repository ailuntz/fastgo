<template>
  <div class="retro-container">
    <!-- Retro过期横幅 -->
    <div v-if="isExpired" class="retro-expired-banner">
      <div class="retro-expired-content">
        <span class="retro-expired-icon">⚠</span>
        <span class="expired-message">DOWNLOAD EXPIRED</span>
      </div>
    </div>
    
    <!-- 8位游戏风格边框 -->
    <div class="retro-border-frame">
      <div class="retro-screen">
        <!-- 顶部标题栏 -->
        <div class="retro-header">
          <div class="retro-title">
            <span class="title-icon">♦</span>
            <span class="title-text">FASTGO FILE TRANSFER</span>
            <span class="title-icon">♦</span>
          </div>
          <div class="retro-subtitle">- DOWNLOAD TERMINAL v8.0 -</div>
        </div>

        <!-- 主显示区域 -->
        <div class="retro-main-display">
          <div class="scanlines"></div>
          
          <!-- 文件信息显示 -->
          <div class="file-info-display">
            <div class="info-header">
              <span class="bracket">[</span>
              <span class="info-label">FILE DATA</span>
              <span class="bracket">]</span>
            </div>
            
            <div class="file-details">
              <div class="detail-row">
                <span class="label">NAME:</span>
                <span class="value">{{ tokenInfo.file_name }}</span>
              </div>
              <div class="detail-row">
                <span class="label">STATUS:</span>
                <span class="value status-ready" v-if="!isExpired && !downloadExhausted">READY</span>
                <span class="value status-error" v-else-if="isExpired">EXPIRED</span>
                <span class="value status-error" v-else-if="downloadExhausted">NO ACCESS</span>
              </div>
            </div>
          </div>

          <!-- 下载按钮区域 -->
          <div class="download-action-area">
            <div class="action-prompt">
              {{ isExpired ? '> SYSTEM ERROR: LINK EXPIRED' : 
                 downloadExhausted ? '> SYSTEM ERROR: NO DOWNLOADS LEFT' : 
                 downloading ? '> PROCESSING... PLEASE WAIT' : '> PRESS TO START DOWNLOAD' }}
            </div>
            
            <button 
              class="retro-download-btn"
              :class="{ 
                'downloading': downloading, 
                'exhausted': downloadExhausted,
                'expired': isExpired 
              }"
              :disabled="downloading || downloadExhausted || isExpired"
              @click="$emit('download-clicked')"
            >
              <div class="btn-content">
                <div class="btn-brackets">[</div>
                <div class="btn-text">
                  <span v-if="!downloading && !isExpired && !downloadExhausted">▼ DOWNLOAD</span>
                  <span v-else-if="downloading" class="downloading-text">⟪ LOADING ⟫</span>
                  <span v-else-if="isExpired">✕ EXPIRED</span>
                  <span v-else-if="downloadExhausted">✕ BLOCKED</span>
                </div>
                <div class="btn-brackets">]</div>
              </div>
              <div class="btn-glow" v-if="!isExpired && !downloadExhausted && !downloading"></div>
            </button>
          </div>

          <!-- 状态栏 -->
          <div class="retro-statusbar">
            <div class="status-item">
              <span class="status-icon">♠</span>
              <span>SECURE</span>
            </div>
            <div class="status-separator">|</div>
            <div class="status-item">
              <span class="status-icon">♣</span>
              <span>TURBO</span>
            </div>
            <div class="status-separator">|</div>
            <div class="status-item">
              <span class="status-icon">♥</span>
              <span>RETRO</span>
            </div>
          </div>
        </div>

        <!-- 底部装饰 -->
        <div class="retro-footer">
          <div class="footer-text">© 2024 FASTGO RETRO EDITION ◆ 8-BIT TRANSFER PROTOCOL</div>
        </div>
      </div>
    </div>

    <!-- 浮动像素粒子效果 -->
    <div class="pixel-particles">
      <div class="pixel" v-for="i in 12" :key="i" :style="{ '--delay': i * 0.5 + 's', '--x': Math.random() * 100 + '%' }"></div>
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
    downloadLink: { type: String, required: true },
    downloading: { type: Boolean, default: false },
    downloadExhausted: { type: Boolean, default: false },
    isExpired: { type: Boolean, default: false }
  },
  emits: ['download-clicked'],
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap');

.retro-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  width: 100vw;
  margin: 0;
  padding: 0;
  background: 
    radial-gradient(circle at 20% 30%, #ff6b35 0%, transparent 50%),
    radial-gradient(circle at 80% 70%, #f7931e 0%, transparent 50%),
    radial-gradient(circle at 40% 80%, #ffd23f 0%, transparent 50%),
    linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f1419 100%);
  color: #06ffa5;
  position: fixed;
  top: 0;
  left: 0;
  box-sizing: border-box;
  font-family: 'Orbitron', 'Courier New', monospace;
  overflow: hidden;
}

/* Retro过期横幅 */
.retro-expired-banner {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: 
    linear-gradient(45deg, #ff3333 25%, transparent 25%),
    linear-gradient(-45deg, #ff3333 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #ff3333 75%),
    linear-gradient(-45deg, transparent 75%, #ff3333 75%);
  background-size: 8px 8px;
  background-position: 0 0, 0 4px, 4px -4px, -4px 0px;
  background-color: #cc0000;
  color: #ffff00;
  border: 3px solid #ffff00;
  padding: 12px 20px;
  z-index: 100;
  font-family: 'Orbitron', monospace;
  font-weight: 700;
  text-shadow: 2px 2px 0 #000;
  box-shadow: 
    0 0 20px #ff3333,
    inset 0 0 20px rgba(255, 255, 0, 0.2);
  animation: retro-blink 1s infinite alternate;
}

@keyframes retro-blink {
  0% { 
    opacity: 1;
    box-shadow: 
      0 0 20px #ff3333,
      inset 0 0 20px rgba(255, 255, 0, 0.2);
  }
  100% { 
    opacity: 0.7;
    box-shadow: 
      0 0 30px #ff3333,
      inset 0 0 30px rgba(255, 255, 0, 0.3);
  }
}

.retro-expired-content {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 900;
  letter-spacing: 2px;
}

.retro-expired-icon {
  font-size: 18px;
  font-weight: 900;
  animation: retro-flash 0.5s infinite alternate;
}

@keyframes retro-flash {
  0% { color: #ffff00; }
  100% { color: #ff6600; }
}

/* 8位游戏风格边框 */
.retro-border-frame {
  background: 
    linear-gradient(45deg, #333 25%, transparent 25%),
    linear-gradient(-45deg, #333 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #333 75%),
    linear-gradient(-45deg, transparent 75%, #333 75%);
  background-size: 4px 4px;
  background-position: 0 0, 0 2px, 2px -2px, -2px 0px;
  background-color: #222;
  padding: 8px;
  border-radius: 0;
  box-shadow: 
    0 0 40px rgba(255, 107, 53, 0.3),
    inset 0 0 40px rgba(6, 255, 165, 0.1);
}

.retro-screen {
  background: 
    linear-gradient(rgba(6, 255, 165, 0.03) 50%, transparent 50%),
    linear-gradient(90deg, rgba(6, 255, 165, 0.03) 50%, transparent 50%),
    radial-gradient(circle at center, #0f1b0f 0%, #0a150a 100%);
  background-size: 2px 2px, 2px 2px, 100% 100%;
  border: 4px solid #06ffa5;
  box-shadow: 
    inset 0 0 50px rgba(6, 255, 165, 0.2),
    0 0 30px rgba(6, 255, 165, 0.5);
  padding: 2rem;
  max-width: 600px;
  /* width: 100%; */
  position: relative;
}

.retro-header {
  text-align: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px dashed #06ffa5;
}

.retro-title {
  font-size: 1.8rem;
  font-weight: 900;
  color: #ffd23f;
  text-shadow: 
    2px 2px 0 #ff6b35,
    4px 4px 0 #000;
  letter-spacing: 3px;
  margin-bottom: 0.5rem;
  animation: retro-glow 2s ease-in-out infinite alternate;
}

@keyframes retro-glow {
  0% { 
    text-shadow: 
      2px 2px 0 #ff6b35,
      4px 4px 0 #000,
      0 0 20px #ffd23f;
  }
  100% { 
    text-shadow: 
      2px 2px 0 #ff6b35,
      4px 4px 0 #000,
      0 0 30px #ffd23f,
      0 0 40px #f7931e;
  }
}

.title-icon {
  color: #ff6b35;
  margin: 0 0.5rem;
  font-size: 1.5rem;
}

.retro-subtitle {
  font-size: 0.9rem;
  color: #06ffa5;
  font-weight: 400;
  letter-spacing: 2px;
  text-shadow: 1px 1px 0 #000;
}

.retro-main-display {
  position: relative;
  background: 
    linear-gradient(rgba(6, 255, 165, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(6, 255, 165, 0.05) 1px, transparent 1px);
  background-size: 20px 20px;
  padding: 2rem;
  border: 2px solid #06ffa5;
  margin-bottom: 1.5rem;
}

.scanlines {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    rgba(6, 255, 165, 0.03) 50%,
    transparent 50%
  );
  background-size: 100% 4px;
  pointer-events: none;
  animation: retro-scanlines 2s linear infinite;
}

@keyframes retro-scanlines {
  0% { transform: translateY(0); }
  100% { transform: translateY(4px); }
}

.file-info-display {
  margin-bottom: 2rem;
}

.info-header {
  font-size: 1.1rem;
  font-weight: 700;
  color: #ffd23f;
  text-align: center;
  margin-bottom: 1.5rem;
  text-shadow: 2px 2px 0 #000;
  letter-spacing: 2px;
}

.bracket {
  color: #ff6b35;
  font-size: 1.3rem;
  font-weight: 900;
}

.file-details {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  background: 
    linear-gradient(45deg, #1a1a2e 25%, transparent 25%),
    linear-gradient(-45deg, #1a1a2e 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #1a1a2e 75%),
    linear-gradient(-45deg, transparent 75%, #1a1a2e 75%);
  background-size: 6px 6px;
  background-position: 0 0, 0 3px, 3px -3px, -3px 0px;
  background-color: rgba(6, 255, 165, 0.1);
  border: 1px solid #06ffa5;
}

.label {
  color: #f7931e;
  font-weight: 700;
  font-size: 0.9rem;
  letter-spacing: 1px;
  text-shadow: 1px 1px 0 #000;
}

.value {
  color: #06ffa5;
  font-weight: 400;
  text-align: right;
  word-break: break-all;
  text-shadow: 1px 1px 0 #000;
}

.status-ready {
  color: #06ffa5;
  font-weight: 700;
  animation: retro-pulse 1.5s ease-in-out infinite alternate;
}

.status-error {
  color: #ff3333;
  font-weight: 700;
  animation: retro-error-blink 0.8s infinite alternate;
}

@keyframes retro-pulse {
  0% { opacity: 0.7; }
  100% { opacity: 1; }
}

@keyframes retro-error-blink {
  0% { opacity: 0.5; color: #ff3333; }
  100% { opacity: 1; color: #ff6666; }
}

.download-action-area {
  text-align: center;
  margin-bottom: 2rem;
}

.action-prompt {
  font-size: 0.9rem;
  color: #f7931e;
  margin-bottom: 1.5rem;
  font-weight: 700;
  letter-spacing: 1px;
  text-shadow: 1px 1px 0 #000;
  animation: retro-typewriter 3s ease-in-out infinite;
}

@keyframes retro-typewriter {
  0%, 50%, 100% { opacity: 1; }
  25%, 75% { opacity: 0.7; }
}

.retro-download-btn {
  position: relative;
  background: 
    linear-gradient(45deg, #06ffa5 25%, transparent 25%),
    linear-gradient(-45deg, #06ffa5 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #06ffa5 75%),
    linear-gradient(-45deg, transparent 75%, #06ffa5 75%);
  background-size: 8px 8px;
  background-position: 0 0, 0 4px, 4px -4px, -4px 0px;
  background-color: #004d3d;
  color: #000;
  border: 3px solid #06ffa5;
  padding: 1rem 2rem;
  font-family: 'Orbitron', monospace;
  font-size: 1.2rem;
  font-weight: 900;
  letter-spacing: 2px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-shadow: none;
  box-shadow: 
    0 0 20px rgba(6, 255, 165, 0.5),
    inset 0 0 20px rgba(6, 255, 165, 0.2);
}

.retro-download-btn:hover:not(:disabled) {
  background-color: #06ffa5;
  color: #000;
  transform: translateY(-3px);
  box-shadow: 
    0 6px 30px rgba(6, 255, 165, 0.8),
    inset 0 0 30px rgba(0, 0, 0, 0.3);
}

.retro-download-btn.downloading {
  background-color: #ffd23f;
  border-color: #f7931e;
  color: #000;
  animation: retro-processing 1s linear infinite;
}

@keyframes retro-processing {
  0% { 
    box-shadow: 
      0 0 20px rgba(255, 210, 63, 0.5),
      inset 0 0 20px rgba(255, 210, 63, 0.2);
  }
  50% { 
    box-shadow: 
      0 0 30px rgba(247, 147, 30, 0.8),
      inset 0 0 30px rgba(247, 147, 30, 0.3);
  }
  100% { 
    box-shadow: 
      0 0 20px rgba(255, 210, 63, 0.5),
      inset 0 0 20px rgba(255, 210, 63, 0.2);
  }
}

.retro-download-btn.exhausted,
.retro-download-btn.expired {
  background-color: #663333;
  border-color: #ff3333;
  color: #ff6666;
  cursor: not-allowed;
  opacity: 0.8;
  box-shadow: 
    0 0 20px rgba(255, 51, 51, 0.3),
    inset 0 0 20px rgba(255, 51, 51, 0.1);
}

.btn-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-brackets {
  font-size: 1.5rem;
  font-weight: 900;
  color: #ffd23f;
}

.downloading-text {
  animation: retro-loading 1s linear infinite;
}

@keyframes retro-loading {
  0% { opacity: 0.5; }
  50% { opacity: 1; }
  100% { opacity: 0.5; }
}

.btn-glow {
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: linear-gradient(45deg, #06ffa5, #ffd23f, #ff6b35, #06ffa5);
  z-index: -1;
  filter: blur(8px);
  opacity: 0.7;
  animation: retro-btn-glow 2s linear infinite;
}

@keyframes retro-btn-glow {
  0% { opacity: 0.4; }
  50% { opacity: 0.8; }
  100% { opacity: 0.4; }
}

.retro-statusbar {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  background: rgba(6, 255, 165, 0.1);
  border: 1px solid #06ffa5;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 1px;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: #06ffa5;
}

.status-icon {
  color: #ffd23f;
  font-size: 1rem;
}

.status-separator {
  color: #f7931e;
  font-weight: 900;
}

.retro-footer {
  text-align: center;
  padding: 1rem 0;
  border-top: 2px dashed #06ffa5;
  margin-top: 1rem;
}

.footer-text {
  font-size: 0.7rem;
  color: #06ffa5;
  letter-spacing: 1px;
  opacity: 0.8;
  text-shadow: 1px 1px 0 #000;
}

/* 浮动像素粒子效果 */
.pixel-particles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
}

.pixel {
  position: absolute;
  width: 4px;
  height: 4px;
  background: #06ffa5;
  animation: retro-float 8s linear infinite;
  animation-delay: var(--delay, 0s);
  left: var(--x, 50%);
  opacity: 0;
  box-shadow: 0 0 10px #06ffa5;
}

.pixel:nth-child(2n) {
  background: #ffd23f;
  box-shadow: 0 0 10px #ffd23f;
}

.pixel:nth-child(3n) {
  background: #ff6b35;
  box-shadow: 0 0 10px #ff6b35;
}

.pixel:nth-child(4n) {
  background: #f7931e;
  box-shadow: 0 0 10px #f7931e;
}

@keyframes retro-float {
  0% {
    transform: translateY(100vh) scale(0);
    opacity: 0;
  }
  10% {
    opacity: 1;
    transform: translateY(90vh) scale(1);
  }
  90% {
    opacity: 1;
    transform: translateY(-10vh) scale(1);
  }
  100% {
    transform: translateY(-20vh) scale(0);
    opacity: 0;
  }
}

@media (max-width: 768px) {
  .retro-container {
    padding: 1rem;
  }
  
  .retro-screen {
    padding: 1.5rem;
    max-width: none;
  }
  
  .retro-title {
    font-size: 1.3rem;
    letter-spacing: 2px;
  }
  
  .retro-main-display {
    padding: 1.5rem;
  }
  
  .detail-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
    text-align: left;
  }
  
  .value {
    text-align: left;
  }
  
  .retro-download-btn {
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
  }
  
  .retro-statusbar {
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .retro-expired-banner {
    top: 10px;
    left: 10px;
    right: 10px;
    transform: none;
    max-width: calc(100vw - 20px);
  }
}

@media (max-width: 480px) {
  .retro-screen {
    padding: 1rem;
  }
  
  .retro-title {
    font-size: 1.1rem;
    letter-spacing: 1px;
  }
  
  .title-icon {
    display: none;
  }
  
  .retro-main-display {
    padding: 1rem;
  }
  
  .info-header {
    font-size: 1rem;
  }
  
  .retro-download-btn {
    padding: 0.6rem 1rem;
    font-size: 0.9rem;
    letter-spacing: 1px;
  }
  
  .btn-brackets {
    font-size: 1.2rem;
  }
}
</style>