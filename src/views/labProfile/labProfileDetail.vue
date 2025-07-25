<template>
  <div class="lab-profile-detail-container">
    <div class="lab-profile-detail-wrapper">
      <div v-if="profileData" class="lab-profile-content-wrapper">
        <!-- 简介标题和状态 -->
        <div class="profile-header">
          <div class="header-title">
            <h1 class="title">{{ profileData.title }}</h1>
            <el-tag
              size="small"
              :type="ProfileStatus.getTagType(profileData.publishStatus)"
              class="status-tag"
            >
              {{ ProfileStatus.getName(profileData.publishStatus) }}
            </el-tag>
          </div>

          <!-- 简要元信息 -->
          <div class="meta-brief">
            <span class="meta-item">类型：{{ getIntroTypeLabel(profileData.profileType) }}</span>
            <span class="meta-item">创建人：{{ profileData.createUserName || '--' }}</span>
            <span class="meta-item">创建时间：{{ profileData.createdTimes || '--' }}</span>
            <span class="meta-item">更新人：{{ profileData.updateUserName || '--' }}</span>
            <span class="meta-item">更新时间：{{ profileData.updatedTimes || '--' }}</span>
            <span v-if="profileData.publishStatus === '1'" class="meta-item">发布人：{{ profileData.publishUserName || '--' }}</span>
            <span v-if="profileData.publishStatus === '1'" class="meta-item">发布时间：{{ profileData.publishTimes || '--' }}</span>
          </div>
        </div>

        <div class="profile-divider"></div>

        <!-- 内容区域 -->
        <div class="profile-body">
          <el-tabs type="card">
            <el-tab-pane label="中文内容">
              <div class="content-wrapper">
                <div class="rich-text-content" v-html="profileData.content"></div>
              </div>
            </el-tab-pane>
            <el-tab-pane label="英文内容">
              <div class="content-wrapper">
                <div v-if="profileData.contentEn" class="rich-text-content" v-html="profileData.contentEn"></div>
                <el-empty v-else description="暂无英文内容" />
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>

      <div v-else-if="!loading" class="no-data">
        <el-empty description="暂无简介内容" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import service from '@/utils/services'
import { ElMessage } from 'element-plus'
import { ProfileStatus } from '@/dic/statusConfig'
import { useDictionary } from '@/hooks/useDictionary'
import useLoading from '@/hooks/useLoading'

// 路由相关
const route = useRoute()
const { loading, closeLoading, changeLoading } = useLoading()

// 获取简介类型字典数据
const { getDictLabel: getIntroTypeLabel } = useDictionary({
  dictType: 'intro_type',
  autoLoad: true
})

// 页面参数
const profileId = ref(route.query.id as string)

// 简介数据
const profileData = ref<any>(null)

// 获取简介详情数据
const getProfileDetail = () => {
  if (!profileId.value) {
    ElMessage.error('缺少简介ID参数')
    return
  }

  changeLoading(true)
  service.post('/api/labProfile/detail', {
    id: profileId.value
  }).then(res => {
    profileData.value = res
  }).finally(() => {
    closeLoading()
  })
}

onMounted(() => {
  getProfileDetail()
})
</script>

<style scoped lang="less">
// 定义动画关键帧
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

@keyframes slideInRight {
  from { transform: translateX(20px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

.lab-profile-detail-container {
  position: relative;
  min-height: @contentHeight;
  background-color: @pageBgColor;
  animation: fadeIn 0.5s ease-in-out;

  .lab-profile-detail-wrapper {
    background-color: #fff;
    border-radius: 12px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
    min-height: 400px;
    overflow: hidden;
    animation: slideUp 0.6s ease-out;
    transition: box-shadow 0.3s ease;
    padding: 16px;

    &:hover {
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    }

    .lab-profile-content-wrapper {
      .profile-header {
        padding: 20px 24px;
        background-color: color-mix(in srgb, var(--menuBgColor) 10%, white);
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
        transition: background-color 0.3s ease;
        border-radius: 8px 8px 0 0;

        .header-title {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;

          .title {
            font-size: 20px;
            font-weight: 700;
            margin: 0;
            color: var(--el-text-color-primary);
            line-height: 1.4;
            word-break: break-word;
            overflow-wrap: break-word;
            animation: slideUp 0.7s ease;
            transition: transform 0.3s ease, color 0.3s ease;

            &:hover {
              color: var(--primaryColor);
              transform: translateY(-2px);
            }
          }

          .status-tag {
            padding: 0 10px;
            height: 22px;
            line-height: 20px;
            border-radius: 11px;
            font-weight: 500;
            font-size: 12px;
            animation: scaleIn 0.8s ease;
            transition: transform 0.3s ease;

            &:hover {
              transform: scale(1.1);
            }
          }
        }

        .meta-brief {
          margin-top: 16px;
          font-size: 13px;
          color: #606266;
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
          animation: fadeIn 0.9s ease;

          .meta-item {
            white-space: nowrap;
            animation: slideInRight 0.8s ease;
            animation-fill-mode: both;
            transition: color 0.3s ease, transform 0.3s ease;

            &:nth-child(1) { animation-delay: 0.1s; }
            &:nth-child(2) { animation-delay: 0.2s; }
            &:nth-child(3) { animation-delay: 0.3s; }
            &:nth-child(4) { animation-delay: 0.4s; }

            &:hover {
              color: var(--primaryColor);
              transform: translateX(3px);
            }
          }
        }
      }

      .profile-divider {
        height: 16px;
        background-color: #fff;
        border-top: 1px solid #ebeef5;
        border-bottom: 1px solid #ebeef5;
      }

      .profile-body {
        padding: 0;
        animation: slideUp 1s ease;
        animation-fill-mode: both;
        animation-delay: 0.4s;

        :deep(.el-tabs__header) {
          margin: 0;
          padding: 0 12px;
          background-color: #f5f7fa;
          border-bottom: 1px solid #dcdfe6;

          .el-tabs__nav {
            border: none;
          }

          .el-tabs__item {
            height: 40px;
            line-height: 40px;
            font-size: 15px;
            border: none;
            padding: 0 16px;
            font-weight: 500;
            transition: all 0.3s ease;

            &.is-active {
              font-weight: 700;
              color: var(--primaryColor);
              border-bottom: 2px solid var(--primaryColor);
              transform: translateY(-2px);
            }

            &:hover:not(.is-active) {
              color: var(--primaryColor);
              transform: translateY(-1px);
            }
          }

          .el-tabs__active-bar {
            transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
            height: 3px;
          }
        }

        .content-wrapper {
          min-height: 400px;
          padding: 16px;
          background-color: #fafafa;
          border: 1px solid #ebeef5;
          border-top: none;
          animation: fadeIn 1.1s ease;
          animation-fill-mode: both;
          animation-delay: 0.6s;
        }

        :deep(.el-tabs__content) {
          padding: 0;
        }
      }
    }

    .no-data {
      padding: 80px 0;
      display: flex;
      justify-content: center;
      animation: fadeIn 0.8s ease;

      :deep(.el-empty) {
        transition: transform 0.5s ease;

        &:hover {
          transform: scale(1.05);
        }
      }
    }
  }
}
</style>

