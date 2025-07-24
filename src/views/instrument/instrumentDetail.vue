<template>
  <div class="instrument-detail-container animate__animated animate__fadeIn">
    <!-- 几何装饰元素 -->
    <div class="geometric-shapes">
      <div class="shape shape-1"></div>
      <div class="shape shape-2"></div>
      <div class="shape shape-3"></div>
    </div>

    <!-- 顶部标题栏 -->
    <div class="card-header">
      <div class="title-wrapper">
        <div class="title-icon">
          <i class="el-icon instrument-icon">
            <Document class="icon-svg" />
          </i>
        </div>
        <div class="title-content">
          <h2>{{ pageTitle }}</h2>
          <div v-if="instrumentData.model" class="subtitle">
            型号: {{ instrumentData.model }}
          </div>
        </div>
      </div>
      <div class="header-buttons">
        <div v-if="instrumentData.publishStatus" class="status-indicator">
          <div class="status-dot" :class="'status-' + instrumentData.publishStatus"></div>
          <span class="status-text">{{ InstrumentStatus.getName(instrumentData.publishStatus) }}</span>
        </div>
        <el-tooltip content="编辑" placement="top" :showAfter="300">
          <el-button
            class="action-button"
            type="primary"
            circle
            :icon="EditPen"
            :disabled="instrumentData.publishStatus === '1'"
            @click="handleEdit"
          />
        </el-tooltip>
        <el-tooltip :content="instrumentData.publishStatus === '1' ? '下线' : '发布'" placement="top" :showAfter="300">
          <el-button
            class="action-button"
            :type="instrumentData.publishStatus === '1' ? 'warning' : 'success'"
            circle
            :icon="instrumentData.publishStatus === '1' ? CircleClose : Check"
            @click="handlePublishStatus"
          />
        </el-tooltip>
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
      <!-- 基本信息卡片 -->
      <div class="info-card basic-info-card">
        <div class="card-title">
          <Document class="card-icon" />
          <span>基本信息</span>
        </div>
        <div class="card-content">
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">仪器名称（中文）</div>
              <div class="info-value">{{ instrumentData.instName || '-' }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">仪器名称（英文）</div>
              <div class="info-value">{{ instrumentData.instNameEn || '-' }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">生产厂家（中文）</div>
              <div class="info-value">{{ instrumentData.manufacturer || '-' }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">生产厂家（英文）</div>
              <div class="info-value">{{ instrumentData.manufacturerEn || '-' }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">型号</div>
              <div class="info-value highlight">{{ instrumentData.model || '-' }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">发布状态</div>
              <div class="info-value">
                <el-tag :type="InstrumentStatus.getTagType(instrumentData.publishStatus)" effect="dark">
                  {{ InstrumentStatus.getName(instrumentData.publishStatus) }}
                </el-tag>
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
            <div v-if="instrumentData.workingPrinciple" class="tech-item">
              <div class="tech-header">
                <div class="tech-label">工作原理（中文）</div>
              </div>
              <div class="rich-text-content" v-html="instrumentData.workingPrinciple"></div>
            </div>
            <div v-if="instrumentData.workingPrincipleEn" class="tech-item">
              <div class="tech-header">
                <div class="tech-label">工作原理（英文）</div>
              </div>
              <div class="rich-text-content" v-html="instrumentData.workingPrincipleEn"></div>
            </div>
            <div v-if="instrumentData.applicationScope" class="tech-item">
              <div class="tech-header">
                <div class="tech-label">应用范围（中文）</div>
              </div>
              <div class="rich-text-content" v-html="instrumentData.applicationScope"></div>
            </div>
            <div v-if="instrumentData.applicationScopeEn" class="tech-item">
              <div class="tech-header">
                <div class="tech-label">应用范围（英文）</div>
              </div>
              <div class="rich-text-content" v-html="instrumentData.applicationScopeEn"></div>
            </div>
            <div v-if="instrumentData.performanceFeatures" class="tech-item">
              <div class="tech-header">
                <div class="tech-label">性能特点（中文）</div>
              </div>
              <div class="rich-text-content" v-html="instrumentData.performanceFeatures"></div>
            </div>
            <div v-if="instrumentData.performanceFeaturesEn" class="tech-item">
              <div class="tech-header">
                <div class="tech-label">性能特点（英文）</div>
              </div>
              <div class="rich-text-content" v-html="instrumentData.performanceFeaturesEn"></div>
            </div>
            <div v-if="instrumentData.otherInfo" class="tech-item">
              <div class="tech-header">
                <div class="tech-label">其它说明（中文）</div>
              </div>
              <div class="rich-text-content" v-html="instrumentData.otherInfo"></div>
            </div>
            <div v-if="instrumentData.otherInfoEn" class="tech-item">
              <div class="tech-header">
                <div class="tech-label">其它说明（英文）</div>
              </div>
              <div class="rich-text-content" v-html="instrumentData.otherInfoEn"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 图片信息卡片 -->
      <div v-if="instrumentData.imageFiles && instrumentData.imageFiles.length > 0" class="info-card image-info-card">
        <div class="card-title">
          <Picture class="card-icon" />
          <span>图片信息</span>
        </div>
        <div class="card-content">
          <div class="image-gallery">
            <div
              v-for="(image, index) in instrumentData.imageFiles"
              :key="index"
              class="image-item animate__animated animate__fadeIn"
              @click="previewImage(image, index)"
            >
              <div class="image-container">
                <el-image
                  :src="getImageUrl(image)"
                  fit="cover"
                  :previewSrcList="previewList"
                  :initialIndex="index"
                  previewTeleported
                  lazy
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
                <div class="image-overlay">
                  <div class="image-zoom">
                    <i class="el-icon"><ZoomIn class="zoom-icon" /></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 系统信息卡片 -->
      <div class="info-card system-info-card">
        <div class="card-title">
          <InfoFilled class="card-icon" />
          <span>系统信息</span>
        </div>
        <div class="card-content">
          <div class="timeline">
            <div class="timeline-item">
              <div class="timeline-icon create-icon">
                <i class="el-icon"><Plus class="timeline-svg" /></i>
              </div>
              <div class="timeline-content">
                <div class="timeline-title">创建</div>
                <div class="timeline-time">{{ instrumentData.createdTimes || '-' }}</div>
                <div class="timeline-user">{{ instrumentData.createUserName || '-' }}</div>
              </div>
            </div>
            <div v-if="instrumentData.updateUserName" class="timeline-item">
              <div class="timeline-icon update-icon">
                <i class="el-icon"><EditPen class="timeline-svg" /></i>
              </div>
              <div class="timeline-content">
                <div class="timeline-title">更新</div>
                <div class="timeline-time">{{ instrumentData.updatedTimes || '-' }}</div>
                <div class="timeline-user">{{ instrumentData.updateUserName || '-' }}</div>
              </div>
            </div>
            <div v-if="instrumentData.publishUserName" class="timeline-item">
              <div class="timeline-icon publish-icon">
                <i class="el-icon"><Check class="timeline-svg" /></i>
              </div>
              <div class="timeline-content">
                <div class="timeline-title">发布</div>
                <div class="timeline-time">{{ instrumentData.publishTimes || '-' }}</div>
                <div class="timeline-user">{{ instrumentData.publishUserName || '-' }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  EditPen,
  Check,
  CircleClose,
  Document,
  Setting,
  Picture,
  InfoFilled,
  Plus,
  ZoomIn
} from '@element-plus/icons-vue'
import HeaderLine from '@/components/global/headerLine.vue'
import service from '@/utils/services'
import { createStatusConfig } from '@/dic/statusConfig'
import useLoading from '@/hooks/useLoading'

const route = useRoute()
const router = useRouter()
const { loading, changeLoading, closeLoading } = useLoading()

// 创建仪器状态配置
const InstrumentStatus = createStatusConfig('待发布', '已发布', '已下线')

const instrumentId = ref(route.query.id as string)

// 页面标题
const pageTitle = computed(() => {
  if (route.query.tabTitle) {
    return decodeURIComponent(route.query.tabTitle as string)
  }
  return '仪器详情'
})

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

// 预览图片
const previewImage = (image: string, index: number) => {
  // 图片预览功能由 el-image 组件自动处理
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

// 编辑仪器
const handleEdit = () => {
  if (instrumentData.publishStatus === '1') {
    ElMessage.warning('已发布的仪器不可编辑')
    return
  }

  const tabTitle = `编辑仪器【${instrumentData.instName}】`
  router.push({
    path: '/modifyInstrument',
    query: {
      mode: 'edit',
      id: instrumentId.value,
      tabTitle: encodeURIComponent(tabTitle)
    }
  })
}

// 处理发布状态
const handlePublishStatus = () => {
  const isPublish = instrumentData.publishStatus !== '1'
  const actionText = isPublish ? '发布' : '下线'

  ElMessageBox.confirm(`确认${actionText}该仪器吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: isPublish ? 'info' : 'warning'
  }).then(() => {
    service.post('/api/instrument/publish', {
      id: instrumentData.id,
      action: isPublish ? 'publish' : 'unpublish'
    }).then(() => {
      ElMessage.success(`${actionText}成功`)
      // 重新获取数据
      fetchInstrumentDetail()
    })
  }).catch(() => {})
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
  background: linear-gradient(135deg, #f6f8fb 0%, #e9f0f6 100%);
  overflow: hidden;

  // 几何装饰元素
  .geometric-shapes {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
    pointer-events: none;
    overflow: hidden;

    .shape {
      position: absolute;
      border-radius: 50%;
      opacity: 0.04;
      background: var(--el-color-primary);

      &.shape-1 {
        width: 500px;
        height: 500px;
        top: -250px;
        right: -100px;
      }

      &.shape-2 {
        width: 300px;
        height: 300px;
        bottom: -100px;
        left: -50px;
      }

      &.shape-3 {
        width: 200px;
        height: 200px;
        bottom: 30%;
        right: 10%;
      }
    }
  }

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
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
    margin-bottom: 20px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);

    .title-wrapper {
      display: flex;
      align-items: center;
      gap: 16px;

      .title-icon {
        width: 48px;
        height: 48px;
        border-radius: 12px;
        background: linear-gradient(135deg, var(--el-color-primary), #65a7ff);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 24px;
        box-shadow: 0 6px 16px rgba(var(--el-color-primary-rgb), 0.3);

        :deep(.icon-svg) {
          width: 24px;
          height: 24px;
        }
      }

      .title-content {
        h2 {
          font-size: 22px;
          margin: 0 0 4px;
          padding: 0;
          font-weight: 600;
          letter-spacing: 0.5px;
          color: #262626;
        }

        .subtitle {
          font-size: 14px;
          color: #8c8c8c;
          letter-spacing: 0.3px;
        }
      }
    }

    .header-buttons {
      display: flex;
      gap: 16px;
      align-items: center;

      .status-indicator {
        display: flex;
        align-items: center;
        background: rgba(0, 0, 0, 0.04);
        padding: 6px 12px;
        border-radius: 30px;

        .status-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          margin-right: 8px;

          &.status-0 {
            background-color: #faad14;
            box-shadow: 0 0 0 3px rgba(250, 173, 20, 0.2);
          }

          &.status-1 {
            background-color: #52c41a;
            box-shadow: 0 0 0 3px rgba(82, 196, 26, 0.2);
          }

          &.status-2 {
            background-color: #f5222d;
            box-shadow: 0 0 0 3px rgba(245, 34, 45, 0.2);
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
          transform: translateY(-3px);
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        }
      }
    }
  }

  // 加载和空数据状态
  .loading-container {
    padding: 20px;
    background: white;
    border-radius: 16px;
    margin: 0 20px;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.06);
  }

  .empty-data {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 80px 0;
    background: white;
    border-radius: 16px;
    margin: 0 20px;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.06);

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
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  // 信息卡片通用样式
  .info-card {
    background: white;
    border-radius: 16px;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.06);
    overflow: hidden;
    transition: all 0.3s ease;
    border: 1px solid rgba(0, 0, 0, 0.03);

    &:hover {
      box-shadow: 0 12px 36px rgba(0, 0, 0, 0.09);
      transform: translateY(-2px);
    }

    .card-title {
      display: flex;
      align-items: center;
      padding: 18px 24px;
      border-bottom: 1px solid rgba(0, 0, 0, 0.04);
      background: #fafafa;

      :deep(.card-icon) {
        font-size: 20px;
        margin-right: 12px;
        color: var(--el-color-primary);
        width: 20px;
        height: 20px;
      }

      span {
        font-size: 18px;
        font-weight: 600;
        color: #262626;
        letter-spacing: 0.5px;
      }
    }

    .card-content {
      padding: 24px;
    }
  }

  // 基本信息卡片
  .basic-info-card {
    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 24px 40px;

      @media (max-width: 768px) {
        grid-template-columns: 1fr;
      }

      .info-item {
        .info-label {
          font-size: 14px;
          color: #8c8c8c;
          margin-bottom: 8px;
          letter-spacing: 0.3px;
        }

        .info-value {
          font-size: 16px;
          color: #262626;
          letter-spacing: 0.3px;
          word-break: break-word;

          &.highlight {
            font-weight: 500;
            color: var(--el-color-primary);
          }
        }
      }
    }
  }

  // 技术信息卡片
  .tech-info-card {
    .tech-content {
      display: flex;
      flex-direction: column;
      gap: 28px;

      .tech-item {
        .tech-header {
          margin-bottom: 12px;

          .tech-label {
            font-size: 15px;
            font-weight: 500;
            color: #595959;
            padding: 0 0 8px;
            border-bottom: 2px solid rgba(var(--el-color-primary-rgb), 0.1);
            letter-spacing: 0.4px;
          }
        }

        .rich-text-content {
          padding: 12px;
          background: #f9fafb;
          border-radius: 8px;
          border-left: 4px solid var(--el-color-primary);
          line-height: 1.8;
          color: #262626;
          font-size: 15px;
          white-space: pre-wrap;
          word-break: break-word;
          letter-spacing: 0.3px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
        }
      }
    }
  }

  // 图片信息卡片
  .image-info-card {
    .image-gallery {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 24px;

      @media (max-width: 768px) {
        grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
      }

      .image-item {
        position: relative;
        border-radius: 12px;
        overflow: hidden;
        aspect-ratio: 1 / 1;
        cursor: pointer;

        .image-container {
          position: relative;
          width: 100%;
          height: 100%;
          overflow: hidden;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
          border-radius: 12px;

          :deep(.el-image) {
            width: 100%;
            height: 100%;

            img {
              transition: all 0.5s ease;
            }
          }

          .image-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.4);
            opacity: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;

            .image-zoom {
              transform: scale(0.8);
              opacity: 0;
              transition: all 0.3s ease;
              width: 50px;
              height: 50px;
              background: rgba(255, 255, 255, 0.9);
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              color: #262626;
              font-size: 24px;

              :deep(.zoom-icon) {
                width: 24px;
                height: 24px;
              }
            }
          }

          &:hover {
            .image-overlay {
              opacity: 1;
            }

            .image-zoom {
              transform: scale(1);
              opacity: 1;
            }

            :deep(img) {
              transform: scale(1.1);
            }
          }
        }

        .image-error, .image-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: #c0c4cc;
          background-color: #f5f7fa;

          :deep(.el-icon) {
            font-size: 32px;
            margin-bottom: 10px;
          }

          span {
            font-size: 14px;
          }
        }

        .image-loading {
          :deep(.el-icon) {
            animation: rotating 2s linear infinite;
          }
        }
      }
    }
  }

  // 系统信息卡片
  .system-info-card {
    .timeline {
      display: flex;
      flex-direction: column;
      gap: 24px;
      position: relative;

      &:before {
        content: '';
        position: absolute;
        top: 0;
        bottom: 0;
        left: 24px;
        width: 2px;
        background: #f0f0f0;
        z-index: 1;
      }

      .timeline-item {
        display: flex;
        gap: 20px;
        position: relative;
        z-index: 2;
        padding-left: 16px;

        .timeline-icon {
          width: 40px;
          height: 40px;
          min-width: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 18px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          position: relative;
          z-index: 2;

          :deep(.timeline-svg) {
            width: 18px;
            height: 18px;
          }

          &.create-icon {
            background: linear-gradient(135deg, #1890ff, #096dd9);
          }

          &.update-icon {
            background: linear-gradient(135deg, #722ed1, #531dab);
          }

          &.publish-icon {
            background: linear-gradient(135deg, #52c41a, #389e0d);
          }
        }

        .timeline-content {
          .timeline-title {
            font-weight: 500;
            font-size: 16px;
            color: #262626;
            margin-bottom: 4px;
          }

          .timeline-time {
            font-size: 14px;
            color: #8c8c8c;
            margin-bottom: 6px;
          }

          .timeline-user {
            font-size: 15px;
            color: #595959;
          }
        }
      }
    }
  }

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
