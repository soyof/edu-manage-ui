<template>
  <div class="notice-manage-container">
    <!-- 使用通用表格页面组件 -->
    <TablePage
      ref="tablePageRef"
      :fetchData="fetchNoticeData"
      :initialSearchForm="initialSearchForm"
      @selectionChange="handleSelectionChange"
    >
      <!-- 搜索表单插槽 -->
      <template #search-form="{ form }">
        <el-col :span="6">
          <el-form-item label="通知标题">
            <el-input v-model="form.title" placeholder="请输入通知标题" clearable />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="通知类型">
            <el-select v-model="form.noticeType" placeholder="请选择通知类型" clearable>
              <el-option
                v-for="item in noticeTypeList"
                :key="item.dictId"
                :label="item.dictValue"
                :value="item.dictId"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="状态">
            <el-select v-model="form.publishStatus" placeholder="请选择状态" clearable>
              <el-option
                v-for="item in statusList"
                :key="item.dictId"
                :label="item.dictValue"
                :value="item.dictId"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="重要程度">
            <el-select v-model="form.importance" placeholder="请选择重要程度" clearable>
              <el-option
                v-for="item in importanceList"
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
              v-model="form.publishTimeRange"
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
              v-model="form.updateTimeRange"
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
        <el-tooltip content="新增通知" placement="top">
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
      <el-table-column type="selection" width="55" />
      <el-table-column
        prop="title"
        label="通知标题"
        minWidth="200"
        showOverflowTooltip
      />
      <el-table-column
        prop="noticeType"
        label="通知类型"
        width="120"
        showOverflowTooltip
      >
        <template #default="scope">
          {{ translateNoticeType(scope.row.noticeType.toString()) }}
        </template>
      </el-table-column>
      <el-table-column
        prop="publishStatus"
        label="状态"
        width="100"
        showOverflowTooltip
      >
        <template #default="scope">
          <el-tag :type="statusInfos[scope.row.publishStatus as keyof typeof statusInfos].type">
            {{ statusInfos[scope.row.publishStatus as keyof typeof statusInfos].label }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        prop="importance"
        label="重要程度"
        width="100"
        showOverflowTooltip
      >
        <template #default="scope">
          <el-tag
            :type="scope.row.importance === '3003' ? 'danger' : scope.row.importance === '3002' ? 'warning' : 'info'"
            :effect="scope.row.importance === '3003' ? 'dark' : 'light'"
          >
            {{ translateImportance(scope.row.importance.toString()) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        prop="publishTime"
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
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="scope">
          <div class="action-buttons">
            <!-- 查看 -->
            <el-tooltip
              :showAfter="1000"
              content="查看"
              placement="top"
            >
              <el-button
                circle
                type="info"
                size="small"
                @click="handleView(scope.row)"
              >
                <el-icon><View /></el-icon>
              </el-button>
            </el-tooltip>

            <!-- 编辑 - 仅未发布时可编辑 -->
            <el-tooltip
              :showAfter="1000"
              :content="scope.row.publishStatus === '1' ? '已发布通知不可编辑' : '编辑'"
              placement="top"
            >
              <el-button
                circle
                type="primary"
                size="small"
                :disabled="scope.row.publishStatus === '1'"
                @click="handleEdit(scope.row)"
              >
                <el-icon><Edit /></el-icon>
              </el-button>
            </el-tooltip>

            <!-- 发布/下线 -->
            <el-tooltip
              :showAfter="1000"
              :content="scope.row.publishStatus === '1' ? '下线' : '发布'"
              placement="top"
            >
              <el-button
                circle
                :type="scope.row.publishStatus === '1' ? 'warning' : 'success'"
                size="small"
                @click="handlePublishStatus(scope.row, scope.row.publishStatus === '1' ? 'unpublish' : 'publish')"
              >
                <el-icon v-if="scope.row.publishStatus === '1'"><TurnOff /></el-icon>
                <el-icon v-else><Check /></el-icon>
              </el-button>
            </el-tooltip>

            <!-- 删除 -->
            <el-tooltip
              :showAfter="1000"
              :content="scope.row.publishStatus === '1' ? '已发布通知不能删除' : '删除'"
              placement="top"
            >
              <el-button
                circle
                type="danger"
                size="small"
                :disabled="scope.row.publishStatus === '1'"
                @click="handleDelete(scope.row)"
              >
                <el-icon><Delete /></el-icon>
              </el-button>
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
import { View, Edit, Delete, Check, TurnOff, Plus } from '@element-plus/icons-vue'
import ThrottleButton from '@/components/global/throttleButton.vue'
import TablePage from '@/components/global/tablePage.vue'
import service from '@/utils/services'
import { useDictionary } from '@/hooks/useDictionary'

const router = useRouter()

interface NoticeItem {
  id: number
  title: string
  type: number
  typeName: string
  importance: number
  publishStatus: string
  content: string
  publishTime: string | null
  creator: string
  receiver: string
}

// 搜索表单初始值
const initialSearchForm = {
  title: '',
  noticeType: '',
  publishStatus: '',
  importance: '',
  publishTimeRange: [] as string[],
  updateTimeRange: [] as string[]
}

const { dictList: noticeTypeList, getDictLabel: translateNoticeType } = useDictionary({
  // 通知类型
  dictType: 'notice_type',
  autoLoad: true
})

const { dictList: importanceList, getDictLabel: translateImportance } = useDictionary({
  // 重要程度
  dictType: 'notice_importance',
  autoLoad: true
})

const statusList = [
  { dictId: '0', dictValue: '待发布' },
  { dictId: '1', dictValue: '已发布' },
  { dictId: '2', dictValue: '已下线' }
]

const statusInfos = {
  '0': {
    type: 'info',
    label: '待发布'
  },
  '1': {
    type: 'success',
    label: '已发布'
  },
  '2': {
    type: 'warning',
    label: '已下线'
  }
}

// 表格页面组件引用
const tablePageRef = ref<any>(null)

// 表格相关
const selectedNotices = ref<NoticeItem[]>([])

// 计算属性：判断批量删除按钮是否应该禁用
const isDeleteButtonDisabled = computed(() => {
  return selectedNotices.value.length === 0 || selectedNotices.value.some(item => item.publishStatus === '1')
})

// 获取通知数据的方法（适配tablePage组件的接口）
const fetchNoticeData = (params: any) => {
  return service.post('/api/notice/list', params)
}

// 处理表格选择变化
const handleSelectionChange = (selection: NoticeItem[]) => {
  selectedNotices.value = selection
}

// 查看通知
const handleView = (row: NoticeItem) => {
  // 显式创建标题并打印，确保标题正确传递
  const tabTitle = `通知详情【${row.title}】`
  router.push({
    path: '/noticeDetail',
    query: {
      mode: 'view',
      id: String(row.id),
      tabTitle: encodeURIComponent(tabTitle)
    }
  })
}

// 编辑通知
const handleEdit = (row: NoticeItem) => {
  const tabTitle = `编辑通知【${row.title}】`
  router.push({
    path: '/modifyNotice',
    query: {
      mode: 'edit',
      id: String(row.id),
      tabTitle: encodeURIComponent(tabTitle)
    }
  })
}

// 新增通知
const handleAdd = () => {
  const tabTitle = `新增通知`
  router.push({
    path: '/modifyNotice',
    query: {
      mode: 'add',
      tabTitle: encodeURIComponent(tabTitle)
    }
  })
}

// 删除通知
const handleDelete = (row?: NoticeItem) => {
  // 如果传入了row参数，则为单个删除，否则为批量删除
  const isBatchDelete = !row

  // 批量删除时检查是否有选中项
  if (isBatchDelete && selectedNotices.value.length === 0) {
    ElMessage.warning('请选择要删除的通知')
    return
  }

  // 检查是否包含已发布的通知
  if (isBatchDelete && selectedNotices.value.some(item => item.publishStatus === '1')) {
    ElMessage.warning('已发布的通知不能删除')
    return
  }

  // 单个删除时检查是否为已发布状态
  if (!isBatchDelete && row?.publishStatus === '1') {
    ElMessage.warning('已发布的通知不能删除')
    return
  }

  // 获取要删除的ID
  const ids = isBatchDelete
    ? selectedNotices.value.map(item => item.id)
    : row!.id

  // 确认提示信息
  const confirmMessage = isBatchDelete
    ? `确认删除选中的 ${selectedNotices.value.length} 条通知吗？`
    : '确认删除该通知吗？'

  ElMessageBox.confirm(confirmMessage, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    service.post('/api/notice/delete', { ids })
      .then(() => {
        ElMessage.success('删除成功')
        refreshTable(1)
      })
  }).catch(() => {})
}

// 处理通知发布状态（发布/下线）
const handlePublishStatus = (row: NoticeItem, action: 'publish' | 'unpublish') => {
  const isPublish = action === 'publish'
  const actionText = isPublish ? '发布' : '下线'

  ElMessageBox.confirm(`确认${actionText}该通知吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: isPublish ? 'info' : 'warning'
  }).then(() => {
    service.post('/api/notice/publish', {
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
.notice-manage-container {

  .notice-detail {
    padding: 10px;

    .notice-title {
      text-align: center;
      margin-bottom: 15px;
    }

    .notice-info {
      display: flex;
      justify-content: space-around;
      margin-bottom: 20px;
      color: #666;
      font-size: 14px;
      border-bottom: 1px solid #eee;
      padding-bottom: 10px;
    }

    .notice-content {
      line-height: 1.8;
    }
  }
}

:deep(.el-table .cell) {
  word-break: break-all;
}

.action-buttons {
  display: flex;
  gap: 8px;
  justify-content: center;

  .el-button {
    margin-left: 0;
  }
}
</style>
