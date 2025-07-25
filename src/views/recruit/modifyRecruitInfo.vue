<template>
  <div class="modify-recruit-info-container">
    <!-- 页面头部 -->
    <div class="header">
      <div class="left">
        <div class="blue-bar"></div>
        <span class="title">{{ mode === 'add' ? '新增招聘信息' : '编辑招聘信息' }}</span>
      </div>
      <div class="right">
        <el-tooltip content="保存" placement="top">
          <el-button
            :loading="loading"
            type="primary"
            circle
            class="icon-button"
            @click="submitForm"
          >
            <el-icon><Check /></el-icon>
          </el-button>
        </el-tooltip>
      </div>
    </div>

    <!-- 表单内容 -->
    <div class="form-container">
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        labelWidth="120px"
        class="recruit-form"
      >
        <!-- 招聘类型 -->
        <el-form-item label="招聘类型" prop="recruitmentType" required>
          <el-select
            v-model="formData.recruitmentType"
            placeholder="请选择招聘类型"
            style="width: 100%"
            :loading="recruitTypeLoading"
            class="modern-select"
          >
            <el-option
              v-for="item in recruitTypeList"
              :key="item.dictId"
              :label="item.dictValue"
              :value="item.dictId"
            />
          </el-select>
        </el-form-item>

        <!-- 中文内容 -->
        <el-form-item prop="content" required>
          <template #label>
            <span class="required-label">中文内容</span>
          </template>
          <TinyMceEditor
            v-model="formData.content"
            :height="450"
            :placeholder="'请输入中文内容'"
          />
        </el-form-item>

        <!-- 英文内容 -->
        <el-form-item prop="contentEn">
          <template #label>
            <span class="label">英文内容</span>
          </template>
          <TinyMceEditor
            v-model="formData.contentEn"
            :height="450"
            :placeholder="'请输入英文内容（选填）'"
          />
        </el-form-item>
      </el-form>
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
import pinia from '@/stores'
import { useDictInfo } from '@/hooks/useDictionary'

const tabsStore = useTabsStore(pinia)

const { changeLoading, closeLoading, loading } = useLoading()

// 路由相关
const route = useRoute()
const router = useRouter()

// 页面模式：add-新增，edit-编辑
const mode = ref(route.query.mode as string || 'add')
const recruitId = ref(route.query.id as string)

// 使用字典获取招聘类型选项
const { dictList: recruitTypeList, loading: recruitTypeLoading } = useDictInfo('recruitment_type', true)

// 表单数据
const formRef = ref()
const formData = reactive({
  id: '',
  recruitmentType: '', // 招聘类型
  content: '', // 中文内容
  contentEn: '' // 英文内容
})

// 表单验证规则
const formRules = {
  recruitmentType: [
    { required: true, message: '请选择招聘类型', trigger: 'change' }
  ],
  content: [
    { required: true, message: '请输入中文内容', trigger: 'blur' }
  ]
  // 移除英文内容必填验证
}

// 提交表单
const submitForm = () => {
  if (!formRef.value) return

  formRef.value.validate((valid: boolean, fields: any) => {
    if (valid) {
      // 显示加载状态
      changeLoading(true)
      // 准备提交的数据
      const submitData = {
        ...formData
      }

      // 根据模式选择接口
      const url = '/api/recruit/save'

      service.post<any>(url, submitData).then(() => {
        ElMessage.success(mode.value === 'add' ? '新增成功' : '更新成功')

        // 获取当前tab路径
        const currentPath = tabsStore.getCurTabPath
        // 关闭当前标签
        if (currentPath) {
          tabsStore.delCurTab(currentPath, router, '/recruitManage')
        }
      }).finally(() => {
        closeLoading()
      })
    }
  })
}

// 获取招聘信息详情
const getRecruitDetail = () => {
  if (!recruitId.value) return

  changeLoading(true)

  // 后端API实际返回结构应据实调整
  service.post<any>('/api/recruit/detail', { id: recruitId.value }).then((res: any) => {
    const data = res || {}
    Object.assign(formData, {
      id: data.id,
      recruitmentType: data.recruitmentType,
      content: data.content,
      contentEn: data.contentEn
    })
  }).finally(() => {
    closeLoading()
  })
}

// 组件挂载时根据模式加载数据
onMounted(() => {
  if (mode.value === 'edit' && recruitId.value) {
    getRecruitDetail()
  }
})
</script>

<style lang="less" scoped>
.modify-recruit-info-container {
  width: 100%;
  min-height: @contentHeight;
  background-color: #fff;

  .header {
    position: sticky;
    top: 0;
    left: 0;
    z-index: 10;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid #ebeef5;
    background-color: #fff;
    border-radius: 8px 8px 0 0;

    .left {
      display: flex;
      align-items: center;

      .blue-bar {
        width: 4px;
        height: 18px;
        background-color: #3370ff;
        margin-right: 10px;
        border-radius: 2px;
      }

      .title {
        font-size: 16px;
        color: #303133;
        font-weight: 600;
      }
    }

    .right {
      .el-button {
        padding: 10px;
        border-radius: 50%;
        font-weight: 500;
        transition: all 0.3s;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(51, 112, 255, 0.2);
        }

        &.icon-button {
          font-size: 18px;
        }
      }
    }
  }

  .form-container {
    padding: 24px;

    .recruit-form {
      .el-form-item {
        margin-bottom: 24px;
      }

      .form-tip {
        color: #909399;
        font-size: 12px;
        line-height: 1.5;
        margin-top: 8px;
        padding-left: 4px;
      }

      :deep(.el-select) {
        &.modern-select {
          .el-input__wrapper {
            padding: 4px 12px;
            border-radius: 6px;
            transition: all 0.3s;

            &:hover {
              box-shadow: 0 0 0 1px #3370ff inset;
            }

            &.is-focus {
              box-shadow: 0 0 0 1px #3370ff inset, 0 4px 10px rgba(51, 112, 255, 0.1);
            }
          }
        }
      }
    }
  }
}
</style>
