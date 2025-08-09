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
          @input="filterChineseCharacters('oldPassword')"
        />
      </el-form-item>
      <el-form-item label="新密码" prop="newPassword">
        <el-input
          v-model="passwordForm.newPassword"
          type="password"
          :showPassword="true"
          placeholder="请输入8-32位密码"
          autocomplete="new-password"
          maxlength="32"
          @input="handleNewPasswordInput"
        />
        <!-- 密码强度指示器 -->
        <div v-if="passwordForm.newPassword" class="password-strength-indicator">
          <div class="strength-text">
            密码强度: <span :class="['strength-level', strengthLevelClass]">{{ strengthLevelText }}</span>
          </div>
          <div class="strength-bar-container">
            <div class="strength-bar" :class="strengthLevelClass" :style="{ width: strengthPercentage + '%' }"></div>
          </div>
          <div class="strength-tips">
            <p>密码规则：</p>
            <ul>
              <li :class="{ 'satisfied': passwordChecks.length }">长度为8-32个字符</li>
              <li :class="{ 'satisfied': !passwordChecks.hasChinese }" class="error">不能包含中文字符</li>
            </ul>
            <p>建议满足以下条件提高密码安全性：</p>
            <ul>
              <li :class="{ 'satisfied': passwordChecks.hasUppercase }">包含大写字母</li>
              <li :class="{ 'satisfied': passwordChecks.hasLowercase }">包含小写字母</li>
              <li :class="{ 'satisfied': passwordChecks.hasDigit }">包含数字</li>
              <li :class="{ 'satisfied': passwordChecks.hasSpecialChar }">包含英文特殊字符（如 !@#$%^&*）</li>
            </ul>
          </div>
        </div>
      </el-form-item>
      <el-form-item label="确认新密码" prop="confirmPassword">
        <el-input
          v-model="passwordForm.confirmPassword"
          type="password"
          :showPassword="true"
          placeholder="请再次输入新密码"
          autocomplete="new-password"
          maxlength="32"
          @input="filterChineseCharacters('confirmPassword')"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :loading="loading" @click="changePassword">修改密码</el-button>
        <el-button @click="resetPasswordForm">重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useUserInfoStore } from '@/stores/userInfo'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance } from 'element-plus'
import service from '@/utils/services'
import { encodePwByMd5 } from '@/utils/pwdUtils'
import useLoading from '@/hooks/useLoading'

const userInfoStore = useUserInfoStore()
const { loading, changeLoading } = useLoading({
  target: '.password-change'
})

// 表单引用
const pwdFormRef = ref<FormInstance>()

// 密码表单
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 密码强度检查结果
const passwordChecks = reactive({
  length: false,
  hasUppercase: false,
  hasLowercase: false,
  hasDigit: false,
  hasSpecialChar: false,
  hasChinese: false,
  hasChineseSymbol: false
})

// 密码强度等级
const passwordStrength = ref(0)

// 过滤中文字符
const filterChineseCharacters = (field: keyof typeof passwordForm) => {
  // 使用正则表达式移除中文字符
  if (passwordForm[field]) {
    const filteredValue = passwordForm[field].replace(/[\u4e00-\u9fa5]/g, '')
    // 过滤中文标点符号
    const finalValue = filteredValue.replace(/[\u3000-\u303F\uFF00-\uFFEF]/g, '')
    if (finalValue !== passwordForm[field]) {
      passwordForm[field] = finalValue
      ElMessage.warning('密码不能包含中文字符或中文标点符号')
    }
  }
}

// 处理新密码输入（过滤中文并检查强度）
const handleNewPasswordInput = () => {
  filterChineseCharacters('newPassword')
  checkPasswordStrength()
}

// 密码强度检查函数
const checkPasswordStrength = () => {
  const password = passwordForm.newPassword
  let score = 0

  // 检查密码长度
  // passwordChecks.length = password.length >= 8 && password.length <= 32
  // if (passwordChecks.length) score += 20

  // 检查大写字母
  passwordChecks.hasUppercase = /[A-Z]/.test(password)
  if (passwordChecks.hasUppercase) score += 25

  // 检查小写字母
  passwordChecks.hasLowercase = /[a-z]/.test(password)
  if (passwordChecks.hasLowercase) score += 25

  // 检查数字
  passwordChecks.hasDigit = /[0-9]/.test(password)
  if (passwordChecks.hasDigit) score += 25

  // 检查英文特殊字符（排除中文标点）
  passwordChecks.hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
  if (passwordChecks.hasSpecialChar) score += 25

  // 检查中文字符
  passwordChecks.hasChinese = /[\u4e00-\u9fa5]/.test(password)

  // 检查中文标点符号
  passwordChecks.hasChineseSymbol = /[\u3000-\u303F\uFF00-\uFFEF]/.test(password)

  // 如果包含中文或中文标点，则密码强度为0
  if (passwordChecks.hasChinese || passwordChecks.hasChineseSymbol) {
    score = 0
  }

  passwordStrength.value = score
}

// 密码强度百分比
const strengthPercentage = computed(() => passwordStrength.value)

// 密码强度等级文本
const strengthLevelText = computed(() => {
  if (passwordStrength.value === 0) return '请输入密码'
  if (passwordStrength.value < 40) return '弱'
  if (passwordStrength.value < 70) return '中等'
  return '强'
})

// 密码强度等级类名
const strengthLevelClass = computed(() => {
  if (passwordStrength.value === 0) return ''
  if (passwordStrength.value < 40) return 'weak'
  if (passwordStrength.value < 70) return 'medium'
  return 'strong'
})

// 密码表单验证规则
const passwordRules = {
  oldPassword: [
    { required: true, message: '请输入原密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 8, message: '密码长度不能少于8位', trigger: 'change' },
    { max: 32, message: '密码长度不能超过32位', trigger: 'change' },
    {
      validator: (_rule: any, _value: string, callback: any) => {
        checkPasswordStrength()
        // 只检查中文字符和长度要求
        if (passwordChecks.hasChinese || passwordChecks.hasChineseSymbol) {
          callback(new Error('密码不能包含中文字符或中文标点符号'))
        } else {
          callback()
        }
      },
      trigger: 'change'
    }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    {
      validator: (_rule: any, value: string, callback: any) => {
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
const changePassword = () => {
  if (!pwdFormRef.value) return

  pwdFormRef.value.validate((valid) => {
    if (valid) {
      changeLoading(true, { text: '修改中...' })

      // 获取用户ID
      const userId = userInfoStore.userInfo?.userId

      if (!userId) {
        ElMessage.error('获取用户信息失败')
        changeLoading(false)
        return
      }

      // 调用修改密码API
      service.post('/api/changePassword', {
        userId,
        oldPassword: encodePwByMd5(passwordForm.oldPassword),
        newPassword: encodePwByMd5(passwordForm.newPassword)
      }).then((res: any) => {
        if (res) {
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
          ).then(() => {
            userInfoStore.logout().then(() => {
              window.location.href = '/login'
            })
          }).finally(() => {
            changeLoading(false)
          })
        } else {
          changeLoading(false)
        }
      }).finally(() => {
        changeLoading(false)
      })
    }
  })
}

// 重置密码表单
const resetPasswordForm = () => {
  passwordForm.oldPassword = ''
  passwordForm.newPassword = ''
  passwordForm.confirmPassword = ''
  passwordStrength.value = 0
  Object.keys(passwordChecks).forEach(key => {
    passwordChecks[key as keyof typeof passwordChecks] = false
  })
  pwdFormRef.value?.clearValidate()
}
</script>

<style lang="less" scoped>
.password-change {
  padding: 0;

  .password-form {
    max-width: 500px;
  }

  .password-strength-indicator {
    margin-top: 8px;

    .strength-text {
      font-size: 14px;
      margin-bottom: 5px;

      .strength-level {
        font-weight: bold;

        &.weak {
          color: #f56c6c;
        }

        &.medium {
          color: #e6a23c;
        }

        &.strong {
          color: #67c23a;
        }
      }
    }

    .strength-bar-container {
      height: 6px;
      background-color: #ebeef5;
      border-radius: 3px;
      overflow: hidden;
      margin-bottom: 10px;

      .strength-bar {
        height: 100%;
        transition: all 0.3s ease;

        &.weak {
          background-color: #f56c6c;
        }

        &.medium {
          background-color: #e6a23c;
        }

        &.strong {
          background-color: #67c23a;
        }
      }
    }

    .strength-tips {
      font-size: 12px;
      color: #606266;
      margin-top: 8px;

      p {
        height: 22px;
        line-height: 22px;
        margin-bottom: 5px;
      }

      ul {
        margin: 0;
        padding-left: 20px;

        li {
          height: 22px;
          line-height: 22px;

          &.satisfied {
            color: #67c23a;

            &::marker {
              content: '✓ ';
            }
          }

          &.error:not(.satisfied) {
            color: #f56c6c;

            &::marker {
              content: '✗ ';
            }
          }
        }
      }
    }
  }
}
</style>
