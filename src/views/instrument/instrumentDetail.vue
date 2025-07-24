<template>
  <div class="instrument-detail-container animate__animated animate__fadeIn">
    <div class="card-header">
      <h2>{{ pageTitle }}</h2>
      <div class="header-buttons">
        <el-tooltip content="编辑" placement="top" :showAfter="300">
          <el-button
            type="primary"
            circle
            :icon="EditPen"
            :disabled="instrumentData.publishStatus === '1'"
            @click="handleEdit"
          />
        </el-tooltip>
        <el-tooltip :content="instrumentData.publishStatus === '1' ? '下线' : '发布'" placement="top" :showAfter="300">
          <el-button
            :type="instrumentData.publishStatus === '1' ? 'warning' : 'success'"
            circle
            :icon="instrumentData.publishStatus === '1' ? CircleClose : Check"
            @click="handlePublishStatus"
          />
        </el-tooltip>
      </div>
    </div>

    <div v-loading="loading" class="custom-card box-card">
      <div class="card-body">
        <!-- 基本信息 -->
        <HeaderLine title="基本信息" :icon="Document" />
        <div class="info-section">
          <el-row :gutter="24">
            <el-col :span="12">
              <div class="info-item">
                <label>仪器名称（中文）：</label>
                <span>{{ instrumentData.instName || '-' }}</span>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="info-item">
                <label>仪器名称（英文）：</label>
                <span>{{ instrumentData.instNameEn || '-' }}</span>
              </div>
            </el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col :span="12">
              <div class="info-item">
                <label>生产厂家（中文）：</label>
                <span>{{ instrumentData.manufacturer || '-' }}</span>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="info-item">
                <label>生产厂家（英文）：</label>
                <span>{{ instrumentData.manufacturerEn || '-' }}</span>
              </div>
            </el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col :span="12">
              <div class="info-item">
                <label>型号：</label>
                <span>{{ instrumentData.model || '-' }}</span>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="info-item">
                <label>发布状态：</label>
                <el-tag :type="InstrumentStatus.getTagType(instrumentData.publishStatus)">
                  {{ InstrumentStatus.getName(instrumentData.publishStatus) }}
                </el-tag>
              </div>
            </el-col>
          </el-row>
        </div>

        <!-- 技术信息 -->
        <HeaderLine title="技术信息" :icon="Setting" />
        <div class="info-section">
          <div v-if="instrumentData.workingPrinciple" class="info-item full-width">
            <label>工作原理（中文）：</label>
            <div class="content-text" v-html="instrumentData.workingPrinciple"></div>
          </div>
          <div v-if="instrumentData.workingPrincipleEn" class="info-item full-width">
            <label>工作原理（英文）：</label>
            <div class="content-text" v-html="instrumentData.workingPrincipleEn"></div>
          </div>
          <div v-if="instrumentData.applicationScope" class="info-item full-width">
            <label>应用范围（中文）：</label>
            <div class="content-text" v-html="instrumentData.applicationScope"></div>
          </div>
          <div v-if="instrumentData.applicationScopeEn" class="info-item full-width">
            <label>应用范围（英文）：</label>
            <div class="content-text" v-html="instrumentData.applicationScopeEn"></div>
          </div>
          <div v-if="instrumentData.performanceFeatures" class="info-item full-width">
            <label>性能特点（中文）：</label>
            <div class="content-text" v-html="instrumentData.performanceFeatures"></div>
          </div>
          <div v-if="instrumentData.performanceFeaturesEn" class="info-item full-width">
            <label>性能特点（英文）：</label>
            <div class="content-text" v-html="instrumentData.performanceFeaturesEn"></div>
          </div>
          <div v-if="instrumentData.otherInfo" class="info-item full-width">
            <label>其它说明（中文）：</label>
            <div class="content-text" v-html="instrumentData.otherInfo"></div>
          </div>
          <div v-if="instrumentData.otherInfoEn" class="info-item full-width">
            <label>其它说明（英文）：</label>
            <div class="content-text" v-html="instrumentData.otherInfoEn"></div>
          </div>
        </div>

        <!-- 图片信息 -->
        <HeaderLine v-if="instrumentData.imageFiles && instrumentData.imageFiles.length > 0" title="图片信息" :icon="Picture" />
        <div v-if="instrumentData.imageFiles && instrumentData.imageFiles.length > 0" class="info-section">
          <div class="image-gallery">
            <div
              v-for="(image, index) in instrumentData.imageFiles"
              :key="index"
              class="image-item"
              @click="previewImage(image, index)"
            >
              <el-image
                :src="getImageUrl(image)"
                fit="cover"
                :previewSrcList="previewList"
                :initialIndex="index"
                previewTeleported
              >
                <template #error>
                  <div class="image-error">
                    <el-icon><Picture /></el-icon>
                    <span>加载失败</span>
                  </div>
                </template>
              </el-image>
            </div>
          </div>
        </div>

        <!-- 系统信息 -->
        <HeaderLine title="系统信息" :icon="InfoFilled" />
        <div class="info-section">
          <el-row :gutter="24">
            <el-col :span="12">
              <div class="info-item">
                <label>创建人：</label>
                <span>{{ instrumentData.createUserName || '-' }}</span>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="info-item">
                <label>创建时间：</label>
                <span>{{ instrumentData.createdTimes || '-' }}</span>
              </div>
            </el-col>
          </el-row>
          <el-row v-if="instrumentData.updateUserName" :gutter="24">
            <el-col :span="12">
              <div class="info-item">
                <label>更新人：</label>
                <span>{{ instrumentData.updateUserName || '-' }}</span>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="info-item">
                <label>更新时间：</label>
                <span>{{ instrumentData.updatedTimes || '-' }}</span>
              </div>
            </el-col>
          </el-row>
          <el-row v-if="instrumentData.publishUserName" :gutter="24">
            <el-col :span="12">
              <div class="info-item">
                <label>发布人：</label>
                <span>{{ instrumentData.publishUserName || '-' }}</span>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="info-item">
                <label>发布时间：</label>
                <span>{{ instrumentData.publishTimes || '-' }}</span>
              </div>
            </el-col>
          </el-row>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { EditPen, Check, CircleClose, Document, Setting, Picture, InfoFilled } from '@element-plus/icons-vue'
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

  .card-header {
    position: sticky;
    top: 0;
    left: 0;
    z-index: 10;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 20px;
    background-color: #fff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

    h2 {
      font-size: 20px;
      margin: 0;
      padding: 0;
      background-image: linear-gradient(90deg, var(--el-color-primary), #409eff);
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
      font-weight: 600;
    }

    .header-buttons {
      display: flex;
      gap: 8px;
    }
  }

  .custom-card {
    background-color: #fff;
    padding: 20px;
    border-radius: 8px;
    transition: all 0.3s ease;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

    &:hover {
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
    }
  }

  .box-card {
    transition: all 0.3s ease;
    border: none;
    border-radius: 8px;
  }

  .card-body {
    padding-top: 4px;
  }

  .info-section {
    margin-bottom: 32px;
    padding: 16px 0;

    .info-item {
      display: flex;
      align-items: flex-start;
      margin-bottom: 16px;
      line-height: 1.6;

      &.full-width {
        flex-direction: column;
        align-items: stretch;
      }

      label {
        font-weight: 500;
        color: #606266;
        min-width: 120px;
        margin-right: 12px;
        flex-shrink: 0;
      }

      span {
        color: #303133;
        word-break: break-all;
      }

      .content-text {
        color: #303133;
        line-height: 1.8;
        white-space: pre-wrap;
        word-break: break-all;
        margin-top: 8px;
        padding: 12px;
        background-color: #f8f9fa;
        border-radius: 4px;
        border-left: 3px solid var(--el-color-primary);
      }
    }
  }

  .image-gallery {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 16px;
    margin-top: 16px;

    .image-item {
      position: relative;
      width: 100%;
      height: 200px;
      border-radius: 8px;
      overflow: hidden;
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
      }

      :deep(.el-image) {
        width: 100%;
        height: 100%;
        border-radius: 8px;

        img {
          transition: all 0.3s ease;
        }

        &:hover img {
          transform: scale(1.05);
        }
      }

      .image-error {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        color: #c0c4cc;
        background-color: #f5f7fa;

        .el-icon {
          font-size: 32px;
          margin-bottom: 8px;
        }

        span {
          font-size: 14px;
        }
      }
    }
  }

  :deep(.el-row) {
    margin-bottom: 0;
  }

  :deep(.el-col) {
    margin-bottom: 0;
  }
}
</style>
