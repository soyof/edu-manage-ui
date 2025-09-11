<template>
  <div
    class="shortcuts-container animate__animated animate__fadeInUp"
    :style="{ height: `${containerHeight}px` }"
  >
    <div class="shortcuts-header animate__animated animate__fadeInDown">
      <el-icon class="header-icon"><Menu /></el-icon>
      <span class="header-title">快捷入口</span>
    </div>
    <div class="shortcuts-grid" :style="{ gridTemplateColumns: `repeat(${gridColumns}, 1fr)` }">
      <div
        v-for="(shortcut, index) in displayShortcuts"
        :key="index"
        class="shortcut-item animate__animated animate__fadeInUp"
        :style="{ animationDelay: `${index * 0.1}s` }"
        @click="navigateTo(shortcut.path)"
      >
        <div class="shortcut-icon">
          <el-icon>
            <component :is="shortcut.icon" />
          </el-icon>
        </div>
        <span class="shortcut-name">{{ shortcut.name }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserInfoStore } from '@/stores/userInfo'
import { Menu } from '@element-plus/icons-vue'

const router = useRouter()
const userInfoStore = useUserInfoStore()

// 获取管理员权限状态
const isAdmin = userInfoStore.isAdmin

// 窗口宽度响应式状态
const windowWidth = ref(0)

// 更新窗口宽度
const updateWindowWidth = () => {
  windowWidth.value = window.innerWidth
}

// 生命周期钩子
onMounted(() => {
  updateWindowWidth()
  window.addEventListener('resize', updateWindowWidth)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateWindowWidth)
})

// 所有快捷入口配置
const allShortcuts = [
  { name: '个人中心', icon: 'User', path: '/userCenter', roles: ['admin', 'user'] },
  { name: '论文管理', icon: 'Document', path: '/paperManage', roles: ['admin', 'user'] },
  { name: '专利管理', icon: 'Medal', path: '/patentManage', roles: ['admin', 'user'] },
  { name: '著作管理', icon: 'Reading', path: '/bookManage', roles: ['admin', 'user'] },
  { name: '通知管理', icon: 'Bell', path: '/noticeManage', roles: ['admin', 'user'] },
  { name: '仪器管理', icon: 'Suitcase', path: '/instrumentManage', roles: ['admin', 'user'] },
  { name: '用户管理', icon: 'UserFilled', path: '/userManage', roles: ['admin'] },
  { name: '招聘管理', icon: 'UserFilled', path: '/recruitManage', roles: ['admin', 'user'] },
  { name: '工具管理', icon: 'Tools', path: '/toolManage', roles: ['admin', 'user'] },
  { name: '简介管理', icon: 'InfoFilled', path: '/labProfileManage', roles: ['admin', 'user'] },
  { name: '动态管理', icon: 'Notification', path: '/dynamicManage', roles: ['admin', 'user'] }
]

// 根据权限过滤快捷入口
const shortcuts = computed(() => {
  const currentUserRole = userInfoStore.getUserInfo.value?.role || 'user'
  return allShortcuts.filter(shortcut => {
    if (!shortcut.roles || shortcut.roles.length === 0) return true
    return shortcut.roles.includes(currentUserRole) || (shortcut.roles.includes('admin') && isAdmin.value)
  })
})

// 显示所有可用的快捷入口
const displayShortcuts = computed(() => {
  return shortcuts.value // 显示所有快捷入口
})

// 计算网格列数，根据快捷入口数量和窗口宽度动态调整
const gridColumns = computed(() => {
  const width = windowWidth.value || window.innerWidth || 1200
  const itemCount = displayShortcuts.value.length

  // 根据窗口宽度动态计算最佳列数
  if (width <= 480) {
    return Math.min(3, itemCount) // 小屏手机：最多3列
  }
  if (width <= 768) {
    return Math.min(4, itemCount) // 平板：最多4列
  }
  if (width <= 1024) {
    return Math.min(5, itemCount) // 中等屏幕：最多5列
  }
  if (width <= 1400) {
    return Math.min(6, itemCount) // 大屏幕：最多6列
  }
  // 超大屏幕：根据项目数量智能调整
  return Math.min(Math.ceil(itemCount / 2), 7) // 最多7列，确保最多2行
})

// 计算网格行数
const gridRows = computed(() => {
  const cols = gridColumns.value
  return Math.ceil(displayShortcuts.value.length / cols)
})

// 动态计算容器高度
const containerHeight = computed(() => {
  const rows = gridRows.value
  const width = windowWidth.value || window.innerWidth || 1200

  // 根据屏幕大小调整参数
  let headerHeight = 52 // 头部高度
  let itemHeight = 60 // 每个项目的高度
  let padding = 24 // 上下padding
  let gap = 4 // 行间距

  if (width <= 480) {
    headerHeight = 45
    itemHeight = 50
    padding = 12
    gap = 2
  } else if (width <= 768) {
    headerHeight = 48
    itemHeight = 55
    padding = 16
    gap = 3
  }

  const totalGap = gap * (rows - 1)
  const calculatedHeight = headerHeight + (itemHeight * rows) + padding + totalGap

  return Math.max(200, calculatedHeight)
})

// 导航到指定路径
const navigateTo = (path: string) => {
  router.push(path)
}
</script>

<style scoped lang="less">
.shortcuts-container {
  background: var(--el-bg-color);
  border: none;
  border-radius: 16px;
  padding: 0;
  display: flex;
  flex-direction: column;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  overflow: hidden;

  &:hover {
    box-shadow: 0 12px 48px rgba(0, 0, 0, 0.12);
    transform: translateY(-2px);
  }

  .shortcuts-header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 16px 20px;
    background: linear-gradient(135deg,
      color-mix(in srgb, var(--el-color-primary) 10%, var(--el-bg-color)) 0%,
      color-mix(in srgb, var(--el-color-primary) 5%, var(--el-bg-color)) 100%);
    border-bottom: 1px solid color-mix(in srgb, var(--el-color-primary) 20%, var(--el-border-color-light));
    margin-bottom: 0;

    .header-icon {
      font-size: 16px;
      color: var(--el-color-primary);
    }

    .header-title {
      font-size: 14px;
      font-weight: 600;
      color: var(--el-color-primary);
    }
  }

  .shortcuts-grid {
    display: grid;
    gap: 4px;
    flex: 1;
    padding: 12px;

    .shortcut-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 6px 4px;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.3s ease;
      background: transparent;
      border: 1px solid transparent;
      height: 100%;
      text-align: center;
      min-height: 60px;

      &:hover {
        background: rgba(var(--el-color-primary-rgb), 0.1);
        border-color: rgba(var(--el-color-primary-rgb), 0.2);
        transform: translateY(-2px);

        .shortcut-icon {
          color: var(--el-color-primary);
          transform: scale(1.05);
        }

        .shortcut-name {
          color: var(--el-color-primary);
          font-weight: 600;
        }
      }

      &:active {
        transform: translateY(-1px) scale(0.98);
      }

      .shortcut-icon {
        font-size: 16px;
        color: #64748b;
        margin-bottom: 4px;
        transition: all 0.3s ease;
      }

      .shortcut-name {
        font-size: 11px;
        font-weight: 500;
        color: #374151;
        transition: all 0.3s ease;
        line-height: 1.1;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 100%;
      }
    }
  }

  // 响应式设计 - 简化版，主要靠JavaScript动态计算
  @media (max-width: 768px) {
    .shortcuts-header {
      padding: 10px 14px;

      .header-icon {
        font-size: 13px;
      }

      .header-title {
        font-size: 12px;
      }
    }

    .shortcuts-grid {
      gap: 3px;
      padding: 8px;

      .shortcut-item {
        padding: 4px 2px;
        min-height: 50px;

        .shortcut-icon {
          font-size: 13px;
          margin-bottom: 2px;
        }

        .shortcut-name {
          font-size: 9px;
        }
      }
    }
  }

  @media (max-width: 480px) {
    .shortcuts-header {
      padding: 8px 12px;

      .header-icon {
        font-size: 12px;
      }

      .header-title {
        font-size: 11px;
      }
    }

    .shortcuts-grid {
      gap: 2px;
      padding: 6px;

      .shortcut-item {
        padding: 3px 2px;
        border-radius: 4px;
        min-height: 45px;

        .shortcut-icon {
          font-size: 12px;
          margin-bottom: 1px;
        }

        .shortcut-name {
          font-size: 8px;
          line-height: 1.0;
        }

        &:hover {
          transform: translateY(-1px) scale(1.01);
        }
      }
    }
  }
}
</style>
