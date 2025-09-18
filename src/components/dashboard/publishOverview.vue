<template>
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
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Check, Clock, TrendCharts, QuestionFilled } from '@element-plus/icons-vue'

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

// 总发布统计计算属性
const totalPublished = computed(() => {
  const stats = props.dashboardStats
  if (!stats) return 0
  return (stats.noticeStats?.published || 0) +
         (stats.paperStats?.published || 0) +
         (stats.patentStats?.published || 0) +
         (stats.bookStats?.published || 0) +
         (stats.recruitStats?.published || 0) +
         (stats.instrumentStats?.published || 0) +
         (stats.toolStats?.published || 0)
})

const totalUnpublished = computed(() => {
  const stats = props.dashboardStats
  if (!stats) return 0
  return (stats.noticeStats?.unpublished || 0) +
         (stats.paperStats?.unpublished || 0) +
         (stats.patentStats?.unpublished || 0) +
         (stats.bookStats?.unpublished || 0) +
         (stats.recruitStats?.unpublished || 0) +
         (stats.instrumentStats?.unpublished || 0) +
         (stats.toolStats?.unpublished || 0)
})

const publishRatio = computed(() => {
  const total = totalPublished.value + totalUnpublished.value
  return total > 0 ? Math.round((totalPublished.value / total) * 100) : 0
})
</script>

<style scoped lang="less">
.publish-overview {
  margin-bottom: 24px;

  .overview-card {
    border-radius: 16px;
    overflow: hidden;
    background: linear-gradient(135deg,
      rgba(255, 255, 255, 0.25) 0%,
      rgba(255, 255, 255, 0.1) 100%);
    backdrop-filter: blur(20px);
    box-shadow:
      0 12px 40px rgba(0, 0, 0, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.6);
    border: none;
    transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);

    &:hover {
      transform: translateY(-5px) scale(1.02);
      box-shadow:
        0 20px 60px rgba(0, 0, 0, 0.15),
        0 8px 32px rgba(103, 194, 58, 0.2);
    }

    :deep(.el-card__header) {
      background: #ffffff;
      border: none;
      padding: 16px 20px;
      position: relative;
      overflow: hidden;
      border-bottom: 1px solid #e9ecef;
    }

    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: relative;
      z-index: 1;

      span {
        font-weight: 600;
        font-size: 15px;
        color: #67C23A;
        letter-spacing: 0.3px;
      }

      .el-icon {
        color: var(--el-text-color-secondary);
        cursor: help;
        font-size: 16px;
        transition: color 0.3s ease;

        &:hover {
          color: #67C23A;
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
        padding: 28px;
        border-radius: 24px;
        margin: 0 12px;
        transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        backdrop-filter: blur(10px);

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
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 16px 32px rgba(0, 0, 0, 0.2);
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
          width: 48px;
          height: 48px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto;
          color: white;
          font-size: 20px;
          box-shadow:
            0 6px 16px rgba(0, 0, 0, 0.25),
            inset 0 1px 0 rgba(255, 255, 255, 0.3);
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 1200px) {
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
}

@media (max-width: 768px) {
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
}

@media (max-width: 480px) {
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
}
</style>
