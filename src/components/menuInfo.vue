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
        <template #title>
          <el-icon v-if="item?.meta?.icon">
            <component :is="item.meta.icon" />
          </el-icon>
          <span>{{ item?.meta?.title }}</span>
        </template>
        <!-- 递归组件渲染子菜单 -->
        <MenuItemRecursive :menuList="item.children" />
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

    .el-icon {
      margin-right: 8px;
      width: 20px;
      height: 20px;
      vertical-align: middle;
    }

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
