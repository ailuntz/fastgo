<template>
  <div class="cyberpunk-container">
    <div class="neon-grid">
      <div class="grid-line horizontal" v-for="i in 10" :key="'h' + i"></div>
      <div class="grid-line vertical" v-for="i in 15" :key="'v' + i"></div>
    </div>
    
    <div class="glitch-overlay"></div>
    
    <!-- 赛博朋克风格过期横幅 -->
    <div v-if="isExpired" class="cyber-expired-banner">
      <div class="cyber-expired-content">
        <div class="expired-glitch-text">
          <span class="glitch-line">&gt;&gt; CONNECTION TERMINATED &lt;&lt;</span>
          <span class="glitch-line error">&gt;&gt; ACCESS DENIED &lt;&lt;</span>
          <span class="glitch-line warning">&gt;&gt; LINK CORRUPTED &lt;&lt;</span>
        </div>
        <div class="cyber-warning-icon">⚠</div>
      </div>
    </div>
    
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
          <h1 class="cyber-title">DATA PACKET TRANSFER</h1>
          <div class="title-glitch" data-text="DATA PACKET TRANSFER">DATA PACKET TRANSFER</div>
        </div>
        
        <div class="file-matrix">
          <div class="matrix-row">
            <span class="matrix-label">FILE_NAME:</span>
            <span class="matrix-value file-name-display">{{ tokenInfo.file_name }}</span>
          </div>
          <div class="matrix-row">
            <span class="matrix-label">SECURITY_LEVEL:</span>
            <span class="matrix-value security-high">MAXIMUM</span>
          </div>
          <div class="matrix-row">
            <span class="matrix-label">TRANSFER_COUNT:</span>
            <span class="matrix-value transfer-count">{{ tokenInfo.downloads_left || 'UNLIMITED' }}</span>
          </div>
          <div class="matrix-row">
            <span class="matrix-label">STATUS:</span>
            <span class="matrix-value" :class="{
              'status-ready': !downloading && !downloadExhausted && !isExpired,
              'status-downloading': downloading,
              'status-exhausted': downloadExhausted,
              'status-expired': isExpired
            }">
              {{ isExpired ? 'EXPIRED' : downloadExhausted ? 'ACCESS_DENIED' : downloading ? 'TRANSFERRING' : 'READY_FOR_DOWNLOAD' }}
            </span>
          </div>
        </div>
        
        <div class="download-zone">
          <div class="zone-border">
            <button 
              class="cyber-download-btn"
              :class="{ 
                'cyber-downloading': downloading, 
                'cyber-exhausted': downloadExhausted,
                'cyber-expired': isExpired
              }"
              :disabled="downloading || downloadExhausted || isExpired"
              @click="$emit('download-clicked')"
            >
              <span class="btn-bracket">[</span>
              <span class="btn-text">
                {{ isExpired ? 'LINK EXPIRED' : downloadExhausted ? 'ACCESS DENIED' : downloading ? 'TRANSFERRING...' : 'INITIATE TRANSFER' }}
              </span>
              <span class="btn-bracket">]</span>
              <div class="btn-scan-line" v-if="!downloadExhausted && !isExpired"></div>
            </button>
          </div>
        </div>
        
        <div class="warning-panel">
          <div class="warning-text">
            ⚠ WARNING: UNAUTHORIZED ACCESS WILL BE TRACED ⚠
          </div>
        </div>
      </div>
      
      <div class="cyber-footer">
        <div class="footer-line">
          <span class="footer-text">FASTGO_NEURAL_NETWORK v3.21.77</span>
          <span class="footer-separator">|</span>
          <span class="footer-text">QUANTUM_ENCRYPTION_ENABLED</span>
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
    downloadLink: { type: String, required: true },
    downloading: { type: Boolean, default: false },
    downloadExhausted: { type: Boolean, default: false },
    isExpired: { type: Boolean, default: false }
  },
  emits: ['download-clicked']
});
</script>

<style scoped>
.cyberpunk-container {
  height: 100vh;
  width: 100vw;
  margin: 0;
  background: 
    radial-gradient(ellipse at center, #0a0a0a 0%, #000000 100%),
    linear-gradient(45deg, #001122 0%, #000011 50%, #110022 100%);
  color: #00ffff;
  font-family: 'Courier New', monospace;
  position: fixed;
  top: 0;
  left: 0;
  overflow-y: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  box-sizing: border-box;
}

.neon-grid {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0.1;
}

.grid-line {
  position: absolute;
  background: linear-gradient(90deg, transparent, #ff0080, transparent);
}

.grid-line.horizontal {
  width: 100%;
  height: 1px;
  left: 0;
}

.grid-line.vertical {
  height: 100%;
  width: 1px;
  top: 0;
}

.grid-line:nth-child(1) { top: 10%; }
.grid-line:nth-child(2) { top: 20%; }
.grid_line:nth-child(3) { top: 30%; }
.grid-line:nth-child(4) { top: 40%; }
.grid-line:nth-child(5) { top: 50%; }
.grid-line:nth-child(6) { top: 60%; }
.grid-line:nth-child(7) { top: 70%; }
.grid-line:nth-child(8) { top: 80%; }
.grid-line:nth-child(9) { top: 90%; }

.grid-line:nth-child(11) { left: 7%; }
.grid-line:nth-child(12) { left: 14%; }
.grid-line:nth-child(13) { left: 21%; }
.grid-line:nth-child(14) { left: 28%; }
.grid-line:nth-child(15) { left: 35%; }
.grid-line:nth-child(16) { left: 42%; }
.grid-line:nth-child(17) { left: 49%; }
.grid-line:nth-child(18) { left: 56%; }
.grid-line:nth-child(19) { left: 63%; }
.grid-line:nth-child(20) { left: 70%; }
.grid-line:nth-child(21) { left: 77%; }
.grid-line:nth-child(22) { left: 84%; }
.grid-line:nth-child(23) { left: 91%; }

.glitch-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: 
    repeating-linear-gradient(
      0deg,
      transparent,
      transparent 2px,
      rgba(255, 0, 128, 0.02) 2px,
      rgba(255, 0, 128, 0.02) 4px
    );
  animation: glitch-scan 3s infinite;
}

@keyframes glitch-scan {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-2px); }
}

.cyber-interface {
  background: 
    linear-gradient(135deg, rgba(0, 255, 255, 0.03), rgba(255, 0, 128, 0.03)),
    rgba(0, 0, 0, 0.8);
  border: 2px solid #00ffff;
  border-radius: 0;
  backdrop-filter: blur(10px);
  box-shadow: 
    0 0 50px rgba(0, 255, 255, 0.3),
    inset 0 0 50px rgba(0, 255, 255, 0.05);
  max-width: 600px;
  width: 100%;
  position: relative;
}

.interface-header {
  background: linear-gradient(90deg, rgba(0, 255, 255, 0.1), rgba(255, 0, 128, 0.1));
  border-bottom: 1px solid #00ffff;
  padding: 1rem;
  text-align: center;
}

.header-line {
  margin-bottom: 0.5rem;
}

.header-text {
  font-size: 1rem;
  font-weight: bold;
  letter-spacing: 2px;
  animation: pulse-glow 2s infinite;
}

@keyframes pulse-glow {
  0%, 100% { 
    color: #00ffff;
    text-shadow: 0 0 10px #00ffff;
  }
  50% { 
    color: #ff0080;
    text-shadow: 0 0 15px #ff0080;
  }
}

.connection-status {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.8rem;
}

.status-indicator {
  width: 8px;
  height: 8px;
  background: #00ff00;
  border-radius: 50%;
  animation: status-blink 1s infinite;
  box-shadow: 0 0 10px #00ff00;
}

@keyframes status-blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0.3; }
}

.data-panel {
  padding: 2rem;
}

.panel-header {
  position: relative;
  margin-bottom: 2rem;
  text-align: center;
}

.cyber-title {
  font-size: 1.5rem;
  font-weight: bold;
  color: #00ffff;
  margin: 0;
  letter-spacing: 3px;
  position: relative;
  z-index: 2;
}

.title-glitch {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  font-size: 1.5rem;
  font-weight: bold;
  color: #ff0080;
  letter-spacing: 3px;
  opacity: 0;
  animation: title-glitch 4s infinite;
}

@keyframes title-glitch {
  0%, 90%, 100% { opacity: 0; }
  91%, 95% { 
    opacity: 0.8;
    transform: translateX(-50%) translateY(2px);
  }
  93% { 
    transform: translateX(-50%) translateY(-2px);
  }
}

.file-matrix {
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid #ff0080;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.matrix-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.matrix-row:last-child {
  margin-bottom: 0;
}

.matrix-label {
  color: #888;
  font-weight: bold;
  letter-spacing: 1px;
}

.matrix-value {
  color: #00ffff;
  font-weight: bold;
  word-break: break-all;
  text-align: right;
  max-width: 60%;
}

.security-high {
  color: #ff0080 !important;
  animation: security-pulse 1.5s infinite;
}

@keyframes security-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.transfer-count {
  color: #00ff00 !important;
}

.status-ready {
  color: #ffff00 !important;
  animation: ready-flash 2s infinite;
}

@keyframes ready-flash {
  0%, 80%, 100% { opacity: 1; }
  90% { opacity: 0.5; }
}

/* 赛博朋克风格过期横幅 */
.cyber-expired-banner {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, rgba(255, 0, 0, 0.15), rgba(139, 0, 0, 0.15));
  border: 2px solid #ff0000;
  border-radius: 4px;
  padding: 15px 25px;
  z-index: 1000;
  box-shadow: 
    0 0 20px rgba(255, 0, 0, 0.5),
    inset 0 0 20px rgba(255, 0, 0, 0.1);
  backdrop-filter: blur(5px);
  animation: cyber-critical-alert 1.5s infinite;
}

.cyber-expired-content {
  display: flex;
  align-items: center;
  gap: 15px;
}

.expired-glitch-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.glitch-line {
  font-family: 'Courier New', monospace;
  font-size: 12px;
  font-weight: bold;
  color: #ff0000;
  text-shadow: 0 0 5px #ff0000;
  letter-spacing: 1px;
  animation: cyber-glitch-text 0.3s infinite;
}

.glitch-line.error {
  color: #ff6666;
  animation-delay: 0.1s;
}

.glitch-line.warning {
  color: #ffaa00;
  animation-delay: 0.2s;
}

.cyber-warning-icon {
  font-size: 24px;
  color: #ff0000;
  text-shadow: 0 0 10px #ff0000;
  animation: cyber-warning-pulse 1s infinite;
}

@keyframes cyber-critical-alert {
  0%, 100% {
    border-color: #ff0000;
    box-shadow: 
      0 0 20px rgba(255, 0, 0, 0.5),
      inset 0 0 20px rgba(255, 0, 0, 0.1);
  }
  50% {
    border-color: #ff6666;
    box-shadow: 
      0 0 30px rgba(255, 0, 0, 0.8),
      inset 0 0 30px rgba(255, 0, 0, 0.2);
  }
}

@keyframes cyber-glitch-text {
  0%, 90%, 100% { transform: translateX(0); }
  5% { transform: translateX(-2px); }
  10% { transform: translateX(2px); }
  15% { transform: translateX(-1px); }
  20% { transform: translateX(1px); }
}

@keyframes cyber-warning-pulse {
  0%, 100% { 
    transform: scale(1);
    text-shadow: 0 0 10px #ff0000;
  }
  50% { 
    transform: scale(1.2);
    text-shadow: 0 0 20px #ff0000, 0 0 30px #ff0000;
  }
}

.download-zone {
  text-align: center;
  margin-bottom: 2rem;
}

.zone-border {
  border: 2px dashed #00ffff;
  padding: 1.5rem;
  position: relative;
  animation: border-pulse 2s infinite;
}

@keyframes border-pulse {
  0%, 100% { border-color: #00ffff; }
  50% { border-color: #ff0080; }
}

.cyber-download-btn {
  background: transparent;
  border: 2px solid #00ffff;
  color: #00ffff;
  padding: 1rem 2rem;
  font-family: 'Courier New', monospace;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  letter-spacing: 2px;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-block;
}

.cyber-download-btn:hover:not(:disabled) {
  background: rgba(0, 255, 255, 0.1);
  color: #ffffff;
  box-shadow: 
    0 0 30px rgba(0, 255, 255, 0.5),
    inset 0 0 30px rgba(0, 255, 255, 0.1);
  transform: scale(1.05);
}

.cyber-download-btn.cyber-downloading {
  border-color: #ffff00;
  color: #ffff00;
  background: rgba(255, 255, 0, 0.1);
  cursor: not-allowed;
  animation: cyber-pulse 1.5s infinite;
}

.cyber-download-btn.cyber-downloading .btn-bracket {
  color: #ffff00;
}

.cyber-download-btn.cyber-exhausted {
  border-color: #ff0080;
  color: #ff0080;
  background: rgba(255, 0, 128, 0.1);
  cursor: not-allowed;
  opacity: 0.6;
}

.cyber-download-btn.cyber-exhausted .btn-bracket {
  color: #ff0080;
}

.cyber-download-btn.cyber-expired {
  border-color: #ff0080;
  color: #ff0080;
  background: rgba(255, 0, 128, 0.1);
  cursor: not-allowed;
  opacity: 0.7;
  animation: cyber-expired-pulse 2s infinite;
}

.cyber-download-btn.cyber-expired .btn-bracket {
  color: #ff0080;
}

.status-downloading {
  color: #ffff00 !important;
  animation: cyber-downloading-blink 1s infinite;
}

.status-exhausted {
  color: #ff0080 !important;
}

.status-expired {
  color: #ff0080 !important;
  animation: status-expired-flash 1.5s infinite;
}

@keyframes cyber-pulse {
  0%, 100% { 
    box-shadow: 
      0 0 30px rgba(255, 255, 0, 0.5),
      inset 0 0 30px rgba(255, 255, 0, 0.1);
  }
  50% { 
    box-shadow: 
      0 0 50px rgba(255, 255, 0, 0.8),
      inset 0 0 50px rgba(255, 255, 0, 0.2);
  }
}

@keyframes cyber-downloading-blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0.3; }
}

@keyframes cyber-expired-pulse {
  0%, 100% { 
    box-shadow: 
      0 0 30px rgba(255, 0, 128, 0.5),
      inset 0 0 30px rgba(255, 0, 128, 0.1);
  }
  50% { 
    box-shadow: 
      0 0 50px rgba(255, 0, 128, 0.8),
      inset 0 0 50px rgba(255, 0, 128, 0.2);
  }
}

@keyframes status-expired-flash {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0.3; }
}

.btn-bracket {
  color: #ff0080;
  font-size: 1.2rem;
}

.btn-scan-line {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(0, 255, 255, 0.4), transparent);
  animation: scan-line 3s infinite;
}

@keyframes scan-line {
  0% { left: -100%; }
  100% { left: 100%; }
}

.warning-panel {
  background: rgba(255, 255, 0, 0.1);
  border: 1px solid #ffff00;
  padding: 1rem;
  text-align: center;
}

.warning-text {
  color: #ffff00;
  font-size: 0.8rem;
  font-weight: bold;
  letter-spacing: 1px;
  animation: warning-blink 1s infinite;
}

@keyframes warning-blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0.6; }
}

.cyber-footer {
  background: linear-gradient(90deg, rgba(255, 0, 128, 0.1), rgba(0, 255, 255, 0.1));
  border-top: 1px solid #ff0080;
  padding: 1rem;
  text-align: center;
}

.footer-line {
  font-size: 0.7rem;
  color: #888;
  letter-spacing: 1px;
}

.footer-separator {
  margin: 0 1rem;
  color: #00ffff;
}

@media (max-width: 768px) {
  .cyberpunk-container {
    padding: 1rem;
    height: 100vh;
    width: 100vw;
  }
  
  .cyber-interface {
    max-width: calc(100vw - 2rem);
  }
  
  .data-panel {
    padding: 1rem;
  }
  
  .cyber-title,
  .title-glitch {
    font-size: 1.2rem;
    letter-spacing: 2px;
  }
  
  .matrix-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.3rem;
  }
  
  .matrix-value {
    text-align: left;
    max-width: 100%;
  }
  
  .cyber-download-btn {
    width: 100%;
    padding: 1.2rem;
  }
}
</style>