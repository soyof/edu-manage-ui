<template>
  <router-view />
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useThemeStore } from './stores/theme'

// 在组件挂载时初始化主题
onMounted(() => {
  const themeStore = useThemeStore()
  themeStore.initTheme()
})
</script>

<style scoped>
</style>
