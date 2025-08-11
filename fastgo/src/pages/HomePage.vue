<script setup lang="ts">
import FastShare from '@/components/FastShare.vue'
</script>

<template>
  <div class="home-container">
    <div class="logo-container">
      <img src="../assets/fastgo.svg" class="logo" alt="FastGo Logo" />
    </div>
    <FastShare msg="Fast Go - Quick Share / 快速分享" />
  </div>
</template>

<style scoped>
.home-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;
}

.logo-container {
  display: flex;
  justify-content: center;
  margin-bottom: 2em;
}

.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>