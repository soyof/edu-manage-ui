<template>
  <div v-loading="loading">
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      appendToBody
      draggable
      :closeOnClickModal="false"
      @close="handleClose"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        labelWidth="100px"
        statusIcon
      >
        <el-form-item label="用户编号" prop="userId">
          <el-input v-model="form.userId" placeholder="请输入用户编号（英文+数字或纯英文）" :disabled="config.type !== 'A'" />
        </el-form-item>
        <el-form-item label="用户名称" prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名称" :disabled="isViewMode" />
        </el-form-item>
        <el-form-item label="邮箱地址" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱地址" :disabled="isViewMode" />
        </el-form-item>
        <el-form-item label="手机号码" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入手机号码" :disabled="isViewMode" />
        </el-form-item>
        <el-form-item label="职称" prop="title">
          <el-select
            v-model="form.title"
            filterable
            clearable
            placeholder="请选择职称"
            :disabled="isViewMode"
          >
            <el-option
              v-for="item in userTitleList"
              :key="item.dictId"
              :label="item.dictValue"
              :value="item.dictId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select
            v-model="form.role"
            filterable
            clearable
            placeholder="请选择角色"
            :disabled="isViewMode"
          >
            <el-option
              v-for="item in ROLE_LIST"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="实验室主页" prop="labHomepage">
          <el-input v-model="form.labHomepage" placeholder="请输入实验室主页URL" :disabled="isViewMode" />
        </el-form-item>
        <el-form-item label="个人主页" prop="personalHomepage">
          <el-input v-model="form.personalHomepage" placeholder="请输入个人主页URL" :disabled="isViewMode" />
        </el-form-item>
        <el-form-item label="用户标签" prop="tags">
          <el-select
            v-model="form.tags"
            multiple
            clearable
            filterable
            allowCreate
            defaultFirstOption
            placeholder="请选择或输入标签"
            :disabled="isViewMode"
          >
            <el-option
              v-for="tag in tagOptions"
              :key="tag"
              :label="tag"
              :value="tag"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="证件照" prop="idPic">
          <IdPhotoUploader
            v-model="form.idPic"
            :userId="form.userId || ''"
            :disabled="isViewMode"
            @uploadSuccess="handleIdPhotoSuccess"
            @uploadError="handleIdPhotoError"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button
            :type="isViewMode ? 'primary' : 'default'"
            @click="handleClose"
          >
            {{ isViewMode ? '关闭' : '取消' }}
          </el-button>
          <el-button
            v-if="!isViewMode"
            :loading="loading"
            type="primary"
            @click="handleSubmit"
          >
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ROLE_LIST } from '@/dic/dic'
import { ElMessage } from 'element-plus'
import service from '@/utils/services'
import { useDictionary } from '@/hooks/useDictionary'
import IdPhotoUploader from './idPhotoUploader.vue'

const { dictList: userTitleList } = useDictionary({
  dictType: 'user_title',
  autoLoad: true
})

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  config: {
    type: Object,
    default: () => ({ type: 'A', info: {}})
  }
})

const emit = defineEmits(['update:visible', 'success'])

const dialogVisible = ref(props.visible)
const loading = ref(false)
const formRef = ref<FormInstance>()

// 判断是否为查看模式
const isViewMode = computed(() => props.config.type === 'V')

// 弹窗标题
const dialogTitle = computed(() => {
  switch (props.config.type) {
    case 'A': return '新增用户'
    case 'E': return '编辑用户'
    case 'V': return '查看用户'
    default: return '用户信息'
  }
})

// 表单数据类型定义
interface UserForm {
  userId: string
  username: string
  email: string
  phone: string
  title: string
  role: string
  labHomepage: string
  personalHomepage: string
  tags: string[]
  idPic: string
  [key: string]: string | string[]
}

// 表单数据
const form = ref<UserForm>({
  userId: '',
  username: '',
  email: '',
  phone: '',
  title: '',
  role: '',
  labHomepage: '',
  personalHomepage: '',
  tags: [],
  idPic: ''
})

// 标签选项
const tagOptions = ref<string[]>([])

// 表单验证规则
const rules = ref<FormRules>({
  userId: [
    { required: true, message: '请输入用户编号', trigger: 'blur' },
    {
      pattern: /^(?![0-9]+$)[a-zA-Z0-9]+$/,
      message: '用户编号只能包含英文+数字或纯英文',
      trigger: 'blur'
    }
  ],
  username: [
    { required: true, message: '请输入用户名称', trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  phone: [
    {
      pattern: /^1(3[0-9]|4[01456879]|5[0-35-9]|6[2567]|7[0-8]|8[0-9]|9[0-35-9])\d{8}$/,
      message: '请输入正确的手机号码',
      trigger: 'blur'
    }
  ],
  labHomepage: [
    { type: 'url', message: '请输入正确的URL地址', trigger: 'blur' }
  ],
  personalHomepage: [
    { type: 'url', message: '请输入正确的URL地址', trigger: 'blur' }
  ]
})

// 监听visible属性变化
watch(() => props.visible, (val) => {
  dialogVisible.value = val
  if (val && props.config.type !== 'A') {
    // 编辑或查看模式下，填充表单数据
    initFormData()
  } else {
    // 新增模式，重置表单
    resetForm()
  }
})

// 监听dialogVisible变化
watch(() => dialogVisible.value, (val) => {
  emit('update:visible', val)
})

// 初始化表单数据
const initFormData = () => {
  if (props.config.info) {
    for (const key in form.value) {
      if (Object.prototype.hasOwnProperty.call(props.config.info, key)) {
        // 特殊处理标签字段
        if (key === 'tags') {
          if (typeof props.config.info[key] === 'string' && props.config.info[key]) {
            // 如果标签字段是字符串，尝试将其转换为数组
            try {
              form.value[key] = props.config.info[key].split(',').map(tag => tag.trim()).filter(Boolean)
            } catch (e) {
              form.value[key] = []
              console.error('处理标签数据出错:', e)
            }
          } else if (Array.isArray(props.config.info[key])) {
            // 如果已经是数组，直接赋值
            form.value[key] = [...props.config.info[key]]
          } else {
            form.value[key] = []
          }

          // 确保标签选项包含当前用户的标签
          form.value.tags.forEach(tag => {
            if (tag && !tagOptions.value.includes(tag)) {
              tagOptions.value.push(tag)
            }
          })
        } else {
          form.value[key] = props.config.info[key]
        }
      }
    }
  }
}

// 重置表单
const resetForm = () => {
  for (const key in form.value) {
    if (key === 'tags') {
      form.value[key] = []
    } else {
      form.value[key] = ''
    }
  }
}

// 处理证件照上传成功
const handleIdPhotoSuccess = (url: string) => {
  form.value.idPic = url
}

// 处理证件照上传错误
const handleIdPhotoError = () => {
  ElMessage.error('证件照上传失败')
}

// 关闭弹窗
const handleClose = () => {
  formRef.value?.resetFields()
  resetForm()
  dialogVisible.value = false
}

// 提交表单
const handleSubmit = async() => {
  if (!formRef.value) return
  await formRef.value.validate(async(valid) => {
    if (valid) {
      loading.value = true

      // 根据操作类型调用不同的API
      const api = props.config.type === 'A' ? '/api/createUser' : '/api/updateUser'

      const submitData: Record<string, any> = { ...form.value }

      // 确保清空后的选择框字段发送空字符串而不是undefined或null
      if (submitData.title === undefined || submitData.title === null) {
        submitData.title = ''
      }

      if (submitData.role === undefined || submitData.role === null) {
        submitData.role = ''
      }

      service.post(api, submitData).then(() => {
        ElMessage.success(props.config.type === 'A' ? '创建成功' : '更新成功')
        emit('success')
        handleClose()
      }).finally(() => {
        loading.value = false
      })
    }
  })
}
</script>

<style lang="less" scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
