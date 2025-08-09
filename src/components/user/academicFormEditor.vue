<template>
  <div class="academic-form-editor">
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
        <template v-for="section in requiredSections" :key="section.title">
          <el-collapse-item :name="section.title">
            <template #title>
              <span class="section-title">{{ section.title }}</span>
            </template>

            <!-- 按组合成中英文tab -->
            <el-form-item :label="section.title" class="content-form-item">
              <el-tabs type="border-card" class="simple-tabs">
                <el-tab-pane label="中文内容">
                  <div class="editor-wrapper">
                    <TinyMceEditor
                      v-model="(userInfoForm[section.fields[0].prop as keyof typeof userInfoForm] as string)"
                      :disabled="isDisabled"
                      :placeholder="section.fields[0].placeholder"
                      :height="500"
                    />
                  </div>
                </el-tab-pane>
                <el-tab-pane label="英文内容">
                  <div class="editor-wrapper">
                    <TinyMceEditor
                      v-model="(userInfoForm[section.fields[1].prop as keyof typeof userInfoForm] as string)"
                      :disabled="isDisabled"
                      :placeholder="section.fields[1].placeholder"
                      :height="500"
                    />
                  </div>
                </el-tab-pane>
              </el-tabs>
            </el-form-item>
          </el-collapse-item>
        </template>
      </el-collapse>

      <!-- 可选部分配置 -->
      <el-divider v-if="!isDisabled" contentPosition="left">
        <span class="section-title">选择显示内容</span>
      </el-divider>

      <div v-if="!isDisabled" class="section-switches">
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
        <template v-for="section in optionalSections" :key="`opt-${section.key}`">
          <el-collapse-item
            v-if="userInfoForm.sections[section.key]"
            :name="section.key"
          >
            <template #title>
              <span class="section-title">{{ section.title }}</span>
            </template>

            <!-- 按组合成中英文tab -->
            <el-form-item :label="section.title" class="content-form-item">
              <el-tabs type="border-card" class="simple-tabs">
                <el-tab-pane label="中文内容">
                  <div class="editor-wrapper">
                    <TinyMceEditor
                      v-model="(userInfoForm[section.fields[0].prop as keyof typeof userInfoForm] as string)"
                      :disabled="isDisabled"
                      :placeholder="section.fields[0].placeholder"
                      :height="500"
                    />
                  </div>
                </el-tab-pane>
                <el-tab-pane label="英文内容">
                  <div class="editor-wrapper">
                    <TinyMceEditor
                      v-model="(userInfoForm[section.fields[1].prop as keyof typeof userInfoForm] as string)"
                      :disabled="isDisabled"
                      :placeholder="section.fields[1].placeholder"
                      :height="500"
                    />
                  </div>
                </el-tab-pane>
              </el-tabs>
            </el-form-item>
          </el-collapse-item>
        </template>
      </el-collapse>

      <!-- 底部按钮区域 -->
      <el-form-item v-if="showButtons && !isDisabled">
        <div class="form-buttons">
          <el-button
            type="primary"
            :loading="loading"
            @click="saveForm"
          >
            保存
          </el-button>
          <el-button
            @click="cancelEdit"
          >
            取消
          </el-button>
        </div>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onBeforeUnmount, watch } from 'vue'
import type { FormInstance } from 'element-plus'
import TinyMceEditor from '@/components/global/tinyMceEditor.vue'
import { removeSpace } from '@/utils/utils'
import useLoading from '@/hooks/useLoading'

// 定义Props
const props = defineProps({
  // 用户ID
  userId: {
    type: String,
    required: true
  },
  // 初始表单数据
  initialData: {
    type: Object,
    default: () => ({})
  },
  // 是否禁用编辑
  isDisabled: {
    type: Boolean,
    default: false
  },
  // 是否显示底部按钮
  showButtons: {
    type: Boolean,
    default: true
  }
})

// 定义事件
const emit = defineEmits(['save', 'cancel', 'update'])

// 表单引用
const formRef = ref<FormInstance>()

// 使用封装的loading hook
const { loading, closeLoading } = useLoading({
  target: '.academic-form-editor'
})

// 组件销毁前关闭loading
onBeforeUnmount(() => {
  closeLoading()
})

// 折叠面板激活项
const activeCollapse = ref(['个人简介', '研究方向'])
const activeOptionalCollapse = ref<string[]>([])

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

// 存储原始表单数据
const originalData = ref({})

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
        placeholder: 'please enter your bio in English',
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

// 展开所有部分
const expandAllSections = () => {
  // 展开所有必需部分
  activeCollapse.value = requiredSections.map(section => section.title)

  // 展开所有可选部分（如果已启用）
  activeOptionalCollapse.value = optionalSections
    .filter(section => userInfoForm.sections[section.key])
    .map(section => section.key as string)
}

// 折叠所有部分
const collapseAllSections = () => {
  // 折叠所有部分
  activeCollapse.value = []
  activeOptionalCollapse.value = []
}

// 初始化表单
const initForm = (data: any) => {
  // 保存原始数据
  originalData.value = JSON.parse(JSON.stringify(data || {}))

  // 加载个人简介
  userInfoForm.bio = data.bio || ''
  userInfoForm.bioEn = data.bioEn || ''

  // 加载研究方向
  userInfoForm.researchDirection = data.researchDirection || ''
  userInfoForm.researchDirectionEn = data.researchDirectionEn || ''

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
  if (data.researchProject || data.researchProjectEn) {
    userInfoForm.researchProject = data.researchProject || ''
    userInfoForm.researchProjectEn = data.researchProjectEn || ''
    userInfoForm.sections.projects = true
  }

  if (data.academicAppointment || data.academicAppointmentEn) {
    userInfoForm.academicAppointment = data.academicAppointment || ''
    userInfoForm.academicAppointmentEn = data.academicAppointmentEn || ''
    userInfoForm.sections.academic = true
  }

  if (data.awards || data.awardsEn) {
    userInfoForm.awards = data.awards || ''
    userInfoForm.awardsEn = data.awardsEn || ''
    userInfoForm.sections.awards = true
  }

  if (data.academicResearch || data.academicResearchEn) {
    userInfoForm.academicResearch = data.academicResearch || ''
    userInfoForm.academicResearchEn = data.academicResearchEn || ''
    userInfoForm.sections.research = true
  }

  if (data.publications || data.publicationsEn) {
    userInfoForm.publications = data.publications || ''
    userInfoForm.publicationsEn = data.publicationsEn || ''
    userInfoForm.sections.papers = true
  }
}

// 保存表单
const saveForm = () => {
  if (!formRef.value || loading.value) return

  formRef.value.validate((valid: boolean) => {
    if (valid) {
      // 构建要保存的数据 - 使用扁平化结构适配接口参数
      const formData = {
        // 必须保存的部分
        bio: removeSpace(userInfoForm.bio),
        bioEn: removeSpace(userInfoForm.bioEn),
        researchDirection: removeSpace(userInfoForm.researchDirection),
        researchDirectionEn: removeSpace(userInfoForm.researchDirectionEn),

        // 可选部分
        researchProject: userInfoForm.sections.projects ? removeSpace(userInfoForm.researchProject) : '',
        researchProjectEn: userInfoForm.sections.projects ? removeSpace(userInfoForm.researchProjectEn) : '',
        academicAppointment: userInfoForm.sections.academic ? removeSpace(userInfoForm.academicAppointment) : '',
        academicAppointmentEn: userInfoForm.sections.academic ? removeSpace(userInfoForm.academicAppointmentEn) : '',
        awards: userInfoForm.sections.awards ? removeSpace(userInfoForm.awards) : '',
        awardsEn: userInfoForm.sections.awards ? removeSpace(userInfoForm.awardsEn) : '',
        academicResearch: userInfoForm.sections.research ? removeSpace(userInfoForm.academicResearch) : '',
        academicResearchEn: userInfoForm.sections.research ? removeSpace(userInfoForm.academicResearchEn) : '',
        publications: userInfoForm.sections.papers ? removeSpace(userInfoForm.publications) : '',
        publicationsEn: userInfoForm.sections.papers ? removeSpace(userInfoForm.publicationsEn) : ''
      }

      // 触发保存事件
      emit('save', { ...formData, userId: props.userId })
    } else {
      // 如果验证不通过，展开所有部分，便于用户查看错误
      expandAllSections()
    }
  })
}

// 取消编辑
const cancelEdit = () => {
  // 重置表单数据
  initForm(originalData.value)
  emit('cancel')
}

// 获取表单数据
const getFormData = () => {
  // 构建要保存的数据
  const formData = {
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

  return formData
}

// 监听initialData变化，当数据更新时重新初始化表单
watch(
  () => props.initialData,
  (newVal) => {
    if (newVal && Object.keys(newVal).length > 0) {
      // 确保有数据时才初始化表单
      initForm(newVal)

      // 无论是否禁用状态，都展开有内容的面板
      expandAllPanels()
    }
  },
  { deep: true, immediate: true } // 深度监听且立即执行
)

// 监听禁用状态变化
watch(
  () => props.isDisabled,
  () => {
    if (formRef.value) {
      formRef.value.clearValidate() // 清除验证状态
    }
  }
)

// 暴露给父组件的方法
defineExpose({
  formRef,
  getFormData,
  saveForm,
  cancelEdit,
  initForm,
  expandAllSections,
  collapseAllSections
})
</script>

<style lang="less" scoped>
.academic-form-editor {
  width: 100%;
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;

  :deep(.el-form) {
    height: 100%;
    display: flex;
    flex-direction: column;
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
        height: 40px;
        line-height: 40px;

        &.is-active {
          border-bottom: 1px solid #ebeef5;
        }
      }

      .el-collapse-item__content {
        padding: 15px;
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

  .form-buttons {
    display: flex;
    justify-content: flex-start;
    gap: 10px;
    margin-top: 20px;
  }

  // 内容编辑表单项样式
  .content-form-item {
    :deep(.el-form-item__label) {
      height: 40px;
      line-height: 40px;
    }

    .editor-wrapper {
      width: 100%;

      .tiny-mce-editor {
        border-radius: 6px;
      }
    }

    :deep(.simple-tabs) {
      box-shadow: none;
      border: none;
      width: 100%;

      .el-tabs__header {
        background: #fff;
        border: none;
        margin-bottom: 4px;
        border: 1px solid var(--el-border-color);
        border-radius: 10px;
        overflow: hidden;
      }

      .el-tabs__content {
        padding: 0;
        border: none;
        background: #fff;
      }

      .el-tabs__nav-wrap {
        &::after {
          display: none;
        }
      }

      .el-tabs__nav {
        border: none !important;
      }

      .el-tabs__item {
        height: 40px !important;
        line-height: 40px !important;
        font-size: 15px;
        color: #606266;
        border: none !important;
        position: relative;
        transition: all 0.2s;

        &.is-active {
          color: var(--el-color-primary);
          font-weight: 500;
          background: transparent;

          &::after {
            content: '';
            position: absolute;
            left: 0;
            bottom: 0;
            width: 100%;
            height: 3px;
            background-color: var(--el-color-primary);
          }
        }

        &:hover {
          color: var(--el-color-primary);
        }
      }
    }
  }
}
</style>
