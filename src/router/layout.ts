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
  },
  {
    path: '/modifyUserOtherInfos',
    name: 'modifyUserOtherInfos',
    meta: { title: '学术档案', isHidden: true, tabClosable: true },
    component: () => import(/* webpackChunkName: "modifyUserInfos" */ '../views/modifyUserOtherInfos.vue')
  },
  {
    path: '/noticeManage',
    name: 'noticeManage',
    meta: { title: '通知管理', tabClosable: true },
    component: () => import(/* webpackChunkName: "noticeManage" */ '../views/noticeManage.vue')
  },
  {
    path: '/userCenter',
    name: 'userCenter',
    meta: { title: '个人中心', isHidden: true, tabClosable: true },
    component: () => import(/* webpackChunkName: "userCenter" */ '../views/userCenter.vue')
  }
]
