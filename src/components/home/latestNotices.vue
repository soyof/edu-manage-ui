<template>
  <el-card class="latest-notices-card">
    <template #header>
      <div class="card-header">
        <div class="header-title">
          <div class="icon-wrapper notice-icon">
            <el-icon><Bell /></el-icon>
          </div>
          <span class="title-text">最新通知</span>
          <div class="title-badge">{{ notices.length }}</div>
        </div>
        <el-button
          v-if="isAdmin"
          type="primary"
          link
          class="view-all-btn"
          @click="goToNoticePage"
        >
          查看全部
          <el-icon><ArrowRight /></el-icon>
        </el-button>
      </div>
    </template>
    <div class="notices-container">
      <div v-if="loading" class="loading-wrapper">
        <el-skeleton :rows="3" animated />
      </div>
      <div v-else-if="notices.length === 0" class="empty-wrapper">
        <el-empty
          description="暂无通知公告"
          :imageSize="120"
          class="custom-empty"
        >
          <template #image>
            <div class="empty-icon">
              <el-icon><Bell /></el-icon>
            </div>
          </template>
        </el-empty>
      </div>
      <div v-else class="notices-list">
        <div
          v-for="(notice, index) in notices"
          :key="notice.id"
          class="notice-item animate__animated animate__fadeInUp"
          :style="{ animationDelay: `${index * 0.1}s` }"
          @click="viewNotice(notice.id)"
        >
          <div class="notice-left">
            <div class="notice-type-badge">
              <el-tag
                size="small"
                :type="getNoticeTypeTag(notice.noticeType)"
                effect="light"
                class="type-tag"
              >
                {{ translateNoticeType(notice.noticeType) }}
              </el-tag>
            </div>
            <div class="notice-content">
              <h4 class="notice-title">{{ notice.title }}</h4>
              <div class="notice-meta">
                <span class="meta-item">
                  <el-icon><Calendar /></el-icon>
                  {{ notice.createdTimes }}
                </span>
                <span class="meta-divider">·</span>
                <span class="meta-item">
                  <el-icon><User /></el-icon>
                  {{ notice.createUserName }}
                </span>
              </div>
            </div>
          </div>
          <div class="notice-right">
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
import { useUserInfoStore } from '@/stores/userInfo'
import { Bell, ArrowRight, Calendar, User } from '@element-plus/icons-vue'
import service from '@/utils/services'
import { useDictionary } from '@/hooks/useDictionary'

// 类型定义
interface NoticeItem {
  id: string
  title: string
  noticeType: string
  createdTimes: string
  createUserName: string
}

const router = useRouter()
const userInfoStore = useUserInfoStore()
const notices = ref<NoticeItem[]>([])
const loading = ref(false)

// 获取管理员权限状态
const isAdmin = userInfoStore.isAdmin

// 使用字典服务获取通知类型翻译
const { getDictLabel: translateNoticeType } = useDictionary({
  dictType: 'notice_type',
  autoLoad: true
})

// 获取通知列表
const fetchNotices = async() => {
  loading.value = true
  try {
    const res = await service.post('/api/notice/list', {
      pageNum: 1,
      pageSize: 5,
      publishStatus: '1' // 只获取已发布的通知
    })
    notices.value = (res as any).list || []
  } catch (error) {
    console.error('获取通知列表失败', error)
    notices.value = []
  } finally {
    loading.value = false
  }
}

// 获取通知类型标签样式
const getNoticeTypeTag = (type: string) => {
  // 根据类型返回不同的标签样式，与通知管理模块保持一致
  const typeMap: Record<string, string> = {
    '2001': 'warning', // 橙色
    '2002': 'primary', // 蓝色
    '2003': 'success', // 绿色
    '2004': 'danger' // 红色
  }
  return typeMap[type] || 'info'
}

// 查看通知详情
const viewNotice = (id: string) => {
  router.push(`/noticeDetail?id=${id}`)
}

// 跳转到通知管理页面
const goToNoticePage = () => {
  router.push('/noticeManage')
}

onMounted(() => {
  fetchNotices()
})
</script>

<style scoped lang="less">
.latest-notices-card {
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
      color-mix(in srgb, var(--el-color-primary) 85%, white) 0%,
      color-mix(in srgb, var(--el-color-primary) 75%, white) 100%);
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

  .notices-container {
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

  .notices-list {
    flex: 1;
    padding: 8px 0;
  }

  .notice-item {
    padding: 16px 24px;
    display: flex;
    align-items: center;
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
        color-mix(in srgb, var(--el-color-primary) 8%, #f8fafc) 0%,
        color-mix(in srgb, var(--el-color-primary) 5%, #e2e8f0) 50%,
        color-mix(in srgb, var(--el-color-primary) 8%, #f1f5f9) 100%);
      transform: translateX(4px);

      .notice-title {
        color: var(--el-color-primary);
      }

      .action-btn {
        background: var(--el-color-primary);
        color: white;
        transform: translateX(4px);
      }

      .type-tag {
        transform: scale(1.05);
      }
    }

    .notice-left {
      flex: 1;
      display: flex;
      align-items: flex-start;
      gap: 12px;
    }

    .notice-type-badge {
      margin-top: 2px;

      .type-tag {
        border-radius: 8px;
        font-weight: 600;
        transition: all 0.3s ease;
        border: none;
        font-size: 11px;
        padding: 4px 8px;
      }
    }

    .notice-content {
      flex: 1;

      .notice-title {
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

      .notice-meta {
        display: flex;
        align-items: center;
        gap: 8px;
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

        .meta-divider {
          color: #d1d5db;
          font-weight: bold;
        }
      }
    }

    .notice-right {
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

// 响应式设计
@media (max-width: 768px) {
  .latest-notices-card {
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

    .notice-item {
      padding: 12px 20px;

      .notice-content {
        .notice-title {
          font-size: 14px;
        }

        .notice-meta {
          font-size: 11px;
        }
      }
    }
  }
}
</style>
