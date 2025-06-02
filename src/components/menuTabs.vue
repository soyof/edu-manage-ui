<template>
  <el-tabs
    v-model="curTabPath"
    type="card"
    class="menu-tabs-wrap demo-tabs"
    @tabRemove="handleTabRemove"
  >
    <el-tab-pane
      v-for="(item, ids) in tabsList"
      :key="`${item?.path}_${ids}_menu_tab`"
      :label="item?.meta?.title"
      :name="item?.path"
      :closable="item?.meta?.tabClosable"
    >
      <template #label>
        <el-popover
          ref="contextMenuPopover"
          popperClass="context-menu-popover"
          placement="bottom-start"
          trigger="contextmenu"
          :offset="5"
          @show="handleShowContextMenu(ids)"
        >
          <template #reference>
            <div>{{ item?.meta?.title }}</div>
          </template>
          <template #default>
            <div class="context-menu">
              <div class="context-menu-item">关闭当前</div>
              <div class="context-menu-item">关闭其他</div>
              <div class="context-menu-item">关闭所有</div>
              <div class="context-menu-item">关闭右侧所有</div>
              <div class="context-menu-item">关闭左侧所有</div>
            </div>
          </template>
        </el-popover>
      </template>
    </el-tab-pane>
  </el-tabs>
</template>

<script setup lang="ts">
import { computed, useTemplateRef } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useTabsStore } from '@/stores/menuTabs'
import { storeToRefs } from 'pinia'

const { tabsList } = storeToRefs(useTabsStore())
const store = useTabsStore()

const router = useRouter()
const routeInfo = useRoute()
const tabItemRefs = useTemplateRef('contextMenuPopover')

const curTabPath = computed({
  get() {
    return store.getCurTabPath || routeInfo.path
  },
  set(val) {
    const tabItem = tabsList.value.find((item) => item.path === val)
    router.push({ ...tabItem })
    store.changeCurTabInfo(val)
  }
})

const handleTabRemove = (path: string) => {
  console.log(path)
  store.delTabList(path, router)
}

const handleShowContextMenu = (ids: number) => {
  tabItemRefs.value.forEach((item, index) => {
    if (index !== ids) {
      item.hide()
    }
  })
}
</script>

<style lang="less" scoped>
.menu-tabs-wrap {
  position: relative;
  height: 35px;
  min-width: 35px;
  z-index: 1;
  box-shadow:  0 4px 8px rgba(0, 0, 0, 0.1);
  margin-top: 5px;
  :deep(.el-tabs__header) {
    margin-bottom: 0;
    border-bottom: none;
    .el-tabs__nav-wrap {
      margin-bottom: 0;
      .el-tabs__nav {
        border: none;
      }
    }
    .el-tabs__item {
      height: 35px !important;
      line-height: 35px!important;
      border-top-left-radius: 6px;
      border-top-right-radius: 6px;
      margin-right: 3px;
      border: 1px solid @borderColor;
      border-bottom: none;
      padding: 0 12px !important;
      &:last-child {
        margin-right: 0;
      }
      &.is-active {
        background-color: #fff;
        .is-icon-close {
          font-size: 14px;
          color: @textActiveColor !important;
          width: 0 !important;
        }
      }
      &.is-active {
        &:hover {
          .is-icon-close {
            width: 14px !important;
            &:hover {
              color: @textActiveColor !important;
              background-color: transparent !important;
            }
          }
        }
      }
    }
  }
}
</style>

<style lang="less">
.context-menu-popover {
  padding: 0 !important;
  border-radius: 6px;
  .context-menu {
    .context-menu-item {
      display: flex;
      align-items: center;
      width: 100%;
      height: 32px;
      line-height: 20px;
      padding: 0 8px;
      cursor: pointer;
      &:hover {
        color: #fff;
        background-color: @textActiveColor;
      }
    }
  }
}
</style>
