export default [
  {
    path: '/homePage',
    name: 'homePage',
    meta: { title: '首页', tabClosable: false },
    component: () => import(/* webpackChunkName: "homePage" */ '../views/homePage.vue')
  },
  {
    path: '/userManage',
    name: 'userManage',
    meta: { title: '用户管理', tabClosable: true },
    component: () => import(/* webpackChunkName: "userManage" */ '../views/userManage.vue')
  }
]
