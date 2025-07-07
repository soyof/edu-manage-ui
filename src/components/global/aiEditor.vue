<template>
  <div class="ai-editor-wrapper" :class="{ 'is-disabled': disabled }">
    <div ref="editorRef" class="ai-editor-container">
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { AiEditor } from 'aieditor'
import 'aieditor/dist/style.css'
import { useRoute } from 'vue-router'

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
    default: 500
  },
  placeholder: { // 占位符
    type: String,
    default: '请输入内容...'
  },
  customConfig: { // 自定义配置（可选）
    type: Object,
    default: () => ({})
  }
})

// 定义事件
const emit = defineEmits(['update:modelValue', 'change', 'ready'])

// 编辑器实例和引用
const editorRef = ref<HTMLElement | null>(null)
let editor: any = null

// 路由对象
const route = useRoute()

// 初始化编辑器
onMounted(() => {
  if (editorRef.value) {
    // 基本配置
    const defaultConfig = {
      element: editorRef.value,
      placeholder: props.placeholder,
      content: props.modelValue,
      draggable: false,
      editorMode: props.disabled ? 'readonly' : 'default',
      // 移除工具栏中可能的AI相关按钮
      toolbarKeys: ['undo', 'redo', 'brush', 'eraser',
        '|', 'heading', 'font-family', 'font-size',
        '|', 'bold', 'italic', 'underline', 'strike', 'link', 'code', 'subscript', 'superscript', 'hr', 'todo', 'emoji',
        '|', 'highlight', 'font-color',
        '|', 'align', 'line-height',
        '|', 'bullet-list', 'ordered-list', 'indent-decrease', 'indent-increase', 'break',
        '|', 'image', 'video', 'attachment', 'quote', 'code-block', 'table',
        '|', 'source-code', 'fullscreen'],
      lineHeight: {
        values: ['1.0', '1.1', '1.2', '1.3', '1.4', '1.5', '1.6', '1.8', '2.0', '2.5', '3.0', '3.5', '4.0', '4.5', '5.0']
      },
      textSelectionBubbleMenu: {
        enable: true,
        items: ['Bold', 'Italic', 'Underline', 'Strike']
      },
      htmlPasteConfig: {
        pasteAsText: false,
        pasteClean: false,
        clearLineBreaks: true,
        pasteProcessor: (html: any) => {
          return html
        }
      },
      onChange: (editorInstance: any) => {
        console.log('onChange', editorInstance)
        // getMarkdown  getJson  getText
        const html = editorInstance.getHtml()
        emit('update:modelValue', html)
        emit('change', html)
      },
      fontSize: {
        values: [
          { name: '12px', value: '12px' },
          { name: '13px', value: '13px' },
          { name: '14px', value: '14px' },
          { name: '15px', value: '15px' },
          { name: '16px', value: '16px' },
          { name: '18px', value: '18px' },
          { name: '20px', value: '20px' },
          { name: '24px', value: '24px' },
          { name: '28px', value: '28px' },
          { name: '32px', value: '32px' },
          { name: '36px', value: '36px' },
          { name: '42px', value: '42px' },
          { name: '48px', value: '48px' },
          { name: '56px', value: '56px' },
          { name: '64px', value: '64px' }
        ]
      },
      fontFamily: {
        values: [
          // 中文字体
          { name: '宋体', value: 'SimSun' },
          { name: '仿宋', value: 'FangSong' },
          { name: '黑体', value: 'SimHei' },
          { name: '楷体', value: 'KaiTi' },
          { name: '微软雅黑', value: 'Microsoft YaHei' },
          { name: '方正仿宋简体', value: 'FangSong_GB2312' },
          { name: '华文细黑', value: 'STXihei' },
          { name: '华文楷体', value: 'STKaiti' },
          { name: '华文宋体', value: 'STSong' },
          { name: '华文仿宋', value: 'STFangsong' },
          { name: '华文琥珀', value: 'STHupo' },
          { name: '华文新魏', value: 'STXinwei' },
          { name: '幼圆', value: 'YouYuan' },
          { name: '隶书', value: 'LiSu' },
          { name: 'Arial', value: 'Arial' },
          { name: 'Arial Black', value: 'Arial Black' },
          { name: 'Times New Roman', value: 'Times New Roman' },
          { name: 'Courier New', value: 'Courier New' },
          { name: 'Tahoma', value: 'Tahoma' },
          { name: 'Verdana', value: 'Verdana' },
          { name: 'Georgia', value: 'Georgia' },
          { name: 'Garamond', value: 'Garamond' },
          { name: 'Comic Sans MS', value: 'Comic Sans MS' },
          { name: 'Trebuchet MS', value: 'Trebuchet MS' },
          { name: 'Impact', value: 'Impact' },
          { name: 'Helvetica', value: 'Helvetica, Arial, sans-serif' }
        ]
      }
    }

    // 合并自定义配置
    const finalConfig = {
      ...defaultConfig,
      ...props.customConfig
    }

    // 初始化编辑器
    editor = new AiEditor(finalConfig)

    // 编辑器已初始化，直接触发ready事件
    emit('ready', editor)
  }
})

// 监听内容变化
watch(() => props.modelValue, (newVal) => {
  if (editor && editor.getContent && editor.getContent() !== newVal) {
    editor.setContent(newVal)
  }
}, { deep: true })

// 监听禁用状态变化
watch(() => props.disabled, (newVal) => {
  if (editor && editor.setEditorMode) {
    editor.setEditorMode(newVal ? 'readonly' : 'default')
  }
}, { deep: true })

// 组件销毁前清理
onBeforeUnmount(() => {
  if (editor && editor.destroy) {
    editor.destroy()
    editor = null
  }
})

// 向父组件暴露方法
defineExpose({
  // 获取编辑器实例
  getEditor: () => editor,

  // 设置内容
  setContent: (html: string) => {
    if (editor && editor.setContent) {
      editor.setContent(html)
      emit('update:modelValue', html)
    }
  },

  // 获取内容
  getContent: () => {
    return editor && editor.getContent ? editor.getContent() : ''
  },

  // 清空内容
  clearContent: () => {
    if (editor && editor.setContent) {
      editor.setContent('')
      emit('update:modelValue', '')
    }
  },

  // 插入内容
  insertContent: (html: string) => {
    if (editor && editor.insertContent) {
      editor.insertContent(html)
    }
  },

  // 获取纯文本内容
  getTextContent: () => {
    return editor && editor.getText ? editor.getText() : ''
  }
})
</script>

<style lang="less" scoped>
.ai-editor-wrapper {
  position: relative;
  width: 100%;
  box-sizing: border-box;

  .ai-editor-container {
    width: 100%;
    height: 350px;
    border-radius: 4px;
    --aie-border-color: #a8abb2;
    :deep(aie-header) {
      .aie-menu-item {
        padding: 0;
      }
      aie-line-height {
        svg {
          vertical-align: top;
        }
      }
    }
    :deep(.aie-content) {
      p {
        padding: 0;
        margin: 0;
        line-height: 1.5;
      }

      // 处理连续段落
      p + p {
        margin-top: 0;
      }

      // 控制所有块级元素的间距
      div, h1, h2, h3, h4, h5, h6, ul, ol, pre {
        margin-top: 0.5em;
        margin-bottom: 0.5em;
      }
    }
    :deep(.aie-dropdown-container) {
      max-height: 300px;
      overflow-y: auto;
      &::-webkit-scrollbar {
        width: 6px;
        height: 6px;
        background-color: #ccc;
        border-radius: 3px;
      }
      &::-webkit-scrollbar-thumb {
        background-color: #999;
      }
      &::-webkit-scrollbar-track {
        background-color: #f1f1f1;
        border-radius: 3px;
      }
    }
  }

  &.is-disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
}

// 自定义底部状态栏
:deep(aie-footer), :deep(aie-ai) {
  // display: none !important;
}

</style>
