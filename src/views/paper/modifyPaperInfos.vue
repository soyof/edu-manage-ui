<template>
  <div class="modify-paper-container">
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
                <el-input
                  v-model="formData.title"
                  placeholder="请输入中文标题"
                  clearable
                  maxlength="255"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col :span="24">
              <el-form-item label="论文标题（英文）" prop="titleEn">
                <el-input
                  v-model="formData.titleEn"
                  placeholder="请输入英文标题"
                  clearable
                  maxlength="255"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="作者（中文）" prop="authors">
                <el-select
                  v-model="authorsList"
                  multiple
                  clearable
                  filterable
                  allowCreate
                  defaultFirstOption
                  placeholder="请选择或输入作者，回车确认"
                  :disabled="mode === 'view'"
                  @change="handleAuthorsChange"
                >
                  <el-option
                    v-for="author in authorOptions"
                    :key="author"
                    :label="author"
                    :value="author"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="作者（英文）" prop="authorsEn">
                <el-select
                  v-model="authorsEnList"
                  multiple
                  clearable
                  filterable
                  allowCreate
                  defaultFirstOption
                  placeholder="请选择或输入英文作者，回车确认"
                  :disabled="mode === 'view'"
                  @change="handleAuthorsEnChange"
                >
                  <el-option
                    v-for="author in authorEnOptions"
                    :key="author"
                    :label="author"
                    :value="author"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="期刊名称（中文）" prop="journal">
                <el-input v-model="formData.journal" placeholder="请输入期刊名称" clearable />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="期刊名称（英文）" prop="journalEn">
                <el-input v-model="formData.journalEn" placeholder="请输入英文期刊名称" clearable />
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
          <el-form-item label="摘要" prop="abstract" class="content-form-item">
            <el-tabs type="border-card" class="simple-tabs">
              <el-tab-pane label="中文内容">
                <div class="editor-wrapper">
                  <TinyMceEditor
                    v-model="formData.abstract"
                    :placeholder="'请输入中文摘要'"
                    :height="350"
                    :disabled="mode === 'view'"
                    :simpleMode="true"
                  />
                </div>
              </el-tab-pane>
              <el-tab-pane label="英文内容">
                <div class="editor-wrapper">
                  <TinyMceEditor
                    v-model="formData.abstractEn"
                    :placeholder="'请输入英文摘要'"
                    :height="350"
                    :disabled="mode === 'view'"
                    :simpleMode="true"
                  />
                </div>
              </el-tab-pane>
            </el-tabs>
          </el-form-item>

          <!-- 论文内容 -->
          <HeaderLine title="论文内容" :icon="Reading" />
          <el-form-item label="内容" prop="content" class="content-form-item">
            <el-tabs type="border-card" class="simple-tabs">
              <el-tab-pane label="中文内容">
                <div class="editor-wrapper">
                  <TinyMceEditor
                    v-model="formData.content"
                    :placeholder="'请输入论文内容（中文）'"
                    :height="500"
                    :disabled="mode === 'view'"
                  />
                </div>
              </el-tab-pane>
              <el-tab-pane label="英文内容">
                <div class="editor-wrapper">
                  <TinyMceEditor
                    v-model="formData.contentEn"
                    :placeholder="'请输入论文内容（英文）'"
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

// 作者选项
const authorOptions = ref<string[]>([])
const authorEnOptions = ref<string[]>([])

// 作者列表（用于el-select绑定）
const authorsList = ref<string[]>([])
const authorsEnList = ref<string[]>([])

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
  authors: '', // 作者列表（中文）
  authorsEn: '', // 作者列表（英文）
  journal: '', // 期刊名称（中文）
  journalEn: '', // 期刊名称（英文）
  abstract: '', // 中文摘要
  abstractEn: '', // 英文摘要
  paperPublishTimes: '', // 论文发布时间
  originalUrl: '', // 原文地址
  content: '', // 中文内容
  contentEn: '' // 英文内容
})

// 验证URL地址格式
const validateUrl = (_rule: any, value: string, callback: any) => {
  if (!value || value === '') {
    callback()
    return
  }

  // 检查是否是有效的URL
  const isValidUrl = (urlString: string): boolean => {
    try {
      const url = new URL(urlString)
      return url.protocol === 'http:' || url.protocol === 'https:'
    } catch {
      return false
    }
  }

  // 先检查原始URL
  if (isValidUrl(value)) {
    callback()
    return
  }

  // 尝试添加http协议再验证
  if (isValidUrl('http://' + value)) {
    callback()
    return
  }

  // 都不是有效URL
  callback(new Error('请输入有效的网址格式'))
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
  authors: [
    { required: true, message: '请输入作者', trigger: 'blur' },
    { max: 500, message: '作者长度不能超过500个字符', trigger: 'blur' }
  ],
  authorsEn: [
    { max: 500, message: '作者长度不能超过500个字符', trigger: 'blur' }
  ],
  journal: [
    { max: 255, message: '期刊名称长度不能超过255个字符', trigger: 'blur' }
  ],
  journalEn: [
    { max: 255, message: '期刊名称长度不能超过255个字符', trigger: 'blur' }
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
      formData.authors = res.authors || '未知作者'
      formData.authorsEn = res.authorsEn || ''
      formData.journal = res.journal || ''
      formData.journalEn = res.journalEn || ''
      formData.abstract = res.abstract
      formData.abstractEn = res.abstractEn
      formData.paperPublishTimes = res.paperPublishTimes
      formData.originalUrl = res.originalUrl
      formData.content = res.content
      formData.contentEn = res.contentEn
      // 初始化作者列表
      initAuthorsList()
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

// 处理作者变更
const handleAuthorsChange = () => {
  formData.authors = authorsList.value.join(',')
}

// 处理英文作者变更
const handleAuthorsEnChange = () => {
  formData.authorsEn = authorsEnList.value.join(',')
}

// 初始化作者列表
const initAuthorsList = () => {
  if (formData.authors) {
    authorsList.value = formData.authors.split(',').map(item => item.trim()).filter(Boolean)
    // 更新作者选项
    authorsList.value.forEach(author => {
      if (!authorOptions.value.includes(author)) {
        authorOptions.value.push(author)
      }
    })
  } else {
    authorsList.value = []
  }

  if (formData.authorsEn) {
    authorsEnList.value = formData.authorsEn.split(',').map(item => item.trim()).filter(Boolean)
    // 更新英文作者选项
    authorsEnList.value.forEach(author => {
      if (!authorEnOptions.value.includes(author)) {
        authorEnOptions.value.push(author)
      }
    })
  } else {
    authorsEnList.value = []
  }
}

// 页面初始化
onMounted(() => {
  if (mode.value === 'edit' || mode.value === 'view') {
    fetchPaperDetail()
  } else {
    // 新增模式下，初始化作者列表
    initAuthorsList()
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
