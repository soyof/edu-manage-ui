import type { RouteLocationNormalized } from 'vue-router'

/**
 * 动态设置浏览器页签标题的工具函数
 */

// 应用默认标题
const DEFAULT_TITLE = '合成研究学研究所'

/**
 * 设置页面标题
 * @param title 页面标题，如果为空则使用默认标题
 */
export function setDocumentTitle(title?: string): void {
  try {
    if (title && title.trim()) {
      document.title = `${title} - ${DEFAULT_TITLE}`
    } else {
      document.title = DEFAULT_TITLE
    }
  } catch (error) {
    console.warn('设置页面标题失败:', error)
    document.title = DEFAULT_TITLE
  }
}

/**
 * 根据路由meta信息设置页面标题
 * @param route 路由对象
 */
export function setTitleFromRoute(route: RouteLocationNormalized): void {
  const title = route?.meta?.title as string | undefined
  setDocumentTitle(title)
}

/**
 * 获取当前页面标题（不包含应用名称）
 * @returns 当前页面标题
 */
export function getCurrentPageTitle(): string {
  const currentTitle = document.title
  if (currentTitle.includes(` - ${DEFAULT_TITLE}`)) {
    return currentTitle.replace(` - ${DEFAULT_TITLE}`, '')
  }
  return currentTitle === DEFAULT_TITLE ? '' : currentTitle
}
