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
      ]
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
    addTabList(tab: TabItem) {
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
    delTabList(path: string, router: any) {
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

      // 删除标签页
      this.tabsList = this.tabsList.filter((item) => {
        return item.fullPath !== path
      })

      // 如果删除的不是当前激活的标签页，不需要切换路由
      if (!isActivated) {
        return
      }

      // 如果删除的是当前激活的标签页，需要切换路由
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
    changeCurTabInfo(path: string) {
      this.curTabInfo = this.tabsList.find((item) => {
        return item.fullPath === path
      }) || {}
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
