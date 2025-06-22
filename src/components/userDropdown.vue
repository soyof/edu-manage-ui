<template>
  <div class="user-dropdown">
    <el-dropdown trigger="click" @visibleChange="handleVisibleChange">
      <div class="avatar-wrapper">
        <el-avatar :size="32" :src="userAvatar" class="user-avatar">
          {{ avatarFallback }}
        </el-avatar>
        <span class="user-name">{{ userInfo.username }}</span>
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
import { ElMessageBox, ElMessage, ElLoading } from 'element-plus'

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
  return userInfo.value.avatar ? `/api/previewAvatar?filename=${userInfo.value.avatar}&userId=${userInfo.value.userId}` : ''
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
        router.push('/login')
      }).catch(() => {
        loadingInstance.close()
        ElMessage.error('退出失败，请稍后重试')
      })
    })
  }
}
</script>

<style lang="less" scoped>
.user-dropdown {
  display: flex;
  align-items: center;
  cursor: pointer;

  .avatar-wrapper {
    display: flex;
    align-items: center;

    .user-avatar {
      margin-right: 8px;
      background-color: v-bind(avatarBgColor);
      color: #fff;
      font-size: 16px;
      font-weight: 600;
    }

    .user-name {
      font-size: 14px;
      font-weight: 700;
      color: #fff;
    }

    .el-icon--right {
      margin-left: 4px;
      color: #fff;
      font-weight: 700;
      font-size: 12px;
      transition: transform 0.3s ease;

      &.is-reverse {
        transform: rotate(180deg);
      }
    }
  }
}
</style>
