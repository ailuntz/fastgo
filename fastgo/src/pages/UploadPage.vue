<template>
  <div v-if="loading">Loading...</div>
  <div v-else-if="!tokenInfo?.valid && !tokenInfo?.expired">
    <p>Invalid token.</p>
  </div>
  <div v-else>
    <component 
      :is="templateComponent" 
      :token-info="tokenInfo"
      :uploading="uploading"
      :upload-progress="uploadProgress"
      :upload-status="uploadStatus"
      :uploaded-files="uploadedFiles"
      :server-files="serverFiles"
      :selected-files="selectedFiles"
      :is-expired="tokenInfo?.expired || false"
      @file-selected="handleFileSelected"
      @folder-selected="handleFolderSelected"
      @upload-clicked="handleUploadClick"
      @clear-storage="handleClearStorage"
      @refresh-files="handleRefreshFiles"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { fetchTokenInfo } from '@/api/token';
import type { TokenInfo } from '@/api/token';
import TemplateDefaultUpload from '@/components/TemplateDefaultUpload.vue';
import TemplateMihoyoUpload from '@/components/TemplateMihoyoUpload.vue';
import TemplateSteamUpload from '@/components/TemplateSteamUpload.vue';
import TemplateHackerUpload from '@/components/TemplateHackerUpload.vue';
import TemplateAppleUpload from '@/components/TemplateAppleUpload.vue';
import TemplateCyberpunkUpload from '@/components/TemplateCyberpunkUpload.vue';
import TemplateGalaxyUpload from '@/components/TemplateGalaxyUpload.vue';
import TemplateMatrixUpload from '@/components/TemplateMatrixUpload.vue';
import TemplateNeonUpload from '@/components/TemplateNeonUpload.vue';
import TemplateCorporateUpload from '@/components/TemplateCorporateUpload.vue';
import TemplateRetroUpload from '@/components/TemplateRetroUpload.vue';

// 上传配置
const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_CONCURRENT = 3;
const MAX_RETRY = 3;
const TIMEOUT = 30_000; // 30s
// const BASE_URL = 'http://127.0.0.1:80';
const BASE_URL = '';

export default defineComponent({
  components: { 
    TemplateDefaultUpload,
    TemplateMihoyoUpload,
    TemplateSteamUpload,
    TemplateHackerUpload,
    TemplateAppleUpload,
    TemplateCyberpunkUpload,
    TemplateGalaxyUpload,
    TemplateMatrixUpload,
    TemplateNeonUpload,
    TemplateCorporateUpload,
    TemplateRetroUpload
  },
  setup() {
    const route = useRoute();
    const token = route.params.token as string;
    const tokenInfo = ref<TokenInfo | null>(null);
    const loading = ref(true);
    const uploading = ref(false);
    const uploadProgress = ref(0);
    const uploadStatus = ref('');
    const uploadedFiles = ref<string[]>([]);
    const serverFiles = ref<string[]>([]);
    const selectedFiles = ref<File[]>([]);

    const templateComponent = computed(() => {
      switch (tokenInfo.value?.template_style) {
        case 1: return 'TemplateMihoyoUpload';
        case 2: return 'TemplateSteamUpload';
        case 3: return 'TemplateHackerUpload';
        case 4: return 'TemplateAppleUpload';
        case 5: return 'TemplateCyberpunkUpload';
        case 6: return 'TemplateGalaxyUpload';
        case 7: return 'TemplateMatrixUpload';
        case 8: return 'TemplateNeonUpload';
        case 9: return 'TemplateCorporateUpload';
        case 10: return 'TemplateRetroUpload';
        default: return 'TemplateDefaultUpload';
      }
    });

    // 获取主题化状态消息
    const getThemedMessage = (key: string, fallback: string) => {
      const style = tokenInfo.value?.template_style || 0;
      const messages: Record<number, Record<string, string>> = {
        0: { // Default
          processing: '⏳ 处理',
          storageExhausted: '❌ 存储空间不足',
          allSuccess: '✅ 上传成功',
          allFailed: '❌ 上传失败',
          cleared: '🧹 后端存储已清空',
          clearFailed: '⚠️ 清空失败'
        }, 
        1: { // Mihoyo
          processing: '🌟 宝物传送中',
          storageExhausted: '🏛️ 宝库容量已满',
          allSuccess: '🎉 传送成功',
          allFailed: '😰 传送失败',
          cleared: '💥 宝库已清空完毕',
          clearFailed: '😵 清空宝库失败'
        },
        2: { // Steam
          processing: '🔄 文件处理中',
          storageExhausted: '💾 存储空间已满',
          allSuccess: '🎯 上传成功',
          allFailed: '❌ 上传失败',
          cleared: '🧹 Steam库已清空',
          clearFailed: '⚠️ 清空操作失败'
        },
        3: { // Hacker
          processing: '⏳ PROCESSING_FILE',
          storageExhausted: '⚠️ STORAGE_LIMIT_EXCEEDED',
          allSuccess: '✅ UPLOAD_SUCCESS',
          allFailed: '❌ UPLOAD_FAILED',
          cleared: '🗑️ STORAGE_PURGED_SUCCESSFULLY',
          clearFailed: '⚠️ PURGE_OPERATION_FAILED'
        },
        4: { // Apple
          processing: '⏳ Processing',
          storageExhausted: '💾 Storage Full',
          allSuccess: '✅ Upload Success',
          allFailed: '❌ Upload Failed',
          cleared: '🧹 Storage Cleared',
          clearFailed: '⚠️ Clear Failed'
        },
        5: { // Cyberpunk
          processing: '⚡ PROCESSING_DATA',
          storageExhausted: '🔥 STORAGE_OVERLOAD',
          allSuccess: '🎯 UPLOAD_SUCCESS',
          allFailed: '💀 UPLOAD_FAILED',
          cleared: '💥 STORAGE_WIPED_CLEAN',
          clearFailed: '⚠️ WIPE_OPERATION_FAILED'
        },
        6: { // Galaxy
          processing: '🌌 星际传输处理中',
          storageExhausted: '🚫 星际存储已满',
          allSuccess: '🎉 星际传输完成',
          allFailed: '😰 星际传输失败',
          cleared: '🗑️ 星际存储已清空',
          clearFailed: '⚠️ 清空操作失败'
        },
        7: { // Matrix
          processing: '⏳ PROCESSING_FILE',
          storageExhausted: '⚠️ STORAGE_LIMIT_EXCEEDED',
          allSuccess: '✅ UPLOAD_SUCCESS',
          allFailed: '❌ UPLOAD_FAILED',
          cleared: '🗑️ STORAGE_PURGED_SUCCESSFULLY',
          clearFailed: '⚠️ PURGE_OPERATION_FAILED'
        },
        8: { // Neon
          processing: '⚡ PROCESSING DATA',
          storageExhausted: '🔥 STORAGE OVERLOAD',
          allSuccess: '🎯 UPLOAD SUCCESS',
          allFailed: '💀 UPLOAD FAILED',
          cleared: '💥 STORAGE CLEARED',
          clearFailed: '⚠️ CLEAR OPERATION FAILED'
        },
        9: { // Corporate
          processing: '📊 文件处理中',
          storageExhausted: '💾 存储空间已满',
          allSuccess: '🎯 上传成功',
          allFailed: '❌ 上传失败',
          cleared: '🧹 存储空间已清空',
          clearFailed: '⚠️ 清空操作失败'
        },
        10: { // Retro
          processing: '🎮 LOADING...',
          storageExhausted: '🔋 MEMORY FULL',
          allSuccess: '🎉 HIGH SCORE!',
          allFailed: '👾 MISSION FAILED',
          cleared: '💣 MEMORY CLEARED',
          clearFailed: '⚠️ RESET FAILED'
        }
      };
      
      return messages[style]?.[key] || fallback;
    };

    // 文件分片函数
    const createFileChunks = (file: File, chunkSize = CHUNK_SIZE) => {
      const chunks = [];
      let cur = 0;
      while (cur < file.size) {
        chunks.push({
          index: chunks.length,
          chunk: file.slice(cur, cur + chunkSize)
        });
        cur += chunkSize;
      }
      return chunks;
    };

    // 计算文件哈希
    const calculateHash = async (chunks: any[]) => {
      const { default: SparkMD5 } = await import('spark-md5');
      const spark = new SparkMD5.ArrayBuffer();
      const firstChunk = await chunks[0].chunk.arrayBuffer();
      const lastChunk = await chunks[chunks.length - 1].chunk.arrayBuffer();
      spark.append(firstChunk);
      spark.append(lastChunk);
      return spark.end();
    };

    // 检查已上传的分片
    const checkUploadedChunks = async (hash: string): Promise<Set<number>> => {
      const res = await fetch(`${BASE_URL}/api/check_upload/${token}?hash=${hash}`);
      const data = await res.json();
      return new Set<number>(data.uploaded || []);
    };

    // 上传单个分片（带重试）
    const uploadChunkWithRetry = async (chunk: any, hash: string, relativePath: string) => {
      let attempt = 0;
      while (attempt < MAX_RETRY) {
        try {
          const formData = new FormData();
          formData.append('file', chunk.chunk);
          formData.append('index', chunk.index);
          formData.append('hash', hash);
          formData.append('relativePath', relativePath);

          const controllerTimeout = new AbortController();
          const timeout = setTimeout(() => controllerTimeout.abort(), TIMEOUT);

          await fetch(`${BASE_URL}/api/upload_chunk/${token}`, {
            method: 'POST',
            body: formData,
            signal: controllerTimeout.signal,
          });

          clearTimeout(timeout);
          return;
        } catch (e) {
          attempt++;
          if (attempt >= MAX_RETRY) throw new Error(`分片 ${chunk.index} 上传失败`);
        }
      }
    };

    // 控制并发上传
    const asyncPool = async (limit: number, array: any[], iteratorFn: (item: any) => Promise<any>): Promise<any[]> => {
      const ret: Promise<any>[] = [];
      const executing: Promise<any>[] = [];

      for (const item of array) {
        const p = Promise.resolve().then(() => iteratorFn(item));
        ret.push(p);

        if (limit <= array.length) {
          const e: Promise<any> = p.then(() => executing.splice(executing.indexOf(e), 1));
          executing.push(e);
          if (executing.length >= limit) {
            await Promise.race(executing);
          }
        }
      }

      return Promise.all(ret);
    };

    // 上传所有分片
    const uploadChunks = async (chunks: any[], hash: string, uploadedSet: Set<number>, onProgress: (p: number) => void, relativePath: string) => {
      let uploaded = 0;

      await asyncPool(MAX_CONCURRENT, chunks, async (chunk) => {
        if (uploadedSet.has(chunk.index)) {
          uploaded++;
          onProgress(uploaded / chunks.length);
          return;
        }

        await uploadChunkWithRetry(chunk, hash, relativePath);
        uploaded++;
        onProgress(uploaded / chunks.length);
      });
    };

    // 合并分片
    const mergeChunks = async (hash: string, totalChunks: number, relativePath: string) => {
      const res = await fetch(`${BASE_URL}/api/merge_chunks/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hash, totalChunks, relativePath })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || `合并失败，状态码 ${res.status}`);
      }

      return await res.json();
    };

    // 处理单个文件上传
    const handleUpload = async (file: File, relativePath: string) => {
      uploadStatus.value = `${getThemedMessage('processing', '⏳ 处理')} ${relativePath}`;
      const chunks = createFileChunks(file);
      const hash = await calculateHash(chunks);

      // 检查文件是否已存在（秒传）
      const checkRes = await fetch(`${BASE_URL}/api/check_file/${token}?relativePath=${encodeURIComponent(relativePath)}`);
      const checkData = await checkRes.json();
      if (checkData.complete === true) {
        uploadProgress.value = 100;
        return true;
      }

      const startTime = performance.now();
      const uploadedSet = await checkUploadedChunks(hash);
      await uploadChunks(chunks, hash, uploadedSet, (p) => {
        uploadProgress.value = p * 100;
      }, relativePath);

      const endTime = performance.now();
      const timeInSeconds = ((endTime - startTime) / 1000).toFixed(2);

      console.log(`📦 上传耗时：${timeInSeconds} 秒`);
      try {
        await mergeChunks(hash, chunks.length, relativePath);
        return true;
      } catch (e: any) {
        if (e.message.includes('507') || e.message.includes('Storage limit exceeded')) {
          uploadStatus.value = `${getThemedMessage('storageExhausted', '❌ 存储空间不足')}：${relativePath}`;
        } else {
        }
        return false;
      }
    };

    // 事件处理函数
    const handleFileSelected = (files: FileList) => {
      selectedFiles.value = Array.from(files).map(file => {
        (file as any).relativePath = file.name;
        return file;
      });
    };

    const handleFolderSelected = (files: FileList) => {
      selectedFiles.value = Array.from(files);
    };

    const handleUploadClick = async () => {
      if (uploading.value || selectedFiles.value.length === 0) return;
      
      // 简单检查存储容量
      if (tokenInfo.value && tokenInfo.value.used_bytes && tokenInfo.value.max_storage_bytes && 
          tokenInfo.value.used_bytes >= tokenInfo.value.max_storage_bytes) {
        uploadStatus.value = getThemedMessage('storageExhausted', '❌ 存储空间不足');
        return;
      }

      uploading.value = true;
      uploadProgress.value = 0;
      uploadedFiles.value = [];

      try {
        const uploadedFileNames: string[] = [];
        
        for (const file of selectedFiles.value) {
          let relativePath = (file as any).webkitRelativePath || (file as any).relativePath || file.name;
          // const relativePath = (file as any).webkitRelativePath || (file as any).relativePath;
          const success = await handleUpload(file, relativePath);
          
          if (success === true) {
            uploadedFileNames.push(relativePath);
          } else {
            // 上传失败时直接停止后续上传
            break;
          }
        }

        await handleRefreshFiles();
        uploadedFiles.value = uploadedFileNames;
        
        // 简化状态消息
        if (uploadedFileNames.length === selectedFiles.value.length) {
          uploadStatus.value = getThemedMessage('allSuccess', '✅ 上传成功');
        } else if (uploadedFileNames.length === 0) {
          uploadStatus.value = getThemedMessage('allFailed', '❌ 上传失败');
        }
      } catch (err: any) {
        uploadStatus.value = `❌ 上传失败: ${err.message}`;
      } finally {
        uploading.value = false;
        
        // 延迟2秒后清空文件选择状态和进度条，让用户能看到上传结果
        setTimeout(() => {
          // 清空文件选择状态
          selectedFiles.value = [];
          // 清空文件输入框
          const fileInputs = document.querySelectorAll('input[type="file"]');
          fileInputs.forEach((input: any) => {
            input.value = '';
          });
          // 清空进度条和状态
          uploadProgress.value = 0;
          uploadStatus.value = '';
        }, 2000);
      }
    };

    const handleClearStorage = async () => {
      
      if (!confirm("确定要清空后端存储吗？此操作不可恢复。")) return;
      
      try {
        const res = await fetch(`${BASE_URL}/api/clear_storage/${token}`, { method: 'DELETE' });
        const data = await res.json();
        if (data.cleared) {
          uploadStatus.value = getThemedMessage('cleared', '🧹 后端存储已清空');
          serverFiles.value = [];
          uploadedFiles.value = [];
          // 刷新token信息以更新容量显示
          tokenInfo.value = await fetchTokenInfo(token);
        } else {
          uploadStatus.value = getThemedMessage('clearFailed', '⚠️ 清空失败');
        }
      } catch (e: any) {
        uploadStatus.value = `${getThemedMessage('clearFailed', '❌ 清空失败')}: ${e.message}`;
      }
    };

    const handleRefreshFiles = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/list_files/${token}`);
        const data = await res.json();
        serverFiles.value = data.files || [];
        
        // 同时刷新token信息以更新容量显示
        tokenInfo.value = await fetchTokenInfo(token);
      } catch (e) {
        console.error('Failed to refresh files:', e);
      }
    };

    onMounted(async () => {
      try {
        tokenInfo.value = await fetchTokenInfo(token);
        await handleRefreshFiles();
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
      uploading,
      uploadProgress,
      uploadStatus,
      uploadedFiles,
      serverFiles,
      selectedFiles,
      handleFileSelected,
      handleFolderSelected,
      handleUploadClick,
      handleClearStorage,
      handleRefreshFiles
    };
  }
});
</script>

<style scoped>

</style>