<template>
  <div class="login-container">
    <div class="login-box">
      <h1 class="title">欢迎使用合成生物研究所管理系统</h1>
      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="rules"
        class="login-form"
      >
        <el-form-item prop="username">
          <el-input v-model="loginForm.username" placeholder="请输入用户名" :prefixIcon="User" />
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            :type="passwordIpsType"
            placeholder="请输入密码"
            :prefixIcon="Lock"
          >
            <template #suffix>
              <el-icon :class="['password-icon', passwordIpsType === 'password' ? '' : 'actives']" :size="16" @click="handleShowPassword">
                <View />
              </el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            class="login-btn"
            :loading="loading"
            @click="submitForm"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, type FormInstance } from 'element-plus'
import { User, Lock, View } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import services from '@/utils/services'
import { encodePwByMd5 } from '@/utils/pwdUtils'
import { useUserInfoStore } from '@/stores/userInfo'
import pinia from '@/stores'

const router = useRouter()
const userStore = useUserInfoStore(pinia)
const loginFormRef = ref<FormInstance | null>(null) // 修改类
const loginForm = reactive({
  username: '',
  password: ''
})
const loading = ref(false)
const passwordIpsType = ref('password')

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ]
}

const handleShowPassword = () => {
  passwordIpsType.value = passwordIpsType.value === 'password' ? 'text' : 'password'
}

const submitForm = () => {
  if (!loginFormRef.value) return
  loginFormRef.value.validate((valid: boolean) => {
    if (valid) {
      loading.value = true
      const params = {
        user_id: loginForm.username,
        password: encodePwByMd5(loginForm.password)
      }
      services.post('/api/login', params).then((res: any) => {
        if (res) {
          // 保存token到store和localStorage
          userStore.updateToken(res.token)
          userStore.updateUserInfo(res.userInfos)
          ElMessage.success('登录成功')
          router.push('/')
        } else {
          ElMessage.error('登录失败，返回数据格式不正确')
        }
      }).finally(() => {
        loading.value = false
      })
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

  .login-box {
    background-color: #fff;
    padding: 40px;
    border-radius: 8px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    width: 450px;

    .title {
      font-size: 24px;
      text-shadow: 0 0 10px rgba(0, 0, 0, .1);
      text-align: center;
      margin-bottom: 30px;
      background: linear-gradient(to right, red, orange, yellow, cyan, blue, purple, #4b2e83);
      background-size: 200% auto;
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
      animation: rainbow 6s linear infinite;
    }
  }
  .login-form {
    width: 100%;
    .password-icon {
      cursor: pointer;
      &.actives, &:hover {
        color: @textActiveColor;
      }
    }
  }

  .captcha-img {
    cursor: pointer;
    height: 40px;
    vertical-align: middle;
  }

  .login-btn {
    width: 100%;
  }
}

@keyframes rainbow {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}
</style>
