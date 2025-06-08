<template>
  <div class="pagination-container">
    <el-pagination
      v-model:currentPage="currentPage"
      v-model:pageSize="pageSize"
      :pageSizes="pageSizesValue"
      :total="totalValue"
      :background="backgroundValue"
      class="self-pagination"
      :layout="layoutValue"
      @sizechange="handleSizeChange"
      @currentchange="handleCurrentChange"
      @prevclick="handlePrevClick"
      @nextclick="handleNextClick"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'

interface PaginationProps {
  page: string
  size: string
  total: string
}

const props = withDefaults(defineProps<{
  pager: Record<string, any>
  pageSizes?: number[]
  props?: PaginationProps
  background?: boolean
  layout?: string
}>(), {
  pageSizes: () => [10, 20, 50, 100],
  props: () => ({
    page: 'pageNo',
    size: 'pageSize',
    total: 'total'
  }),
  background: true,
  layout: 'total, ->, prev, pager, next, jumper, sizes'
})

const emit = defineEmits(['update:pager', 'change'])

// 计算属性
const pageSizesValue = computed(() => props.pageSizes)
const backgroundValue = computed(() => props.background)
const layoutValue = computed(() => props.layout)

// 获取属性键值，确保安全访问
const getPageKey = () => props.props.page
const getSizeKey = () => props.props.size
const getTotalKey = () => props.props.total

// 当前页码内部状态
const internalCurrentPage = ref(1)
// 每页条数内部状态
const internalPageSize = ref(20)

// 初始化内部状态
const initInternalState = () => {
  const pageKey = getPageKey()
  const sizeKey = getSizeKey()
  internalCurrentPage.value = props.pager[pageKey] || 1
  internalPageSize.value = props.pager[sizeKey] || props.pageSizes[0]
}

// 初始化状态
initInternalState()

// 计算当前页码
const currentPage = computed({
  get: () => internalCurrentPage.value,
  set: (val: number) => {
    internalCurrentPage.value = val
    handleCurrentChange(val)
  }
})

// 计算每页条数
const pageSize = computed({
  get: () => internalPageSize.value,
  set: (val: number) => {
    internalPageSize.value = val
    handleSizeChange(val)
  }
})

// 计算总条数
const totalValue = computed(() => {
  const totalKey = getTotalKey()
  const total = props.pager[totalKey]
  return typeof total === 'number' ? total : 0
})

// 更新分页数据
const updatePager = (newData: Record<string, any>) => {
  const updatedPager = { ...props.pager, ...newData }
  emit('update:pager', updatedPager)
}

// 处理页码变化
const handleCurrentChange = (val: number) => {
  const pageKey = getPageKey()
  console.log('页码变化:', val)
  // 更新内部状态
  internalCurrentPage.value = val
  // 更新父组件数据
  updatePager({ [pageKey]: val })
  // 触发change事件，让父组件知道需要重新加载数据
  setTimeout(() => {
    emit('change')
  }, 0)
}

// 处理上一页点击
const handlePrevClick = (val: number) => {
  handleCurrentChange(val)
}

// 处理下一页点击
const handleNextClick = (val: number) => {
  handleCurrentChange(val)
}

// 处理每页条数变化
const handleSizeChange = (val: number) => {
  const sizeKey = getSizeKey()
  const pageKey = getPageKey()

  // 更新内部状态
  internalPageSize.value = val
  internalCurrentPage.value = 1 // 重置到第一页

  // 使用更新函数而不是直接修改props
  updatePager({
    [sizeKey]: val,
    [pageKey]: 1 // 切换每页条数后通常回到第一页
  })

  // 触发change事件，让父组件知道需要重新加载数据
  setTimeout(() => {
    emit('change')
  }, 0)
}

// 监听外部pager变化，同步到内部状态
watch(() => props.pager, (newPager) => {
  const pageKey = getPageKey()
  const sizeKey = getSizeKey()

  // 同步内部状态
  if (typeof newPager[pageKey] === 'number') {
    internalCurrentPage.value = newPager[pageKey]
  }

  if (typeof newPager[sizeKey] === 'number') {
    internalPageSize.value = newPager[sizeKey]
  }
}, { deep: true, immediate: true })

// 组件挂载时初始化
onMounted(() => {
  const sizeKey = getSizeKey()

  // 检查每页条数是否在允许的范围内
  if (sizeKey in props.pager && props.pageSizes.length > 1) {
    if (!props.pageSizes.includes(props.pager[sizeKey])) {
      updatePager({ [sizeKey]: props.pageSizes[0] })
    }
  }
})
</script>

<style lang="less" scoped>
.pagination-container {
  width: 100%;
}
.self-pagination {
  padding-top: 10px;
  padding-bottom: 10px;
  width: 100%;
  display: flex;
  justify-content: flex-end;

  :deep(.el-pagination__sizes) {
    margin-right: 0;
    margin-left: 10px;
  }
}
</style>
