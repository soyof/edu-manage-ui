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
      draggable
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

        <div v-else>
          <!-- 使用通用裁剪对话框组件 -->
          <CropperDialog
            v-model:visible="showCropper"
            title="裁剪头像"
            :imageUrl="imageUrl"
            :outputSize="0.8"
            :outputType="outputType"
            :showFull="true"
            :canScale="true"
            :fixed="false"
            :autoCropWidth="cropWidth"
            :autoCropHeight="cropHeight"
            :showPreview="true"
            :previewCircle="true"
            :showReupload="true"
            :loading="uploading"
            @confirm="handleCropperConfirm"
            @cancel="handleCropperCancel"
            @reupload="uploadAgain"
            @preview="handlePreview"
          />
        </div>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="cancelUpload">取 消</el-button>
          <el-button v-if="imageUrl" @click="uploadAgain">重新上传</el-button>
          <el-button
            v-if="imageUrl"
            type="primary"
            :loading="uploading"
            @click="confirmUpload"
          >
            确 认
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { EditPen, Plus } from '@element-plus/icons-vue'
import service from '@/utils/services'
import { useUserInfoStore } from '@/stores/userInfo'
import CropperDialog from '@/components/global/cropperDialog.vue'

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
const showCropper = ref(false)
const imageUrl = ref('')
const previewUrl = ref('')
const uploading = ref(false)
const currentAvatar = computed(() => props.avatar ? `/api/previewAvatar?filename=${props.avatar}&userId=${props.userId}` : '')

// 监听imageUrl变化，当有图片时显示裁剪组件
watch(() => imageUrl.value, (newVal) => {
  showCropper.value = !!newVal
})

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

// 处理预览
const handlePreview = (data: any) => {
  previewUrl.value = data.url
}

// 清除上传图片和初始化数据
const resetUploadData = () => {
  imageUrl.value = ''
  previewUrl.value = ''
  showCropper.value = false
}

// 处理对话框关闭
const handleDialogClose = () => {
  resetUploadData()
}

// 取消上传
const cancelUpload = () => {
  showUploadDialog.value = false
  resetUploadData()
}

// 重新上传
const uploadAgain = () => {
  resetUploadData()
}

// 处理裁剪取消
const handleCropperCancel = () => {
  showCropper.value = false
}

// 确认上传
const confirmUpload = () => {
  // 触发裁剪组件的确认方法
  showCropper.value = true
}

// 处理裁剪确认
const handleCropperConfirm = async(data: { blob: Blob, file: File, url: string }) => {
  uploading.value = true
  try {
    // 创建表单数据
    const formData = new FormData()
    formData.append('userId', props.userId)
    formData.append('avatar', data.file)
    // 调用上传API
    const res: any = await service.upload('/api/uploadAvatar', formData)
    if (res) {
      ElMessage.success('头像上传成功')
      // 向父组件通知上传成功，传递新头像URL
      const avatarUrl = res.avatarUrl || data.url
      userInfoStore.updateAvatar(avatarUrl)
      emit('update:avatar', avatarUrl)
      emit('uploadSuccess', avatarUrl)
      // 关闭对话框
      showUploadDialog.value = false
      resetUploadData()
    }
  } catch (error) {
    ElMessage.error('头像上传失败')
    console.error('上传头像出错:', error)
  } finally {
    uploading.value = false
  }
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
