<template>
  <div class="modify-notice-container">
    <div class="card-header">
      <h2>{{ pageTitle }}</h2>
      <div class="header-buttons">
        <el-tooltip content="保存" placement="top" :showAfter="300">
          <el-button
            type="primary"
            circle
            :loading="false"
            @click="submitForm"
          >
            <el-icon><Check /></el-icon>
          </el-button>
        </el-tooltip>
      </div>
    </div>

    <div class="custom-card box-card">
      <div class="card-body">
        <el-form
          ref="formRef"
          :model="formData"
          :rules="formRules"
          :labelWidth="120"
        >
          <!-- 通知标题 - 中文 -->
          <el-form-item label="通知标题(中)" prop="title">
            <el-input v-model="formData.title" placeholder="请输入中文通知标题" />
          </el-form-item>

          <!-- 通知标题 - 英文 -->
          <el-form-item label="通知标题(英)" prop="titleEn">
            <el-input v-model="formData.titleEn" placeholder="请输入英文通知标题" />
          </el-form-item>

          <!-- 通知类型 -->
          <el-form-item label="通知类型" prop="noticeType">
            <el-select v-model="formData.noticeType" placeholder="请选择通知类型" @change="handleTypeChange">
              <el-option
                v-for="item in noticeTypeList"
                :key="item.dictId"
                :label="item.dictValue"
                :value="item.dictId"
              />
            </el-select>
          </el-form-item>

          <!-- 重要程度 -->
          <el-form-item label="重要程度" prop="importance">
            <el-select v-model="formData.importance" placeholder="请选择重要程度">
              <el-option
                v-for="item in importanceList"
                :key="item.dictId"
                :label="item.dictValue"
                :value="item.dictId"
              />
            </el-select>
          </el-form-item>

          <!-- 是否置顶 -->
          <el-form-item label="是否置顶" prop="isTop">
            <el-radio-group v-model="formData.isTop">
              <el-radio :label="0">否</el-radio>
              <el-radio :label="1">是</el-radio>
            </el-radio-group>
          </el-form-item>

          <!-- 文本类型的通知内容 -->
          <template v-if="isTextType">
            <!-- 通知内容 - 中文 -->
            <el-form-item label="通知内容(中)" prop="content" required>
              <TinyMceEditor
                v-model="formData.content"
                :height="350"
                :placeholder="'请输入中文通知内容'"
              />
            </el-form-item>

            <!-- 通知内容 - 英文 -->
            <el-form-item label="通知内容(英)" prop="contentEn">
              <TinyMceEditor
                v-model="formData.contentEn"
                :height="350"
                :placeholder="'请输入英文通知内容'"
              />
            </el-form-item>
          </template>

          <!-- 超链接类型的通知内容 -->
          <template v-else>
            <!-- 超链接地址 -->
            <el-form-item label="链接地址" prop="linkUrl" required>
              <el-input v-model="formData.linkUrl" placeholder="请输入超链接地址" />
              <div class="form-tip">链接地址需要以http://或https://开头的完整URL</div>
            </el-form-item>
          </template>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Check } from '@element-plus/icons-vue'
import TinyMceEditor from '@/components/global/tinyMceEditor.vue'
import service from '@/utils/services'
import { useDictionary } from '@/hooks/useDictionary'
import useLoading from '@/hooks/useLoading'
import { useTabsStore } from '@/stores/menuTabs'
import pinia from '@/stores'

const tabsStore = useTabsStore(pinia)

const { changeLoading, closeLoading } = useLoading()

// 定义通知数据接口
interface NoticeData {
  id: string | number
  title: string
  titleEn: string
  noticeType: string | number
  importance: string | number
  content: string
  contentEn: string
  linkUrl?: string
  status: number
  isTop: number
  [key: string]: any
}

// 路由相关
const route = useRoute()
const router = useRouter()

// 页面模式：add-新增，edit-编辑
const mode = ref(route.query.mode as string || 'add')
const noticeId = ref(route.query.id as string)

// 页面标题
const pageTitle = computed(() => {
  if (route.query.title) {
    return route.query.title as string
  }

  switch (mode.value) {
    case 'add': return '新增通知'
    case 'edit': return '编辑通知'
    default: return '通知信息'
  }
})

// 字典数据
const { dictList: noticeTypeList } = useDictionary({
  dictType: 'notice_type',
  autoLoad: true
})

const { dictList: importanceList } = useDictionary({
  dictType: 'notice_importance',
  autoLoad: true
})

// 表单数据
const formRef = ref()
const formData = reactive<{
  id: string | number
  title: string
  titleEn: string
  noticeType: string | number
  importance: string | number
  content: string
  contentEn: string
  linkUrl: string
  status?: number
  isTop: number
}>({
  id: '',
  title: '', // 中文标题
  titleEn: '', // 英文标题
  noticeType: '2002', // 通知类型（默认为文本类型）
  importance: '3001', // 默认为普通
  content: '', // 中文内容
  contentEn: '', // 英文内容
  linkUrl: '', // 链接地址
  status: 0, // 状态：0-未发布，1-已发布
  isTop: 0 // 是否置顶：0-否，1-是
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
  title: [{ required: true, message: '请输入中文通知标题', trigger: 'blur' }],
  titleEn: [{ required: false, message: '请输入英文通知标题', trigger: 'blur' }],
  noticeType: [{ required: true, message: '请选择通知类型', trigger: 'change' }],
  importance: [{ required: true, message: '请选择重要程度', trigger: 'change' }],
  linkUrl: [
    { required: true, message: '请输入链接地址', trigger: 'blur' },
    { validator: validateUrl, trigger: 'blur' }
  ],
  content: [
    { validator: (rule: any, value: string, callback: any) => {
      const type = String(formData.noticeType)
      if (type === '2002' && !value) {
        // 文本类型，内容不能为空
        callback(new Error('请输入中文通知内容'))
      } else {
        callback()
      }
    }, trigger: 'blur' }
  ],
  contentEn: [{ required: false, message: '请输入英文通知内容', trigger: 'blur' }]
}

// 是否为文本类型通知（用于决定显示富文本编辑器还是链接输入框）
// 通知类型字典中，2002为文本类型，2001为超链接类型
const isTextType = computed(() => {
  // 将任何类型的值转换为字符串进行比较
  const type = formData.noticeType
  return type === '2002'
})

// 处理通知类型变更
const handleTypeChange = () => {
  // 切换类型时不再清空内容，保留原有数据
  // 内容验证将在提交表单时进行
}

// 获取通知详情
const fetchNoticeDetail = () => {
  if (!noticeId.value) return

  changeLoading(true)

  service.post(`/api/notice/detail`, {
    id: noticeId.value
  }).then((res: any) => {
    if (res) {
      const noticeData = res as NoticeData
      formData.id = noticeData.id
      formData.title = noticeData.title
      formData.titleEn = noticeData.titleEn
      formData.noticeType = noticeData.noticeType
      formData.importance = noticeData.importance
      formData.isTop = noticeData.isTop || 0

      // 根据通知类型设置对应的内容字段
      if (String(noticeData.noticeType) === '2002') {
      // 文本类型
        formData.content = noticeData.content
        formData.contentEn = noticeData.contentEn
      } else {
      // 超链接类型
        formData.linkUrl = noticeData.linkUrl || noticeData.content // 兼容旧数据
      }

      formData.status = noticeData.status
    }
  }).finally(() => {
    closeLoading()
  })
}

// 提交表单
const submitForm = () => {
  if (!formRef.value) return

  formRef.value.validate((valid: boolean) => {
    if (!valid) return

    // 创建一个新对象来构建提交参数，而不是修改原对象
    const params: any = {
      id: formData.id,
      title: formData.title,
      titleEn: formData.titleEn,
      noticeType: formData.noticeType,
      importance: formData.importance,
      isTop: formData.isTop
      // status字段不需要提交
    }

    // 根据通知类型处理提交的字段
    if (String(formData.noticeType) === '2002') {
      // 文本类型，提交富文本内容
      params.content = formData.content
      params.contentEn = formData.contentEn
    } else {
      // 超链接类型，提交链接地址到content字段
      params.content = formData.linkUrl
    }

    changeLoading(true)
    service['post']('/api/notice/save', params).then((res: any) => {
      if (res) {
        ElMessage.success(`${formData.id ? '更新' : '添加'}通知成功`)
      }
    }).finally(() => {
      closeLoading()
      tabsStore.delCurTab(route.fullPath, router, '/noticeManage')
    })
  })
}

// 页面初始化
onMounted(() => {
  if (mode.value === 'edit') {
    fetchNoticeDetail()
  }
})
</script>

<style scoped lang="less">
.modify-notice-container {
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

  .form-tip {
    font-size: 12px;
    color: #909399;
    margin-top: 5px;
    line-height: 1.2;
  }

  :deep(.el-input__wrapper),
  :deep(.el-textarea__inner) {
    border-radius: 6px;
  }
}
</style>
