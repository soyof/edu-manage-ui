// 牵扯到menuTab的相关判断，因此二级路由均以 / 开头。否则页签会存在问题
export default [
  {
    path: '/homePage',
    name: 'homePage',
    meta: { title: '首页', tabClosable: false, icon: 'HomeFilled' },
    component: () => import(/* webpackChunkName: "homePage" */ '@/views/home/homePage.vue')
  },
  // 系统管理
  {
    path: '/systemManage',
    name: 'systemManage',
    meta: { title: '系统管理', tabClosable: true, icon: 'Setting' },
    children: [
      {
        path: '/userManage',
        name: 'userManage',
        meta: { title: '用户管理', tabClosable: true, icon: 'User' },
        component: () => import(/* webpackChunkName: "userManage" */ '@/views/user/userManage.vue')
      },
      {
        path: '/dictManage',
        name: 'dictManage',
        meta: { title: '字典管理', tabClosable: true, icon: 'Collection' },
        component: () => import(/* webpackChunkName: "dictManage" */ '@/views/dict/dictManage.vue')
      },
      // 隐藏路由
      {
        path: '/userCenter',
        name: 'userCenter',
        meta: { title: '个人中心', isHidden: true, tabClosable: true, icon: 'UserFilled' },
        component: () => import(/* webpackChunkName: "userCenter" */ '@/views/user/userCenter.vue')
      },
      {
        path: '/modifyUserOtherInfos',
        name: 'modifyUserOtherInfos',
        meta: { title: '学术档案', isHidden: true, tabClosable: true, icon: 'Document' },
        component: () => import(/* webpackChunkName: "modifyUserInfos" */ '@/views/user/modifyUserOtherInfos.vue')
      }
    ]
  },

  // 内容管理
  {
    path: '/contentManage',
    name: 'contentManage',
    meta: { title: '内容管理', tabClosable: true, icon: 'Document' },
    children: [
      {
        path: '/noticeManage',
        name: 'noticeManage',
        meta: { title: '通知管理', tabClosable: true, icon: 'Bell' },
        component: () => import(/* webpackChunkName: "noticeManage" */ '@/views/notice/noticeManage.vue')
      },
      {
        path: '/labProfileManage',
        name: 'labProfileManage',
        meta: { title: '简介管理', tabClosable: true, icon: 'Memo' },
        component: () => import(/* webpackChunkName: "labProfileManage" */ '@/views/labProfile/labProfileManage.vue')
      },
      {
        path: '/dynamicManage',
        name: 'dynamicManage',
        meta: { title: '动态管理', tabClosable: true, icon: 'Notification' },
        component: () => import(/* webpackChunkName: "dynamicManage" */ '@/views/dynamic/dynamicManage.vue')
      },
      // 隐藏路由
      {
        path: '/modifyNotice',
        name: 'modifyNotice',
        meta: { title: '编辑通知', isHidden: true, tabClosable: true, icon: 'EditPen' },
        component: () => import(/* webpackChunkName: "modifyNoticeInfos" */ '@/views/notice/modifyNoticeInfos.vue')
      },
      {
        path: '/noticeDetail',
        name: 'noticeDetail',
        meta: { title: '通知详情', isHidden: true, tabClosable: true, icon: 'View' },
        component: () => import(/* webpackChunkName: "noticeDetail" */ '@/views/notice/noticeDetail.vue')
      },
      {
        path: '/modifyLabProfile',
        name: 'modifyLabProfile',
        meta: { title: '编辑简介', isHidden: true, tabClosable: true, icon: 'EditPen' },
        component: () => import(/* webpackChunkName: "modifyLabProfileInfos" */ '@/views/labProfile/modifyLabProfileInfos.vue')
      },
      {
        path: '/labProfileDetail',
        name: 'labProfileDetail',
        meta: { title: '简介详情', isHidden: true, tabClosable: true, icon: 'View' },
        component: () => import(/* webpackChunkName: "labProfileDetail" */ '@/views/labProfile/labProfileDetail.vue')
      },
      {
        path: '/modifyDynamic',
        name: 'modifyDynamic',
        meta: { title: '编辑动态', isHidden: true, tabClosable: true, icon: 'EditPen' },
        component: () => import(/* webpackChunkName: "modifyDynamic" */ '@/views/dynamic/modifyDynamic.vue')
      },
      {
        path: '/dynamicDetail',
        name: 'dynamicDetail',
        meta: { title: '动态详情', isHidden: true, tabClosable: true, icon: 'View' },
        component: () => import(/* webpackChunkName: "dynamicDetail" */ '@/views/dynamic/dynamicDetail.vue')
      }
    ]
  },

  // 科研成果相关路由
  {
    path: '/researchAchievements',
    name: 'researchAchievements',
    meta: { title: '科研成果', tabClosable: true, icon: 'Trophy' },
    children: [
      // 论文管理相关路由
      {
        path: '/paperManage',
        name: 'paperManage',
        meta: { title: '论文管理', tabClosable: true, icon: 'Document' },
        component: () => import(/* webpackChunkName: "paperManage" */ '@/views/paper/paperManage.vue')
      },
      {
        path: '/modifyPaperInfos',
        name: 'modifyPaperInfos',
        meta: { title: '编辑论文', isHidden: true, tabClosable: true, icon: 'EditPen' },
        component: () => import(/* webpackChunkName: "modifyPaperInfos" */ '@/views/paper/modifyPaperInfos.vue')
      },
      {
        path: '/paperDetail',
        name: 'paperDetail',
        meta: { title: '论文详情', isHidden: true, tabClosable: true, icon: 'View' },
        component: () => import(/* webpackChunkName: "paperDetail" */ '@/views/paper/paperDetail.vue')
      },
      // 专利管理相关路由
      {
        path: '/patentManage',
        name: 'patentManage',
        meta: { title: '专利管理', tabClosable: true, icon: 'Medal' },
        component: () => import(/* webpackChunkName: "patentManage" */ '@/views/patent/patentManage.vue')
      },
      {
        path: '/modifyPatentInfos',
        name: 'modifyPatentInfos',
        meta: { title: '编辑专利', isHidden: true, tabClosable: true, icon: 'EditPen' },
        component: () => import(/* webpackChunkName: "modifyPatentInfos" */ '@/views/patent/modifyPatentInfos.vue')
      },
      {
        path: '/patentDetail',
        name: 'patentDetail',
        meta: { title: '专利详情', isHidden: true, tabClosable: true, icon: 'View' },
        component: () => import(/* webpackChunkName: "patentDetail" */ '@/views/patent/patentDetail.vue')
      },
      // 著作管理相关路由
      {
        path: '/bookManage',
        name: 'bookManage',
        meta: { title: '著作管理', tabClosable: true, icon: 'Reading' },
        component: () => import(/* webpackChunkName: "bookManage" */ '@/views/book/bookManage.vue')
      },
      {
        path: '/modifyBookInfos',
        name: 'modifyBookInfos',
        meta: { title: '编辑著作', isHidden: true, tabClosable: true, icon: 'EditPen' },
        component: () => import(/* webpackChunkName: "modifyBookInfos" */ '@/views/book/modifyBookInfos.vue')
      },
      {
        path: '/bookDetail',
        name: 'bookDetail',
        meta: { title: '著作详情', isHidden: true, tabClosable: true, icon: 'View' },
        component: () => import(/* webpackChunkName: "bookDetail" */ '@/views/book/bookDetail.vue')
      }
    ]
  },

  // 资源管理
  {
    path: '/resourceManage',
    name: 'resourceManage',
    meta: { title: '资源管理', tabClosable: true, icon: 'Box' },
    children: [
      {
        path: '/recruitManage',
        name: 'recruitManage',
        meta: { title: '招聘信息管理', tabClosable: true, icon: 'UserFilled' },
        component: () => import(/* webpackChunkName: "recruitManage" */ '@/views/recruit/recruitManage.vue')
      },
      {
        path: '/instrumentManage',
        name: 'instrumentManage',
        meta: { title: '仪器管理', tabClosable: true, icon: 'Suitcase' },
        component: () => import(/* webpackChunkName: "instrumentManage" */ '@/views/instrument/instrumentManage.vue')
      },
      {
        path: '/toolManage',
        name: 'toolManage',
        meta: { title: '开源工具管理', tabClosable: true, icon: 'Tools' },
        component: () => import(/* webpackChunkName: "toolManage" */ '@/views/tool/toolManage.vue')
      },
      // 隐藏路由
      {
        path: '/modifyRecruitInfo',
        name: 'modifyRecruitInfo',
        meta: { title: '编辑招聘信息', isHidden: true, tabClosable: true, icon: 'EditPen' },
        component: () => import(/* webpackChunkName: "modifyRecruitInfo" */ '@/views/recruit/modifyRecruitInfo.vue')
      },
      {
        path: '/recruitInfoDetail',
        name: 'recruitInfoDetail',
        meta: { title: '招聘信息详情', isHidden: true, tabClosable: true, icon: 'View' },
        component: () => import(/* webpackChunkName: "recruitInfoDetail" */ '@/views/recruit/recruitInfoDetail.vue')
      },
      {
        path: '/modifyInstrumentInfos',
        name: 'modifyInstrumentInfos',
        meta: { title: '编辑仪器', isHidden: true, tabClosable: true, icon: 'EditPen' },
        component: () => import(/* webpackChunkName: "modifyInstrumentInfos" */ '@/views/instrument/modifyInstrumentInfos.vue')
      },
      {
        path: '/instrumentDetail',
        name: 'instrumentDetail',
        meta: { title: '仪器详情', isHidden: true, tabClosable: true, icon: 'View' },
        component: () => import(/* webpackChunkName: "instrumentDetail" */ '@/views/instrument/instrumentDetail.vue')
      },
      {
        path: '/modifyToolInfos',
        name: 'modifyToolInfos',
        meta: { title: '编辑工具', isHidden: true, tabClosable: true, icon: 'EditPen' },
        component: () => import(/* webpackChunkName: "modifyToolInfos" */ '@/views/tool/modifyToolInfos.vue')
      },
      {
        path: '/toolDetail',
        name: 'toolDetail',
        meta: { title: '工具详情', isHidden: true, tabClosable: true, icon: 'View' },
        component: () => import(/* webpackChunkName: "toolDetail" */ '@/views/tool/toolDetail.vue')
      }
    ]
  }
]
