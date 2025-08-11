<template>
  <div class="neon-container">
    <div class="neon-grid"></div>
    <div class="neon-content">
      <!-- 过期横幅 -->
      <div v-if="isExpired" class="neon-expired-banner">
        <div class="neon-expired-content">
          <div class="neon-skull">⚠</div>
          <h2 class="expired-title">CONNECTION LOST</h2>
          <p class="expired-message">Signal terminated • Access denied</p>
        </div>
      </div>
      
      <div class="neon-header">
        <div class="neon-logo">
          <div class="logo-glow">
            <span class="neon-text">N</span>
            <span class="neon-text">E</span>
            <span class="neon-text">O</span>
            <span class="neon-text">N</span>
          </div>
          <h1 class="neon-title">FILE TRANSFER</h1>
          <div class="subtitle">CYBERNET PROTOCOL v3.0</div>
        </div>
      </div>

      <div class="neon-card">
        <div class="card-glow-border"></div>
        <div class="card-content">
          <div class="file-display">
            <div class="display-header">
              <div class="status-indicators">
                <span class="indicator active"></span>
                <span class="indicator active"></span>
                <span class="indicator warn"></span>
              </div>
              <div class="header-text">FILE_DATA.EXE</div>
            </div>
            
            <div class="file-info-grid">
              <div class="info-item">
                <span class="info-label">NAME</span>
                <span class="info-value">{{ tokenInfo.file_name }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">DOWNLOADS</span>
                <span class="info-value">{{ tokenInfo.downloads_left || '∞' }} remaining</span>
              </div>
              <div class="info-item">
                <span class="info-label">STATUS</span>
                <span class="info-value status-ready">READY</span>
              </div>
            </div>
          </div>

          <div class="download-interface">
            <div class="interface-border"></div>
            <div class="download-prompt">
              <span class="prompt-icon">▶</span>
              <span class="prompt-text">Initiate secure download sequence</span>
            </div>
            
            <button 
              class="neon-download-btn" 
              :class="{ 
                'downloading': downloading, 
                'disabled': downloading || downloadExhausted || isExpired 
              }"
              @click="$emit('download-clicked')"
              :disabled="downloading || downloadExhausted || isExpired"
            >
              <div class="btn-glow"></div>
              <div class="btn-content">
                <span v-if="downloading" class="btn-text">
                  <div class="neon-spinner">
                    <div class="spinner-ring"></div>
                  </div>
                  DOWNLOADING...
                </span>
                <span v-else-if="downloadExhausted" class="btn-text">ACCESS DENIED</span>
                <span v-else-if="isExpired" class="btn-text">CONNECTION LOST</span>
                <span v-else class="btn-text">
                  <span class="download-arrow">↓</span>
                  DOWNLOAD FILE
                </span>
              </div>
            </button>
            
            <div v-if="downloadExhausted" class="status-alert">
              <span class="alert-icon">⚠</span>
              Download limit exceeded • Contact system admin
            </div>
          </div>
        </div>
      </div>

      <div class="neon-footer">
        <div class="footer-line"></div>
        <p class="footer-text">SECURE • ENCRYPTED • VERIFIED</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
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
  emits: ['download-clicked']
});
</script>

<style scoped>
.neon-container {
  min-height: 100vh;
  background: 
    radial-gradient(circle at 20% 50%, rgba(255, 0, 150, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(0, 255, 255, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 40% 80%, rgba(255, 0, 255, 0.1) 0%, transparent 50%),
    linear-gradient(135deg, #0a0a0a 0%, #1a0f1a 50%, #0f0a1a 100%);
  position: relative;
  overflow: hidden;
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', monospace;
}

.neon-grid {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    linear-gradient(rgba(255, 0, 150, 0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 0, 150, 0.1) 1px, transparent 1px);
  background-size: 50px 50px;
  animation: grid-pulse 4s ease-in-out infinite;
}

@keyframes grid-pulse {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.6; }
}

.neon-content {
  position: relative;
  z-index: 2;
  padding: 2rem;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.neon-expired-banner {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: linear-gradient(45deg, rgba(255, 0, 150, 0.95), rgba(255, 0, 255, 0.95));
  backdrop-filter: blur(10px);
  border-bottom: 2px solid #ff0096;
  box-shadow: 0 0 20px rgba(255, 0, 150, 0.5);
  z-index: 1000;
  padding: 1.5rem 0;
}

.neon-expired-content {
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
  color: white;
}

.neon-skull {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #ff0096;
  text-shadow: 0 0 20px #ff0096;
  animation: neon-flicker 2s ease-in-out infinite;
}

.expired-title {
  font-size: 1.8rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  color: #00ffff;
  text-shadow: 0 0 20px #00ffff;
  letter-spacing: 3px;
}

.expired-message {
  font-size: 1.1rem;
  margin: 0;
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
}

.neon-header {
  text-align: center;
  margin-bottom: 3rem;
}

.neon-logo {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.logo-glow {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.neon-text {
  font-size: 3rem;
  font-weight: bold;
  color: #ff0096;
  text-shadow: 
    0 0 5px #ff0096,
    0 0 10px #ff0096,
    0 0 20px #ff0096,
    0 0 40px #ff0096;
  animation: neon-glow 3s ease-in-out infinite;
}

.neon-text:nth-child(2) {
  color: #00ffff;
  text-shadow: 
    0 0 5px #00ffff,
    0 0 10px #00ffff,
    0 0 20px #00ffff,
    0 0 40px #00ffff;
  animation-delay: 0.5s;
}

.neon-text:nth-child(3) {
  color: #ff00ff;
  text-shadow: 
    0 0 5px #ff00ff,
    0 0 10px #ff00ff,
    0 0 20px #ff00ff,
    0 0 40px #ff00ff;
  animation-delay: 1s;
}

.neon-text:nth-child(4) {
  color: #ffff00;
  text-shadow: 
    0 0 5px #ffff00,
    0 0 10px #ffff00,
    0 0 20px #ffff00,
    0 0 40px #ffff00;
  animation-delay: 1.5s;
}

@keyframes neon-glow {
  0%, 100% { 
    opacity: 1;
    transform: scale(1);
  }
  50% { 
    opacity: 0.8;
    transform: scale(1.05);
  }
}

.neon-title {
  font-size: 2.5rem;
  font-weight: 300;
  color: #ffffff;
  margin: 0;
  text-shadow: 
    0 0 5px #ffffff,
    0 0 10px #00ffff,
    0 0 20px #00ffff;
  letter-spacing: 8px;
}

.subtitle {
  color: rgba(255, 255, 255, 0.7);
  font-size: 1rem;
  letter-spacing: 2px;
  text-transform: uppercase;
  margin-top: 0.5rem;
}

.neon-card {
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 0, 150, 0.3);
  border-radius: 15px;
  padding: 0;
  width: 100%;
  max-width: 500px;
  position: relative;
  overflow: hidden;
  box-shadow: 
    0 0 30px rgba(255, 0, 150, 0.3),
    inset 0 0 30px rgba(255, 0, 150, 0.1);
}

.card-glow-border {
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: linear-gradient(45deg, #ff0096, #00ffff, #ff00ff, #ffff00);
  border-radius: 15px;
  z-index: -1;
  opacity: 0;
  animation: border-glow 4s ease-in-out infinite;
}

@keyframes border-glow {
  0%, 100% { opacity: 0; }
  50% { opacity: 0.5; }
}

.card-content {
  padding: 2rem;
}

.file-display {
  margin-bottom: 2rem;
}

.display-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  padding: 0.8rem 1rem;
  background: rgba(255, 0, 150, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(255, 0, 150, 0.2);
}

.status-indicators {
  display: flex;
  gap: 0.5rem;
}

.indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  animation: indicator-pulse 2s ease-in-out infinite;
}

.indicator.active {
  background: #00ff00;
  box-shadow: 0 0 10px #00ff00;
}

.indicator.warn {
  background: #ffff00;
  box-shadow: 0 0 10px #ffff00;
  animation-delay: 1s;
}

@keyframes indicator-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.header-text {
  color: #ff0096;
  font-weight: bold;
  text-shadow: 0 0 5px #ff0096;
  letter-spacing: 1px;
}

.file-info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.info-label {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.info-value {
  color: #ffffff;
  font-weight: 600;
  word-break: break-all;
}

.status-ready {
  color: #00ff00 !important;
  text-shadow: 0 0 5px #00ff00;
}

.download-interface {
  position: relative;
  text-align: center;
}

.interface-border {
  position: absolute;
  top: -1px;
  left: -1px;
  right: -1px;
  bottom: -1px;
  background: linear-gradient(90deg, transparent, #ff0096, transparent);
  border-radius: 10px;
  animation: interface-scan 3s linear infinite;
  opacity: 0.5;
}

@keyframes interface-scan {
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
}

.download-prompt {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
}

.prompt-icon {
  color: #00ffff;
  text-shadow: 0 0 5px #00ffff;
}

.neon-download-btn {
  position: relative;
  width: 100%;
  padding: 1.2rem 2rem;
  background: rgba(255, 0, 150, 0.1);
  border: 2px solid #ff0096;
  border-radius: 50px;
  color: #ff0096;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;
  text-transform: uppercase;
  letter-spacing: 2px;
}

.btn-glow {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255, 0, 150, 0.1) 0%, transparent 70%);
  animation: btn-rotate 3s linear infinite;
  opacity: 0;
  transition: opacity 0.3s ease;
}

@keyframes btn-rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.neon-download-btn:hover .btn-glow {
  opacity: 1;
}

.neon-download-btn:hover {
  background: rgba(255, 0, 150, 0.2);
  box-shadow: 
    0 0 20px rgba(255, 0, 150, 0.5),
    inset 0 0 20px rgba(255, 0, 150, 0.1);
  text-shadow: 0 0 10px #ff0096;
  transform: translateY(-2px);
}

.neon-download-btn.downloading {
  border-color: #00ffff;
  color: #00ffff;
  background: rgba(0, 255, 255, 0.1);
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.5);
}

.neon-download-btn.disabled {
  border-color: #666;
  color: #666;
  cursor: not-allowed;
  background: rgba(255, 255, 255, 0.05);
  transform: none;
  box-shadow: none;
}

.btn-content {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.8rem;
}

.download-arrow {
  font-size: 1.3rem;
  animation: arrow-bounce 2s ease-in-out infinite;
}

@keyframes arrow-bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(3px); }
}

.neon-spinner {
  position: relative;
  width: 20px;
  height: 20px;
}

.spinner-ring {
  position: absolute;
  width: 20px;
  height: 20px;
  border: 2px solid transparent;
  border-top: 2px solid #00ffff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.status-alert {
  margin-top: 1rem;
  padding: 0.8rem 1rem;
  background: rgba(255, 0, 0, 0.1);
  border: 1px solid rgba(255, 0, 0, 0.3);
  border-radius: 8px;
  color: #ff4444;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.alert-icon {
  color: #ff4444;
  text-shadow: 0 0 5px #ff4444;
}

.neon-footer {
  margin-top: 3rem;
  text-align: center;
}

.footer-line {
  width: 200px;
  height: 2px;
  background: linear-gradient(90deg, transparent, #ff0096, #00ffff, #ff00ff, transparent);
  margin: 0 auto 1rem;
  animation: line-glow 3s ease-in-out infinite;
}

@keyframes line-glow {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}

.footer-text {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9rem;
  margin: 0;
  letter-spacing: 2px;
}

@keyframes neon-flicker {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
  75% { opacity: 0.9; }
  85% { opacity: 0.7; }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .neon-content {
    padding: 1rem;
  }
  
  .card-content {
    padding: 1.5rem;
  }
  
  .neon-title {
    font-size: 2rem;
  }
  
  .logo-glow {
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.5rem;
  }
  
  .neon-text {
    font-size: 2rem;
  }
  
  .file-info-grid {
    grid-template-columns: 1fr;
  }
  
  .display-header {
    flex-direction: column;
    gap: 0.5rem;
    text-align: center;
  }
}
</style>