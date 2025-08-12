<template>
  <div class="corporate-container">
    <!-- Corporate过期横幅 -->
    <div v-if="isExpired" class="corporate-expired-banner">
      <div class="corporate-expired-content">
        <div class="corporate-expired-icon">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <span class="expired-message">此下载链接已过期</span>
      </div>
    </div>
    
    <div class="corporate-header">
      <div class="corporate-logo">
        <div class="logo-icon">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 11H15M9 15H12M9 7H15M3 7C3 5.89543 3.89543 5 5 5H19C20.1046 5 21 5.89543 21 7V17C21 18.1046 20.1046 19 19 19H5C3.89543 19 3 18.1046 3 17V7Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <span class="logo-text">FastGo</span>
      </div>
      <div class="corporate-subtitle">企业文件传输服务</div>
    </div>
    
    <div class="corporate-main-content">
      <div class="file-info-card">
        <div class="file-icon">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M14 2V8H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="file-details">
          <h1 class="file-name">{{ tokenInfo.file_name }}</h1>
          <div class="file-meta">
            <!-- 下载模板没有文件大小信息 -->
          </div>
        </div>
      </div>

      <div class="download-section">
        <button 
          class="corporate-download-btn"
          :class="{ 
            'downloading': downloading, 
            'exhausted': downloadExhausted,
            'expired': isExpired 
          }"
          :disabled="downloading || downloadExhausted || isExpired"
          @click="$emit('download-clicked')"
        >
          <div class="btn-icon">
            <svg v-if="!downloading && !isExpired && !downloadExhausted" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M7 10L12 15L17 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M12 15V3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <svg v-if="isExpired" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <svg v-if="downloadExhausted" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <div v-if="downloading" class="corporate-spinner"></div>
          </div>
          <span class="btn-text">
            {{ isExpired ? '链接已过期' : downloadExhausted ? '下载次数已耗尽' : downloading ? '下载中...' : '立即下载' }}
          </span>
        </button>
        
        <div class="download-info">
          <div class="info-item">
            <div class="info-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <span>安全加密传输</span>
          </div>
          <div class="info-item">
            <div class="info-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <span>高速下载</span>
          </div>
        </div>
      </div>
    </div>

    <div class="corporate-footer">
      <p>© 2024 FastGo Enterprise File Transfer Service</p>
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
  setup() {
    const formatBytes = (bytes: number) => {
      if (bytes === 0) return '0 B';
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return {
      formatBytes
    };
  }
});
</script>

<style scoped>
.corporate-container {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  min-height: 100vh;
  width: 100vw;
  margin: 0;
  padding: 2rem 0;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  color: #212529;
  position: relative;
  overflow-x: hidden;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  box-sizing: border-box;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

/* Corporate过期横幅 */
.corporate-expired-banner {
  position: absolute;
  top: 30px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, #dc3545, #c82333);
  color: white;
  border: 1px solid #dc3545;
  border-radius: 12px;
  padding: 16px 24px;
  z-index: 100;
  box-shadow: 
    0 8px 25px rgba(220, 53, 69, 0.3),
    0 4px 10px rgba(220, 53, 69, 0.2);
  animation: corporate-fade-pulse 2s ease-in-out infinite;
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.corporate-expired-content {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 15px;
  font-weight: 600;
}

.corporate-expired-icon {
  width: 24px;
  height: 24px;
  color: white;
}

.corporate-expired-icon svg {
  width: 100%;
  height: 100%;
}

@keyframes corporate-fade-pulse {
  0%, 100% { 
    opacity: 0.95;
    transform: translateX(-50%) scale(1);
    box-shadow: 
      0 8px 25px rgba(220, 53, 69, 0.3),
      0 4px 10px rgba(220, 53, 69, 0.2);
  }
  50% { 
    opacity: 1;
    transform: translateX(-50%) scale(1.02);
    box-shadow: 
      0 12px 35px rgba(220, 53, 69, 0.4),
      0 6px 15px rgba(220, 53, 69, 0.3);
  }
}

.corporate-header {
  text-align: center;
  margin-bottom: 3rem;
}

.corporate-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 0.5rem;
}

.logo-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #0066cc, #004499);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 4px 12px rgba(0, 102, 204, 0.3);
}

.logo-icon svg {
  width: 24px;
  height: 24px;
}

.logo-text {
  font-size: 2rem;
  font-weight: 700;
  color: #0066cc;
  letter-spacing: -0.02em;
}

.corporate-subtitle {
  color: #6c757d;
  font-size: 1rem;
  font-weight: 500;
}

.corporate-main-content {
  background: white;
  border-radius: 16px;
  padding: 2.5rem;
  max-width: 480px;
  width: 100%;
  box-shadow: 
    0 20px 40px rgba(0, 0, 0, 0.08),
    0 8px 16px rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(0, 0, 0, 0.06);
  margin-bottom: 2rem;
}

.file-info-card {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 12px;
  border: 1px solid #e9ecef;
}

.file-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #0066cc, #004499);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.file-icon svg {
  width: 24px;
  height: 24px;
}

.file-details {
  flex: 1;
  min-width: 0;
}

.file-name {
  font-size: 1.2rem;
  font-weight: 600;
  color: #212529;
  margin: 0 0 0.5rem 0;
  line-height: 1.3;
  word-break: break-all;
}

.file-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.file-size {
  color: #6c757d;
  font-size: 0.9rem;
  font-weight: 500;
  background: white;
  padding: 0.25rem 0.75rem;
  border-radius: 6px;
  border: 1px solid #e9ecef;
}

.download-section {
  text-align: center;
}

.corporate-download-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1.25rem 2rem;
  font-size: 1.1rem;
  font-weight: 600;
  background: linear-gradient(135deg, #0066cc, #004499);
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 
    0 8px 20px rgba(0, 102, 204, 0.3),
    0 4px 8px rgba(0, 102, 204, 0.2);
  margin-bottom: 1.5rem;
  letter-spacing: 0.01em;
}

.corporate-download-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #0052a3, #003d7a);
  transform: translateY(-2px);
  box-shadow: 
    0 12px 28px rgba(0, 102, 204, 0.4),
    0 6px 12px rgba(0, 102, 204, 0.3);
}

.corporate-download-btn.downloading {
  background: linear-gradient(135deg, #ffc107, #e0a800);
  border-color: rgba(255, 193, 7, 0.3);
  cursor: not-allowed;
  animation: corporate-downloading-pulse 1.5s infinite;
}

.corporate-download-btn.exhausted {
  background: linear-gradient(135deg, #6c757d, #5a6268);
  border-color: rgba(108, 117, 125, 0.3);
  cursor: not-allowed;
  opacity: 0.7;
  box-shadow: none;
}

.corporate-download-btn.expired {
  background: linear-gradient(135deg, #dc3545, #c82333);
  border-color: rgba(220, 53, 69, 0.3);
  cursor: not-allowed;
  opacity: 0.8;
  box-shadow: 0 4px 15px rgba(220, 53, 69, 0.3);
}

.btn-icon {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-icon svg {
  width: 100%;
  height: 100%;
}

.corporate-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: corporate-spin 1s linear infinite;
}

@keyframes corporate-spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes corporate-downloading-pulse {
  0%, 100% { 
    box-shadow: 
      0 8px 20px rgba(255, 193, 7, 0.4),
      0 4px 8px rgba(255, 193, 7, 0.3);
  }
  50% { 
    box-shadow: 
      0 12px 28px rgba(255, 193, 7, 0.5),
      0 6px 12px rgba(255, 193, 7, 0.4);
  }
}

.download-info {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-top: 1rem;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6c757d;
  font-size: 0.9rem;
  font-weight: 500;
}

.info-icon {
  width: 16px;
  height: 16px;
  color: #0066cc;
}

.info-icon svg {
  width: 100%;
  height: 100%;
}

.corporate-footer {
  text-align: center;
  color: #6c757d;
  font-size: 0.85rem;
  font-weight: 500;
}

.corporate-footer p {
  margin: 0;
}

@media (max-width: 768px) {
  .corporate-container {
    padding: 1rem;
    min-height: 100vh;
    min-height: 100dvh;
    height: 100vh;
    height: 100dvh;
    justify-content: flex-start;
    align-items: center;
    padding-top: 1rem;
    padding-bottom: 1rem;
  }
  
  .corporate-main-content {
    padding: 1.5rem;
    max-width: calc(100vw - 2rem);
    margin: 1rem 0;
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    box-shadow: 
      0 10px 20px rgba(0, 0, 0, 0.06),
      0 4px 8px rgba(0, 0, 0, 0.03);
  }
  
  .logo-text {
    font-size: 1.5rem;
  }
  
  .file-info-card {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 1rem;
  }
  
  .file-name {
    font-size: 1.1rem;
  }
  
  .corporate-download-btn {
    padding: 1rem 1.5rem;
    font-size: 1rem;
    margin-bottom: 1rem;
  }
  
  .download-info {
    flex-direction: column;
    gap: 0.75rem;
    align-items: center;
  }
  
  .corporate-footer {
    margin-top: 2rem;
    padding: 1rem;
    font-size: 0.8rem;
    padding-bottom: max(1rem, env(safe-area-inset-bottom));
  }

  .corporate-expired-banner {
    top: 20px;
    left: 20px;
    right: 20px;
    transform: none;
    max-width: calc(100vw - 40px);
  }
}

@media (max-width: 480px) {
  .corporate-container {
    padding: 0.5rem;
    padding-top: 1rem;
    padding-bottom: 4rem;
  }
  
  .corporate-main-content {
    padding: 1rem;
    margin: 0.5rem 0;
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  
  .file-info-card {
    padding: 1rem;
  }
  
  .logo-icon {
    width: 40px;
    height: 40px;
  }
  
  .logo-icon svg {
    width: 20px;
    height: 20px;
  }
  
  .logo-text {
    font-size: 1.3rem;
  }
}
</style>