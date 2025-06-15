<template>
  <div ref="pageRef" v-loading="loading" class="table-page">
    <div v-if="showSearch" ref="headerRef" class="table-page-header">
      <el-form
        ref="ruleFormRef"
        :model="searchForm"
        statusIcon
        labelWidth="auto"
        size="default"
        inline
      >
        <slot name="search-form" :form="searchForm"></slot>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            查询
          </el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div v-if="showOperation" ref="operaRef" class="table-page-opera">
      <slot name="operation"></slot>
    </div>
    <div ref="tableRef" class="table-page-content">
      <el-table
        :data="tableList"
        border
        :height="tableHeight"
        v-bind="$attrs"
      >
        <slot></slot>
      </el-table>
    </div>
    <div v-if="showPagination" ref="pagerRef" class="table-page-pager">
      <Pagination
        v-model:pager="pager"
        @change="getList"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import Pagination from '@/components/global/pagination.vue'
import { ref, useTemplateRef } from 'vue'
import { useAutoTable } from '@/hooks/useAutoTable'

const props = defineProps({
  // 是否显示搜索区域
  showSearch: {
    type: Boolean,
    default: true
  },
  // 是否显示操作区域
  showOperation: {
    type: Boolean,
    default: true
  },
  // 是否显示分页
  showPagination: {
    type: Boolean,
    default: true
  },
  // 初始搜索表单数据
  initialSearchForm: {
    type: Object,
    default: () => ({})
  },
  // 获取数据的方法
  fetchData: {
    type: Function,
    required: true
  }
})

const emit = defineEmits(['update:searchForm', 'search', 'reset'])

const pager = ref({
  pageNo: 1,
  pageSize: 20,
  total: 0
})

const searchForm = ref({ ...props.initialSearchForm })
const tableList = ref([])
const loading = ref(false)

// 表格相关引用
const pageRef = useTemplateRef('pageRef')
const headerRef = useTemplateRef('headerRef')
const operaRef = useTemplateRef('operaRef')
const pagerRef = useTemplateRef('pagerRef')

// 使用自动表格高度计算钩子
const { tableHeight } = useAutoTable({
  pageRef,
  deductRefs: [headerRef, operaRef, pagerRef]
})

const resetForm = () => {
  searchForm.value = { ...props.initialSearchForm }
  emit('reset', searchForm.value)
}

const handleSearch = () => {
  emit('search', searchForm.value)
  getList()
}

const getList = () => {
  loading.value = true
  props.fetchData({
    pageNo: pager.value.pageNo,
    pageSize: pager.value.pageSize,
    ...searchForm.value
  }).then((res: any) => {
    pager.value = {
      ...pager.value,
      total: res.total || 0
    }
    tableList.value = res.list || []
  }).finally(() => {
    loading.value = false
  })
}

// 暴露方法给父组件
defineExpose({
  getList,
  resetForm,
  searchForm
})

// 初始化加载数据
getList()
</script>

<style lang="less" scoped>
.table-page {
  width: 100%;
  height: 100%;
  min-height: @contentHeight;
  max-height: @contentHeight;
  background-color: @pageBgColor;
  padding: 6px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  .table-page-header {
    width: 100%;
    :deep(.el-form) {
      .el-form-item {
        margin-right: 12px;
        margin-bottom: 8px;
        .el-input,
        .el-select {
          width: 180px;
        }
      }
    }
  }
  .table-page-opera {
    padding-bottom: 8px;
  }
  .table-page-content {
    width: 100%;
    .el-table {
      width: 100%;
    }
  }
}
</style>
