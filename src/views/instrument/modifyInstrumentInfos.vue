<template>
  <div class="modify-instrument-container animate__animated animate__fadeIn">
    <div class="card-header">
      <h2>{{ pageTitle }}</h2>
      <div v-if="mode !== 'view'" class="header-buttons">
        <el-tooltip content="保存" placement="top" :showAfter="300">
          <el-button
            type="primary"
            circle
            :icon="Check"
            :loading="loading"
            @click="submitForm"
          />
        </el-tooltip>
      </div>
    </div>
    <div class="custom-card box-card">
      <div class="card-body">
        <!-- 表单区域 -->
        <el-form
          ref="formRef"
          :model="formData"
          :rules="formRules"
          labelWidth="150px"
          labelPosition="right"
          :disabled="mode === 'view'"
        >
          <!-- 基本信息 -->
          <HeaderLine title="基本信息" :icon="Document" />
          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="仪器名称（中文）" prop="instName">
                <el-input v-model="formData.instName" placeholder="请输入仪器中文名称" clearable />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="仪器名称（英文）" prop="instNameEn">
                <el-input v-model="formData.instNameEn" placeholder="请输入仪器英文名称" clearable />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="生产厂家（中文）" prop="manufacturer">
                <el-input v-model="formData.manufacturer" placeholder="请输入生产厂家中文名称" clearable />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="生产厂家（英文）" prop="manufacturerEn">
                <el-input v-model="formData.manufacturerEn" placeholder="请输入生产厂家英文名称" clearable />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="型号" prop="model">
                <el-input v-model="formData.model" placeholder="请输入仪器型号" clearable />
              </el-form-item>
            </el-col>
          </el-row>

          <!-- 技术信息 -->
          <HeaderLine title="技术信息" :icon="Setting" />
          <el-form-item label="工作原理（中文）" prop="workingPrinciple">
            <TinyMceEditor
              v-model="formData.workingPrinciple"
              :placeholder="'请输入工作原理（中文）'"
              :height="300"
              :disabled="mode === 'view'"
            />
          </el-form-item>
          <el-form-item label="工作原理（英文）" prop="workingPrincipleEn">
            <TinyMceEditor
              v-model="formData.workingPrincipleEn"
              :placeholder="'请输入工作原理（英文）'"
              :height="300"
              :disabled="mode === 'view'"
            />
          </el-form-item>
          <el-form-item label="应用范围（中文）" prop="applicationScope">
            <TinyMceEditor
              v-model="formData.applicationScope"
              :placeholder="'请输入应用范围（中文）'"
              :height="300"
              :disabled="mode === 'view'"
            />
          </el-form-item>
          <el-form-item label="应用范围（英文）" prop="applicationScopeEn">
            <TinyMceEditor
              v-model="formData.applicationScopeEn"
              :placeholder="'请输入应用范围（英文）'"
              :height="300"
              :disabled="mode === 'view'"
            />
          </el-form-item>
          <el-form-item label="性能特点（中文）" prop="performanceFeatures">
            <TinyMceEditor
              v-model="formData.performanceFeatures"
              :placeholder="'请输入性能特点（中文）'"
              :height="300"
              :disabled="mode === 'view'"
            />
          </el-form-item>
          <el-form-item label="性能特点（英文）" prop="performanceFeaturesEn">
            <TinyMceEditor
              v-model="formData.performanceFeaturesEn"
              :placeholder="'请输入性能特点（英文）'"
              :height="300"
              :disabled="mode === 'view'"
            />
          </el-form-item>
          <el-form-item label="其它说明（中文）" prop="otherInfo">
            <TinyMceEditor
              v-model="formData.otherInfo"
              :placeholder="'请输入其它说明（中文）'"
              :height="300"
              :disabled="mode === 'view'"
            />
          </el-form-item>
          <el-form-item label="其它说明（英文）" prop="otherInfoEn">
            <TinyMceEditor
              v-model="formData.otherInfoEn"
              :placeholder="'请输入其它说明（英文）'"
              :height="300"
              :disabled="mode === 'view'"
            />
          </el-form-item>

          <!-- 图片信息 -->
          <HeaderLine title="图片信息" :icon="Picture" />
          <el-form-item label="仪器图片" prop="imageFiles">
            <ImageUpload
              v-model="formData.imageFiles"
              :multiple="true"
              :limit="5"
              :disabled="mode === 'view'"
              accept="image/*"
              :file-size="5"
              list-type="picture-card"
            />
            <div class="upload-tip">
              <el-text type="info" size="small">
                支持jpg、png、gif格式，单个文件不超过5MB，最多上传5张图片
              </el-text>
            </div>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { FormInstance } from 'element-plus'
import { Check, Document, Setting, Picture } from '@element-plus/icons-vue'
import HeaderLine from '@/components/global/headerLine.vue'
import ImageUpload from '@/components/global/imageUpload.vue'
import TinyMceEditor from '@/components/global/tinyMceEditor.vue'
import service from '@/utils/services'
import { useTabsStore } from '@/stores/menuTabs'
import useLoading from '@/hooks/useLoading'

const route = useRoute()
const router = useRouter()
const tabsStore = useTabsStore()
const { loading, changeLoading, closeLoading } = useLoading()

// 页面模式：add-新增，edit-编辑，view-查看
const mode = ref(route.query.mode as string || 'add')
const instrumentId = ref(route.query.id as string)

// 表单引用
const formRef = ref<FormInstance>()

// 页面标题
const pageTitle = computed(() => {
  if (route.query.tabTitle) {
    return decodeURIComponent(route.query.tabTitle as string)
  }

  switch (mode.value) {
    case 'add': return '新增仪器'
    case 'edit': return '编辑仪器'
    case 'view': return '查看仪器'
    default: return '仪器信息'
  }
})

// 表单数据
const formData = reactive({
  id: '',
  instName: '', // 仪器名称（中文）
  instNameEn: '', // 仪器名称（英文）
  manufacturer: '', // 生产厂家（中文）
  manufacturerEn: '', // 生产厂家（英文）
  model: '', // 型号
  workingPrinciple: '', // 工作原理（中文）
  workingPrincipleEn: '', // 工作原理（英文）
  applicationScope: '', // 应用范围（中文）
  applicationScopeEn: '', // 应用范围（英文）
  performanceFeatures: '', // 性能特点（中文）
  performanceFeaturesEn: '', // 性能特点（英文）
  otherInfo: '', // 其它说明（中文）
  otherInfoEn: '', // 其它说明（英文）
  imageFiles: [] as string[] // 仪器图片
})

// 表单验证规则
const formRules = {
  instName: [
    { required: true, message: '请输入仪器中文名称', trigger: 'blur' },
    { max: 255, message: '名称长度不能超过255个字符', trigger: 'blur' }
  ],
  instNameEn: [
    { max: 255, message: '名称长度不能超过255个字符', trigger: 'blur' }
  ],
  manufacturer: [
    { required: true, message: '请输入生产厂家中文名称', trigger: 'blur' },
    { max: 255, message: '厂家名称长度不能超过255个字符', trigger: 'blur' }
  ],
  manufacturerEn: [
    { max: 255, message: '厂家名称长度不能超过255个字符', trigger: 'blur' }
  ],
  model: [
    { required: true, message: '请输入仪器型号', trigger: 'blur' },
    { max: 100, message: '型号长度不能超过100个字符', trigger: 'blur' }
  ]
}

// 获取仪器详情
const fetchInstrumentDetail = () => {
  if (!instrumentId.value) return

  changeLoading(true)

  service.post(`/api/instrument/detail`, {
    id: instrumentId.value
  }).then((res: any) => {
    if (res) {
      // 设置表单数据
      formData.id = res.id
      formData.instName = res.instName
      formData.instNameEn = res.instNameEn
      formData.manufacturer = res.manufacturer
      formData.manufacturerEn = res.manufacturerEn
      formData.model = res.model
      formData.workingPrinciple = res.workingPrinciple
      formData.workingPrincipleEn = res.workingPrincipleEn
      formData.applicationScope = res.applicationScope
      formData.applicationScopeEn = res.applicationScopeEn
      formData.performanceFeatures = res.performanceFeatures
      formData.performanceFeaturesEn = res.performanceFeaturesEn
      formData.otherInfo = res.otherInfo
      formData.otherInfoEn = res.otherInfoEn
      formData.imageFiles = res.imageFiles || []
    }
  }).finally(() => {
    closeLoading()
  })
}

// 提交表单
const submitForm = () => {
  formRef.value?.validate((valid) => {
    if (valid) {
      const apiUrl = '/api/instrument/save'
      changeLoading(true)
      service.post(apiUrl, formData)
        .then(() => {
          ElMessage.success({
            message: `${mode.value === 'add' ? '新增' : '编辑'}成功`,
            type: 'success',
            duration: 2000
          })
          // 获取当前tab路径
          const currentPath = tabsStore.getCurTabPath
          // 关闭当前标签
          if (currentPath) {
            tabsStore.delCurTab(currentPath, router, '/instrumentManage')
          }
        })
        .finally(() => {
          closeLoading()
        })
    } else {
      ElMessage.error({
        message: '请填写必填项',
        type: 'error'
      })
    }
  })
}

// 页面初始化
onMounted(() => {
  if (mode.value === 'edit' || mode.value === 'view') {
    fetchInstrumentDetail()
  }
})
</script>

<style scoped lang="less">
.modify-instrument-container {
  position: relative;
  width: 100%;
  height: 100%;
  box-sizing: border-box;

  .card-header {
    position: sticky;
    top: 0;
    left: 0;
    z-index: 10;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 20px;
    background-color: #fff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

    h2 {
      font-size: 20px;
      margin: 0;
      padding: 0;
      background-image: linear-gradient(90deg, var(--el-color-primary), #409eff);
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
      font-weight: 600;
    }
  }

  .custom-card {
    background-color: #fff;
    padding: 12px;
    border-radius: 8px;
    transition: all 0.3s ease;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

    &:hover {
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
    }
  }

  .box-card {
    transition: all 0.3s ease;
    border: none;
    border-radius: 8px;
  }

  .header-line-wrap {
    margin-bottom: 12px;
  }

  .card-body {
    padding-top: 4px;
  }

  .upload-tip {
    margin-top: 8px;
  }

  :deep(.el-form-item__label) {
    font-weight: 500;
  }

  :deep(.el-input),
  :deep(.el-textarea) {
    transition: all 0.3s ease;

    &:hover {
      .el-input__wrapper {
        box-shadow: 0 0 0 1px var(--el-color-primary) inset;
      }
    }
  }

  :deep(.el-input__wrapper),
  :deep(.el-textarea__inner) {
    border-radius: 6px;
  }

  :deep(.el-form-item) {
    margin-bottom: 24px;
  }
}
</style>
