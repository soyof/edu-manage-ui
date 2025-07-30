import { createApp } from 'vue'
import 'normalize.css'
import './style.less'
import App from './App.vue'

import pinia from '@/stores'
import router from '@/router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import '@/styles/index.less'
import './assets/iconfont/iconfont.css'
import 'animate.css'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import { useTabsStore } from '@/stores/menuTabs'
import { useThemeStore } from './stores/theme'

// 创建应用实例
const app = createApp(App)
import { menuIconMap } from '@/utils/menuIcon'
for (const [key, component] of Object.entries(menuIconMap)) {
  app.component(key, component)
}

// 使用插件
app.use(pinia)
app.use(router)
app.use(ElementPlus, {
  locale: zhCn
})

// 初始化主题（在使用pinia之后）
const themeStore = useThemeStore()
themeStore.initTheme()

// 初始化标签页store，确保过滤掉登录页签
const tabsStore = useTabsStore()
tabsStore.initStore()

// 挂载应用
app.mount('#app')
