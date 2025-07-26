<template>
  <div class="modify-dynamic-container">
    <!-- 页面头部 -->
    <div class="card-header">
      <h2>{{ mode === 'edit' ? '编辑动态' : '新增动态' }}</h2>
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
            :loading="loading"
            @click="submitForm"
          >
            <el-icon><Check /></el-icon>
          </el-button>
        </el-tooltip>
      </div>
    </div>

    <!-- 表单内容 -->
    <div class="custom-card box-card">
      <div class="card-body">
        <el-form
          ref="formRef"
          :model="formData"
          :rules="formRules"
          labelWidth="100px"
          class="dynamic-form"
        >
          <!-- 标题 -->
          <el-form-item label="动态标题" prop="title" required>
            <el-input
              v-model="formData.title"
              placeholder="请输入动态标题"
              maxlength="100"
              showWordLimit
            />
          </el-form-item>

          <!-- 英文标题 -->
          <el-form-item label="英文标题" prop="titleEn">
            <el-input
              v-model="formData.titleEn"
              placeholder="请输入英文标题"
              maxlength="100"
              showWordLimit
            />
          </el-form-item>

          <!-- 动态类型 -->
          <el-form-item label="类型" prop="dynamicType" required>
            <el-select
              v-model="formData.dynamicType"
              placeholder="请选择类型"
              style="width: 100%"
            >
              <el-option
                v-for="item in dynamicTypeList"
                :key="item.dictId"
                :label="item.dictValue"
                :value="item.dictId"
              />
            </el-select>
          </el-form-item>

          <!-- 中文内容 -->
          <el-form-item label="中文内容" prop="content" required>
            <TinyMceEditor
              v-model="formData.content"
              :height="380"
              :placeholder="'请输入中文动态内容'"
            />
          </el-form-item>

          <!-- 英文内容 -->
          <el-form-item label="英文内容" prop="contentEn">
            <TinyMceEditor
              v-model="formData.contentEn"
              :height="380"
              :placeholder="'请输入英文动态内容'"
            />
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Check } from '@element-plus/icons-vue'
import TinyMceEditor from '@/components/global/tinyMceEditor.vue'
import service from '@/utils/services'
import useLoading from '@/hooks/useLoading'
import { useTabsStore } from '@/stores/menuTabs'
import { useDictionary } from '@/hooks/useDictionary'
import pinia from '@/stores'

const tabsStore = useTabsStore(pinia)

// 获取动态类型字典数据
const { dictList: dynamicTypeList } = useDictionary({
  dictType: 'dynamic_type',
  autoLoad: true
})

const { changeLoading, closeLoading, loading } = useLoading()

// 路由相关
const route = useRoute()
const router = useRouter()

// 页面模式：add-新增，edit-编辑
const mode = ref(route.query.mode as string || 'add')
const dynamicId = ref(route.query.id as string)

// 表单数据
const formRef = ref()
const formData = reactive<{
  id: string | number
  dynamicType: string
  title: string
  titleEn: string
  content: string
  contentEn: string
  publishStatus?: string
}>({
  id: '',
  dynamicType: '6001', // 默认为科研动态
  title: '', // 中文标题
  titleEn: '', // 英文标题
  content: '', // 中文内容
  contentEn: '', // 英文内容
  publishStatus: '0' // 状态：0-未发布，1-已发布
})

// 表单验证规则
const formRules = {
  dynamicType: [
    { required: true, message: '请选择类型', trigger: 'change' }
  ],
  title: [
    { required: true, message: '请输入动态标题', trigger: 'blur' },
    { max: 100, message: '标题长度不能超过100个字符', trigger: 'blur' }
  ],
  content: [
    { required: true, message: '请输入中文动态内容', trigger: 'blur' }
  ]
}

// 获取动态详情数据
const getDynamicDetail = () => {
  if (!dynamicId.value) {
    return
  }

  changeLoading(true)
  service.post('/api/dynamic/detail', {
    id: dynamicId.value
  }).then((res: any) => {
    if (res) {
      formData.id = res.id
      formData.title = res.title
      formData.titleEn = res.titleEn
      formData.dynamicType = res.dynamicType
      formData.content = res.content
      formData.contentEn = res.contentEn
      formData.publishStatus = res.publishStatus
    }
  }).finally(() => {
    closeLoading()
  })
}

// 提交表单
const submitForm = () => {
  formRef.value?.validate((valid: boolean) => {
    if (!valid) {
      return
    }

    changeLoading(true)
    // 区分新增和编辑
    const apiUrl = '/api/dynamic/save'

    service.post(apiUrl, formData).then(() => {
      ElMessage.success('保存成功')
      // 获取当前tab路径
      const currentPath = tabsStore.getCurTabPath
      // 关闭当前标签
      if (currentPath) {
        tabsStore.delCurTab(currentPath, router, '/dynamicManage')
      }
    }).finally(() => {
      closeLoading()
    })
  })
}

onMounted(() => {
  // 如果是编辑模式，获取数据
  if (mode.value === 'edit') {
    getDynamicDetail()
  }
})
</script>

<style scoped lang="less">
.modify-dynamic-container {
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
