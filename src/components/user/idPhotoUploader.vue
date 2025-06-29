<template>
  <div class="id-photo-uploader-container">
    <div class="id-photo-container">
      <el-upload
        class="id-photo-uploader"
        :disabled="disabled"
        :showFileList="false"
        :autoUpload="false"
        :onChange="handleFileChange"
        accept="image/jpeg,image/png,image/jpg"
      >
        <div v-if="modelValue" class="id-photo-preview">
          <el-image
            :src="`/api/previewImage?filename=${modelValue}`"
            class="id-photo-image"
            :previewSrcList="[`/api/previewImage?filename=${modelValue}`]"
            showProgress
            fit="cover"
          />
          <div v-if="!disabled" class="id-photo-actions">
            <el-icon class="id-photo-action-icon"><Edit /></el-icon>
            <span>更换照片</span>
          </div>
        </div>
        <el-icon v-else class="id-photo-uploader-icon"><Plus /></el-icon>
        <div v-if="!modelValue" class="id-photo-tip">
          <span>点击上传证件照</span>
          <span class="id-photo-subtip">支持JPEG/JPG/PNG格式，小于5MB</span>
        </div>
      </el-upload>

      <el-button
        v-if="modelValue && !disabled"
        type="danger"
        link
        class="id-photo-delete"
        @click="handleDelete"
      >
        <el-icon><Delete /></el-icon>
        删除照片
      </el-button>
    </div>

    <!-- 裁剪对话框 -->
    <el-dialog
      v-model="cropperVisible"
      title="裁剪证件照"
      width="600px"
      destroyOnClose
      :closeOnClickModal="false"
    >
      <div class="cropper-container">
        <VueCropper
          ref="cropperRef"
          :img="cropperImage"
          :outputSize="1"
          :outputType="'png'"
          :info="true"
          :full="false"
          :canMove="true"
          :canMoveBox="true"
          :original="false"
          :autoCrop="true"
          :fixed="true"
          :fixedNumber="[8.5, 10]"
          :centerBox="true"
          :high="true"
          @realTime="cropperRealTime"
        />
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="cropperVisible = false">取消</el-button>
          <el-button type="primary" @click="cropImage">确认</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Edit, Plus, Delete } from '@element-plus/icons-vue'
import 'vue-cropper/dist/index.css'
import { VueCropper } from 'vue-cropper'
import service from '@/utils/services'
import useLoading from '@/hooks/useLoading'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  userId: {
    type: String,
    required: true
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'uploadSuccess', 'uploadError', 'delete'])

// 使用loading hook
const { loading, changeLoading } = useLoading({
  target: '.id-photo-uploader-container'
})

// 裁剪相关
const cropperVisible = ref(false)
const cropperImage = ref('')
const cropperRef = ref()
const cropperResult = ref({
  file: null as File | null,
  blob: null as Blob | null,
  dataUrl: ''
})

// 处理文件选择
const handleFileChange = (fileInfo: any) => {
  const file = fileInfo.raw
  console.log(file.raw)
  // 检查文件类型
  const isImage = ['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)
  if (!isImage) {
    ElMessage.error('证件照只能是JPEG/JPG/PNG格式!')
    return false
  }

  // 检查文件大小（限制为5MB）
  const isLt5M = file.size / 1024 / 1024 < 5
  if (!isLt5M) {
    ElMessage.error('证件照大小不能超过5MB!')
    return false
  }

  // 读取文件并打开裁剪对话框
  const reader = new FileReader()
  reader.onload = (e) => {
    cropperImage.value = e.target?.result as string
    cropperVisible.value = true
  }
  reader.readAsDataURL(file)
}

// 裁剪实时数据
const cropperRealTime = (data: any) => {
  cropperResult.value = data
}

// 裁剪图片
const cropImage = async() => {
  if (!cropperRef.value) return

  // 获取裁剪后的图片blob数据
  cropperRef.value.getCropBlob((blob: Blob) => {
    cropperVisible.value = false
    changeLoading(true, { text: '上传中...' })

    // 创建FormData对象
    const formData = new FormData()
    // 将blob转换为文件
    const file = new File([blob], 'idphoto.png', { type: 'image/png' })
    console.log(file)
    formData.append('idcard', file)
    formData.append('userId', props.userId)
    formData.append('type', 'idPic')

    // 调用上传API
    service.upload('/api/uploadIdCard', formData).then((res: any) => {
      console.log(res)
      if (res && res.url) {
        emit('update:modelValue', res.url)
        emit('uploadSuccess', res.url)
        ElMessage.success('证件照上传成功')
      } else {
        emit('uploadError', '无法获取图片URL')
      }
    }).catch((error) => {
      emit('uploadError', error)
    }).finally(() => {
      changeLoading(false)
    })
  })
}

// 删除照片
const handleDelete = () => {
  ElMessageBox.confirm('确定要删除证件照吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    emit('update:modelValue', '')
    emit('delete')
    ElMessage.success('证件照已删除')
  }).catch(() => {
    // 取消删除，不做任何操作
  })
}
</script>

<style lang="less" scoped>
.id-photo-uploader-container {
  position: relative;
  width: 100%;
  height: 130px;
  overflow: hidden;

  .id-photo-container {
    width: 100%;
    height: 100%;
    display: flex;
    // align-items: center;

    .id-photo-uploader {
      width: 100%;
      height: 100%;
      margin-right: 10px;
    }

    .id-photo-preview {
      width: 100%;
      height: 130px;
      position: relative;
      cursor: pointer;
      overflow: hidden;

      .id-photo-image {
        width: 100px;
        height: 130px;
        border-radius: 4px;
      }

      .id-photo-actions {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background-color: rgba(0, 0, 0, 0.5);
        border-radius: 4px;
        color: #fff;
        opacity: 0;
        transition: opacity 0.3s;

        .id-photo-action-icon {
          font-size: 20px;
        }
      }

      &:hover .id-photo-actions {
        opacity: 1;
      }
    }

    .id-photo-uploader-icon {
      font-size: 28px;
      color: #8c939d;
      width: 100px;
      height: 130px;
      line-height: 120px;
      text-align: center;
      border: 1px dashed #d9d9d9;
      border-radius: 4px;
    }

    .id-photo-tip {
      margin-left: 10px;
      display: flex;
      flex-direction: column;
    }

    .id-photo-subtip {
      margin-top: 4px;
      font-size: 0.8em;
      color: #909399;
    }

    .id-photo-delete {
      margin-left: 10px;
    }
  }
}

.cropper-container {
  height: 400px;
  width: 100%;
}
</style>
