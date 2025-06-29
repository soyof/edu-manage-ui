<template>
  <div class="other-user-info">
    <!-- 固定在右上角的按钮区域 - 根据模式显示不同按钮 -->
    <div class="fixed-action-buttons">
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

    <!-- 使用抽离出的学术档案表单编辑器组件 -->
    <AcademicFormEditor
      ref="formEditorRef"
      :userId="targetUserId"
      :initialData="formData"
      :isDisabled="isViewMode"
      :showButtons="false"
      @save="handleFormSave"
      @cancel="handleFormCancel"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { ElMessage } from 'element-plus'
import { EditPen, Check, Close, ArrowDown, ArrowUp } from '@element-plus/icons-vue'
import { useUserInfoStore } from '@/stores/userInfo'
import service from '@/utils/services'
import useLoading from '@/hooks/useLoading'
import AcademicFormEditor from './academicFormEditor.vue'

// 用户信息存储
const userInfoStore = useUserInfoStore()

// 是否处于编辑模式
const isEditing = ref(false)
// 是否处于只读模式
const isViewMode = ref(true)
// 使用封装的loading hook
const { loading, changeLoading, closeLoading } = useLoading({
  target: '.user-info-card'
})

// 表单编辑器引用
const formEditorRef = ref()

// 表单数据
const formData = ref({})

// 组件销毁前关闭loading
onBeforeUnmount(() => {
  closeLoading()
})

// 用户信息
const userInfo = computed(() => {
  const info = userInfoStore.userInfo || {}
  return {
    id: info.id || '',
    userId: info.userId || '',
    otherInfo: info.otherInfo || {}
  }
})

// 计算目标用户ID
const targetUserId = computed(() => {
  return userInfo.value.userId
})

// 生命周期钩子
onMounted(() => {
  // 获取用户其他信息并初始化表单
  getUserOtherInfo()
})

// 获取用户其他信息
const getUserOtherInfo = () => {
  changeLoading(true)
  service.get(`/api/getCurrentUserOtherInfo`).then(res => {
    formData.value = res || {}
  }).finally(() => {
    setTimeout(() => {
      changeLoading(false)
    }, 800)
  })
}

// 开始编辑
const startEditing = () => {
  isEditing.value = true
  isViewMode.value = false
}

// 取消编辑
const cancelEditing = () => {
  isEditing.value = false
  isViewMode.value = true

  // 重新加载数据
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

  // 调用更新API
  service.post('/api/updateCurrentUserOtherInfo', params).then(async() => {
    // 退出编辑模式
    isEditing.value = false
    isViewMode.value = true
    ElMessage.success('保存成功')
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
.other-user-info {
  width: 100%;
  position: relative;

  // 固定在容器右上角的按钮区域
  .fixed-action-buttons {
    position: sticky;
    top: 0;
    right: 0;
    z-index: 10;
    display: flex;
    justify-content: flex-end;
    margin-bottom: 12px;
    background-color: #fff;
    border-radius: 5px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    height: 36px;
    align-items: center;
    gap: 8px; // 按钮组之间的间距

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
</style>
