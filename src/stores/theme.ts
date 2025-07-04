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
  menuBgGradient?: string // 菜单背景渐变
}

// 主题配置映射
const themeConfigs: Record<ThemeType, ThemeConfig> = {
  // 暗色主题（深蓝黑色调）
  dark: {
    headerBgColor: '#1d2935',
    menuBgColor: '#1d2935',
    menuBgColorS: '#263445',
    menuTextColor: '#bfcbd9',
    menuActiveTextColor: '#409eff',
    logoTextColor: '#f0f2f5',
    bgColor: '#f5f7fa',
    textActiveColor: '#409eff',
    primaryColor: '#409eff',
    borderActiveColor: '#409eff'
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
    menuBgGradient: 'linear-gradient(to bottom, #1890ff, #096dd9)'
  },
  // 绿色主题
  green: {
    headerBgColor: '#81c784',
    menuBgColor: '#81c784',
    menuBgColorS: '#a5d6a7',
    menuTextColor: '#f0f9f4',
    menuActiveTextColor: '#c6ffe0',
    logoTextColor: '#ffffff',
    bgColor: '#f5f7fa',
    textActiveColor: '#4caf50',
    primaryColor: '#4caf50',
    borderActiveColor: '#4caf50'
  },
  // 紫色主题
  purple: {
    headerBgColor: '#b39ddb',
    menuBgColor: '#b39ddb',
    menuBgColorS: '#c5b3e6',
    menuTextColor: '#f5f0ff',
    menuActiveTextColor: '#d7c8ff',
    logoTextColor: '#ffffff',
    bgColor: '#f5f7fa',
    textActiveColor: '#7e57c2',
    primaryColor: '#7e57c2',
    borderActiveColor: '#7e57c2'
  },
  // 橙色主题
  orange: {
    headerBgColor: '#ffb74d',
    menuBgColor: '#ffb74d',
    menuBgColorS: '#ffcc80',
    menuTextColor: '#fff8f0',
    menuActiveTextColor: '#ffe0b2',
    logoTextColor: '#ffffff',
    bgColor: '#f5f7fa',
    textActiveColor: '#ff9800',
    primaryColor: '#ff9800',
    borderActiveColor: '#ff9800'
  },
  // 红色主题
  red: {
    headerBgColor: '#e57373',
    menuBgColor: '#e57373',
    menuBgColorS: '#ef9a9a',
    menuTextColor: '#fff8f8',
    menuActiveTextColor: '#ffebee',
    logoTextColor: '#ffffff',
    bgColor: '#f5f7fa',
    textActiveColor: '#d32f2f',
    primaryColor: '#d32f2f',
    borderActiveColor: '#d32f2f'
  },
  // 粉色主题
  pink: {
    headerBgColor: '#f48fb1',
    menuBgColor: '#f48fb1',
    menuBgColorS: '#f8bbd0',
    menuTextColor: '#fff5fa',
    menuActiveTextColor: '#ffd6e7',
    logoTextColor: '#ffffff',
    bgColor: '#f5f7fa',
    textActiveColor: '#ec407a',
    primaryColor: '#ec407a',
    borderActiveColor: '#ec407a'
  },
  // 海蓝主题
  teal: {
    headerBgColor: '#4db6ac',
    menuBgColor: '#4db6ac',
    menuBgColorS: '#5fc8be',
    menuTextColor: '#e0f7f5',
    menuActiveTextColor: '#b2dfdb',
    logoTextColor: '#ffffff',
    bgColor: '#f5f7fa',
    textActiveColor: '#009688',
    primaryColor: '#009688',
    borderActiveColor: '#009688'
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
    borderActiveColor: '#1976d2'
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

    console.log('Theme applied:', theme, config)
  }

  // 切换主题
  const changeTheme = (theme: ThemeType) => {
    currentTheme.value = theme
    applyTheme(theme)
  }

  // 初始化主题
  const initTheme = () => {
    console.log('Initializing theme:', currentTheme.value)
    applyTheme(currentTheme.value)
  }

  return {
    currentTheme,
    themeConfig,
    changeTheme,
    initTheme
  }
})
