<template>
  <div class="instrument-detail-container">
    <!-- 顶部标题栏 -->
    <div class="card-header">
      <div class="title-wrapper">
        <div class="title-icon">
          <i class="el-icon instrument-icon">
            <Document class="icon-svg" />
          </i>
        </div>
        <div class="title-content">
          <!-- 基本信息替换原有标题 -->
          <div class="basic-info">
            <div class="instrument-name" :title="instrumentData.instName || '-'">{{ instrumentData.instName || '-' }}</div>
            <div class="instrument-params">
              <div class="param-row">
                <span class="param-item" :title="`生产厂家：${instrumentData.manufacturer || '-'}`">
                  <span class="param-label">生产厂家：</span>
                  <span class="param-value">{{ instrumentData.manufacturer || '-' }}</span>
                </span>
                <span class="param-item" :title="`型号：${instrumentData.model || '-'}`">
                  <span class="param-label">型号：</span>
                  <span class="param-value">{{ instrumentData.model || '-' }}</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="header-buttons">
        <div v-if="instrumentData.publishStatus" class="status-indicator">
          <div class="status-dot" :class="'status-' + instrumentData.publishStatus"></div>
          <span class="status-text">{{ InstrumentStatus.getName(instrumentData.publishStatus) }}</span>
        </div>
      </div>
    </div>

    <div v-if="loading" class="loading-container">
      <el-skeleton style="width: 100%" :rows="10" animated />
    </div>

    <div v-else-if="!instrumentData.id" class="empty-data">
      <div class="empty-icon">
        <Document style="font-size: 80px; color: #a0cfff;" />
      </div>
      <div class="empty-text">暂无仪器数据</div>
    </div>

    <!-- 内容区 -->
    <div v-else class="content-area">
      <!-- 信息卡片区域 -->
      <div class="cards-container">
        <!-- 仪器图片卡片 -->
        <div v-if="instrumentData.imageFiles && instrumentData.imageFiles.length > 0" class="info-card image-card">
          <div class="card-title">
            <Picture class="card-icon" />
            <span>仪器图片</span>
          </div>
          <div class="card-content">
            <el-carousel
              height="280px"
              :autoplay="true"
              :interval="4000"
              indicatorPosition="outside"
              arrow="hover"
              class="image-carousel"
            >
              <el-carousel-item
                v-for="(image, index) in instrumentData.imageFiles"
                :key="index"
              >
                <div class="carousel-image-container">
                  <el-image
                    :src="getImageUrl(image)"
                    fit="contain"
                    :previewSrcList="previewList"
                    :initialIndex="index"
                    previewTeleported
                    class="carousel-image"
                  >
                    <template #error>
                      <div class="image-error">
                        <el-icon><Picture /></el-icon>
                        <span>加载失败</span>
                      </div>
                    </template>
                    <template #placeholder>
                      <div class="image-loading">
                        <el-icon class="is-loading"><Picture /></el-icon>
                      </div>
                    </template>
                  </el-image>
                  <div class="image-indicator">{{ index + 1 }}/{{ instrumentData.imageFiles.length }}</div>
                </div>
              </el-carousel-item>
            </el-carousel>
          </div>
        </div>

        <!-- 系统信息卡片 -->
        <div class="info-card system-card">
          <div class="card-title">
            <InfoFilled class="card-icon" />
            <span>系统信息</span>
          </div>
          <div class="card-content">
            <div class="system-timeline">
              <div class="timeline-item">
                <div class="timeline-dot create-dot"></div>
                <div class="timeline-card">
                  <div class="timeline-header">
                    <div class="timeline-title">
                      <i class="el-icon"><Plus class="timeline-icon" /></i>
                      <span>创建</span>
                    </div>
                    <div class="timeline-time">{{ instrumentData.createdTimes || '-' }}</div>
                  </div>
                  <div class="timeline-user">{{ instrumentData.createUserName || '-' }}</div>
                </div>
              </div>

              <div v-if="instrumentData.updateUserName" class="timeline-item">
                <div class="timeline-dot update-dot"></div>
                <div class="timeline-card">
                  <div class="timeline-header">
                    <div class="timeline-title">
                      <i class="el-icon"><EditPen class="timeline-icon" /></i>
                      <span>更新</span>
                    </div>
                    <div class="timeline-time">{{ instrumentData.updatedTimes || '-' }}</div>
                  </div>
                  <div class="timeline-user">{{ instrumentData.updateUserName || '-' }}</div>
                </div>
              </div>

              <div v-if="instrumentData.publishUserName" class="timeline-item">
                <div class="timeline-dot publish-dot"></div>
                <div class="timeline-card">
                  <div class="timeline-header">
                    <div class="timeline-title">
                      <i class="el-icon"><Check class="timeline-icon" /></i>
                      <span>发布</span>
                    </div>
                    <div class="timeline-time">{{ instrumentData.publishTimes || '-' }}</div>
                  </div>
                  <div class="timeline-user">{{ instrumentData.publishUserName || '-' }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 技术信息卡片 -->
      <div v-if="hasTechnicalInfo" class="info-card tech-info-card">
        <div class="card-title">
          <Setting class="card-icon" />
          <span>技术信息</span>
        </div>
        <div class="card-content">
          <div class="tech-content">
            <!-- 工作原理 -->
            <div v-if="instrumentData.workingPrinciple || instrumentData.workingPrincipleEn" class="tech-item">
              <div class="tech-header">
                <div class="tech-label">工作原理</div>
              </div>
              <el-tabs type="card" class="content-tabs">
                <el-tab-pane v-if="instrumentData.workingPrinciple" label="中文">
                  <div class="rich-text-content" v-html="instrumentData.workingPrinciple"></div>
                </el-tab-pane>
                <el-tab-pane v-if="instrumentData.workingPrincipleEn" label="English">
                  <div class="rich-text-content" v-html="instrumentData.workingPrincipleEn"></div>
                </el-tab-pane>
              </el-tabs>
            </div>

            <!-- 应用范围 -->
            <div v-if="instrumentData.applicationScope || instrumentData.applicationScopeEn" class="tech-item">
              <div class="tech-header">
                <div class="tech-label">应用范围</div>
              </div>
              <el-tabs type="card" class="content-tabs">
                <el-tab-pane v-if="instrumentData.applicationScope" label="中文">
                  <div class="rich-text-content" v-html="instrumentData.applicationScope"></div>
                </el-tab-pane>
                <el-tab-pane v-if="instrumentData.applicationScopeEn" label="English">
                  <div class="rich-text-content" v-html="instrumentData.applicationScopeEn"></div>
                </el-tab-pane>
              </el-tabs>
            </div>

            <!-- 性能特点 -->
            <div v-if="instrumentData.performanceFeatures || instrumentData.performanceFeaturesEn" class="tech-item">
              <div class="tech-header">
                <div class="tech-label">性能特点</div>
              </div>
              <el-tabs type="card" class="content-tabs">
                <el-tab-pane v-if="instrumentData.performanceFeatures" label="中文">
                  <div class="rich-text-content" v-html="instrumentData.performanceFeatures"></div>
                </el-tab-pane>
                <el-tab-pane v-if="instrumentData.performanceFeaturesEn" label="English">
                  <div class="rich-text-content" v-html="instrumentData.performanceFeaturesEn"></div>
                </el-tab-pane>
              </el-tabs>
            </div>

            <!-- 其他说明 -->
            <div v-if="instrumentData.otherInfo || instrumentData.otherInfoEn" class="tech-item">
              <div class="tech-header">
                <div class="tech-label">其它说明</div>
              </div>
              <el-tabs type="card" class="content-tabs">
                <el-tab-pane v-if="instrumentData.otherInfo" label="中文">
                  <div class="rich-text-content" v-html="instrumentData.otherInfo"></div>
                </el-tab-pane>
                <el-tab-pane v-if="instrumentData.otherInfoEn" label="English">
                  <div class="rich-text-content" v-html="instrumentData.otherInfoEn"></div>
                </el-tab-pane>
              </el-tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  EditPen,
  Check,
  Document,
  Setting,
  Picture,
  InfoFilled,
  Plus
} from '@element-plus/icons-vue'
import service from '@/utils/services'
import { createStatusConfig } from '@/dic/statusConfig'
import useLoading from '@/hooks/useLoading'

const route = useRoute()
const { loading, changeLoading, closeLoading } = useLoading()

// 创建仪器状态配置
const InstrumentStatus = createStatusConfig('待发布', '已发布', '已下线')

const instrumentId = ref(route.query.id as string)

// 判断是否有技术信息
const hasTechnicalInfo = computed(() => {
  return !!(
    instrumentData.workingPrinciple ||
    instrumentData.workingPrincipleEn ||
    instrumentData.applicationScope ||
    instrumentData.applicationScopeEn ||
    instrumentData.performanceFeatures ||
    instrumentData.performanceFeaturesEn ||
    instrumentData.otherInfo ||
    instrumentData.otherInfoEn
  )
})

// 仪器数据
const instrumentData = reactive({
  id: '',
  instName: '',
  instNameEn: '',
  manufacturer: '',
  manufacturerEn: '',
  model: '',
  workingPrinciple: '',
  workingPrincipleEn: '',
  applicationScope: '',
  applicationScopeEn: '',
  performanceFeatures: '',
  performanceFeaturesEn: '',
  otherInfo: '',
  otherInfoEn: '',
  imageFiles: [] as string[],
  publishStatus: '',
  createUserName: '',
  createdTimes: '',
  updateUserName: '',
  updatedTimes: '',
  publishUserName: '',
  publishTimes: ''
})

// 图片预览列表
const previewList = computed(() => {
  return instrumentData.imageFiles.map(image => getImageUrl(image))
})

// 获取图片URL
const getImageUrl = (filename: string) => {
  if (!filename) return ''
  // 如果已经是完整URL，直接返回
  if (filename.startsWith('http')) {
    return filename
  }
  // 否则拼接基础路径
  return `/api/previewImage?filename=${filename}`
}

// 获取仪器详情
const fetchInstrumentDetail = () => {
  if (!instrumentId.value) return

  changeLoading(true)

  service.post(`/api/instrument/detail`, {
    id: instrumentId.value
  }).then((res: any) => {
    if (res) {
      Object.assign(instrumentData, res)
    }
  }).catch(error => {
    console.error('获取仪器详情失败', error)
    ElMessage.error('获取仪器详情失败')
  }).finally(() => {
    closeLoading()
  })
}

// 页面初始化
onMounted(() => {
  fetchInstrumentDetail()
})
</script>

<style scoped lang="less">
.instrument-detail-container {
  position: relative;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  padding: 0 0 40px;
  background: linear-gradient(135deg, #f9fafc 0%, #f0f4f9 100%);
  overflow: hidden;

  // 顶部标题栏
  .card-header {
    position: sticky;
    top: 0;
    left: 0;
    z-index: 10;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 24px;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    box-shadow: 0 3px 15px rgba(0, 0, 0, 0.04);
    margin-bottom: 20px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.03);

    .title-wrapper {
      display: flex;
      align-items: center;
      gap: 16px;
      flex: 1;
      min-width: 0; /* 确保flex子项可以缩小到最小宽度 */
      overflow: hidden; /* 防止内容溢出 */

      .title-icon {
        width: 46px;
        height: 46px;
        flex-shrink: 0; /* 防止图标被压缩 */
        border-radius: 10px;
        background: linear-gradient(135deg, var(--el-color-primary), #65a7ff);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 22px;
        box-shadow: 0 4px 12px rgba(var(--el-color-primary-rgb), 0.25);

        :deep(.icon-svg) {
          width: 22px;
          height: 22px;
        }
      }

      .title-content {
        flex: 1;
        min-width: 0; /* 确保可以缩小到容器宽度以内 */
        overflow: hidden; /* 防止内容溢出 */

        .basic-info {
          width: 100%;

          .instrument-name {
            font-size: 20px;
            font-weight: 600;
            color: #262626;
            margin-bottom: 6px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .instrument-params {
            display: flex;
            flex-wrap: wrap;
            gap: 16px;

            .param-row {
              display: flex;
              flex-wrap: nowrap; /* 保持一行 */
              width: 100%;
              overflow: hidden; /* 一行溢出隐藏 */
            }

            .param-item {
              display: flex;
              align-items: center;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
              margin-right: 20px;

              .param-label {
                font-size: 14px;
                color: #8c8c8c;
                flex-shrink: 0;
              }

              .param-value {
                font-size: 14px;
                color: #303133;
                font-weight: 500;
                margin-left: 4px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                max-width: 180px; /* 设置最大宽度，防止过长 */
              }
            }
          }
        }
      }
    }

    .header-buttons {
      display: flex;
      gap: 14px;
      align-items: center;
      flex-shrink: 0; /* 防止按钮区域被压缩 */

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
            background-color: #faad14;
            box-shadow: 0 0 0 3px rgba(250, 173, 20, 0.15);
          }

          &.status-1 {
            background-color: #52c41a;
            box-shadow: 0 0 0 3px rgba(82, 196, 26, 0.15);
          }

          &.status-2 {
            background-color: #f5222d;
            box-shadow: 0 0 0 3px rgba(245, 34, 45, 0.15);
          }
        }

        .status-text {
          font-size: 14px;
          color: #595959;
          font-weight: 500;
        }
      }

      .action-button {
        transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);

        &:not(:disabled):hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }
      }
    }
  }

  // 加载和空数据状态
  .loading-container {
    padding: 20px;
    background: white;
    border-radius: 12px;
    margin: 0 20px;
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.04);
  }

  .empty-data {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 70px 0;
    background: white;
    border-radius: 12px;
    margin: 0 20px;
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.04);

    .empty-icon {
      margin-bottom: 16px;

      :deep(svg) {
        width: 80px;
        height: 80px;
      }
    }

    .empty-text {
      color: #8c8c8c;
      font-size: 16px;
    }
  }

  // 内容区域
  .content-area {
    position: relative;
    z-index: 2;
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 22px;
    box-sizing: border-box;
  }

  // 卡片容器
  .cards-container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;

    @media (max-width: 992px) {
      grid-template-columns: 1fr;
    }
  }

  // 信息卡片通用样式
  .info-card {
    background: white;
    border-radius: 12px;
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.04);
    overflow: hidden;
    transition: all 0.3s ease;
    border: 1px solid rgba(0, 0, 0, 0.02);

    &:hover {
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.07);
      transform: translateY(-2px);
    }

    .card-title {
      display: flex;
      align-items: center;
      padding: 16px 24px;
      border-bottom: 1px solid rgba(0, 0, 0, 0.03);
      background: #fafbfd;

      :deep(.card-icon) {
        font-size: 18px;
        margin-right: 12px;
        color: var(--el-color-primary);
        width: 18px;
        height: 18px;
      }

      span {
        font-size: 17px;
        font-weight: 600;
        color: #262626;
      }
    }

    .card-content {
      padding: 12px 20px;
    }
  }

  // 图片卡片
  .image-card {
    .image-carousel {
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);

      :deep(.el-carousel__indicators) {
        bottom: 16px;
      }

      :deep(.el-carousel__arrow) {
        background-color: rgba(0, 0, 0, 0.3);

        &:hover {
          background-color: rgba(0, 0, 0, 0.5);
        }
      }

      .carousel-image-container {
        height: 100%;
        width: 100%;
        position: relative;
        cursor: pointer;
        background-color: #f5f7fa;
        display: flex;
        justify-content: center;
        align-items: center;

        .carousel-image {
          height: 100%;
          width: 100%;

          :deep(.el-image__inner) {
            object-fit: contain;
          }
        }

        .image-error,
        .image-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: #c0c4cc;

          :deep(.el-icon) {
            font-size: 28px;
            margin-bottom: 8px;
          }

          span {
            font-size: 14px;
          }
        }
        .image-indicator {
          position: absolute;
          bottom: 40px;
          left: 50%;
          transform: translateX(-50%);
          background-color: rgba(0, 0, 0, 0.5);
          color: white;
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 12px;
          z-index: 1;
        }
      }
    }
  }

  // 系统卡片
  .system-card {
    .system-timeline {
      display: flex;
      flex-direction: column;
      gap: 16px;
      position: relative;

      &::before {
        content: '';
        position: absolute;
        left: 7px;
        top: 8px;
        bottom: 8px;
        width: 1px;
        background-color: #e4e7ed;
      }

      .timeline-item {
        position: relative;
        padding-left: 24px;

        .timeline-dot {
          position: absolute;
          left: 0;
          top: 12px;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          z-index: 1;
          box-shadow: 0 0 0 3px rgba(var(--el-color-primary-rgb), 0.1);

          &.create-dot {
            background-color: #409eff;
          }

          &.update-dot {
            background-color: #722ed1;
          }

          &.publish-dot {
            background-color: #52c41a;
          }
        }

        .timeline-card {
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
          padding: 12px 16px;
          transition: all 0.3s ease;

          &:hover {
            transform: translateX(4px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          }

          .timeline-header {
            display: flex;
            justify-content: space-between;
            align-items: center;

            .timeline-title {
              display: flex;
              align-items: center;
              gap: 6px;
              font-size: 15px;
              font-weight: 500;
              color: #303133;

              :deep(.timeline-icon) {
                font-size: 14px;
                width: 14px;
                height: 14px;
              }
            }

            .timeline-time {
              font-size: 13px;
              color: #909399;
            }
          }

          .timeline-user {
            margin-top: 6px;
            font-size: 14px;
            color: #606266;
            padding-left: 20px;
            position: relative;

            &::before {
              content: '👤';
              position: absolute;
              left: 0;
              font-size: 14px;
              opacity: 0.6;
            }
          }
        }
      }
    }
  }

  // 内容标签页样式
  :deep(.content-tabs) {
    .el-tabs__header {
      margin-bottom: 16px;
      border-bottom: 1px solid #E4E7ED;
    }

    .el-tabs__nav-wrap {
      &::after {
        display: none;
      }
    }

    .el-tabs__nav {
      border: none;
    }

    .el-tabs__item {
      height: 40px;
      line-height: 40px;
      padding: 0 20px;
      font-size: 14px;
      border: none;
      position: relative;
      transition: all 0.3s;
      color: #606266;
      background: transparent;
      margin-right: 30px;

      &.is-active {
        color: var(--el-color-primary);
        font-weight: 500;
        background: transparent;

        &::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 2px;
          background-color: var(--el-color-primary);
          border-radius: 1px;
        }
      }

      &:hover {
        color: var(--el-color-primary);
      }
    }

    .el-tabs__content {
      overflow: visible;
      padding: 0 5px;
    }
  }

  // 技术信息卡片
  .tech-info-card {
    .card-content {
      padding: 28px;
    }

    .tech-content {
      display: flex;
      flex-direction: column;
      gap: 36px;

      .tech-item {
        margin-bottom: 28px;

        &:last-child {
          margin-bottom: 0;
        }

        .tech-header {
          margin-bottom: 12px;
          border-bottom: 1px solid #ebeef5;
          padding-bottom: 8px;

          .tech-label {
            font-size: 16px;
            font-weight: 500;
            color: #303133;
            padding: 0 0 0 12px;
            display: inline-block;
            position: relative;
            border: none;
            background: none;
            margin: 0;

            &::before {
              content: '';
              position: absolute;
              left: 0;
              top: 50%;
              transform: translateY(-50%);
              width: 4px;
              height: 16px;
              background-color: var(--el-color-primary);
              border-radius: 2px;
            }
          }
        }

        .content-tabs {
          margin-top: 10px;
        }

        .rich-text-content {
          padding: 10px 0;
          background: transparent;
          line-height: 1.7;
          color: #333;
          font-size: 14px;
          white-space: pre-wrap;
          word-break: break-word;
        }
      }
    }
  }

  // 通用图标样式
  :deep(.el-button) {
    .el-icon {
      font-size: 16px;
    }
  }

  :deep(.el-icon) {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  // 动画
  @keyframes rotating {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
}
</style>
