<template>
  <div class="register-page">
    <el-form ref="registerFormRef" :model="registerForm" :rules="rules">
      <el-form-item prop="username">
        <el-input
          v-model="registerForm.username"
          placeholder="用户名"
          name="23"
          age="wewe"
        />
      </el-form-item>
      <el-form-item prop="password">
        <el-input
          v-model="registerForm.password"
          type="password"
          placeholder="密码"
        />
      </el-form-item>
      <el-form-item prop="confirmPassword">
        <el-input
          v-model="registerForm.confirmPassword"
          type="password"
          placeholder="确认密码"
        />
      </el-form-item>
      <el-form-item prop="email">
        <el-input v-model="registerForm.email" placeholder="邮箱" />
      </el-form-item>
      <el-form-item prop="phone">
        <el-input v-model="registerForm.phone" placeholder="手机号码" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="submitForm">注册</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'

const registerFormRef = ref(null)
const registerForm = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  email: '',
  phone: ''
})

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码至少6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== registerForm.password) {
          callback(new Error('两次输入密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号码', trigger: 'blur' },
    {
      pattern: /^1[3-9]\d{9}$/,
      message: '请输入有效的手机号码',
      trigger: 'blur'
    }
  ]
}

const submitForm = () => {
  if (!registerFormRef.value) return
  registerFormRef.value.validate((valid: boolean) => {
    if (valid) {
      ElMessage.success('注册成功')
    } else {
      ElMessage.error('请检查输入信息')
    }
  })
}
</script>

<style scoped>
.register-page {
  max-width: 400px;
  margin: 100px auto;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 4px;
}
</style>
