<template>
  <div class="modify-tool-container">
    <div class="card-header">
      <h2>{{ pageTitle }}</h2>
      <div class="header-buttons">
        <el-tooltip
          content="保存"
          placement="top"
          :showAfter="200"
          :hideAfter="0"
        >
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
        >
          <!-- 基本信息 -->
          <HeaderLine title="基本信息" :icon="Document" />
          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="工具标题（中文）" prop="title">
                <el-input v-model="formData.title" placeholder="请输入工具中文标题" clearable />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="工具标题（英文）" prop="titleEn">
                <el-input v-model="formData.titleEn" placeholder="请输入工具英文标题" clearable />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="工具类型" prop="toolType">
                <el-select v-model="formData.toolType" placeholder="请选择工具类型" clearable>
                  <el-option
                    v-for="item in ToolTypeDict.dictList.value"
                    :key="item.dictId"
                    :label="item.dictValue"
                    :value="item.dictId"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="工具地址" prop="toolUrl">
                <el-input v-model="formData.toolUrl" placeholder="请输入工具地址" clearable />
              </el-form-item>
            </el-col>
          </el-row>

          <!-- 工具描述 -->
          <HeaderLine title="工具描述" :icon="Comment" />

          <el-form-item label="工具描述（中文）" prop="description" class="content-item">
            <el-input
              v-model="formData.description"
              type="textarea"
              :rows="8"
              placeholder="请输入工具描述（中文）"
            />
          </el-form-item>

          <el-form-item label="工具描述（英文）" prop="descriptionEn" class="content-item">
            <el-input
              v-model="formData.descriptionEn"
              type="textarea"
              :rows="8"
              placeholder="请输入工具描述（英文）"
            />
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
import { Check, Document, Comment } from '@element-plus/icons-vue'
import HeaderLine from '@/components/global/headerLine.vue'
import service from '@/utils/services'
import { useTabsStore } from '@/stores/menuTabs'
import useLoading from '@/hooks/useLoading'
import { useDictionary } from '@/hooks/useDictionary'

// URL验证相关
const URL_REGEX = /^(https?:\/\/)([a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\/[a-zA-Z0-9._~:/?#[\]@!$&'()*+,;=]*)?$/
const validateUrl = (_rule: any, value: string, callback: (error?: Error) => void) => {
  if (!value) {
    callback(new Error('请输入工具地址'))
    return
  }

  // 检查URL是否以http://或https://开头
  if (!/^https?:\/\//i.test(value)) {
    callback(new Error('URL必须以http://或https://开头'))
    return
  }

  if (URL_REGEX.test(value)) {
    callback()
  } else {
    callback(new Error('请输入有效的URL地址'))
  }
}

const route = useRoute()
const router = useRouter()
const tabsStore = useTabsStore()
const { loading, changeLoading, closeLoading } = useLoading()

// 获取工具类型字典
const ToolTypeDict = useDictionary({
  dictType: 'opensource_tool_type',
  autoLoad: true
})

// 页面模式：add-新增，edit-编辑
const mode = ref(route.query.mode as string || 'add')
const toolId = ref(route.query.id as string)

// 表单引用
const formRef = ref<FormInstance>()

// 页面标题
const pageTitle = computed(() => {
  // 新增模式直接返回默认标题
  if (mode.value === 'add') {
    return '新增工具'
  }

  // 编辑模式，使用获取到的工具标题
  if (formData.title) {
    return `【${formData.title}】编辑`
  }

  // 如果还没有获取到工具标题，显示加载中
  return '编辑工具'
})

// 表单数据
const formData = reactive({
  id: '',
  title: '', // 工具标题（中文）
  titleEn: '', // 工具标题（英文）
  description: '', // 工具描述（中文）
  descriptionEn: '', // 工具描述（英文）
  toolType: '', // 工具类型
  toolUrl: '', // 工具地址
  publishStatus: '0' // 发布状态，默认未发布
})

// 表单验证规则
const formRules = {
  title: [
    { required: true, message: '请输入工具中文标题', trigger: 'blur' },
    { max: 200, message: '标题长度不能超过200个字符', trigger: 'blur' }
  ],
  titleEn: [
    { max: 200, message: '标题长度不能超过200个字符', trigger: 'blur' }
  ],
  toolType: [
    { required: true, message: '请选择工具类型', trigger: 'change' }
  ],
  toolUrl: [
    { required: true, message: '请输入工具地址', trigger: 'blur' },
    { max: 500, message: '地址长度不能超过500个字符', trigger: 'blur' },
    { validator: validateUrl, trigger: 'blur' }
  ]
}

// 获取工具详情
const fetchToolDetail = () => {
  if (!toolId.value) return

  changeLoading(true)

  service.post(`/api/tool/detail`, {
    id: toolId.value
  }).then((res: any) => {
    if (res) {
      // 设置表单数据
      formData.id = res.id
      formData.title = res.title
      formData.titleEn = res.titleEn
      formData.description = res.description
      formData.descriptionEn = res.descriptionEn
      formData.toolType = res.toolType
      formData.toolUrl = res.toolUrl
      formData.publishStatus = res.publishStatus
    }
  }).finally(() => {
    closeLoading()
  })
}

// 提交表单
const submitForm = () => {
  formRef.value?.validate((valid) => {
    if (valid) {
      const apiUrl = '/api/tool/save'
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
            tabsStore.delCurTab(currentPath, router, '/toolManage')
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
  if (mode.value === 'edit') {
    fetchToolDetail()
  }
})
</script>

<style scoped lang="less">
.modify-tool-container {
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
}
</style>
