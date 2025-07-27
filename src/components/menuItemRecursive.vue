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
      <!-- 递归调用自身组件，传递过滤后的子菜单列表 -->
      <menu-item-recursive :menuList="getVisibleChildren(item.children)" />
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
import { defineProps, computed } from 'vue'

// 定义菜单项类型
interface MenuItem {
  path: string
  name: string
  meta: {
    title: string
    isHidden?: boolean
    tabClosable?: boolean
    icon?: string
  }
  children?: MenuItem[]
}

// 接收父组件传递的菜单数据
const props = defineProps<{
  menuList: MenuItem[]
}>()

// 过滤出不需要隐藏的菜单项
const filteredMenuList = computed(() => {
  return props.menuList.filter(item => !item.meta.isHidden)
})

// 获取可见的子菜单项
const getVisibleChildren = (children: MenuItem[]) => {
  return children.filter(child => !child.meta.isHidden)
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
