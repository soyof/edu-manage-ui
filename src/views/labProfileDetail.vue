<template>
  <div class="lab-profile-detail-container">
    <div v-loading="loading" class="content-wrap">
      <div v-if="profileData" class="lab-profile-content-wrapper">
        <!-- 简介标题和状态 -->
        <div class="profile-header">
          <div class="header-title">
            <h1 class="title">{{ profileData.title }}</h1>
            <el-tag
              size="small"
              :type="statusInfos[profileData.publishStatus as keyof typeof statusInfos]?.type"
              class="status-tag"
            >
              {{ statusInfos[profileData.publishStatus as keyof typeof statusInfos]?.label }}
            </el-tag>
          </div>

          <!-- 简要元信息 -->
          <div class="meta-brief">
            <span class="meta-item">创建人：{{ profileData.createUserName || '未知' }}</span>
            <span class="meta-item">更新人：{{ profileData.updateUserName || '未知' }}</span>
            <span class="meta-item">更新时间：{{ profileData.updatedTimes }}</span>
            <span v-if="profileData.publishStatus === '1'" class="meta-item">发布时间：{{ profileData.publishTime }}</span>
          </div>
        </div>

        <!-- 内容区域 -->
        <div class="profile-body">
          <el-tabs type="card">
            <el-tab-pane label="中文内容">
              <div class="content-wrapper">
                <div class="rich-text-content" v-html="profileData.content"></div>
              </div>
            </el-tab-pane>
            <el-tab-pane v-if="profileData.contentEn" label="英文内容">
              <div class="content-wrapper">
                <div class="rich-text-content" v-html="profileData.contentEn"></div>
              </div>
            </el-tab-pane>
            <el-tab-pane v-else label="英文内容" disabled>
              <el-empty description="暂无英文内容" />
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

// 路由相关
const route = useRoute()

// 页面参数
const profileId = ref(route.query.id as string)
const loading = ref(false)

// 简介数据
const profileData = ref<any>(null)

// 状态信息映射
const statusInfos = {
  '0': {
    type: 'info',
    label: '待发布'
  },
  '1': {
    type: 'success',
    label: '已发布'
  },
  '2': {
    type: 'warning',
    label: '已下线'
  }
}

// 获取简介详情数据
const getProfileDetail = () => {
  if (!profileId.value) {
    ElMessage.error('缺少简介ID参数')
    return
  }

  loading.value = true
  service.post('/api/labProfile/detail', {
    id: profileId.value
  }).then(res => {
    profileData.value = res
  }).finally(() => {
    loading.value = false
  })
}

onMounted(() => {
  getProfileDetail()
})
</script>

<style scoped lang="less">
.lab-profile-detail-container {
  position: relative;
  min-height: @contentHeight;
  background-color: @pageBgColor;

  .content-wrap {
    background-color: #fff;
    border-radius: 12px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
    min-height: 400px;
    overflow: hidden;

    .lab-profile-content-wrapper {
      .profile-header {
        padding: 16px 24px;
        border-bottom: 1px solid #dcdfe6;
        background-color: color-mix(in srgb, var(--menuBgColor) 20%, white);
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);

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
          }

          .status-tag {
            padding: 0 10px;
            height: 22px;
            line-height: 20px;
            border-radius: 11px;
            font-weight: 500;
            font-size: 12px;
          }
        }

        .meta-brief {
          margin-top: 10px;
          font-size: 13px;
          color: #606266;
          display: flex;
          flex-wrap: wrap;
          gap: 16px;

          .meta-item {
            white-space: nowrap;
          }
        }
      }

      .profile-body {
        padding: 0;

        :deep(.el-tabs__header) {
          margin: 0;
          padding: 0 16px;
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

            &.is-active {
              font-weight: 700;
              color: var(--primaryColor);
              border-bottom: 2px solid var(--primaryColor);
            }
          }
        }

        .content-wrapper {
          min-height: 400px;
          padding: 24px;
          background-color: #fafafa;
          border: 1px solid #ebeef5;
          border-top: none;
        }

        :deep(.el-tabs__content) {
          padding: 0;
        }

        .rich-text-content {
          line-height: 1.8;
          color: #303133;
          font-size: 15px;

          :deep(img) {
            border-radius: 4px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            margin: 10px 0;
            border: 1px solid #ebeef5;
          }

          :deep(table) {
            width: 100%;
            border-collapse: collapse;
            margin: 16px 0;
            border: 1px solid #dcdfe6;

            td, th {
              border: 1px solid #dcdfe6;
              padding: 10px;
            }

            th {
              background-color: #f5f7fa;
              font-weight: 600;
            }
          }
        }
      }
    }

    .no-data {
      padding: 80px 0;
      display: flex;
      justify-content: center;
    }
  }
}
</style>

