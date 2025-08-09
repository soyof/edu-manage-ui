<template>
  <el-card class="latest-research-card">
    <template #header>
      <div class="card-header">
        <div class="header-title">
          <div class="icon-wrapper research-icon">
            <el-icon><Trophy /></el-icon>
          </div>
          <span class="title-text">最新科研成果</span>
          <div class="title-badge">{{ currentResearchList.length }}</div>
        </div>
        <div class="header-tabs">
          <el-tabs
            v-model="activeResearchTab"
            class="research-tabs"
            @tabClick="handleResearchTabChange"
          >
            <el-tab-pane label="论文" name="papers">
              <template #label>
                <div class="tab-label">
                  <el-icon><Document /></el-icon>
                  <span>论文</span>
                </div>
              </template>
            </el-tab-pane>
            <el-tab-pane label="专利" name="patents">
              <template #label>
                <div class="tab-label">
                  <el-icon><Medal /></el-icon>
                  <span>专利</span>
                </div>
              </template>
            </el-tab-pane>
            <el-tab-pane label="著作" name="books">
              <template #label>
                <div class="tab-label">
                  <el-icon><Reading /></el-icon>
                  <span>著作</span>
                </div>
              </template>
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>
    </template>
    <div class="research-container">
      <div v-if="loading" class="loading-wrapper">
        <el-skeleton :rows="3" animated />
      </div>
      <div v-else-if="currentResearchList.length === 0" class="empty-wrapper">
        <el-empty
          :description="`暂无${getResearchTypeName()}数据`"
          :imageSize="120"
          class="custom-empty"
        >
          <template #image>
            <div class="empty-icon">
              <el-icon><Trophy /></el-icon>
            </div>
          </template>
        </el-empty>
      </div>
      <div v-else class="research-list">
        <div
          v-for="(item, index) in currentResearchList"
          :key="item.id"
          class="research-item animate__animated animate__fadeInUp"
          :style="{ animationDelay: `${index * 0.1}s` }"
          @click="viewResearch(item)"
        >
          <div class="research-left">
            <div class="research-icon-wrapper">
              <div class="research-type-icon" :class="getResearchIconClass(activeResearchTab)">
                <el-icon><component :is="getResearchIcon(activeResearchTab)" /></el-icon>
              </div>
            </div>
            <div class="research-content">
              <div class="research-header">
                <el-tag
                  size="small"
                  :type="getResearchTypeTag(activeResearchTab)"
                  effect="light"
                  class="research-type-tag"
                >
                  {{ getResearchTypeName() }}
                </el-tag>
                <span class="research-time">
                  <el-icon><Calendar /></el-icon>
                  {{ getDisplayTime(item) }}
                </span>
              </div>
              <h4 class="research-title">{{ item.title }}</h4>
              <div class="research-meta">
                <span class="meta-item">
                  <el-icon><User /></el-icon>
                  {{ getDisplayUser(item) }}
                </span>
                <span v-if="getDisplayAuthor(item)" class="meta-item">
                  <el-icon><User /></el-icon>
                  {{ getDisplayAuthor(item) }}
                </span>
                <span v-if="getSpecialInfo(item)" class="meta-item">
                  <el-icon><InfoFilled /></el-icon>
                  {{ getSpecialInfo(item) }}
                </span>
              </div>
            </div>
          </div>
          <div class="research-right">
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
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  Trophy, ArrowRight, Calendar, User,
  Document, Medal, Reading, InfoFilled
} from '@element-plus/icons-vue'
import service from '@/utils/services'

// 类型定义
interface ResearchItem {
  id: string
  title: string
  // 论文字段
  paperPublishTimes?: string // 论文发布时间
  // 专利字段
  applicationNum?: string // 申请号
  applicants?: string // 申请人
  applicationDate?: string // 申请日期
  authorizationDate?: string // 授权日期
  patentPublishDate?: string // 专利发布日期
  isServicePatent?: string // 是否职务专利
  // 著作字段
  author?: string // 作者
  authorEn?: string // 英文作者
  bookPublishDate?: string // 著作发布日期
  isTranslated?: string // 是否译成外文
  // 通用字段
  publishTimes?: string // 发布时间
  createdTimes?: string // 创建时间
  updatedTimes?: string // 更新时间
  publishUserName?: string // 发布人
  createUserName?: string // 创建人
  updateUserName?: string // 更新人
  publishStatus?: string // 发布状态
}

const router = useRouter()
const loading = ref(false)
const activeResearchTab = ref('papers')

// 科研成果数据
const researchData = reactive({
  papers: [] as ResearchItem[],
  patents: [] as ResearchItem[],
  books: [] as ResearchItem[]
})

// 计算属性：当前科研成果列表
const currentResearchList = computed(() => {
  return researchData[activeResearchTab.value as keyof typeof researchData] || []
})

// 获取科研成果数据
const fetchResearchData = async() => {
  loading.value = true
  try {
    const apiMap: Record<string, string> = {
      'papers': '/api/paper/list',
      'patents': '/api/patent/list',
      'books': '/api/book/list'
    }

    const api = apiMap[activeResearchTab.value]
    if (api) {
      const res = await service.post(api, {
        pageNum: 1,
        pageSize: 5,
        publishStatus: '1' // 只获取已发布的成果（1-已发布）
      })
      researchData[activeResearchTab.value as keyof typeof researchData] = (res as any).list || []
    }
  } catch (error) {
    console.error('获取科研成果数据失败', error)
    researchData[activeResearchTab.value as keyof typeof researchData] = []
  } finally {
    loading.value = false
  }
}

// 获取研究类型名称
const getResearchTypeName = () => {
  const typeMap: Record<string, string> = {
    'papers': '论文',
    'patents': '专利',
    'books': '著作'
  }
  return typeMap[activeResearchTab.value] || '成果'
}

// 获取研究类型标签
const getResearchTypeTag = (type: string) => {
  const typeMap: Record<string, string> = {
    'papers': 'primary',
    'patents': 'warning',
    'books': 'success'
  }
  return typeMap[type] || 'info'
}

// 获取研究类型图标
const getResearchIcon = (type: string) => {
  const iconMap: Record<string, any> = {
    'papers': Document,
    'patents': Medal,
    'books': Reading
  }
  return iconMap[type] || Document
}

// 获取研究图标类名
const getResearchIconClass = (type: string) => {
  const classMap: Record<string, string> = {
    'papers': 'papers-icon',
    'patents': 'patents-icon',
    'books': 'books-icon'
  }
  return classMap[type] || 'papers-icon'
}

// 获取显示时间
const getDisplayTime = (item: ResearchItem): string => {
  switch (activeResearchTab.value) {
    case 'papers':
      return item.paperPublishTimes || item.publishTimes || item.createdTimes || ''
    case 'patents':
      return item.patentPublishDate || item.authorizationDate || item.applicationDate || item.publishTimes || item.createdTimes || ''
    case 'books':
      return item.bookPublishDate || item.publishTimes || item.createdTimes || ''
    default:
      return item.publishTimes || item.createdTimes || ''
  }
}

// 获取显示用户
const getDisplayUser = (item: ResearchItem): string => {
  return item.publishUserName || item.createUserName || '未知'
}

// 获取显示作者（仅专利和著作有）
const getDisplayAuthor = (item: ResearchItem): string => {
  switch (activeResearchTab.value) {
    case 'patents':
      return item.applicants || ''
    case 'books':
      return item.author || ''
    default:
      return ''
  }
}

// 获取特殊信息
const getSpecialInfo = (item: ResearchItem): string => {
  switch (activeResearchTab.value) {
    case 'patents':
      if (item.applicationNum) {
        return `申请号: ${item.applicationNum}`
      }
      if (item.isServicePatent === '1') {
        return '职务专利'
      }
      break
    case 'books':
      if (item.isTranslated === '1') {
        return '已译成外文'
      }
      break
    default:
      break
  }
  return ''
}

// 处理研究标签页变化
const handleResearchTabChange = (tab: any) => {
  activeResearchTab.value = tab.props.name
  fetchResearchData()
}

// 查看研究详情
const viewResearch = (item: ResearchItem) => {
  const routeMap: Record<string, string> = {
    'papers': `/paperDetail?id=${item.id}`,
    'patents': `/patentDetail?id=${item.id}`,
    'books': `/bookDetail?id=${item.id}`
  }
  const route = routeMap[activeResearchTab.value]
  if (route) {
    router.push(route)
  }
}

onMounted(() => {
  fetchResearchData()
})
</script>

<style scoped lang="less">
.latest-research-card {
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
      color-mix(in srgb, var(--el-color-warning) 85%, white) 0%,
      color-mix(in srgb, var(--el-color-warning) 75%, white) 100%);
    border: none;
    padding: 20px 24px;
    position: relative;
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      right: 0;
      width: 150px;
      height: 150px;
      background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
      border-radius: 50%;
      transform: translate(50px, -50px);
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

    .header-tabs {
      .research-tabs {
        :deep(.el-tabs__header) {
          margin: 0;

          .el-tabs__nav-wrap {
            &::after {
              display: none;
            }
          }

          .el-tabs__nav {
            border: none;

            .el-tabs__item {
              color: rgba(255, 255, 255, 0.7);
              border: none;
              padding: 8px 16px;
              font-size: 14px;
              font-weight: 500;
              transition: all 0.3s ease;

              &:hover {
                color: white;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 8px;
              }

              &.is-active {
                color: white;
                background: rgba(255, 255, 255, 0.2);
                border-radius: 8px;
                border: 1px solid rgba(255, 255, 255, 0.3);
              }

              .tab-label {
                display: flex;
                align-items: center;
                gap: 6px;

                .el-icon {
                  font-size: 14px;
                }
              }
            }
          }

          .el-tabs__active-bar {
            display: none;
          }
        }
      }
    }
  }

  .research-container {
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

  .research-list {
    flex: 1;
    padding: 8px 0;
  }

  .research-item {
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
        color-mix(in srgb, var(--el-color-warning) 8%, #fefcf3) 0%,
        color-mix(in srgb, var(--el-color-warning) 5%, #fef3c7) 50%,
        color-mix(in srgb, var(--el-color-warning) 8%, #fefcf3) 100%);
      transform: translateX(4px);

      .research-title {
        color: var(--el-color-warning);
      }

      .action-btn {
        background: var(--el-color-warning);
        color: white;
        transform: translateX(4px);
      }

      .research-type-icon {
        transform: scale(1.1) rotate(5deg);
      }

      .research-type-tag {
        transform: scale(1.05);
      }
    }

    .research-left {
      flex: 1;
      display: flex;
      align-items: flex-start;
      gap: 16px;
    }

    .research-icon-wrapper {
      margin-top: 4px;

      .research-type-icon {
        width: 40px;
        height: 40px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;

        &.papers-icon {
          background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
          color: #3b82f6;
        }

        &.patents-icon {
          background: linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%);
          color: #f59e0b;
        }

        &.books-icon {
          background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
          color: #10b981;
        }

        .el-icon {
          font-size: 18px;
        }
      }
    }

    .research-content {
      flex: 1;

      .research-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 8px;

        .research-type-tag {
          border-radius: 8px;
          font-weight: 600;
          transition: all 0.3s ease;
          border: none;
          font-size: 11px;
          padding: 4px 8px;
        }

        .research-time {
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

      .research-title {
        font-size: 15px;
        font-weight: 600;
        color: #1f2937;
        margin: 0 0 12px 0;
        line-height: 1.4;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        line-clamp: 2;
        overflow: hidden;
        transition: color 0.3s ease;
      }

      .research-meta {
        display: flex;
        align-items: center;
        gap: 8px;
        color: #6b7280;
        font-size: 12px;
        flex-wrap: wrap;

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

    .research-right {
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

// 响应式设计
@media (max-width: 1024px) {
  .latest-research-card {
    .card-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 16px;
    }
  }
}

@media (max-width: 768px) {
  .latest-research-card {
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

      .header-tabs {
        width: 100%;

        .research-tabs {
          :deep(.el-tabs__header) {
            .el-tabs__nav {
              .el-tabs__item {
                padding: 6px 12px;
                font-size: 13px;

                .tab-label {
                  gap: 4px;

                  .el-icon {
                    font-size: 12px;
                  }
                }
              }
            }
          }
        }
      }
    }

    .research-item {
      padding: 12px 20px;

      .research-left {
        gap: 12px;
      }

      .research-icon-wrapper {
        .research-type-icon {
          width: 36px;
          height: 36px;

          .el-icon {
            font-size: 16px;
          }
        }
      }

      .research-content {
        .research-title {
          font-size: 14px;
        }

        .research-meta {
          font-size: 11px;
        }
      }
    }
  }
}
</style>
