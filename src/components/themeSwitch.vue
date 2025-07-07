<template>
  <div class="theme-switch">
    <el-dropdown trigger="click" @command="handleThemeChange">
      <div class="theme-icon">
        <el-icon :size="18">
          <component :is="themeIcon" />
        </el-icon>
      </div>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item :class="{ 'is-active': currentTheme === 'dark' }" command="dark">
            <el-icon><MoonNight /></el-icon>暗黑风格
          </el-dropdown-item>
          <el-dropdown-item :class="{ 'is-active': currentTheme === 'blue' }" command="blue">
            <el-icon><Sunny /></el-icon>天蓝风格
          </el-dropdown-item>
          <el-dropdown-item :class="{ 'is-active': currentTheme === 'green' }" command="green">
            <el-icon><Opportunity /></el-icon>绿色风格
          </el-dropdown-item>
          <el-dropdown-item :class="{ 'is-active': currentTheme === 'purple' }" command="purple">
            <el-icon><Star /></el-icon>紫色风格
          </el-dropdown-item>
          <el-dropdown-item :class="{ 'is-active': currentTheme === 'orange' }" command="orange">
            <el-icon><Orange /></el-icon>橙色风格
          </el-dropdown-item>
          <el-dropdown-item :class="{ 'is-active': currentTheme === 'red' }" command="red">
            <el-icon><Cherry /></el-icon>红色风格
          </el-dropdown-item>
          <el-dropdown-item :class="{ 'is-active': currentTheme === 'pink' }" command="pink">
            <el-icon><Female /></el-icon>粉色风格
          </el-dropdown-item>
          <el-dropdown-item :class="{ 'is-active': currentTheme === 'teal' }" command="teal">
            <el-icon><Ship /></el-icon>海蓝风格
          </el-dropdown-item>
          <el-dropdown-item :class="{ 'is-active': currentTheme === 'light' }" command="light">
            <el-icon><Monitor /></el-icon>浅色风格
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useThemeStore } from '@/stores/theme'
import { MoonNight, Sunny, Monitor, Brush, Opportunity, Star, Orange, Cherry, Female, Ship } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import type { ThemeType } from '@/stores/theme'

const themeStore = useThemeStore()

// 获取当前主题
const currentTheme = computed(() => themeStore.currentTheme)

// 根据当前主题返回对应的图标
const themeIcon = computed(() => {
  switch (currentTheme.value) {
    case 'dark':
      return MoonNight
    case 'blue':
      return Sunny
    case 'green':
      return Opportunity
    case 'purple':
      return Star
    case 'orange':
      return Orange
    case 'red':
      return Cherry
    case 'pink':
      return Female
    case 'teal':
      return Ship
    case 'light':
      return Monitor
    default:
      return Brush
  }
})

// 处理主题切换
const handleThemeChange = (theme: ThemeType) => {
  themeStore.changeTheme(theme)
  ElMessage.success(`已切换到${theme === 'dark' ? '暗黑' : theme === 'blue' ? '天蓝' : theme === 'green' ? '绿色' : theme === 'purple' ? '紫色' : theme === 'orange' ? '橙色' : theme === 'red' ? '红色' : theme === 'pink' ? '粉色' : theme === 'teal' ? '海蓝' : '浅色'}风格`)
}
</script>

<style lang="less" scoped>
.theme-switch {
  margin-right: 16px;

  .theme-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background-color: v-bind('currentTheme === "light" ? "rgba(0, 0, 0, 0.1)" : "rgba(255, 255, 255, 0.08)"');
    color: v-bind('currentTheme === "light" ? "rgba(0, 0, 0, 0.85)" : "rgba(255, 255, 255, 0.9)"');
    cursor: pointer;
    transition: all 0.3s;

    &:hover {
      background-color: v-bind('currentTheme === "light" ? "rgba(0, 0, 0, 0.15)" : "rgba(255, 255, 255, 0.12)"');
    }
  }
}

:deep(.el-dropdown-menu__item.is-active) {
  color: var(--el-color-primary);
  background-color: rgba(64, 158, 255, 0.1);
}
</style>
