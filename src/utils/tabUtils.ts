import { useRouter } from 'vue-router'
import type { Router, RouteLocationRaw, LocationQuery, RouteParamValue, RouteParams } from 'vue-router'
import { useTabsStore } from '@/stores/menuTabs'
import pinia from '@/stores'
import type { TabItem } from '@/stores/menuTabs'

/**
 * 添加标签并跳转路由的工具函数
 * @param options - 配置选项
 * @param options.path - 路由路径
 * @param options.name - 路由名称（可选）
 * @param options.title - 标签页标题，如果不提供则使用路由元数据中的标题
 * @param options.query - 路由查询参数
 * @param options.params - 路由参数
 * @param options.closable - 标签页是否可关闭，默认为 true
 * @param options.replace - 是否使用 replace 而不是 push 进行导航，默认为 false
 */
export interface AddTabOptions {
  path: string
  name?: string
  title?: string
  query?: LocationQuery
  params?: RouteParams
  closable?: boolean
  replace?: boolean
}

/**
 * 添加标签并导航到指定路由
 * 此函数直接将标题信息传递给store，不通过URL参数
 */
export function useAddTab() {
  const router = useRouter()
  const tabsStore = useTabsStore()

  return (options: AddTabOptions) => {
    const { path, name, title, query = {}, params = {}, closable = true, replace = false } = options

    // 准备路由选项
    const routeOptions: any = { path }

    // 添加路由名称（如果提供）
    if (name) {
      routeOptions.name = name
    }

    // 添加查询参数
    if (Object.keys(query).length > 0) {
      routeOptions.query = query
    }

    // 添加路由参数
    if (Object.keys(params).length > 0) {
      routeOptions.params = params
    }

    // 先进行路由导航
    const routePromise = replace
      ? router.replace(routeOptions)
      : router.push(routeOptions)

    // 路由跳转成功后，手动添加标签
    routePromise.then(() => {
      // 获取当前路由
      const route = router.currentRoute.value

      // 手动添加标签
      addCustomTab({
        path: route.path,
        fullPath: route.fullPath,
        name: route.name as string,
        title: title || (route.meta.title as string),
        closable: closable,
        query: route.query,
        params: route.params
      }, tabsStore)
    }).catch(error => {
      console.error('路由跳转失败:', error)
    })

    return routePromise
  }
}

/**
 * 简化版的添加标签并导航函数
 * 直接使用而无需先调用 useAddTab()
 * @param options - 标签选项
 * @param router - 路由实例，如果不提供则自动获取
 */
export function addTab(options: AddTabOptions, router?: Router) {
  const routerInstance = router || useRouter()
  const tabsStore = useTabsStore(pinia)

  const { path, name, title, query = {}, params = {}, closable = true, replace = false } = options

  // 准备路由选项
  const routeOptions: any = { path }

  // 添加路由名称（如果提供）
  if (name) {
    routeOptions.name = name
  }

  // 添加查询参数
  if (Object.keys(query).length > 0) {
    routeOptions.query = query
  }

  // 添加路由参数
  if (Object.keys(params).length > 0) {
    routeOptions.params = params
  }

  // 先进行路由导航
  const routePromise = replace
    ? routerInstance.replace(routeOptions)
    : routerInstance.push(routeOptions)

  // 路由跳转成功后，手动添加标签
  routePromise.then(() => {
    // 获取当前路由
    const route = routerInstance.currentRoute.value

    // 手动添加标签
    addCustomTab({
      path: route.path,
      fullPath: route.fullPath,
      name: route.name as string,
      title: title || (route.meta.title as string),
      closable: closable,
      query: route.query,
      params: route.params
    }, tabsStore)
  }).catch(error => {
    console.error('路由跳转失败:', error)
  })

  return routePromise
}

/**
 * 添加自定义标签（不进行路由跳转）
 * @param tab - 标签信息
 * @param store - 标签存储，如果不提供则自动获取
 */
interface CustomTabOptions {
  path: string
  fullPath: string
  name: string
  title: string
  closable?: boolean
  query?: LocationQuery
  params?: RouteParams
}

export function addCustomTab(tab: CustomTabOptions, store?: ReturnType<typeof useTabsStore>) {
  const tabsStore = store || useTabsStore(pinia)

  // 创建符合TabItem接口的对象
  const tabItem: TabItem = {
    path: tab.path,
    fullPath: tab.fullPath,
    name: tab.name,
    query: tab.query,
    params: tab.params,
    meta: {
      title: tab.title,
      tabClosable: tab.closable !== false
    }
  }

  // 添加到store中
  tabsStore.addTabList(tabItem)

  // 设置当前活动标签
  tabsStore.changeCurTabInfo(tab.fullPath)
}
