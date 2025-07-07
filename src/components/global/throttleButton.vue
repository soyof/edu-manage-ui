<template>
  <el-button
    v-if="isBtn"
    v-bind="$attrs"
    :disabled="internalDisabled || $attrs.disabled"
    @click="throttledClick"
  >
    <slot></slot>
  </el-button>
  <el-tag
    v-else
    v-bind="$attrs"
    :disabled="internalDisabled || $attrs.disabled"
    @click="throttledClick"
  >
    <slot></slot>
  </el-tag>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits, withDefaults, onBeforeUnmount } from 'vue'

export interface ThrottleButtonProps {
  /**
   * 节流时间，单位毫秒
   * @default 1000
   */
  throttleTime?: number
  /**
   * 是否为按钮样式，false则为标签样式
   * @default true
   */
  isBtn?: boolean
  /**
   * 是否在点击后自动禁用按钮直到节流结束
   * @default false
   */
  autoDisable?: boolean
  /**
   * 是否启用节流功能
   * @default true
   */
  throttleEnabled?: boolean
}

// 导出组件名称，便于在其他地方使用
const name = 'ThrottleButton'
defineExpose({ name })

const props = withDefaults(defineProps<ThrottleButtonProps>(), {
  throttleTime: 1000,
  isBtn: true,
  autoDisable: false,
  throttleEnabled: true
})

const emit = defineEmits(['click', 'frequently'])

// 节流定时器
const timer = ref<ReturnType<typeof setTimeout> | null>(null)
// 内部禁用状态，用于autoDisable功能
const internalDisabled = ref(false)

/**
 * 节流处理函数
 * 在指定时间内只执行一次，防止频繁点击
 */
const throttledClick = (event: MouseEvent) => {
  // 如果禁用了节流功能，直接触发事件
  if (!props.throttleEnabled) {
    emit('click', event)
    return
  }

  if (!timer.value) {
    emit('click', event)

    // 如果启用了自动禁用，则在点击后禁用按钮
    if (props.autoDisable) {
      internalDisabled.value = true
    }

    timer.value = setTimeout(() => {
      timer.value = null
      // 节流结束后，如果启用了自动禁用，则恢复按钮状态
      if (props.autoDisable) {
        internalDisabled.value = false
      }
    }, props.throttleTime)
  } else {
    // 可选：当在节流时间内再次点击时触发此事件
    emit('frequently', event)
  }
}

// 组件销毁前清除定时器，防止内存泄漏
onBeforeUnmount(() => {
  if (timer.value) {
    clearTimeout(timer.value)
    timer.value = null
  }
})
</script>
