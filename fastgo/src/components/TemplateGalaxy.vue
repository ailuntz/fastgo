<template>
  <div class="galaxy-container">
    <div class="galaxy-stars"></div>
    <div class="galaxy-content">
      <!-- 过期横幅 -->
      <div v-if="isExpired" class="galaxy-expired-banner">
        <div class="galaxy-expired-content">
          <div class="constellation-icon">✦</div>
          <h2 class="expired-title">星际传输已终止</h2>
          <p class="expired-message">该传输通道已关闭，无法继续下载文件</p>
        </div>
      </div>
      
      <div class="galaxy-header">
        <div class="galaxy-logo">
          <div class="star-cluster">
            <span class="star">✦</span>
            <span class="star">★</span>
            <span class="star">✧</span>
          </div>
          <h1 class="galaxy-title">Galaxy Transfer Protocol</h1>
        </div>
        <div class="nebula-effect"></div>
      </div>

      <div class="galaxy-card">
        <div class="card-glow"></div>
        <div class="file-info">
          <div class="cosmic-icon">🌌</div>
          <div class="file-details">
            <h2 class="file-name">{{ tokenInfo.file_name }}</h2>
            <div class="file-meta">
              <span class="download-count">剩余传输: {{ tokenInfo.downloads_left || '∞' }}</span>
            </div>
          </div>
        </div>

        <div class="download-section">
          <button 
            class="galaxy-download-btn" 
            :class="{ 
              'downloading': downloading, 
              'disabled': downloading || downloadExhausted || isExpired 
            }"
            @click="$emit('download-clicked')"
            :disabled="downloading || downloadExhausted || isExpired"
          >
            <div class="btn-background"></div>
            <span v-if="downloading" class="btn-text">
              <div class="orbit-loader">
                <div class="planet"></div>
              </div>
              星际传输中...
            </span>
            <span v-else-if="downloadExhausted" class="btn-text">传输通道已关闭</span>
            <span v-else-if="isExpired" class="btn-text">传输已终止</span>
            <span v-else class="btn-text">
              <span class="download-icon">⬇</span>
              启动星际传输
            </span>
          </button>
          
          <div v-if="downloadExhausted" class="status-message exhausted">
            <span class="status-icon">🚫</span>
            传输通道已耗尽，无法继续下载
          </div>
        </div>
      </div>

      <div class="galaxy-footer">
        <div class="cosmic-pattern"></div>
        <p class="footer-text">安全的星际文件传输系统</p>
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
.galaxy-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #0c0c0c 0%, #1a0b2e 25%, #16213e 50%, #0f1419 100%);
  position: relative;
  overflow: hidden;
  font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;
}

.galaxy-stars {
  position: absolute;
  width: 100%;
  height: 100%;
  background-image: 
    radial-gradient(2px 2px at 20% 30%, #fff, transparent),
    radial-gradient(2px 2px at 40% 70%, rgba(255,255,255,0.8), transparent),
    radial-gradient(1px 1px at 90% 40%, rgba(255,255,255,0.6), transparent),
    radial-gradient(1px 1px at 60% 10%, #fff, transparent),
    radial-gradient(2px 2px at 80% 80%, rgba(255,255,255,0.7), transparent);
  background-repeat: repeat;
  background-size: 550px 400px;
  animation: twinkle 8s ease-in-out infinite;
  opacity: 0.6;
}

@keyframes twinkle {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}

.galaxy-content {
  position: relative;
  z-index: 2;
  padding: 2rem;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.galaxy-expired-banner {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: linear-gradient(45deg, rgba(220, 20, 60, 0.95), rgba(139, 0, 139, 0.95));
  backdrop-filter: blur(10px);
  border-bottom: 2px solid rgba(255, 255, 255, 0.3);
  z-index: 1000;
  padding: 1.5rem 0;
}

.galaxy-expired-content {
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
  color: white;
}

.constellation-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  animation: pulse 2s ease-in-out infinite;
}

.expired-title {
  font-size: 1.8rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

.expired-message {
  font-size: 1.1rem;
  margin: 0;
  opacity: 0.9;
}

.galaxy-header {
  text-align: center;
  margin-bottom: 3rem;
  position: relative;
}

.galaxy-logo {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.star-cluster {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.star {
  color: #64ffda;
  font-size: 1.5rem;
  animation: sparkle 3s ease-in-out infinite;
}

.star:nth-child(2) {
  animation-delay: 1s;
  color: #bb86fc;
}

.star:nth-child(3) {
  animation-delay: 2s;
  color: #03dac6;
}

@keyframes sparkle {
  0%, 100% { 
    opacity: 0.5; 
    transform: scale(1);
  }
  50% { 
    opacity: 1; 
    transform: scale(1.2);
  }
}

.galaxy-title {
  font-size: 2.5rem;
  font-weight: 300;
  color: #ffffff;
  margin: 0;
  text-shadow: 0 0 20px rgba(100, 255, 218, 0.3);
  letter-spacing: 2px;
}

.nebula-effect {
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
  width: 200px;
  height: 100px;
  background: radial-gradient(ellipse, rgba(100, 255, 218, 0.1) 0%, transparent 70%);
  animation: nebula 6s ease-in-out infinite;
}

@keyframes nebula {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.6; }
}

.galaxy-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 2.5rem;
  width: 100%;
  max-width: 500px;
  position: relative;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.card-glow {
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: linear-gradient(45deg, rgba(100, 255, 218, 0.3), rgba(187, 134, 252, 0.3));
  border-radius: 20px;
  z-index: -1;
  opacity: 0;
  animation: glow 4s ease-in-out infinite;
}

@keyframes glow {
  0%, 100% { opacity: 0; }
  50% { opacity: 0.5; }
}

.file-info {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.cosmic-icon {
  font-size: 3rem;
  filter: hue-rotate(200deg) brightness(1.2);
}

.file-details {
  flex: 1;
}

.file-name {
  font-size: 1.3rem;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 0.5rem 0;
  word-break: break-all;
}

.file-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
}

.separator {
  color: rgba(255, 255, 255, 0.3);
}

.download-section {
  text-align: center;
}

.galaxy-download-btn {
  position: relative;
  width: 100%;
  padding: 1rem 2rem;
  background: transparent;
  border: 2px solid #64ffda;
  border-radius: 50px;
  color: #64ffda;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.btn-background {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(100, 255, 218, 0.1), transparent);
  transition: left 0.6s ease;
}

.galaxy-download-btn:hover .btn-background {
  left: 100%;
}

.galaxy-download-btn:hover {
  box-shadow: 
    0 0 20px rgba(100, 255, 218, 0.4),
    inset 0 0 20px rgba(100, 255, 218, 0.1);
  transform: translateY(-2px);
}

.galaxy-download-btn.downloading {
  border-color: #bb86fc;
  color: #bb86fc;
}

.galaxy-download-btn.disabled {
  border-color: rgba(255, 255, 255, 0.3);
  color: rgba(255, 255, 255, 0.5);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.btn-text {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.download-icon {
  font-size: 1.2rem;
}

.orbit-loader {
  width: 20px;
  height: 20px;
  position: relative;
  margin-right: 0.5rem;
}

.planet {
  width: 6px;
  height: 6px;
  background: #bb86fc;
  border-radius: 50%;
  position: absolute;
  top: 50%;
  left: 50%;
  animation: orbit 1s linear infinite;
  transform-origin: 10px 0;
}

@keyframes orbit {
  from { transform: rotate(0deg) translateX(10px) rotate(0deg); }
  to { transform: rotate(360deg) translateX(10px) rotate(-360deg); }
}

.status-message {
  margin-top: 1rem;
  padding: 0.8rem 1rem;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.9rem;
}

.status-message.exhausted {
  background: rgba(255, 82, 82, 0.1);
  border: 1px solid rgba(255, 82, 82, 0.3);
  color: #ff5252;
}

.galaxy-footer {
  margin-top: 3rem;
  text-align: center;
  position: relative;
}

.cosmic-pattern {
  width: 100px;
  height: 2px;
  background: linear-gradient(90deg, transparent, #64ffda, transparent);
  margin: 0 auto 1rem;
  opacity: 0.5;
}

.footer-text {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9rem;
  margin: 0;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .galaxy-content {
    padding: 1rem;
  }
  
  .galaxy-card {
    padding: 1.5rem;
  }
  
  .galaxy-title {
    font-size: 2rem;
  }
  
  .file-info {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }
}
</style>