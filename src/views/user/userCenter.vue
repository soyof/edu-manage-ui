<template>
  <div class="user-center">
    <el-card class="user-info-card">
      <template #header>
        <div class="card-header">
          <span>个人中心</span>
        </div>
      </template>

      <el-tabs v-model="activeTab">
        <el-tab-pane label="基本信息" name="baseInfo" lazy>
          <ModifyUserBaseInfo />
        </el-tab-pane>
        <el-tab-pane label="学术档案" name="otherInfo" lazy>
          <OtherUserInfo />
        </el-tab-pane>
        <el-tab-pane label="修改密码" name="password" lazy>
          <ModifyPassword />
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ModifyUserBaseInfo from '@/components/user/modifyUserBaseInfo.vue'
import OtherUserInfo from '@/components/user/otherUserInfo.vue'
import ModifyPassword from '@/components/user/modifyPassword.vue'

// 当前激活的标签页
const activeTab = ref('baseInfo')
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
  .el-tabs {
    :deep(.el-tabs__content) {
      width: 100%;
      max-height: calc(@contentHeight - 160px);
      overflow: auto;
      &::-webkit-scrollbar {
        width: 6px;
        height: 6px;
      }

      &::-webkit-scrollbar-thumb {
        border-radius: 3px;
        background-color: rgba(144, 147, 153, 0.3);

        &:hover {
          background-color: rgba(144, 147, 153, 0.5);
        }
      }

      &::-webkit-scrollbar-track {
        border-radius: 3px;
        background-color: rgba(144, 147, 153, 0.1);
      }
    }
  }
}
</style>
