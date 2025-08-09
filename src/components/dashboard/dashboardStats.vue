<template>
  <div class="dashboard-stats-container">
    <!-- 优化的图表展示区域 -->
    <div v-if="isAdmin" class="charts-section animate__animated animate__fadeIn" style="animation-delay: 0.3s;">
      <!-- 发布状态总览 -->
      <div class="publish-overview">
        <el-card class="overview-card">
          <template #header>
            <div class="card-header">
              <span>发布状态总览</span>
              <el-tooltip content="展示所有内容的发布状态统计">
                <el-icon><QuestionFilled /></el-icon>
              </el-tooltip>
            </div>
          </template>
          <div class="overview-metrics">
            <div class="metric-item published">
              <div class="metric-value">{{ totalPublished }}</div>
              <div class="metric-label">已发布</div>
              <div class="metric-icon">
                <el-icon><Check /></el-icon>
              </div>
            </div>
            <div class="metric-item unpublished">
              <div class="metric-value">{{ totalUnpublished }}</div>
              <div class="metric-label">待发布</div>
              <div class="metric-icon">
                <el-icon><Clock /></el-icon>
              </div>
            </div>
            <div class="metric-item ratio">
              <div class="metric-value">{{ publishRatio }}%</div>
              <div class="metric-label">发布率</div>
              <div class="metric-icon">
                <el-icon><TrendCharts /></el-icon>
              </div>
            </div>
          </div>
        </el-card>
      </div>

      <!-- 分类发布统计 -->
      <el-row :gutter="24" class="category-stats">
        <el-col
          :xl="8"
          :lg="12"
          :md="24"
          :sm="24"
          :xs="24"
        >
          <el-card class="category-card content-category">
            <template #header>
              <div class="card-header">
                <span>学术内容发布</span>
                <el-tooltip content="学术论文、专利成果、学术著作的发布情况">
                  <el-icon><QuestionFilled /></el-icon>
                </el-tooltip>
              </div>
            </template>
            <div class="category-content">
              <div class="progress-section">
                <div
                  v-for="item in academicStats"
                  :key="item.key"
                  class="progress-item"
                >
                  <div class="progress-header">
                    <span class="item-name">{{ item.name }}</span>
                    <span class="item-count">{{ item.published }}/{{ item.total }}</span>
                  </div>
                  <el-progress
                    :percentage="item.percentage"
                    :color="item.color"
                    :show_text="false"
                    :stroke-width="8"
                  />
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col
          :xl="8"
          :lg="12"
          :md="24"
          :sm="24"
          :xs="24"
        >
          <el-card class="category-card info-category">
            <template #header>
              <div class="card-header">
                <span>信息资源发布</span>
                <el-tooltip content="通知公告、招聘信息的发布情况">
                  <el-icon><QuestionFilled /></el-icon>
                </el-tooltip>
              </div>
            </template>
            <div class="category-content">
              <div class="progress-section">
                <div
                  v-for="item in infoStats"
                  :key="item.key"
                  class="progress-item"
                >
                  <div class="progress-header">
                    <span class="item-name">{{ item.name }}</span>
                    <span class="item-count">{{ item.published }}/{{ item.total }}</span>
                  </div>
                  <el-progress
                    :percentage="item.percentage"
                    :color="item.color"
                    :show_text="false"
                    :stroke-width="8"
                  />
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col
          :xl="8"
          :lg="24"
          :md="24"
          :sm="24"
          :xs="24"
        >
          <el-card class="category-card resource-category">
            <template #header>
              <div class="card-header">
                <span>设备工具发布</span>
                <el-tooltip content="仪器设备、开源工具的发布情况">
                  <el-icon><QuestionFilled /></el-icon>
                </el-tooltip>
              </div>
            </template>
            <div class="category-content">
              <div class="progress-section">
                <div
                  v-for="item in resourceStats"
                  :key="item.key"
                  class="progress-item"
                >
                  <div class="progress-header">
                    <span class="item-name">{{ item.name }}</span>
                    <span class="item-count">{{ item.published }}/{{ item.total }}</span>
                  </div>
                  <el-progress
                    :percentage="item.percentage"
                    :color="item.color"
                    :show_text="false"
                    :stroke-width="8"
                  />
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
    <!-- 数据统计可视化区域 -->
    <div class="stats-charts-section animate__animated animate__fadeInUp">
      <el-row :gutter="24">
        <!-- 总览仪表板 -->
        <el-col
          :xl="12"
          :lg="12"
          :md="24"
          :sm="24"
          :xs="24"
        >
          <el-card class="chart-card overview-chart">
            <template #header>
              <div class="card-header">
                <div class="header-title">
                  <el-icon><PieChart /></el-icon>
                  <span>总体概览</span>
                </div>
              </div>
            </template>
            <div ref="overviewChartRef" class="chart-container"></div>
          </el-card>
        </el-col>

        <!-- 分类统计柱状图 -->
        <el-col
          :xl="12"
          :lg="12"
          :md="24"
          :sm="24"
          :xs="24"
        >
          <el-card class="chart-card category-chart">
            <template #header>
              <div class="card-header">
                <div class="header-title">
                  <el-icon><Histogram /></el-icon>
                  <span>分类统计</span>
                </div>
              </div>
            </template>
            <div ref="categoryChartRef" class="chart-container"></div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted, nextTick } from 'vue'
import { useUserInfoStore } from '@/stores/userInfo'
import service from '@/utils/services'
import * as echarts from 'echarts'
import {
  Bell, User, Document, Suitcase, Medal, Reading,
  UserFilled, Tools, QuestionFilled, Check, Clock,
  PieChart, Histogram, TrendCharts
} from '@element-plus/icons-vue'

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

const userInfoStore = useUserInfoStore()

// 获取管理员权限状态
const isAdmin = userInfoStore.isAdmin

// 图表引用
const overviewChartRef = ref<HTMLDivElement>()
const categoryChartRef = ref<HTMLDivElement>()

// 图表实例
let overviewChart: echarts.ECharts | null = null
let categoryChart: echarts.ECharts | null = null

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

// 总发布统计计算属性
const totalPublished = computed(() => {
  const stats = dashboardStats.value
  return (stats.noticeStats.published || 0) +
         (stats.paperStats.published || 0) +
         (stats.patentStats.published || 0) +
         (stats.bookStats.published || 0) +
         (stats.recruitStats.published || 0) +
         (stats.instrumentStats.published || 0) +
         (stats.toolStats.published || 0)
})

const totalUnpublished = computed(() => {
  const stats = dashboardStats.value
  return (stats.noticeStats.unpublished || 0) +
         (stats.paperStats.unpublished || 0) +
         (stats.patentStats.unpublished || 0) +
         (stats.bookStats.unpublished || 0) +
         (stats.recruitStats.unpublished || 0) +
         (stats.instrumentStats.unpublished || 0) +
         (stats.toolStats.unpublished || 0)
})

const publishRatio = computed(() => {
  const total = totalPublished.value + totalUnpublished.value
  return total > 0 ? Math.round((totalPublished.value / total) * 100) : 0
})

// 学术内容统计
const academicStats = computed(() => [
  {
    key: 'paperStats',
    name: '学术论文',
    total: dashboardStats.value.paperStats.total || 0,
    published: dashboardStats.value.paperStats.published || 0,
    percentage: getPublishPercentage('paperStats'),
    color: '#409EFF'
  },
  {
    key: 'patentStats',
    name: '专利成果',
    total: dashboardStats.value.patentStats.total || 0,
    published: dashboardStats.value.patentStats.published || 0,
    percentage: getPublishPercentage('patentStats'),
    color: '#67C23A'
  },
  {
    key: 'bookStats',
    name: '学术著作',
    total: dashboardStats.value.bookStats.total || 0,
    published: dashboardStats.value.bookStats.published || 0,
    percentage: getPublishPercentage('bookStats'),
    color: '#E6A23C'
  }
])

// 信息资源统计
const infoStats = computed(() => [
  {
    key: 'noticeStats',
    name: '通知公告',
    total: dashboardStats.value.noticeStats.total || 0,
    published: dashboardStats.value.noticeStats.published || 0,
    percentage: getPublishPercentage('noticeStats'),
    color: '#9B59B6'
  },
  {
    key: 'recruitStats',
    name: '招聘信息',
    total: dashboardStats.value.recruitStats.total || 0,
    published: dashboardStats.value.recruitStats.published || 0,
    percentage: getPublishPercentage('recruitStats'),
    color: '#3498DB'
  }
])

// 设备工具统计
const resourceStats = computed(() => [
  {
    key: 'instrumentStats',
    name: '仪器设备',
    total: dashboardStats.value.instrumentStats.total || 0,
    published: dashboardStats.value.instrumentStats.published || 0,
    percentage: getPublishPercentage('instrumentStats'),
    color: '#F39C12'
  },
  {
    key: 'toolStats',
    name: '开源工具',
    total: dashboardStats.value.toolStats.total || 0,
    published: dashboardStats.value.toolStats.published || 0,
    percentage: getPublishPercentage('toolStats'),
    color: '#1ABC9C'
  }
])

// 计算发布百分比
const getPublishPercentage = (statKey: keyof DashboardStats): number => {
  const stat = dashboardStats.value[statKey]
  if (!stat || stat.total === 0) return 0
  const published = stat.published || 0
  return Math.round((published / stat.total) * 100)
}

// 统计项配置
const statsConfig = [
  {
    key: 'noticeStats',
    label: '通知公告',
    path: '/noticeManage',
    icon: Bell,
    iconClass: 'notice-icon',
    adminOnly: true
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
    iconClass: 'instrument-icon',
    adminOnly: true
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
    iconClass: 'recruit-icon',
    adminOnly: true
  },
  {
    key: 'toolStats',
    label: '开源工具',
    path: '/toolManage',
    icon: Tools,
    iconClass: 'tool-icon',
    adminOnly: true
  }
]

// 显示的统计数据（直接使用接口数据，不进行权限过滤）
const displayStats = computed((): StatItem[] => {
  return statsConfig.filter(config => !config.adminOnly || isAdmin.value).map(config => ({
    ...config,
    total: dashboardStats.value[config.key as keyof DashboardStats]?.total || 0,
    breakdown: dashboardStats.value[config.key as keyof DashboardStats]
  }))
})

// 初始化总览图表（环形图）
const initOverviewChart = () => {
  if (!overviewChartRef.value) return

  overviewChart = echarts.init(overviewChartRef.value)

  const totalPublished = computed(() => {
    return Object.values(dashboardStats.value).reduce((sum, stat) => {
      return sum + (stat.published || stat.active || 0)
    }, 0)
  })

  const totalUnpublished = computed(() => {
    return Object.values(dashboardStats.value).reduce((sum, stat) => {
      return sum + (stat.unpublished || 0)
    }, 0)
  })

  const totalOffline = computed(() => {
    return Object.values(dashboardStats.value).reduce((sum, stat) => {
      return sum + (stat.offline || stat.inactive || 0)
    }, 0)
  })

  const option = {
    title: {
      text: '总体状态分布',
      subtext: `总计: ${totalPublished.value + totalUnpublished.value + totalOffline.value}`,
      left: 'center',
      top: '45%',
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333'
      },
      subtextStyle: {
        fontSize: 12,
        color: '#666'
      }
    },
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      bottom: '5%',
      left: 'center',
      itemWidth: 14,
      itemHeight: 14
    },
    series: [
      {
        type: 'pie',
        radius: ['45%', '70%'],
        center: ['50%', '45%'],
        data: [
          {
            value: totalPublished.value,
            name: '已发布',
            itemStyle: { color: '#67C23A' }
          },
          {
            value: totalUnpublished.value,
            name: '待发布',
            itemStyle: { color: '#E6A23C' }
          },
          {
            value: totalOffline.value,
            name: '已下线',
            itemStyle: { color: '#F56C6C' }
          }
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        labelLine: {
          show: false
        },
        label: {
          show: false
        }
      }
    ]
  }

  overviewChart.setOption(option)
}

// 初始化分类统计图表（柱状图）
const initCategoryChart = () => {
  if (!categoryChartRef.value) return

  categoryChart = echarts.init(categoryChartRef.value)

  const categoryData = displayStats.value.map(stat => ({
    name: stat.label,
    published: stat.breakdown?.published || stat.breakdown?.active || 0,
    unpublished: stat.breakdown?.unpublished || 0,
    total: stat.total
  }))

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      top: '5%',
      right: '10%'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: categoryData.map(item => item.name),
      axisLabel: {
        interval: 0,
        rotate: 45,
        fontSize: 11
      }
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '已发布',
        type: 'bar',
        stack: 'total',
        data: categoryData.map(item => item.published),
        itemStyle: { color: '#67C23A' }
      },
      {
        name: '待发布',
        type: 'bar',
        stack: 'total',
        data: categoryData.map(item => item.unpublished),
        itemStyle: { color: '#E6A23C' }
      }
    ]
  }

  categoryChart.setOption(option)
}

// 初始化所有图表
const initAllCharts = async() => {
  await nextTick()
  initOverviewChart()
  initCategoryChart()
}

// 更新所有图表
const updateAllCharts = () => {
  if (overviewChart) initOverviewChart()
  if (categoryChart) initCategoryChart()
}

// 图表自适应
const resizeCharts = () => {
  overviewChart?.resize()
  categoryChart?.resize()
}

// 获取统计数据
const fetchDashboardStats = () => {
  return service.get('/api/dashboardStatistics')
    .then((response: any) => {
      // 处理API返回的数据结构
      dashboardStats.value = response || {}
      // 数据更新后刷新图表
      nextTick(() => {
        updateAllCharts()
      })
    })
    .catch((error: any) => {
      console.error('获取仪表板统计数据失败:', error)
    })
}

// 组件生命周期
onMounted(async() => {
  await fetchDashboardStats()
  await initAllCharts()

  // 监听窗口大小变化
  window.addEventListener('resize', resizeCharts)
})

onUnmounted(() => {
  // 销毁图表实例
  overviewChart?.dispose()
  categoryChart?.dispose()

  // 移除事件监听
  window.removeEventListener('resize', resizeCharts)
})
</script>

<style scoped lang="less">
.dashboard-stats-container {
  border-radius: 24px;
  margin-bottom: 24px;

  // 数据统计可视化区域样式
  .stats-charts-section {
    margin-bottom: 32px;

    .chart-card {
      height: 100%;
      border: none;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
      border-radius: 16px;
      overflow: hidden;
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
      }

      :deep(.el-card__header) {
        background: linear-gradient(135deg,
          color-mix(in srgb, var(--el-color-primary) 10%, var(--el-bg-color)) 0%,
          color-mix(in srgb, var(--el-color-primary) 5%, var(--el-bg-color)) 100%);
        color: var(--el-text-color-primary);
        padding: 16px 20px;
        border-bottom: 1px solid color-mix(in srgb, var(--el-color-primary) 20%, var(--el-border-color-light));

        .card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;

          .header-title {
            display: flex;
            align-items: center;
            gap: 8px;
            font-weight: 600;
            font-size: 14px;
            color: var(--el-color-primary);

            .el-icon {
              font-size: 16px;
              color: var(--el-color-primary);
            }
          }

          .header-tools {
            .el-radio-group {
              :deep(.el-radio-button__inner) {
                background: var(--el-bg-color);
                border-color: var(--el-border-color);
                color: var(--el-text-color-primary);
                font-size: 12px;
                padding: 6px 12px;
              }

              :deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
                background: var(--el-color-primary);
                border-color: var(--el-color-primary);
                color: white;
                box-shadow: none;
              }
            }
          }
        }
      }

      :deep(.el-card__body) {
        padding: 20px;
        background: var(--el-bg-color);
      }

      .chart-container {
        width: 100%;

      }

      // 各个图表特定样式
      &.overview-chart .chart-container {
        height: 280px;
      }

      &.category-chart .chart-container {
        height: 280px;
      }
    }
  }

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
    }
  }

  .charts-section {
    .publish-overview {
      margin-bottom: 24px;

      .overview-card {
        border-radius: 20px;
        overflow: hidden;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
        border: 1px solid rgba(255, 255, 255, 0.2);
        backdrop-filter: blur(20px);
        background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);

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

        .overview-metrics {
          display: flex;
          justify-content: space-around;
          padding: 20px 0;

          .metric-item {
            text-align: center;
            position: relative;
            flex: 1;
            padding: 20px;
            border-radius: 16px;
            margin: 0 10px;
            transition: all 0.3s ease;

            &.published {
              background: linear-gradient(135deg, rgba(103, 194, 58, 0.1), rgba(103, 194, 58, 0.05));
              border: 1px solid rgba(103, 194, 58, 0.2);

              .metric-icon {
                background: linear-gradient(135deg, #67c23a, #85ce61);
              }
            }

            &.unpublished {
              background: linear-gradient(135deg, rgba(230, 162, 60, 0.1), rgba(230, 162, 60, 0.05));
              border: 1px solid rgba(230, 162, 60, 0.2);

              .metric-icon {
                background: linear-gradient(135deg, #e6a23c, #ebb563);
              }
            }

            &.ratio {
              background: linear-gradient(135deg, rgba(64, 158, 255, 0.1), rgba(64, 158, 255, 0.05));
              border: 1px solid rgba(64, 158, 255, 0.2);

              .metric-icon {
                background: linear-gradient(135deg, #409eff, #66b1ff);
              }
            }

            &:hover {
              transform: translateY(-5px);
              box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
            }

            .metric-value {
              font-size: 32px;
              font-weight: 800;
              color: var(--el-text-color-primary);
              margin-bottom: 8px;
              line-height: 1;
            }

            .metric-label {
              font-size: 14px;
              color: var(--el-text-color-secondary);
              margin-bottom: 12px;
              font-weight: 500;
            }

            .metric-icon {
              width: 40px;
              height: 40px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              margin: 0 auto;
              color: white;
              font-size: 18px;
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            }
          }
        }
      }
    }

    .category-stats {
      .category-card {
        border-radius: 20px;
        overflow: hidden;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
        border: 1px solid rgba(255, 255, 255, 0.2);
        backdrop-filter: blur(20px);
        background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
        margin-bottom: 24px;
        transition: all 0.3s ease;

        &:hover {
          transform: translateY(-5px);
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.12);
        }

        &.content-category {
          border-left: 4px solid #409eff;
        }

        &.info-category {
          border-left: 4px solid #9b59b6;
        }

        &.resource-category {
          border-left: 4px solid #f39c12;
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

        .category-content {
          padding: 20px;

          .progress-section {
            .progress-item {
              margin-bottom: 24px;

              &:last-child {
                margin-bottom: 0;
              }

              .progress-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 12px;

                .item-name {
                  font-size: 14px;
                  font-weight: 600;
                  color: var(--el-text-color-primary);
                }

                .item-count {
                  font-size: 13px;
                  color: var(--el-text-color-secondary);
                  background: rgba(0, 0, 0, 0.05);
                  padding: 4px 8px;
                  border-radius: 12px;
                  font-weight: 500;
                }
              }

              :deep(.el-progress-bar__outer) {
                border-radius: 8px;
                overflow: hidden;
              }

              :deep(.el-progress-bar__inner) {
                border-radius: 8px;
              }
            }
          }
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 1200px) {
  .dashboard-stats-container {
    .stats-charts-section {
      .chart-card {
        &.overview-chart .chart-container,
        &.category-chart .chart-container {
          height: 240px;
        }

        :deep(.el-card__header) {
          padding: 12px 16px;

          .card-header .header-title {
            font-size: 13px;

            .el-icon {
              font-size: 14px;
            }
          }
        }

        :deep(.el-card__body) {
          padding: 16px;
        }
      }
    }
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
    }

    .charts-section {
      .publish-overview .overview-card .overview-metrics {
        flex-direction: column;
        gap: 16px;

        .metric-item {
          margin: 0;
          padding: 16px;

          .metric-value {
            font-size: 28px;
          }
        }
      }

      .category-stats .category-card {
        margin-bottom: 20px;

        .category-content {
          padding: 16px;

          .progress-section .progress-item {
            margin-bottom: 20px;
          }
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .dashboard-stats-container {
    .stats-charts-section {
      .chart-card {
        &.overview-chart .chart-container,
        &.category-chart .chart-container {
          height: 200px;
        }

        :deep(.el-card__header) {
          padding: 10px 12px;

          .card-header {
            .header-title {
              font-size: 12px;

              .el-icon {
                font-size: 13px;
              }
            }

            .header-tools {
              .el-radio-group :deep(.el-radio-button__inner) {
                font-size: 11px;
                padding: 4px 8px;
              }
            }
          }
        }

        :deep(.el-card__body) {
          padding: 12px;
        }
      }
    }

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
      }
    }

    .charts-section {
      .publish-overview .overview-card .overview-metrics {
        padding: 16px 0;

        .metric-item {
          padding: 12px;

          .metric-value {
            font-size: 24px;
          }

          .metric-label {
            font-size: 12px;
          }

          .metric-icon {
            width: 32px;
            height: 32px;
            font-size: 16px;
          }
        }
      }

      .category-stats .category-card {
        .category-content {
          padding: 12px;

          .progress-section .progress-item {
            margin-bottom: 16px;

            .progress-header {
              .item-name {
                font-size: 13px;
              }

              .item-count {
                font-size: 12px;
                padding: 3px 6px;
              }
            }
          }
        }
      }
    }
  }
}

@media (max-width: 480px) {
  .dashboard-stats-container {
    .stats-charts-section {
      .chart-card {
        &.overview-chart .chart-container,
        &.category-chart .chart-container {
          height: 180px;
        }

        :deep(.el-card__header) {
          padding: 8px 10px;

          .card-header {
            flex-direction: column;
            gap: 8px;
            align-items: flex-start;

            .header-title {
              font-size: 11px;

              .el-icon {
                font-size: 12px;
              }
            }
          }
        }

        :deep(.el-card__body) {
          padding: 10px;
        }
      }
    }

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
      .publish-overview .overview-card .overview-metrics {
        .metric-item {
          padding: 8px;

          .metric-value {
            font-size: 20px;
          }

          .metric-label {
            font-size: 11px;
          }

          .metric-icon {
            width: 28px;
            height: 28px;
            font-size: 14px;
          }
        }
      }

      .category-stats .category-card {
        .category-content {
          padding: 8px;

          .progress-section .progress-item {
            margin-bottom: 12px;

            .progress-header {
              margin-bottom: 8px;

              .item-name {
                font-size: 12px;
              }

              .item-count {
                font-size: 11px;
                padding: 2px 4px;
              }
            }
          }
        }
      }
    }
  }
}
</style>
