<template>
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
</template>

<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted, nextTick, watch } from 'vue'
import * as echarts from 'echarts'
import { PieChart } from '@element-plus/icons-vue'

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

// 接收统计数据作为props
const props = defineProps<{
  dashboardStats: DashboardStats
}>()

// 图表引用
const overviewChartRef = ref<HTMLDivElement>()
let overviewChart: echarts.ECharts | null = null

// 计算数据
const totalPublished = computed(() => {
  return Object.values(props.dashboardStats).reduce((sum, stat) => {
    return sum + (stat.published || stat.active || 0)
  }, 0)
})

const totalUnpublished = computed(() => {
  return Object.values(props.dashboardStats).reduce((sum, stat) => {
    return sum + (stat.unpublished || 0)
  }, 0)
})

const totalOffline = computed(() => {
  return Object.values(props.dashboardStats).reduce((sum, stat) => {
    return sum + (stat.offline || stat.inactive || 0)
  }, 0)
})

// 初始化图表
const initChart = () => {
  if (!overviewChartRef.value) return

  overviewChart = echarts.init(overviewChartRef.value)

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

// 图表自适应
const resizeChart = () => {
  overviewChart?.resize()
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
  overviewChart?.dispose()
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
