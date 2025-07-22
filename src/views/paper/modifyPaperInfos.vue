<template>
  <div class="modify-paper-container animate__animated animate__fadeIn">
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
            <el-col :span="24">
              <el-form-item label="论文标题（中文）" prop="title">
                <el-input v-model="formData.title" placeholder="请输入中文标题" clearable />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col :span="24">
              <el-form-item label="论文标题（英文）" prop="titleEn">
                <el-input v-model="formData.titleEn" placeholder="请输入英文标题" clearable />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="文献发布时间" prop="paperPublishTimes">
                <el-date-picker
                  v-model="formData.paperPublishTimes"
                  type="date"
                  placeholder="请选择文献原始发布时间"
                  format="YYYY-MM-DD"
                  valueFormat="YYYY-MM-DD"
                  style="width: 100%;"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="原文地址" prop="originalUrl">
                <el-input v-model="formData.originalUrl" placeholder="请输入原文链接地址" clearable>
                  <template #prefix>
                    <el-icon><Link /></el-icon>
                  </template>
                </el-input>
              </el-form-item>
            </el-col>
          </el-row>

          <!-- 摘要信息 -->
          <HeaderLine title="摘要信息" :icon="ChatLineRound" />
          <el-form-item label="中文摘要" prop="abstract">
            <el-input
              v-model="formData.abstract"
              type="textarea"
              :rows="6"
              placeholder="请输入中文摘要"
              resize="none"
            />
          </el-form-item>
          <el-form-item label="英文摘要" prop="abstractEn">
            <el-input
              v-model="formData.abstractEn"
              type="textarea"
              :rows="6"
              placeholder="请输入英文摘要"
              resize="none"
            />
          </el-form-item>

          <!-- 论文内容 -->
          <HeaderLine title="论文内容" :icon="Reading" />
          <el-form-item label="中文内容" prop="content">
            <TinyMceEditor
              v-model="formData.content"
              :placeholder="'请输入论文内容（中文）'"
              :height="500"
              :disabled="mode === 'view'"
            />
          </el-form-item>
          <el-form-item label="英文内容" prop="contentEn">
            <TinyMceEditor
              v-model="formData.contentEn"
              :placeholder="'请输入论文内容（英文）'"
              :height="500"
              :disabled="mode === 'view'"
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
import { Check, Document, ChatLineRound, Reading, Link } from '@element-plus/icons-vue'
import TinyMceEditor from '@/components/global/tinyMceEditor.vue'
import HeaderLine from '@/components/global/headerLine.vue'
import service from '@/utils/services'
import { useTabsStore } from '@/stores/menuTabs'
import useLoading from '@/hooks/useLoading'

const route = useRoute()
const router = useRouter()
const tabsStore = useTabsStore()
const { loading, changeLoading, closeLoading } = useLoading()

// 页面模式：add-新增，edit-编辑，view-查看
const mode = ref(route.query.mode as string || 'add')
const paperId = ref(route.query.id as string)

// 表单引用
const formRef = ref<FormInstance>()

// 页面标题
const pageTitle = computed(() => {
  if (route.query.tabTitle) {
    return decodeURIComponent(route.query.tabTitle as string)
  }

  switch (mode.value) {
    case 'add': return '新增论文'
    case 'edit': return '编辑论文'
    case 'view': return '查看论文'
    default: return '论文信息'
  }
})

// 表单数据
const formData = reactive({
  id: '',
  title: '', // 中文标题
  titleEn: '', // 英文标题
  abstract: '', // 中文摘要
  abstractEn: '', // 英文摘要
  paperPublishTimes: '', // 论文发布时间
  originalUrl: '', // 原文地址
  content: '', // 中文内容
  contentEn: '' // 英文内容
})

// 验证URL地址格式
const validateUrl = (rule: any, value: string, callback: any) => {
  if (!value || value === '') {
    callback()
    return
  }

  try {
    const url = new URL(value)
    if (url.protocol === 'http:' || url.protocol === 'https:') {
      callback()
    } else {
      callback(new Error('请输入http或https开头的有效网址'))
    }
  } catch (e) {
    // 如果没有协议，尝试添加协议再验证
    try {
      const url = new URL('http://' + value)
      callback()
    } catch (e) {
      callback(new Error('请输入有效的网址格式'))
    }
  }
}

// 表单验证规则
const formRules = {
  title: [
    { required: true, message: '请输入论文中文标题', trigger: 'blur' },
    { max: 255, message: '标题长度不能超过255个字符', trigger: 'blur' }
  ],
  titleEn: [
    { max: 255, message: '标题长度不能超过255个字符', trigger: 'blur' }
  ],
  originalUrl: [
    { validator: validateUrl, trigger: 'blur' }
  ]
}

// 获取论文详情
const fetchPaperDetail = () => {
  if (!paperId.value) return

  changeLoading(true)

  service.post(`/api/paper/detail`, {
    id: paperId.value
  }).then((res: any) => {
    if (res) {
      // 设置表单数据
      formData.id = res.id
      formData.title = res.title
      formData.titleEn = res.titleEn
      formData.abstract = res.abstract
      formData.abstractEn = res.abstractEn
      formData.paperPublishTimes = res.paperPublishTimes
      formData.originalUrl = res.originalUrl
      formData.content = res.content
      formData.contentEn = res.contentEn
    }
  }).finally(() => {
    closeLoading()
  })
}

// 提交表单
const submitForm = () => {
  formRef.value?.validate((valid) => {
    if (valid) {
      const apiUrl = '/api/paper/save'
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
            tabsStore.delCurTab(currentPath, router, '/paperManage')
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
    fetchPaperDetail()
  }
})
</script>

<style scoped lang="less">
.modify-paper-container {
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
    padding: 20px;
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

  :deep(.el-form-item) {
    margin-bottom: 24px;
  }
}
</style>
