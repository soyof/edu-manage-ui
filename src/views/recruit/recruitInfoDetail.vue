<template>
  <div class="recruit-info-detail-container">
    <!-- 页面头部 -->
    <div class="header">
      <div class="left">
        <div class="blue-bar"></div>
        <span class="title">{{ getRecruitTypeLabel(infoDetail.recruitmentType) || '招聘信息详情' }}</span>
      </div>
      <div class="right">
        <el-tag class="status-tag" :type="RecruitStatus.getTagType(infoDetail.status) || 'info'">
          {{ RecruitStatus.getName(infoDetail.status) }}
        </el-tag>
      </div>
    </div>

    <!-- 详情内容 -->
    <div v-loading="loading" class="detail-container">
      <div class="info-card">
        <!-- 状态标签已移至顶部，此处不再需要card-header -->
        <div class="info-grid">
          <div v-if="infoDetail.publishTimes" class="grid-item">
            <div class="item-label">
              <el-icon><Calendar /></el-icon>
              <span>发布时间</span>
            </div>
            <div class="item-value">{{ infoDetail.publishTimes }}</div>
          </div>
          <div class="grid-item">
            <div class="item-label">
              <el-icon><Clock /></el-icon>
              <span>创建时间</span>
            </div>
            <div class="item-value">{{ infoDetail.createdTimes }}</div>
          </div>
          <div class="grid-item">
            <div class="item-label">
              <el-icon><Refresh /></el-icon>
              <span>更新时间</span>
            </div>
            <div class="item-value">{{ infoDetail.updatedTimes }}</div>
          </div>
          <div class="grid-item">
            <div class="item-label">
              <span>发布人</span>
            </div>
            <div class="item-value">{{ infoDetail.publishUserName || infoDetail.publishUserId || '--' }}</div>
          </div>
          <div class="grid-item">
            <div class="item-label">
              <el-icon><User /></el-icon>
              <span>创建人</span>
            </div>
            <div class="item-value">{{ infoDetail.createUserName || infoDetail.createUserId || '未知' }}</div>
          </div>
          <div class="grid-item">
            <div class="item-label">
              <el-icon><Edit /></el-icon>
              <span>更新人</span>
            </div>
            <div class="item-value">{{ infoDetail.updateUserName || infoDetail.updateUserId || '未知' }}</div>
          </div>
        </div>
      </div>

      <div class="content-section">
        <el-tabs v-model="activeTab" class="info-tabs">
          <el-tab-pane label="中文内容" name="zh">
            <div class="content-wrapper">
              <div class="rich-text-content" v-html="infoDetail.content"></div>
            </div>
          </el-tab-pane>
          <el-tab-pane label="英文内容" name="en">
            <div class="content-wrapper">
              <div class="rich-text-content" v-html="infoDetail.contentEn"></div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { Calendar, Clock, Refresh, User, Edit } from '@element-plus/icons-vue'
import service from '@/utils/services'
import useLoading from '@/hooks/useLoading'
import { RecruitStatus } from '@/dic/statusConfig'
import { useDictInfo } from '@/hooks/useDictionary'
const activeTab = ref('zh')

const { changeLoading, closeLoading, loading } = useLoading()

// 路由相关
const route = useRoute()
const recruitId = ref(route.query.id as string)

// 使用字典获取招聘类型选项
const { getDictLabel: getRecruitTypeLabel } = useDictInfo('recruitment_type', true)

// 招聘信息详情
const infoDetail = reactive({
  id: '',
  recruitmentType: '', // 招聘类型
  content: '', // 中文内容
  contentEn: '', // 英文内容
  status: '', // 状态
  publishTimes: '', // 发布时间
  publishUserName: '', // 发布人
  createdTimes: '', // 创建时间
  updatedTimes: '', // 更新时间
  createUserId: '', // 创建人
  createUserName: '', // 创建人名称
  updateUserId: '', // 更新人
  updateUserName: '' // 更新人名称
})

// 获取招聘信息详情
const getRecruitDetail = () => {
  if (!recruitId.value) return
  changeLoading(true)

  // 后端API实际返回结构应据实调整
  service.post<any>('/api/recruit/detail', { id: recruitId.value }).then((res: any) => {
    const data = res || {}
    Object.assign(infoDetail, {
      id: data.id,
      recruitmentType: data.recruitmentType,
      content: data.content,
      contentEn: data.contentEn,
      status: data.status,
      publishTimes: data.publishTimes,
      publishUserName: data.publishUserName,
      createdTimes: data.createdTimes,
      updatedTimes: data.updatedTimes,
      createUserId: data.createUserId,
      createUserName: data.createUserName || data.createUserId,
      updateUserId: data.updateUserId,
      updateUserName: data.updateUserName || data.updateUserId
    })
  }).finally(() => {
    closeLoading()
  })
}

// 组件挂载时加载数据
onMounted(() => {
  getRecruitDetail()
})
</script>

<style lang="less" scoped>
.recruit-info-detail-container {
  width: 100%;
  min-height: @contentHeight;
  background-color: #f5f7fa;
  animation: fadeIn 0.5s ease;

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes slideUp {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }

  @keyframes scaleIn {
    from { transform: scale(0.95); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
  }

  .header {
    position: sticky;
    top: 0;
    left: 0;
    z-index: 10;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    background-color: #fff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

    .left {
      display: flex;
      align-items: center;

      .blue-bar {
        width: 4px;
        height: 22px;
        background-color: #3370ff;
        margin-right: 12px;
        border-radius: 2px;
        animation: scaleIn 0.6s ease;
      }

      .title {
        font-size: 18px;
        color: #303133;
        font-weight: 600;
        letter-spacing: 0.5px;
        animation: fadeIn 0.8s ease;
      }
    }

    .right {
      .status-tag {
        font-size: 14px;
        padding: 8px 16px;
        border-radius: 4px;
        animation: scaleIn 0.7s ease;
        font-weight: 500;
      }
    }
  }

  .detail-container {
    padding: 12px;

    .info-card {
      background-color: #fff;
      border-radius: 12px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
      padding: 24px;
      margin-bottom: 24px;
      animation: slideUp 0.6s ease;

      .info-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 20px;

        .grid-item {
          animation: slideUp 0.7s ease;
          animation-fill-mode: both;

          // 修复Less循环语法错误
          &:nth-child(1) { animation-delay: 0.1s; }
          &:nth-child(2) { animation-delay: 0.2s; }
          &:nth-child(3) { animation-delay: 0.3s; }
          &:nth-child(4) { animation-delay: 0.4s; }
          &:nth-child(5) { animation-delay: 0.5s; }

          .item-label {
            display: flex;
            align-items: center;
            color: #606266;
            margin-bottom: 8px;
            font-size: 14px;

            .el-icon {
              margin-right: 8px;
              font-size: 16px;
              color: #909399;
            }
          }

          .item-value {
            color: #303133;
            font-size: 15px;
            font-weight: 500;
            padding: 4px 0;
            transition: all 0.3s;

            &:hover {
              color: #3370ff;
              transform: translateX(4px);
            }
          }
        }
      }
    }

    .content-section {
      background-color: #fff;
      border-radius: 12px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
      padding: 24px;
      animation: slideUp 0.8s ease;
      animation-delay: 0.3s;
      animation-fill-mode: both;

      .info-tabs {
        :deep(.el-tabs__header) {
          margin-bottom: 24px;

          .el-tabs__nav-wrap::after {
            height: 1px;
          }

          .el-tabs__item {
            font-size: 16px;
            padding: 0 24px 12px;
            transition: all 0.3s;

            &.is-active {
              font-weight: 600;
              transform: translateY(-2px);
            }

            &:hover:not(.is-active) {
              color: #3370ff;
            }
          }

          .el-tabs__active-bar {
            height: 3px;
            border-radius: 3px;
            transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
          }
        }

        .content-wrapper {
          padding: 8px;
        }
      }
    }
  }
}
</style>
