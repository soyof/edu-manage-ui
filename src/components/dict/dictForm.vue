<template>
  <div class="dict-form-container">
    <div class="panel-header">
      <span class="panel-title">【{{ dictForm.dictValue }}】详情</span>
      <div class="panel-actions">
        <template v-if="isEditMode">
          <el-tooltip content="保存" placement="top">
            <el-button
              type="primary"
              circle
              :icon="Check"
              size="small" @click="handleSave"
            />
          </el-tooltip>
          <el-tooltip content="取消" placement="top">
            <el-button
              circle
              :icon="Close"
              size="small"
              @click="handleCancel"
            />
          </el-tooltip>
        </template>
        <template v-else>
          <el-tooltip content="编辑" placement="top">
            <el-button type="primary" circle :icon="Edit"
              size="small" @click="handleEdit"
            />
          </el-tooltip>
        </template>
      </div>
    </div>
    <el-scrollbar>
      <div class="dict-form-wrapper">
        <el-form
          ref="formRef"
          :model="localForm"
          :rules="formRules"
          :disabled="!isEditMode"
          labelPosition="top"
          class="dict-form"
        >
          <el-row :gutter="16">
            <el-col :span="24">
              <el-form-item label="字典类型">
                <el-input :value="localForm.dictTypeName" disabled />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="排序" prop="sortOrder">
                <el-input-number
                  v-model="localForm.sortOrder"
                  :min="0"
                  :max="999"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="字典值(中文)" prop="dictValue">
                <el-input
                  v-model="localForm.dictValue"
                  placeholder="请输入字典值"
                  type="textarea"
                  :rows="2"
                />
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="字典值(英文)" prop="dictValueEn">
                <el-input
                  v-model="localForm.dictValueEn"
                  placeholder="请输入字典值(英文)"
                  type="textarea"
                  :rows="2"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="状态" prop="status">
                <el-radio-group v-model="localForm.status">
                  <el-radio :label="1" :value="1">启用</el-radio>
                  <el-radio :label="0" :value="0">禁用</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="备注" prop="remark">
                <el-input
                  v-model="localForm.remark"
                  type="textarea"
                  placeholder="请输入备注信息"
                  :rows="3"
                  maxlength="500"
                  showWordLimit
                />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>

        <!-- 创建和更新信息 -->
        <div v-show="!isEditMode" class="info-section">
          <div class="info-title">系统信息</div>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">创建人：</span>
              <span class="info-value">{{ localForm.createUserId || '-' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">创建时间：</span>
              <span class="info-value">{{ localForm.createdTimes || '-' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">更新人：</span>
              <span class="info-value">{{ localForm.updateUserId || '-' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">更新时间：</span>
              <span class="info-value">{{ localForm.updatedTimes || '-' }}</span>
            </div>
          </div>
        </div>
      </div>
    </el-scrollbar>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, reactive } from 'vue'
import type { FormInstance } from 'element-plus'
import type { DictCode, DictApiFields } from '@/types/dict'
import { ElMessage } from 'element-plus'
import { Edit, Check, Close } from '@element-plus/icons-vue'
import service from '@/utils/services'

// 组件属性
const props = defineProps<{
  dictForm: DictCode;
}>()

// 组件事件
const emit = defineEmits(['saved', 'reset', 'update:dictForm'])

// 编辑模式状态
const isEditMode = ref(false)

// 本地表单数据副本，用于取消编辑时恢复
const formBackup = ref<DictCode | null>(null)

// 表单引用
const formRef = ref<FormInstance | null>(null)

// 创建本地表单数据副本，避免直接修改props
const localForm = reactive<DictCode>({ ...props.dictForm })

// 监听dictForm变化，同步到本地表单
watch(() => props.dictForm, (newVal) => {
  Object.assign(localForm, newVal)
  isEditMode.value = false
  formBackup.value = null
}, { deep: true, immediate: true })

// 表单验证规则
const formRules = {
  dictValue: [
    { required: true, message: '请输入字典值(中文)', trigger: 'blur' },
    { max: 200, message: '长度不能超过200个字符', trigger: 'blur' }
  ],
  dictValueEn: [
    { max: 200, message: '长度不能超过200个字符', trigger: 'blur' }
  ],
  sortOrder: [
    { type: 'number', message: '排序必须为数字', trigger: 'blur' }
  ],
  remark: [
    { max: 500, message: '长度不能超过500个字符', trigger: 'blur' }
  ]
}

// 处理编辑按钮点击
const handleEdit = () => {
  // 进入编辑模式前先备份当前数据
  formBackup.value = JSON.parse(JSON.stringify(localForm))
  isEditMode.value = true
}

// 处理取消按钮点击
const handleCancel = () => {
  // 还原备份的数据
  if (formBackup.value) {
    Object.assign(localForm, formBackup.value)
  }
  isEditMode.value = false
}

// 处理保存
const handleSave = () => {
  if (!formRef.value) return

  formRef.value.validate((valid) => {
    if (valid) {
      // 创建提交数据，只包含API所需字段
      const submitData: DictApiFields = {
        dictId: props.dictForm.dictId, // 字典ID，如果提供则为更新
        dictType: localForm.dictType, // 字典类型编码
        dictTypeName: localForm.dictTypeName, // 字典类型名称
        dictValue: localForm.dictValue, // 字典值(中文)
        dictValueEn: localForm.dictValueEn, // 字典值(英文)
        sortOrder: localForm.sortOrder, // 排序
        remark: localForm.remark, // 备注
        status: localForm.status // 状态(1:启用,0:禁用)
      }

      service.post('/api/dict/save', submitData).then(() => {
        ElMessage.success('更新成功')
        isEditMode.value = false
        // 通知父组件保存成功，并传递更新后的数据
        emit('update:dictForm', {
          ...props.dictForm,
          ...localForm
        })
        emit('saved', localForm)
      })
    }
  })
}
</script>

<style scoped lang="less">
.dict-form-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.panel-header {
  padding: 0 16px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #e6e6e6;
  background-color: #fff;
}

.panel-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.panel-actions {
  display: flex;
  align-items: center;
}

.dict-form-wrapper {
  padding: 20px;
}

.dict-form {
  max-width: 800px;
  margin-bottom: 30px;
}

.info-section {
  margin-top: 20px;
  border-top: 1px dashed #dcdfe6;
  padding-top: 20px;
}

.info-title {
  font-size: 16px;
  font-weight: 500;
  color: #606266;
  margin-bottom: 15px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 12px;
}

.info-item {
  display: flex;
  align-items: flex-start;

  .info-label {
    color: #909399;
    min-width: 80px;
  }

  .info-value {
    color: #606266;
    word-break: break-all;
  }
}
</style>
