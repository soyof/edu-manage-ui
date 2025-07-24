<template>
  <div class="image-upload-container">
    <el-upload
      ref="uploadRef"
      v-model:fileList="fileList"
      :autoUpload="false"
      :multiple="multiple"
      :limit="limit"
      :accept="accept"
      :beforeUpload="beforeUpload"
      :onRemove="handleRemove"
      :onExceed="handleExceed"
      :listType="listType"
      :disabled="disabled"
      :class="{ 'hide-upload': hideUpload }"
      :onChange="handleFileChange"
    >
      <template v-if="listType === 'picture-card'">
        <el-icon class="avatar-uploader-icon"><Plus /></el-icon>
      </template>
      <template v-else>
        <el-button type="primary" :disabled="disabled">
          <el-icon><Upload /></el-icon>
          选择图片
        </el-button>
      </template>
      <template #tip>
        <div v-if="showTip" class="el-upload__tip">
          <slot name="tip">
            支持 {{ accept || 'jpg/png' }} 格式，单个文件不超过 {{ fileSize }}MB
            <span v-if="limit > 1">，最多上传 {{ limit }} 张图片</span>
          </slot>
        </div>
      </template>
    </el-upload>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Upload } from '@element-plus/icons-vue'
import type { UploadProps, UploadUserFile, UploadFile } from 'element-plus'

import service from '@/utils/services'

interface Props {
  modelValue: string[]
  multiple?: boolean
  limit?: number
  accept?: string
  fileSize?: number
  listType?: 'text' | 'picture' | 'picture-card'
  disabled?: boolean
  showTip?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: string[]): void
}

const props = withDefaults(defineProps<Props>(), {
  multiple: false,
  limit: 1,
  accept: 'image/*',
  fileSize: 5,
  listType: 'picture-card',
  disabled: false,
  showTip: true
})

const emit = defineEmits<Emits>()

const uploadRef = ref()
const fileList = ref<UploadUserFile[]>([])

// 计算是否隐藏上传按钮
const hideUpload = computed(() => {
  return props.limit <= fileList.value.length
})

// 监听外部传入的值变化
watch(() => props.modelValue, (newVal) => {
  if (newVal && newVal.length > 0) {
    fileList.value = newVal.map((url, index) => ({
      name: url,
      url: getImageUrl(url),
      uid: Date.now() + index,
      status: 'success'
    }))
  } else {
    fileList.value = []
  }
}, { immediate: true })

// 获取图片完整URL
const getImageUrl = (filename: string) => {
  if (!filename) return ''
  if (filename.startsWith('http')) {
    return filename
  }
  return `/api/previewImage?filename=${filename}`
}

// 上传前检查
const beforeUpload: UploadProps['beforeUpload'] = (file) => {
  // 检查文件类型
  const isImage = file.type.startsWith('image/')
  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }

  // 检查文件大小
  const isLtSize = file.size / 1024 / 1024 < props.fileSize
  if (!isLtSize) {
    ElMessage.error(`图片大小不能超过 ${props.fileSize}MB!`)
    return false
  }

  return false // 阻止自动上传
}

// 文件选择变化时的处理
const handleFileChange = (file: UploadFile) => {
  if (file.raw) {
    uploadFile(file.raw, file)
  }
}

// 自定义上传方法
const uploadFile = async(file: File, uploadFile: UploadFile) => {
  try {
    const formData = new FormData()
    formData.append('image', file)

    const res: any = await service.upload('/api/uploadImage', formData)

    if (res && res.url) {
      // 更新文件列表中的URL和状态
      const index = fileList.value.findIndex(item => item.uid === uploadFile.uid)

      if (index !== -1) {
        fileList.value[index].url = getImageUrl(res.url)
        fileList.value[index].name = res.url
        fileList.value[index].status = 'success'
      }

      // 发送更新事件
      updateModelValue()
      ElMessage.success('上传成功')
    } else {
      throw new Error('上传响应数据异常')
    }
  } catch (error) {
    ElMessage.error('上传失败: ' + (error as Error).message)
    // 移除失败的文件
    const index = fileList.value.findIndex(item => item.uid === uploadFile.uid)
    if (index !== -1) {
      fileList.value.splice(index, 1)
    }
  }
}

// 更新modelValue
const updateModelValue = () => {
  const filenames = fileList.value
    .filter(item => item.status === 'success')
    .map(item => {
      if (item.url) {
        // 从URL中提取文件名参数
        const url = new URL(item.url, window.location.origin)
        return url.searchParams.get('filename') || item.name
      }
      return item.name || ''
    })
    .filter(Boolean) as string[]

  emit('update:modelValue', filenames)
}

// 移除文件
const handleRemove = (file: UploadFile) => {
  const urls = fileList.value
    .filter(item => item.uid !== file.uid && item.status === 'success')
    .map(item => {
      if (item.url) {
        // 从URL中提取文件名参数
        const url = new URL(item.url, window.location.origin)
        return url.searchParams.get('filename') || item.name
      }
      return item.name || ''
    })
    .filter(Boolean) as string[]

  emit('update:modelValue', urls)
}

// 超出限制
const handleExceed = () => {
  ElMessage.warning(`最多只能上传 ${props.limit} 张图片`)
}
</script>

<style scoped lang="less">
.image-upload-container {
  :deep(.el-upload--picture-card) {
    width: 120px;
    height: 120px;
    border-radius: 6px;
  }

  :deep(.el-upload-list--picture-card .el-upload-list__item) {
    width: 120px;
    height: 120px;
    border-radius: 6px;
  }

  :deep(.avatar-uploader-icon) {
    font-size: 28px;
    color: #8c939d;
    width: 120px;
    height: 120px;
    text-align: center;
    line-height: 120px;
  }

  :deep(.hide-upload .el-upload--picture-card) {
    display: none;
  }

  :deep(.el-upload__tip) {
    margin-top: 8px;
    color: #606266;
    font-size: 12px;
    line-height: 1.4;
  }
}
</style>
