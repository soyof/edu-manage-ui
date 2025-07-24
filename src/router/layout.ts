export default [
  {
    path: '/homePage',
    name: 'homePage',
    meta: { title: '首页', tabClosable: false },
    component: () => import(/* webpackChunkName: "homePage" */ '@/views/home/homePage.vue')
  },
  {
    path: '/userCenter',
    name: 'userCenter',
    meta: { title: '个人中心', isHidden: true, tabClosable: true },
    component: () => import(/* webpackChunkName: "userCenter" */ '@/views/user/userCenter.vue')
  },
  {
    path: '/userManage',
    name: 'userManage',
    meta: { title: '用户管理', tabClosable: true },
    component: () => import(/* webpackChunkName: "userManage" */ '@/views/user/userManage.vue')
  },
  {
    path: '/modifyUserOtherInfos',
    name: 'modifyUserOtherInfos',
    meta: { title: '学术档案', isHidden: true, tabClosable: true },
    component: () => import(/* webpackChunkName: "modifyUserInfos" */ '@/views/user/modifyUserOtherInfos.vue')
  },
  {
    path: '/noticeManage',
    name: 'noticeManage',
    meta: { title: '通知管理', tabClosable: true },
    component: () => import(/* webpackChunkName: "noticeManage" */ '@/views/notice/noticeManage.vue')
  },
  {
    path: '/modifyNotice',
    name: 'modifyNotice',
    meta: { title: '编辑通知', isHidden: true, tabClosable: true },
    component: () => import(/* webpackChunkName: "modifyNoticeInfos" */ '@/views/notice/modifyNoticeInfos.vue')
  },
  {
    path: '/noticeDetail',
    name: 'noticeDetail',
    meta: { title: '通知详情', isHidden: true, tabClosable: true },
    component: () => import(/* webpackChunkName: "noticeDetail" */ '@/views/notice/noticeDetail.vue')
  },
  {
    path: '/labProfileManage',
    name: 'labProfileManage',
    meta: { title: '简介管理', tabClosable: true },
    component: () => import(/* webpackChunkName: "labProfileManage" */ '@/views/labProfile/labProfileManage.vue')
  },
  {
    path: '/modifyLabProfile',
    name: 'modifyLabProfile',
    meta: { title: '编辑简介', isHidden: true, tabClosable: true },
    component: () => import(/* webpackChunkName: "modifyLabProfileInfos" */ '@/views/labProfile/modifyLabProfileInfos.vue')
  },
  {
    path: '/labProfileDetail',
    name: 'labProfileDetail',
    meta: { title: '简介详情', isHidden: true, tabClosable: true },
    component: () => import(/* webpackChunkName: "labProfileDetail" */ '@/views/labProfile/labProfileDetail.vue')
  },
  {
    path: '/dynamicManage',
    name: 'dynamicManage',
    meta: { title: '动态管理', tabClosable: true },
    component: () => import(/* webpackChunkName: "dynamicManage" */ '@/views/dynamic/dynamicManage.vue')
  },
  {
    path: '/modifyDynamic',
    name: 'modifyDynamic',
    meta: { title: '编辑动态', isHidden: true, tabClosable: true },
    component: () => import(/* webpackChunkName: "modifyDynamic" */ '@/views/dynamic/modifyDynamic.vue')
  },
  {
    path: '/dynamicDetail',
    name: 'dynamicDetail',
    meta: { title: '动态详情', isHidden: true, tabClosable: true },
    component: () => import(/* webpackChunkName: "dynamicDetail" */ '@/views/dynamic/dynamicDetail.vue')
  },
  // 添加论文管理相关路由
  {
    path: '/paperManage',
    name: 'paperManage',
    meta: { title: '论文管理', tabClosable: true },
    component: () => import(/* webpackChunkName: "paperManage" */ '@/views/paper/paperManage.vue')
  },
  {
    path: '/modifyPaper',
    name: 'modifyPaper',
    meta: { title: '编辑论文', isHidden: true, tabClosable: true },
    component: () => import(/* webpackChunkName: "modifyPaperInfos" */ '@/views/paper/modifyPaperInfos.vue')
  },
  {
    path: '/paperDetail',
    name: 'paperDetail',
    meta: { title: '论文详情', isHidden: true, tabClosable: true },
    component: () => import(/* webpackChunkName: "paperDetail" */ '@/views/paper/paperDetail.vue')
  },
  {
    path: '/recruitManage',
    name: 'recruitManage',
    meta: { title: '招聘信息管理', tabClosable: true },
    component: () => import(/* webpackChunkName: "recruitManage" */ '@/views/recruit/recruitManage.vue')
  },
  {
    path: '/modifyRecruitInfo',
    name: 'modifyRecruitInfo',
    meta: { title: '编辑招聘信息', isHidden: true, tabClosable: true },
    component: () => import(/* webpackChunkName: "modifyRecruitInfo" */ '@/views/recruit/modifyRecruitInfo.vue')
  },
  {
    path: '/recruitInfoDetail',
    name: 'recruitInfoDetail',
    meta: { title: '招聘信息详情', isHidden: true, tabClosable: true },
    component: () => import(/* webpackChunkName: "recruitInfoDetail" */ '@/views/recruit/recruitInfoDetail.vue')
  },
  // 添加专利管理相关路由
  {
    path: '/patentManage',
    name: 'patentManage',
    meta: { title: '专利管理', tabClosable: true },
    component: () => import(/* webpackChunkName: "patentManage" */ '@/views/patent/patentManage.vue')
  },
  {
    path: '/modifyPatent',
    name: 'modifyPatent',
    meta: { title: '编辑专利', isHidden: true, tabClosable: true },
    component: () => import(/* webpackChunkName: "modifyPatentInfos" */ '@/views/patent/modifyPatentInfos.vue')
  },
  {
    path: '/patentDetail',
    name: 'patentDetail',
    meta: { title: '专利详情', isHidden: true, tabClosable: true },
    component: () => import(/* webpackChunkName: "patentDetail" */ '@/views/patent/patentDetail.vue')
  },
  // 添加仪器管理相关路由
  {
    path: '/instrumentManage',
    name: 'instrumentManage',
    meta: { title: '仪器管理', tabClosable: true },
    component: () => import(/* webpackChunkName: "instrumentManage" */ '@/views/instrument/instrumentManage.vue')
  },
  {
    path: '/modifyInstrument',
    name: 'modifyInstrument',
    meta: { title: '编辑仪器', isHidden: true, tabClosable: true },
    component: () => import(/* webpackChunkName: "modifyInstrumentInfos" */ '@/views/instrument/modifyInstrumentInfos.vue')
  },
  {
    path: '/instrumentDetail',
    name: 'instrumentDetail',
    meta: { title: '仪器详情', isHidden: true, tabClosable: true },
    component: () => import(/* webpackChunkName: "instrumentDetail" */ '@/views/instrument/instrumentDetail.vue')
  }
]
