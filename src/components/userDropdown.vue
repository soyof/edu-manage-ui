<template>
  <div class="user-dropdown">
    <el-dropdown trigger="click" @visibleChange="handleVisibleChange">
      <div class="avatar-wrapper" :class="{ 'active': dropdownVisible }">
        <div class="avatar-container">
          <el-avatar :size="28" :src="userAvatar" class="user-avatar"
            :class="{'has-image': !!userInfo.avatar}"
          >
            {{ avatarFallback }}
          </el-avatar>
          <div class="avatar-status"></div>
        </div>
        <div class="user-info">
          <span class="user-name">{{ userInfo.username }}</span>
          <span class="user-role">{{ userInfo.roleName }}</span>
        </div>
        <el-icon class="el-icon--right" :class="{ 'is-reverse': dropdownVisible }">
          <ArrowDown />
        </el-icon>
      </div>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item @click="handleCommand('center')">
            <el-icon><User /></el-icon>个人中心
          </el-dropdown-item>

          <el-dropdown-item divided @click="handleCommand('logout')">
            <el-icon><SwitchButton /></el-icon>退出登录
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<script setup lang="ts">
import { ArrowDown, User, SwitchButton } from '@element-plus/icons-vue'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserInfoStore } from '@/stores/userInfo'
import { useThemeStore } from '@/stores/theme'
import { ElMessageBox, ElMessage, ElLoading } from 'element-plus'

// 获取当前主题
const themeStore = useThemeStore()
const currentTheme = computed(() => themeStore.currentTheme)

// 下拉菜单是否可见
const dropdownVisible = ref(false)

// 处理下拉菜单可见性变化
const handleVisibleChange = (visible: boolean) => {
  dropdownVisible.value = visible
}

// 用户信息接口
interface UserInfo {
  username: string
  roleName: string
  avatar?: string
  [key: string]: any
}

const router = useRouter()
const userInfoStore = useUserInfoStore()

// 随机生成头像背景颜色，避开蓝色系(#1890ff, #409efe)
const avatarColors = [
  '#67C23A', // 绿色
  '#E6A23C', // 黄色
  '#F56C6C', // 红色
  '#909399', // 灰色
  '#8E44AD', // 紫色
  '#16A085', // 青绿色
  '#D35400', // 橙色
  '#27AE60', // 深绿色
  '#F39C12', // 金黄色
  '#C0392B' // 深红色
]

// 用户名第一个字符作为头像占位符
const avatarFallback = computed(() => {
  const username = userInfo.value.username || ''
  return username.charAt(0).toUpperCase()
})

// 头像背景颜色
const avatarBgColor = computed(() => {
  const username = userInfo.value.username || '--'
  // 使用用户名的哈希值来确定颜色索引，这样同一用户名总是得到同一颜色
  let hashCode = 0
  for (let i = 0; i < username.length; i++) {
    hashCode += username.charCodeAt(i)
  }
  const colorIndex = Math.abs(hashCode) % avatarColors.length
  return avatarColors[colorIndex]
})

// 用户头像
const userAvatar = computed(() => {
  // 如果用户信息中有头像则使用，否则返回空字符串使用占位符
  if (userInfo.value.avatar) {
    return `/api/previewAvatar?filename=${userInfo.value.avatar}&userId=${userInfo.value.userId}`
  }
  return ''
})

// 用户信息
const userInfo = computed<UserInfo>(() => {
  const info = userInfoStore.userInfo || {}
  return {
    username: info.username || '--',
    roleName: info.role || '--',
    avatar: info.avatar || '',
    ...info
  }
})

// 处理下拉菜单命令
const handleCommand = (command: string) => {
  if (command === 'center') {
    // 跳转到个人中心
    router.push('/userCenter')
  } else if (command === 'logout') {
    // 退出登录
    ElMessageBox.confirm(
      '确定要退出登录吗？',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    ).then(() => {
      // 显示加载状态
      const loadingInstance = ElLoading.service({
        lock: true,
        text: '退出中...',
        background: 'rgba(0, 0, 0, 0.7)'
      })

      // 调用退出登录方法
      userInfoStore.logout().then(() => {
        loadingInstance.close()
        ElMessage.success('退出成功')
        // 在成功退出后直接跳转到登录页面，不需要等待额外操作
        router.push('/login')
      }).catch((error) => {
        console.log(error)
        loadingInstance.close()
        ElMessage.error('退出失败，请稍后重试')
      })
    }).catch(() => {
      // 用户取消退出操作
      console.log('用户取消了退出操作')
    })
  }
}
</script>

<style lang="less" scoped>
// 定义动画关键帧
@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes statusPulse {
  0% { box-shadow: 0 0 0 0 rgba(103, 194, 58, 0.6); }
  70% { box-shadow: 0 0 0 4px rgba(103, 194, 58, 0); }
  100% { box-shadow: 0 0 0 0 rgba(103, 194, 58, 0); }
}

.user-dropdown {
  display: flex;
  align-items: center;
  cursor: pointer;
  animation: fadeIn 0.3s ease;

  .avatar-wrapper {
    display: flex;
    align-items: center;
    padding: 0 10px 0 4px;
    border-radius: 18px;
    background-color: v-bind('currentTheme === "light" ? "rgba(0, 0, 0, 0.08)" : "rgba(255, 255, 255, 0.15)"');
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    border: 1px solid v-bind('currentTheme === "light" ? "rgba(0, 0, 0, 0.1)" : "rgba(255, 255, 255, 0.1)"');
    height: 34px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(8px);

    &:hover {
      background-color: v-bind('currentTheme === "light" ? "rgba(0, 0, 0, 0.12)" : "rgba(255, 255, 255, 0.2)"');
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    &.active {
      background-color: v-bind('currentTheme === "light" ? "rgba(0, 0, 0, 0.15)" : "rgba(255, 255, 255, 0.25)"');
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    }

    .avatar-container {
      position: relative;
      margin-left: 2px;
      margin-right: 8px;
      border-radius: 50%;
      overflow: visible;

      .avatar-status {
        position: absolute;
        width: 6px;
        height: 6px;
        background-color: #67C23A;
        border-radius: 50%;
        right: 0;
        bottom: 0;
        border: 1.5px solid v-bind('currentTheme === "light" ? "#fff" : "#1f1f1f"');
        animation: statusPulse 2s infinite;
      }

      .user-avatar {
        background-color: v-bind(avatarBgColor);
        color: #fff;
        font-size: 12px;
        font-weight: 500;
        border: 1.5px solid v-bind('currentTheme === "light" ? "rgba(255, 255, 255, 0.9)" : "rgba(255, 255, 255, 0.15)"');
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
        transition: transform 0.3s ease, box-shadow 0.3s ease;

        &.has-image {
          background-color: transparent !important;
        }

        &:hover {
          transform: scale(1.05);
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
        }

        :deep(img) {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
      }
    }

    .user-info {
      display: flex;
      flex-direction: column;
      margin-right: 6px;
      transition: transform 0.2s ease;

      .user-name {
        font-size: 12px;
        font-weight: 600;
        color: v-bind('currentTheme === "light" ? "#000000" : "#ffffff"');
        line-height: 1.1;
        white-space: nowrap;
        transition: color 0.2s ease;
        text-shadow: v-bind('currentTheme === "light" ? "0 1px 1px rgba(255, 255, 255, 0.5)" : "0 1px 2px rgba(0, 0, 0, 0.8)"');
      }

      .user-role {
        font-size: 10px;
        color: v-bind('currentTheme === "light" ? "rgba(0, 0, 0, 0.7)" : "rgba(255, 255, 255, 0.85)"');
        line-height: 1.1;
        white-space: nowrap;
        transition: color 0.2s ease;
      }
    }

    .el-icon--right {
      margin-left: 2px;
      color: v-bind('currentTheme === "light" ? "rgba(0, 0, 0, 0.7)" : "rgba(255, 255, 255, 0.85)"');
      font-weight: 400;
      font-size: 11px;
      transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);

      &.is-reverse {
        transform: rotate(180deg);
      }
    }
  }
}

:deep(.el-dropdown-menu) {
  border-radius: 8px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(0, 0, 0, 0.08);
  padding: 6px;

  .el-dropdown-menu__item {
    border-radius: 6px;
    margin: 2px 0;
    padding: 8px 14px;
    font-size: 13px;
    transition: all 0.2s ease;

    .el-icon {
      margin-right: 8px;
      font-size: 15px;
    }

    &:hover {
      background-color: rgba(64, 158, 255, 0.1);
      transform: translateX(2px);
    }

    &.is-active {
      color: var(--el-color-primary);
      background-color: rgba(64, 158, 255, 0.1);
      font-weight: 500;
    }

    &.el-dropdown-menu__item--divided {
      margin-top: 6px;
      border-top: 1px solid rgba(0, 0, 0, 0.06);
      padding-top: 10px;
    }
  }
}
</style>
