<template>
  <div class="welcome-section">
    <div class="welcome-content">
      <h1 class="welcome-title">欢迎来到合成生物学研究所</h1>
      <p class="welcome-subtitle">科研管理 · 学术协作 · 资源共享</p>
      <div class="welcome-stats">
        <div class="stat-item">
          <el-icon class="stat-icon"><User /></el-icon>
          <span class="stat-text">{{ userGreeting }}</span>
        </div>
        <div class="stat-item">
          <el-icon class="stat-icon"><Clock /></el-icon>
          <span class="stat-text">{{ currentTime }}</span>
        </div>
      </div>
    </div>
    <div class="welcome-decoration">
      <div class="decoration-circle"></div>
      <div class="decoration-dots"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useUserInfoStore } from '@/stores/userInfo'
import { Clock, User } from '@element-plus/icons-vue'

// 当前时间
const currentTime = ref('')
const userInfoStore = useUserInfoStore()

// 用户问候语
const userGreeting = computed(() => {
  const hour = new Date().getHours()
  const userName = userInfoStore.userInfo?.username || '用户'

  if (hour < 6) return `夜深了，${userName}`
  if (hour < 12) return `早上好，${userName}`
  if (hour < 14) return `中午好，${userName}`
  if (hour < 18) return `下午好，${userName}`
  if (hour < 22) return `晚上好，${userName}`
  return `夜深了，${userName}`
})

// 更新时间
const updateCurrentTime = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')

  currentTime.value = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

onMounted(() => {
  updateCurrentTime()
  // 每秒更新时间
  setInterval(updateCurrentTime, 1000)
})
</script>

<style scoped lang="less">
// 动画关键帧
@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.05); opacity: 1; }
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-6px); }
}

@keyframes slideIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.welcome-section {
  position: relative;
  background: linear-gradient(135deg,
    color-mix(in srgb, var(--el-color-primary) 15%, white) 0%,
    color-mix(in srgb, var(--el-color-primary) 5%, white) 100%);
  border-radius: 12px;
  padding: 20px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
  height: 200px;

  &:hover {
    box-shadow: 0 8px 40px rgba(0, 0, 0, 0.12);
    transform: translateY(-2px);
  }

  .welcome-content {
    position: relative;
    z-index: 2;
    width: 100%;

    .welcome-title {
      font-size: 24px;
      font-weight: 700;
      background: linear-gradient(135deg, var(--el-color-primary), #409eff);
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
      margin: 0 0 8px 0;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      animation: slideIn 0.6s ease-out;
    }

    .welcome-subtitle {
      font-size: 14px;
      color: var(--el-text-color-secondary);
      margin: 0 0 12px 0;
      letter-spacing: 0.5px;
      animation: slideIn 0.6s ease-out 0.2s both;
    }

    .welcome-stats {
      display: flex;
      gap: 20px;
      margin-top: 8px;
      animation: slideIn 0.6s ease-out 0.4s both;

      .stat-item {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 13px;
        color: var(--el-text-color-regular);
        padding: 4px 8px;
        background: rgba(255, 255, 255, 0.7);
        border-radius: 12px;
        backdrop-filter: blur(10px);
        transition: all 0.3s ease;

        &:hover {
          background: rgba(255, 255, 255, 0.9);
          transform: translateY(-1px);
        }

        .stat-icon {
          font-size: 14px;
          color: var(--el-color-primary);
        }

        .stat-text {
          font-weight: 500;
        }
      }
    }
  }

  .welcome-decoration {
    position: absolute;
    right: 40px;
    top: 0;
    height: 100%;
    display: flex;
    align-items: center;
    z-index: 1;

    .decoration-circle {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: radial-gradient(circle,
        rgba(var(--el-color-primary-rgb), 0.15) 0%,
        rgba(var(--el-color-primary-rgb), 0.03) 70%);
      animation: pulse 4s ease-in-out infinite;
    }

    .decoration-dots {
      position: absolute;
      width: 100px;
      height: 100px;
      right: -20px;
      opacity: 0.2;
      background-image: radial-gradient(var(--el-color-primary) 1px, transparent 1px);
      background-size: 8px 8px;
    }
  }

  // 响应式设计
  @media (max-width: 768px) {
    padding: 16px 12px;
    height: 100px;

    .welcome-content {
      .welcome-title {
        font-size: 20px;
      }

      .welcome-subtitle {
        font-size: 13px;
      }

      .welcome-stats {
        gap: 12px;

        .stat-item {
          font-size: 12px;
          padding: 3px 6px;
        }
      }
    }

    .welcome-decoration {
      .decoration-circle {
        width: 40px;
        height: 40px;
      }

      .decoration-dots {
        width: 60px;
        height: 60px;
        background-size: 6px 6px;
      }
    }
  }
}
</style>
