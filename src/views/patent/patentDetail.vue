<template>
  <div class="patent-detail-container">
    <div class="patent-content-wrapper animate__animated animate__fadeIn animate__faster">
      <!-- 专利不存在或加载失败 -->
      <el-empty v-if="!patentData.id && !loading" description="未找到专利内容" />

      <!-- 专利内容 -->
      <div v-else-if="patentData.id" class="patent-content" :class="{ 'animation-ready': animationReady }">
        <!-- 专利标题和元数据 -->
        <div class="patent-header">
          <div class="header-banner animate__animated animate__fadeInDown">
            <div class="header-status animate__animated animate__fadeInRight">
              <el-tag
                size="small"
                :type="PatentStatus.getTagType(patentData.publishStatus)"
                class="status-tag"
              >
                {{ PatentStatus.getName(patentData.publishStatus) }}
              </el-tag>
              <!-- 职务专利标识 -->
              <el-tag
                size="small"
                :type="patentData.isServicePatent === '1' ? 'success' : 'info'"
                class="status-tag ml-2"
              >
                {{ patentData.isServicePatent === '1' ? '职务专利' : '非职务专利' }}
              </el-tag>
            </div>
            <h1 class="title animate__animated animate__fadeIn animate__delay-1s">{{ patentData.title }}</h1>
            <h2 class="title-en animate__animated animate__fadeIn animate__delay-1s">{{ patentData.titleEn }}</h2>
          </div>

          <div class="meta-card animate__animated animate__fadeInUp animate__delay-1s">
            <div class="meta-section">
              <div class="section-title">
                <el-icon><Document /></el-icon>
                <span>专利信息</span>
              </div>
              <div class="meta-content">
                <div class="meta-item">
                  <span class="label">申请号</span>
                  <span class="value">{{ patentData.applicationNum }}</span>
                </div>
                <div class="meta-item">
                  <span class="label">申请人</span>
                  <span class="value">{{ patentData.applicants }}</span>
                </div>
                <div class="meta-item">
                  <span class="label">申请日期</span>
                  <span class="value">{{ patentData.applicationDate }}</span>
                </div>
                <div class="meta-item">
                  <span class="label">授权日期</span>
                  <span class="value">{{ patentData.authorizationDate || '--' }}</span>
                </div>
                <div class="meta-item">
                  <span class="label">专利发布日期</span>
                  <span class="value">{{ patentData.patentPublishDate || '--' }}</span>
                </div>
              </div>
            </div>

            <div class="meta-section">
              <div class="section-title">
                <el-icon><Calendar /></el-icon>
                <span>系统信息</span>
              </div>
              <div class="meta-content">
                <div class="meta-item">
                  <span class="label">系统发布时间</span>
                  <span class="value">{{ patentData.publishTimes || '--' }}</span>
                </div>
                <div class="meta-item">
                  <span class="label">创建时间</span>
                  <span class="value">{{ patentData.createdTimes }}</span>
                </div>
                <div class="meta-item">
                  <span class="label">更新时间</span>
                  <span class="value">{{ patentData.updatedTimes }}</span>
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
                  <span class="value">{{ patentData.publishUserName || '--' }}</span>
                </div>
                <div class="meta-item">
                  <span class="label">创建人</span>
                  <span class="value">{{ patentData.createUserName || '未知' }}</span>
                </div>
                <div class="meta-item">
                  <span class="label">更新人</span>
                  <span class="value">{{ patentData.updateUserName || '未知' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 摘要部分 -->
        <div class="abstract-section animate__animated animate__fadeIn animate__delay-2s">
          <h3 class="section-heading">摘要</h3>
          <el-tabs class="custom-tabs">
            <el-tab-pane label="中文摘要">
              <div v-if="patentData.abstract" class="abstract-content">
                {{ patentData.abstract }}
              </div>
              <el-empty v-else description="暂无中文摘要" />
            </el-tab-pane>
            <el-tab-pane v-if="hasEnglishContent" label="英文摘要">
              <div v-if="patentData.abstractEn" class="abstract-content">
                {{ patentData.abstractEn }}
              </div>
              <el-empty v-else description="暂无英文摘要" />
            </el-tab-pane>
          </el-tabs>
        </div>

        <!-- 专利内容 -->
        <div class="patent-body animate__animated animate__fadeIn animate__delay-2s">
          <h3 class="section-heading">专利内容</h3>
          <el-tabs class="custom-tabs">
            <el-tab-pane label="中文内容">
              <div class="content-wrapper">
                <div
                  v-if="patentData.content"
                  class="rich-text-content"
                  v-html="patentData.content"
                ></div>
                <el-empty v-else description="暂无中文内容" />
              </div>
            </el-tab-pane>
            <el-tab-pane v-if="hasEnglishContent" label="英文内容">
              <div class="content-wrapper">
                <div
                  v-if="patentData.contentEn"
                  class="rich-text-content"
                  v-html="patentData.contentEn"
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
import { Calendar, User, Document } from '@element-plus/icons-vue'
import service from '@/utils/services'
import useLoading from '@/hooks/useLoading'
import { PatentStatus } from '@/dic/statusConfig'
import 'animate.css'

const { changeLoading, closeLoading, loading } = useLoading()

// 路由相关
const route = useRoute()
const patentId = ref(route.query.id as string)

// 专利数据
const patentData = reactive({
  id: '',
  title: '',
  titleEn: '',
  applicationNum: '',
  applicants: '',
  isServicePatent: '0',
  applicationDate: '',
  authorizationDate: '',
  patentPublishDate: '',
  abstract: '',
  abstractEn: '',
  content: '',
  contentEn: '',
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
  return Boolean(patentData.titleEn || patentData.abstractEn || patentData.contentEn)
})

// 动画准备状态
const animationReady = ref(false)

// 获取专利详情
const fetchPatentDetail = () => {
  if (!patentId.value) return

  changeLoading(true)

  service.post(`/api/patent/detail`, {
    id: patentId.value
  }).then((res: any) => {
    Object.assign(patentData, res)

    nextTick(() => {
      setTimeout(() => {
        animationReady.value = true
      }, 500)
    })
  }).finally(() => {
    closeLoading()
  })
}

// 初始化
onMounted(() => {
  fetchPatentDetail()
})
</script>

<style scoped lang="less">
.patent-detail-container {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  background-color: #f5f7fa;

  .patent-content-wrapper {
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    padding: 0;
    overflow: hidden;
    transition: all 0.3s;

    &:hover {
      box-shadow: 0 4px 20px 0 rgba(0, 0, 0, 0.15);
    }
  }

  .patent-content {
    opacity: 0;
    transform: translateY(10px);
    transition: opacity 0.5s ease, transform 0.5s ease;

    &.animation-ready {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .patent-header {
    position: relative;

    .header-banner {
      position: relative;
      background: linear-gradient(135deg, #3a8ee6, #5c6bc0);
      color: #fff;
      padding: 40px 30px 20px;
      text-align: center;

      .header-status {
        position: absolute;
        top: 15px;
        right: 15px;
        display: flex;
        gap: 10px;

        .status-tag {
          margin-left: 5px;
        }
      }

      .title {
        margin: 5px 0;
        font-size: 24px;
        word-break: break-word;
      }

      .title-en {
        margin: 0;
        font-size: 18px;
        font-weight: normal;
        opacity: 0.85;
        word-break: break-word;
      }
    }

    .meta-card {
      background-color: #fff;
      border-radius: 4px;
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
      margin: -12px 20px 20px;
      padding: 20px;
      position: relative;
      z-index: 1;

      .meta-section {
        margin-bottom: 20px;

        &:last-child {
          margin-bottom: 0;
        }

        .section-title {
          display: flex;
          align-items: center;
          font-size: 16px;
          font-weight: bold;
          margin-bottom: 10px;
          color: #303133;

          .el-icon {
            margin-right: 5px;
            color: #409EFF;
          }
        }

        .meta-content {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          grid-gap: 15px;

          .meta-item {
            display: flex;
            align-items: baseline;

            .label {
              flex-shrink: 0;
              width: 100px;
              color: #606266;
              font-size: 14px;
            }

            .value {
              font-size: 14px;
              color: #303133;
              font-weight: 500;
              word-break: break-word;
            }
          }
        }
      }
    }
  }

  .section-heading {
    font-size: 18px;
    color: #303133;
    margin: 30px 0 15px;
    padding-bottom: 10px;
    border-bottom: 1px solid #ebeef5;
  }

  .abstract-section {
    padding: 0 30px;
    margin-bottom: 20px;

    .custom-tabs {
      margin-top: 15px;
    }
  }

  .abstract-content {
    padding: 0;
    line-height: 1.8;
    white-space: pre-wrap;
    color: #303133;
    font-size: 14px;
    border: 1px solid #ebeef5;
    border-radius: 4px;
    padding: 15px;
    background-color: #fafafa;
  }

  .patent-body {
    padding: 0 30px 30px;

    .custom-tabs {
      margin-top: 15px;
    }

    .content-wrapper {
      padding: 0;
      background-color: #fafafa;
      border: 1px solid #ebeef5;
      border-radius: 4px;

      .rich-text-content {
        line-height: 1.8;
        padding: 15px 20px;

        :deep(img) {
          max-width: 100%;
        }

        :deep(table) {
          border-collapse: collapse;
          width: 100%;

          td, th {
            border: 1px solid #dcdfe6;
            padding: 8px;
          }

          th {
            background-color: #f5f7fa;
          }
        }
      }
    }
  }

  .ml-2 {
    margin-left: 8px;
  }

  .custom-tabs {
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(0,0,0,0.05);

    .el-tabs__header {
      margin-bottom: 0;
      background-color: #f5f7fa;
      border-bottom: 1px solid #dcdfe6;
      border-top-left-radius: 4px;
      border-top-right-radius: 4px;
      padding: 0 15px;

      .el-tabs__nav-wrap {
        &::after {
          display: none;
        }
      }

      .el-tabs__nav-scroll {
        display: flex;
        padding: 10px 0 0;
      }

      .el-tabs__nav {
        border: none;
        display: flex;
        margin-left: 20px;
      }
    }

    :deep(.el-tabs__item) {
      height: 40px;
      line-height: 40px;
      font-size: 15px;
      padding: 0 35px;
      transition: all 0.3s;
      margin-right: 5px;
      color: #606266;
      position: relative;
      text-align: center;
      border: 1px solid #dcdfe6;
      border-bottom: none;
      border-top-left-radius: 4px;
      border-top-right-radius: 4px;
      background-color: #f5f7fa;
      margin-bottom: -1px;

      &.is-active {
        color: #409EFF;
        font-weight: bold;
        background-color: #fff;
        border-bottom: none;

        &::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 2px;
          background-color: #fff;
        }

        &::before {
          content: '';
          position: absolute;
          top: -1px;
          left: 0;
          right: 0;
          height: 3px;
          background-color: #409EFF;
          border-top-left-radius: 3px;
          border-top-right-radius: 3px;
        }
      }

      &:not(.is-active):hover {
        color: #409EFF;
        background-color: #ecf5ff;
      }
    }

    .el-tabs__content {
      padding: 24px;
      background-color: #fff;
      border-bottom-left-radius: 4px;
      border-bottom-right-radius: 4px;
    }
  }
}

.abstract-content, .content-wrapper {
  background-color: #fff;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  padding: 15px 20px;
}
</style>
