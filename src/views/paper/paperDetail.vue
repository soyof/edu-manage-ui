<template>
  <div class="paper-detail-container">
    <div class="paper-content-wrapper">
      <!-- 论文不存在或加载失败 -->
      <el-empty v-if="!paperData.id && !loading" description="未找到论文内容" />

      <!-- 论文内容 -->
      <div v-else-if="paperData.id" class="paper-content" :class="{ 'animation-ready': animationReady }">
        <!-- 论文标题和元数据 -->
        <div class="paper-header">
          <div class="header-banner animate__animated animate__fadeInDown">
            <div class="header-status animate__animated animate__fadeInRight">
              <el-tag
                size="small"
                :type="PaperStatus.getTagType(paperData.publishStatus)"
                class="status-tag"
              >
                {{ PaperStatus.getName(paperData.publishStatus) }}
              </el-tag>
            </div>
            <h1 class="title animate__animated animate__fadeIn animate__delay-1s">{{ paperData.title }}</h1>
            <h2 class="title-en animate__animated animate__fadeIn animate__delay-1s">{{ paperData.titleEn }}</h2>
          </div>

          <div class="meta-card animate__animated animate__fadeInUp animate__delay-1s">
            <div class="meta-section">
              <div class="section-title">
                <el-icon><Calendar /></el-icon>
                <span>时间信息</span>
              </div>
              <div class="meta-content">
                <div class="meta-item">
                  <span class="label">文献发布时间</span>
                  <span class="value">{{ paperData.paperPublishTimes || '--' }}</span>
                </div>
                <div class="meta-item">
                  <span class="label">系统发布时间</span>
                  <span class="value">{{ paperData.publishTimes || '--' }}</span>
                </div>
                <div class="meta-item">
                  <span class="label">创建时间</span>
                  <span class="value">{{ paperData.createdTimes }}</span>
                </div>
                <div class="meta-item">
                  <span class="label">更新时间</span>
                  <span class="value">{{ paperData.updatedTimes }}</span>
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
                  <span class="value">{{ paperData.publishUserName || '--' }}</span>
                </div>
                <div class="meta-item">
                  <span class="label">创建人</span>
                  <span class="value">{{ paperData.createUserName || '未知' }}</span>
                </div>
                <div class="meta-item">
                  <span class="label">更新人</span>
                  <span class="value">{{ paperData.updateUserName || '未知' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 摘要部分 -->
        <div class="abstract-section animate__animated animate__fadeIn animate__delay-2s">
          <h3 class="section-heading">摘要</h3>
          <el-tabs type="border-card">
            <el-tab-pane label="中文摘要">
              <div v-if="paperData.abstract" class="abstract-content">
                {{ paperData.abstract }}
              </div>
              <el-empty v-else description="暂无中文摘要" />
            </el-tab-pane>
            <el-tab-pane v-if="hasEnglishContent" label="英文摘要">
              <div v-if="paperData.abstractEn" class="abstract-content">
                {{ paperData.abstractEn }}
              </div>
              <el-empty v-else description="暂无英文摘要" />
            </el-tab-pane>
          </el-tabs>
        </div>

        <!-- 原文链接 -->
        <div v-if="paperData.originalUrl" class="original-url-section animate__animated animate__fadeIn animate__delay-3s">
          <h3 class="section-heading">原文链接</h3>
          <div class="link-url animate__animated animate__pulse animate__delay-3s">
            <a :href="paperData.originalUrl" target="_blank" rel="noopener noreferrer">
              {{ paperData.originalUrl }}
              <el-icon class="external-icon"><TopRight /></el-icon>
            </a>
          </div>
        </div>

        <!-- 论文内容 -->
        <div class="paper-body animate__animated animate__fadeIn animate__delay-2s">
          <h3 class="section-heading">正文内容</h3>
          <el-tabs type="border-card">
            <el-tab-pane label="中文内容">
              <div class="content-wrapper">
                <div
                  v-if="paperData.content"
                  class="rich-text-content"
                  v-html="paperData.content"
                ></div>
                <el-empty v-else description="暂无中文内容" />
              </div>
            </el-tab-pane>
            <el-tab-pane v-if="hasEnglishContent" label="英文内容">
              <div class="content-wrapper">
                <div
                  v-if="paperData.contentEn"
                  class="rich-text-content"
                  v-html="paperData.contentEn"
                ></div>
                <el-empty v-else description="暂无英文内容" />
              </div>
            </el-tab-pane>
          </el-tabs>
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
import useLoading from '@/hooks/useLoading'
import { PaperStatus } from '@/dic/statusConfig'

const { changeLoading, closeLoading, loading } = useLoading()

// 路由相关
const route = useRoute()
const paperId = ref(route.query.id as string)

// 论文数据
const paperData = reactive({
  id: '',
  title: '',
  titleEn: '',
  abstract: '',
  abstractEn: '',
  content: '',
  contentEn: '',
  originalUrl: '',
  paperPublishTimes: '',
  publishStatus: '',
  publishTimes: '',
  publishUserName: '',
  createdTimes: '',
  updatedTimes: '',
  createUserName: '',
  updateUserName: ''
})

// 是否有英文内容
const hasEnglishContent = computed(() => {
  return Boolean(paperData.titleEn || paperData.abstractEn || paperData.contentEn)
})

// 动画控制
const animationReady = ref(false)

// 获取论文详情
const fetchPaperDetail = () => {
  if (!paperId.value) return

  changeLoading(true)

  service.post(`/api/paper/detail`, {
    id: paperId.value
  }).then((res: any) => {
    if (res) {
      Object.assign(paperData, res)

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
  fetchPaperDetail()
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

.paper-detail-container {
  position: relative;
  padding: 20px;
  background-color: @pageBgColor;
  min-height: calc(100vh - 120px);

  .paper-content-wrapper {
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

  .paper-content {
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

    .paper-header {
      padding: 0;

      .header-banner {
        position: relative;
        padding: 32px 16px;
        background: linear-gradient(135deg,
          color-mix(in srgb, var(--menuBgColor) 15%, white) 0%,
          color-mix(in srgb, var(--menuBgColor) 30%, white) 100%);
        background-size: 200% 200%;
        text-align: center;
        animation: gradientFlow 15s ease infinite;

        .header-status {
          position: absolute;
          top: 16px;
          right: 16px;
          display: flex;
          gap: 8px;

          .status-tag {
            font-size: 12px;
            font-weight: 500;
          }
        }

        .title {
          font-size: 28px;
          font-weight: 700;
          margin: 16px 0 8px;
          color: var(--el-text-color-primary);
          line-height: 1.4;
          text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.05);
          transition: transform 0.3s ease, text-shadow 0.3s ease;

          &:hover {
            transform: translateY(-3px);
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
          }
        }

        .title-en {
          font-size: 20px;
          font-weight: 500;
          margin: 8px 0 16px;
          color: var(--el-text-color-regular);
          line-height: 1.4;
          font-style: italic;
        }
      }

      .meta-card {
        display: flex;
        justify-content: space-between;
        padding: 16px;
        background-color: color-mix(in srgb, var(--menuBgColor) 5%, white);
        border-bottom: 1px solid color-mix(in srgb, var(--menuBgColor) 15%, white);

        .meta-section {
          flex: 1;
          margin-right: 20px;

          &:last-child {
            margin-right: 0;
          }

          .section-title {
            display: flex;
            align-items: center;
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 12px;
            color: var(--el-text-color-primary);

            .el-icon {
              margin-right: 8px;
              color: var(--primaryColor);
            }
          }

          .meta-content {
            .meta-item {
              display: flex;
              margin-bottom: 8px;
              font-size: 14px;

              .label {
                width: 100px;
                color: var(--el-text-color-secondary);
              }

              .value {
                flex: 1;
                color: var(--el-text-color-primary);
              }
            }
          }
        }
      }
    }

    .section-heading {
      font-size: 20px;
      font-weight: 600;
      margin: 16px 0;
      color: var(--el-text-color-primary);
      border-left: 4px solid var(--primaryColor);
      padding-left: 12px;
      position: relative;

      &::after {
        content: '';
        position: absolute;
        bottom: -8px;
        left: 0;
        width: 60px;
        height: 2px;
        background-color: var(--primaryColor);
        opacity: 0.5;
      }
    }

    .abstract-section {
      margin: 16px;

      .abstract-content {
        white-space: pre-line;
        font-size: 15px;
        line-height: 1.8;
        color: var(--el-text-color-primary);
      }
    }

    .original-url-section {
      margin: 16px;

      .link-url {
        margin-top: 16px;
        padding: 16px;
        background-color: color-mix(in srgb, var(--menuBgColor) 5%, white);
        border-radius: 8px;
        transition: all 0.3s ease;

        &:hover {
          background-color: color-mix(in srgb, var(--menuBgColor) 10%, white);
          transform: translateY(-2px);
        }

        a {
          color: var(--primaryColor);
          font-size: 16px;
          text-decoration: none;
          display: flex;
          align-items: center;
          justify-content: flex-start;
          word-break: break-all;

          .external-icon {
            margin-left: 8px;
          }

          &:hover {
            text-decoration: underline;
          }
        }
      }
    }

    .paper-body {
      margin: 16px;

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

      .rich-text-content {
        line-height: 1.8;
        font-size: 15px;
      }
    }
  }
}
</style>
