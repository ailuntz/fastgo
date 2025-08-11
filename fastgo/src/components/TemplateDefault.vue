<template>
  <div class="default-container">
    <!-- 简约风格过期横幅 -->
    <div v-if="isExpired" class="default-expired-banner">
      <div class="default-expired-content">
        <span class="expired-icon">⚠️</span>
        <span class="expired-message">此下载链接已过期</span>
      </div>
    </div>
    
    <div class="content">
      <h1>下载文件：{{ tokenInfo.file_name }}</h1>
      <button 
        class="download-btn"
        :class="{ 
          'downloading': downloading, 
          'exhausted': downloadExhausted,
          'expired': isExpired 
        }"
        :disabled="downloading || downloadExhausted || isExpired"
        @click="$emit('download-clicked')"
      >
        {{ isExpired ? '链接已过期' : downloadExhausted ? '下载次数已耗尽' : downloading ? '下载中...' : '点击下载' }}
      </button>
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
.default-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100vw;
  margin: 0;
  padding: 2rem;
  background: var(--darkreader-background-ffffff, #181a1b);
  color: #e8e6e3;
  position: fixed;
  top: 0;
  left: 0;
  box-sizing: border-box;
}

.content {
  text-align: center;
  width: 100%;
  max-width: 600px;
}

.download-btn {
  padding: 1rem 2rem;
  font-size: 1.2rem;
  background: linear-gradient(135deg, #4ade80, #16a34a);
  color: white;
  border: 1px solid rgba(74, 222, 128, 0.3);
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 
    0 4px 15px rgba(74, 222, 128, 0.2),
    0 0 20px rgba(74, 222, 128, 0.1);
  backdrop-filter: blur(10px);
}

.download-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #16a34a, #15803d);
  transform: translateY(-2px);
  box-shadow: 
    0 8px 25px rgba(74, 222, 128, 0.3),
    0 0 30px rgba(74, 222, 128, 0.2);
}

.download-btn.downloading {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  border-color: rgba(245, 158, 11, 0.3);
  cursor: not-allowed;
  animation: downloading-pulse 1.5s infinite;
}

.download-btn.exhausted {
  background: linear-gradient(135deg, #6b7280, #4b5563);
  border-color: rgba(107, 114, 128, 0.3);
  cursor: not-allowed;
  opacity: 0.6;
  box-shadow: none;
}

.download-btn.expired {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  border-color: rgba(239, 68, 68, 0.3);
  cursor: not-allowed;
  opacity: 0.7;
  box-shadow: 0 4px 15px rgba(239, 68, 68, 0.2);
}

@keyframes downloading-pulse {
  0%, 100% { 
    box-shadow: 
      0 4px 15px rgba(245, 158, 11, 0.3),
      0 0 20px rgba(245, 158, 11, 0.2);
  }
  50% { 
    box-shadow: 
      0 8px 25px rgba(245, 158, 11, 0.5),
      0 0 40px rgba(245, 158, 11, 0.3);
  }
}

/* 简约风格过期横幅 */
.default-expired-banner {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(239, 68, 68, 0.95);
  color: white;
  border: 1px solid #ef4444;
  border-radius: 8px;
  padding: 12px 20px;
  z-index: 100;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
  animation: default-fade-pulse 2s ease-in-out infinite;
}

.default-expired-content {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
}

.expired-icon {
  font-size: 16px;
}

.expired-message {
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

@keyframes default-fade-pulse {
  0%, 100% { 
    opacity: 0.95;
    transform: translateX(-50%) scale(1);
  }
  50% { 
    opacity: 1;
    transform: translateX(-50%) scale(1.02);
  }
}

h1 {
  color: #f9fafb;
  margin-bottom: 2rem;
  font-size: 1.8rem;
  font-weight: 600;
  text-align: center;
  word-break: break-all;
}

@media (max-width: 768px) {
  .default-container {
    padding: 1rem;
  }
  
  h1 {
    font-size: 1.5rem;
    margin-bottom: 1.5rem;
  }
  
  .download-btn {
    padding: 1rem 1.5rem;
    font-size: 1.1rem;
  }
}
</style>