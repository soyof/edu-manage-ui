import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import layout from './layout'
import pinia from '@/stores'
import { useTabsStore } from '@/stores/menuTabs'
import { routerBeforeEach } from '@/utils/permission'

let store: any = null

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
    meta: { title: '登录' },
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
  // 获取store
  store = useTabsStore(pinia)
  // 初始化标签页状态，过滤掉登录页签
  store.initStore()
  routerBeforeEach(to, from, next)
})

router.afterEach((to, _from) => {
  store?.addTabList(to)
  store?.changeCurTabInfo(to.fullPath)
})
