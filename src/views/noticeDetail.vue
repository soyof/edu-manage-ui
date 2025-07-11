<template>
  <div class="notice-detail-container">
    <div class="notice-content-wrapper">
      <!-- 通知不存在或加载失败 -->
      <el-empty v-if="!noticeData.id && !loading" description="未找到通知内容" />

      <!-- 通知内容 -->
      <div v-else-if="noticeData.id" class="notice-content">
        <!-- 通知标题和元数据 -->
        <div class="notice-header">
          <div class="header-banner">
            <div class="notice-type-tag">
              <el-tag size="small" effect="dark" class="type-tag">{{ getNoticeTypeName(noticeData.noticeType) }}</el-tag>
            </div>
            <h1 class="title">{{ noticeData.title }}</h1>
            <div class="header-status">
              <el-tag
                size="small"
                :type="getImportanceType(noticeData.importance)"
                :effect="noticeData.importance === '3003' ? 'dark' : 'light'"
                class="importance-tag"
              >
                {{ getImportanceName(noticeData.importance) }}
              </el-tag>
              <el-tag
                size="small"
                :type="getStatusType(noticeData.publishStatus)"
                class="status-tag"
              >
                {{ getStatusName(noticeData.publishStatus) }}
              </el-tag>
            </div>
          </div>

          <div class="meta-card">
            <div class="meta-section">
              <div class="section-title">
                <el-icon><Calendar /></el-icon>
                <span>时间信息</span>
              </div>
              <div class="meta-content">
                <div class="meta-item">
                  <span class="label">发布时间</span>
                  <span class="value">{{ noticeData.publishTime || '未发布' }}</span>
                </div>
                <div class="meta-item">
                  <span class="label">创建时间</span>
                  <span class="value">{{ noticeData.createdTimes }}</span>
                </div>
                <div class="meta-item">
                  <span class="label">更新时间</span>
                  <span class="value">{{ noticeData.updatedTimes }}</span>
                </div>
              </div>
            </div>

            <div class="meta-section">
              <div class="section-title">
                <el-icon><User /></el-icon>
                <span>人员信息</span>
              </div>
              <div class="meta-content">
                <div class="meta-item">
                  <span class="label">创建人</span>
                  <span class="value">{{ noticeData.createUserName || '未知' }}</span>
                </div>
                <div class="meta-item">
                  <span class="label">更新人</span>
                  <span class="value">{{ noticeData.updateUserName || '未知' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 文本类型通知 -->
        <div v-if="isTextType" class="notice-body">
          <el-tabs type="border-card">
            <el-tab-pane label="中文内容">
              <div class="content-wrapper">
                <div
                  class="rich-text-content"
                  v-html="noticeData.content"
                ></div>
              </div>
            </el-tab-pane>
            <el-tab-pane v-if="hasEnglishContent" label="英文内容">
              <div v-if="noticeData.contentEn" class="content-wrapper">
                <div
                  class="rich-text-content"
                  v-html="noticeData.contentEn"
                ></div>
              </div>
              <el-empty v-else description="暂无英文内容" />
            </el-tab-pane>
          </el-tabs>
        </div>

        <!-- 链接类型通知 -->
        <div v-else class="notice-body link-type">
          <el-alert
            title="此通知为链接类型，点击下方链接访问详细内容"
            type="info"
            :closable="false"
            showIcon
          />
          <div class="link-url">
            <a :href="noticeData.linkUrl || noticeData.content" target="_blank" rel="noopener noreferrer">
              {{ noticeData.linkUrl || noticeData.content }}
              <el-icon class="external-icon"><TopRight /></el-icon>
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { TopRight, Calendar, User } from '@element-plus/icons-vue'
import service from '@/utils/services'
import { useDictionary } from '@/hooks/useDictionary'
import useLoading from '@/hooks/useLoading'
import { useThemeStore } from '@/stores/theme'

const themeStore = useThemeStore()
const { changeLoading, closeLoading, loading } = useLoading({
  target: '.notice-content-wrapper'
})

// 路由相关
const route = useRoute()
const noticeId = ref(route.query.id as string)

// 字典数据
const { getDictLabel: getNoticeTypeName } = useDictionary({
  dictType: 'notice_type',
  autoLoad: true
})

const { getDictLabel: getImportanceName } = useDictionary({
  dictType: 'notice_importance',
  autoLoad: true
})

// 状态信息
const statusMap = {
  '0': { name: '待发布', type: 'info' },
  '1': { name: '已发布', type: 'success' },
  '2': { name: '已下线', type: 'warning' }
}

// 获取状态名称
const getStatusName = (status: string | number) => {
  const statusKey = String(status)
  console.log(statusKey)

  return statusMap[statusKey as keyof typeof statusMap]?.name || '未知状态'
}

// 获取状态类型
const getStatusType = (status: string | number) => {
  const statusKey = String(status)
  return statusMap[statusKey as keyof typeof statusMap]?.type || 'info'
}

// 获取重要程度类型
const getImportanceType = (importance: string | number) => {
  const importanceStr = String(importance)
  if (importanceStr === '3003') return 'danger'
  if (importanceStr === '3002') return 'warning'
  return 'info'
}

// 通知数据
const noticeData = reactive({
  id: '',
  title: '',
  titleEn: '',
  noticeType: '',
  importance: '',
  content: '',
  contentEn: '',
  linkUrl: '',
  publishStatus: '',
  publishTime: '',
  createdTimes: '',
  updatedTimes: '',
  createUserName: '',
  updateUserName: ''
})

// 是否为文本类型通知
const isTextType = computed(() => {
  return String(noticeData.noticeType) === '2002'
})

// 是否有英文内容
const hasEnglishContent = computed(() => {
  return Boolean(noticeData.titleEn || noticeData.contentEn)
})

// 获取通知详情
const fetchNoticeDetail = () => {
  if (!noticeId.value) return

  changeLoading(true)

  service.post(`/api/notice/detail`, {
    id: noticeId.value
  }).then((res: any) => {
    if (res) {
      Object.assign(noticeData, res)

      // 处理链接类型通知
      if (!isTextType.value && res.content && !res.linkUrl) {
        noticeData.linkUrl = res.content
      }
    }
  }).finally(() => {
    closeLoading()
  })
}

// 页面初始化
onMounted(() => {
  fetchNoticeDetail()
})
</script>

<style scoped lang="less">
.notice-detail-container {
  position: relative;
  padding: 20px;
  background-color: @pageBgColor;
  min-height: calc(100vh - 120px);

  .notice-content-wrapper {
    background-color: #fff;
    border-radius: 12px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
    min-height: 400px;
    overflow: hidden;
  }

  .notice-content {
    .notice-header {
      padding: 0;

      .header-banner {
        position: relative;
        padding: 32px 40px;
        background: linear-gradient(135deg,
          color-mix(in srgb, var(--menuBgColor) 15%, white) 0%,
          color-mix(in srgb, var(--menuBgColor) 30%, white) 100%);
        text-align: center;

        .notice-type-tag {
          position: absolute;
          top: 16px;
          left: 16px;

          .type-tag {
            font-size: 12px;
            font-weight: 500;
            background-color: color-mix(in srgb, var(--primaryColor) 80%, white);
            color: white;
            border: none;
          }
        }

        .title {
          font-size: 28px;
          font-weight: 700;
          margin: 16px 0;
          color: var(--el-text-color-primary);
          line-height: 1.4;
          text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.05);
        }

        .header-status {
          display: flex;
          justify-content: center;
          gap: 12px;
          margin-top: 12px;

          .importance-tag,
          .status-tag {
            padding: 0 12px;
            height: 24px;
            line-height: 22px;
            border-radius: 12px;
            font-weight: 500;
          }
        }
      }

      .meta-card {
        margin: 20px;
        padding: 0;
        border-radius: 8px;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
        border: 1px solid #ebeef5;
        overflow: hidden;

        .meta-section {
          &:not(:last-child) {
            border-bottom: 1px solid #ebeef5;
          }

          .section-title {
            display: flex;
            align-items: center;
            padding: 12px 16px;
            background-color: color-mix(in srgb, var(--menuBgColor) 10%, white);
            font-weight: 600;
            color: var(--el-text-color-primary);
            font-size: 14px;

            .el-icon {
              margin-right: 8px;
              font-size: 16px;
              color: var(--primaryColor);
            }
          }

          .meta-content {
            display: flex;
            flex-wrap: wrap;
            padding: 16px;
            background-color: #fff;

            .meta-item {
              display: flex;
              align-items: center;
              margin-right: 32px;
              margin-bottom: 8px;
              min-width: 200px;

              .label {
                color: #909399;
                font-size: 14px;
                position: relative;
                padding-right: 10px;

                &::after {
                  content: "：";
                  position: absolute;
                  right: 0;
                  top: 0;
                }
              }

              .value {
                color: #303133;
                font-weight: 500;
              }
            }
          }
        }
      }
    }

    .notice-body {
      padding: 0;
      min-height: 300px;

      :deep(.el-tabs__header) {
        margin: 0;

        .el-tabs__nav {
          border: none;
        }

        .el-tabs__item {
          height: 50px;
          line-height: 50px;
          font-size: 16px;

          &.is-active {
            font-weight: 600;
            color: var(--primaryColor);
            background-color: color-mix(in srgb, var(--primaryColor) 5%, white);
          }
        }
      }

      .content-wrapper {
        min-height: 300px;
        padding: 0;
      }

      :deep(.el-tabs__content) {
        padding: 20px;
      }

      &.link-type {
        padding: 32px;

        .link-info {
          margin-top: 20px;
        }

        .link-url {
          margin-top: 20px;
          padding: 20px;
          background-color: var(--el-fill-color-lighter);
          border-radius: 8px;
          word-break: break-all;

          a {
            color: var(--primaryColor);
            text-decoration: none;
            display: flex;
            align-items: center;

            &:hover {
              color: var(--textActiveColor);
              text-decoration: underline;
            }

            .external-icon {
              margin-left: 8px;
            }
          }
        }
      }
    }
  }
}
</style>
