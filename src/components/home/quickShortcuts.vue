<template>
  <el-card class="shortcuts-card">
    <template #header>
      <div class="card-header">
        <div class="header-title">
          <el-icon><Menu /></el-icon>
          <span>快捷入口</span>
        </div>
      </div>
    </template>
    <div class="shortcuts-grid">
      <div
        v-for="(shortcut, index) in shortcuts"
        :key="index"
        class="shortcut-item"
        @click="navigateTo(shortcut.path)"
      >
        <div class="shortcut-icon-wrapper">
          <el-icon class="shortcut-icon">
            <component :is="shortcut.icon" />
          </el-icon>
        </div>
        <span class="shortcut-name">{{ shortcut.name }}</span>
      </div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserInfoStore } from '@/stores/userInfo'
import { Menu } from '@element-plus/icons-vue'

const router = useRouter()
const userInfoStore = useUserInfoStore()

// 获取管理员权限状态
const isAdmin = userInfoStore.isAdmin

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

// 导航到指定路径
const navigateTo = (path: string) => {
  router.push(path)
}
</script>

<style scoped lang="less">
.shortcuts-card {
  height: 100%;
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  overflow: hidden;

  :deep(.el-card__header) {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 16px 20px;
    border-bottom: none;

    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;

      .header-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 600;
        font-size: 16px;

        .el-icon {
          font-size: 18px;
        }
      }
    }
  }

  :deep(.el-card__body) {
    padding: 20px;
  }

  .shortcuts-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    gap: 16px;
    max-width: 100%;

    .shortcut-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 20px 12px;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.3s ease;
      background: #f8f9ff;
      border: 2px solid transparent;
      position: relative;
      overflow: hidden;

      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(135deg, var(--el-color-primary) 0%, var(--el-color-primary-light-3) 100%);
        opacity: 0;
        transition: opacity 0.3s ease;
        z-index: 0;
      }

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(var(--el-color-primary-rgb), 0.2);
        border-color: var(--el-color-primary-light-5);

        &::before {
          opacity: 0.1;
        }

        .shortcut-icon-wrapper {
          transform: scale(1.1);

          .shortcut-icon {
            color: var(--el-color-primary);
          }
        }

        .shortcut-name {
          color: var(--el-color-primary);
          font-weight: 600;
        }
      }

      .shortcut-icon-wrapper {
        position: relative;
        z-index: 1;
        margin-bottom: 8px;
        transition: transform 0.3s ease;

        .shortcut-icon {
          font-size: 28px;
          color: #6b7280;
          transition: all 0.3s ease;
        }
      }

      .shortcut-name {
        position: relative;
        z-index: 1;
        font-size: 14px;
        font-weight: 500;
        color: #374151;
        text-align: center;
        transition: all 0.3s ease;
        line-height: 1.2;
      }
    }
  }

  // 响应式设计
  @media (max-width: 768px) {
    .shortcuts-grid {
      grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
      gap: 12px;

      .shortcut-item {
        padding: 16px 8px;

        .shortcut-icon-wrapper .shortcut-icon {
          font-size: 24px;
        }

        .shortcut-name {
          font-size: 12px;
        }
      }
    }
  }
}
</style>
