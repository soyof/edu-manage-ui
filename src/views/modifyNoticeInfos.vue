<template>
  <div class="modify-notice-container">
    <div class="page-header">
      <h2>{{ pageTitle }}</h2>
      <div class="header-actions">
        <el-tooltip content="返回" placement="bottom">
          <el-button circle @click="goBack">
            <el-icon><ArrowLeft /></el-icon>
          </el-button>
        </el-tooltip>
        <el-tooltip v-if="!isView" content="保存" placement="bottom">
          <el-button type="primary" circle @click="submitForm">
            <el-icon><Check /></el-icon>
          </el-button>
        </el-tooltip>
      </div>
    </div>

    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      :labelWidth="120"
      :disabled="isView"
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

      <!-- 文本类型的通知内容 -->
      <template v-if="isTextType">
        <!-- 通知内容 - 中文 -->
        <el-form-item label="通知内容(中)" prop="content">
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
        <el-form-item label="链接地址" prop="content">
          <el-input v-model="formData.content" placeholder="请输入超链接地址" />
          <div class="form-tip">链接地址需要以http://或https://开头的完整URL</div>
        </el-form-item>
      </template>
    </el-form>

    <!-- 查看模式下的内容展示区域 -->
    <div v-if="isView" class="notice-preview">
      <el-tabs type="border-card">
        <el-tab-pane label="中文内容">
          <h3>{{ formData.title }}</h3>
          <div class="notice-meta">
            <span>类型：{{ getNoticeTypeName(String(formData.noticeType)) }}</span>
            <span>重要程度：{{ getImportanceName(String(formData.importance)) }}</span>
          </div>
          <div v-if="isTextType" class="content-preview" v-html="formData.content"></div>
          <div v-else class="link-preview">
            <a :href="formData.content" target="_blank">{{ formData.content }}</a>
          </div>
        </el-tab-pane>

        <el-tab-pane v-if="formData.titleEn || formData.contentEn" label="英文内容">
          <h3>{{ formData.titleEn || '无英文标题' }}</h3>
          <div class="notice-meta">
            <span>Type：{{ getNoticeTypeName(String(formData.noticeType)) }}</span>
            <span>Importance：{{ getImportanceName(String(formData.importance)) }}</span>
          </div>
          <div v-if="isTextType" class="content-preview" v-html="formData.contentEn || '无英文内容'"></div>
          <div v-else class="link-preview">
            <a :href="formData.content" target="_blank">{{ formData.content }}</a>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Check, ArrowLeft } from '@element-plus/icons-vue'
import TinyMceEditor from '@/components/global/tinyMceEditor.vue'
import service from '@/utils/services'
import { useDictionary } from '@/hooks/useDictionary'

// 定义通知数据接口
interface NoticeData {
  id: string | number
  title: string
  titleEn: string
  noticeType: string | number
  importance: string | number
  content: string
  contentEn: string
  status: number
  receiver?: string
  [key: string]: any
}

// 路由相关
const route = useRoute()
const router = useRouter()

// 页面模式：add-新增，edit-编辑，view-查看
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
    case 'view': return '查看通知'
    default: return '通知信息'
  }
})

// 是否为查看模式
const isView = computed(() => mode.value === 'view')

// 字典数据
const { dictList: noticeTypeList, getDictLabel: getNoticeTypeName } = useDictionary({
  dictType: 'notice_type',
  autoLoad: true
})

const { dictList: importanceList, getDictLabel: getImportanceName } = useDictionary({
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
  status: number
  receiver: string
}>({
  id: '',
  title: '', // 中文标题
  titleEn: '', // 英文标题
  noticeType: '2001', // 通知类型
  importance: '3001', // 默认为普通
  content: '', // 中文内容
  contentEn: '', // 英文内容
  status: 0, // 状态：0-未发布，1-已发布
  receiver: 'all' // 接收对象，默认所有人
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
  content: [
    { required: false, message: '请输入中文通知内容', trigger: 'blur' },
    { validator: (rule: any, value: string, callback: any) => {
      const type = String(formData.noticeType)
      if (type === '2002' && !value) {
        callback(new Error('请输入链接地址'))
      } else if (type === '2002') {
        validateUrl(rule, value, callback)
      } else {
        callback()
      }
    }, trigger: 'blur' }
  ],
  contentEn: [{ required: false, message: '请输入英文通知内容', trigger: 'blur' }]
}

// 是否为文本类型通知（用于决定显示富文本编辑器还是链接输入框）
// 假设通知类型字典中，文本类型的ID为1，超链接类型的ID为2
const isTextType = computed(() => {
  // 将任何类型的值转换为字符串进行比较
  const type = formData.noticeType
  return type === '2002'
})

// 处理通知类型变更
const handleTypeChange = () => {
  // 当类型变更时，清空内容
  formData.content = ''
  formData.contentEn = ''
}

// 获取通知详情
const fetchNoticeDetail = async() => {
  if (!noticeId.value) return

  try {
    const res = await service.get(`/api/notice/${noticeId.value}`)
    if (res.code === 200 && res.data) {
      const noticeData = res.data as NoticeData
      formData.id = noticeData.id
      formData.title = noticeData.title
      formData.titleEn = noticeData.titleEn
      formData.noticeType = noticeData.noticeType
      formData.importance = noticeData.importance
      formData.content = noticeData.content
      formData.contentEn = noticeData.contentEn
      formData.status = noticeData.status
      formData.receiver = noticeData.receiver || 'all'
    } else {
      ElMessage.error('获取通知详情失败')
    }
  } catch (error) {
    console.error('获取通知详情出错:', error)
    ElMessage.error('获取通知详情出错')
  }
}

// 提交表单
const submitForm = async() => {
  if (!formRef.value) return

  await formRef.value.validate(async(valid: boolean) => {
    if (!valid) return

    try {
      const apiUrl = formData.id ? '/api/notice/update' : '/api/notice/add'
      const method = formData.id ? 'put' : 'post'

      const res = await service[method](apiUrl, formData)

      if (res.code === 200) {
        ElMessage.success(`${formData.id ? '更新' : '添加'}通知成功`)
        goBack()
      } else {
        ElMessage.error(res.message || `${formData.id ? '更新' : '添加'}通知失败`)
      }
    } catch (error) {
      console.error('保存通知出错:', error)
      ElMessage.error('操作失败，请稍后重试')
    }
  })
}

// 返回上一页
const goBack = () => {
  router.push('/notice-manage')
}

// 页面初始化
onMounted(() => {
  if (mode.value === 'edit' || mode.value === 'view') {
    fetchNoticeDetail()
  }
})
</script>

<style scoped lang="less">
.modify-notice-container {
  position: relative;
  padding: 8px 16px;
  background-color: @pageBgColor;

    .page-header {
    position: sticky;
    top: 0;
    left: 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0;
    background-color: @pageBgColor;
    z-index: 11;

    h2 {
      margin: 0;
    }

    .header-actions {
      display: flex;
      gap: 10px;

      .el-button.is-circle {
        margin-left: 0;
      }
    }
  }

  .form-tip {
    font-size: 12px;
    color: #909399;
    margin-top: 5px;
    line-height: 1.2;
  }

  // 非必填项标签样式
  :deep(.el-form-item) {
    margin-bottom: 22px;

    &.is-required {
      .el-form-item__label::before {
        content: '*';
        color: var(--el-color-danger);
        margin-right: 4px;
      }
    }
  }

  .notice-preview {
    margin-top: 20px;
    background-color: #fff;
    border-radius: 4px;
    box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);

    h3 {
      margin-top: 10px;
      margin-bottom: 15px;
      font-size: 18px;
      font-weight: bold;
    }

    .notice-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 20px;
      margin-bottom: 15px;
      color: #666;
      font-size: 14px;
      padding-bottom: 10px;
      border-bottom: 1px solid #ebeef5;

      span {
        margin-right: 15px;
      }
    }

    .content-preview {
      padding: 10px;
      line-height: 1.8;
      min-height: 200px;
    }

    .link-preview {
      padding: 10px;
      word-break: break-all;

      a {
        color: #409EFF;
        text-decoration: underline;

        &:hover {
          color: #66b1ff;
        }
      }
    }
  }
}
</style>
