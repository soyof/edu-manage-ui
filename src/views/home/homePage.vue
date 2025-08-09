<template>
  <div class="home-container">
    <!-- 欢迎区域 -->
    <div class="welcome-section animate__animated animate__fadeInDown">
      <div class="welcome-content">
        <h1 class="welcome-title">欢迎来到合成生物学研究所</h1>
        <p class="welcome-subtitle">科研管理 · 学术协作 · 资源共享</p>
        <div class="welcome-stats">
          <span class="time-info">{{ currentTime }}</span>
        </div>
      </div>
      <div class="welcome-decoration">
        <div class="decoration-circle"></div>
        <div class="decoration-dots"></div>
      </div>
    </div>

    <!-- 数据统计组件 -->
    <DashboardStats />

    <!-- 埋点分析组件 -->
    <AnalyticsStats v-if="isAdmin" />

    <!-- 主要内容区域 -->
    <div class="main-content animate__animated animate__fadeIn" style="animation-delay: 0.4s;">
      <el-row :gutter="24">
        <!-- 快捷入口 -->
        <el-col :span="24">
          <QuickShortcuts />
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import DashboardStats from '@/components/dashboard/dashboardStats.vue'
import { AnalyticsStats } from '@/components/analytics'
import { QuickShortcuts } from '@/components/home'
import { useUserInfoStore } from '@/stores/userInfo'

// 当前时间
const currentTime = ref('')
const userInfoStore = useUserInfoStore()
const isAdmin = computed(() => userInfoStore.userInfo?.role === 'admin')

// 更新时间
const updateCurrentTime = () => {
  currentTime.value = new Date().toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

onMounted(() => {
  updateCurrentTime()
  // 每秒更新时间
  setInterval(updateCurrentTime, 1000)
})
</script>

<style scoped lang="less">
// 动画关键帧
@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
}

@keyframes pulse {
  0% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.05); opacity: 1; }
  100% { transform: scale(1); opacity: 0.8; }
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.home-container {
  padding: 20px;
  background-color: @pageBgColor;
  min-height: @contentHeight;

  // 欢迎区域
  .welcome-section {
    position: relative;
    background: linear-gradient(135deg,
      color-mix(in srgb, var(--el-color-primary) 15%, white) 0%,
      color-mix(in srgb, var(--el-color-primary) 5%, white) 100%);
    border-radius: 16px;
    padding: 35px 40px;
    margin-bottom: 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    overflow: hidden;
    box-shadow: 0 6px 30px rgba(0, 0, 0, 0.08);
    transition: all 0.3s ease;

    &:hover {
      box-shadow: 0 8px 40px rgba(0, 0, 0, 0.12);
      transform: translateY(-2px);
    }

    .welcome-content {
      position: relative;
      z-index: 2;

      .welcome-title {
        font-size: 28px;
        font-weight: 700;
        background: linear-gradient(135deg, var(--el-color-primary), #409eff);
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
        margin: 0 0 12px 0;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .welcome-subtitle {
        font-size: 16px;
        color: var(--el-text-color-secondary);
        margin: 0 0 15px 0;
        letter-spacing: 1px;
      }

      .welcome-stats {
        display: flex;
        gap: 20px;
        margin-top: 10px;

        .time-info, .login-info {
          font-size: 14px;
          color: var(--el-text-color-regular);
          padding: 6px 12px;
          background: rgba(255, 255, 255, 0.7);
          border-radius: 20px;
          backdrop-filter: blur(10px);
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
        width: 120px;
        height: 120px;
        border-radius: 50%;
        background: radial-gradient(circle,
          rgba(var(--el-color-primary-rgb), 0.2) 0%,
          rgba(var(--el-color-primary-rgb), 0.05) 70%);
        animation: pulse 4s ease-in-out infinite;
      }

      .decoration-dots {
        position: absolute;
        width: 200px;
        height: 200px;
        right: -40px;
        opacity: 0.4;
        background-image: radial-gradient(var(--el-color-primary) 1px, transparent 1px);
        background-size: 12px 12px;
      }
    }
  }

  // 主要内容区域
  .main-content {
    // 为快捷入口组件预留样式空间
    position: relative;
  }
}
</style>
