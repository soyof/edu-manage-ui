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
  // 蓝色主题
  blue: {
    headerBgColor: '#1890ff',
    menuBgColor: '#1890ff',
    menuBgColorS: '#40a9ff',
    menuTextColor: '#ffffff',
    menuActiveTextColor: '#e6f7ff',
    logoTextColor: '#ffffff',
    bgColor: '#f5f7fa',
    textActiveColor: '#1890ff',
    primaryColor: '#1890ff',
    borderActiveColor: '#1890ff',
    headerBgGradient: 'linear-gradient(135deg, #40a9ff 0%, #1890ff 50%, #0960d0 100%)',
    menuBgGradient: 'linear-gradient(180deg, #40a9ff 0%, #1890ff 50%, #096dd9 100%)'
  },
  // 绿色主题
  green: {
    headerBgColor: '#81c784',
    menuBgColor: '#81c784',
    menuBgColorS: '#a5d6a7',
    menuTextColor: '#003d00', // 深绿色文本，与浅绿背景形成强烈对比
    menuActiveTextColor: '#ffffff', // 白色激活文本
    logoTextColor: '#ffffff',
    bgColor: '#f5f7fa',
    textActiveColor: '#4caf50',
    primaryColor: '#4caf50',
    borderActiveColor: '#4caf50',
    headerBgGradient: 'linear-gradient(135deg, #a5d6a7 0%, #81c784 50%, #4caf50 100%)',
    menuBgGradient: 'linear-gradient(180deg, #a5d6a7 0%, #81c784 50%, #43a047 100%)'
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
  // 橙色主题
  orange: {
    headerBgColor: '#ffb74d',
    menuBgColor: '#ffb74d',
    menuBgColorS: '#ffcc80',
    menuTextColor: '#663c00', // 深棕色文本
    menuActiveTextColor: '#ffffff', // 白色激活文本
    logoTextColor: '#ffffff',
    bgColor: '#f5f7fa',
    textActiveColor: '#ff9800',
    primaryColor: '#ff9800',
    borderActiveColor: '#ff9800',
    headerBgGradient: 'linear-gradient(135deg, #ffcc80 0%, #ffb74d 50%, #ff9800 100%)',
    menuBgGradient: 'linear-gradient(180deg, #ffcc80 0%, #ffb74d 50%, #ef6c00 100%)'
  },
  // 红色主题
  red: {
    headerBgColor: '#e57373',
    menuBgColor: '#e57373',
    menuBgColorS: '#ef9a9a',
    menuTextColor: '#5f0000', // 深红色文本
    menuActiveTextColor: '#ffffff', // 白色激活文本
    logoTextColor: '#ffffff',
    bgColor: '#f5f7fa',
    textActiveColor: '#d32f2f',
    primaryColor: '#d32f2f',
    borderActiveColor: '#d32f2f',
    headerBgGradient: 'linear-gradient(135deg, #ef9a9a 0%, #e57373 50%, #c62828 100%)',
    menuBgGradient: 'linear-gradient(180deg, #ef9a9a 0%, #e57373 50%, #b71c1c 100%)'
  },
  // 粉色主题
  pink: {
    headerBgColor: '#f48fb1',
    menuBgColor: '#f48fb1',
    menuBgColorS: '#f8bbd0',
    menuTextColor: '#880e4f', // 深粉色文本
    menuActiveTextColor: '#ffffff', // 白色激活文本
    logoTextColor: '#ffffff',
    bgColor: '#f5f7fa',
    textActiveColor: '#ec407a',
    primaryColor: '#ec407a',
    borderActiveColor: '#ec407a',
    headerBgGradient: 'linear-gradient(135deg, #f8bbd0 0%, #f48fb1 50%, #ec407a 100%)',
    menuBgGradient: 'linear-gradient(180deg, #f8bbd0 0%, #f48fb1 50%, #d81b60 100%)'
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
