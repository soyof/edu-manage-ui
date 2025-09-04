<template>
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
</template>

<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted, nextTick, watch } from 'vue'
import { useUserInfoStore } from '@/stores/userInfo'
import * as echarts from 'echarts'
import { Histogram } from '@element-plus/icons-vue'

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

// 接收统计数据作为props
const props = defineProps<{
  dashboardStats: DashboardStats
}>()

const userInfoStore = useUserInfoStore()
const isAdmin = userInfoStore.isAdmin

// 图表引用
const categoryChartRef = ref<HTMLDivElement>()
let categoryChart: echarts.ECharts | null = null

// 统计项配置
const statsConfig = [
  {
    key: 'noticeStats',
    label: '通知公告',
    path: '/noticeManage',
    icon: 'Bell',
    iconClass: 'notice-icon',
    adminOnly: true
  },
  {
    key: 'userStats',
    label: '用户数量',
    path: '/userManage',
    icon: 'User',
    iconClass: 'user-icon',
    adminOnly: true
  },
  {
    key: 'paperStats',
    label: '学术论文',
    path: '/paperManage',
    icon: 'Document',
    iconClass: 'paper-icon'
  },
  {
    key: 'instrumentStats',
    label: '仪器设备',
    path: '/instrumentManage',
    icon: 'Suitcase',
    iconClass: 'instrument-icon',
    adminOnly: true
  },
  {
    key: 'patentStats',
    label: '专利成果',
    path: '/patentManage',
    icon: 'Medal',
    iconClass: 'patent-icon'
  },
  {
    key: 'bookStats',
    label: '学术著作',
    path: '/bookManage',
    icon: 'Reading',
    iconClass: 'book-icon'
  },
  {
    key: 'recruitStats',
    label: '招聘信息',
    path: '/recruitManage',
    icon: 'UserFilled',
    iconClass: 'recruit-icon',
    adminOnly: true
  },
  {
    key: 'toolStats',
    label: '开源工具',
    path: '/toolManage',
    icon: 'Tools',
    iconClass: 'tool-icon',
    adminOnly: true
  }
]

// 显示的统计数据
const displayStats = computed((): StatItem[] => {
  return statsConfig.filter(config => !config.adminOnly || isAdmin.value).map(config => ({
    ...config,
    total: props.dashboardStats[config.key as keyof DashboardStats]?.total || 0,
    breakdown: props.dashboardStats[config.key as keyof DashboardStats]
  }))
})

// 初始化图表
const initChart = () => {
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

// 图表自适应
const resizeChart = () => {
  categoryChart?.resize()
}

// 监听数据变化
watch(() => props.dashboardStats, () => {
  nextTick(() => {
    initChart()
  })
}, { deep: true })

// 组件生命周期
onMounted(async() => {
  await nextTick()
  initChart()
  window.addEventListener('resize', resizeChart)
})

onUnmounted(() => {
  categoryChart?.dispose()
  window.removeEventListener('resize', resizeChart)
})
</script>

<style scoped lang="less">
.chart-card {
  height: 100%;
  border: none;
  background: linear-gradient(135deg,
    rgba(255, 255, 255, 0.25) 0%,
    rgba(255, 255, 255, 0.1) 100%);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg,
      rgba(64, 158, 255, 0.05) 0%,
      rgba(103, 194, 58, 0.05) 50%,
      rgba(230, 162, 60, 0.05) 100%);
    opacity: 0;
    transition: opacity 0.4s ease;
    pointer-events: none;
  }

  &:hover {
    transform: translateY(-8px) scale(1.02);
    box-shadow:
      0 20px 60px rgba(0, 0, 0, 0.12),
      0 8px 32px rgba(64, 158, 255, 0.15);
    border-color: rgba(64, 158, 255, 0.3);

    &::before {
      opacity: 1;
    }
  }

  :deep(.el-card__header) {
    background: linear-gradient(135deg,
      rgba(255, 255, 255, 0.4) 0%,
      rgba(255, 255, 255, 0.2) 100%);
    backdrop-filter: blur(15px);
    color: var(--el-text-color-primary);
    padding: 20px 24px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);

    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;

      .header-title {
        display: flex;
        align-items: center;
        gap: 12px;
        font-weight: 700;
        font-size: 16px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;

        .el-icon {
          font-size: 24px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 50%;
          padding: 4px;
          color: white;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        }
      }
    }
  }

  :deep(.el-card__body) {
    padding: 24px;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
  }

  .chart-container {
    width: 100%;
    height: 280px;
    position: relative;
    border-radius: 16px;
    overflow: hidden;
  }
}

// 响应式设计
@media (max-width: 1200px) {
  .chart-card {
    .chart-container {
      height: 240px;
    }

    :deep(.el-card__header) {
      padding: 12px 16px;

      .card-header .header-title {
        font-size: 13px;

        .el-icon {
          font-size: 18px;
        }
      }
    }

    :deep(.el-card__body) {
      padding: 16px;
    }
  }
}

@media (max-width: 768px) {
  .chart-card {
    .chart-container {
      height: 200px;
    }

    :deep(.el-card__header) {
      padding: 10px 12px;

      .card-header {
        .header-title {
          font-size: 12px;

          .el-icon {
            font-size: 16px;
          }
        }
      }
    }

    :deep(.el-card__body) {
      padding: 12px;
    }
  }
}

@media (max-width: 480px) {
  .chart-card {
    .chart-container {
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
              font-size: 14px;
            }
          }
      }
    }

    :deep(.el-card__body) {
      padding: 10px;
    }
  }
}
</style>
