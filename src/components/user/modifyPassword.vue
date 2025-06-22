<template>
  <div class="password-change">
    <el-form
      ref="pwdFormRef"
      :model="passwordForm"
      :rules="passwordRules"
      :labelWidth="'120px'"
      class="password-form"
      statusIcon
    >
      <el-form-item label="原密码" prop="oldPassword">
        <el-input
          v-model="passwordForm.oldPassword"
          type="password"
          :showPassword="true"
          placeholder="请输入原密码"
        />
      </el-form-item>
      <el-form-item label="新密码" prop="newPassword">
        <el-input
          v-model="passwordForm.newPassword"
          type="password"
          :showPassword="true"
          placeholder="请输入新密码"
          autocomplete="new-password"
        />
      </el-form-item>
      <el-form-item label="确认新密码" prop="confirmPassword">
        <el-input
          v-model="passwordForm.confirmPassword"
          type="password"
          :showPassword="true"
          placeholder="请再次输入新密码"
          autocomplete="new-password"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :loading="pwdSubmitting" @click="changePassword">修改密码</el-button>
        <el-button @click="resetPasswordForm">重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useUserInfoStore } from '@/stores/userInfo'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance } from 'element-plus'

const userInfoStore = useUserInfoStore()

// 提交状态
const pwdSubmitting = ref(false)

// 表单引用
const pwdFormRef = ref<FormInstance>()

// 密码表单
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 密码表单验证规则
const passwordRules = {
  oldPassword: [
    { required: true, message: '请输入原密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    {
      validator: (rule: any, value: string, callback: any) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 修改密码
const changePassword = async() => {
  if (!pwdFormRef.value) return

  await pwdFormRef.value.validate(async(valid) => {
    if (valid) {
      try {
        pwdSubmitting.value = true

        // 获取用户ID
        const userId = userInfoStore.userInfo?.userId

        if (!userId) {
          ElMessage.error('获取用户信息失败')
          return
        }

        // 调用修改密码API
        const res = await fetch('/api/changePassword', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userId,
            oldPassword: passwordForm.oldPassword,
            newPassword: passwordForm.newPassword
          })
        })

        if (res.ok) {
          ElMessage.success('密码修改成功')
          resetPasswordForm()

          // 询问是否要重新登录
          ElMessageBox.confirm(
            '密码已修改成功，是否立即退出并重新登录？',
            '提示',
            {
              confirmButtonText: '是',
              cancelButtonText: '否',
              type: 'info'
            }
          )
            .then(() => {
              userInfoStore.logout().then(() => {
                window.location.href = '/login'
              })
            })
            .catch(() => {
              // 用户选择不退出
            })
        } else {
          ElMessage.error('密码修改失败，请检查原密码是否正确')
        }
      } catch (error) {
        console.error('修改密码失败', error)
        ElMessage.error('修改密码失败，请稍后重试')
      } finally {
        pwdSubmitting.value = false
      }
    }
  })
}

// 重置密码表单
const resetPasswordForm = () => {
  passwordForm.oldPassword = ''
  passwordForm.newPassword = ''
  passwordForm.confirmPassword = ''
  pwdFormRef.value?.clearValidate()
}
</script>

<style lang="less" scoped>
.password-change {
  padding: 20px 0;

  .password-form {
    max-width: 500px;
  }
}
</style>
