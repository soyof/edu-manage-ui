<template>
  <div class="user-center">
    <el-card class="user-info-card animate__animated animate__fadeIn animate__faster">
      <template #header>
        <div class="card-header">
          <span class="header-title">个人中心</span>
        </div>
      </template>

      <el-tabs v-model="activeTab" @tabClick="handleTabClick">
        <el-tab-pane label="基本信息" name="baseInfo" lazy>
          <div class="tab-content-wrapper" :class="{ 'active-tab': activeTab === 'baseInfo' }">
            <ModifyUserBaseInfo />
          </div>
        </el-tab-pane>
        <el-tab-pane label="学术档案" name="otherInfo" lazy>
          <div class="tab-content-wrapper" :class="{ 'active-tab': activeTab === 'otherInfo' }">
            <OtherUserInfo />
          </div>
        </el-tab-pane>
        <el-tab-pane label="修改密码" name="password" lazy>
          <div class="tab-content-wrapper" :class="{ 'active-tab': activeTab === 'password' }">
            <ModifyPassword />
          </div>
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

// 处理标签页切换
const handleTabClick = () => {
  // 标签页切换时触发动画
  const tabContent = document.querySelector('.active-tab')
  if (tabContent) {
    tabContent.classList.add('tab-animation')
    setTimeout(() => {
      tabContent.classList.remove('tab-animation')
    }, 500)
  }
}
</script>

<style lang="less" scoped>
// 优化后的动画关键帧
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.user-center {
  width: 100%;
  height: @contentHeight;
  overflow: hidden;
  animation: fadeIn 0.4s ease-out;

  .user-info-card {
    transition: box-shadow 0.3s ease;
    border-radius: 8px;
    overflow: hidden;

    &:hover {
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: linear-gradient(135deg,
        color-mix(in srgb, var(--menuBgColor) 8%, white) 0%,
        color-mix(in srgb, var(--menuBgColor) 15%, white) 100%);
      padding: 15px 20px;

      .header-title {
        font-size: 18px;
        font-weight: 600;
        color: var(--el-text-color-primary);
        position: relative;
        padding-left: 12px;

        &::before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          height: 18px;
          width: 4px;
          background-color: var(--primaryColor);
          border-radius: 2px;
        }
      }
    }
  }

  .el-tabs {
    :deep(.el-tabs__header) {
      margin-bottom: 20px;

      .el-tabs__nav-wrap::after {
        height: 1px;
        background-color: #e4e7ed;
        opacity: 0.8;
      }

      .el-tabs__active-bar {
        height: 3px;
        border-radius: 3px;
        transition: all 0.25s cubic-bezier(0.645, 0.045, 0.355, 1);
      }

      .el-tabs__item {
        padding: 0 20px;
        height: 48px;
        line-height: 48px;
        font-size: 15px;
        transition: color 0.25s ease;

        &.is-active {
          font-weight: 600;
        }
      }
    }

    .tab-content-wrapper {
      animation: slideDown 0.3s ease-out;
    }

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

      :deep(.el-form-item) {
        margin-bottom: 16px;
      }

      :deep(.el-button) {
        transition: background-color 0.2s ease, color 0.2s ease;
      }
    }
  }
}
</style>
