<script setup lang="ts">

defineProps<{ msg: string }>()

</script>

<template>
  <h1>{{ msg }}</h1>

  <p class="description">
    Fast Go — The easiest, fastest, and most efficient content sharing tool in VS Code extensions.
  </p>
  <p class="description chinese">
    Fast Go —— VS Code 插件中最轻松、最快速、最高效的内容分享工具。
  </p>
</template>

<style scoped>
.card {
  padding: 1em;
  margin-top: 2em;
  border: 1px solid #ccc;
  border-radius: 8px;
  text-align: center;
}

button {
  padding: 0.5em 1em;
  font-size: 1.2em;
  cursor: pointer;
  background-color: #42b883;
  color: white;
  border: none;
  border-radius: 4px;
  transition: background-color 0.3s;
}

button:hover {
  background-color: #369870;
}

.description {
  margin-top: 1em;
  color: #666;
  text-align: center;
}

.description.chinese {
  margin-top: 0.5em;
  font-size: 0.9em;
  opacity: 0.8;
}
</style>