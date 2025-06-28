import { ref } from 'vue'
import { ElLoading } from 'element-plus'
import type { LoadingOptions } from 'element-plus/es/components/loading/src/types'

/**
 * 封装Element Plus的Loading服务
 * @param defaultOptions 默认配置选项
 * @returns loading状态和控制方法
 */
export default function useLoading(defaultOptions: LoadingOptions = {}) {
  // 加载状态
  const loading = ref(false)
  // 加载实例
  let loadingInstance: any = null

  // 默认配置
  const defaultLoadingOptions: LoadingOptions = {
    text: '加载中...',
    background: 'rgba(255, 255, 255, 0.8)',
    ...defaultOptions
  }

  /**
   * 改变加载状态
   * @param status 是否显示加载
   * @param options 加载配置选项
   */
  const changeLoading = (status: boolean, options: LoadingOptions = {}) => {
    loading.value = status

    // 合并选项
    const mergedOptions = {
      ...defaultLoadingOptions,
      ...options
    }

    if (status) {
      // 如果已经有实例，先关闭
      if (loadingInstance) {
        loadingInstance.close()
      }
      // 创建新的加载实例
      loadingInstance = ElLoading.service(mergedOptions)
    } else if (loadingInstance) {
      // 关闭加载实例
      loadingInstance.close()
      loadingInstance = null
    }
  }

  // 在组件卸载时确保关闭loading
  const closeLoading = () => {
    if (loadingInstance) {
      loadingInstance.close()
      loadingInstance = null
    }
    loading.value = false
  }

  return {
    loading,
    changeLoading,
    closeLoading
  }
}
