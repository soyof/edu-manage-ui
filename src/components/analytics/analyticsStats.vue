<template>
  <div class="analytics-stats-container">
    <!-- 访问统计概览 -->
    <div class="visit-overview">
      <el-card class="overview-card">
        <template #header>
          <div class="card-header">
            <span>访问统计概览</span>
            <el-tooltip content="展示系统访问量统计数据">
              <el-icon><QuestionFilled /></el-icon>
            </el-tooltip>
          </div>
        </template>
        <div class="overview-metrics">
          <div class="metric-item total">
            <div class="metric-value">{{ visitStats?.totalVisits || 0 }}</div>
            <div class="metric-label">总访问量</div>
            <div class="metric-icon">
              <el-icon><View /></el-icon>
            </div>
          </div>
          <div class="metric-item today">
            <div class="metric-value">{{ visitStats?.todayVisits || 0 }}</div>
            <div class="metric-label">今日访问</div>
            <div class="metric-icon">
              <el-icon><Calendar /></el-icon>
            </div>
          </div>
          <div class="metric-item week">
            <div class="metric-value">{{ visitStats?.weekVisits || 0 }}</div>
            <div class="metric-label">本周访问</div>
            <div class="metric-icon">
              <el-icon><DataBoard /></el-icon>
            </div>
          </div>
          <div class="metric-item month">
            <div class="metric-value">{{ visitStats?.monthVisits || 0 }}</div>
            <div class="metric-label">本月访问</div>
            <div class="metric-icon">
              <el-icon><DataLine /></el-icon>
            </div>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import service from '@/utils/services'
import {
  View, Calendar, DataBoard, DataLine, QuestionFilled
} from '@element-plus/icons-vue'

// 数据接口定义
interface VisitStatistics {
  totalVisits: string
  todayVisits: string
  yesterdayVisits: string
  weekVisits: string
  monthVisits: string
}

interface AnalyticsData {
  visitStatistics: VisitStatistics
}

// 响应式数据
const loading = ref(false)
const analyticsData = ref<AnalyticsData | null>(null)

// 计算属性
const visitStats = computed(() => analyticsData.value?.visitStatistics)

// 获取埋点数据
const fetchAnalyticsData = async() => {
  try {
    loading.value = true
    const response: any = await service.get('/api/dashboard')
    if (response) {
      analyticsData.value = response || {}
    }
  } catch (error) {
    console.error('获取埋点数据失败:', error)
  } finally {
    loading.value = false
  }
}

// 生命周期
onMounted(() => {
  fetchAnalyticsData()
})
</script>

<style scoped lang="less">
.analytics-stats-container {
  margin-bottom: 24px;

  .visit-overview {
    .overview-card {
      border: none;
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
      overflow: hidden;
      transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);

      &:hover {
        transform: translateY(-5px) scale(1.02);
        box-shadow:
          0 20px 60px rgba(0, 0, 0, 0.15),
          0 8px 32px rgba(155, 89, 182, 0.2);
      }

      :deep(.el-card__header) {
        background: #ffffff;
        border: none;
        padding: 16px 20px;
        position: relative;
        overflow: hidden;
        border-bottom: 1px solid #e9ecef;

        .card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: relative;
          z-index: 1;

          span {
            font-weight: 600;
            font-size: 15px;
            color: #9B59B6;
            letter-spacing: 0.3px;
          }

          .el-icon {
            color: var(--el-text-color-secondary);
            cursor: help;
            font-size: 16px;
            transition: color 0.3s ease;

            &:hover {
              color: #9B59B6;
            }
          }
        }
      }

      :deep(.el-card__body) {
        background: var(--el-bg-color);
        padding: 16px;
      }

        .overview-metrics {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 16px;

          .metric-item {
            display: flex;
            align-items: center;
            padding: 16px;
            background: var(--el-bg-color-page);
            border-radius: 10px;
            border: 1px solid var(--el-border-color-light);
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;

          &::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 4px;
            height: 100%;
            transition: all 0.3s ease;
          }

          &.total::before {
            background: linear-gradient(180deg, #409EFF, #409EFF);
          }

          &.today::before {
            background: linear-gradient(180deg, #67C23A, #67C23A);
          }

          &.week::before {
            background: linear-gradient(180deg, #E6A23C, #E6A23C);
          }

          &.month::before {
            background: linear-gradient(180deg, #F56C6C, #F56C6C);
          }

          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
            border-color: var(--el-color-primary-light-3);

            &::before {
              width: 6px;
            }

            .metric-icon {
              transform: scale(1.1);
            }
          }

            .metric-value {
              font-size: 24px;
              font-weight: 700;
              color: var(--el-text-color-primary);
              margin-right: 10px;
            }

            .metric-label {
              font-size: 13px;
              color: var(--el-text-color-secondary);
              flex: 1;
            }

            .metric-icon {
              width: 36px;
              height: 36px;
              border-radius: 8px;
              display: flex;
              align-items: center;
              justify-content: center;
              transition: all 0.3s ease;

              .el-icon {
                font-size: 18px;
              }
            }

          &.total .metric-icon {
            background: rgba(64, 158, 255, 0.1);
            .el-icon { color: #409EFF; }
          }

          &.today .metric-icon {
            background: rgba(103, 194, 58, 0.1);
            .el-icon { color: #67C23A; }
          }

          &.week .metric-icon {
            background: rgba(230, 162, 60, 0.1);
            .el-icon { color: #E6A23C; }
          }

          &.month .metric-icon {
            background: rgba(245, 108, 108, 0.1);
            .el-icon { color: #F56C6C; }
          }
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .analytics-stats-container {
    .visit-overview {
      .overview-card {
        .overview-metrics {
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 10px;

          .metric-item {
            flex-direction: column;
            text-align: center;
            padding: 12px;

            .metric-value {
              font-size: 20px;
              margin-right: 0;
              margin-bottom: 3px;
            }

            .metric-label {
              margin-bottom: 6px;
              font-size: 12px;
            }

            .metric-icon {
              margin-top: 6px;
              width: 32px;
              height: 32px;

              .el-icon {
                font-size: 16px;
              }
            }
          }
        }
      }
    }
  }
}
</style>
