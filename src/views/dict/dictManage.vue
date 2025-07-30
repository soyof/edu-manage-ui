<template>
  <div class="dict-manage-container">
    <el-card class="dict-card no-padding">
      <el-row :gutter="0" class="dict-manage-row">
        <!-- 左侧：字典类型列表 -->
        <el-col :span="5" class="dict-panel dict-type-panel">
          <DictTypeList
            v-model:currentType="currentDictType"
            :dictTypes="dictTypeList"
            :itemCounts="typeItemCounts"
            @select="handleTypeSelect"
          />
        </el-col>

        <!-- 中间：字典编码列表 -->
        <el-col :span="7" class="dict-panel dict-code-panel">
          <DictCodeList
            :currentCode="currentDictCode"
            :currentType="currentDictType"
            :dictCodes="dictCodeList"
            @select="handleCodeSelect"
            @add="handleAddItem"
            @deleted="handleItemDeleted"
            @statusChange="handleItemStatusChange"
          />
        </el-col>

        <!-- 右侧：字典详情 -->
        <el-col :span="12" class="dict-panel dict-detail-panel">
          <DictForm
            v-if="currentDictCode"
            :key="currentDictCode.dictId"
            :dictForm="dictForm"
            @reset="resetForm"
            @saved="handleItemSaved"
          />
          <div v-else class="empty-state">
            <el-empty description="请选择字典项查看详情" :imageSize="180">
              <template #image>
                <el-icon class="empty-icon"><Document /></el-icon>
              </template>
            </el-empty>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- 新增字典项对话框 -->
    <DictItemDialog
      v-model:visible="itemDialogVisible"
      v-model:loading="itemDialogLoading"
      :form="dictItemForm"
      :currentType="currentDictType"
      @submitted="handleItemSubmitted"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { Document } from '@element-plus/icons-vue'
import service from '@/utils/services'
import DictTypeList from '@/components/dict/dictTypeList.vue'
import DictCodeList from '@/components/dict/dictCodeList.vue'
import DictForm from '@/components/dict/dictForm.vue'
import DictItemDialog from '@/components/dict/dictItemDialog.vue'
import type { DictType, DictCode, TreeDictItem } from '@/types/dict'

// 当前选中的字典类型和字典项
const currentDictType = ref<DictType | null>(null)
const currentDictCode = ref<DictCode | null>(null)

// 字典类型列表和字典编码列表
const dictTypeList = ref<DictType[]>([])
const dictCodeList = ref<DictCode[]>([])

// 完整字典树数据
const dictTreeData = ref<TreeDictItem[]>([])

// 获取每个字典类型下的字典项数量
const typeItemCounts = ref<Record<string, number>>({})

// 对话框相关
const itemDialogVisible = ref(false)
const itemDialogLoading = ref(false)

// 字典项表单数据
const dictItemForm = reactive<DictCode>({
  id: '',
  dictId: '',
  dictType: '',
  dictTypeName: '',
  dictValue: '',
  dictValueEn: '',
  sortOrder: 0,
  remark: '',
  status: 1,
  createUserId: '',
  createdTimes: '',
  updateUserId: '',
  updatedTimes: ''
})

// 字典详情表单数据
const dictForm = reactive<DictCode>({
  id: '',
  dictId: '',
  dictType: '',
  dictTypeName: '',
  dictValue: '',
  dictValueEn: '',
  sortOrder: 0,
  remark: '',
  status: 1,
  createUserId: '',
  createdTimes: '',
  updateUserId: '',
  updatedTimes: ''
})

// 初始化加载数据
onMounted(() => {
  loadDictTreeData()
})

// 加载字典树形数据
const loadDictTreeData = () => {
  return service.get('/api/dict/treeList').then((res: any) => {
    dictTreeData.value = res || []
    dictTypeList.value = res.filter((item: any) => item.isType)
    typeItemCounts.value = res.reduce((acc: any, item: any) => {
      acc[item.dictType] = item.children?.length || 0
      return acc
    }, {})

    // 如果之前有选中的类型，恢复选中状态
    if (currentDictType.value) {
      const type = dictTypeList.value.find(item => item.dictType === currentDictType.value?.dictType)
      if (type) {
        handleTypeSelect(type)
      }
    }
  })
}

// 处理字典类型选择
const handleTypeSelect = (type: DictType) => {
  // 先清空当前选中的字典项和表单
  currentDictCode.value = null
  resetForm()

  // 重新获取该类型下的字典项
  const typeData = dictTreeData.value.find(item => item.dictType === type.dictType)
  if (typeData && typeData.children) {
    dictCodeList.value = typeData.children.map((child: any) => ({ ...child })).sort((a, b) => b.sortOrder - a.sortOrder)
  } else {
    dictCodeList.value = []
  }
}

// 处理字典编码选择
const handleCodeSelect = (code: DictCode) => {
  currentDictCode.value = code
  console.log(code)

  nextTick(() => {
    // 填充字典详情表单
    Object.assign(dictForm, {
      id: code.id,
      dictId: code.dictId,
      dictType: code.dictType,
      dictTypeName: code.dictTypeName,
      dictValue: code.dictValue,
      dictValueEn: code.dictValueEn || '',
      sortOrder: code.sortOrder || 0,
      remark: code.remark || '',
      status: code.status,
      createUserId: code.createUserId || '',
      createdTimes: code.createdTimes || '',
      updateUserId: code.updateUserId || '',
      updatedTimes: code.updatedTimes || '',
      isType: code.isType
    })
  })
}

// 新增字典项
const handleAddItem = () => {
  if (!currentDictType.value) {
    ElMessage.warning('请先选择字典类型')
    return
  }

  itemDialogVisible.value = true
  // 重置表单并设置父级信息
  Object.assign(dictItemForm, {
    id: '',
    dictId: '',
    dictType: currentDictType.value.dictType,
    dictTypeName: currentDictType.value.dictTypeName,
    dictValue: '',
    dictValueEn: '',
    sortOrder: 0,
    remark: '',
    status: 1,
    createUserId: '',
    createdTimes: '',
    updateUserId: '',
    updatedTimes: ''
  })
}

// 处理新增字典项提交完成
const handleItemSubmitted = () => {
  loadDictTreeData()
}

// 处理字典项保存完成
const handleItemSaved = (formInfo: DictCode) => {
  loadDictTreeData().then(() => {
    // 确保重新获取最新数据后再更新当前选中项
    if (dictCodeList.value.length > 0 && formInfo.id) {
      // 尝试在新列表中找到原来选中的项
      const updatedItem = dictCodeList.value.find(item => item.dictId === formInfo.dictId)

      if (updatedItem) {
        handleCodeSelect(updatedItem)
      }
    }
  })
}

// 处理字典项删除完成
const handleItemDeleted = (code: DictCode) => {
  // 如果删除的是当前选中项，清空表单
  if (currentDictCode.value && currentDictCode.value.id === code.id) {
    currentDictCode.value = null
    resetForm()
  }

  // 刷新列表
  loadDictTreeData()
}

// 处理字典项状态变化
const handleItemStatusChange = (code: DictCode) => {
  // 如果状态变化影响到当前选中的项，则更新表单
  if (currentDictCode.value && currentDictCode.value.id === code.id) {
    handleCodeSelect(code)
  }
}

// 清空表单
const resetForm = () => {
  if (currentDictCode.value) {
    // 如果有选中的项，重置为原始值
    handleCodeSelect(currentDictCode.value)
  } else {
    // 否则清空表单
    Object.assign(dictForm, {
      id: '',
      dictId: '',
      dictType: '',
      dictTypeName: '',
      dictValue: '',
      dictValueEn: '',
      sortOrder: 0,
      remark: '',
      status: 1,
      createUserId: '',
      createdTimes: '',
      updateUserId: '',
      updatedTimes: ''
    })
  }
}
</script>

<style scoped lang="less">
.dict-manage-container {
  width: 100%;
  height: @contentHeight;
  box-sizing: border-box;
  background-color: #f5f7fa;
  overflow: hidden;
}

.dict-card {
  height: 100%;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);

  &.no-padding :deep(.el-card__body) {
    padding: 0;
  }
}

.dict-manage-row {
  height: @contentHeight;
  margin: 0 !important;
}

// 通用面板样式
.dict-panel {
  height: 100%;
  padding: 0;
  border-right: 1px solid #e6e6e6;

  &:last-child {
    border-right: none;
  }
}

.dict-type-panel {
  background-color: #f8f9fb;
  border-right: 1px solid #e8e8e8;
}

.dict-code-panel {
  background-color: #ffffff;
  box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.03);
  z-index: 1;
  border-right: 1px solid #e8e8e8;
}

.dict-detail-panel {
  background-color: #fff;
}

.empty-state {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fff;
  flex-direction: column;
  color: #909399;

  .empty-icon {
    font-size: 64px;
    color: #c0c4cc;
    margin-bottom: 12px;
  }
}
</style>
