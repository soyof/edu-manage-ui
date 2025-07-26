<template>
  <div class="tool-detail-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1 class="page-title">{{ pageTitle }}</h1>
      <div class="page-actions">
        <div class="status-indicator">
          <div class="status-dot" :class="'status-' + toolDetail.publishStatus"></div>
          <span class="status-text">{{ getStatusName(toolDetail.publishStatus) }}</span>
        </div>
      </div>
    </div>

    <el-skeleton :loading="loading" animated>
      <template #template>
        <div class="skeleton-container">
          <el-skeleton-item variant="p" style="width: 100%; height: 60px;" />
          <div style="margin-top: 24px;">
            <el-skeleton-item variant="h3" style="width: 40%; margin-bottom: 16px;" />
            <el-skeleton-item v-for="i in 5" :key="i" variant="text"
              style="width: 100%; margin-bottom: 12px;"
            />
          </div>
          <div style="margin-top: 32px;">
            <el-skeleton-item variant="h3" style="width: 40%; margin-bottom: 16px;" />
            <el-skeleton-item v-for="i in 5" :key="i" variant="text"
              style="width: 100%; margin-bottom: 12px;"
            />
          </div>
        </div>
      </template>

      <template #default>
        <div class="detail-content">
          <!-- 基本信息卡片 -->
          <div class="detail-card">
            <div class="card-header">
              <div class="header-left">
                <el-icon class="header-icon"><Document /></el-icon>
                <span class="header-text">基本信息</span>
              </div>
            </div>
            <div class="card-body">
              <div class="info-grid">
                <div class="info-item">
                  <div class="info-label">工具标题</div>
                  <div class="info-value highlight">{{ toolDetail.title }}</div>
                </div>
                <div v-if="toolDetail.titleEn" class="info-item">
                  <div class="info-label">英文标题</div>
                  <div class="info-value">{{ toolDetail.titleEn }}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">工具类型</div>
                  <div class="info-value">
                    <el-tag size="small" effect="plain" class="type-tag">
                      {{ toolDetail.toolTypeName }}
                    </el-tag>
                  </div>
                </div>
                <div class="info-item full-width">
                  <div class="info-label">工具地址</div>
                  <div class="url-container">
                    <a class="info-link" :href="ensureUrlProtocol(toolDetail.toolUrl)" target="_blank"
                      rel="noopener noreferrer"
                    >
                      {{ toolDetail.toolUrl }}
                    </a>
                    <el-button
                      type="primary"
                      link
                      size="small"
                      :icon="Link"
                      class="visit-btn"
                      @click="openUrl(toolDetail.toolUrl)"
                    >
                      访问
                    </el-button>
                  </div>
                </div>
              </div>

              <el-divider contentPosition="center">详细信息</el-divider>

              <div class="meta-info-grid">
                <!-- 人员信息在上 -->
                <div class="meta-item">
                  <div class="meta-icon"><el-icon><User /></el-icon></div>
                  <div class="meta-content">
                    <div class="meta-label">创建人</div>
                    <div class="meta-value">{{ toolDetail.createUserName }}</div>
                  </div>
                </div>
                <div class="meta-item">
                  <div class="meta-icon"><el-icon><UserFilled /></el-icon></div>
                  <div class="meta-content">
                    <div class="meta-label">发布人</div>
                    <div class="meta-value">{{ toolDetail.publishUserName || '未发布' }}</div>
                  </div>
                </div>
                <div class="meta-item">
                  <div class="meta-icon"><el-icon><EditPen /></el-icon></div>
                  <div class="meta-content">
                    <div class="meta-label">更新人</div>
                    <div class="meta-value">{{ toolDetail.updateUserName || '无更新' }}</div>
                  </div>
                </div>

                <!-- 时间信息在下 -->
                <div class="meta-item">
                  <div class="meta-icon"><el-icon><Calendar /></el-icon></div>
                  <div class="meta-content">
                    <div class="meta-label">创建时间</div>
                    <div class="meta-value">{{ toolDetail.createdTimes }}</div>
                  </div>
                </div>
                <div class="meta-item">
                  <div class="meta-icon"><el-icon><Timer /></el-icon></div>
                  <div class="meta-content">
                    <div class="meta-label">发布时间</div>
                    <div class="meta-value">{{ toolDetail.publishTimes || '未发布' }}</div>
                  </div>
                </div>
                <div class="meta-item">
                  <div class="meta-icon"><el-icon><Clock /></el-icon></div>
                  <div class="meta-content">
                    <div class="meta-label">更新时间</div>
                    <div class="meta-value">{{ toolDetail.updatedTimes || '无更新' }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 工具描述卡片 -->
          <div class="detail-card">
            <div class="card-header">
              <div class="header-left">
                <el-icon class="header-icon"><Comment /></el-icon>
                <span class="header-text">工具描述</span>
              </div>
            </div>
            <div class="card-body">
              <!-- 描述标签页 -->
              <el-tabs type="border-card" class="custom-tabs">
                <el-tab-pane label="中文描述">
                  <div v-if="toolDetail.description" class="description-content">
                    {{ toolDetail.description }}
                  </div>
                  <el-empty v-else description="暂无中文描述" :imageSize="120" />
                </el-tab-pane>
                <el-tab-pane label="英文描述">
                  <div v-if="toolDetail.descriptionEn" class="description-content">
                    {{ toolDetail.descriptionEn }}
                  </div>
                  <el-empty v-else description="暂无英文描述" :imageSize="120" />
                </el-tab-pane>
              </el-tabs>
            </div>
          </div>
        </div>
      </template>
    </el-skeleton>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import {
  Document,
  Comment,
  User,
  UserFilled,
  Calendar,
  Clock,
  Timer,
  Link,
  EditPen
} from '@element-plus/icons-vue'
import service from '@/utils/services'
import { createStatusConfig } from '@/dic/statusConfig'
import { useDictionary } from '@/hooks/useDictionary'
import useLoading from '@/hooks/useLoading'

const { loading, changeLoading, closeLoading } = useLoading()
const route = useRoute()
const toolId = route.query.id as string

// 创建工具状态配置
const ToolStatus = createStatusConfig('待发布', '已发布', '已下线')

// 获取工具类型字典
const ToolTypeDict = useDictionary({
  dictType: 'opensource_tool_type',
  autoLoad: true
})

// 页面标题
const pageTitle = computed(() => {
  if (!toolDetail.value.title) return '工具详情'
  return `【${toolDetail.value.title}】详情`
})

// 工具详情数据
const toolDetail = ref({
  id: 0,
  title: '',
  titleEn: '',
  description: '',
  descriptionEn: '',
  toolType: '',
  toolTypeName: '',
  toolUrl: '',
  publishStatus: '',
  publishTimes: '',
  publishUserName: '',
  createUserName: '',
  createdTimes: '',
  updateUserName: '',
  updatedTimes: ''
})

// 获取状态对应的标签类型
const getStatusTagType = (status: string) => {
  return ToolStatus.getTagType(status)
}

// 获取状态名称
const getStatusName = (status: string) => {
  return ToolStatus.getName(status)
}

// 确保URL可访问
const ensureUrlProtocol = (url: string): string => {
  if (!url) return '#'
  return url // URL已经通过验证，应该包含协议前缀
}

// 打开URL
const openUrl = (url: string) => {
  if (!url) return
  const fullUrl = url.startsWith('http') ? url : `https://${url}`
  window.open(fullUrl, '_blank', 'noopener,noreferrer')
}

// 获取工具详情数据
const fetchToolDetail = () => {
  if (!toolId) return

  changeLoading(true)
  service.post('/api/tool/detail', { id: toolId })
    .then(res => {
      if (res && typeof res === 'object') {
        // 使用类型断言处理API响应
        const toolData = res as any
        toolDetail.value = {
          id: toolData.id || 0,
          title: toolData.title || '',
          titleEn: toolData.titleEn || '',
          description: toolData.description || '',
          descriptionEn: toolData.descriptionEn || '',
          toolType: toolData.toolType || '',
          toolTypeName: ToolTypeDict.getDictLabel(toolData.toolType || ''),
          toolUrl: toolData.toolUrl || '',
          publishStatus: toolData.publishStatus || '',
          publishTimes: toolData.publishTimes || '',
          publishUserName: toolData.publishUserName || '',
          createUserName: toolData.createUserName || '',
          createdTimes: toolData.createdTimes || '',
          updateUserName: toolData.updateUserName || '',
          updatedTimes: toolData.updatedTimes || ''
        }
      }
    })
    .finally(() => {
      closeLoading()
    })
}

// 初始化
onMounted(() => {
  fetchToolDetail()
})
</script>

<style scoped lang="less">
.tool-detail-container {
  width: 100%;

  // 页面标题样式
  .page-header {
    position: sticky;
    top: 0;
    z-index: 10;
    padding: 16px 12px;
    margin-bottom: 24px;
    background-color: rgba(255, 255, 255, 0.96);
    backdrop-filter: blur(10px);
    display: flex;
    justify-content: space-between;
    align-items: center;

    .page-title {
      font-size: 22px;
      font-weight: 600;
      color: #303133;
      margin: 0;
      background: linear-gradient(135deg, var(--el-color-primary), #409eff);
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
      text-shadow: 0 0 1px rgba(var(--el-color-primary-rgb), 0.1);
      animation: fadeIn 0.6s ease-out;
    }

    .status-indicator {
      display: flex;
      align-items: center;
      background: rgba(0, 0, 0, 0.03);
      padding: 5px 12px;
      border-radius: 30px;

      .status-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        margin-right: 8px;

        &.status-0 {
          background-color: #faad14; // 待发布
          box-shadow: 0 0 0 3px rgba(250, 173, 20, 0.15);
        }

        &.status-1 {
          background-color: #52c41a; // 已发布
          box-shadow: 0 0 0 3px rgba(82, 196, 26, 0.15);
        }

        &.status-2 {
          background-color: #f5222d; // 已下线
          box-shadow: 0 0 0 3px rgba(245, 34, 45, 0.15);
        }
      }

      .status-text {
        font-size: 14px;
        color: #595959;
        font-weight: 500;
      }
    }
  }

  // 骨架屏样式
  .skeleton-container {
    padding: 24px;
    background-color: #fff;
    border-radius: 16px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
  }

  // 详情内容区域
  .detail-content {
    display: flex;
    flex-direction: column;
    gap: 32px;
    animation: fadeIn 0.6s ease-out;
  }

  // 详情卡片通用样式
  .detail-card {
    background-color: #fff;
    border-radius: 16px;
    box-shadow:
      0 4px 20px rgba(0, 0, 0, 0.03),
      0 1px 3px rgba(0, 0, 0, 0.05);
    overflow: hidden;
    transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
    border: 1px solid rgba(0, 0, 0, 0.03);

    &:hover {
      box-shadow:
        0 8px 24px rgba(0, 0, 0, 0.06),
        0 2px 6px rgba(0, 0, 0, 0.04);
      transform: translateY(-2px);
    }

    // 卡片标题
    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 24px;
      background: #fafbfd; // 修改为浅色背景
      border-bottom: 1px solid rgba(0, 0, 0, 0.03);

      .header-left {
        display: flex;
        align-items: center;
      }

      .header-icon {
        font-size: 18px;
        color: var(--el-color-primary);
        margin-right: 12px;
      }

      .header-text {
        font-size: 17px;
        font-weight: 600;
        color: #262626;
        letter-spacing: 0.3px;
      }

      .status-tag {
        font-weight: 500;
      }
    }

    // 卡片内容
    .card-body {
      padding: 24px;
    }
  }

  // 基本信息网格布局
  .info-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;

    .info-item {
      &.full-width {
        grid-column: span 3;
      }

      .info-label {
        color: #909399;
        font-size: 14px;
        margin-bottom: 8px;
        font-weight: 500;
      }

      .info-value {
        color: #303133;
        font-size: 15px;
        word-break: break-word;

        &.highlight {
          color: #303133;
          font-size: 16px;
          font-weight: 600;
        }
      }

      .info-link {
        color: var(--el-color-primary);
        text-decoration: none;
        font-size: 15px;
        word-break: break-word;

        &:hover {
          text-decoration: underline;
        }
      }

      .url-container {
        display: flex;
        align-items: center;
        gap: 12px;
        flex-wrap: wrap;

        .visit-btn {
          white-space: nowrap;
        }
      }

      .type-tag {
        font-size: 13px;
      }
    }
  }

  // 元数据网格布局
  .meta-info-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(2, auto);
    gap: 20px;
    margin-top: 8px;

    // 前三个元素属于第一行（人员信息）
    .meta-item:nth-child(-n+3) {
      border-bottom: 1px dashed rgba(0, 0, 0, 0.05);
      padding-bottom: 16px;
    }

    // 后三个元素属于第二行（时间信息）
    .meta-item:nth-child(n+4) {
      padding-top: 16px;
    }

    .meta-item {
      display: flex;
      align-items: center;
      padding: 12px;
      border-radius: 8px;
      background-color: #f9fafc;
      transition: all 0.2s;

      &:hover {
        background-color: #f2f6fc;
      }

      .meta-icon {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background-color: rgba(var(--el-color-primary-rgb), 0.1);
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 12px;
        color: var(--el-color-primary);
        font-size: 18px;
      }

      .meta-content {
        .meta-label {
          font-size: 13px;
          color: #909399;
          margin-bottom: 2px;
        }

        .meta-value {
          font-size: 14px;
          color: #303133;
          font-weight: 500;
        }
      }
    }
  }

  // 描述标签页自定义样式
  .custom-tabs {
    border: none !important;
    box-shadow: none !important;

    :deep(.el-tabs__header) {
      margin-bottom: 20px;
      background: transparent;
      border: none;

      .el-tabs__nav {
        border: none;
      }

      .el-tabs__item {
        height: 40px;
        padding: 0 20px;
        font-size: 15px;
        transition: all 0.3s;
        border: none;
        color: #606266;

        &.is-active {
          color: var(--el-color-primary);
          font-weight: 600;

          &::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 50%;
            transform: translateX(-50%);
            width: 30px;
            height: 3px;
            border-radius: 3px;
            background-color: var(--el-color-primary);
          }
        }

        &:hover {
          color: var(--el-color-primary);
        }
      }
    }

    :deep(.el-tabs__content) {
      padding: 0;
      border: none;
    }
  }

  // 描述内容样式
  .description-content {
    padding: 24px;
    background-color: #f9fafc;
    border-radius: 8px;
    line-height: 1.7;
    white-space: pre-wrap;
    word-break: break-word;
    color: #333;
    border: 1px solid rgba(0, 0, 0, 0.03);
  }

  // 自定义分隔线样式
  :deep(.el-divider--center) {
    .el-divider__text {
      font-size: 14px;
      color: #909399;
      background-color: #fff;
    }
  }

  // 淡入动画
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
}

// 响应式调整
@media (max-width: 992px) {
  .tool-detail-container {
    .info-grid {
      grid-template-columns: repeat(2, 1fr);

      .info-item.full-width {
        grid-column: span 2;
      }
    }

    .meta-info-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
}

@media (max-width: 768px) {
  .tool-detail-container {
    padding: 0 12px 24px;

    .page-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
      margin-bottom: 16px;

      .page-title {
        font-size: 20px;
      }
    }

    .info-grid,
    .meta-info-grid {
      grid-template-columns: 1fr;
      gap: 16px;

      .info-item.full-width {
        grid-column: span 1;
      }
    }

    .detail-card {
      border-radius: 12px;

      .card-header {
        padding: 12px 16px;
      }

      .card-body {
        padding: 16px;
      }
    }
  }
}
</style>
