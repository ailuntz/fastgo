<template>
  <div class="genshin-official">
    <!-- 背景图片 -->
    <div class="background-image"></div>
    
    <!-- 米哈游风格过期横幅 -->
    <div v-if="isExpired" class="mihoyo-expired-banner">
      <div class="mihoyo-expired-content">
        <div class="expired-icon-mihoyo">⚠️</div>
        <div class="expired-text-mihoyo">传送失败</div>
        <div class="expired-subtitle-mihoyo">此传送链接已失效</div>
      </div>
    </div>
    
    <!-- 下半部分的大点击区域 -->
    <div class="download-overlay-bottom" @click="$emit('download-clicked')" :class="{ 'disabled': downloading || downloadExhausted || isExpired }"></div>
    
    <!-- 下载状态提示 -->
    <div v-if="downloading" class="download-status">下载中...</div>
    <div v-if="downloadExhausted" class="download-status error">下载已达上限</div>
    <div v-if="isExpired" class="download-status expired">链接已过期</div>
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
/* 手机版原神下载页面 (750×1535) */
.genshin-official {
  width: 100vw;
  height: 100vh;
  position: relative;
  overflow-x: hidden;
  overflow-y: auto;
  background: #000;
}

/* 背景图片 - 宽度占满浏览器，高度按比例 */
.background-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: calc(100vw * 1535 / 750); /* 按原图750x1535比例计算高度 */
  background-image: url('./image.png');
  background-size: 100% 100%;
  background-position: top left;
  background-repeat: no-repeat;
  z-index: 1;
}

/* 下半部分的大点击区域 - 覆盖图片下半部分 */
.download-overlay-bottom {
  position: absolute;
  top: calc(100vw * 1535 / 750 / 1.7); /* 从图片中间开始 */
  left: 0;
  width: 100vw;
  height: calc(100vw * 1535 / 750 / 10); /* 图片下半部分的高度 */
  z-index: 10;
  cursor: pointer;
  transition: all 0.3s ease;
}

.download-overlay-bottom:hover {
  background: rgba(255, 255, 255, 0.05);
}

.download-overlay-bottom.disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

/* 下载状态提示 */
.download-status {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 20px 40px;
  border-radius: 15px;
  font-size: 18px;
  font-weight: bold;
  z-index: 100;
  backdrop-filter: blur(15px);
  border: 2px solid rgba(255, 255, 255, 0.3);
  text-align: center;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
  min-width: 200px;
}

.download-status.error {
  background: rgba(220, 53, 69, 0.9);
  border-color: rgba(220, 53, 69, 0.6);
}

.download-status.expired {
  background: rgba(239, 68, 68, 0.9);
  border-color: rgba(239, 68, 68, 0.6);
  animation: expired-pulse 2s infinite;
}

@keyframes expired-pulse {
  0%, 100% { 
    transform: translate(-50%, -50%) scale(1);
    box-shadow: 0 10px 40px rgba(239, 68, 68, 0.5);
  }
  50% { 
    transform: translate(-50%, -50%) scale(1.02);
    box-shadow: 0 15px 50px rgba(239, 68, 68, 0.7);
  }
}

/* 米哈游风格过期横幅 */
.mihoyo-expired-banner {
  position: absolute;
  top: 30px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.95), rgba(255, 140, 0, 0.95));
  border: 2px solid #FFD700;
  border-radius: 16px;
  padding: 20px 30px;
  z-index: 200;
  box-shadow: 0 8px 32px rgba(255, 215, 0, 0.4);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  animation: mihoyo-glow 2s ease-in-out infinite alternate;
}

.mihoyo-expired-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  text-align: center;
}

.expired-icon-mihoyo {
  font-size: 32px;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  animation: mihoyo-bounce 1s ease-in-out infinite;
}

.expired-text-mihoyo {
  color: #8B0000;
  font-size: 18px;
  font-weight: 700;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  letter-spacing: 1px;
}

.expired-subtitle-mihoyo {
  color: #B8860B;
  font-size: 14px;
  font-weight: 500;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

@keyframes mihoyo-glow {
  0% {
    box-shadow: 0 8px 32px rgba(255, 215, 0, 0.4);
    border-color: #FFD700;
  }
  100% {
    box-shadow: 0 12px 40px rgba(255, 215, 0, 0.6);
    border-color: #FFA500;
  }
}

@keyframes mihoyo-bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

/* 手机端优化 */
@media (max-width: 768px) {
  .download-status {
    padding: 15px 30px;
    font-size: 16px;
    margin: 0 20px;
    min-width: 160px;
  }
}

@media (max-width: 480px) {
  .download-status {
    padding: 12px 24px;
    font-size: 14px;
    margin: 0 15px;
    min-width: 140px;
  }
}
</style>