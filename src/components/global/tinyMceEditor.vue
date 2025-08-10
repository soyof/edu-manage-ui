<template>
  <div class="tinymce-wrapper" :class="{ 'is-disabled': disabled }">
    <Editor
      :id="editorId"
      ref="editorRef"
      v-model="content"
      :disabled="disabled"
      :init="editorConfig"
      :tinymceScriptSrc="TINYMCE_SCRIPT_SRC"
    />
    <el-skeleton v-if="!isCompletedEditor" :rows="7" animated />
  </div>
</template>

<script setup lang="ts">
import { computed, useTemplateRef, ref, onUnmounted, onDeactivated } from 'vue'
import Editor from '@tinymce/tinymce-vue'
import { TINYMCE_SCRIPT_SRC, getBaseConfig, generateEditorId } from '../../utils/editorConfig'

const editorRef = useTemplateRef<any>('editorRef')

// 定义属性
const props = defineProps({
  modelValue: { // v-model值
    type: String,
    default: ''
  },
  disabled: { // 是否禁用
    type: Boolean,
    default: false
  },
  height: { // 编辑器高度
    type: Number,
    default: 300
  },
  placeholder: { // 占位符
    type: String,
    default: '开始编写吧'
  },
  customConfig: { // 自定义配置（可选）
    type: Object,
    default: () => ({})
  },
  id: { // 编辑器id
    type: String,
    default: ''
  }
})

const isCompletedEditor = ref(false)
onUnmounted(() => {
  isCompletedEditor.value = false
})
onDeactivated(() => {
  isCompletedEditor.value = false
})

// 定义事件
const emit = defineEmits(['update:modelValue'])

// 创建计算属性处理双向绑定
const content = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

// 重置编辑器内容的方法
const resetContent = () => {
  content.value = ''
}

// 确保每个编辑器实例都有唯一ID
const editorId = computed(() => generateEditorId(props.id))

// 合并配置
const editorConfig = computed(() => {
  const baseConfig = getBaseConfig()

  // 修改setup函数以处理v-model
  const originalSetup = baseConfig.setup
  baseConfig.setup = (editor: any) => {
    // 调用原始setup函数
    if (originalSetup) {
      originalSetup(editor)
    }

    // 添加清空内容按钮的v-model更新
    editor.ui.registry.addButton('empty', {
      icon: 'clear-content',
      tooltip: '清空内容',
      onAction: () => {
        content.value = ''
        editor.setContent('')
      }
    })
  }

  return {
    ...baseConfig,
    height: props.height,
    placeholder: props.placeholder,
    ...props.customConfig,
    init_instance_callback: (_editor: any) => {
      isCompletedEditor.value = true
    }
  }
})

// 向父组件暴露方法
defineExpose({
  resetContent
})
</script>

<style lang="less" scoped>
.tinymce-wrapper {
  position: relative;
  width: 100%;
  height: v-bind(height);

  .el-skeleton {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    z-index: 1000;
    background-color: #fff;
  }

  .tinymce-wrapper-content {
    width: 100%;
    min-height: 100px;
    background-color: #f5f7fa;
    border-radius: 4px;
    padding: 10px;
    border: 1px solid #e4e7ed;
  }

  &.is-disabled {
    :deep(.tox-editor-header) {
      display: none !important;
    }

    :deep(.tox-statusbar) {
      display: none !important;
    }
  }
}
</style>
