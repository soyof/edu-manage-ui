import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useTabsStore = defineStore('counter', {
  state: () => {
    return {
      curTabInfo: {},
      tabsList: ref([
        {
          path: '/homePage',
          name: 'homePage',
          meta: {
            title: '首页',
            tabClosable: false
          }
        }
      ])
    }
  },
  getters: {
    getTabsList: (state) => {
      return computed(() => state.tabsList)
    },
    getCurTabInfo: (state) => state.curTabInfo,
    getCurTabPath: (state) => state.curTabInfo.path
  },
  actions: {
    addTabList(tab) {
      const isExist = this.tabsList.find((item) => item.path === tab.path)
      !isExist && this.tabsList.push(tab)
    },
    delTabList(path, router) {
      const ids = this.tabsList.findIndex((item) => item.path === path)
      if (ids !== -1) {
        this.tabsList = this.tabsList.filter((item) => item.path !== path)
        let newActiveIndex = ids
        if (newActiveIndex >= this.tabsList.length) {
          newActiveIndex = this.tabsList.length - 1
        }

        if (this.tabsList[newActiveIndex]) {
          router && router.push({ ...this.tabsList[newActiveIndex] })
          this.changeCurTabInfo(this.tabsList[newActiveIndex].path)
        } else {
          router && router.push('/')
          this.changeCurTabInfo('')
        }
      } else {
        this.changeCurTabInfo('')
      }
    },
    changeCurTabInfo(path) {
      this.curTabInfo = this.tabsList.find((item) => item.path === path) || {}
    }
  }
})
