<template>
  <div class="apple-container">
    <!-- Apple风格过期提示横幅 -->
    <div v-if="isExpired" class="apple-expired-banner">
      <div class="apple-expired-content">
        <svg class="apple-warning-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span class="apple-expired-text">This download link has expired</span>
      </div>
    </div>
    
    <div class="apple-content">
      <div class="file-preview">
        <div class="file-icon-container">
          <div class="file-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M14 2V8H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M16 13H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M16 17H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M10 9H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </div>
      </div>
      
      <div class="file-details">
        <h1 class="file-name">{{ tokenInfo.file_name }}</h1>
        <p class="file-subtitle">Ready to download</p>
        
        <div class="metadata">
          <div class="metadata-item">
            <span class="metadata-label">Remaining downloads</span>
            <span class="metadata-value">{{ tokenInfo.downloads_left || '∞' }}</span>
          </div>
          <div class="metadata-item">
            <span class="metadata-label">Status</span>
            <span class="metadata-value" :class="{
              'status-available': !downloading && !downloadExhausted && !isExpired,
              'status-downloading': downloading,
              'status-exhausted': downloadExhausted,
              'status-expired': isExpired
            }">
              {{ isExpired ? 'Expired' : downloadExhausted ? 'Exhausted' : downloading ? 'Downloading' : 'Available' }}
            </span>
          </div>
        </div>
        
        <button 
          class="download-button"
          :class="{ 
            'btn-downloading': downloading, 
            'btn-exhausted': downloadExhausted,
            'btn-expired': isExpired
          }"
          :disabled="downloading || downloadExhausted || isExpired"
          @click="$emit('download-clicked')"
        >
          <svg class="download-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" v-if="!downloadExhausted && !isExpired">
            <path v-if="!downloading" d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path v-if="!downloading" d="M7 10L12 15L17 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path v-if="!downloading" d="M12 15V3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <circle v-if="downloading" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
            <path v-if="downloading" d="M12 6v6l4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <svg class="download-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" v-else-if="isExpired">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
            <path d="M12 8v4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M12 16h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <svg class="download-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" v-else>
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
            <path d="M15 9l-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M9 9l6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          {{ isExpired ? 'Expired' : downloadExhausted ? 'Exhausted' : downloading ? 'Downloading...' : 'Download' }}
        </button>
        
        <p class="download-info">Your download will begin immediately</p>
      </div>
    </div>
    
    <div class="apple-footer">
      <span class="footer-text">Shared with FastGo</span>
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
.apple-container {
  height: 100vh;
  width: 100vw;
  margin: 0;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  position: fixed;
  top: 0;
  left: 0;
  overflow-y: auto;
  box-sizing: border-box;
}

.apple-content {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 3rem;
  max-width: 480px;
  width: 100%;
  text-align: center;
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.08),
    0 8px 25px rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.18);
}

.file-preview {
  margin-bottom: 2rem;
}

.file-icon-container {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 120px;
  height: 120px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 24px;
  margin-bottom: 1rem;
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
}

.file-icon {
  width: 60px;
  height: 60px;
  color: white;
}

.file-details {
  text-align: center;
}

.file-name {
  font-size: 1.75rem;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0 0 0.5rem 0;
  line-height: 1.2;
  word-break: break-all;
}

.file-subtitle {
  font-size: 1rem;
  color: #86868b;
  margin: 0 0 2rem 0;
  font-weight: 400;
}

.metadata {
  background: #f2f2f7;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.metadata-item {
  text-align: center;
}

.metadata-label {
  display: block;
  font-size: 0.8rem;
  color: #86868b;
  margin-bottom: 0.25rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.metadata-value {
  display: block;
  font-size: 1rem;
  color: #1d1d1f;
  font-weight: 600;
}

.status-available {
  color: #30d158 !important;
}

.download-button {
  background: #007aff;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 1rem 2.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
  margin-bottom: 1rem;
  text-decoration: none;
}

.download-button:hover:not(:disabled) {
  background: #0051d5;
  transform: translateY(-1px);
  box-shadow: 0 8px 25px rgba(0, 122, 255, 0.3);
}

.download-button.btn-downloading {
  background: #ff9500;
  cursor: not-allowed;
}

.download-button.btn-downloading .download-icon {
  animation: downloading-spin 1s infinite linear;
}

.download-button.btn-exhausted {
  background: #8e8e93;
  cursor: not-allowed;
  opacity: 0.6;
}

.download-button.btn-expired {
  background: #ff3b30;
  cursor: not-allowed;
  opacity: 0.7;
}

.status-downloading {
  color: #ff9500 !important;
}

.status-exhausted {
  color: #ff3b30 !important;
}

.status-expired {
  color: #ff3b30 !important;
}

/* Apple风格过期横幅 */
.apple-expired-banner {
  position: absolute;
  top: 20px;
  left: 20px;
  right: 20px;
  background: rgba(255, 59, 48, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 12px;
  z-index: 100;
  box-shadow: 0 4px 16px rgba(255, 59, 48, 0.3);
}

.apple-expired-content {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px 20px;
  gap: 8px;
}

.apple-warning-icon {
  width: 20px;
  height: 20px;
  color: white;
  flex-shrink: 0;
}

.apple-expired-text {
  color: white;
  font-size: 14px;
  font-weight: 500;
  text-align: center;
}

@keyframes downloading-spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.download-button:active {
  transform: translateY(0);
}

.download-icon {
  width: 20px;
  height: 20px;
}

.download-info {
  font-size: 0.9rem;
  color: #86868b;
  margin: 0;
  font-weight: 400;
}

.apple-footer {
  margin-top: 2rem;
  text-align: center;
}

.footer-text {
  font-size: 0.85rem;
  color: #86868b;
  font-weight: 400;
}

@media (max-width: 480px) {
  .apple-container {
    padding: 1rem;
    height: 100vh;
    width: 100vw;
  }
  
  .apple-content {
    padding: 2rem 1.5rem;
    max-width: calc(100vw - 2rem);
  }
  
  .file-name {
    font-size: 1.5rem;
  }
  
  .file-icon-container {
    width: 100px;
    height: 100px;
    border-radius: 20px;
  }
  
  .file-icon {
    width: 50px;
    height: 50px;
  }
  
  .metadata {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .download-button {
    width: 100%;
    justify-content: center;
  }
}

@media (prefers-color-scheme: dark) {
  .apple-container {
    background: linear-gradient(135deg, #1c1c1e 0%, #2c2c2e 100%);
  }
  
  .apple-content {
    background: rgba(28, 28, 30, 0.95);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .file-name {
    color: #f2f2f7;
  }
  
  .file-subtitle {
    color: #8e8e93;
  }
  
  .metadata {
    background: #2c2c2e;
  }
  
  .metadata-value {
    color: #f2f2f7;
  }
  
  .download-info,
  .footer-text {
    color: #8e8e93;
  }
}
</style>