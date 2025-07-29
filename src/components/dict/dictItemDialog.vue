<template>
  <el-dialog
    v-model="visible"
    title="新增字典项"
    width="500px"
    destroyOnClose
    appendToBody
    @close="handleClose"
  >
    <el-form
      ref="localFormRef"
      :model="localForm"
      :rules="formRules"
      labelPosition="top"
    >
      <el-form-item label="字典类型">
        <el-input v-model="localForm.dictTypeName" disabled />
      </el-form-item>
      <el-form-item label="字典值(中文)" prop="dictValue">
        <el-input v-model="localForm.dictValue" placeholder="请输入字典值(中文)" clearable />
      </el-form-item>
      <el-form-item label="字典值(英文)" prop="dictValueEn">
        <el-input v-model="localForm.dictValueEn" placeholder="请输入字典值(英文)" clearable />
      </el-form-item>
      <el-form-item label="排序" prop="sortOrder">
        <el-input-number
          v-model="localForm.sortOrder"
          :min="0"
          :max="999"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-radio-group v-model="localForm.status">
          <el-radio :label="1" :value="1">启用</el-radio>
          <el-radio :label="0" :value="0">禁用</el-radio>
        </el-radio-group>
      </el-form-item>
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
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="loading" @click="handleSubmit">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { FormInstance } from 'element-plus'
import type { DictCode, DictType, DictApiFields } from '../types'
import { ElMessage } from 'element-plus'
import service from '@/utils/services'

// 组件属性
const props = defineProps<{
  visible: boolean;
  loading: boolean;
  form: DictCode;
  currentType: DictType | null;
}>()

// 组件事件
const emit = defineEmits(['update:visible', 'update:loading', 'submitted'])

// 本地表单引用
const localFormRef = ref<FormInstance | null>(null)

// 计算属性：本地可修改的表单数据
const localForm = ref<DictCode>({} as DictCode)

// 监听form变化，同步到本地表单
watch(() => props.form, (newVal) => {
  if (newVal) {
    localForm.value = { ...newVal }
  }
}, { immediate: true, deep: true })

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

// 处理关闭
const handleClose = () => {
  localFormRef.value?.resetFields()
}

// 处理提交
const handleSubmit = () => {
  if (!localFormRef.value) return

  localFormRef.value.validate((valid) => {
    if (valid) {
      // 复制表单数据到父组件的form
      Object.assign(props.form, localForm.value)

      // 创建提交数据，只包含API所需字段
      const submitData: DictApiFields = {
        dictType: localForm.value.dictType, // 字典类型编码
        dictTypeName: localForm.value.dictTypeName, // 字典类型名称
        dictValue: localForm.value.dictValue, // 字典值(中文)
        dictValueEn: localForm.value.dictValueEn, // 字典值(英文)
        sortOrder: localForm.value.sortOrder, // 排序
        remark: localForm.value.remark, // 备注
        status: localForm.value.status // 状态(1:启用,0:禁用)
      }

      // 设置加载状态
      emit('update:loading', true)

      service.post('/api/dict/save', submitData)
        .then(() => {
          ElMessage.success('新增字典项成功')
          emit('update:visible', false)
          emit('submitted')
        }).finally(() => {
          emit('update:loading', false)
        })
    }
  })
}

// 监听可见性，控制对话框显示
const visible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
})
</script>
