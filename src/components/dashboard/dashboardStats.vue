<template>
  <div class="dashboard-stats-container">
    <!-- 数据统计卡片区域 -->
    <div class="stats-section animate__animated animate__fadeInUp">
      <el-row :gutter="24">
        <el-col
          v-for="stat in displayStats"
          :key="stat.key"
          :xl="6"
          :lg="8"
          :md="12"
          :sm="24"
          :xs="24"
        >
          <div class="stats-card" @click="navigateTo(stat.path)">
            <div class="stats-icon" :class="stat.iconClass">
              <el-icon><component :is="stat.icon" /></el-icon>
            </div>
            <div class="stats-info">
              <div class="stats-value">{{ stat.total }}</div>
              <div class="stats-label">{{ stat.label }}</div>
              <div v-if="isAdmin && stat.breakdown" class="stats-breakdown">
                <el-tooltip
                  :content="getBreakdownTooltip(stat.breakdown)"
                  placement="bottom"
                >
                  <div class="breakdown-info">
                    <!-- 用户模块：只显示启用/禁用 -->
                    <template v-if="stat.key === 'userStats' && stat.breakdown">
                      <span class="breakdown-item success">
                        启用: {{ stat.breakdown.active || 0 }}
                      </span>
                      <span class="breakdown-item danger">
                        禁用: {{ stat.breakdown.inactive || 0 }}
                      </span>
                    </template>
                    <!-- 其他模块：显示已发布/待发布 + 一个状态 -->
                    <template v-else-if="stat.breakdown">
                      <span class="breakdown-item success">
                        已发布: {{ stat.breakdown.published || stat.breakdown.active || 0 }}
                      </span>
                      <span class="breakdown-item warning">
                        待发布: {{ stat.breakdown.unpublished || 0 }}
                      </span>
                      <!-- 只显示最重要的一个额外状态，避免换行 -->
                      <span v-if="stat.breakdown.offline && stat.breakdown.offline > 0" class="breakdown-item danger">
                        已下线: {{ stat.breakdown.offline }}
                      </span>
                      <span v-else-if="stat.breakdown.archived && stat.breakdown.archived > 0" class="breakdown-item info">
                        已归档: {{ stat.breakdown.archived }}
                      </span>
                    </template>
                  </div>
                </el-tooltip>
              </div>
            </div>
            <div class="stats-chart">
              <div
                :ref="el => chartRefs[stat.key] = el as HTMLElement"
                class="chart-container"
                :style="{ width: '70px', height: '50px' }"
              ></div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 详细图表区域 -->
    <div v-if="isAdmin" class="charts-section animate__animated animate__fadeIn" style="animation-delay: 0.3s;">
      <el-row :gutter="24">
        <el-col :xl="12" :lg="24" :md="24"
          :sm="24" :xs="24"
        >
          <el-card class="chart-card">
            <template #header>
              <div class="card-header">
                <span>内容管理统计</span>
                <el-tooltip content="展示通知公告、学术论文、专利成果、学术著作的分布情况">
                  <el-icon><QuestionFilled /></el-icon>
                </el-tooltip>
              </div>
            </template>
            <div ref="contentChartRef" class="chart-wrapper"></div>
          </el-card>
        </el-col>
        <el-col :xl="12" :lg="24" :md="24"
          :sm="24" :xs="24"
        >
          <el-card class="chart-card">
            <template #header>
              <div class="card-header">
                <span>资源管理统计</span>
                <el-tooltip content="展示招聘信息、仪器设备、开源工具的分布情况">
                  <el-icon><QuestionFilled /></el-icon>
                </el-tooltip>
              </div>
            </template>
            <div ref="resourceChartRef" class="chart-wrapper"></div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, nextTick, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserInfoStore } from '@/stores/userInfo'
import {
  Bell, User, Document, Suitcase, Medal, Reading,
  UserFilled, Tools, QuestionFilled
} from '@element-plus/icons-vue'
import service from '@/utils/services'
import * as echarts from 'echarts'
import type { ECharts } from 'echarts'

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

interface StatItem {
  key: string
  label: string
  total: number
  breakdown?: StatsBreakdown
  path: string
  icon: any
  iconClass: string
}

const router = useRouter()
const userInfoStore = useUserInfoStore()

// 是否为管理员
const isAdmin = computed(() => {
  return userInfoStore.userInfo?.role === 'admin' || userInfoStore.userInfo?.role === '管理员'
})

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

// 图表引用
const chartRefs = ref<Record<string, HTMLElement>>({})
const contentChartRef = ref<HTMLElement>()
const resourceChartRef = ref<HTMLElement>()

// 图表实例
let contentChart: ECharts | null = null
let resourceChart: ECharts | null = null
const miniCharts = ref<Record<string, ECharts>>({})

// 统计项配置
const statsConfig = [
  {
    key: 'noticeStats',
    label: '通知公告',
    path: '/noticeManage',
    icon: Bell,
    iconClass: 'notice-icon'
  },
  {
    key: 'userStats',
    label: '用户数量',
    path: '/userManage',
    icon: User,
    iconClass: 'user-icon',
    adminOnly: true
  },
  {
    key: 'paperStats',
    label: '学术论文',
    path: '/paperManage',
    icon: Document,
    iconClass: 'paper-icon'
  },
  {
    key: 'instrumentStats',
    label: '仪器设备',
    path: '/instrumentManage',
    icon: Suitcase,
    iconClass: 'instrument-icon'
  },
  {
    key: 'patentStats',
    label: '专利成果',
    path: '/patentManage',
    icon: Medal,
    iconClass: 'patent-icon'
  },
  {
    key: 'bookStats',
    label: '学术著作',
    path: '/bookManage',
    icon: Reading,
    iconClass: 'book-icon'
  },
  {
    key: 'recruitStats',
    label: '招聘信息',
    path: '/recruitManage',
    icon: UserFilled,
    iconClass: 'recruit-icon'
  },
  {
    key: 'toolStats',
    label: '开源工具',
    path: '/toolManage',
    icon: Tools,
    iconClass: 'tool-icon'
  }
]

// 显示的统计数据（根据用户角色过滤）
const displayStats = computed((): StatItem[] => {
  return statsConfig
    .filter(config => !config.adminOnly || isAdmin.value)
    .map(config => ({
      ...config,
      total: dashboardStats.value[config.key as keyof DashboardStats]?.total || 0,
      breakdown: isAdmin.value ? dashboardStats.value[config.key as keyof DashboardStats] : undefined
    }))
})

// 获取状态分解的提示信息
const getBreakdownTooltip = (breakdown: StatsBreakdown): string => {
  const parts = []
  if (breakdown.published !== undefined) parts.push(`已发布: ${breakdown.published}`)
  if (breakdown.active !== undefined) parts.push(`启用: ${breakdown.active}`)
  if (breakdown.unpublished !== undefined) parts.push(`待发布: ${breakdown.unpublished}`)
  if (breakdown.offline !== undefined) parts.push(`已下线: ${breakdown.offline}`)
  if (breakdown.inactive !== undefined) parts.push(`禁用: ${breakdown.inactive}`)
  if (breakdown.archived !== undefined) parts.push(`已归档: ${breakdown.archived}`)
  return parts.join('\n')
}

// 导航到指定页面
const navigateTo = (path: string) => {
  router.push(path)
}

// 获取统计数据
const fetchDashboardStats = () => {
  return service.get('/api/dashboardStatistics')
    .then((response: any) => {
      // 处理API返回的数据结构
      dashboardStats.value = response || {}

      // 等待DOM更新后初始化图表
      return nextTick()
    })
    .then(() => {
      initCharts()
    })
    .catch((error: any) => {
      console.error('获取仪表板统计数据失败:', error)
      return nextTick().then(() => {
        initCharts()
      })
    })
}

// 初始化迷你图表
const initMiniCharts = () => {
  displayStats.value.forEach(stat => {
    const chartEl = chartRefs.value[stat.key]
    if (chartEl && stat.breakdown) {
      const chart = echarts.init(chartEl)

      const published = stat.breakdown.published || stat.breakdown.active || 0
      const unpublished = stat.breakdown.unpublished || 0
      const other = stat.total - published - unpublished

      const option = {
        tooltip: {
          show: false
        },
        series: [{
          type: 'pie',
          radius: ['60%', '100%'],
          center: ['50%', '50%'],
          data: [
            { value: published, itemStyle: { color: '#67C23A' }},
            { value: unpublished, itemStyle: { color: '#E6A23C' }},
            { value: other, itemStyle: { color: '#F56C6C' }}
          ],
          label: { show: false },
          labelLine: { show: false },
          animation: true,
          animationDelay: 100
        }]
      }

      chart.setOption(option)
      miniCharts.value[stat.key] = chart
    }
  })
}

// 初始化详细图表
const initDetailCharts = () => {
  if (!isAdmin.value) return

  // 内容管理图表
  if (contentChartRef.value) {
    contentChart = echarts.init(contentChartRef.value)

    const contentOption = {
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)'
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        data: ['通知公告', '学术论文', '专利成果', '学术著作']
      },
      series: [{
        name: '内容管理',
        type: 'pie',
        radius: '50%',
        center: ['60%', '50%'],
        data: [
          { value: dashboardStats.value.noticeStats.total, name: '通知公告' },
          { value: dashboardStats.value.paperStats.total, name: '学术论文' },
          { value: dashboardStats.value.patentStats.total, name: '专利成果' },
          { value: dashboardStats.value.bookStats.total, name: '学术著作' }
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }]
    }

    contentChart.setOption(contentOption)
  }

  // 资源管理图表
  if (resourceChartRef.value) {
    resourceChart = echarts.init(resourceChartRef.value)

    const resourceOption = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: ['招聘信息', '仪器设备', '开源工具']
      },
      yAxis: {
        type: 'value'
      },
      series: [{
        name: '资源数量',
        type: 'bar',
        data: [
          {
            value: dashboardStats.value.recruitStats.total,
            itemStyle: { color: '#409EFF' }
          },
          {
            value: dashboardStats.value.instrumentStats.total,
            itemStyle: { color: '#67C23A' }
          },
          {
            value: dashboardStats.value.toolStats.total,
            itemStyle: { color: '#E6A23C' }
          }
        ],
        animationDelay: (idx: number) => idx * 100
      }]
    }

    resourceChart.setOption(resourceOption)
  }
}

// 初始化所有图表
const initCharts = () => {
  initMiniCharts()
  initDetailCharts()
}

// 窗口大小改变时重新调整图表
const handleResize = () => {
  Object.values(miniCharts.value).forEach(chart => chart.resize())
  contentChart?.resize()
  resourceChart?.resize()
}

onMounted(() => {
  fetchDashboardStats()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  // 销毁图表实例
  Object.values(miniCharts.value).forEach(chart => chart.dispose())
  contentChart?.dispose()
  resourceChart?.dispose()
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped lang="less">
.dashboard-stats-container {
  padding: 20px;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  border-radius: 24px;
  margin-bottom: 24px;

  .stats-section {
    margin-bottom: 32px;

          .stats-card {
        background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
        border-radius: 20px;
        padding: 28px 24px;
        display: flex;
        align-items: center;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        height: 180px;
        cursor: pointer;
        position: relative;
        overflow: hidden;
        border: 1px solid rgba(255, 255, 255, 0.2);
        backdrop-filter: blur(20px);
        margin-bottom: 24px;

      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 3px;
        background: linear-gradient(90deg, var(--el-color-primary), #409eff);
        transform: translateX(-100%);
        transition: transform 0.3s ease;
      }

      &:hover {
        transform: translateY(-12px) scale(1.03);
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
        border-color: rgba(var(--el-color-primary-rgb), 0.3);

        &::before {
          transform: translateX(0);
        }

        &::after {
          opacity: 1;
        }

        .stats-icon {
          transform: scale(1.15) rotate(5deg);
        }

        .stats-value {
          color: var(--el-color-primary);
          transform: scale(1.05);
        }

        .stats-breakdown {
          .breakdown-info {
            opacity: 1;
            transform: translateY(0);
          }
        }
      }

      &::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(135deg,
          rgba(var(--el-color-primary-rgb), 0.02) 0%,
          rgba(var(--el-color-primary-rgb), 0.05) 100%);
        opacity: 0;
        transition: opacity 0.4s ease;
        pointer-events: none;
      }

      .stats-icon {
        width: 64px;
        height: 64px;
        border-radius: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 24px;
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        position: relative;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);

        &.notice-icon {
          background: linear-gradient(135deg, rgba(67, 56, 202, 0.15), rgba(99, 102, 241, 0.15));
          border: 1px solid rgba(67, 56, 202, 0.2);
        }
        &.user-icon {
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(34, 197, 94, 0.15));
          border: 1px solid rgba(16, 185, 129, 0.2);
        }
        &.paper-icon {
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(99, 102, 241, 0.15));
          border: 1px solid rgba(59, 130, 246, 0.2);
        }
        &.instrument-icon {
          background: linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(251, 191, 36, 0.15));
          border: 1px solid rgba(245, 158, 11, 0.2);
        }
        &.patent-icon {
          background: linear-gradient(135deg, rgba(236, 72, 153, 0.15), rgba(244, 114, 182, 0.15));
          border: 1px solid rgba(236, 72, 153, 0.2);
        }
        &.book-icon {
          background: linear-gradient(135deg, rgba(139, 69, 19, 0.15), rgba(202, 138, 4, 0.15));
          border: 1px solid rgba(139, 69, 19, 0.2);
        }
        &.recruit-icon {
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(124, 58, 237, 0.15));
          border: 1px solid rgba(99, 102, 241, 0.2);
        }
        &.tool-icon {
          background: linear-gradient(135deg, rgba(14, 165, 233, 0.15), rgba(6, 182, 212, 0.15));
          border: 1px solid rgba(14, 165, 233, 0.2);
        }

        .el-icon {
          font-size: 28px;
          color: var(--el-color-primary);
        }
      }

      .stats-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;

        .stats-value {
          font-size: 32px;
          font-weight: 800;
          color: var(--el-text-color-primary);
          margin-bottom: 6px;
          transition: all 0.4s ease;
          letter-spacing: -0.5px;
        }

        .stats-label {
          font-size: 15px;
          color: var(--el-text-color-secondary);
          margin-bottom: 12px;
          font-weight: 500;
        }

        .stats-breakdown {
          min-height: 18px;
          max-height: 36px;
          display: flex;
          align-items: flex-start;
          overflow: visible;

          .breakdown-info {
            display: flex;
            flex-wrap: wrap;
            gap: 4px;
            opacity: 0.8;
            transform: translateY(4px);
            transition: all 0.3s ease;
            align-items: center;
            line-height: 1.2;

            .breakdown-item {
              font-size: 10px;
              padding: 2px 6px;
              border-radius: 10px;
              font-weight: 600;
              backdrop-filter: blur(10px);
              border: 1px solid rgba(255, 255, 255, 0.2);
              white-space: nowrap;
              flex-shrink: 0;

              &.success {
                color: #16a34a;
                background: linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(16, 185, 129, 0.15));
                border-color: rgba(34, 197, 94, 0.2);
              }

              &.warning {
                color: #d97706;
                background: linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(251, 191, 36, 0.15));
                border-color: rgba(245, 158, 11, 0.2);
              }

              &.danger {
                color: #dc2626;
                background: linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(248, 113, 113, 0.15));
                border-color: rgba(239, 68, 68, 0.2);
              }

              &.info {
                color: #6b7280;
                background: linear-gradient(135deg, rgba(156, 163, 175, 0.15), rgba(209, 213, 219, 0.15));
                border-color: rgba(156, 163, 175, 0.2);
              }
            }
          }
        }
      }

      .stats-chart {
        margin-left: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;

        .chart-container {
          opacity: 0.8;
          transition: opacity 0.3s ease;
        }

        &:hover .chart-container {
          opacity: 1;
        }
      }
    }
  }

  .charts-section {
    .chart-card {
      border-radius: 20px;
      overflow: visible;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(20px);
      background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
      margin-bottom: 24px;

      :deep(.el-card__body) {
        overflow: visible;
      }

      .card-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-weight: 600;
        color: var(--el-text-color-primary);
        font-size: 16px;

        .el-icon {
          color: var(--el-text-color-secondary);
          cursor: help;
          font-size: 18px;
          transition: color 0.3s ease;

          &:hover {
            color: var(--el-color-primary);
          }
        }
      }

      .chart-wrapper {
        height: 320px;
        width: 100%;
        padding: 10px;
        overflow: visible;
        position: relative;
        z-index: 1;
      }
    }
  }
}

// 响应式设计
@media (max-width: 1200px) {
  .dashboard-stats-container {
    .stats-section .stats-card {
      height: 160px;
      padding: 24px 20px;
      margin-bottom: 20px;

      .stats-icon {
        width: 56px;
        height: 56px;
        margin-right: 20px;

        .el-icon {
          font-size: 26px;
        }
      }

      .stats-info {
        .stats-value {
          font-size: 28px;
        }

        .stats-label {
          font-size: 14px;
        }
      }

      .stats-chart {
        .chart-container {
          width: 50px !important;
          height: 35px !important;
        }
      }
    }

    .charts-section {
      .chart-card {
        margin-bottom: 20px;

        .chart-wrapper {
          height: 280px;
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .dashboard-stats-container {
    .stats-section {
      margin-bottom: 16px;

      .stats-card {
        height: 140px;
        padding: 16px 12px;
        margin-bottom: 16px;

        .stats-icon {
          width: 40px;
          height: 40px;
          margin-right: 12px;

          .el-icon {
            font-size: 20px;
          }
        }

        .stats-info {
          .stats-value {
            font-size: 20px;
          }

          .stats-label {
            font-size: 13px;
          }

          .stats-breakdown {
            min-height: 16px;
            max-height: 32px;

            .breakdown-info {
              gap: 2px;

              .breakdown-item {
                font-size: 9px;
                padding: 1px 4px;
              }
            }
          }
        }

        .stats-chart {
          display: none; // 在小屏幕上隐藏迷你图表
        }
      }
    }

    .charts-section {
      .chart-card {
        .chart-wrapper {
          height: 200px;
        }
      }
    }
  }
}

@media (max-width: 480px) {
  .dashboard-stats-container {
    .stats-section .stats-card {
      padding: 12px 8px;

      .stats-icon {
        width: 36px;
        height: 36px;
        margin-right: 10px;

        .el-icon {
          font-size: 18px;
        }
      }

      .stats-info {
        .stats-value {
          font-size: 18px;
        }

        .stats-label {
          font-size: 12px;
        }
      }
    }

    .charts-section {
      .chart-card {
        .chart-wrapper {
          height: 180px;
        }
      }
    }
  }
}
</style>
