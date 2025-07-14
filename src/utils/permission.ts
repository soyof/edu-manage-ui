import pinia from '@/stores'
import { useUserInfoStore } from '@/stores/userInfo'
export const routerBeforeEach = async(to: any, from: any, next: any) => {
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
        // 有用户信息，放行
        next()
      } else {
        try {
          // 没有用户信息，但有token，尝试获取用户信息
          await userStore.getUserInfoAction()
          next()
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
