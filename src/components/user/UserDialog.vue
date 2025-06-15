<template>
  <el-dialog
    v-model="dialogVisible"
    title="新增用户"
    width="600px"
    appendToBody
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
        <el-input v-model="form.userId" placeholder="请输入用户编号（英文+数字或纯英文）" />
      </el-form-item>
      <el-form-item label="用户名称" prop="username">
        <el-input v-model="form.username" placeholder="请输入用户名称" />
      </el-form-item>
      <el-form-item label="邮箱地址" prop="email">
        <el-input v-model="form.email" placeholder="请输入邮箱地址" />
      </el-form-item>
      <el-form-item label="手机号码" prop="phone">
        <el-input v-model="form.phone" placeholder="请输入手机号码" />
      </el-form-item>
      <el-form-item label="实验室主页" prop="labHomepage">
        <el-input v-model="form.labHomepage" placeholder="请输入实验室主页URL" />
      </el-form-item>
      <el-form-item label="个人主页" prop="personalHomepage">
        <el-input v-model="form.personalHomepage" placeholder="请输入个人主页URL" />
      </el-form-item>
      <el-form-item label="用户标签" prop="tags">
        <el-select
          v-model="form.tags"
          multiple
          filterable
          allowCreate
          defaultFirstOption
          placeholder="请选择或输入标签"
        >
          <el-option
            v-for="tag in tagOptions"
            :key="tag"
            :label="tag"
            :value="tag"
          />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button :loading="loading" type="primary" @click="handleSubmit">
          确定
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, defineEmits, defineProps, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import service from '@/utils/services'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:visible', 'success'])

const dialogVisible = ref(props.visible)
const loading = ref(false)
const formRef = ref<FormInstance>()

// 表单数据
const form = ref({
  userId: '',
  username: '',
  email: '',
  phone: '',
  labHomepage: '',
  personalHomepage: '',
  tags: []
})

// 标签选项
const tagOptions = ref([
  '研究员',
  '教授',
  '学生',
  '工程师',
  '管理员'
])

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
})

// 监听dialogVisible变化
watch(() => dialogVisible.value, (val) => {
  emit('update:visible', val)
})

// 关闭弹窗
const handleClose = () => {
  formRef.value?.resetFields()
  dialogVisible.value = false
}

// 提交表单
const handleSubmit = async() => {
  if (!formRef.value) return
  await formRef.value.validate(async(valid) => {
    if (valid) {
      console.log(form.value)
      // loading.value = true
      // try {
      //   await service.post('/api/createUser', {
      //     ...form.value,
      //     tags: JSON.stringify(form.value.tags)
      //   })
      //   ElMessage.success('创建成功')
      //   emit('success')
      //   handleClose()
      // } catch (error) {
      //   console.error(error)
      // } finally {
      //   loading.value = false
      // }
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
