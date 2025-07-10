import { defineStore } from 'pinia'
import { computed } from 'vue'
export interface TabItem {
  path: string
  fullPath: string
  name: string
  query?: any
  params?: any
  meta: {
    title: string
    tabClosable: boolean
  }
}

export interface TabsState {
  curTabInfo: Partial<TabItem>
  tabsList: TabItem[]
  refreshMap: Record<string, number> // 记录需要刷新的页签路径和时间戳
}

export const useTabsStore = defineStore('menuTabInfos', {
  state: (): TabsState => {
    return {
      curTabInfo: {},
      tabsList: [
        {
          path: '/homePage',
          fullPath: '/homePage',
          name: 'homePage',
          meta: {
            title: '首页',
            tabClosable: false
          }
        }
      ],
      refreshMap: {} // 初始化刷新Map
    }
  },
  getters: {
    getTabsList: (state) => {
      return computed(() => state.tabsList)
    },
    getCurTabInfo: (state) => state.curTabInfo,
    getCurTabPath: (state) => state.curTabInfo.fullPath || state.curTabInfo.path
  },
  actions: {
    // 初始化处理，移除登录页签
    initStore() {
      // 过滤掉登录页签
      this.tabsList = this.tabsList.filter(tab => {
        return tab.path !== '/login' && tab.name !== 'Login'
      })

      // 如果当前激活的页签是登录页，则重置为首页或第一个可用页签
      if (this.curTabInfo.path === '/login' || this.curTabInfo.name === 'Login') {
        this.curTabInfo = this.tabsList.length > 0 ? this.tabsList[0] : {}
      }
    },
    addTabList(tab: TabItem) {
      // 排除登录页和一些特定页面，不添加到标签列表中
      if (tab.path === '/login' || tab.name === 'Login') {
        return
      }

      const isExist = this.tabsList.find((item) => {
        return item.fullPath === tab.fullPath
      })
      !isExist && this.tabsList.push({
        ...tab,
        meta: {
          ...tab.meta,
          title: tab?.query?.tabTitle ? decodeURIComponent(tab?.query?.tabTitle) : tab.meta.title
        }
      })
    },
    // 删除标签页并可选跳转到指定路由
    delCurTab(path: string, router: any, targetPath?: string) {
      // 找到要删除的标签页索引
      const deleteIndex = this.tabsList.findIndex((item) => {
        return item.fullPath === path
      })

      // 如果找不到要删除的标签页，直接返回
      if (deleteIndex === -1) {
        return
      }

      // 判断当前激活的标签页
      const isActivated = this.curTabInfo.fullPath === path

      // 如果提供了目标路径，先检查该路径是否存在于标签列表中
      let targetTab = null
      if (targetPath) {
        targetTab = this.tabsList.find(tab => tab.fullPath === targetPath)
      }

      // 删除标签页
      this.tabsList = this.tabsList.filter((item) => {
        return item.fullPath !== path
      })

      // 如果删除的不是当前激活的标签页，不需要切换路由
      if (!isActivated) {
        return
      }

      // 如果存在指定的目标路径并且该路径在标签列表中存在，则跳转到该路径
      if (targetPath && targetTab) {
        router && router.push({ ...targetTab })
        this.changeCurTabInfo(targetPath)
        return
      }

      // 如果没有指定目标路径或目标路径不存在于标签列表中，则使用原有逻辑
      // 优先选择删除位置的前一个标签页
      let newActiveIndex = deleteIndex - 1

      // 边界处理：如果删除的是第一个标签页，则选择新的第一个标签页
      if (newActiveIndex < 0) {
        newActiveIndex = 0
      }

      // 如果还有剩余标签页，切换到新的激活标签页
      if (this.tabsList.length > 0) {
        if (this.tabsList[newActiveIndex]) {
          router && router.push({ ...this.tabsList[newActiveIndex] })
          this.changeCurTabInfo(this.tabsList[newActiveIndex].fullPath)
        } else {
          // 安全检查：如果计算出的索引无效，回退到第一个标签页
          router && router.push({ ...this.tabsList[0] })
          this.changeCurTabInfo(this.tabsList[0].fullPath)
        }
      } else {
        // 如果没有剩余标签页，返回首页
        router && router.push('/')
        this.changeCurTabInfo('')
      }
    },
    // 关闭其他标签页
    delOtherTabs(path: string, router: any) {
      // 找到要保留的标签页
      const targetTab = this.tabsList.find(item => item.fullPath === path)

      if (!targetTab) return

      // 过滤出首页和不可关闭的标签页以及当前指定的标签页
      this.tabsList = this.tabsList.filter(item => {
        return !item.meta.tabClosable || item.fullPath === path
      })

      // 如果当前激活的标签不是保留的标签，则切换到指定的标签
      if (this.curTabInfo.fullPath !== path) {
        router && router.push({ ...targetTab })
        this.changeCurTabInfo(path)
      }
    },
    // 关闭所有可关闭的标签页
    delAllTabs(router: any) {
      // 只保留不可关闭的标签页（通常是首页）
      const remainingTabs = this.tabsList.filter(item => !item.meta.tabClosable)
      this.tabsList = remainingTabs

      // 如果当前激活的标签是可关闭的，则需要切换到剩余的第一个标签
      const currentTabClosable = !this.tabsList.some(item => item.fullPath === this.curTabInfo.fullPath)

      if (currentTabClosable && remainingTabs.length > 0) {
        router && router.push({ ...remainingTabs[0] })
        this.changeCurTabInfo(remainingTabs[0].fullPath)
      }
    },
    // 关闭右侧所有标签页
    delRightTabs(index: number, router: any) {
      if (index < 0 || index >= this.tabsList.length) return

      // 获取当前索引对应的标签路径
      const currentPath = this.tabsList[index].fullPath

      // 保留当前索引及左侧的标签页
      this.tabsList = this.tabsList.filter((item, i) => {
        return i <= index || !item.meta.tabClosable
      })

      // 如果当前激活标签在被关闭的右侧标签中，则切换到指定的标签
      const isActivatedInRightTabs = !this.tabsList.some(item => item.fullPath === this.curTabInfo.fullPath)

      if (isActivatedInRightTabs) {
        const targetTab = this.tabsList.find(item => item.fullPath === currentPath)
        if (targetTab) {
          router && router.push({ ...targetTab })
          this.changeCurTabInfo(currentPath)
        }
      }
    },
    // 关闭左侧所有标签页
    delLeftTabs(index: number, router: any) {
      if (index <= 0 || index >= this.tabsList.length) return

      // 获取当前索引对应的标签路径
      const currentPath = this.tabsList[index].fullPath

      // 保留当前索引及右侧的标签页，以及不可关闭的标签页
      this.tabsList = this.tabsList.filter((item, i) => {
        return i >= index || !item.meta.tabClosable || i === 0 // 保留第一个标签（通常是首页）
      })

      // 如果当前激活标签在被关闭的左侧标签中，则切换到指定的标签
      const isActivatedInLeftTabs = !this.tabsList.some(item => item.fullPath === this.curTabInfo.fullPath)

      if (isActivatedInLeftTabs) {
        const targetTab = this.tabsList.find(item => item.fullPath === currentPath)
        if (targetTab) {
          router && router.push({ ...targetTab })
          this.changeCurTabInfo(currentPath)
        }
      }
    },
    changeCurTabInfo(path: string) {
      this.curTabInfo = this.tabsList.find((item) => {
        return item.fullPath === path
      }) || {}
    },
    // 刷新指定标签页
    refreshTab(path: string) {
      // 使用时间戳作为值，确保每次刷新都会触发变化
      this.refreshMap[path] = Date.now()
    }
  },
  persist: {
    storage: localStorage,
    key: 'menuTabInfos',
    serializer: {
      serialize: (value) => JSON.stringify(value),
      deserialize: (value) => JSON.parse(value)
    }
  }
})
