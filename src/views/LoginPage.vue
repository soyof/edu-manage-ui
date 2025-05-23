<template>
  <div class="login-container">
    <div class="login-box">
      <h1 class="title">欢迎使用后台管理系统</h1>
      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="rules"
        class="login-form"
      >
        <el-form-item prop="username">
          <el-input v-model="loginForm.username" placeholder="用户名" prefixIcon="el-icon-user" />
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="loginForm.password" type="password" placeholder="密码"
            prefixIcon="el-icon-lock"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="login-btn" @click="submitForm">登录</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, type FormInstance } from 'element-plus'
const loginFormRef = ref<FormInstance | null>(null) // 修改类
const loginForm = reactive({ username: '', password: '', captcha: '' })

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  captcha: [{ required: true, message: '请输入验证码', trigger: 'blur' }]
}

const submitForm = () => {
  if (!loginFormRef.value) return
  loginFormRef.value.validate((valid: boolean) => {
    if (valid) {
      ElMessage.success('登录成功')
    } else {
      ElMessage.error('请检查输入信息')
    }
  })
}
</script>

<style lang="less" scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: linear-gradient(to bottom, #c6e2ff, @bgColor);
}

.login-box {
  background-color: #fff;
  padding: 40px;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  width: 400px;
}

.title {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
}

.login-form {
  width: 100%;
}

.captcha-img {
  cursor: pointer;
  height: 40px;
  vertical-align: middle;
}

.login-btn {
  width: 100%;
}
</style>
