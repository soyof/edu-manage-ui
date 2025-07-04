<template>
  <el-menu
    :activeTextColor="menuActiveTextColor"
    :backgroundColor="menuBgColor"
    :textColor="menuTextColor"
    :defaultActive="routeInfo.path"
    router
  >
    <el-menu-item
      v-for="(item, ids) in menuInfos"
      :key="`${item.path}_${ids}`"
      :index="item.path"
    >
      {{ item?.meta?.title }}
    </el-menu-item>
  </el-menu>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import layoutRouter from '@/router/layout.ts'
import { useThemeStore } from '@/stores/theme'

const menuInfos = ref<any>(layoutRouter.filter(item => !item.meta.isHidden))
const routeInfo = useRoute()
const themeStore = useThemeStore()

// 获取当前主题
const currentTheme = computed(() => themeStore.currentTheme)

// 菜单样式变量
const menuBgColor = computed(() => {
  return `var(--menuBgColor)`
})

const menuTextColor = computed(() => {
  return `var(--menuTextColor)`
})

const menuActiveTextColor = computed(() => {
  return `var(--menuActiveTextColor)`
})
</script>

<style lang="less" scoped>
.el-menu {
  --el-menu-item-font-size: 14px !important;
  height: 100%;
  color: var(--menuTextColor);
  border-right: none;

  :deep(.el-menu-item), :deep(.el-sub-menu__title) {
    height: @menuItemHeight;
    line-height: @menuItemHeight;
    margin: 2px 6px;
    border-radius: 4px;
    transition: all 0.3s;

    &:hover {
      color: #fff !important;
      background-color: v-bind('currentTheme === "light" ? "rgba(0, 0, 0, 0.05)" : "rgba(0, 0, 0, 0.2)"');
    }
  }

  :deep(.el-menu-item) {
    &.is-active {
      background-color: v-bind('currentTheme === "light" ? "rgba(64, 158, 255, 0.1)" : "rgba(64, 158, 255, 0.15)"');
      color: var(--menuActiveTextColor);
      position: relative;

      &::before {
        content: '';
        position: absolute;
        left: -6px;
        top: 50%;
        transform: translateY(-50%);
        height: 60%;
        width: 3px;
        background-color: var(--menuActiveTextColor);
        border-radius: 0 3px 3px 0;
      }
    }
  }
}
</style>
