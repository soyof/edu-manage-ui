import { defineStore } from 'pinia'
import { computed } from 'vue'
import service from '@/utils/services'

// 定义字典项类型
export interface DictItem {
  dictId: string;
  dictValue: string;
}

export interface DictState {
  dictInfo: Record<string, DictItem[]>; // 字典信息，键为字典类型，值为字典项数组
  dictObjCache: Record<string, Record<string, string>>; // 缓存字典对象，用于快速查询
}

export const useDictStore = defineStore('dict', {
  state: (): DictState => {
    return {
      dictInfo: {},
      dictObjCache: {}
    }
  },
  getters: {
    // 获取指定类型的字典列表
    getDictList: (state) => {
      return (dictType: string) => {
        return computed(() => state.dictInfo[dictType] || [])
      }
    },
    // 获取指定类型的字典对象（id -> value映射）
    getDictObj: (state) => {
      return (dictType: string) => {
        return computed(() => {
          // 如果缓存中已有该字典对象，直接返回
          if (state.dictObjCache[dictType]) {
            return state.dictObjCache[dictType]
          }

          // 否则构建字典对象并缓存
          const dictList = state.dictInfo[dictType] || []
          const dictObj: Record<string, string> = {}
          dictList.forEach((item: DictItem) => {
            if (item.dictId && item.dictValue) {
              dictObj[item.dictId] = item.dictValue
            }
          })

          // 更新缓存
          state.dictObjCache[dictType] = dictObj

          return dictObj
        })
      }
    }
  },
  actions: {
    // 获取指定类型的字典数据
    async getDictByType(dictType: string, forceLoad = false) {
      // 如果已有数据且不为空数组，且不是强制加载，直接返回
      if (!forceLoad && this.dictInfo[dictType] && this.dictInfo[dictType].length > 0) {
        return Promise.resolve(this.dictInfo[dictType])
      }

      // 否则调用接口获取
      return await service.get(`/api/getDictByType?dictType=${dictType}`).then((res: any) => {
        if (res && Array.isArray(res)) {
          this.updateDict(dictType, res)
        }
        return this.dictInfo[dictType] || []
      })
    },

    // 更新字典数据
    updateDict(dictType: string, dictList: DictItem[]) {
      this.dictInfo[dictType] = dictList

      // 同时更新字典对象缓存
      const dictObj: Record<string, string> = {}
      dictList.forEach((item: DictItem) => {
        if (item.dictId && item.dictValue) {
          dictObj[item.dictId] = item.dictValue
        }
      })
      this.dictObjCache[dictType] = dictObj
    },

    // 根据字典类型和代码获取名称
    getDictNameByCode(dictType: string, code: string): string {
      const dictObj = this.dictObjCache[dictType] || {}
      return dictObj[code] || code
    },

    // 清除指定类型的字典缓存
    clearDictCache(dictType: string) {
      if (this.dictInfo[dictType]) {
        delete this.dictInfo[dictType]
      }
      if (this.dictObjCache[dictType]) {
        delete this.dictObjCache[dictType]
      }

      // 触发事件，通知其他模块清除缓存
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('dict-cache-cleared', {
          detail: { dictType }
        }))
      }
    },

    // 清除所有字典缓存
    clearAllDictCache() {
      this.dictInfo = {}
      this.dictObjCache = {}
      // 确保也从本地存储中删除
      localStorage.removeItem('dict')
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
