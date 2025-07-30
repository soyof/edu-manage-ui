<template>
  <div class="dict-code-list-container">
    <div class="panel-header">
      <span class="panel-title">
        <span v-if="currentType">{{ currentType.dictTypeName || currentType.dictType }}</span>
        <span v-else>字典项列表</span>
      </span>
      <div class="panel-actions">
        <el-tooltip content="新增字典项" placement="top">
          <el-button
            type="primary"
            :icon="Plus"
            circle
            size="small"
            :disabled="!currentType"
            @click="handleAdd"
          />
        </el-tooltip>
      </div>
    </div>
    <el-empty v-if="!currentType" description="请选择字典类型" />
    <el-scrollbar v-else>
      <div v-if="dictCodes.length === 0" class="empty-list">
        <el-empty description="暂无字典项" :imageSize="80" />
      </div>
      <div v-else class="dict-code-list">
        <div
          v-for="(item, index) in dictCodes"
          :key="index"
          :class="['dict-code-item', { 'active': currentCode?.dictId === item.dictId }]"
          @click="handleSelect(item)"
        >
          <div class="dict-code-info">
            <div class="dict-code-header">
              <div class="dict-code-primary">
                <el-tag size="small" :type="item.status === 1 ? 'success' : 'info'">
                  {{ item.dictId }}
                </el-tag>
              </div>
              <div class="dict-code-actions">
                <el-switch
                  v-model="item.status"
                  :activeValue="1"
                  :inactiveValue="0"
                  class="dict-item-switch"
                  size="small"
                  inlinePrompt
                  :activeText="'启'"
                  :inactiveText="'禁'"
                  @click.stop
                  @change="(val: any) => handleStatusChange(item, val)"
                />
                <el-tooltip content="删除" placement="top">
                  <el-button
                    type="danger"
                    :icon="Delete"
                    circle
                    size="small"
                    class="dict-item-delete"
                    @click.stop="handleDelete(item)"
                  />
                </el-tooltip>
              </div>
            </div>
            <div class="dict-code-body">
              <div class="dict-code-value">{{ item.dictValue }}</div>
              <div v-if="item.dictValueEn" class="dict-code-value-en">{{ item.dictValueEn }}</div>
            </div>
          </div>
        </div>
      </div>
    </el-scrollbar>
  </div>
</template>

<script setup lang="ts">
import { Plus, Delete } from '@element-plus/icons-vue'
import type { DictType, DictCode } from '@/types/dict'
import { ElMessage, ElMessageBox } from 'element-plus'
import service from '@/utils/services'

// 组件属性
defineProps<{
  dictCodes: DictCode[];
  currentCode: DictCode | null;
  currentType: DictType | null;
}>()

// 组件事件
const emit = defineEmits(['select', 'add', 'search', 'deleted', 'statusChange'])

// 处理选择字典项
const handleSelect = (code: DictCode) => {
  emit('select', code)
}

// 处理添加字典项
const handleAdd = () => {
  emit('add')
}

// 处理状态变更
const handleStatusChange = (item: DictCode, status: number) => {
  const statusText = status === 1 ? '启用' : '禁用'
  const originalStatus = status === 1 ? 0 : 1

  ElMessageBox.confirm(`确认${statusText}该字典项吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 调用API保存状态
    service.put(`/api/dict/status/${item.dictId}`, {
      status: status === 1 ? 0 : 1
    }).then(() => {
      ElMessage.success(`${statusText}成功`)
      emit('statusChange', { ...item, status })
    }).catch(() => {
    // 接口报错时回退状态
      item.status = originalStatus
    })
  }).catch(() => {
    item.status = originalStatus
  })
}

// 处理删除字典项
const handleDelete = (code: DictCode) => {
  ElMessageBox.confirm('确认删除该字典数据吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 这里传入dictId作为删除标识
    service.post('/api/dict/delete', { dictId: code.dictId })
      .then(() => {
        ElMessage.success('删除成功')
        emit('deleted', code)
      })
  }).catch(() => {})
}
</script>

<style scoped lang="less">
.dict-code-list-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
}

.panel-header {
  padding: 0 16px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #ebeef5;
  background-color: #fff;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    left: 16px;
    right: 16px;
    bottom: 0;
    height: 1px;
    background-color: #ebeef5;
  }
}

.panel-title {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 150px;
  position: relative;
  padding-left: 8px;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 3px;
    height: 16px;
    background-color: var(--primaryColor);
    border-radius: 1px;
  }
}

.panel-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  justify-content: flex-end;
}

  .dict-code-list {
    padding: 8px 0;
    background-color: #ffffff;
  }

  .dict-code-item {
    padding: 12px 16px;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-radius: 6px;
    margin: 4px 8px;
    transition: all 0.2s ease;
    background-color: #f9fafc;
    border: 1px solid #ebeef5;
    position: relative;
    overflow: hidden;
    box-sizing: border-box;

    &:last-child {
      margin-bottom: 8px;
    }

    &:hover {
      background-color: color-mix(in srgb, var(--primaryColor) 5%, white);
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    }

  &.active {
    background-color: color-mix(in srgb, var(--primaryColor) 10%, white);
    border-color: color-mix(in srgb, var(--primaryColor) 30%, white);

    &::before {
      content: "";
      position: absolute;
      left: 0;
      top: 0;
      height: 100%;
      width: 4px;
      background-color: var(--primaryColor);
    }
  }

  .dict-code-info {
    width: 100%;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .dict-code-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .dict-code-body {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .dict-code-primary {
    :deep(.el-tag) {
      font-weight: 500;
      border-radius: 4px;
      padding: 0 8px;
      height: 22px;
      line-height: 20px;
    }
  }

  .dict-code-value {
    font-size: 14px;
    color: #303133;
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    line-height: 1.4;
  }

  .dict-code-value-en {
    font-size: 12px;
    color: #909399;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    line-height: 1.4;
  }

  .dict-code-actions {
    display: flex;
    align-items: center;
    gap: 8px;

    .dict-item-switch {
      margin-right: 4px;
    }

    .dict-item-delete {
      font-size: 12px;
      height: 24px;
      width: 24px;
      padding: 0;

      &:hover {
        background-color: #fef0f0;
        color: #f56c6c;
      }
    }
  }
}

.empty-list {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  background-color: #ffffff;
}

.text-ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

:deep(.el-scrollbar) {
  background-color: #ffffff;
}
</style>
