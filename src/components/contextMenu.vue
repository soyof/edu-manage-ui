<template>
  <!-- 自定义右键菜单组件 -->
  <div
    v-show="visible"
    class="custom-context-menu"
    :style="{ top: y + 'px', left: x + 'px' }"
  >
    <div class="menu-group">
      <div class="context-menu-item" @click="handleCommand('refresh')">
        <el-icon><Refresh /></el-icon>
        <span>刷新当前</span>
      </div>
    </div>

    <div class="menu-divider"></div>

    <div class="menu-group">
      <div class="context-menu-item" @click="handleCommand('close')">
        <el-icon><Close /></el-icon>
        <span>关闭当前</span>
      </div>
      <div class="context-menu-item" @click="handleCommand('closeOthers')">
        <el-icon><CircleClose /></el-icon>
        <span>关闭其他</span>
      </div>
      <div class="context-menu-item" @click="handleCommand('closeAll')">
        <el-icon><CloseBold /></el-icon>
        <span>关闭所有</span>
      </div>
    </div>

    <div class="menu-divider"></div>

    <div class="menu-group">
      <div class="context-menu-item" @click="handleCommand('closeRight')">
        <el-icon><ArrowRight /></el-icon>
        <span>关闭右侧所有</span>
      </div>
      <div class="context-menu-item" @click="handleCommand('closeLeft')">
        <el-icon><ArrowLeft /></el-icon>
        <span>关闭左侧所有</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import {
  Refresh,
  Close,
  CircleClose,
  CloseBold,
  ArrowRight,
  ArrowLeft
} from '@element-plus/icons-vue'

// 定义组件属性
const props = defineProps({
  // 菜单是否可见
  visible: {
    type: Boolean,
    default: false
  },
  // 菜单X坐标
  x: {
    type: Number,
    default: 0
  },
  // 菜单Y坐标
  y: {
    type: Number,
    default: 0
  }
})

// 定义组件事件
const emit = defineEmits(['update:visible', 'command'])

// 处理菜单命令
const handleCommand = (command: string) => {
  // 触发命令事件
  emit('command', command)

  // 延迟关闭菜单，给用户一个视觉反馈
  setTimeout(() => {
    closeMenu()
  }, 50)
}

// 关闭菜单
const closeMenu = () => {
  emit('update:visible', false)
}

// 处理全局点击事件
const handleGlobalClick = (event: MouseEvent) => {
  // 如果菜单显示，点击其他地方时关闭
  if (props.visible) {
    closeMenu()
  }
}

// 组件生命周期钩子
onMounted(() => {
  // 添加全局点击事件监听
  window.addEventListener('click', handleGlobalClick)
})

onUnmounted(() => {
  // 移除全局点击事件监听
  window.removeEventListener('click', handleGlobalClick)
})
</script>

<style lang="less" scoped>
/* 自定义右键菜单样式 */
.custom-context-menu {
  position: fixed;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  z-index: 9999;
  padding: 4px 0;
  min-width: 160px;
  animation: fadeIn 0.15s ease-out;
  font-size: 14px;
  overflow: hidden;
}

@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

.menu-group {
  padding: 2px 0;
}

.menu-divider {
  margin: 2px 0;
  height: 1px;
  background-color: #ebeef5;
}

.context-menu-item {
  display: flex;
  align-items: center;
  padding: 0 16px;
  height: 32px;
  color: #606266;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;

  .el-icon {
    margin-right: 8px;
    font-size: 16px;
  }

  span {
    flex: 1;
  }

  &:hover {
    background-color: #f5f7fa;
    color: @textActiveColor;
  }
}
</style>

