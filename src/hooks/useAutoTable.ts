import { ref, onMounted, nextTick, onBeforeUnmount } from 'vue'
import type { Ref } from 'vue'

interface AutoTableOptions {
  /**
   * 页面容器元素的引用
   */
  pageRef: Ref<HTMLElement | null>
  /**
   * 需要从总高度中减去的元素引用数组
   */
  deductRefs: Array<Ref<HTMLElement | null>>
  /**
   * 额外需要扣除的高度(如内边距等)
   */
  extraDeduct?: number
  /**
   * 最小表格高度
   */
  minHeight?: number
  /**
   * 计算延迟时间(ms)
   */
  delay?: number
}

/**
 * 自动计算表格高度的钩子函数
 * @param options 配置选项
 * @returns 表格高度引用
 */
export const useAutoTable = (options: AutoTableOptions) => {
  const {
    pageRef,
    deductRefs,
    extraDeduct = 12,
    minHeight = 300,
    delay = 200
  } = options

  // 表格高度响应式引用
  const tableHeight = ref(minHeight)

  // 计算表格高度的函数
  const calculateTableHeight = () => {
    if (!pageRef.value) return

    nextTick(() => {
      // 获取容器高度
      const containerHeight = pageRef.value?.clientHeight || 0
      // 计算需要减去的元素高度总和
      const deductHeight = deductRefs.reduce((total, refItem) => {
        return total + (refItem.value?.clientHeight || 0)
      }, 0)
      // 计算最终表格高度
      const calculatedHeight = containerHeight - deductHeight - extraDeduct
      tableHeight.value = calculatedHeight > minHeight ? calculatedHeight : minHeight
    })
  }

  // 监听尺寸变化并重新计算高度
  const setupResizeListener = () => {
    // 立即计算一次
    calculateTableHeight()

    // 设置window的resize监听
    window.addEventListener('resize', calculateTableHeight)
  }

  // 组件挂载后设置监听
  onMounted(() => {
    // 延迟执行，确保DOM已完全渲染
    setTimeout(() => {
      setupResizeListener()
    }, delay)
  })

  // 组件卸载前移除监听
  onBeforeUnmount(() => {
    window.removeEventListener('resize', calculateTableHeight)
  })

  return {
    tableHeight,
    calculateTableHeight
  }
}
