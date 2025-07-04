<template>
  <div class="menu-tabs-container">
    <!-- 使用抽离出的右键菜单组件 -->
    <contextMenu
      v-model:visible="contextMenuVisible"
      :x="menuLeft"
      :y="menuTop"
      @command="handleMenuCommand"
    />

    <el-tabs
      v-model="curTabPath"
      type="card"
      class="menu-tabs-wrap demo-tabs"
      @tabRemove="handleTabRemove"
    >
      <el-tab-pane
        v-for="(item, ids) in tabsList"
        :key="`${item?.fullPath}_${ids}_menu_tab`"
        :label="item?.meta?.title"
        :name="item?.fullPath"
        :closable="item?.meta?.tabClosable"
      >
        <template #label>
          <div
            @contextmenu.prevent="handleContextMenu($event, item, ids)"
          >
            {{ item?.meta?.title }}
          </div>
        </template>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useTabsStore } from '@/stores/menuTabs'
import { storeToRefs } from 'pinia'
import contextMenu from './contextMenu.vue'

const { tabsList } = storeToRefs(useTabsStore())
const store = useTabsStore()

const router = useRouter()
const routeInfo = useRoute()

// 右键菜单相关
const contextMenuVisible = ref(false)
const activeTabIndex = ref(-1)
const activeTabPath = ref('')
const menuTop = ref(0)
const menuLeft = ref(0)

const curTabPath = computed({
  get() {
    return store.getCurTabPath || routeInfo.fullPath || routeInfo.path
  },
  set(val) {
    const tabItem = tabsList.value.find((item) => item.fullPath ? item.fullPath === val : item.path === val)
    router.push({ ...tabItem })
    store.changeCurTabInfo(val)
  }
})

const handleTabRemove = (path: string) => {
  store.delTabList(path, router)
}

// 处理右键菜单
const handleContextMenu = (event: MouseEvent, item: any, index: number) => {
  // 阻止默认右键菜单
  event.preventDefault()

  // 记录当前操作的标签页信息
  activeTabIndex.value = index
  activeTabPath.value = item.fullPath || item.path

  // 设置菜单位置为鼠标点击位置
  menuLeft.value = event.clientX
  menuTop.value = event.clientY

  // 显示自定义菜单
  contextMenuVisible.value = true
}

// 处理菜单命令
const handleMenuCommand = (command: string) => {
  switch (command) {
    case 'refresh':
      refreshCurrentTab()
      break
    case 'close':
      closeCurrentTab()
      break
    case 'closeOthers':
      closeOtherTabs()
      break
    case 'closeAll':
      closeAllTabs()
      break
    case 'closeRight':
      closeRightTabs()
      break
    case 'closeLeft':
      closeLeftTabs()
      break
  }
}

// 右键菜单的操作方法
// 刷新当前页面
const refreshCurrentTab = () => {
  if (activeTabPath.value) {
    // 获取当前标签页对象
    const currentTab = tabsList.value.find(item => item.fullPath === activeTabPath.value)
    if (currentTab) {
      // 直接调用store的刷新方法，而不是通过路由导航
      store.refreshTab(currentTab.fullPath)
    }
  }
}

const closeCurrentTab = () => {
  if (activeTabPath.value) {
    store.delTabList(activeTabPath.value, router)
  }
}

const closeOtherTabs = () => {
  if (activeTabPath.value) {
    store.delOtherTabs(activeTabPath.value, router)
  }
}

const closeAllTabs = () => {
  store.delAllTabs(router)
}

const closeRightTabs = () => {
  if (activeTabIndex.value >= 0) {
    store.delRightTabs(activeTabIndex.value, router)
  }
}

const closeLeftTabs = () => {
  if (activeTabIndex.value >= 0) {
    store.delLeftTabs(activeTabIndex.value, router)
  }
}
</script>

<style lang="less" scoped>
.menu-tabs-container {
  position: relative;
}

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
