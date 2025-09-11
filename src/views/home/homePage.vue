<template>
  <div class="home-container">
    <!-- 顶部区域 -->
    <div class="top-section animate__animated animate__fadeInDown">
      <!-- 欢迎区域 -->
      <div class="welcome-section">
        <WelcomeSection />
      </div>
      <!-- 快捷入口区域 -->
      <div class="shortcuts-section">
        <QuickShortcuts />
      </div>
    </div>
    <!-- 埋点分析组件 -->
    <AnalyticsStats v-if="isAdmin" />

    <!-- 数据统计组件 -->
    <DashboardStats />

    <!-- 主要内容区域 -->
    <div class="main-content animate__animated animate__fadeIn" style="animation-delay: 0.4s;">
      <!-- 其他内容可以在这里添加 -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import DashboardStats from '@/components/dashboard/dashboardStats.vue'
import { AnalyticsStats } from '@/components/analytics'
import { QuickShortcuts, WelcomeSection } from '@/components/home'
import { useUserInfoStore } from '@/stores/userInfo'

const userInfoStore = useUserInfoStore()
const isAdmin = computed(() => userInfoStore.userInfo?.role === 'admin')
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

  // 顶部区域
  .top-section {
    display: flex;
    gap: 16px;
    margin-bottom: 16px;
    align-items: stretch;

    // 欢迎区域
    .welcome-section {
      flex: 1;
    }

    // 快捷入口区域
    .shortcuts-section {
      min-width: 480px;
      flex-shrink: 0;
    }
  }

  // 主要内容区域
  .main-content {
    position: relative;
  }

  @media (max-width: 1200px) {
    .top-section {
      flex-direction: column;
    }
    .shortcuts-section {
        width: 100%;
      }
  }

  // 响应式设计
  @media (max-width: 1024px) {
    .top-section {
      flex-direction: column;

      .shortcuts-section {
        width: 100%;
      }
    }
  }

  @media (max-width: 768px) {
    padding: 16px;

    .top-section {
      gap: 10px;

      .welcome-section {
        padding: 16px 12px;
        min-height: 80px;

        .welcome-content {
          .welcome-title {
            font-size: 20px;
          }

          .welcome-subtitle {
            font-size: 13px;
          }
        }
      }
    }
  }
}
</style>
