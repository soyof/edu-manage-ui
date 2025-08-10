<template>
  <div class="modify-book-container">
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
              <el-form-item label="著作标题（中文）" prop="title">
                <el-input v-model="formData.title" placeholder="请输入中文标题" clearable />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col :span="24">
              <el-form-item label="著作标题（英文）" prop="titleEn">
                <el-input v-model="formData.titleEn" placeholder="请输入英文标题" clearable />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="作者（中文）" prop="author">
                <el-input v-model="formData.author" placeholder="请输入中文作者名称" clearable />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="作者（英文）" prop="authorEn">
                <el-input v-model="formData.authorEn" placeholder="请输入英文作者名称" clearable />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="著作发布日期" prop="bookPublishDate">
                <el-date-picker
                  v-model="formData.bookPublishDate"
                  type="date"
                  placeholder="请选择著作发布日期"
                  format="YYYY-MM-DD"
                  valueFormat="YYYY-MM-DD"
                  style="width: 100%;"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="著作链接地址" prop="bookUrl">
                <el-input v-model="formData.bookUrl" placeholder="请输入著作链接地址" clearable>
                  <template #prefix>
                    <el-icon><Link /></el-icon>
                  </template>
                </el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="是否译成外文" prop="isTranslated">
                <el-radio-group v-model="formData.isTranslated">
                  <el-radio label="0">否</el-radio>
                  <el-radio label="1">是</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
          </el-row>

          <!-- 摘要信息 -->
          <HeaderLine title="摘要信息" :icon="ChatLineRound" />
          <el-form-item label="摘要" prop="abstract" class="content-form-item">
            <el-tabs type="border-card" class="simple-tabs">
              <el-tab-pane label="中文内容">
                <div class="textarea-wrapper">
                  <el-input
                    v-model="formData.abstract"
                    type="textarea"
                    :rows="6"
                    placeholder="请输入中文摘要"
                    resize="none"
                  />
                </div>
              </el-tab-pane>
              <el-tab-pane label="英文内容">
                <div class="textarea-wrapper">
                  <el-input
                    v-model="formData.abstractEn"
                    type="textarea"
                    :rows="6"
                    placeholder="请输入英文摘要"
                    resize="none"
                  />
                </div>
              </el-tab-pane>
            </el-tabs>
          </el-form-item>

          <!-- 著作内容 -->
          <HeaderLine title="著作内容" :icon="Reading" />
          <el-form-item label="内容" prop="content" class="content-form-item">
            <el-tabs type="border-card" class="simple-tabs">
              <el-tab-pane label="中文内容">
                <div class="editor-wrapper">
                  <TinyMceEditor
                    v-model="formData.content"
                    :placeholder="'请输入著作内容（中文）'"
                    :height="500"
                    :disabled="mode === 'view'"
                  />
                </div>
              </el-tab-pane>
              <el-tab-pane label="英文内容">
                <div class="editor-wrapper">
                  <TinyMceEditor
                    v-model="formData.contentEn"
                    :placeholder="'请输入著作内容（英文）'"
                    :height="500"
                    :disabled="mode === 'view'"
                  />
                </div>
              </el-tab-pane>
            </el-tabs>
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
const bookId = ref(route.query.id as string)

// 表单引用
const formRef = ref<FormInstance>()

// 页面标题
const pageTitle = computed(() => {
  if (route.query.tabTitle) {
    return decodeURIComponent(route.query.tabTitle as string)
  }

  switch (mode.value) {
    case 'add': return '新增著作'
    case 'edit': return '编辑著作'
    case 'view': return '查看著作'
    default: return '著作信息'
  }
})

// 表单数据
const formData = reactive({
  id: '',
  title: '', // 中文标题
  titleEn: '', // 英文标题
  author: '', // 中文作者
  authorEn: '', // 英文作者
  abstract: '', // 中文摘要
  abstractEn: '', // 英文摘要
  bookPublishDate: '', // 著作发布日期
  bookUrl: '', // 著作链接地址
  isTranslated: '0', // 是否译成外文，默认为0（否）
  content: '', // 中文内容
  contentEn: '' // 英文内容
})

// 验证URL地址格式
const validateUrl = (_rule: any, value: string, callback: any) => {
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
    callback(new Error('请输入有效的网址格式'))
  }
}

// 表单验证规则
const formRules = {
  title: [
    { required: true, message: '请输入著作中文标题', trigger: 'blur' },
    { max: 255, message: '标题长度不能超过255个字符', trigger: 'blur' }
  ],
  titleEn: [
    { max: 255, message: '英文标题长度不能超过255个字符', trigger: 'blur' }
  ],
  author: [
    { required: true, message: '请输入著作中文作者', trigger: 'blur' },
    { max: 255, message: '作者名称长度不能超过255个字符', trigger: 'blur' }
  ],
  authorEn: [
    { max: 255, message: '英文作者名称长度不能超过255个字符', trigger: 'blur' }
  ],
  bookUrl: [
    { validator: validateUrl, trigger: 'blur' }
  ]
}

// 获取著作详情
const fetchBookDetail = () => {
  if (!bookId.value) return

  changeLoading(true)

  service.post(`/api/book/detail`, {
    id: bookId.value
  }).then((res: any) => {
    if (res) {
      // 设置表单数据
      formData.id = res.id
      formData.title = res.title
      formData.titleEn = res.titleEn
      formData.author = res.author
      formData.authorEn = res.authorEn
      formData.abstract = res.abstract
      formData.abstractEn = res.abstractEn
      formData.bookPublishDate = res.bookPublishDate
      formData.bookUrl = res.bookUrl
      formData.isTranslated = res.isTranslated
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
      const apiUrl = '/api/book/save'
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
            tabsStore.delCurTab(currentPath, router, '/bookManage')
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
    fetchBookDetail()
  }
})
</script>

<style scoped lang="less">
.modify-book-container {
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

  :deep(.el-input__wrapper),
  :deep(.el-textarea__inner) {
    border-radius: 6px;
  }

  .content-form-item {
    :deep(.el-form-item__label) {
      height: 40px;
      line-height: 40px;
    }

    .textarea-wrapper, .editor-wrapper {
      width: 100%;

      :deep(.el-textarea) {
        width: 100%;
        .el-textarea__inner {
          width: 100%;
          padding: 12px;
          font-size: 14px;
          color: #333;
        }
      }
    }

    :deep(.simple-tabs) {
      box-shadow: none;
      border: none;
      width: 100%;

      .el-tabs__header {
        background: #fff;
        border: none;
        margin-bottom: 4px;
        border: 1px solid var(--el-border-color);
        border-radius: 10px;
        overflow: hidden;
      }

      .el-tabs__content {
        padding: 0;
        border: none;
        background: #fff;
      }

      .el-tabs__nav-wrap {
        &::after {
          display: none;
        }
      }

      .el-tabs__nav {
        border: none !important;
      }

      .el-tabs__item {
        height: 40px;
        line-height: 40px;
        font-size: 15px;
        color: #606266;
        border: none !important;
        position: relative;
        transition: all 0.2s;

        &.is-active {
          color: var(--el-color-primary);
          font-weight: 500;
          background: transparent;

          &::after {
            content: '';
            position: absolute;
            left: 0;
            bottom: 0;
            width: 100%;
            height: 2px;
            background-color: var(--el-color-primary);
          }
        }

        &:hover {
          color: var(--el-color-primary);
        }
      }
    }
  }

  .textarea-wrapper {
    .el-input {
      border-radius: 6px;
    }
  }

  .editor-wrapper {
    .tiny-mce-editor {
      border-radius: 6px;
    }
  }
}
</style>
