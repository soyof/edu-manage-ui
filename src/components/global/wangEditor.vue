<template>
  <div class="wang-editor-container">
    <Toolbar
      v-show="!readOnly"
      style="border-bottom: 1px solid #ccc"
      :editor="editorRef"
      :defaultConfig="toolbarConfig"
      :mode="mode"
    />
    <Editor
      v-model="valueHtml"
      :style="{height: height}"
      :defaultConfig="editorConfig"
      :mode="mode"
      @onCreated="handleCreated"
      @onChange="handleChange"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, shallowRef, onBeforeUnmount, watch, nextTick } from 'vue'
// 使用导入断言来避免类型问题
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
// 使用type导入类型
import type { IDomEditor, IEditorConfig, IToolbarConfig } from '@wangeditor/editor'

// 导入样式
import '@wangeditor/editor/dist/css/style.css'

// 定义工具栏按钮类型
type ToolbarKey = string

// 定义属性
const props = defineProps({
  // v-model绑定值
  modelValue: {
    type: String,
    default: ''
  },
  // 菜单配置
  toolbarKeys: {
    type: Array as () => ToolbarKey[],
    default: () => []
  },
  // 编辑器高度
  height: {
    type: String,
    default: '500px'
  },
  // 编辑器模式
  mode: {
    type: String,
    default: 'default' // 或 'simple'
  },
  // 占位符
  placeholder: {
    type: String,
    default: '请输入内容...'
  },
  // 是否只读
  readOnly: {
    type: Boolean,
    default: false
  }
})

// 定义事件
const emit = defineEmits(['update:modelValue', 'change', 'created'])

// 编辑器实例，必须用 shallowRef
const editorRef = shallowRef<IDomEditor | null>(null)

// 内部富文本内容值
const valueHtml = ref('')

// 同步外部传入的值
watch(() => props.modelValue, (val) => {
  if (val !== valueHtml.value) {
    valueHtml.value = val
  }
}, { immediate: true })
// bold,underline,italic,through,code,sub,sup,clearStyle,color,bgColor,fontSize,fontFamily,indent,delIndent,justifyLeft,justifyRight,justifyCenter,justifyJustify,lineHeight,insertImage,deleteImage,editImage,viewImageLink,imageWidth30,imageWidth50,imageWidth100,divider,emotion,insertLink,editLink,unLink,viewLink,codeBlock,blockquote,headerSelect,header1,header2,header3,header4,header5,todo,redo,undo,fullScreen,enter,bulletedList,numberedList,insertTable,deleteTable,insertTableRow,deleteTableRow,insertTableCol,deleteTableCol,tableHeader,tableFullWidth,insertVideo,uploadVideo,editVideoSize,uploadImage,codeSelectLang
// 工具栏配置
const toolbarConfig = ref<Partial<IToolbarConfig>>({
  // 确保排除所有视频相关按钮
  excludeKeys: [
    'insertVideo',
    'uploadVideo',
    'deleteVideo',
    'editVideo',
    'editVideoSize',
    'video'
  ]
})

// 编辑器配置
const editorConfig = ref<Partial<IEditorConfig>>({
  placeholder: props.placeholder,
  readOnly: props.readOnly,
  autoFocus: false,
  MENU_CONF: {
    // 彻底禁用视频功能
    uploadVideo: {
      server: '',
      fieldName: 'custom-video',
      maxFileSize: 1, // 设置为极小值，实际上禁用功能
      allowedFileTypes: [],
      customUploadVideo: () => Promise.resolve('')
    }
  }
})

// 设置自定义工具栏
watch(() => props.toolbarKeys, (val) => {
  if (val && val.length > 0) {
    // 使用传入的工具栏配置
    toolbarConfig.value = {
      toolbarKeys: val as string[]
    }
  } else {
    // 使用默认工具栏配置，但确保不包含视频相关按钮
    toolbarConfig.value = {
      toolbarKeys: ['redo', 'undo', 'headerSelect', 'fontSize', 'fontFamily', 'bold', 'underline', 'italic', 'through', 'code', 'sub', 'sup', 'clearStyle', 'color', 'bgColor', 'indent', 'delIndent', 'justifyLeft', 'justifyRight', 'justifyCenter', 'justifyJustify', 'lineHeight', 'insertImage', 'divider', 'emotion', 'insertLink', 'codeBlock', 'blockquote', 'todo', 'fullScreen', 'bulletedList', 'numberedList', 'insertTable', 'tableFullWidth', 'uploadImage']
    }
  }
}, { immediate: true })

// 设置是否只读
watch(() => props.readOnly, (val) => {
  if (editorRef.value) {
    // 正确使用enable方法
    if (val) {
      editorRef.value.disable()
    } else {
      editorRef.value.enable()
    }
  }
})

// 组件销毁时，也及时销毁编辑器
onBeforeUnmount(() => {
  const editor = editorRef.value
  if (editor == null) return
  editor.destroy()
})

// 编辑器回调函数
const handleCreated = (editor: IDomEditor) => {
  editorRef.value = editor
  emit('created', editor)

  // 初始值
  nextTick(() => {
    if (props.modelValue && editor) {
      editor.setHtml(props.modelValue)
    }
  })
}

// 编辑器内容变化
const handleChange = (editor: IDomEditor) => {
  valueHtml.value = editor.getHtml()
  emit('update:modelValue', valueHtml.value)
  emit('change', { html: valueHtml.value, text: editor.getText() })
}

// 暴露编辑器实例方法
defineExpose({
  // 获取富文本组件实例
  getEditorRef: () => editorRef.value,
  // 获取富文本内容
  getHtml: () => editorRef.value?.getHtml() || '',
  // 获取文本内容
  getText: () => editorRef.value?.getText() || '',
  // 设置内容
  setHtml: (html: string) => {
    if (editorRef.value) {
      editorRef.value.setHtml(html)
    }
  }
})
</script>

<style lang="less" scoped>
.wang-editor-container {
  border: 1px solid #ccc;
  z-index: 1;
  width: 100%;

  :deep(.w-e-text-container) {
    background-color: var(--el-bg-color);
  }
}
</style>
