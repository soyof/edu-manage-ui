<template>
  <router-view />
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useThemeStore } from './stores/theme'
import { setTitleFromRoute } from './utils/documentTitle'

const route = useRoute()

// 在组件挂载时初始化主题和页面标题
onMounted(() => {
  const themeStore = useThemeStore()
  themeStore.initTheme()
  // 初始化当前页面标题
  setTitleFromRoute(route)
})
</script>

<style scoped>
</style>
