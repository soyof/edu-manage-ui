import { ref, onMounted, nextTick, onBeforeUnmount, onActivated } from 'vue'
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
 * @returns 包含表格高度和手动触发重新计算方法的对象
 */
export const useAutoTable = (options: AutoTableOptions) => {
  const {
    pageRef,
    deductRefs,
    extraDeduct = 12,
    minHeight = 100,
    delay = 200
  } = options

  // 表格高度响应式引用
  const tableHeight = ref<number>(minHeight)

  // 防抖定时器
  let resizeTimer: ReturnType<typeof setTimeout> | null = null

  /**
   * 计算表格高度的函数
   * @returns 计算后的表格高度
   */
  const calculateTableHeight = () => {
    // 检查页面容器是否存在
    if (!pageRef.value) {
      return tableHeight.value
    }

    return nextTick().then(() => {
      try {
        // 获取容器高度
        const containerHeight = pageRef.value?.clientHeight || 0

        // 计算需要减去的元素高度总和
        const deductHeight = deductRefs.reduce((total, refItem) => {
          return total + (refItem.value?.clientHeight || 0)
        }, 0)

        // 计算最终表格高度，不小于最小高度
        const calculatedHeight = Math.max(
          containerHeight - deductHeight - extraDeduct,
          minHeight
        )

        // 更新表格高度
        tableHeight.value = calculatedHeight
        return calculatedHeight
      } catch (error) {
        console.error('计算表格高度时出错:', error)
        // 出错时返回最小高度
        tableHeight.value = minHeight
        return minHeight
      }
    })
  }

  /**
   * 带防抖功能的窗口大小变化处理函数
   */
  const handleResize = () => {
    // 清除已有的定时器
    if (resizeTimer) {
      clearTimeout(resizeTimer)
      resizeTimer = null
    }

    // 设置新的定时器
    resizeTimer = setTimeout(() => {
      calculateTableHeight()
    }, delay)
  }

  /**
   * 手动触发表格高度重新计算
   * 可在特定时机调用，如数据加载完成后、DOM变化后等
   */
  const recalculateHeight = () => {
    return calculateTableHeight()
  }

  // 组件挂载后设置监听
  onMounted(() => {
    // 延迟执行，确保DOM已完全渲染
    setTimeout(() => {
      calculateTableHeight()
      window.addEventListener('resize', handleResize)
    }, delay)
  })

  // 组件激活后重新计算表格高度
  onActivated(() => {
    calculateTableHeight()
  })

  // 组件卸载前移除监听并清理定时器
  onBeforeUnmount(() => {
    window.removeEventListener('resize', handleResize)
    if (resizeTimer) {
      clearTimeout(resizeTimer)
      resizeTimer = null
    }
  })

  return {
    tableHeight,
    recalculateHeight
  }
}
