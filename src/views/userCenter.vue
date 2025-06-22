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
          <ModifyUserBaseInfo />
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

// 当前激活的标签页
const activeTab = ref('baseinfo')

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
