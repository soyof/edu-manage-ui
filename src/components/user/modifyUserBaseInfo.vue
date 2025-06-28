<template>
  <div class="user-profile">
    <div class="profile-section">
      <div class="profile-header">
        <div class="avatar-container">
          <AvatarUploader
            :avatar="userInfo.avatar"
            :userId="userInfo.userId"
            :username="userInfo.username"
            :bgColor="avatarBgColor"
          />
        </div>
        <div class="profile-info">
          <div class="name-section">
            <h2>{{ userInfo.username }}</h2>
            <el-button
              v-if="isViewMode"
              type="primary"
              size="small"
              class="edit-btn"
              @click="startEditingInternal"
            >
              <el-icon class="edit-icon"><EditPen /></el-icon>
              编辑资料
            </el-button>
          </div>
          <div class="profile-role">
            <el-tag>{{ userInfo.roleName === 'admin' ? '管理员' : '普通用户' }}</el-tag>
          </div>
        </div>
      </div>
    </div>

    <el-divider />

    <!-- 用户信息表单 -->
    <el-form
      ref="formRef"
      :model="userInfoForm"
      :rules="infoRules"
      labelWidth="100px"
      statusIcon
    >
      <el-form-item label="用户编号" prop="userId">
        <el-input v-model="userInfoForm.userId" placeholder="请输入用户编号（英文+数字或纯英文）" disabled />
      </el-form-item>
      <el-form-item label="用户名称" prop="username">
        <el-input v-model="userInfoForm.username" placeholder="请输入用户名称" :disabled="isViewMode" />
      </el-form-item>
      <el-form-item label="邮箱地址" prop="email">
        <el-input v-model="userInfoForm.email" placeholder="请输入邮箱地址" :disabled="isViewMode" />
      </el-form-item>
      <el-form-item label="手机号码" prop="phone">
        <el-input v-model="userInfoForm.phone" placeholder="请输入手机号码" :disabled="isViewMode" />
      </el-form-item>
      <el-form-item label="职称" prop="title">
        <el-select
          v-model="userInfoForm.title"
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
      <el-form-item label="实验室主页" prop="labHomepage">
        <el-input v-model="userInfoForm.labHomepage" placeholder="请输入实验室主页URL" :disabled="isViewMode" />
      </el-form-item>
      <el-form-item label="个人主页" prop="personalHomepage">
        <el-input v-model="userInfoForm.personalHomepage" placeholder="请输入个人主页URL" :disabled="isViewMode" />
      </el-form-item>
      <el-form-item label="用户标签" prop="tags">
        <div class="tags-container">
          <div class="tags-list">
            <el-tag
              v-for="item in displayTags"
              :key="item.index"
              :closable="!isViewMode"
              :effect="tagEffect"
              :type="getTagType(item.index)"
              :disableTransitions="false"
              class="tag-item"
              @click="showTagInput(item.index, item.tag)"
              @close="handleTagClose(item.tag)"
            >
              {{ item.tag }}
            </el-tag>

            <el-input
              v-if="isEditingTag && editingTagIndex !== -1"
              ref="tagInputRef"
              v-model="editingTagValue"
              size="small"
              class="tag-input"
              @keyup.enter="handleTagConfirm"
              @blur="handleTagConfirm"
            />

            <el-input
              v-if="showNewTagInput && !isViewMode"
              ref="newTagInputRef"
              v-model="newTagValue"
              size="small"
              class="tag-input"
              placeholder="请输入标签名称"
              @keyup.enter="handleNewTagConfirm"
              @blur="handleNewTagConfirm"
            />

            <el-button
              v-if="!showNewTagInput && !isViewMode"
              class="button-new-tag"
              size="small"
              @click="showNewTagInput = true"
            >
              + 新增标签
            </el-button>
          </div>

          <!-- <div v-if="!isViewMode" class="tags-hint">
            <el-text type="info" size="small">点击标签可编辑，按回车确认</el-text>
          </div> -->
        </div>
      </el-form-item>

      <!-- 按钮区域 -->
      <el-form-item v-if="!isViewMode">
        <div class="form-buttons">
          <el-button type="primary" :loading="loading" @click="saveUserInfo">保存</el-button>
          <el-button @click="cancelEditingInternal">取消</el-button>
        </div>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { useUserInfoStore } from '@/stores/userInfo'
import { ElMessage } from 'element-plus'
import type { FormInstance } from 'element-plus'
import { EditPen } from '@element-plus/icons-vue'
import AvatarUploader from './avatarUploader.vue'
import service from '@/utils/services'
import { useUserTitleDict } from '@/hooks/useDictionary'
import useLoading from '@/hooks/useLoading'

const { loading, changeLoading, closeLoading } = useLoading({
  target: '.user-info-card'
})

const userInfoStore = useUserInfoStore()
const { dictList: userTitleList } = useUserTitleDict()
// 是否处于编辑模式
const isEditing = ref(false)
// 是否处于只读模式
const isViewMode = ref(true)

// 表单引用
const formRef = ref<FormInstance>()

// 标签相关
const showNewTagInput = ref(false)
const newTagValue = ref('')
const newTagInputRef = ref<HTMLInputElement>()
const isEditingTag = ref(false)
const editingTagIndex = ref(-1)
const editingTagValue = ref('')
const tagInputRef = ref<HTMLInputElement>()

// 计算属性：过滤后的标签列表（解决v-for和v-if混用问题）
const displayTags = computed(() => {
  return userInfoForm.tags.map((tag, index) => ({
    tag,
    index,
    isEditing: isEditingTag.value && editingTagIndex.value === index
  })).filter(item => !item.isEditing)
})

// 标签效果
const tagEffect = computed(() => isViewMode.value ? 'plain' : 'light')

// 获取标签类型
const getTagType = (index: number) => {
  const types = ['primary', 'success', 'warning', 'info', 'danger']
  return types[index % types.length]
}

// 处理标签关闭
const handleTagClose = (tag: string) => {
  userInfoForm.tags.splice(userInfoForm.tags.indexOf(tag), 1)
}

// 显示标签编辑输入框
const showTagInput = (index: number, tag: string) => {
  if (isViewMode.value) return

  isEditingTag.value = true
  editingTagIndex.value = index
  editingTagValue.value = tag

  nextTick(() => {
    tagInputRef.value?.focus()
  })
}

// 处理标签编辑确认
const handleTagConfirm = () => {
  if (editingTagValue.value) {
    userInfoForm.tags[editingTagIndex.value] = editingTagValue.value
  }
  isEditingTag.value = false
  editingTagIndex.value = -1
}

// 处理新标签确认
const handleNewTagConfirm = () => {
  if (newTagValue.value) {
    if (!userInfoForm.tags.includes(newTagValue.value)) {
      userInfoForm.tags.push(newTagValue.value)
    } else {
      ElMessage.warning('标签已存在')
    }
  }
  showNewTagInput.value = false
  newTagValue.value = ''
}

// 随机生成头像背景颜色
const avatarColors = [
  '#67C23A', // 绿色
  '#E6A23C', // 黄色
  '#F56C6C', // 红色
  '#909399', // 灰色
  '#8E44AD', // 紫色
  '#16A085', // 青绿色
  '#D35400', // 橙色
  '#27AE60' // 深绿色
]

// 头像背景颜色
const avatarBgColor = computed(() => {
  const username = userInfo.value.username || '--'
  let hashCode = 0
  for (let i = 0; i < username.length; i++) {
    hashCode += username.charCodeAt(i)
  }
  const colorIndex = Math.abs(hashCode) % avatarColors.length
  return avatarColors[colorIndex]
})

// 用户信息
const userInfo = computed(() => {
  const info = userInfoStore.userInfo || {}
  return {
    id: info.id || '',
    userId: info.userId || '',
    username: info.username || '',
    email: info.email || '',
    phone: info.phone || '',
    title: info.title || '',
    roleName: info.role || 'user',
    avatar: info.avatar || '',
    labHomepage: info.labHomepage || '',
    personalHomepage: info.personalHomepage || '',
    tags: info.tags || []
  }
})

// 用户信息表单
const userInfoForm = reactive({
  userId: '',
  username: '',
  email: '',
  phone: '',
  title: '',
  labHomepage: '',
  personalHomepage: '',
  tags: [] as string[]
})

// 用户信息表单验证规则
const infoRules = {
  userId: [
    { required: true, message: '请输入用户编号', trigger: 'blur' }
  ],
  username: [
    { required: true, message: '请输入用户名称', trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  phone: [
    {
      pattern: /^1(3\d|4[5-9]|5[0-35-9]|6[2567]|7[0-8]|8\d|9[0-35-9])\d{8}$/,
      message: '请输入正确的手机号码',
      trigger: 'blur'
    }
  ],
  labHomepage: [
    { type: 'url', message: '请输入正确的网址', trigger: 'blur' }
  ],
  personalHomepage: [
    { type: 'url', message: '请输入正确的网址', trigger: 'blur' }
  ]
}

// 生命周期钩子
onMounted(() => {
  // 初始化用户信息表单
  initUserInfoForm()
})

// 初始化用户信息表单
const initUserInfoForm = () => {
  userInfoForm.userId = userInfo.value.userId
  userInfoForm.username = userInfo.value.username
  userInfoForm.email = userInfo.value.email
  userInfoForm.phone = userInfo.value.phone
  userInfoForm.title = userInfo.value.title
  // userInfoForm.avatar = userInfo.value.avatar
  userInfoForm.labHomepage = userInfo.value.labHomepage
  userInfoForm.personalHomepage = userInfo.value.personalHomepage

  // 处理标签数据
  if (typeof userInfo.value.tags === 'string') {
    userInfoForm.tags = userInfo.value.tags.split(',').filter(Boolean)
  } else if (Array.isArray(userInfo.value.tags)) {
    userInfoForm.tags = [...userInfo.value.tags]
  } else {
    userInfoForm.tags = []
  }
}

// 开始编辑
const startEditing = () => {
  isEditing.value = true
  isViewMode.value = false
}

// 内部开始编辑方法
const startEditingInternal = () => {
  isEditing.value = true
  isViewMode.value = false
}

// 取消编辑
const cancelEditing = () => {
  isEditing.value = false
  isViewMode.value = true
  initUserInfoForm()
  formRef.value?.clearValidate()
}

// 内部取消编辑方法
const cancelEditingInternal = () => {
  cancelEditing()
}

// 保存用户信息
const saveUserInfo = () => {
  if (!formRef.value) return
  formRef.value.validate((valid) => {
    if (valid) {
      changeLoading(true, { text: '保存中...' })
      service.post('/api/updateProfile', {
        ...userInfoForm
      }).then(async() => {
        ElMessage.success('更新成功')
        await userInfoStore.getUserInfoAction()
        // 退出编辑模式
        isEditing.value = false
        isViewMode.value = true
      }).finally(() => {
        changeLoading(false)
      })
    }
  })
}

// 向父组件暴露方法
defineExpose({
  saveUserInfo,
  cancelEditing,
  startEditing
})
</script>

<style lang="less" scoped>
.user-profile {
  padding: 20px 0;

  .profile-section {
    position: relative;
    margin-bottom: 20px;
  }

  .profile-header {
    display: flex;
    align-items: center;

    .avatar-container {
      flex-shrink: 0;
    }

    .profile-info {
      margin-left: 20px;
      flex: 1;

      .name-section {
        display: flex;
        align-items: center;
        margin-bottom: 10px;

        h2 {
          margin: 0;
          font-size: 24px;
          margin-right: 15px;
        }

        .edit-btn {
          display: flex;
          align-items: center;

          .edit-icon {
            margin-right: 4px;
          }
        }
      }

      .profile-role {
        display: flex;
        align-items: center;

        .el-tag {
          margin-right: 10px;
        }
      }
    }
  }

  .tags-container {
    .tags-list {
      display: flex;
      flex-wrap: wrap;
      align-items: center;

      .tag-item {
        margin-right: 10px;
        margin-top: 2px;
        margin-bottom: 2px;
        cursor: pointer;

        &:hover {
          opacity: 0.8;
        }
      }

      .tag-input {
        width: 100px;
        margin-right: 10px;
        margin-top: 2px;
        margin-bottom: 2px;
        vertical-align: bottom;
      }

      .button-new-tag {
        margin-top: 2px;
        margin-bottom: 2px;
      }
    }
  }

  .user-form {
    max-width: 600px;
  }

  .form-buttons {
    display: flex;
    justify-content: flex-start;
  }
}
</style>
