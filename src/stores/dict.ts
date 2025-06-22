import { defineStore } from 'pinia'
import { computed } from 'vue'
import service from '@/utils/services'

// 定义字典项类型
export interface DictItem {
  dictId: string;
  dictValue: string;
}

export interface DictState {
  userTitleList: DictItem[];
  userTitleDict: Record<string, string>; // 职称字典对象，用于翻译
}

export const useDictStore = defineStore('dict', {
  state: (): DictState => {
    return {
      userTitleList: [],
      userTitleDict: {}
    }
  },
  getters: {
    getUserTitleList: (state) => {
      return computed(() => state.userTitleList || [])
    },
    // 获取职称字典对象
    getUserTitleDict: (state) => {
      return computed(() => state.userTitleDict || {})
    }
  },
  actions: {
    async getUserTitleListAction() {
      // 如果已有数据，直接返回
      if (this.userTitleList && this.userTitleList.length > 0) {
        return Promise.resolve(this.userTitleList)
      }

      // 否则调用接口获取
      return await service.get('/api/getDictByType?dictType=user_title').then((res: any) => {
        if (res && Array.isArray(res)) {
          this.updateUserTitleList(res || [])

          // 构建职称字典对象，便于翻译
          const dict: Record<string, string> = {}
          this.userTitleList.forEach((item: any) => {
            if (typeof item === 'object' && item !== null) {
              if (item.dictId && item.dictValue) {
                dict[item.dictId] = item.dictValue
              }
            }
          })
          this.updateUserTitleDict(dict)
        }
        return this.userTitleList
      })
    },
    updateUserTitleList(userTitleList: DictItem[]) {
      this.userTitleList = userTitleList
    },
    updateUserTitleDict(dict: Record<string, string>) {
      this.userTitleDict = dict
    },
    // 根据职称代码获取职称名称
    getTitleNameByCode(code: string): string {
      return this.userTitleDict[code] || code
    }
  },
  persist: {
    storage: localStorage,
    key: 'dict',
    serializer: {
      serialize: (value) => JSON.stringify(value),
      deserialize: (value) => JSON.parse(value)
    }
  }
})
