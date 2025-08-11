<template>
  <div class="steam-container">
    <!-- Steam风格过期横幅 -->
    <div v-if="isExpired" class="steam-expired-banner">
      <div class="steam-expired-content">
        <div class="steam-error-icon">⚠️</div>
        <div class="steam-error-text">
          <div class="error-title">下载不可用</div>
          <div class="error-subtitle">此内容已下架或链接已过期</div>
        </div>
      </div>
    </div>
    
    <div class="steam-header">
      <div class="steam-logo">
        <span class="logo-text">🎮 GAME LAUNCHER</span>
      </div>
      <div class="steam-nav">
        <span class="nav-item active">下载</span>
        <span class="nav-item">游戏库</span>
        <span class="nav-item">社区</span>
      </div>
    </div>
    
    <div class="game-card">
      <div class="game-banner">
        <div class="game-gradient"></div>
        <div class="game-info">
          <h1 class="game-title">{{ tokenInfo.file_name }}</h1>
          <div class="game-tags">
            <span class="tag">📁 文件</span>
            <span class="tag">⚡ 快速下载</span>
            <span class="tag">🔒 安全传输</span>
          </div>
        </div>
      </div>
      
      <div class="game-details">
        <div class="download-stats">
          <div class="stat-item">
            <span class="stat-label">剩余下载次数</span>
            <span class="stat-value">{{ tokenInfo.downloads_left || '无限' }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">文件状态</span>
            <span class="stat-value" :class="{
              'ready': !downloading && !downloadExhausted && !isExpired,
              'downloading': downloading,
              'exhausted': downloadExhausted,
              'expired': isExpired
            }">
              {{ isExpired ? '⏰ 已过期' : downloadExhausted ? '❌ 已耗尽' : downloading ? '⏳ 下载中' : '✅ 准备就绪' }}
            </span>
          </div>
        </div>
        
        <button 
          class="steam-download-btn"
          :class="{ 
            'btn-downloading': downloading, 
            'btn-exhausted': downloadExhausted,
            'btn-expired': isExpired
          }"
          :disabled="downloading || downloadExhausted || isExpired"
          @click="$emit('download-clicked')"
        >
          <span class="btn-icon">{{ isExpired ? '⏰' : downloadExhausted ? '❌' : downloading ? '⏳' : '⬇️' }}</span>
          <span class="btn-text">
            {{ isExpired ? '链接已过期' : downloadExhausted ? '下载已耗尽' : downloading ? '下载中...' : '立即下载' }}
          </span>
        </button>
        
        <div class="download-info">
          <p>点击下载按钮开始传输文件</p>
        </div>
      </div>
    </div>
    
    <div class="steam-footer">
      <span>Powered by FastGo - Your Gaming Experience Enhanced</span>
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
.steam-container {
  height: 100vh;
  width: 100vw;
  margin: 0;
  padding: 0;
  background: linear-gradient(135deg, #1b2838 0%, #2a475e 30%, #1e2328 100%);
  color: #c7d5e0;
  font-family: Arial, sans-serif;
  position: fixed;
  top: 0;
  left: 0;
  overflow-y: auto;
  box-sizing: border-box;
}

.steam-header {
  background: rgba(59, 89, 152, 0.1);
  border-bottom: 1px solid #3b5998;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.steam-logo .logo-text {
  font-size: 1.2rem;
  font-weight: bold;
  color: #66c0f4;
}

.steam-nav {
  display: flex;
  gap: 2rem;
}

.nav-item {
  padding: 0.5rem 1rem;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.nav-item.active {
  background: #66c0f4;
  color: #1b2838;
}

.nav-item:hover:not(.active) {
  background: rgba(102, 192, 244, 0.2);
}

.game-card {
  max-width: 800px;
  margin: 2rem auto;
  background: rgba(62, 70, 80, 0.9);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.game-banner {
  height: 200px;
  background: linear-gradient(45deg, #4a90e2, #357abd, #2c5aa0);
  position: relative;
  overflow: hidden;
}

.game-gradient {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    135deg,
    rgba(102, 192, 244, 0.8) 0%,
    rgba(59, 89, 152, 0.6) 50%,
    rgba(27, 40, 56, 0.9) 100%
  );
}

.game-info {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 2rem;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
}

.game-title {
  font-size: 2rem;
  font-weight: bold;
  color: white;
  margin: 0 0 1rem 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
  word-break: break-all;
}

.game-tags {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.tag {
  background: rgba(102, 192, 244, 0.2);
  color: #66c0f4;
  padding: 0.3rem 0.8rem;
  border-radius: 4px;
  font-size: 0.8rem;
  border: 1px solid rgba(102, 192, 244, 0.3);
}

.game-details {
  padding: 2rem;
}

.download-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 6px;
}

.stat-item {
  text-align: center;
}

.stat-label {
  display: block;
  font-size: 0.8rem;
  color: #8f98a0;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
}

.stat-value {
  display: block;
  font-size: 1.1rem;
  font-weight: bold;
  color: #c7d5e0;
}

.stat-value.ready {
  color: #90ba3c;
}

.steam-download-btn {
  width: 100%;
  background: linear-gradient(135deg, #90ba3c, #a4c73c);
  border: none;
  border-radius: 6px;
  padding: 1rem 2rem;
  font-size: 1.1rem;
  font-weight: bold;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  text-decoration: none;
  margin-bottom: 1rem;
}

.steam-download-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #a4c73c, #b8d73c);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(144, 186, 60, 0.4);
}

.steam-download-btn.btn-downloading {
  background: linear-gradient(135deg, #ff7b00, #ff9500);
  cursor: not-allowed;
  animation: downloading-rotate 2s infinite linear;
}

.steam-download-btn.btn-exhausted {
  background: linear-gradient(135deg, #666, #888);
  cursor: not-allowed;
  opacity: 0.6;
}

.steam-download-btn.btn-expired {
  background: linear-gradient(135deg, #ff4444, #cc3333);
  cursor: not-allowed;
  opacity: 0.7;
}

.stat-value.downloading {
  color: #ff7b00 !important;
}

.stat-value.exhausted {
  color: #ff4444 !important;
}

.stat-value.expired {
  color: #ff4444 !important;
}

@keyframes downloading-rotate {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Steam风格过期横幅 */
.steam-expired-banner {
  position: absolute;
  top: 15px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, #c5302e, #a52725);
  border: 2px solid #ff4444;
  border-radius: 6px;
  padding: 12px 20px;
  z-index: 100;
  box-shadow: 0 4px 16px rgba(197, 48, 46, 0.4);
  animation: steam-alert-pulse 2s ease-in-out infinite;
}

.steam-expired-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.steam-error-icon {
  font-size: 20px;
  color: #fff;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.steam-error-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.error-title {
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.error-subtitle {
  color: #ffcccc;
  font-size: 12px;
  font-weight: 400;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

@keyframes steam-alert-pulse {
  0%, 100% {
    box-shadow: 0 4px 16px rgba(197, 48, 46, 0.4);
    border-color: #ff4444;
  }
  50% {
    box-shadow: 0 6px 20px rgba(197, 48, 46, 0.6);
    border-color: #ff6666;
  }
}

.btn-icon {
  font-size: 1.2rem;
}

.download-info {
  text-align: center;
  color: #8f98a0;
  font-size: 0.9rem;
}

.download-info p {
  margin: 0;
}

.steam-footer {
  text-align: center;
  padding: 2rem;
  color: #8f98a0;
  font-size: 0.8rem;
}

@media (max-width: 768px) {
  .steam-container {
    padding: 0;
  }
  
  .steam-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
    padding: 1rem;
  }
  
  .steam-nav {
    justify-content: center;
  }
  
  .game-card {
    margin: 1rem;
  }
  
  .game-info {
    padding: 1.5rem;
  }
  
  .game-title {
    font-size: 1.5rem;
  }
  
  .download-stats {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}
</style>