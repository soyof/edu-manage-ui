<template>
  <div class="avatar-uploader-component">
    <!-- 头像显示和上传触发区域 -->
    <div class="avatar-container">
      <el-avatar
        :size="size"
        :src="currentAvatar"
        class="profile-avatar"
        @click="handleAvatarClick"
      >
        {{ avatarFallback }}
      </el-avatar>
      <div
        v-if="editable"
        class="avatar-edit-mask"
        @click="handleAvatarClick"
      >
        <el-icon><EditPen /></el-icon>
        <span>点击修改头像</span>
      </div>
    </div>

    <!-- 头像上传对话框 -->
    <el-dialog
      v-model="showUploadDialog"
      title="上传头像"
      width="520px"
      :closeOnClickModal="false"
      :closeOnPressEscape="false"
      :destroyOnClose="true"
    >
      <div class="avatar-upload-container">
        <div v-if="!imageUrl" class="upload-box">
          <el-upload
            class="avatar-uploader"
            action="#"
            :autoUpload="false"
            :showFileList="false"
            :onChange="handleAvatarChange"
            accept="image/jpeg,image/png,image/gif"
          >
            <el-icon class="avatar-uploader-icon"><Plus /></el-icon>
            <div class="upload-text">点击上传头像</div>
          </el-upload>
        </div>

        <div v-else class="cropper-container">
          <VueCropper
            ref="cropperRef"
            :img="imageUrl"
            :outputSize="1"
            :outputType="'png'"
            :info="true"
            :full="false"
            :canMove="false"
            :canMoveBox="true"
            :fixedBox="true"
            :autoCrop="true"
            :autoCropWidth="cropWidth"
            :autoCropHeight="cropHeight"
            :centerBox="true"
            @realTime="realTime"
          />
        </div>

        <div v-if="imageUrl" class="preview-container">
          <div class="preview-title">预览</div>
          <div class="preview">
            <img :src="previewUrl" alt="预览" class="preview-img">
          </div>
        </div>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="cancelCrop">取 消</el-button>
          <el-button v-if="imageUrl" @click="uploadAgain">重新上传</el-button>
          <el-button
            type="primary"
            :loading="uploading"
            @click="confirmCrop"
          >
            确 认
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, defineProps, defineEmits } from 'vue'
import { ElMessage } from 'element-plus'
import { EditPen, Plus } from '@element-plus/icons-vue'
import { VueCropper } from 'vue-cropper'
import 'vue-cropper/dist/index.css'

// 定义属性
const props = defineProps({
  // 用户头像
  avatar: {
    type: String,
    default: ''
  },
  // 用户ID
  userId: {
    type: String,
    required: true
  },
  // 用户名
  username: {
    type: String,
    default: ''
  },
  // 头像大小
  size: {
    type: Number,
    default: 100
  },
  // 裁剪宽度
  cropWidth: {
    type: Number,
    default: 200
  },
  // 裁剪高度
  cropHeight: {
    type: Number,
    default: 200
  },
  // 是否可编辑
  editable: {
    type: Boolean,
    default: false
  },
  // 头像背景色
  bgColor: {
    type: String,
    default: '#909399'
  }
})

// 定义事件
const emit = defineEmits(['update:avatar', 'uploadSuccess'])

// 头像上传相关
const showUploadDialog = ref(false)
const imageUrl = ref('')
const previewUrl = ref('')
const cropperRef = ref<any>(null)
const uploading = ref(false)
const currentAvatar = computed(() => props.avatar || '')

// 用户头像相关
const avatarFallback = computed(() => {
  return props.username?.charAt(0).toUpperCase() || ''
})

// 处理头像点击
const handleAvatarClick = () => {
  if (!props.editable) return
  showUploadDialog.value = true
}

// 处理头像选择
const handleAvatarChange = (file: any) => {
  if (!file) return

  // 检查文件类型和大小
  const isImage = file.raw.type.indexOf('image/') !== -1
  const isLt2M = file.raw.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB!')
    return
  }

  // 读取文件
  const reader = new FileReader()
  reader.onload = (e) => {
    imageUrl.value = e.target?.result as string
  }
  reader.readAsDataURL(file.raw)
}

// 裁剪实时预览
const realTime = (data: any) => {
  previewUrl.value = data.url
}

// 取消裁剪
const cancelCrop = () => {
  showUploadDialog.value = false
  imageUrl.value = ''
  previewUrl.value = ''
}

// 重新上传
const uploadAgain = () => {
  imageUrl.value = ''
  previewUrl.value = ''
}

// 确认裁剪并上传
const confirmCrop = async() => {
  if (!cropperRef.value) return

  uploading.value = true

  try {
    // 获取裁剪后的图片数据
    const canvas = cropperRef.value.getCanvas()
    const base64 = canvas.toDataURL('image/png')

    // 将 base64 转换为文件对象
    const blob = dataURLtoBlob(base64)
    const file = new File([blob], 'avatar.png', { type: 'image/png' })

    // 创建表单数据
    const formData = new FormData()
    formData.append('userId', props.userId)
    formData.append('avatar', file)

    // 调用上传API
    const res = await fetch('/api/uploadAvatar', {
      method: 'POST',
      body: formData
    })

    if (res.ok) {
      const data = await res.json()
      ElMessage.success('头像上传成功')

      // 向父组件通知上传成功，传递新头像URL
      const avatarUrl = data.avatarUrl || base64
      emit('update:avatar', avatarUrl)
      emit('uploadSuccess', avatarUrl)

      // 关闭对话框
      showUploadDialog.value = false
      imageUrl.value = ''
      previewUrl.value = ''
    } else {
      ElMessage.error('头像上传失败')
    }
  } catch (error) {
    console.error('上传头像失败', error)
    ElMessage.error('头像上传失败，请稍后重试')
  } finally {
    uploading.value = false
  }
}

// base64 转 blob
const dataURLtoBlob = (dataurl: string) => {
  const arr = dataurl.split(',')
  const mime = arr[0].match(/:(.*?);/)?.[1]
  const bstr = atob(arr[1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  return new Blob([u8arr], { type: mime })
}
</script>

<style lang="less" scoped>
.avatar-uploader-component {
  display: inline-block;

  .avatar-container {
    position: relative;
    cursor: pointer;

    .profile-avatar {
      background-color: v-bind('props.bgColor');
      color: #fff;
      font-size: 40px;
      font-weight: bold;
    }

    .avatar-edit-mask {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background-color: rgba(0, 0, 0, 0.5);
      color: #fff;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      opacity: 0;
      transition: opacity 0.3s;

      &:hover {
        opacity: 1;
      }

      .el-icon {
        font-size: 24px;
        margin-bottom: 5px;
      }

      span {
        font-size: 12px;
      }
    }
  }
}

.avatar-upload-container {
  display: flex;
  flex-direction: column;
  align-items: center;

  .upload-box {
    width: 100%;

    .avatar-uploader {
      width: 100%;
      height: 200px;
      border: 1px dashed var(--el-border-color);
      border-radius: 6px;
      cursor: pointer;
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;

      &:hover {
        border-color: var(--el-color-primary);
      }

      .avatar-uploader-icon {
        font-size: 28px;
        color: #8c939d;
      }

      .upload-text {
        color: #8c939d;
        margin-top: 10px;
      }
    }
  }

  .cropper-container {
    width: 100%;
    height: 300px;
    display: flex;
    justify-content: center;
    align-items: center;
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
      border-radius: 50%;
      border: 1px solid #eee;
      display: inline-flex;
      justify-content: center;
      align-items: center;

      .preview-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
  }
}
</style>
