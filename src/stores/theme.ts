import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'

// 定义主题类型
export type ThemeType = 'dark' | 'blue' | 'light' | 'green' | 'purple' | 'orange' | 'red' | 'pink' | 'teal'

// 主题配置
interface ThemeConfig {
  headerBgColor: string
  menuBgColor: string
  menuBgColorS: string
  menuTextColor: string
  menuActiveTextColor: string
  logoTextColor: string
  bgColor: string
  textActiveColor: string
  primaryColor: string
  borderActiveColor: string
  menuBgGradient: string // 菜单背景渐变
  headerBgGradient: string // 顶部背景渐变
}

// 主题配置映射
const themeConfigs: Record<ThemeType, ThemeConfig> = {
  // 暗色主题（深蓝色调）
  dark: {
    headerBgColor: '#2c3e50',
    menuBgColor: '#2c3e50',
    menuBgColorS: '#34495e',
    menuTextColor: '#d1dbe5',
    menuActiveTextColor: '#409eff',
    logoTextColor: '#ffffff',
    bgColor: '#f5f7fa',
    textActiveColor: '#409eff',
    primaryColor: '#409eff',
    borderActiveColor: '#409eff',
    headerBgGradient: 'linear-gradient(135deg, #34495e 0%, #2c3e50 50%, #243342 100%)',
    menuBgGradient: 'linear-gradient(180deg, #34495e 0%, #2c3e50 50%, #243342 100%)'
  },
  // 蓝色主题 - 调整为更明亮的蓝色
  blue: {
    headerBgColor: '#4dabff',
    menuBgColor: '#4dabff',
    menuBgColorS: '#6cbcff',
    menuTextColor: '#ffffff',
    menuActiveTextColor: '#e6f7ff',
    logoTextColor: '#ffffff',
    bgColor: '#f5f7fa',
    textActiveColor: '#4dabff',
    primaryColor: '#4dabff',
    borderActiveColor: '#4dabff',
    headerBgGradient: 'linear-gradient(135deg, #6cbcff 0%, #4dabff 50%, #2d96ff 100%)',
    menuBgGradient: 'linear-gradient(180deg, #6cbcff 0%, #4dabff 50%, #2d96ff 100%)'
  },
  // 绿色主题 - 调整为更柔和的绿色
  green: {
    headerBgColor: '#7dd87d',
    menuBgColor: '#7dd87d',
    menuBgColorS: '#9de49d',
    menuTextColor: '#004d00', // 深绿色文本，与浅绿背景形成对比
    menuActiveTextColor: '#ffffff', // 白色激活文本
    logoTextColor: '#ffffff',
    bgColor: '#f5f7fa',
    textActiveColor: '#66c266',
    primaryColor: '#66c266',
    borderActiveColor: '#66c266',
    headerBgGradient: 'linear-gradient(135deg, #9de49d 0%, #7dd87d 50%, #66c266 100%)',
    menuBgGradient: 'linear-gradient(180deg, #9de49d 0%, #7dd87d 50%, #5cb85c 100%)'
  },
  // 紫色主题
  purple: {
    headerBgColor: '#b39ddb',
    menuBgColor: '#b39ddb',
    menuBgColorS: '#c5b3e6',
    menuTextColor: '#311b92', // 深紫色文本
    menuActiveTextColor: '#ffffff', // 白色激活文本
    logoTextColor: '#ffffff',
    bgColor: '#f5f7fa',
    textActiveColor: '#7e57c2',
    primaryColor: '#7e57c2',
    borderActiveColor: '#7e57c2',
    headerBgGradient: 'linear-gradient(135deg, #d1c4e9 0%, #b39ddb 50%, #7e57c2 100%)',
    menuBgGradient: 'linear-gradient(180deg, #c5b3e6 0%, #b39ddb 50%, #673ab7 100%)'
  },
  // 橙色主题 - 调整为更明亮的橙色
  orange: {
    headerBgColor: '#ffb74d',
    menuBgColor: '#ffb74d',
    menuBgColorS: '#ffc87a',
    menuTextColor: '#7a4500', // 调整为不那么深的棕色文本
    menuActiveTextColor: '#ffffff', // 白色激活文本
    logoTextColor: '#ffffff',
    bgColor: '#f5f7fa',
    textActiveColor: '#ffa726',
    primaryColor: '#ffa726',
    borderActiveColor: '#ffa726',
    headerBgGradient: 'linear-gradient(135deg, #ffd59a 0%, #ffb74d 50%, #ffa726 100%)',
    menuBgGradient: 'linear-gradient(180deg, #ffd59a 0%, #ffb74d 50%, #ff9800 100%)'
  },
  // 红色主题 - 调整为更柔和的红色
  red: {
    headerBgColor: '#ff8a80',
    menuBgColor: '#ff8a80',
    menuBgColorS: '#ffaba3',
    menuTextColor: '#7f0000', // 调整为不那么深的红色文本
    menuActiveTextColor: '#ffffff', // 白色激活文本
    logoTextColor: '#ffffff',
    bgColor: '#f5f7fa',
    textActiveColor: '#ff5252',
    primaryColor: '#ff5252',
    borderActiveColor: '#ff5252',
    headerBgGradient: 'linear-gradient(135deg, #ffbcaf 0%, #ff8a80 50%, #ff5252 100%)',
    menuBgGradient: 'linear-gradient(180deg, #ffbcaf 0%, #ff8a80 50%, #ff5252 100%)'
  },
  // 粉色主题 - 调整为更明亮的粉色
  pink: {
    headerBgColor: '#f8a5c2',
    menuBgColor: '#f8a5c2',
    menuBgColorS: '#fbbdd2',
    menuTextColor: '#a31545', // 调整为不那么深的粉色文本
    menuActiveTextColor: '#ffffff', // 白色激活文本
    logoTextColor: '#ffffff',
    bgColor: '#f5f7fa',
    textActiveColor: '#f06292',
    primaryColor: '#f06292',
    borderActiveColor: '#f06292',
    headerBgGradient: 'linear-gradient(135deg, #fccde2 0%, #f8a5c2 50%, #f06292 100%)',
    menuBgGradient: 'linear-gradient(180deg, #fccde2 0%, #f8a5c2 50%, #f06292 100%)'
  },
  // 海蓝主题
  teal: {
    headerBgColor: '#4db6ac',
    menuBgColor: '#4db6ac',
    menuBgColorS: '#5fc8be',
    menuTextColor: '#003833', // 深青色文本
    menuActiveTextColor: '#ffffff', // 白色激活文本
    logoTextColor: '#ffffff',
    bgColor: '#f5f7fa',
    textActiveColor: '#009688',
    primaryColor: '#009688',
    borderActiveColor: '#009688',
    headerBgGradient: 'linear-gradient(135deg, #80cbc4 0%, #4db6ac 50%, #00897b 100%)',
    menuBgGradient: 'linear-gradient(180deg, #80cbc4 0%, #4db6ac 50%, #00695c 100%)'
  },
  // 浅色主题
  light: {
    headerBgColor: '#e1e6ef',
    menuBgColor: '#e1e6ef',
    menuBgColorS: '#d1d8e6',
    menuTextColor: '#2c3e50',
    menuActiveTextColor: '#1976d2',
    logoTextColor: '#2c3e50',
    bgColor: '#f5f7fa',
    textActiveColor: '#1976d2',
    primaryColor: '#1976d2',
    borderActiveColor: '#1976d2',
    headerBgGradient: 'linear-gradient(135deg, #f5f7fa 0%, #e1e6ef 50%, #c5cad8 100%)',
    menuBgGradient: 'linear-gradient(180deg, #eceff1 0%, #dde4eb 50%, #b0bec5 100%)'
  }
}

// 本地存储键名
const THEME_STORAGE_KEY = 'edu-manage-theme'

// 从localStorage获取保存的主题类型，默认为dark
const getSavedTheme = (): ThemeType => {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      if (parsed && ['dark', 'blue', 'light', 'green', 'purple', 'orange', 'red', 'pink', 'teal'].includes(parsed)) {
        return parsed as ThemeType
      }
    }
  } catch (e) {
    console.error('Failed to parse saved theme', e)
  }
  return 'dark'
}

// 创建主题Store
export const useThemeStore = defineStore('theme', () => {
  // 当前主题类型
  const currentTheme = ref<ThemeType>(getSavedTheme())

  // 当前主题配置
  const themeConfig = reactive<ThemeConfig>({ ...themeConfigs[currentTheme.value] })

  // 应用主题到CSS变量
  const applyTheme = (theme: ThemeType) => {
    const config = themeConfigs[theme]
    const root = document.documentElement

    // 将主题配置应用到CSS变量
    Object.entries(config).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value)
    })

    // 更新响应式主题配置对象
    Object.assign(themeConfig, config)

    // 保存到localStorage
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(theme))
  }

  // 切换主题
  const changeTheme = (theme: ThemeType) => {
    currentTheme.value = theme
    applyTheme(theme)
  }

  // 初始化主题
  const initTheme = () => {
    applyTheme(currentTheme.value)
  }

  return {
    currentTheme,
    themeConfig,
    changeTheme,
    initTheme
  }
})
