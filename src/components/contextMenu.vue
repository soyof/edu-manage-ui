<template>
  <!-- 自定义右键菜单组件 -->
  <transition name="menu-fade">
    <div
      v-show="visible"
      class="custom-context-menu"
      :style="{ top: y + 'px', left: x + 'px' }"
    >
      <div class="menu-group">
        <div
          class="context-menu-item"
          :class="{ 'disabled': !isActiveTab }"
          @click="isActiveTab && handleCommand('refresh')"
        >
          <el-icon class="menu-icon"><Refresh /></el-icon>
          <span>刷新当前</span>
          <span v-if="isActiveTab" class="shortcut">F5</span>
        </div>
      </div>

      <div class="menu-divider"></div>

      <div class="menu-group">
        <div
          class="context-menu-item"
          :class="{ 'disabled': !isClosable }"
          @click="isClosable && handleCommand('close')"
        >
          <el-icon class="menu-icon"><Close /></el-icon>
          <span>关闭当前</span>
        </div>
        <div
          class="context-menu-item"
          :class="{ 'disabled': tabsCount <= 1 || onlyUnclosableTabs }"
          @click="tabsCount > 1 && !onlyUnclosableTabs && handleCommand('closeOthers')"
        >
          <el-icon class="menu-icon"><CircleClose /></el-icon>
          <span>关闭其他</span>
        </div>
        <div
          class="context-menu-item"
          :class="{ 'disabled': tabsCount <= 1 || allTabsUnclosable }"
          @click="tabsCount > 1 && !allTabsUnclosable && handleCommand('closeAll')"
        >
          <el-icon class="menu-icon"><CloseBold /></el-icon>
          <span>关闭所有</span>
        </div>
      </div>

      <div class="menu-divider"></div>

      <div class="menu-group">
        <div
          class="context-menu-item"
          :class="{ 'disabled': !hasRightTabs }"
          @click="hasRightTabs && handleCommand('closeRight')"
        >
          <el-icon class="menu-icon"><ArrowRight /></el-icon>
          <span>关闭右侧所有</span>
        </div>
        <div
          class="context-menu-item"
          :class="{ 'disabled': !hasLeftTabs }"
          @click="hasLeftTabs && handleCommand('closeLeft')"
        >
          <el-icon class="menu-icon"><ArrowLeft /></el-icon>
          <span>关闭左侧所有</span>
        </div>
      </div>
    </div>
  </transition>
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
  },
  // 是否是当前激活的标签页
  isActiveTab: {
    type: Boolean,
    default: true
  },
  // 当前标签页是否可关闭
  isClosable: {
    type: Boolean,
    default: true
  },
  // 标签页总数
  tabsCount: {
    type: Number,
    default: 1
  },
  // 是否有右侧标签页
  hasRightTabs: {
    type: Boolean,
    default: false
  },
  // 是否有左侧标签页
  hasLeftTabs: {
    type: Boolean,
    default: false
  },
  // 是否所有标签页都不可关闭
  allTabsUnclosable: {
    type: Boolean,
    default: false
  },
  // 是否只有不可关闭的标签页
  onlyUnclosableTabs: {
    type: Boolean,
    default: false
  }
})

// 定义组件事件
const emit = defineEmits(['update:visible', 'command'])

// 处理菜单命令
const handleCommand = (command: string) => {
  // 根据命令类型和当前状态判断是否执行
  switch (command) {
    case 'refresh':
      if (!props.isActiveTab) return
      break
    case 'close':
      if (!props.isClosable) return
      break
    case 'closeOthers':
      if (props.tabsCount <= 1 || props.onlyUnclosableTabs) return
      break
    case 'closeAll':
      if (props.tabsCount <= 1 || props.allTabsUnclosable) return
      break
    case 'closeRight':
      if (!props.hasRightTabs) return
      break
    case 'closeLeft':
      if (!props.hasLeftTabs) return
      break
  }

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
const handleGlobalClick = () => {
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
/* 菜单过渡动画 */
.menu-fade-enter-active,
.menu-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.menu-fade-enter-from,
.menu-fade-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

/* 自定义右键菜单样式 */
.custom-context-menu {
  position: fixed;
  background-color: var(--el-bg-color);
  border-radius: 8px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12);
  z-index: 9999;
  padding: 6px 0;
  min-width: 180px;
  font-size: 14px;
  overflow: hidden;
  border: 1px solid var(--el-border-color-light);
  backdrop-filter: blur(8px);

  /* 暗色主题适配 */
  .dark & {
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2), 0 3px 6px -4px rgba(0, 0, 0, 0.3);
    border-color: var(--el-border-color);
  }

  /* 添加微妙的光晕效果 */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.5), transparent);

    .dark & {
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    }
  }
}

.menu-group {
  padding: 4px 0;

  /* 为每个菜单项添加延迟动画 */
  .context-menu-item {
    animation: slideIn 0.2s cubic-bezier(0.23, 1, 0.32, 1);
    animation-fill-mode: both;

    // Less语法的循环
    .item-delay(7);
    .item-delay(@n, @i: 1) when (@i =< @n) {
      &:nth-child(@{i}) {
        animation-delay: (@i * 0.03s);
      }
      .item-delay(@n, (@i + 1));
    }
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.menu-divider {
  margin: 4px 0;
  height: 1px;
  background-color: var(--el-border-color-lighter);
  position: relative;
  overflow: hidden;

  /* 添加光晕动画效果 */
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.7), transparent);
    animation: shimmer 2s infinite;

    .dark & {
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    }
  }
}

@keyframes shimmer {
  0% { left: -100%; }
  100% { left: 100%; }
}

.context-menu-item {
  display: flex;
  align-items: center;
  padding: 0 16px;
  height: 36px;
  color: var(--el-text-color-primary);
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  border-left: 3px solid transparent;
  position: relative;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

  .menu-icon {
    margin-right: 10px;
    font-size: 16px;
    color: var(--el-text-color-secondary);
    transition: all 0.2s ease;
  }

  span {
    flex: 1;
    font-weight: 500;
  }

  .shortcut {
    flex: none;
    font-size: 12px;
    color: var(--el-text-color-secondary);
    margin-left: 8px;
    opacity: 0.8;
    padding: 2px 4px;
    border-radius: 4px;
    background-color: var(--el-fill-color-light);

    .dark & {
      background-color: var(--el-fill-color);
    }
  }

  &:hover {
    background-color: var(--el-color-primary-light-9);
    color: var(--el-color-primary);
    border-left: 3px solid var(--el-color-primary);

    .dark & {
      background-color: var(--el-color-primary-light-8);
    }

    .menu-icon {
      color: var(--el-color-primary);
      transform: scale(1.1);
    }

    /* 添加悬停时的波纹效果 */
    &::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 5px;
      height: 5px;
      background: rgba(var(--el-color-primary-rgb), 0.2);
      border-radius: 50%;
      transform: translate(-50%, -50%);
      animation: ripple 0.6s ease-out;

      .dark & {
        background: rgba(var(--el-color-primary-rgb), 0.3);
      }
    }
  }

  &.disabled {
    opacity: 0.5;
    cursor: not-allowed;

    &:hover {
      background-color: transparent;
      color: var(--el-text-color-primary);
      border-left: 3px solid transparent;

      .menu-icon {
        color: var(--el-text-color-secondary);
        transform: none;
      }

      &::after {
        display: none;
      }
    }
  }
}

@keyframes ripple {
  to {
    width: 200px;
    height: 200px;
    opacity: 0;
  }
}
</style>

