import pinia from '@/stores'
import { useUserInfoStore } from '@/stores/userInfo'
import layoutRouter from '@/router/layout'

// 检查用户是否有访问权限
const hasRoutePermission = (route: any, userRole: string): boolean => {
  if (!route.meta || !route.meta.roles) return true
  return route.meta.roles.includes(userRole) || (route.meta.roles.includes('admin') && userRole === '管理员')
}

// 递归查找路由配置
const findRouteConfig = (path: string, routes: any[]): any => {
  for (const route of routes) {
    if (route.path === path) {
      return route
    }
    if (route.children) {
      const found = findRouteConfig(path, route.children)
      if (found) return found
    }
  }
  return null
}

export const routerBeforeEach = async(to: any, _from: any, next: any) => {
  // 获取store
  const userStore = useUserInfoStore(pinia)
  const token = userStore.getToken.value
  const userInfo = userStore.getUserInfo.value
  const hasUserInfo = userInfo && Object.keys(userInfo).length > 0

  // 不需要登录验证的路由
  const whiteList = ['/login', '/notFound']

  // 判断是否需要登录权限
  if (whiteList.includes(to.path)) {
    // 在白名单中，直接放行
    if (to.path === '/login' && token && hasUserInfo) {
      // 如果已经登录，但访问登录页，则重定向到首页
      next({ path: '/' })
    } else {
      next()
    }
  } else {
    // 需要登录权限
    if (token) {
      // 已登录状态
      if (hasUserInfo) {
        // 有用户信息，检查路由权限
        const userRole = userInfo?.role || 'user'
        const routeConfig = findRouteConfig(to.path, layoutRouter)

        if (routeConfig && !hasRoutePermission(routeConfig, userRole)) {
          // 没有权限访问该路由，重定向到首页
          console.warn(`用户 ${userRole} 没有权限访问 ${to.path}`)
          next({ path: '/homePage' })
        } else {
          // 有权限，放行
          next()
        }
      } else {
        try {
          // 没有用户信息，但有token，尝试获取用户信息
          await userStore.getUserInfoAction()
          // 获取用户信息后，重新检查权限
          const userRole = userStore.getUserInfo.value?.role || 'user'
          const routeConfig = findRouteConfig(to.path, layoutRouter)

          if (routeConfig && !hasRoutePermission(routeConfig, userRole)) {
            next({ path: '/homePage' })
          } else {
            next()
          }
        } catch (error) {
          console.log(error)
          // 获取用户信息失败，可能是token过期，清除token并跳转到登录页
          userStore.removeToken()
          next(`/login?redirect=${to.fullPath}`)
        }
      }
    } else {
      // 未登录，重定向到登录页
      next(`/login?redirect=${encodeURIComponent(to.fullPath)}`)
    }
  }
}
