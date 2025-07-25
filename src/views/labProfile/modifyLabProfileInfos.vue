<template>
  <div class="modify-lab-profile-container">
    <!-- 页面头部 -->
    <div class="card-header">
      <h2>{{ mode === 'edit' ? '编辑简介' : '新增简介' }}</h2>
      <div class="header-buttons">
        <el-tooltip content="保存" placement="top" :showAfter="300">
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
          class="lab-profile-form"
        >
          <!-- 标题 -->
          <el-form-item label="简介标题" prop="title" required>
            <el-input
              v-model="formData.title"
              placeholder="请输入简介标题"
              maxlength="100"
              showWordLimit
            />
          </el-form-item>

          <!-- 简介类型 -->
          <el-form-item label="类型" prop="profileType" required>
            <el-select
              v-model="formData.profileType"
              placeholder="请选择类型"
              :disabled="mode === 'edit'"
              style="width: 100%"
            >
              <el-option
                v-for="item in introTypeList"
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
              :placeholder="'请输入中文简介内容'"
            />
          </el-form-item>

          <!-- 英文内容 -->
          <el-form-item label="英文内容" prop="contentEn">
            <TinyMceEditor
              v-model="formData.contentEn"
              :height="380"
              :placeholder="'请输入英文简介内容'"
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

// 获取简介类型字典数据
const { dictList: introTypeList } = useDictionary({
  dictType: 'intro_type',
  autoLoad: true
})

const { changeLoading, closeLoading, loading } = useLoading()

// 路由相关
const route = useRoute()
const router = useRouter()

// 页面模式：add-新增，edit-编辑
const mode = ref(route.query.mode as string || 'add')
const profileId = ref(route.query.id as string)

// 表单数据
const formRef = ref()
const formData = reactive<{
  id: string | number
  profileType: string
  title: string
  content: string
  contentEn: string
  status?: number
}>({
  id: '',
  profileType: '5001', // 简介类型
  title: '', // 标题
  content: '', // 中文内容
  contentEn: '', // 英文内容
  status: 0 // 状态：0-未发布，1-已发布
})

// 表单验证规则
const formRules = {
  profileType: [
    { required: true, message: '请选择类型', trigger: 'change' }
  ],
  title: [
    { required: true, message: '请输入简介标题', trigger: 'blur' },
    { max: 100, message: '标题长度不能超过100个字符', trigger: 'blur' }
  ],
  content: [
    { required: true, message: '请输入中文简介内容', trigger: 'blur' }
  ]
}

// 提交表单
const submitForm = () => {
  if (!formRef.value) return

  formRef.value.validate().then(() => {
    // 显示加载状态
    changeLoading(true)

    // 准备提交的数据
    const submitData = {
      ...formData
    }

    // 根据模式选择接口
    const url = '/api/labProfile/save'

    service.post<any>(url, submitData).then(() => {
      ElMessage.success(mode.value === 'add' ? '新增成功' : '更新成功')

      // 获取当前tab路径
      const currentPath = tabsStore.getCurTabPath
      // 关闭当前标签
      if (currentPath) {
        tabsStore.delCurTab(currentPath, router, '/labProfileManage')
      }
    }).finally(() => {
      closeLoading()
    })
  })
}

// 获取简介详情
const getProfileDetail = () => {
  if (!profileId.value) return

  changeLoading(true)

  // 后端API实际返回结构应据实调整
  service.post<any>('/api/labProfile/detail', { id: profileId.value }).then((res: any) => {
    // 更新表单数据
    Object.assign(formData, {
      id: res.id,
      profileType: res.profileType || '5001',
      title: res.title,
      content: res.content,
      contentEn: res.contentEn,
      status: res.publishStatus
    })
  }).finally(() => {
    closeLoading()
  })
}

// 组件挂载时根据模式加载数据
onMounted(() => {
  if (mode.value === 'edit' && profileId.value) {
    getProfileDetail()
  }
})
</script>

<style lang="less" scoped>
.modify-lab-profile-container {
  position: relative;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  background-color: #f5f7fa;

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

    .header-buttons {
      .el-button {
        padding: 10px;
        border-radius: 50%;
        font-weight: 500;
        transition: all 0.3s;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(51, 112, 255, 0.2);
        }
      }
    }
  }

  .custom-card {
    background-color: #fff;
    padding: 20px;
    border-radius: 8px;
    transition: all 0.3s ease;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    margin-top: 12px;

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

  :deep(.el-input__wrapper),
  :deep(.el-textarea__inner) {
    border-radius: 6px;
  }
}
</style>
