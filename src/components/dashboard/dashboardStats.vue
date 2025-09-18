<template>
  <div class="dashboard-stats-container">
    <!-- 发布状态和分类统计区域 -->
    <div v-if="isAdmin" class="charts-section animate__animated animate__fadeIn" style="animation-delay: 0.3s;">
      <!-- 发布状态总览组件 -->
      <publishOverview :dashboardStats="dashboardStats" />

      <!-- 分类发布统计组件 -->
      <el-row :gutter="24" class="category-stats">
        <el-col
          :xl="8"
          :lg="12"
          :md="24"
          :sm="24"
          :xs="24"
        >
          <academicContent :dashboardStats="dashboardStats" />
        </el-col>
        <el-col
          :xl="8"
          :lg="12"
          :md="24"
          :sm="24"
          :xs="24"
        >
          <infoResource :dashboardStats="dashboardStats" />
        </el-col>
        <el-col
          :xl="8"
          :lg="24"
          :md="24"
          :sm="24"
          :xs="24"
        >
          <equipmentTool :dashboardStats="dashboardStats" />
        </el-col>
      </el-row>
    </div>

    <!-- 数据统计可视化区域 -->
    <div class="stats-charts-section animate__animated animate__fadeInUp">
      <el-row :gutter="24">
        <!-- 总体概览图表组件 -->
        <el-col
          :xl="12"
          :lg="12"
          :md="24"
          :sm="24"
          :xs="24"
        >
          <overviewChart :dashboardStats="dashboardStats" />
        </el-col>

        <!-- 分类统计图表组件 -->
        <el-col
          :xl="12"
          :lg="12"
          :md="24"
          :sm="24"
          :xs="24"
        >
          <categoryChart :dashboardStats="dashboardStats" />
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useUserInfoStore } from '@/stores/userInfo'
import service from '@/utils/services'
// 导入子组件
import publishOverview from './publishOverview.vue'
import academicContent from './academicContent.vue'
import infoResource from './infoResource.vue'
import equipmentTool from './equipmentTool.vue'
import overviewChart from './overviewChart.vue'
import categoryChart from './categoryChart.vue'

// 统计数据接口类型定义
interface StatsBreakdown {
  total: number
  published?: number
  unpublished?: number
  offline?: number
  active?: number
  inactive?: number
  archived?: number
}

interface DashboardStats {
  noticeStats: StatsBreakdown
  userStats: StatsBreakdown
  paperStats: StatsBreakdown
  instrumentStats: StatsBreakdown
  patentStats: StatsBreakdown
  bookStats: StatsBreakdown
  recruitStats: StatsBreakdown
  toolStats: StatsBreakdown
}

const userInfoStore = useUserInfoStore()

// 获取管理员权限状态
const isAdmin = userInfoStore.isAdmin

// 统计数据
const dashboardStats = ref<DashboardStats>({
  noticeStats: { total: 0 },
  userStats: { total: 0 },
  paperStats: { total: 0 },
  instrumentStats: { total: 0 },
  patentStats: { total: 0 },
  bookStats: { total: 0 },
  recruitStats: { total: 0 },
  toolStats: { total: 0 }
})

// 获取统计数据
const fetchDashboardStats = () => {
  return service.get('/api/dashboardStatistics')
    .then((response: any) => {
      // 处理API返回的数据结构
      dashboardStats.value = response || {}
    })
}

// 组件生命周期
onMounted(() => {
  fetchDashboardStats()
})
</script>

<style scoped lang="less">
.dashboard-stats-container {
  border-radius: 32px;
  margin-bottom: 32px;
  background: linear-gradient(135deg,
    rgba(255, 255, 255, 0.95) 0%,
    rgba(248, 250, 252, 0.9) 100%);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);

  // 数据统计可视化区域样式 - 玻璃拟态设计
  .stats-charts-section {
    margin-bottom: 32px;
  }

  .charts-section {
    margin-bottom: 32px;

    .category-stats {
      margin-top: 24px;
    }
  }
}

// 响应式设计
@media (max-width: 1200px) {
  .dashboard-stats-container {
    .charts-section {
      .category-stats {
        margin-top: 20px;
      }
    }
  }
}

@media (max-width: 768px) {
  .dashboard-stats-container {
    border-radius: 24px;
    margin-bottom: 24px;

    .stats-charts-section {
      margin-bottom: 24px;
    }

    .charts-section {
      margin-bottom: 24px;

      .category-stats {
        margin-top: 16px;
      }
    }
  }
}

@media (max-width: 480px) {
  .dashboard-stats-container {
    border-radius: 20px;
    margin-bottom: 20px;

    .stats-charts-section {
      margin-bottom: 20px;
    }

    .charts-section {
      margin-bottom: 20px;

      .category-stats {
        margin-top: 12px;
      }
    }
  }
}
</style>
