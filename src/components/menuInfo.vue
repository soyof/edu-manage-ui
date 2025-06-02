<template>
  <el-menu
    activeTextColor="#1677ff"
    backgroundColor="#001529"
    textColor="#fff"
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
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import layoutRouter from '@/router/layout.ts'

const menuInfos = ref<any>(layoutRouter)

const routeInfo = useRoute()

</script>

<style lang="less" scoped>
.el-menu {
  --el-menu-item-font-size: 16px !important;
  height: 100%;
  color: @menuTextColor;
  :deep(.el-menu-item), :deep(.el-sub-menu__title) {
    height: @menuItemHeight;
    line-height: @menuItemHeight;
    &:hover {
      color: #fff !important;
      border-radius: 5px;
      background-color: #1677ff;
    }
  }
  :deep(.el-menu-item) {
    &.is-active {
      border-radius: 5px;
      color: @menuActiveTextColor;
    }
  }
}
</style>
