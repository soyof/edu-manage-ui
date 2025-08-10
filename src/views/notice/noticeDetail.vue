<template>
  <div class="notice-detail-container">
    <div class="notice-content-wrapper">
      <!-- 通知不存在或加载失败 -->
      <el-empty v-if="!noticeData.id && !loading" description="未找到通知内容" />

      <!-- 通知内容 -->
      <div v-else-if="noticeData.id" class="notice-content" :class="{ 'animation-ready': animationReady }">
        <!-- 通知标题和元数据 -->
        <div class="notice-header">
          <div class="header-banner animate__animated animate__fadeInDown">
            <div class="notice-type-tag animate__animated animate__fadeInLeft">
              <el-tag size="small" effect="dark" class="type-tag">{{ getNoticeTypeName(noticeData.noticeType) }}</el-tag>
            </div>
            <h1 class="title animate__animated animate__fadeIn animate__delay-1s">{{ noticeData.title }}</h1>
            <div class="header-status animate__animated animate__fadeInRight">
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
                :type="NoticeStatus.getTagType(noticeData.publishStatus)"
                class="status-tag"
              >
                {{ NoticeStatus.getName(noticeData.publishStatus) }}
              </el-tag>
              <el-tag
                v-if="noticeData.isTop === 1"
                size="small"
                type="success"
                effect="dark"
                class="top-tag"
              >
                置顶
              </el-tag>
            </div>
          </div>

          <div class="meta-card animate__animated animate__fadeInUp animate__delay-1s">
            <div class="meta-section">
              <div class="section-title">
                <el-icon><Calendar /></el-icon>
                <span>时间信息</span>
              </div>
              <div class="meta-content">
                <div class="meta-item">
                  <span class="label">发布时间</span>
                  <span class="value">{{ noticeData.publishTimes || '--' }}</span>
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
                  <span class="label">发布人</span>
                  <span class="value">{{ noticeData.publishUserName || '--' }}</span>
                </div>
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
        <div v-if="isTextType" class="notice-body animate__animated animate__fadeIn animate__delay-2s">
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
        <div v-else class="notice-body link-type animate__animated animate__fadeIn animate__delay-2s">
          <el-alert
            title="此通知为链接类型，点击下方链接访问详细内容"
            type="info"
            :closable="false"
            showIcon
          />
          <div class="link-url animate__animated animate__pulse animate__delay-3s">
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
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { TopRight, Calendar, User } from '@element-plus/icons-vue'
import service from '@/utils/services'
import { useDictionary } from '@/hooks/useDictionary'
import useLoading from '@/hooks/useLoading'
import { NoticeStatus } from '@/dic/statusConfig'
import 'animate.css'

const { changeLoading, closeLoading, loading } = useLoading()

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
  publishTimes: '',
  publishUserName: '',
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

// 动画控制
const animationReady = ref(false)

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

      // 数据加载完成后，设置动画标记
      nextTick(() => {
        animationReady.value = true
      })
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
// 自定义动画关键帧
@keyframes floatUp {
  from { transform: translateY(10px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@keyframes scaleIn {
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

@keyframes slideInRight {
  from { transform: translateX(20px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

@keyframes gradientFlow {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

// 页面入场动画
@keyframes pageEnter {
  0% { opacity: 0; transform: translateY(30px); }
  100% { opacity: 1; transform: translateY(0); }
}

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
    transition: box-shadow 0.3s ease;

    &:hover {
      box-shadow: 0 8px 28px rgba(0, 0, 0, 0.12);
    }
  }

  .notice-content {
    // 默认情况下隐藏动画元素
    .animate__animated {
      opacity: 0;
    }

    // 当数据加载完成后，显示动画
    &.animation-ready {
      animation: pageEnter 0.6s ease-out forwards;

      .animate__animated {
        opacity: 1;
      }
    }

    .notice-header {
      padding: 0;

      .header-banner {
        position: relative;
        padding: 32px 40px;
        background: linear-gradient(135deg,
          color-mix(in srgb, var(--menuBgColor) 15%, white) 0%,
          color-mix(in srgb, var(--menuBgColor) 30%, white) 100%);
        background-size: 200% 200%;
        text-align: center;
        animation: gradientFlow 15s ease infinite;

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
            transition: transform 0.3s ease, box-shadow 0.3s ease;

            &:hover {
              transform: translateY(-2px);
              box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            }
          }
        }

        .title {
          font-size: 28px;
          font-weight: 700;
          margin: 16px 0;
          color: var(--el-text-color-primary);
          line-height: 1.4;
          text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.05);
          transition: transform 0.3s ease, text-shadow 0.3s ease;

          &:hover {
            transform: translateY(-3px);
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
          }
        }

        .header-status {
          display: flex;
          justify-content: center;
          gap: 12px;
          margin-top: 12px;

          .importance-tag,
          .status-tag,
          .top-tag {
            padding: 0 12px;
            height: 24px;
            line-height: 22px;
            border-radius: 12px;
            font-weight: 500;
            transition: transform 0.3s ease, box-shadow 0.3s ease;

            &:hover {
              transform: translateY(-2px) scale(1.05);
              box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            }
          }

          .top-tag {
            background: linear-gradient(135deg, #67c23a, #85ce61);
            border: none;
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
        transition: transform 0.3s ease, box-shadow 0.3s ease;

        &:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
        }

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
            transition: background-color 0.3s ease;

            .el-icon {
              margin-right: 8px;
              font-size: 16px;
              color: var(--primaryColor);
              transition: transform 0.3s ease;
            }

            &:hover {
              background-color: color-mix(in srgb, var(--menuBgColor) 15%, white);

              .el-icon {
                transform: scale(1.2) rotate(10deg);
              }
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
              transition: transform 0.3s ease;

              &:hover {
                transform: translateX(5px);

                .value {
                  color: var(--primaryColor);
                }
              }

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
                transition: color 0.3s ease;
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
          transition: all 0.3s ease;

          &.is-active {
            font-weight: 600;
            color: var(--primaryColor);
            background-color: color-mix(in srgb, var(--primaryColor) 5%, white);
          }

          &:hover:not(.is-active) {
            color: var(--primaryColor);
            background-color: color-mix(in srgb, var(--primaryColor) 2%, white);
            transform: translateY(-2px);
          }
        }
      }

      .content-wrapper {
        min-height: 300px;
        padding: 0;
        animation: floatUp 0.5s ease-out;
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
          transition: all 0.3s ease;

          &:hover {
            transform: translateY(-5px);
            box-shadow: 0 8px 16px rgba(0, 0, 0, 0.08);
            background-color: color-mix(in srgb, var(--primaryColor) 5%, var(--el-fill-color-lighter));
          }

          a {
            color: var(--primaryColor);
            text-decoration: none;
            display: flex;
            align-items: center;
            transition: all 0.3s ease;

            &:hover {
              color: var(--textActiveColor);
              text-decoration: underline;

              .external-icon {
                transform: translate(3px, -3px);
              }
            }

            .external-icon {
              margin-left: 8px;
              transition: transform 0.3s ease;
            }
          }
        }
      }
    }
  }
}
</style>
