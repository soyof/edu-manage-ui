import { computed, reactive } from 'vue'
import { useDictStore } from '@/stores/dict'
import type { DictItem } from '@/stores/dict'
import service from '@/utils/services'

/**
 * 字典项的类型定义
 */
export interface DictionaryOptions {
  /**
   * 字典类型标识
   */
  dictType: string;
  /**
   * 是否自动加载字典数据
   */
  autoLoad?: boolean;
  /**
   * 自定义加载方法
   */
  customLoader?: () => Promise<DictItem[]>;
}

/**
 * 通用字典数据
 */
const dictCache = reactive<Record<string, DictItem[]>>({})
const dictMapCache = reactive<Record<string, Record<string, string>>>({})
const loadingState = reactive<Record<string, boolean>>({})

/**
 * 字典操作钩子
 * @param options 配置选项
 * @returns 字典相关的状态和方法
 */
export const useDictionary = (options: DictionaryOptions) => {
  const { dictType, autoLoad = true, customLoader } = options
  const dictStore = useDictStore()

  // 初始化此类型字典的缓存
  if (!dictCache[dictType]) {
    dictCache[dictType] = []
  }

  if (!dictMapCache[dictType]) {
    dictMapCache[dictType] = {}
  }

  if (loadingState[dictType] === undefined) {
    loadingState[dictType] = false
  }

  // 字典数据列表
  const dictList = computed(() => {
    let result: DictItem[] = []

    if (isBuiltInDict(dictType)) {
      // 内置字典走store
      result = dictStore.getDictList(dictType).value
    } else {
      // 自定义字典走缓存
      result = dictCache[dictType] || []
    }

    // 不再在computed中触发重新加载，避免无限循环请求

    return result
  })

  // 字典映射对象
  const dictMapping = computed(() => {
    let result: Record<string, string> = {}

    if (isBuiltInDict(dictType)) {
      // 内置字典走store
      result = dictStore.getDictObj(dictType).value
    } else {
      // 自定义字典走缓存
      result = dictMapCache[dictType] || {}
    }

    // 不再在computed中触发重新加载，避免无限循环请求

    return result
  })

  // 加载状态
  const loading = computed(() => loadingState[dictType])

  /**
   * 判断是否为内置字典类型
   */
  const isBuiltInDict = (type: string): boolean => {
    return ['user_title', 'notice_type', 'notice_importance', 'publish_status', 'intro_type', 'dynamic_type', 'paper_submission_status'].includes(type)
  }

  /**
   * 加载字典数据
   * @param forceLoad 是否强制加载，即使已有数据
   */
  const loadDictData = async(forceLoad = false) => {
    // 避免重复加载
    if (loadingState[dictType]) return

    // 检查是否已有数据且不为空数组
    const existingData = isBuiltInDict(dictType)
      ? dictStore.getDictList(dictType).value
      : dictCache[dictType]

    // 如果已有数据且不为空数组，且不是强制加载，则不需要重新加载
    if (!forceLoad && existingData && existingData.length > 0) return

    loadingState[dictType] = true
    try {
      if (isBuiltInDict(dictType)) {
        // 内置字典直接使用store的方法加载，传递forceLoad参数
        await dictStore.getDictByType(dictType, forceLoad)
      } else {
        // 自定义字典处理
        if (customLoader) {
          // 使用自定义加载器
          const data = await customLoader()
          updateDictData(dictType, data)
        } else {
          // 使用通用API加载
          const res: any = await service.get(`/api/getDictByType?dictType=${dictType}`)
          if (res && Array.isArray(res)) {
            updateDictData(dictType, res)
          }
        }
      }
    } catch (error) {
      console.error(`加载字典数据失败: ${dictType}`, error)
    } finally {
      loadingState[dictType] = false
    }
  }

  /**
   * 更新字典数据到缓存
   * @param type 字典类型
   * @param data 字典数据
   */
  const updateDictData = (type: string, data: DictItem[]) => {
    dictCache[type] = data

    // 构建字典映射
    const mapping: Record<string, string> = {}
    data.forEach((item: any) => {
      if (typeof item === 'object' && item !== null) {
        if (item.dictId && item.dictValue) {
          mapping[item.dictId] = item.dictValue
        }
      }
    })
    dictMapCache[type] = mapping
  }

  /**
   * 根据字典代码获取字典值
   * @param code 字典代码
   * @param defaultValue 默认值，当未找到对应值时返回
   * @returns 字典值
   */
  const getDictLabel = (code: string, defaultValue: string = code): string => {
    if (!code) return defaultValue

    let result: string

    if (isBuiltInDict(dictType)) {
      result = dictStore.getDictNameByCode(dictType, code) || defaultValue
    } else {
      result = dictMapping.value[code] || defaultValue
    }

    // 不再在方法调用中触发重新加载，避免无限循环请求

    return result
  }

  /**
   * 刷新字典数据
   */
  const refreshDict = () => {
    if (isBuiltInDict(dictType)) {
      // 内置字典先清除缓存再重新加载
      dictStore.clearDictCache(dictType)
    }
    // 强制重新加载
    loadDictData(true)
  }

  // 如果设置了自动加载，在hooks创建时加载数据
  if (autoLoad) {
    loadDictData()
  }

  /**
   * 检查字典是否为空
   */
  const isDictEmpty = (): boolean => {
    const data = isBuiltInDict(dictType)
      ? dictStore.getDictList(dictType).value
      : dictCache[dictType]
    return !data || data.length === 0
  }

  return {
    dictList,
    dictMapping,
    loading,
    loadDictData,
    getDictLabel,
    refreshDict,
    isDictEmpty
  }
}

export const useDictInfo = (dictType: string, autoLoad = true) => {
  return useDictionary({
    dictType,
    autoLoad
  })
}
