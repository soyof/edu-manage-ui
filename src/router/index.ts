import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import layout from './layout'
import pinia from '@/stores'
import { useTabsStore } from '@/stores/menuTabs'

const store = useTabsStore(pinia)

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/homePage'
  },
  {
    path: '/',
    name: 'Layout',
    component: () => import(/* webpackChunkName: "Layout" */ '../views/layout.vue'),
    children: layout
  },
  {
    path: '/login',
    name: 'Login',
    title: '登录',
    component: () => import(/* webpackChunkName: "login" */ '../views/loginPage.vue')
  },
  {
    path: '/notFound',
    name: 'NotFound',
    component: () => import(/* webpackChunkName: "notFound" */ '../views/notFound.vue')
  },
  { path: '/:pathMatch(.*)*', redirect: '/notFound' }
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

router.afterEach((to, from) => {
  store.addTabList(to)
  store.changeCurTabInfo(to.path)
})
