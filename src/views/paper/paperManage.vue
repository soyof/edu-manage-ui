<template>
  <div class="paper-manage-container common-action-column">
    <!-- 使用通用表格页面组件 -->
    <TablePage
      ref="tablePageRef"
      :fetchData="fetchPaperData"
      :initialSearchForm="initialSearchForm"
      @selectionChange="handleSelectionChange"
    >
      <!-- 搜索表单插槽 -->
      <template #search-form="{ form }">
        <el-col :span="6">
          <el-form-item label="论文标题">
            <el-input v-model="form.title" placeholder="请输入论文标题" clearable />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="发布状态">
            <el-select v-model="form.publishStatus" placeholder="请选择发布状态" clearable>
              <el-option
                v-for="item in PaperStatus.list"
                :key="item.dictId"
                :label="item.dictValue"
                :value="item.dictId"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="发布时间">
            <el-date-picker
              v-model="form.publishTimesRange"
              type="daterange"
              rangeSeparator="至"
              startPlaceholder="开始日期"
              endPlaceholder="结束日期"
              valueFormat="YYYY-MM-DD"
            />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="更新时间">
            <el-date-picker
              v-model="form.updatedTimesRange"
              type="daterange"
              rangeSeparator="至"
              startPlaceholder="开始日期"
              endPlaceholder="结束日期"
              valueFormat="YYYY-MM-DD"
            />
          </el-form-item>
        </el-col>
      </template>

      <!-- 操作区域插槽 -->
      <template #operation>
        <el-tooltip content="新增论文" placement="top">
          <ThrottleButton size="small" type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
          </ThrottleButton>
        </el-tooltip>
        <el-tooltip content="批量删除" placement="top">
          <ThrottleButton
            size="small"
            type="danger"
            :disabled="isDeleteButtonDisabled"
            @click="handleDelete()"
          >
            <el-icon><Delete /></el-icon>
          </ThrottleButton>
        </el-tooltip>
      </template>

      <!-- 表格列插槽 -->
      <el-table-column type="selection" width="50" fixed="left" />
      <el-table-column
        prop="title"
        label="论文标题"
        minWidth="200"
        showOverflowTooltip
      />
      <el-table-column
        prop="publishStatus"
        label="发布状态"
        width="100"
        showOverflowTooltip
      >
        <template #default="scope">
          <el-tag :type="PaperStatus.getTagType(scope.row.publishStatus)">
            {{ PaperStatus.getName(scope.row.publishStatus) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        prop="paperPublishTimes"
        label="文献发布时间"
        width="180"
        showOverflowTooltip
      />
      <el-table-column
        prop="publishUserName"
        label="发布人"
        width="120"
        showOverflowTooltip
      />
      <el-table-column
        prop="publishTimes"
        label="发布时间"
        width="180"
        showOverflowTooltip
      />
      <el-table-column
        prop="updateUserName"
        label="更新人"
        width="120"
        showOverflowTooltip
      />
      <el-table-column
        prop="updatedTimes"
        label="更新时间"
        width="180"
        showOverflowTooltip
      />
      <el-table-column
        prop="createUserName"
        label="创建人"
        width="120"
        showOverflowTooltip
      />
      <el-table-column
        prop="createdTimes"
        label="创建时间"
        width="180"
        showOverflowTooltip
      />
      <el-table-column label="操作" width="130" fixed="right">
        <template #default="scope">
          <div class="action-buttons">
            <!-- 查看 -->
            <el-tooltip
              content="查看"
              placement="top"
              :showAfter="1000"
              :hideAfter="0"
            >
              <span class="action-icon-wrapper" @click="handleView(scope.row)">
                <el-icon class="action-icon view-icon"><View /></el-icon>
              </span>
            </el-tooltip>

            <!-- 编辑 - 仅未发布时可编辑 -->
            <el-tooltip
              :content="scope.row.publishStatus === '1' ? '已发布论文不可编辑' : '编辑'"
              placement="top"
              :showAfter="1000"
              :hideAfter="0"
            >
              <span
                class="action-icon-wrapper"
                :class="{'disabled-wrapper': scope.row.publishStatus === '1'}"
                @click="scope.row.publishStatus !== '1' && handleEdit(scope.row)"
              >
                <el-icon class="action-icon edit-icon"><EditPen /></el-icon>
              </span>
            </el-tooltip>

            <!-- 发布/下线 -->
            <el-tooltip
              :content="scope.row.publishStatus === '1' ? '下线' : '发布'"
              placement="top"
              :showAfter="1000"
              :hideAfter="0"
            >
              <span
                class="action-icon-wrapper"
                @click="handlePublishStatus(scope.row, scope.row.publishStatus === '1' ? 'unpublish' : 'publish')"
              >
                <el-icon class="action-icon" :class="scope.row.publishStatus === '1' ? 'unpublish-icon' : 'publish-icon'">
                  <CircleClose v-if="scope.row.publishStatus === '1'" />
                  <Check v-else />
                </el-icon>
              </span>
            </el-tooltip>

            <!-- 删除 -->
            <el-tooltip :content="scope.row.publishStatus === '1' ? '已发布论文不能删除' : '删除'" placement="top">
              <span
                class="action-icon-wrapper"
                :class="{'disabled-wrapper': scope.row.publishStatus === '1'}"
                @click="scope.row.publishStatus !== '1' && handleDelete(scope.row)"
              >
                <el-icon class="action-icon delete-icon"><Delete /></el-icon>
              </span>
            </el-tooltip>
          </div>
        </template>
      </el-table-column>
    </TablePage>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { View, EditPen, Delete, Check, CircleClose, Plus } from '@element-plus/icons-vue'
import ThrottleButton from '@/components/global/throttleButton.vue'
import TablePage from '@/components/global/tablePage.vue'
import service from '@/utils/services'
import { StatusEnum } from '@/dic/statusConfig'

// 创建论文状态配置
const PaperStatus = {
  list: [
    { dictId: StatusEnum.PENDING, dictValue: '待发布' },
    { dictId: StatusEnum.ACTIVE, dictValue: '已发布' },
    { dictId: StatusEnum.ARCHIVED, dictValue: '已下线' }
  ],
  tags: {
    [StatusEnum.PENDING]: {
      type: 'info',
      label: '待发布'
    },
    [StatusEnum.ACTIVE]: {
      type: 'success',
      label: '已发布'
    },
    [StatusEnum.ARCHIVED]: {
      type: 'warning',
      label: '已下线'
    }
  } as Record<string, { type: string; label: string }>,
  getTagType: (status: string): string => {
    return PaperStatus.tags[status]?.type || ''
  },
  getName: (status: string): string => {
    const option = PaperStatus.list.find(item => item.dictId === status)
    return option ? option.dictValue : status
  }
}

const router = useRouter()

interface PaperItem {
  id: number
  title: string
  titleEn: string
  publishStatus: string
  paperPublishTimes: string | null
  publishTimes: string | null
  publishUserName: string | null
  updateUserName: string | null
  updatedTimes: string | null
  createUserName: string
  createdTimes: string
}

// 搜索表单初始值
const initialSearchForm = {
  title: '',
  titleEn: '',
  publishStatus: '',
  publishTimesRange: [] as string[],
  updatedTimesRange: [] as string[]
}

// 表格页面组件引用
const tablePageRef = ref<any>(null)

// 表格相关
const selectedPapers = ref<PaperItem[]>([])

// 计算属性：判断批量删除按钮是否应该禁用
const isDeleteButtonDisabled = computed(() => {
  return selectedPapers.value.length === 0 || selectedPapers.value.some(item => item.publishStatus === '1')
})

// 获取论文数据的方法（适配tablePage组件的接口）
const fetchPaperData = (params: any) => {
  return service.post('/api/paper/list', params)
}

// 处理表格选择变化
const handleSelectionChange = (selection: PaperItem[]) => {
  selectedPapers.value = selection
}

// 查看论文
const handleView = (row: PaperItem) => {
  const tabTitle = `论文详情【${row.title}】`
  router.push({
    path: '/paperDetail',
    query: {
      mode: 'view',
      id: String(row.id),
      tabTitle: encodeURIComponent(tabTitle)
    }
  })
}

// 编辑论文
const handleEdit = (row: PaperItem) => {
  const tabTitle = `编辑论文【${row.title}】`
  router.push({
    path: '/modifyPaper',
    query: {
      mode: 'edit',
      id: String(row.id),
      tabTitle: encodeURIComponent(tabTitle)
    }
  })
}

// 新增论文
const handleAdd = () => {
  const tabTitle = `新增论文`
  router.push({
    path: '/modifyPaper',
    query: {
      mode: 'add',
      tabTitle: encodeURIComponent(tabTitle)
    }
  })
}

// 删除论文
const handleDelete = (row?: PaperItem) => {
  // 如果传入了row参数，则为单个删除，否则为批量删除
  const isBatchDelete = !row

  // 批量删除时检查是否有选中项
  if (isBatchDelete && selectedPapers.value.length === 0) {
    ElMessage.warning('请选择要删除的论文')
    return
  }

  // 检查是否包含已发布的论文
  if (isBatchDelete && selectedPapers.value.some(item => item.publishStatus === '1')) {
    ElMessage.warning('已发布的论文不能删除')
    return
  }

  // 单个删除时检查是否为已发布状态
  if (!isBatchDelete && row?.publishStatus === '1') {
    ElMessage.warning('已发布的论文不能删除')
    return
  }

  // 获取要删除的ID
  const ids = isBatchDelete
    ? selectedPapers.value.map(item => item.id)
    : row!.id

  // 确认提示信息
  const confirmMessage = isBatchDelete
    ? `确认删除选中的 ${selectedPapers.value.length} 条论文信息吗？`
    : '确认删除该论文信息吗？'

  ElMessageBox.confirm(confirmMessage, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    service.post('/api/paper/delete', { ids })
      .then(() => {
        ElMessage.success('删除成功')
        refreshTable(1)
      })
  }).catch(() => {})
}

// 处理论文发布状态（发布/下线）
const handlePublishStatus = (row: PaperItem, action: 'publish' | 'unpublish') => {
  const isPublish = action === 'publish'
  const actionText = isPublish ? '发布' : '下线'

  ElMessageBox.confirm(`确认${actionText}该论文吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: isPublish ? 'info' : 'warning'
  }).then(() => {
    service.post('/api/paper/publish', {
      id: row.id,
      action
    }).then(() => {
      ElMessage.success(`${actionText}成功`)
      refreshTable(1)
    })
  }).catch(() => {})
}

// 刷新表格数据
const refreshTable = (pageNum: number) => {
  if (tablePageRef.value) {
    tablePageRef.value.getList(pageNum)
  }
}
</script>

<style scoped lang="less">
.paper-manage-container {
  .paper-detail {
    padding: 10px;

    .paper-title {
      text-align: center;
      margin-bottom: 15px;
    }

    .paper-info {
      display: flex;
      justify-content: space-around;
      margin-bottom: 20px;
      color: #666;
      font-size: 14px;
      border-bottom: 1px solid #eee;
      padding-bottom: 10px;
    }

    .paper-content {
      line-height: 1.8;
    }
  }
}

:deep(.el-table .cell) {
  word-break: break-all;
}
</style>
