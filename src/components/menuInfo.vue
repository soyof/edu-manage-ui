<template>
  <el-menu
    :activeTextColor="menuActiveTextColor"
    :backgroundColor="'transparent'"
    :textColor="menuTextColor"
    :defaultActive="routeInfo.path"
    router
    class="custom-menu"
  >
    <template v-for="(item, ids) in menuInfos" :key="`${item.path}_${ids}`">
      <!-- 有子菜单的情况 -->
      <el-sub-menu v-if="item.children && item.children.length > 0" :index="item.path">
        <template #title>{{ item?.meta?.title }}</template>
        <!-- 递归组件渲染子菜单 -->
        <MenuItemRecursive :menuList="item.children" />
      </el-sub-menu>

      <!-- 无子菜单的情况 -->
      <el-menu-item v-else :index="item.path">
        {{ item?.meta?.title }}
      </el-menu-item>
    </template>
  </el-menu>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import layoutRouter from '@/router/layout.ts'
import MenuItemRecursive from './menuItemRecursive.vue'

// 过滤掉隐藏的菜单
const menuInfos = ref<any>(layoutRouter.filter(item => !item.meta.isHidden))
const routeInfo = useRoute()

const menuTextColor = computed(() => {
  return `var(--menuTextColor)`
})

const menuActiveTextColor = computed(() => {
  return `var(--menuActiveTextColor)`
})
</script>

<style lang="less" scoped>
.custom-menu {
  position: relative;
  --el-menu-item-font-size: 14px !important;
  height: 100%;
  color: var(--menuTextColor);
  border-right: none;
  background-color: transparent !important;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-image: var(--menuBgGradient);
    background-size: 100% 100%;
    z-index: -1;
  }

  :deep(.el-menu) {
    background-color: transparent !important;
  }

  :deep(.el-menu--horizontal) {
    background-color: transparent !important;
  }

  :deep(.el-menu-item), :deep(.el-sub-menu__title) {
    height: @menuItemHeight;
    line-height: @menuItemHeight;
    margin: 2px 6px;
    border-radius: 4px;
    transition: all 0.3s;
    font-weight: 500;
    background-color: transparent !important;

    &:hover {
      color: #fff !important;
      background: linear-gradient(90deg, rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0.1) 100%) !important;
      transform: translateY(-1px);
      box-shadow: 0 3px 10px rgba(0, 0, 0, 0.15);
    }
  }

  :deep(.el-menu-item) {
    &.is-active {
      background: linear-gradient(90deg,
        rgba(0, 0, 0, 0.25) 0%,
        rgba(0, 0, 0, 0.2) 50%,
        rgba(0, 0, 0, 0.1) 100%) !important;
      color: var(--menuActiveTextColor);
      position: relative;
      font-weight: 600;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
      box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15);

      &::before {
        content: '';
        position: absolute;
        left: -6px;
        top: 50%;
        transform: translateY(-50%);
        height: 70%;
        width: 4px;
        background-color: var(--menuActiveTextColor);
        border-radius: 0 3px 3px 0;
        box-shadow: 0 0 8px rgba(0, 0, 0, 0.3), 0 0 5px var(--menuActiveTextColor);
        animation: pulse 1.5s infinite alternate;
      }

      &::after {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        border-radius: 4px;
        box-shadow: 0 0 10px rgba(255, 255, 255, 0.2) inset, 0 0 15px rgba(0, 0, 0, 0.1);
        pointer-events: none;
      }
    }
  }
}

@keyframes pulse {
  0% {
    opacity: 0.85;
    box-shadow: 0 0 8px rgba(0, 0, 0, 0.3), 0 0 5px var(--menuActiveTextColor);
  }
  100% {
    opacity: 1;
    box-shadow: 0 0 12px rgba(0, 0, 0, 0.4), 0 0 8px var(--menuActiveTextColor);
  }
}
</style>
