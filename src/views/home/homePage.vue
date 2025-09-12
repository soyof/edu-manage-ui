<template>
  <div class="home-container">
    <!-- 顶部区域 -->
    <div class="top-section animate__animated animate__fadeInDown animate__delay-1s">
      <!-- 欢迎区域 -->
      <div class="welcome-section animate__animated animate__slideInLeft animate__delay-1s">
        <WelcomeSection />
      </div>
      <!-- 快捷入口区域 -->
      <div class="shortcuts-section animate__animated animate__slideInRight animate__delay-1s">
        <QuickShortcuts />
      </div>
    </div>

    <!-- 埋点分析组件 -->
    <div v-if="isAdmin" class="analytics-wrapper animate__animated animate__fadeInUp animate__delay-2s">
      <AnalyticsStats />
    </div>

    <!-- 数据统计组件 -->
    <div class="dashboard-wrapper animate__animated animate__fadeInUp animate__delay-2s">
      <DashboardStats />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import DashboardStats from '@/components/dashboard/dashboardStats.vue'
import { AnalyticsStats } from '@/components/analytics'
import { QuickShortcuts, WelcomeSection } from '@/components/home'
import { useUserInfoStore } from '@/stores/userInfo'

const userInfoStore = useUserInfoStore()
const isAdmin = computed(() => userInfoStore.userInfo?.role === 'admin')

// 页面加载完成后的交互动画
const isPageLoaded = ref(false)

onMounted(() => {
  // 页面加载完成后启用交互动画
  setTimeout(() => {
    isPageLoaded.value = true
  }, 3500) // 等待所有入场动画完成
})
</script>

<style scoped lang="less">
// 防止动画溢出的全局控制
:global(html, body) {
  overflow-x: hidden;
}

:global(.el-main) {
  overflow: hidden;
}

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
  padding: 12px;
  background-color: @pageBgColor;
  min-height: @contentHeight;
  position: relative;

  // 顶部区域
  .top-section {
    display: flex;
    gap: 16px;
    margin-bottom: 24px;
    align-items: stretch;
    transition: all 0.3s ease;

    // 欢迎区域
    .welcome-section {
      flex: 1;
      transition: transform 0.3s ease, box-shadow 0.3s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
      }
    }

    // 快捷入口区域
    .shortcuts-section {
      min-width: 480px;
      flex-shrink: 0;
      transition: transform 0.3s ease, box-shadow 0.3s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
      }
    }
  }

  // 分析组件包装器
  .analytics-wrapper {
    margin-bottom: 24px;
    transition: transform 0.3s ease;

    &:hover {
      transform: scale(1.02);
    }
  }

  // 仪表板组件包装器
  .dashboard-wrapper {
    margin-bottom: 24px;
    transition: transform 0.3s ease;

    &:hover {
      transform: scale(1.02);
    }
  }

  // 自定义动画增强
  .animate__animated {
    animation-duration: 0.8s;
    animation-fill-mode: both;
    // 确保动画不会造成溢出
    will-change: transform, opacity;
    backface-visibility: hidden;
  }

  // 自定义延迟类
  .animate__delay-1s { animation-delay: 0.2s; }
  .animate__delay-2s { animation-delay: 0.6s; }
  .animate__delay-3s { animation-delay: 1.0s; }

  // 针对滑入动画的特殊处理
  .animate__slideInLeft,
  .animate__slideInRight {
    // 确保滑入动画不会超出容器边界
    transform-origin: center center;
  }

  // 悬停时的微动画
  .hover-float {
    transition: transform 0.3s ease;

    &:hover {
      animation: float 2s ease-in-out infinite;
    }
  }

  // 点击波纹效果
  .ripple-effect {
    position: relative;
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 0;
      height: 0;
      border-radius: 50%;
      background: rgba(var(--el-color-primary-rgb), 0.3);
      transform: translate(-50%, -50%);
      transition: width 0.6s, height 0.6s;
    }

    &:active::before {
      width: 300px;
      height: 300px;
    }
  }

  @media (max-width: 1200px) {
    .top-section {
      flex-direction: column;

      .welcome-section,
      .shortcuts-section {
        width: 100%;
        min-width: auto;
      }
    }

    // 移动端动画优化
    .animate__animated {
      animation-duration: 0.6s;
    }
  }

  // 响应式设计
  @media (max-width: 1024px) {
    .top-section {
      flex-direction: column;
      margin-bottom: 20px;

      .shortcuts-section {
        width: 100%;
      }
    }

    .analytics-wrapper,
    .dashboard-wrapper {
      margin-bottom: 20px;
    }
  }

  @media (max-width: 768px) {
    padding: 16px;

    .top-section {
      gap: 12px;
      margin-bottom: 16px;

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

    .analytics-wrapper,
    .dashboard-wrapper {
      margin-bottom: 16px;
    }

    // 移动端减少动画以提升性能
    .animate__animated {
      animation-duration: 0.4s;
    }

    // 禁用悬停效果
    .welcome-section:hover,
    .shortcuts-section:hover,
    .analytics-wrapper:hover,
    .dashboard-wrapper:hover {
      transform: none;
      box-shadow: none;
    }
  }

  // 减少动画偏好设置
  @media (prefers-reduced-motion: reduce) {
    .animate__animated {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }

    .hover-float:hover {
      animation: none;
    }
  }
}
</style>
