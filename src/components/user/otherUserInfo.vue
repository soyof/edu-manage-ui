<template>
  <div class="other-user-info">
    <!-- 固定在右上角的按钮区域 - 根据模式显示不同按钮 -->
    <div class="fixed-action-buttons">
      <template v-if="isViewMode">
        <el-button
          type="primary"
          size="small"
          @click="startEditing"
        >
          <el-icon><EditPen /></el-icon> 编辑资料
        </el-button>
      </template>
      <template v-else>
        <el-button
          type="primary"
          size="small"
          :disabled="loading"
          @click="saveUserInfo"
        >
          <el-icon><Check /></el-icon> 保存
        </el-button>
        <el-button
          size="small"
          :disabled="loading"
          @click="cancelEditing"
        >
          <el-icon><Close /></el-icon> 取消
        </el-button>
      </template>
    </div>

    <!-- 表单区域 -->
    <el-form
      ref="formRef"
      :model="userInfoForm"
      :rules="formRules"
      labelWidth="120px"
      statusIcon
    >
      <!-- 必须显示的部分 -->
      <el-collapse v-model="activeCollapse">
        <template v-for="(section, sectionIndex) in requiredSections" :key="sectionIndex">
          <el-collapse-item :name="section.title">
            <template #title>
              <span class="section-title">{{ section.title }}</span>
            </template>

            <template v-for="(field, fieldIndex) in section.fields" :key="`${sectionIndex}-${fieldIndex}`">
              <el-form-item :label="field.label" :prop="field.prop">
                <TinyMceEditor
                  :id="`editor-${section.title}-${field.prop}-${field.lang}`"
                  :key="`editor-${section.title}-${field.prop}-${field.lang}`"
                  :ref="el => { if (el) editorRefs[`${section.title}-${field.prop}`] = el }"
                  v-model="(userInfoForm[field.prop as keyof typeof userInfoForm] as string)"
                  :disabled="isViewMode"
                  :placeholder="field.placeholder"
                />
              </el-form-item>
            </template>
          </el-collapse-item>
        </template>
      </el-collapse>

      <!-- 可选部分配置 -->
      <el-divider v-if="!isViewMode" contentPosition="left">
        <span class="section-title">选择显示内容</span>
      </el-divider>

      <div v-if="!isViewMode" class="section-switches">
        <el-checkbox
          v-for="(section, index) in optionalSections"
          :key="index"
          v-model="userInfoForm.sections[section.key]"
          :label="section.title"
          size="large"
        />
      </div>

      <!-- 可选部分内容 -->
      <el-collapse v-model="activeOptionalCollapse">
        <template v-for="(section, sectionIndex) in optionalSections" :key="`opt-${sectionIndex}`">
          <el-collapse-item
            v-if="userInfoForm.sections[section.key]"
            :name="section.key"
          >
            <template #title>
              <span class="section-title">{{ section.title }}</span>
            </template>

            <template v-for="(field, fieldIndex) in section.fields" :key="`${sectionIndex}-${fieldIndex}`">
              <el-form-item :label="field.label" :prop="field.prop">
                <TinyMceEditor
                  :id="`editor-opt-${section.key}-${field.prop}-${field.lang}`"
                  :key="`editor-opt-${section.key}-${field.prop}-${field.lang}`"
                  :ref="el => { if (el) editorRefs[`opt-${section.key}-${field.prop}`] = el }"
                  v-model="(userInfoForm[field.prop as keyof typeof userInfoForm] as string)"
                  :disabled="isViewMode"
                  :placeholder="field.placeholder"
                />
              </el-form-item>
            </template>
          </el-collapse-item>
        </template>
      </el-collapse>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue'
import { ElMessage } from 'element-plus'
import { EditPen, Check, Close } from '@element-plus/icons-vue'
import type { FormInstance } from 'element-plus'
import { useUserInfoStore } from '@/stores/userInfo'
import service from '@/utils/services'
import TinyMceEditor from '@/components/global/tinyMceEditor.vue'
import { removeSpace } from '@/utils/utils'
import useLoading from '@/hooks/useLoading'

// 用户信息存储
const userInfoStore = useUserInfoStore()

// 是否处于编辑模式
const isEditing = ref(false)
// 是否处于只读模式
const isViewMode = ref(true)
// 表单引用
const formRef = ref<FormInstance>()
// 使用封装的loading hook
const { loading, changeLoading, closeLoading } = useLoading({
  target: '.user-info-card'
})

// 组件销毁前关闭loading
onBeforeUnmount(() => {
  closeLoading()
})

// 折叠面板激活项
const activeCollapse = ref(['个人简介'])
const activeOptionalCollapse = ref<string[]>([])

// 编辑器引用集合
const editorRefs = reactive<Record<string, any>>({})

// 定义表单字段接口
interface FormField {
  label: string;
  prop: string;
  placeholder: string;
  lang: string;
}

// 定义部分接口
interface Section {
  title: string;
  fields: FormField[];
}

// 定义可选部分接口
interface OptionalSection extends Section {
  key: keyof typeof userInfoForm.sections;
}

const oldUserInfoForm = ref({})

// 用户表单信息 - 使用与接口一致的命名
const userInfoForm = reactive({
  // 个人简介（必须显示）
  bio: '',
  bioEn: '',
  // 研究方向（必须显示）
  researchDirection: '',
  researchDirectionEn: '',
  // 课题项目（可选）
  researchProject: '',
  researchProjectEn: '',
  // 学术兼职（可选）
  academicAppointment: '',
  academicAppointmentEn: '',
  // 获奖情况（可选）
  awards: '',
  awardsEn: '',
  // 学术研究（可选）
  academicResearch: '',
  academicResearchEn: '',
  // 论文发表（可选）
  publications: '',
  publicationsEn: '',
  // 各部分是否显示的控制
  sections: {
    projects: false,
    academic: false,
    awards: false,
    research: false,
    papers: false
  }
})

// 表单验证规则
const formRules = {
  bio: [
    { required: true, message: '请输入中文个人简介', trigger: 'change' }
  ],
  researchDirection: [
    { required: true, message: '请输入中文研究方向', trigger: 'blur' }
  ]
}

// 必须显示的部分定义
const requiredSections: Section[] = [
  {
    title: '个人简介',
    fields: [
      {
        label: '简介(中文)',
        prop: 'bio',
        placeholder: '请输入中文个人简介',
        lang: 'zh'
      },
      {
        label: '简介(英文)',
        prop: 'bioEn',
        placeholder: '请输入英文个人简介',
        lang: 'en'
      }
    ]
  },
  {
    title: '研究方向',
    fields: [
      {
        label: '研究方向(中文)',
        prop: 'researchDirection',
        placeholder: '请输入中文研究方向',
        lang: 'zh'
      },
      {
        label: '研究方向(英文)',
        prop: 'researchDirectionEn',
        placeholder: 'Please enter your research directions in English',
        lang: 'en'
      }
    ]
  }
]

// 可选部分定义
const optionalSections: OptionalSection[] = [
  {
    key: 'projects',
    title: '课题项目',
    fields: [
      {
        label: '课题项目(中文)',
        prop: 'researchProject',
        placeholder: '请输入中文课题项目，每个项目一行',
        lang: 'zh'
      },
      {
        label: '课题项目(英文)',
        prop: 'researchProjectEn',
        placeholder: 'Please enter your projects in English, one per line',
        lang: 'en'
      }
    ]
  },
  {
    key: 'academic',
    title: '学术兼职',
    fields: [
      {
        label: '学术兼职(中文)',
        prop: 'academicAppointment',
        placeholder: '请输入中文学术兼职，每个兼职一行',
        lang: 'zh'
      },
      {
        label: '学术兼职(英文)',
        prop: 'academicAppointmentEn',
        placeholder: 'Please enter your academic positions in English, one per line',
        lang: 'en'
      }
    ]
  },
  {
    key: 'awards',
    title: '获奖情况',
    fields: [
      {
        label: '获奖情况(中文)',
        prop: 'awards',
        placeholder: '请输入中文获奖情况，每个奖项一行',
        lang: 'zh'
      },
      {
        label: '获奖情况(英文)',
        prop: 'awardsEn',
        placeholder: 'Please enter your awards in English, one per line',
        lang: 'en'
      }
    ]
  },
  {
    key: 'research',
    title: '学术研究',
    fields: [
      {
        label: '学术研究(中文)',
        prop: 'academicResearch',
        placeholder: '请输入中文学术研究内容',
        lang: 'zh'
      },
      {
        label: '学术研究(英文)',
        prop: 'academicResearchEn',
        placeholder: 'Please enter your academic research in English',
        lang: 'en'
      }
    ]
  },
  {
    key: 'papers',
    title: '论文发表',
    fields: [
      {
        label: '论文发表(中文)',
        prop: 'publications',
        placeholder: '请输入中文论文发表信息，每篇论文一行',
        lang: 'zh'
      },
      {
        label: '论文发表(英文)',
        prop: 'publicationsEn',
        placeholder: 'Please enter your published papers in English, one per line',
        lang: 'en'
      }
    ]
  }
]

// 开始编辑时展开所有面板
const expandAllPanels = () => {
  activeCollapse.value = requiredSections.map(section => section.title)
  activeOptionalCollapse.value = optionalSections
    .filter(section => userInfoForm.sections[section.key])
    .map(section => section.key as string)
}

// 用户信息
const userInfo = computed(() => {
  const info = userInfoStore.userInfo || {}
  return {
    id: info.id || '',
    userId: info.userId || '',
    otherInfo: info.otherInfo || {}
  }
})

// 生命周期钩子
onMounted(() => {
  // 获取用户其他信息并初始化表单
  getUserOtherInfo()
})

// 获取用户其他信息
const getUserOtherInfo = () => {
  changeLoading(true)
  service.get(`/api/getUserOtherInfo/${userInfo.value.userId}`).then(res => {
    oldUserInfoForm.value = JSON.parse(JSON.stringify(res || {}))
    initUserInfoForm(res || {})
  }).finally(() => {
    setTimeout(() => {
      changeLoading(false)
    }, 1000)
  })
}

// 初始化用户信息表单
const initUserInfoForm = (otherInfo: any) => {
  // 加载个人简介
  userInfoForm.bio = otherInfo.bio || ''
  userInfoForm.bioEn = otherInfo.bioEn || ''

  // 加载研究方向
  userInfoForm.researchDirection = otherInfo.researchDirection || ''
  userInfoForm.researchDirectionEn = otherInfo.researchDirectionEn || ''

  // 重置所有可选部分
  // 先将所有部分设置为false
  Object.keys(userInfoForm.sections).forEach(key => {
    userInfoForm.sections[key as keyof typeof userInfoForm.sections] = false
  })

  // 清空所有可选字段
  userInfoForm.researchProject = ''
  userInfoForm.researchProjectEn = ''
  userInfoForm.academicAppointment = ''
  userInfoForm.academicAppointmentEn = ''
  userInfoForm.awards = ''
  userInfoForm.awardsEn = ''
  userInfoForm.academicResearch = ''
  userInfoForm.academicResearchEn = ''
  userInfoForm.publications = ''
  userInfoForm.publicationsEn = ''

  // 加载各可选部分 - 适配扁平结构
  if (otherInfo.researchProject || otherInfo.researchProjectEn) {
    userInfoForm.researchProject = otherInfo.researchProject || ''
    userInfoForm.researchProjectEn = otherInfo.researchProjectEn || ''
    userInfoForm.sections.projects = true
  }

  if (otherInfo.academicAppointment || otherInfo.academicAppointmentEn) {
    userInfoForm.academicAppointment = otherInfo.academicAppointment || ''
    userInfoForm.academicAppointmentEn = otherInfo.academicAppointmentEn || ''
    userInfoForm.sections.academic = true
  }

  if (otherInfo.awards || otherInfo.awardsEn) {
    userInfoForm.awards = otherInfo.awards || ''
    userInfoForm.awardsEn = otherInfo.awardsEn || ''
    userInfoForm.sections.awards = true
  }

  if (otherInfo.academicResearch || otherInfo.academicResearchEn) {
    userInfoForm.academicResearch = otherInfo.academicResearch || ''
    userInfoForm.academicResearchEn = otherInfo.academicResearchEn || ''
    userInfoForm.sections.research = true
  }

  if (otherInfo.publications || otherInfo.publicationsEn) {
    userInfoForm.publications = otherInfo.publications || ''
    userInfoForm.publicationsEn = otherInfo.publicationsEn || ''
    userInfoForm.sections.papers = true
  }
}

// 开始编辑
const startEditing = () => {
  isEditing.value = true
  isViewMode.value = false
  expandAllPanels() // 编辑模式下展开所有面板
}

// 取消编辑
const cancelEditing = () => {
  isEditing.value = false
  isViewMode.value = true

  // 重置表单数据到初始状态
  initUserInfoForm(oldUserInfoForm.value || {})

  // 清除验证状态
  formRef.value?.clearValidate()

  // 返回到只展开第一个面板的状态
  activeCollapse.value = ['个人简介']
  activeOptionalCollapse.value = []
}

// 保存用户信息
const saveUserInfo = () => {
  if (!formRef.value || loading.value) return

  formRef.value.validate((valid) => {
    if (valid) {
      changeLoading(true, { text: '保存中...' })

      // 构建要保存的数据 - 使用扁平化结构适配接口参数
      const otherInfo = {
        // 必须保存的部分
        bio: userInfoForm.bio,
        bioEn: userInfoForm.bioEn,
        researchDirection: userInfoForm.researchDirection,
        researchDirectionEn: userInfoForm.researchDirectionEn,

        // 可选部分 - 如果没有启用该部分，则不传递该参数
        ...(userInfoForm.sections.projects ? {
          researchProject: userInfoForm.researchProject,
          researchProjectEn: userInfoForm.researchProjectEn
        } : {}),

        ...(userInfoForm.sections.academic ? {
          academicAppointment: userInfoForm.academicAppointment,
          academicAppointmentEn: userInfoForm.academicAppointmentEn
        } : {}),

        ...(userInfoForm.sections.awards ? {
          awards: userInfoForm.awards,
          awardsEn: userInfoForm.awardsEn
        } : {}),

        ...(userInfoForm.sections.research ? {
          academicResearch: userInfoForm.academicResearch,
          academicResearchEn: userInfoForm.academicResearchEn
        } : {}),

        ...(userInfoForm.sections.papers ? {
          publications: userInfoForm.publications,
          publicationsEn: userInfoForm.publicationsEn
        } : {})
      }

      const params = removeSpace({
        userId: userInfo.value.userId,
        ...otherInfo
      })

      // 调用更新API
      service.post('/api/updateCurrentUserOtherInfo', params).then(async() => {
        // 退出编辑模式
        isEditing.value = false
        isViewMode.value = true

        // 清空编辑器引用，确保下次编辑时能正确获取新的编辑器实例
        Object.keys(editorRefs).forEach(key => {
          delete editorRefs[key]
        })

        // 返回到只展开第一个面板的状态
        activeCollapse.value = ['个人简介']
        activeOptionalCollapse.value = []
        ElMessage.success('保存成功')
        getUserOtherInfo()
      }).finally(() => {
        changeLoading(false)
      })
    }
  })
}

</script>

<style lang="less" scoped>
.other-user-info {
  width: 100%;
  position: relative;
  :deep(.el-collapse) {
    .el-collapse-item__header {
      height: 30px;
      line-height: 30px;
      font-size: 14px;
    }
  }

  :deep(.el-form-item) {
    &.is-error {
      .tox-tinymce {
        border-color: #f56c6c;
      }
    }
  }

  // 折叠面板样式
  :deep(.el-collapse) {
    border: none;

    .el-collapse-item {
      margin-bottom: 15px;
      border: 1px solid #ebeef5;
      border-radius: 4px;
      overflow: hidden;

      .el-collapse-item__header {
        background-color: #f5f7fa;
        padding: 0 15px;
        font-size: 16px;
        font-weight: bold;
        border-bottom: none;

        &.is-active {
          border-bottom: 1px solid #ebeef5;
        }
      }

      .el-collapse-item__content {
        padding: 15px;
      }
    }
  }

  // 固定在容器右上角的按钮区域
  .fixed-action-buttons {
    position: sticky;
    top: 0;
    right: 0;
    z-index: 10;
    display: flex;
    justify-content: flex-end;
    padding: 0 15px;
    margin-bottom: 8px;
    background-color: #fff;
    border-radius: 5px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    height: 32px;
    align-items: center;
    .el-button {
      margin-left: 0;
      margin-right: 8px;
      &:last-child {
        margin-right: 0;
      }
    }
  }

  .section-title {
    font-weight: bold;
    font-size: 16px;
  }

  .section-switches {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    margin-bottom: 20px;
    margin-top: 20px;

    .el-checkbox {
      margin-right: 0;
    }
  }
}
</style>
