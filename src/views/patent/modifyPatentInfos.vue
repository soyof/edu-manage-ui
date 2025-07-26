<template>
  <div class="modify-patent-container">
    <div class="card-header">
      <h2>{{ pageTitle }}</h2>
      <div v-if="mode !== 'view'" class="header-buttons">
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
          :disabled="mode === 'view'"
        >
          <!-- 基本信息 -->
          <HeaderLine title="基本信息" :icon="Document" />
          <el-row :gutter="24">
            <el-col :span="24">
              <el-form-item label="专利名称（中文）" prop="title">
                <el-input v-model="formData.title" placeholder="请输入中文名称" clearable />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col :span="24">
              <el-form-item label="专利名称（英文）" prop="titleEn">
                <el-input v-model="formData.titleEn" placeholder="请输入英文名称" clearable />
              </el-form-item>
            </el-col>
          </el-row>

          <!-- 专利信息 -->
          <HeaderLine title="专利信息" :icon="Collection" />
          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="申请号" prop="applicationNum">
                <el-input v-model="formData.applicationNum" placeholder="请输入专利申请号" clearable />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="申请人" prop="applicants">
                <el-input v-model="formData.applicants" placeholder="请输入申请人，多个用逗号分隔" clearable />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="24">
            <el-col :span="8">
              <el-form-item label="申请日期" prop="applicationDate">
                <el-date-picker
                  v-model="formData.applicationDate"
                  type="date"
                  placeholder="请选择专利申请日期"
                  format="YYYY-MM-DD"
                  valueFormat="YYYY-MM-DD"
                  style="width: 100%;"
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="授权日期" prop="authorizationDate">
                <el-date-picker
                  v-model="formData.authorizationDate"
                  type="date"
                  placeholder="请选择专利授权日期"
                  format="YYYY-MM-DD"
                  valueFormat="YYYY-MM-DD"
                  style="width: 100%;"
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="专利发布日期" prop="patentPublishDate">
                <el-date-picker
                  v-model="formData.patentPublishDate"
                  type="date"
                  placeholder="请选择专利官方发布日期"
                  format="YYYY-MM-DD"
                  valueFormat="YYYY-MM-DD"
                  style="width: 100%;"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="24">
            <el-col :span="24">
              <el-form-item label="是否职务专利" prop="isServicePatent">
                <el-radio-group v-model="formData.isServicePatent">
                  <el-radio label="1" value="1">是</el-radio>
                  <el-radio label="0" value="0">否</el-radio>
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

          <!-- 专利内容 -->
          <HeaderLine title="专利内容" :icon="Reading" />
          <el-form-item label="内容" prop="content" class="content-form-item">
            <el-tabs type="border-card" class="simple-tabs">
              <el-tab-pane label="中文内容">
                <TinyMceEditor
                  v-model="formData.content"
                  :placeholder="'请输入专利内容（中文）'"
                  :height="500"
                  :disabled="mode === 'view'"
                />
              </el-tab-pane>
              <el-tab-pane label="英文内容">
                <TinyMceEditor
                  v-model="formData.contentEn"
                  :placeholder="'请输入专利内容（英文）'"
                  :height="500"
                  :disabled="mode === 'view'"
                />
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
import { Check, Document, ChatLineRound, Reading, Collection } from '@element-plus/icons-vue'
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
const patentId = ref(route.query.id as string)

// 表单引用
const formRef = ref<FormInstance>()

// 页面标题
const pageTitle = computed(() => {
  if (route.query.tabTitle) {
    return decodeURIComponent(route.query.tabTitle as string)
  }

  switch (mode.value) {
    case 'add': return '新增专利'
    case 'edit': return '编辑专利'
    case 'view': return '查看专利'
    default: return '专利信息'
  }
})

// 表单数据
const formData = reactive({
  id: '',
  title: '', // 中文名称
  titleEn: '', // 英文名称
  applicationNum: '', // 申请号
  applicants: '', // 申请人
  isServicePatent: '0', // 是否职务专利
  applicationDate: '', // 申请日期
  authorizationDate: '', // 授权日期
  patentPublishDate: '', // 专利发布日期
  abstract: '', // 中文摘要
  abstractEn: '', // 英文摘要
  content: '', // 中文内容
  contentEn: '' // 英文内容
})

// 表单验证规则
const formRules = {
  title: [
    { required: true, message: '请输入专利中文名称', trigger: 'blur' },
    { max: 255, message: '名称长度不能超过255个字符', trigger: 'blur' }
  ],
  titleEn: [
    { max: 255, message: '名称长度不能超过255个字符', trigger: 'blur' }
  ],
  applicationNum: [
    { required: true, message: '请输入专利申请号', trigger: 'blur' },
    { max: 50, message: '申请号长度不能超过50个字符', trigger: 'blur' }
  ],
  applicants: [
    { required: true, message: '请输入申请人', trigger: 'blur' },
    { max: 500, message: '申请人长度不能超过500个字符', trigger: 'blur' }
  ],
  applicationDate: [
    { required: true, message: '请选择申请日期', trigger: 'change' }
  ]
}

// 提交表单
const submitForm = () => {
  if (!formRef.value) return

  formRef.value.validate((valid) => {
    if (valid) {
      savePatent()
    }
  })
}

// 保存专利
const savePatent = () => {
  changeLoading(true)

  const params = {
    ...formData
  }

  const apiUrl = '/api/patent/save'

  service.post(apiUrl, params)
    .then(() => {
      ElMessage.success('保存成功')
      // 获取当前路径，用于关闭当前标签页
      const currentPath = route.fullPath
      console.log(currentPath)

      // 返回专利管理列表页
      tabsStore.delCurTab(currentPath, router, '/patentManage')
    })
    .catch(() => {
      ElMessage.error('保存失败')
    })
    .finally(() => {
      closeLoading()
    })
}

// 获取专利详情
const fetchPatentDetail = () => {
  if (!patentId.value) return

  changeLoading(true)

  service.post(`/api/patent/detail`, {
    id: patentId.value
  }).then((res: any) => {
    // 更新表单数据
    formData.id = res.id
    formData.title = res.title
    formData.titleEn = res.titleEn
    formData.applicationNum = res.applicationNum
    formData.applicants = res.applicants
    formData.isServicePatent = res.isServicePatent
    formData.applicationDate = res.applicationDate
    formData.authorizationDate = res.authorizationDate
    formData.patentPublishDate = res.patentPublishDate
    formData.abstract = res.abstract
    formData.abstractEn = res.abstractEn
    formData.content = res.content
    formData.contentEn = res.contentEn
  }).finally(() => {
    closeLoading()
  })
}

// 初始化
onMounted(() => {
  // 编辑或查看模式下，获取专利详情
  if (mode.value === 'edit' || mode.value === 'view') {
    fetchPatentDetail()
  }
})
</script>

<style scoped lang="less">
.modify-patent-container {
  height: 100%;
  box-sizing: border-box;
  background-color: #f5f7fa;

  .header-line-wrap {
    margin-bottom: 12px;
  }

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
      margin: 0;
      font-size: 20px;
      color: #303133;
    }

    .header-buttons {
      display: flex;
      gap: 10px;
    }
  }

  .custom-card {
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

    .card-body {
      padding: 20px;

      :deep(.el-form-item__label) {
        font-weight: 500;
      }
    }
  }

  // 内容表单项样式
  .content-form-item {
    :deep(.el-form-item__label) {
      height: 40px;
      line-height: 40px;
    }

    .textarea-wrapper {
      width: 100%;
    }
  }

  // 简约标签页样式
  :deep(.simple-tabs) {
    width: 100%;
    box-shadow: none;
    border: none;

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
        background-color: transparent;

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

    .el-tabs__nav {
      border: none !important;
    }
  }
}
</style>
