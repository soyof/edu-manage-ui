import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue')
  },
  {
    path: '/login',
    name: 'Login',
    // 尝试使用相对路径引入组件，解决找不到模块的问题
    component: () => import('../views/LoginPage.vue')
  },
  {
    path: '/register',
    name: 'Register',
    // 尝试使用相对路径引入组件，解决找不到模块的问题
    component: () => import('../views/RegisterPage.vue')
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router

// 添加路由守卫
router.beforeEach((to, from, next) => {
  // const isLoggedIn = localStorage.getItem('token') // 假设使用 localStorage 存储 token
  // if (to.name !== 'Login' && !isLoggedIn) {
  //   next({ name: 'Login' })
  // } else {
  //   next()
  // }
  next()
})
