<template>
  <div class="book-detail-container">
    <div class="book-content-wrapper">
      <!-- 著作不存在或加载失败 -->
      <el-empty v-if="!bookData.id && !loading" description="未找到著作内容" />

      <!-- 著作内容 -->
      <div v-else-if="bookData.id" class="book-content" :class="{ 'animation-ready': animationReady }">
        <!-- 著作标题和元数据 -->
        <div class="book-header">
          <div class="header-banner animate__animated animate__fadeInDown">
            <div class="header-status animate__animated animate__fadeInRight">
              <el-tag
                size="small"
                :type="BookStatus.getTagType(bookData.publishStatus)"
                class="status-tag"
              >
                {{ BookStatus.getName(bookData.publishStatus) }}
              </el-tag>
              <el-tag
                v-if="bookData.isTranslated === '1'"
                size="small"
                type="success"
                class="translated-tag"
              >
                已译成外文
              </el-tag>
            </div>
            <h1 class="title animate__animated animate__fadeIn animate__delay-1s">{{ bookData.title }}</h1>
            <div class="author-info animate__animated animate__fadeIn animate__delay-1s">
              <span class="author-label">作者：</span>
              <span class="author">{{ bookData.author }}</span>
              <span v-if="bookData.authorEn" class="author-en">( {{ bookData.authorEn }} )</span>
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
                  <span class="label">著作发布日期</span>
                  <span class="value">{{ bookData.bookPublishDate || '--' }}</span>
                </div>
                <div class="meta-item">
                  <span class="label">系统发布时间</span>
                  <span class="value">{{ bookData.publishTimes || '--' }}</span>
                </div>
                <div class="meta-item">
                  <span class="label">创建时间</span>
                  <span class="value">{{ bookData.createdTimes }}</span>
                </div>
                <div class="meta-item">
                  <span class="label">更新时间</span>
                  <span class="value">{{ bookData.updatedTimes }}</span>
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
                  <span class="value">{{ bookData.publishUserName || '--' }}</span>
                </div>
                <div class="meta-item">
                  <span class="label">创建人</span>
                  <span class="value">{{ bookData.createUserName || '未知' }}</span>
                </div>
                <div class="meta-item">
                  <span class="label">更新人</span>
                  <span class="value">{{ bookData.updateUserName || '未知' }}</span>
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
              <div v-if="bookData.abstract" class="abstract-content">
                {{ bookData.abstract }}
              </div>
              <el-empty v-else description="暂无中文摘要" />
            </el-tab-pane>
            <el-tab-pane label="英文摘要">
              <div v-if="bookData.abstractEn" class="abstract-content">
                {{ bookData.abstractEn }}
              </div>
              <el-empty v-else description="暂无英文摘要" />
            </el-tab-pane>
          </el-tabs>
        </div>

        <!-- 著作链接 -->
        <div v-if="bookData.bookUrl" class="book-url-section animate__animated animate__fadeIn animate__delay-3s">
          <h3 class="section-heading">著作链接</h3>
          <div class="link-url animate__animated animate__pulse animate__delay-3s">
            <a :href="bookData.bookUrl" target="_blank" rel="noopener noreferrer">
              {{ bookData.bookUrl }}
              <el-icon class="external-icon"><TopRight /></el-icon>
            </a>
          </div>
        </div>

        <!-- 著作内容 -->
        <div class="book-body animate__animated animate__fadeIn animate__delay-2s">
          <h3 class="section-heading">正文内容</h3>
          <el-tabs type="border-card">
            <el-tab-pane label="中文内容">
              <div class="content-wrapper">
                <div
                  v-if="bookData.content"
                  class="rich-text-content"
                  v-html="bookData.content"
                ></div>
                <el-empty v-else description="暂无中文内容" />
              </div>
            </el-tab-pane>
            <el-tab-pane label="英文内容">
              <div class="content-wrapper">
                <div
                  v-if="bookData.contentEn"
                  class="rich-text-content"
                  v-html="bookData.contentEn"
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
import { ref, reactive, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { TopRight, Calendar, User } from '@element-plus/icons-vue'
import service from '@/utils/services'
import useLoading from '@/hooks/useLoading'
import { BookStatus } from '@/dic/statusConfig'

const { changeLoading, closeLoading, loading } = useLoading()

// 路由相关
const route = useRoute()
const bookId = ref(route.query.id as string)

// 著作数据
const bookData = reactive({
  id: '',
  title: '',
  titleEn: '',
  author: '',
  authorEn: '',
  abstract: '',
  abstractEn: '',
  content: '',
  contentEn: '',
  bookUrl: '',
  bookPublishDate: '',
  isTranslated: '0',
  publishStatus: '',
  publishTimes: '',
  publishUserName: '',
  createdTimes: '',
  updatedTimes: '',
  createUserName: '',
  updateUserName: ''
})

// 动画控制
const animationReady = ref(false)

// 获取著作详情
const fetchBookDetail = () => {
  if (!bookId.value) return

  changeLoading(true)

  service.post(`/api/book/detail`, {
    id: bookId.value
  }).then((res: any) => {
    if (res) {
      Object.assign(bookData, res)

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
  fetchBookDetail()
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

.book-detail-container {
  position: relative;
  padding: 20px;
  background-color: @pageBgColor;
  min-height: calc(100vh - 120px);

  .book-content-wrapper {
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

  .book-content {
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

    .book-header {
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

          .status-tag, .translated-tag {
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

        .author-info {
          font-size: 16px;
          color: var(--el-text-color-secondary);
          margin-top: 8px;
          padding-bottom: 8px;

          .author-label {
            font-weight: 500;
          }

          .author {
            font-weight: 600;
            color: var(--el-text-color-primary);
          }

          .author-en {
            font-style: italic;
            margin-left: 8px;
          }
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

    .book-url-section {
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

    .book-body {
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
