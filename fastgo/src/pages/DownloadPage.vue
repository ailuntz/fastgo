<template>
  <div v-if="loading">Loading...</div>
  <div v-else-if="!tokenInfo?.valid && !tokenInfo?.expired">
    <p>Invalid token.</p>
  </div>
  <div v-else>
    <component 
      :is="templateComponent" 
      :token-info="tokenInfo" 
      :download-link="downloadLink"
      :downloading="downloading"
      :download-exhausted="downloadExhausted"
      :is-expired="tokenInfo?.expired || false"
      @download-clicked="handleDownloadClick"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { fetchTokenInfo } from '@/api/token';
import type { TokenInfo } from '@/api/token';
import TemplateDefault from '@/components/TemplateDefault.vue';
import TemplateMihoyo from '@/components/TemplateMihoyo.vue';
import TemplateSteam from '@/components/TemplateSteam.vue';
import TemplateHacker from '@/components/TemplateHacker.vue';
import TemplateApple from '@/components/TemplateApple.vue';
import TemplateCyberpunk from '@/components/TemplateCyberpunk.vue';
import TemplateGalaxy from '@/components/TemplateGalaxy.vue';
import TemplateMatrix from '@/components/TemplateMatrix.vue';
import TemplateNeon from '@/components/TemplateNeon.vue';
import TemplateCorporate from '@/components/TemplateCorporate.vue';
import TemplateRetro from '@/components/TemplateRetro.vue';

export default defineComponent({
  components: { 
    TemplateDefault, 
    TemplateMihoyo, 
    TemplateSteam, 
    TemplateHacker, 
    TemplateApple, 
    TemplateCyberpunk,
    TemplateGalaxy,
    TemplateMatrix,
    TemplateNeon,
    TemplateCorporate,
    TemplateRetro
  },
  setup() {
    const route = useRoute();
    const token = route.params.token as string;
    const tokenInfo = ref<TokenInfo | null>(null);
    const loading = ref(true);
    const downloading = ref(false);
    const downloadExhausted = ref(false);

    const templateComponent = computed(() => {
      switch (tokenInfo.value?.template_style) {
        case 1: return 'TemplateMihoyo';
        case 2: return 'TemplateSteam';
        case 3: return 'TemplateHacker';
        case 4: return 'TemplateApple';
        case 5: return 'TemplateCyberpunk';
        case 6: return 'TemplateGalaxy';
        case 7: return 'TemplateMatrix';
        case 8: return 'TemplateNeon';
        case 9: return 'TemplateCorporate';
        case 10: return 'TemplateRetro';
        default: return 'TemplateDefault';
      }
    });

    const downloadLink = computed(() => `/api/download_direct/${token}`);

    const refreshTokenInfo = async () => {
      try {
        const newTokenInfo = await fetchTokenInfo(token);
        tokenInfo.value = newTokenInfo;
        if (newTokenInfo.downloads_left !== undefined) {
          downloadExhausted.value = newTokenInfo.downloads_left === 0;
        }
      } catch (e) {
        console.error('Failed to refresh token info:', e);
        // 如果请求失败，可能token已经无效
        if (tokenInfo.value) {
          tokenInfo.value.valid = false;
        }
      }
    };

    const handleDownloadClick = async () => {
      if (downloading.value || downloadExhausted.value) return;
      
      downloading.value = true;
      
      try {
        // 先刷新token状态，确保token仍然有效
        await refreshTokenInfo();
        
        // 检查token是否过期或无效
        if (!tokenInfo.value?.valid || tokenInfo.value?.expired) {
          console.error('Token is invalid or expired');
          downloading.value = false;
          return;
        }
        
        if (tokenInfo.value.downloads_left === 0) {
          downloadExhausted.value = true;
          downloading.value = false;
          return;
        }
        
        // 创建一个临时链接来触发下载
        const link = document.createElement('a');
        link.href = downloadLink.value;
        link.download = '';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // 等待一小段时间让下载开始，然后刷新状态
        setTimeout(async () => {
          await refreshTokenInfo();
          downloading.value = false;
        }, 1000);
      } catch (e) {
        console.error('Download failed:', e);
        downloading.value = false;
      }
    };

    onMounted(async () => {
      try {
        tokenInfo.value = await fetchTokenInfo(token);
        downloadExhausted.value = tokenInfo.value.downloads_left === 0;
      } catch (e) {
        console.error(e);
      } finally {
        loading.value = false;
      }
    });

    return { 
      tokenInfo, 
      loading, 
      templateComponent, 
      downloadLink,
      downloading,
      downloadExhausted,
      handleDownloadClick
    };
  }
});
</script>

<style scoped>
/* DownloadPage样式已移到各个模板中 */
</style>