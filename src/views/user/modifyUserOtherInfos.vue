<template>
  <div class="modify-user-infos">
    <el-card class="user-info-card">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <span class="page-title">
              <span>学术档案</span>
              <span v-if="userName" class="user-name">- {{ userName }}</span>
            </span>
          </div>

          <div class="action-buttons">
            <!-- 展开/折叠控制按钮 -->
            <div class="button-group collapse-controls">
              <el-button
                type="primary"
                link
                size="small"
                class="action-button"
                @click="handleExpandAll"
              >
                <el-icon class="button-icon"><ArrowDown /></el-icon>全部展开
              </el-button>
              <div class="divider"></div>
              <el-button
                type="primary"
                link
                size="small"
                class="action-button"
                @click="handleCollapseAll"
              >
                <el-icon class="button-icon"><ArrowUp /></el-icon>全部折叠
              </el-button>
            </div>

            <!-- 编辑/保存/取消按钮 -->
            <div class="button-group edit-controls">
              <template v-if="isViewMode">
                <el-button
                  type="primary"
                  link
                  size="small"
                  class="action-button"
                  @click="startEditing"
                >
                  <el-icon class="button-icon"><EditPen /></el-icon>编辑资料
                </el-button>
              </template>
              <template v-else>
                <el-button
                  type="primary"
                  link
                  size="small"
                  class="action-button"
                  :disabled="loading"
                  @click="saveUserInfo"
                >
                  <el-icon class="button-icon"><Check /></el-icon>保存
                </el-button>
                <div class="divider"></div>
                <el-button
                  type="info"
                  link
                  size="small"
                  class="action-button"
                  :disabled="loading"
                  @click="cancelEditing"
                >
                  <el-icon class="button-icon"><Close /></el-icon>取消
                </el-button>
              </template>
            </div>
          </div>
        </div>
      </template>

      <el-scrollbar>
        <AcademicFormEditor
          ref="formEditorRef"
          :userId="userId"
          :initialData="formData"
          :isDisabled="isViewMode"
          :showButtons="false"
          @save="handleFormSave"
          @cancel="handleFormCancel"
        />
      </el-scrollbar>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import AcademicFormEditor from '@/components/user/academicFormEditor.vue'
import { ElMessage } from 'element-plus'
import { EditPen, Check, Close, ArrowDown, ArrowUp } from '@element-plus/icons-vue'
import service from '@/utils/services'
import useLoading from '@/hooks/useLoading'

// 路由器和当前路由
const router = useRouter()
const route = useRoute()

// 获取用户ID
const userId = ref('')
const userName = ref('')

// 表单编辑器引用
const formEditorRef = ref()

// 表单数据
const formData = ref({})

// 视图模式状态管理
const isViewMode = ref(true)

// 使用loading hook
const { loading, changeLoading } = useLoading({
  target: '.user-info-card'
})

// 初始化获取用户ID和数据
onMounted(() => {
  if (route.query.userId) {
    userId.value = route.query.userId as string
    userName.value = route.query.userName as string || ''
    // 获取用户数据
    getUserOtherInfo()
  } else {
    ElMessage.error('缺少用户ID参数')
    router.go(-1)
  }
})

// 获取用户其他信息
const getUserOtherInfo = () => {
  changeLoading(true, { text: '加载中...' })
  service.get(`/api/getUserOtherInfo/${userId.value}`).then(res => {
    formData.value = res || {}
  }).finally(() => {
    changeLoading(false)
  })
}

// 开始编辑
const startEditing = () => {
  isViewMode.value = false
}

// 取消编辑
const cancelEditing = () => {
  isViewMode.value = true
  // 重新获取数据
  getUserOtherInfo()
}

// 保存用户信息
const saveUserInfo = () => {
  if (!formEditorRef.value || loading.value) return
  formEditorRef.value.saveForm()
}

// 处理表单保存
const handleFormSave = (params: any) => {
  changeLoading(true, { text: '保存中...' })

  // 调用API保存数据
  service.post('/api/createOrUpdateUserOtherInfo', params).then(() => {
    ElMessage.success('保存成功')
    isViewMode.value = true
    // 重新加载数据
    getUserOtherInfo()
  }).finally(() => {
    changeLoading(false)
  })
}

// 处理表单取消
const handleFormCancel = () => {
  cancelEditing()
}

// 处理全部展开
const handleExpandAll = () => {
  if (formEditorRef.value) {
    formEditorRef.value.expandAllSections()
  }
}

// 处理全部折叠
const handleCollapseAll = () => {
  if (formEditorRef.value) {
    formEditorRef.value.collapseAllSections()
  }
}
</script>

<style lang="less" scoped>
.modify-user-infos {
  width: 100%;
  height: @contentHeight;
  overflow: hidden;

  .user-info-card {
    width: 100%;
    :deep(.el-card__header) {
      padding: 10px 16px;
    }
    :deep(.el-card__body) {
      width: 100%;
      height: calc(@contentHeight - 50px);
      overflow: hidden;
      padding: 10px 0;
      .el-scrollbar__wrap {
        padding: 0 16px;
        overflow-x: hidden;
      }
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .header-left {
        .page-title {
          font-size: 18px;
          font-weight: bold;
          color: #333;

          .user-name {
            font-weight: normal;
            margin-left: 8px;
            font-size: 16px;
            color: #606266;
          }
        }
      }

      .action-buttons {
        display: flex;
        align-items: center;
        gap: 8px;

        // 按钮组通用样式
        .button-group {
          display: flex;
          align-items: center;
          background-color: #f5f7fa;
          border-radius: 4px;
          padding: 2px 8px;

          .divider {
            width: 1px;
            height: 16px;
            background-color: #dcdfe6;
            margin: 0 8px;
          }

          .el-button {
            font-weight: 500;
            display: flex;
            align-items: center;
            margin: 0;

            &.action-button {
              padding: 4px 8px;
              color: #409eff;

              &[disabled] {
                opacity: 0.5;
                cursor: not-allowed;
              }

              &.el-button--info {
                color: #909399;
              }
            }

            .button-icon {
              margin-right: 4px;
              font-size: 14px;
            }

            &:hover:not([disabled]) {
              opacity: 0.85;
              background: rgba(64, 158, 255, 0.1);
              border-radius: 4px;
            }
          }
        }
      }
    }
  }
}
</style>
