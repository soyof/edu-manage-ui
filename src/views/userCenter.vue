<template>
  <div class="user-center">
    <el-card class="user-info-card">
      <template #header>
        <div class="card-header">
          <span>个人中心</span>
        </div>
      </template>

      <el-tabs v-model="activeTab">
        <el-tab-pane label="基本信息" name="baseinfo">
          <ModifyUserBaseInfo
            ref="userInfoRef"
            :isViewMode="isViewMode"
            @save="onSave"
            @cancel="onCancel"
            @edit="onEdit"
          />
        </el-tab-pane>

        <el-tab-pane label="修改密码" name="password">
          <ModifyPassword />
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ModifyUserBaseInfo from '@/components/user/modifyUserBaseInfo.vue'
import ModifyPassword from '@/components/user/modifyPassword.vue'
import { ElMessage } from 'element-plus'

// 定义组件类型
interface UserInfoRef {
  saveUserInfo: () => Promise<void>;
  cancelEditing: () => void;
  startEditing: () => void;
}

// 当前激活的标签页
const activeTab = ref('baseinfo')

// 是否处于查看模式
const isViewMode = ref(true)

// 个人信息组件引用
const userInfoRef = ref<UserInfoRef | null>(null)

// 开始编辑回调
const onEdit = () => {
  isViewMode.value = false
}

// 取消编辑回调
const onCancel = () => {
  isViewMode.value = true
}

// 保存成功回调
const onSave = () => {
  isViewMode.value = true
  ElMessage.success('个人信息更新成功')
}
</script>

<style lang="less" scoped>
.user-center {
  .user-info-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }
}
</style>
