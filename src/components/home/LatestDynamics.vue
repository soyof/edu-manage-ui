<template>
  <el-card class="latest-dynamics-card">
    <template #header>
      <div class="card-header">
        <div class="header-title">
          <div class="icon-wrapper dynamic-icon">
            <el-icon><Notification /></el-icon>
          </div>
          <span class="title-text">最新动态</span>
          <div class="title-badge">{{ dynamics.length }}</div>
        </div>
        <el-button
          type="primary"
          link
          class="view-all-btn"
          @click="goToDynamicPage"
        >
          查看全部
          <el-icon><ArrowRight /></el-icon>
        </el-button>
      </div>
    </template>
    <div class="dynamics-container">
      <div v-if="loading" class="loading-wrapper">
        <el-skeleton :rows="3" animated />
      </div>
      <div v-else-if="dynamics.length === 0" class="empty-wrapper">
        <el-empty
          description="暂无最新动态"
          :imageSize="120"
          class="custom-empty"
        >
          <template #image>
            <div class="empty-icon">
              <el-icon><Notification /></el-icon>
            </div>
          </template>
        </el-empty>
      </div>
      <div v-else class="dynamics-list">
        <div
          v-for="(dynamic, index) in dynamics"
          :key="dynamic.id"
          class="dynamic-item animate__animated animate__fadeInUp"
          :style="{ animationDelay: `${index * 0.1}s` }"
          @click="viewDynamic(dynamic.id)"
        >
          <div class="dynamic-left">
            <div class="dynamic-indicator">
              <div class="pulse-dot"></div>
            </div>
            <div class="dynamic-content">
              <div class="dynamic-header">
                <el-tag
                  size="small"
                  type="success"
                  effect="light"
                  class="dynamic-tag"
                >
                  动态
                </el-tag>
                <span class="dynamic-time">
                  <el-icon><Clock /></el-icon>
                  {{ formatTime(dynamic.createdTimes) }}
                </span>
              </div>
              <h4 class="dynamic-title">{{ dynamic.title }}</h4>
              <div class="dynamic-meta">
                <span class="meta-item">
                  <el-icon><User /></el-icon>
                  {{ dynamic.createUserName }}
                </span>
              </div>
            </div>
          </div>
          <div class="dynamic-right">
            <div class="action-btn">
              <el-icon><ArrowRight /></el-icon>
            </div>
          </div>
        </div>
      </div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Notification, ArrowRight, Clock, User } from '@element-plus/icons-vue'
import service from '@/utils/services'

// 类型定义
interface DynamicItem {
  id: string
  title: string
  createdTimes: string
  createUserName: string
  dynamicType: string
}

const router = useRouter()
const dynamics = ref<DynamicItem[]>([])
const loading = ref(false)

// 获取动态列表
const fetchDynamics = async() => {
  loading.value = true
  try {
    const res = await service.post('/api/dynamic/list', {
      pageNum: 1,
      pageSize: 5,
      publishStatus: '1' // 只获取已发布的动态
    })
    dynamics.value = (res as any).list || []
  } catch (error) {
    console.error('获取动态列表失败', error)
    dynamics.value = []
  } finally {
    loading.value = false
  }
}

// 格式化时间显示
const formatTime = (timeStr: string) => {
  if (!timeStr) return ''
  const now = new Date()
  const time = new Date(timeStr)
  const diff = now.getTime() - time.getTime()

  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (minutes < 60) {
    return `${minutes}分钟前`
  } else if (hours < 24) {
    return `${hours}小时前`
  } else if (days < 7) {
    return `${days}天前`
  }
  return timeStr.split(' ')[0] // 返回日期部分
}

// 查看动态详情
const viewDynamic = (id: string) => {
  router.push(`/dynamicDetail?id=${id}`)
}

// 跳转到动态管理页面
const goToDynamicPage = () => {
  router.push('/dynamicManage')
}

onMounted(() => {
  fetchDynamics()
})
</script>

<style scoped lang="less">
.latest-dynamics-card {
  height: 100%;
  border-radius: 16px;
  border: none;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 8px 40px rgba(0, 0, 0, 0.12);
    transform: translateY(-2px);
  }

  :deep(.el-card__header) {
    background: linear-gradient(135deg,
      color-mix(in srgb, var(--el-color-success) 85%, white) 0%,
      color-mix(in srgb, var(--el-color-success) 75%, white) 100%);
    border: none;
    padding: 20px 24px;
    position: relative;
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      right: 0;
      width: 100px;
      height: 100px;
      background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
      border-radius: 50%;
      transform: translate(30px, -30px);
    }
  }

  :deep(.el-card__body) {
    padding: 0;
    height: calc(100% - 80px);
  }

  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: relative;
    z-index: 1;

    .header-title {
      display: flex;
      align-items: center;
      gap: 12px;
      color: white;

      .icon-wrapper {
        width: 40px;
        height: 40px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(255, 255, 255, 0.2);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.3);

        .el-icon {
          font-size: 20px;
          color: white;
        }
      }

      .title-text {
        font-size: 18px;
        font-weight: 600;
        letter-spacing: 0.5px;
      }

      .title-badge {
        background: rgba(255, 255, 255, 0.2);
        color: white;
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 600;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.3);
      }
    }

    .view-all-btn {
      color: white;
      font-weight: 500;
      padding: 8px 16px;
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.15);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      transition: all 0.3s ease;

      &:hover {
        background: rgba(255, 255, 255, 0.25);
        transform: translateX(4px);
      }

      .el-icon {
        margin-left: 4px;
        transition: transform 0.3s ease;
      }

      &:hover .el-icon {
        transform: translateX(2px);
      }
    }
  }

  .dynamics-container {
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .loading-wrapper, .empty-wrapper {
    padding: 24px;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .custom-empty {
    .empty-icon {
      width: 120px;
      height: 120px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #f0f2f5 0%, #e8ebf0 100%);
      border-radius: 50%;
      margin: 0 auto 16px;

      .el-icon {
        font-size: 48px;
        color: #c0c4cc;
      }
    }
  }

  .dynamics-list {
    flex: 1;
    padding: 8px 0;
  }

  .dynamic-item {
    padding: 16px 24px;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    cursor: pointer;
    border-bottom: 1px solid #f5f5f5;
    transition: all 0.3s ease;
    position: relative;

    &:last-child {
      border-bottom: none;
    }

    &:hover {
      background: linear-gradient(135deg,
        color-mix(in srgb, var(--el-color-success) 8%, #f0fff4) 0%,
        color-mix(in srgb, var(--el-color-success) 5%, #dcfce7) 50%,
        color-mix(in srgb, var(--el-color-success) 8%, #f0fdf4) 100%);
      transform: translateX(4px);

      .dynamic-title {
        color: var(--el-color-success);
      }

      .action-btn {
        background: var(--el-color-success);
        color: white;
        transform: translateX(4px);
      }

      .pulse-dot {
        animation-play-state: running;
      }

      .dynamic-tag {
        transform: scale(1.05);
      }
    }

    .dynamic-left {
      flex: 1;
      display: flex;
      align-items: flex-start;
      gap: 16px;
    }

    .dynamic-indicator {
      margin-top: 8px;
      position: relative;

      .pulse-dot {
        width: 12px;
        height: 12px;
        background: var(--el-color-success);
        border-radius: 50%;
        position: relative;
        animation: pulse 2s infinite paused;

        &::before {
          content: '';
          position: absolute;
          top: -4px;
          left: -4px;
          right: -4px;
          bottom: -4px;
          border: 2px solid var(--el-color-success);
          border-radius: 50%;
          opacity: 0.3;
          animation: ripple 2s infinite paused;
        }
      }
    }

    .dynamic-content {
      flex: 1;

      .dynamic-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 8px;

        .dynamic-tag {
          border-radius: 8px;
          font-weight: 600;
          transition: all 0.3s ease;
          border: none;
          font-size: 11px;
          padding: 4px 8px;
        }

        .dynamic-time {
          display: flex;
          align-items: center;
          gap: 4px;
          color: #6b7280;
          font-size: 12px;

          .el-icon {
            font-size: 12px;
          }
        }
      }

      .dynamic-title {
        font-size: 15px;
        font-weight: 600;
        color: #1f2937;
        margin: 0 0 8px 0;
        line-height: 1.4;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        line-clamp: 2;
        overflow: hidden;
        transition: color 0.3s ease;
      }

      .dynamic-meta {
        display: flex;
        align-items: center;
        color: #6b7280;
        font-size: 12px;

        .meta-item {
          display: flex;
          align-items: center;
          gap: 4px;

          .el-icon {
            font-size: 12px;
          }
        }
      }
    }

    .dynamic-right {
      margin-top: 8px;

      .action-btn {
        width: 32px;
        height: 32px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #f3f4f6;
        color: #6b7280;
        transition: all 0.3s ease;

        .el-icon {
          font-size: 14px;
        }
      }
    }
  }
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.7;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes ripple {
  0% {
    transform: scale(1);
    opacity: 0.3;
  }
  100% {
    transform: scale(2);
    opacity: 0;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .latest-dynamics-card {
    :deep(.el-card__header) {
      padding: 16px 20px;
    }

    .card-header {
      .header-title {
        gap: 8px;

        .icon-wrapper {
          width: 36px;
          height: 36px;

          .el-icon {
            font-size: 18px;
          }
        }

        .title-text {
          font-size: 16px;
        }
      }
    }

    .dynamic-item {
      padding: 12px 20px;

      .dynamic-left {
        gap: 12px;
      }

      .dynamic-content {
        .dynamic-title {
          font-size: 14px;
        }

        .dynamic-meta {
          font-size: 11px;
        }
      }
    }
  }
}
</style>
