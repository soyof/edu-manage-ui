<template>
  <div class="modify-lab-profile-container">
    <div class="content-wrap">
      <!-- 页面头部 -->
      <div class="header">
        <div class="left">
          <div class="blue-bar"></div>
          <span class="title">新增简介</span>
        </div>
        <div class="right">
          <el-button :loading="submitting" type="primary" @click="submitForm">
            保存
          </el-button>
        </div>
      </div>

      <!-- 表单内容 -->
      <div class="form-container">
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

          <!-- 内容区域 -->
          <div class="tabs-container">
            <div class="tabs-header">
              <div
                class="tab-item"
                :class="{ active: activeTab === 'zh' }"
                @click="activeTab = 'zh'"
              >
                中文内容
              </div>
              <div
                class="tab-item"
                :class="{ active: activeTab === 'en' }"
                @click="activeTab = 'en'"
              >
                英文内容
              </div>
            </div>

            <div class="tabs-content">
              <!-- 中文内容 -->
              <div v-show="activeTab === 'zh'">
                <el-form-item prop="content" required class="content-item">
                  <template #label>
                    <span class="required-label">中文内容</span>
                  </template>
                  <TinyMceEditor
                    v-model="formData.content"
                    :height="380"
                    :placeholder="'请输入中文简介内容'"
                  />
                </el-form-item>
              </div>

              <!-- 英文内容 -->
              <div v-show="activeTab === 'en'">
                <el-form-item prop="contentEn" class="content-item">
                  <template #label>
                    <span>英文内容</span>
                  </template>
                  <TinyMceEditor
                    v-model="formData.contentEn"
                    :height="380"
                    :placeholder="'请输入英文简介内容'"
                  />
                </el-form-item>
              </div>
            </div>
          </div>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import TinyMceEditor from '@/components/global/tinyMceEditor.vue'
import service from '@/utils/services'
import useLoading from '@/hooks/useLoading'
import { useTabsStore } from '@/stores/menuTabs'
import pinia from '@/stores'

const tabsStore = useTabsStore(pinia)
const activeTab = ref('zh')

const { changeLoading, closeLoading } = useLoading({
  target: '.content-wrap'
})

// 状态管理
const submitting = ref(false)

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
  title: string
  content: string
  contentEn: string
  status?: number
}>({
  id: '',
  title: '', // 标题
  content: '', // 中文内容
  contentEn: '', // 英文内容
  status: 0 // 状态：0-未发布，1-已发布
})

// 表单验证规则
const formRules = {
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
    submitting.value = true

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
      submitting.value = false
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
  width: 100%;
  height: 100%;

  .content-wrap {
    background-color: #fff;
    padding: 0;
    box-sizing: border-box;
    height: 100%;
    min-height: @contentHeight;

    .header {
      position: sticky;
      top: 0;
      left: 0;
      z-index: 10;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 15px;
      border-bottom: 1px solid #ebeef5;
      background-color: #fff;

      .left {
        display: flex;
        align-items: center;

        .blue-bar {
          width: 3px;
          height: 16px;
          background-color: #3370ff;
          margin-right: 8px;
        }

        .title {
          font-size: 14px;
          color: #303133;
          font-weight: 500;
        }
      }

      .right {
        .el-button {
          padding: 9px 15px;
        }
      }
    }

    .form-container {
      padding: 15px;

      :deep(.el-form-item) {
        &.is-error {
          .tox-tinymce {
            border-color: #f56c6c;
          }
        }
      }

      .lab-profile-form {
        .el-form-item {
          margin-bottom: 22px;
        }
      }

      .tabs-container {
        margin-top: 10px;

        .tabs-header {
          display: flex;
          border-bottom: 1px solid #dcdfe6;
          margin-bottom: 15px;

          .tab-item {
            padding: 8px 16px;
            font-size: 14px;
            cursor: pointer;
            color: #606266;
            margin-right: 10px;
            border: 1px solid transparent;
            border-bottom: none;
            border-radius: 4px 4px 0 0;

            &.active {
              color: #3370ff;
              background-color: #fff;
              border-color: #dcdfe6;
              border-bottom-color: #fff;
              margin-bottom: -1px;
            }
          }
        }

        .content-item {
          margin-bottom: 0;
        }
      }
    }
  }
}
</style>
