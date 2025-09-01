<template>
  <el-menu
    :activeTextColor="menuActiveTextColor"
    :backgroundColor="'transparent'"
    :textColor="menuTextColor"
    :defaultActive="routeInfo.path"
    :collapse="isMenuCollapsed"
    router
    class="custom-menu"
  >
    <template v-for="(item, ids) in menuInfos" :key="`${item.path}_${ids}`">
      <!-- 有子菜单的情况 -->
      <el-sub-menu v-if="item.children && item.children.length > 0" :index="item.path">
        <template #title>
          <el-icon v-if="item?.meta?.icon">
            <component :is="item.meta.icon" />
          </el-icon>
          <span>{{ item?.meta?.title }}</span>
        </template>
        <!-- 递归组件渲染子菜单 -->
        <MenuItemRecursive
          :menuList="item.children"
          :isCollapsed="isMenuCollapsed"
        />
      </el-sub-menu>

      <!-- 无子菜单的情况 -->
      <el-menu-item v-else :index="item.path">
        <el-icon v-if="item?.meta?.icon">
          <component :is="item.meta.icon" />
        </el-icon>
        <span>{{ item?.meta?.title }}</span>
      </el-menu-item>
    </template>
  </el-menu>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useUserInfoStore } from '@/stores/userInfo'
import layoutRouter from '@/router/layout.ts'
import MenuItemRecursive from './menuItemRecursive.vue'

// 接收父组件传递的折叠状态
const props = defineProps<{
  isCollapsed?: boolean
}>()

const routeInfo = useRoute()
const userInfoStore = useUserInfoStore()

// 获取当前用户角色和管理员状态
const userRole = computed(() => {
  const userInfo = userInfoStore.getUserInfo.value
  return userInfo?.role || 'user'
})
const isAdmin = userInfoStore.isAdmin

// 检查用户是否有访问权限
const hasPermission = (roles: string[] | undefined): boolean => {
  if (!roles || roles.length === 0) return true
  return roles.includes(userRole.value) || (roles.includes('admin') && isAdmin.value)
}

// 递归过滤菜单权限
const filterMenuByPermission = (menus: any[]): any[] => {
  return menus.filter(menu => {
    // 检查当前菜单是否有权限
    if (!hasPermission(menu.meta?.roles)) {
      return false
    }

    // 如果有子菜单，递归过滤子菜单
    if (menu.children && menu.children.length > 0) {
      menu.children = filterMenuByPermission(menu.children)
      // 如果过滤后没有可见的子菜单，则隐藏父菜单
      return menu.children.length > 0
    }

    return true
  })
}

// 过滤掉隐藏的菜单和没有权限的菜单
const menuInfos = computed(() => {
  const visibleMenus = layoutRouter.filter((item: any) => !item.meta.isHidden)
  return filterMenuByPermission(visibleMenus)
})

const menuTextColor = computed(() => {
  return `var(--menuTextColor)`
})

const menuActiveTextColor = computed(() => {
  return `var(--menuActiveTextColor)`
})

// 使用props变量以避免未使用警告
const isMenuCollapsed = computed(() => {
  return props.isCollapsed || false
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
  transition: width 0.3s;
  padding-bottom: 60px; /* 为底部折叠按钮留出空间 */

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

    .el-icon {
      margin-right: 8px;
      width: 20px;
      height: 20px;
      vertical-align: middle;
    }
  }

  &.el-menu--collapse {
    width: 64px;

    :deep(.el-menu-item), :deep(.el-sub-menu__title) {
      padding: 0 !important;
      justify-content: center;

      .el-icon {
        margin-right: 0;
        margin: 0 auto;
      }
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

      // 折叠状态下的活动菜单项样式
      .el-menu--collapse & {
        position: relative;
        background: linear-gradient(90deg,
          rgba(0, 0, 0, 0.3) 0%,
          rgba(0, 0, 0, 0.2) 100%) !important;
        border-radius: 4px;

        &::before {
          left: 0 !important;
          top: 50% !important;
          transform: translateY(-50%) !important;
          height: 60% !important;
          width: 3px !important;
        }
      }

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

<style lang="less">
.el-menu--popup {
  background: var(--menuBgGradient) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  border-radius: 8px !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3) !important;
  backdrop-filter: blur(10px) !important;

  .el-menu-item {
    color: var(--menuTextColor) !important;
    background-color: transparent !important;
    margin: 2px 6px !important;
    border-radius: 4px !important;
    transition: all 0.3s !important;

    &:hover {
      color: #fff !important;
      background: linear-gradient(90deg, rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0.1) 100%) !important;
      transform: translateY(-1px) !important;
      box-shadow: 0 3px 10px rgba(0, 0, 0, 0.15) !important;
    }

    &.is-active {
      background: linear-gradient(90deg,
        rgba(0, 0, 0, 0.25) 0%,
        rgba(0, 0, 0, 0.2) 50%,
        rgba(0, 0, 0, 0.1) 100%) !important;
      color: var(--menuActiveTextColor) !important;
      font-weight: 600 !important;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3) !important;
      box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15) !important;

      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        height: 60%;
        width: 3px;
        background-color: var(--menuActiveTextColor);
        border-radius: 0 3px 3px 0;
        box-shadow: 0 0 8px rgba(0, 0, 0, 0.3), 0 0 5px var(--menuActiveTextColor);
      }
    }

    .el-icon {
      margin-right: 8px !important;
      width: 20px !important;
      height: 20px !important;
      vertical-align: middle !important;
    }
  }

  /* 弹出框箭头样式 */
  .el-popper__arrow::before {
    background: var(--menuBgColor) !important;
    border: 1px solid rgba(255, 255, 255, 0.1) !important;
  }
}

/* 专门针对子菜单弹出框的样式 */
.el-menu--popup-container {
  .el-menu {
    background: var(--menuBgGradient) !important;
    border: none !important;

    .el-menu-item {
      height: 40px !important;
      line-height: 40px !important;
      font-size: 14px !important;
      color: var(--menuTextColor) !important;

      &:hover {
        background: rgba(255, 255, 255, 0.1) !important;
        color: #ffffff !important;
      }

      &.is-active {
        background: rgba(var(--el-color-primary-rgb), 0.2) !important;
        color: var(--menuActiveTextColor) !important;
      }
    }
  }
}

/* 增强弹出框的视觉效果 */
.el-popper.is-dark {
  background: var(--menuBgGradient) !important;
  border: 1px solid rgba(255, 255, 255, 0.15) !important;

  .el-popper__arrow::before {
    background: var(--menuBgColor) !important;
    border-color: rgba(255, 255, 255, 0.15) !important;
  }
}

/* Element Plus 子菜单弹出框样式 */
.el-menu--popup,
.el-sub-menu__popup {
  background: var(--menuBgGradient) !important;
  border: 1px solid rgba(255, 255, 255, 0.15) !important;
  border-radius: 8px !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4) !important;
  backdrop-filter: blur(10px) !important;
  padding: 4px !important;
  min-width: 160px !important;

  .el-menu-item {
    color: var(--menuTextColor) !important;
    background-color: transparent !important;
    margin: 2px !important;
    border-radius: 6px !important;
    padding: 8px 12px !important;
    transition: all 0.25s ease !important;
    font-size: 14px !important;

    &:hover {
      color: #ffffff !important;
      background: linear-gradient(90deg,
        rgba(255, 255, 255, 0.15) 0%,
        rgba(255, 255, 255, 0.08) 100%) !important;
      transform: translateX(2px) !important;
      box-shadow: 0 3px 12px rgba(0, 0, 0, 0.2) !important;
    }

    &.is-active {
      background: linear-gradient(90deg,
        rgba(var(--el-color-primary-rgb), 0.25) 0%,
        rgba(var(--el-color-primary-rgb), 0.15) 100%) !important;
      color: var(--menuActiveTextColor) !important;
      font-weight: 600 !important;
      box-shadow: 0 2px 8px rgba(var(--el-color-primary-rgb), 0.3) !important;
      position: relative;

      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        height: 60%;
        width: 3px;
        background-color: var(--menuActiveTextColor);
        border-radius: 0 2px 2px 0;
        box-shadow: 0 0 6px var(--menuActiveTextColor);
      }
    }

    .el-icon {
      margin-right: 8px !important;
      opacity: 0.8 !important;
    }
  }
}

/* 针对弹出框容器的样式 */
.el-popper {
  &[x-placement^="right"] {
    .el-menu--popup,
    .el-sub-menu__popup {
      margin-left: 8px !important;
    }
  }

  .el-popper__arrow {
    &::before {
      background: var(--menuBgColor) !important;
      border: 1px solid rgba(255, 255, 255, 0.15) !important;
    }
  }
}
</style>
