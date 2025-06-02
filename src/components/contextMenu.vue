<template>
  <el-popover
    :visible="visible"
    :popperStyle="position"
    popperClass="context-menu-popover"
    placement="bottom"
    trigger="contextmenu"
  >
    <template #default>
      <div class="context-menu">
        <div class="context-menu-item">关闭当前</div>
        <div class="context-menu-item">关闭其他</div>
        <div class="context-menu-item">关闭所有</div>
        <div class="context-menu-item">关闭右侧所有</div>
        <div class="context-menu-item">关闭左侧所有</div>
      </div>
    </template>
  </el-popover>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  position: {
    type: Object,
    required: true
  },
  currentItem: {
    type: Object,
    required: false,
    default: () => {} // 定义默认值为一个空函数，这样即使没有传递 currentItem，也不会报错，而是使用默认的空对象作为 dat
  }
})

console.log(props.position)

const emits = defineEmits(['closeCurrent', 'closeOther', 'closeAll', 'closeRight', 'closeLeft'])
</script>


