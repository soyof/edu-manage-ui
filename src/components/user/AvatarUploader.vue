<template>
  <div class="avatar-uploader-component">
    <!-- 头像显示和上传触发区域 -->
    <div class="avatar-container">
      <el-avatar
        :size="size"
        :src="currentAvatar"
        fit="cover"
        class="profile-avatar"
        @click="handleAvatarClick"
      >
        {{ avatarFallback }}
      </el-avatar>
      <div
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
      @close="handleDialogClose"
    >
      <div class="avatar-upload-container">
        <div v-if="!imageUrl" class="upload-box">
          <el-upload
            class="avatar-uploader"
            action="#"
            :autoUpload="false"
            :showFileList="false"
            :onChange="handleAvatarChange"
            accept="image/*"
          >
            <el-icon class="avatar-uploader-icon"><Plus /></el-icon>
            <div class="upload-text">点击上传头像</div>
          </el-upload>
        </div>

        <div v-else class="cropper-container">
          <VueCropper
            ref="cropperRef"
            :img="imageUrl"
            :outputSize="0.8"
            :outputType="outputType"
            :info="true"
            :full="true"
            :canScale="true"
            :canMove="true"
            :fixed="false"
            :canMoveBox="true"
            :fixedBox="false"
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
import service from '@/utils/services'
import 'vue-cropper/dist/index.css'
import { useUserInfoStore } from '@/stores/userInfo'

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
    default: 400
  },
  // 裁剪高度
  cropHeight: {
    type: Number,
    default: 400
  },
  // 头像背景色
  bgColor: {
    type: String,
    default: '#909399'
  }
})

// 定义事件
const emit = defineEmits(['update:avatar', 'uploadSuccess'])

const userInfoStore = useUserInfoStore()

// 头像上传相关
const outputType = ref('jpeg')
const showUploadDialog = ref(false)
const imageUrl = ref('')
const previewUrl = ref('')
const cropperRef = ref<any>(null)
const uploading = ref(false)
const currentAvatar = computed(() => props.avatar ? `/api/previewAvatar?filename=${props.avatar}&userId=${props.userId}` : '')

// 用户头像相关
const avatarFallback = computed(() => {
  return props.username?.charAt(0).toUpperCase() || ''
})

// 处理头像点击
const handleAvatarClick = () => {
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

// 清除上传图片和初始化数据
const resetUploadData = () => {
  imageUrl.value = ''
  previewUrl.value = ''
}

// 处理对话框关闭
const handleDialogClose = () => {
  resetUploadData()
}

// 取消裁剪
const cancelCrop = () => {
  showUploadDialog.value = false
  resetUploadData()
}

// 重新上传
const uploadAgain = () => {
  resetUploadData()
}

// 确认裁剪并上传
const confirmCrop = async() => {
  if (!cropperRef.value) return
  uploading.value = true
  try {
    // 获取裁剪后的图片数据
    const base64 = await new Promise<string>((resolve) => {
      cropperRef.value.getCropData((data: string) => {
        resolve(data)
      })
    })
    // 将 base64 转换为文件对象
    const blob = dataURLtoBlob(base64)
    const file = new File([blob], `avatar.${outputType.value}`, { type: `image/${outputType.value}` })
    // 创建表单数据
    const formData = new FormData()
    formData.append('userId', props.userId)
    formData.append('avatar', file)
    // 调用上传API
    const res: any = await service.upload('/api/uploadAvatar', formData)
    if (res) {
      ElMessage.success('头像上传成功')
      // 向父组件通知上传成功，传递新头像URL
      const avatarUrl = res.avatarUrl || base64
      userInfoStore.updateAvatar(avatarUrl)
      emit('update:avatar', avatarUrl)
      emit('uploadSuccess', avatarUrl)
      // 关闭对话框
      showUploadDialog.value = false
      resetUploadData()
    }
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
        font-size: 24px;
        color: #8c939d;
      }

      .upload-text {
        color: #8c939d;
        margin-left: 8px;
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
.dialog-footer {
  .el-button {
    margin-right: 8px;
    &:last-child {
      margin-right: 0;
    }
  }
}
</style>
