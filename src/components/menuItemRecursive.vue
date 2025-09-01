<template>
  <!-- 递归组件处理多级菜单 -->
  <template v-for="(item, index) in filteredMenuList" :key="`${item.path}_${index}`">
    <!-- 有子菜单的情况 -->
    <el-sub-menu v-if="item.children && getVisibleChildren(item.children).length > 0" :index="item.path">
      <template #title>
        <el-icon v-if="item?.meta?.icon">
          <component :is="item.meta.icon" />
        </el-icon>
        <span>{{ item?.meta?.title }}</span>
      </template>
      <!-- 递归调用自身组件，传递过滤后的子菜单列表和折叠状态 -->
      <menu-item-recursive
        :menuList="getVisibleChildren(item.children)"
        :isCollapsed="isCollapsed"
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
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useUserInfoStore } from '@/stores/userInfo'

// 定义菜单项类型
interface MenuItem {
  path: string
  name: string
  meta: {
    title: string
    isHidden?: boolean
    tabClosable?: boolean
    icon?: string
    roles?: string[]
  }
  children?: MenuItem[]
}

// 接收父组件传递的菜单数据和折叠状态
const props = defineProps<{
  menuList: MenuItem[];
  isCollapsed?: boolean;
}>()

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
const filterMenuByPermission = (menus: MenuItem[]): MenuItem[] => {
  return menus.filter(menu => {
    // 检查当前菜单是否有权限和是否隐藏
    if (menu.meta.isHidden || !hasPermission(menu.meta?.roles)) {
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

// 过滤出不需要隐藏且有权限的菜单项
const filteredMenuList = computed(() => {
  return filterMenuByPermission(props.menuList)
})

// 获取可见且有权限的子菜单项
const getVisibleChildren = (children: MenuItem[]) => {
  return filterMenuByPermission(children)
}
</script>

<style lang="less" scoped>
/* 递归组件样式可以继承父组件的样式 */
.el-icon {
  margin-right: 8px;
  width: 20px;
  height: 20px;
  vertical-align: middle;
}
</style>
