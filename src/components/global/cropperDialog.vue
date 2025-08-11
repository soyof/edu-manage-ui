<template>
  <el-dialog
    v-model="dialogVisible"
    :title="title"
    width="600px"
    destroyOnClose
    draggable
    :closeOnClickModal="false"
    :closeOnPressEscape="false"
    @close="handleDialogClose"
  >
    <div class="cropper-container">
      <VueCropper
        ref="cropperRef"
        :img="imageUrl"
        :outputSize="outputSize"
        :outputType="outputType"
        :info="true"
        :full="showFull"
        :canScale="canScale"
        :canMove="true"
        :canMoveBox="true"
        :original="false"
        :autoCrop="true"
        :fixed="fixed"
        :fixedNumber="fixedNumber"
        :autoCropWidth="autoCropWidth"
        :autoCropHeight="autoCropHeight"
        :centerBox="true"
        :high="true"
        @realTime="realTime"
      />
    </div>

    <div v-if="showPreview" class="preview-container">
      <div class="preview-title">预览</div>
      <div class="preview" :class="{ 'preview-circle': previewCircle }">
        <img :src="previewUrl" alt="预览" class="preview-img">
      </div>
    </div>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleCancel">取 消</el-button>
        <el-button v-if="showReupload" @click="$emit('reupload')">重新上传</el-button>
        <el-button
          type="primary"
          :loading="loading"
          @click="handleConfirm"
        >
          确 认
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { VueCropper } from 'vue-cropper'
import 'vue-cropper/dist/index.css'

const props = defineProps({
  // 对话框可见性
  visible: {
    type: Boolean,
    default: false
  },
  // 对话框标题
  title: {
    type: String,
    default: '裁剪图片'
  },
  // 图片URL
  imageUrl: {
    type: String,
    default: ''
  },
  // 输出图片大小比例
  outputSize: {
    type: Number,
    default: 0.5
  },
  // 输出图片格式
  outputType: {
    type: String,
    default: 'jpeg'
  },
  // 是否显示原图按钮
  showFull: {
    type: Boolean,
    default: false
  },
  // 是否可以缩放图片
  canScale: {
    type: Boolean,
    default: false
  },
  // 是否固定裁剪框宽高比
  fixed: {
    type: Boolean,
    default: true
  },
  // 裁剪框宽高比
  fixedNumber: {
    type: Array,
    default: () => [1, 1]
  },
  // 裁剪框初始宽度
  autoCropWidth: {
    type: Number,
    default: 0
  },
  // 裁剪框初始高度
  autoCropHeight: {
    type: Number,
    default: 0
  },
  // 是否显示预览
  showPreview: {
    type: Boolean,
    default: false
  },
  // 预览是否为圆形
  previewCircle: {
    type: Boolean,
    default: false
  },
  // 是否显示重新上传按钮
  showReupload: {
    type: Boolean,
    default: false
  },
  // 加载状态
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'update:visible',
  'cancel',
  'confirm',
  'reupload',
  'preview',
  'close'
])

const cropperRef = ref<any>(null)
const dialogVisible = ref(props.visible)
const previewUrl = ref('')

// 监听visible属性变化
watch(() => props.visible, (newVal) => {
  dialogVisible.value = newVal
})

// 监听dialogVisible变化
watch(() => dialogVisible.value, (newVal) => {
  emit('update:visible', newVal)
})

// 实时预览
const realTime = (data: any) => {
  previewUrl.value = data.url
  emit('preview', data)
}

// 取消裁剪
const handleCancel = () => {
  emit('cancel')
  dialogVisible.value = false
}

// 确认裁剪
const handleConfirm = () => {
  if (!cropperRef.value) return

  // 获取裁剪后的图片blob数据
  cropperRef.value.getCropBlob((blob: Blob) => {
    emit('confirm', {
      blob,
      file: new File([blob], `cropped.${props.outputType}`, { type: `image/${props.outputType}` }),
      url: previewUrl.value
    })
  })
}

// 对话框关闭
const handleDialogClose = () => {
  emit('close')
}

// 暴露方法给父组件
defineExpose({
  cropperRef
})
</script>

<style lang="less" scoped>
.cropper-container {
  height: 400px;
  width: 100%;
}

.preview-container {
  margin-top: 20px;
  text-align: center;

  .preview-title {
    font-size: 14px;
    margin-bottom: 10px;
  }

  .preview {
    width: 100px;
    height: 100px;
    overflow: hidden;
    border: 1px solid #eee;
    display: inline-flex;
    justify-content: center;
    align-items: center;

    &.preview-circle {
      border-radius: 50%;
    }

    .preview-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
}

.dialog-footer {
  .el-button {
    margin-right: 8px;
    &:last-child {
      margin-right: 0;
    }
  }
}
</style>
