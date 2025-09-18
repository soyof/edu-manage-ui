<template>
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
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { QuestionFilled } from '@element-plus/icons-vue'

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

// 计算发布百分比
const getPublishPercentage = (statKey: keyof DashboardStats): number => {
  if (!props.dashboardStats) return 0
  const stat = props.dashboardStats[statKey]
  if (!stat || typeof stat !== 'object' || stat.total === 0) return 0
  const published = stat.published || 0
  return Math.round((published / stat.total) * 100)
}

// 学术内容统计
const academicStats = computed(() => [
  {
    key: 'paperStats',
    name: '学术论文',
    total: props.dashboardStats?.paperStats?.total || 0,
    published: props.dashboardStats?.paperStats?.published || 0,
    percentage: getPublishPercentage('paperStats'),
    color: '#409EFF'
  },
  {
    key: 'patentStats',
    name: '专利成果',
    total: props.dashboardStats?.patentStats?.total || 0,
    published: props.dashboardStats?.patentStats?.published || 0,
    percentage: getPublishPercentage('patentStats'),
    color: '#67C23A'
  },
  {
    key: 'bookStats',
    name: '学术著作',
    total: props.dashboardStats?.bookStats?.total || 0,
    published: props.dashboardStats?.bookStats?.published || 0,
    percentage: getPublishPercentage('bookStats'),
    color: '#E6A23C'
  }
])
</script>

<style scoped lang="less">
.category-card {
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
  margin-bottom: 24px;
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);

  &:hover {
    transform: translateY(-8px) scale(1.02);
    box-shadow:
      0 20px 60px rgba(0, 0, 0, 0.15),
      0 8px 32px rgba(102, 126, 234, 0.2);
  }

  &.content-category {
    position: relative;

    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 6px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 16px 0 0 16px;
      z-index: 1;
    }
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
      color: #409EFF;
      letter-spacing: 0.3px;
    }

    .el-icon {
      color: var(--el-text-color-secondary);
      cursor: help;
      font-size: 16px;
      transition: color 0.3s ease;

      &:hover {
        color: #409EFF;
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
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.1));
            backdrop-filter: blur(10px);
            padding: 6px 12px;
            border-radius: 16px;
            font-weight: 500;
            border: 1px solid rgba(255, 255, 255, 0.2);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          }
        }

        :deep(.el-progress-bar__outer) {
          border-radius: 16px;
          overflow: hidden;
          background: var(--el-bg-color-page);
          backdrop-filter: blur(10px);
          height: 10px;
          border: 1px solid var(--el-border-color-lighter);
          box-shadow: inset 0 1px 2px var(--el-border-color-light);
        }

        :deep(.el-progress-bar__inner) {
          border-radius: 16px;
          background: linear-gradient(135deg,
            var(--color) 0%,
            color-mix(in srgb, var(--color) 80%, white) 100%);
          box-shadow:
            0 2px 8px rgba(0, 0, 0, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.3);
          position: relative;

          &::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(90deg,
              transparent 0%,
              rgba(255, 255, 255, 0.2) 50%,
              transparent 100%);
            border-radius: 16px;
          }
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 1200px) {
  .category-card {
    margin-bottom: 20px;

    .category-content {
      padding: 16px;

      .progress-section .progress-item {
        margin-bottom: 20px;
      }
    }
  }
}

@media (max-width: 768px) {
  .category-card {
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

@media (max-width: 480px) {
  .category-card {
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
</style>
