<template>
  <div class="dict-type-list-container">
    <div class="panel-header">
      <span class="panel-title">字典类型</span>
    </div>
    <el-scrollbar height="calc(100vh - 230px)">
      <div class="dict-type-list">
        <div
          v-for="(item, index) in dictTypes"
          :key="index"
          :class="['dict-type-item', { 'active': currentType?.dictId === item.dictId }]"
          @click="handleSelect(item)"
        >
          <el-tooltip :content="item.dictTypeName || item.dictType" placement="right" :showAfter="1000">
            <div class="dict-item-content">
              <el-icon><Collection /></el-icon>
              <span class="dict-item-text">{{ item.dictTypeName || item.dictType }}</span>
            </div>
          </el-tooltip>
          <span class="dict-item-count">{{ getItemCount(item) }}</span>
        </div>
      </div>
      <div v-if="dictTypes.length === 0" class="empty-list">
        <el-empty description="暂无字典类型" :imageSize="80" />
      </div>
    </el-scrollbar>
  </div>
</template>

<script setup lang="ts">
import { Collection } from '@element-plus/icons-vue'
import type { DictType } from '../types'

// 组件属性
const props = defineProps<{
  dictTypes: DictType[];
  currentType: DictType | null;
  itemCounts: Record<string, number>;
}>()

// 组件事件
const emit = defineEmits(['select', 'update:currentType'])

// 获取字典类型下的字典项数量
const getItemCount = (item: DictType): number => {
  return props.itemCounts[item.dictType] || 0
}

// 处理字典类型选择
const handleSelect = (type: DictType) => {
  emit('update:currentType', type)
  emit('select', type)
}
</script>

<style scoped lang="less">
.dict-type-list-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #f8f9fb;
}

.panel-header {
  padding: 0 16px;
  height: 56px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #e6e6e6;
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
  display: block;
  position: relative;
  padding-left: 12px;

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

.dict-type-list {
  padding: 12px 0;
}

.dict-type-item {
  padding: 12px 16px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 6px;
  margin: 4px 8px;
  transition: all 0.25s ease;
  background-color: rgba(255, 255, 255, 0.5);
  border: 1px solid transparent;
  position: relative;
  overflow: hidden;

  &:hover {
    background-color: #f0f2f5;
    transform: translateY(-1px);
  }

  &.active {
    background-color: color-mix(in srgb, var(--primaryColor) 10%, white);
    color: var(--primaryColor);
    font-weight: 500;
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

    .dict-item-count {
      background-color: var(--primaryColor);
      color: #fff;
    }
  }

  .dict-item-content {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 1;
    overflow: hidden;
  }

  .dict-item-text {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 14px;
  }

  .dict-item-count {
    background-color: #f0f2f5;
    color: #606266;
    border-radius: 10px;
    padding: 2px 8px;
    font-size: 12px;
    min-width: 22px;
    text-align: center;
    transition: all 0.25s ease;
  }
}

.empty-list {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
}
</style>
