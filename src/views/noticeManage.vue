<template>
  <div class="notice-manage-container">
    <!-- 使用通用表格页面组件 -->
    <TablePage
      ref="tablePageRef"
      :fetchData="fetchNoticeData"
      :initialSearchForm="initialSearchForm"
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
            <el-select v-model="form.status" placeholder="请选择状态" clearable>
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
        <ThrottleButton type="primary" @click="handleAdd">
          新增通知
        </ThrottleButton>
        <ThrottleButton
          type="danger"
          :disabled="selectedNotices.length === 0"
          @click="handleBatchDelete"
        >
          批量删除
        </ThrottleButton>
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
        prop="isPublished"
        label="状态"
        width="100"
        showOverflowTooltip
      >
        <template #default="scope">
          <el-tag :type="scope.row.isPublished ? 'success' : 'info'">
            {{ scope.row.isPublished ? '已发布' : '未发布' }}
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
      <el-table-column label="操作" width="260" fixed="right">
        <template #default="scope">
          <el-button size="small" @click="handleView(scope.row)">查看</el-button>
          <el-button size="small" type="primary" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button
            v-if="scope.row.status === 0"
            size="small"
            type="success"
            @click="handlePublish(scope.row)"
          >
            发布
          </el-button>
          <el-button
            v-else
            size="small"
            type="warning"
            @click="handleUnpublish(scope.row)"
          >
            撤回
          </el-button>
          <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </TablePage>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
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
  status: number
  content: string
  publishTime: string | null
  creator: string
  receiver: string
}

// 搜索表单初始值
const initialSearchForm = {
  title: '',
  noticeType: '',
  status: '',
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
  { dictId: 0, dictValue: '未发布' },
  { dictId: 1, dictValue: '已发布' }
]

// 表格页面组件引用
const tablePageRef = ref<any>(null)

// 表格相关
const selectedNotices = ref<NoticeItem[]>([])

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
  import('@/utils/tabUtils').then(({ addTab }) => {
    addTab({
      path: '/modifyNotice',
      query: {
        mode: 'view',
        id: String(row.id)
      },
      title: `查看通知【${row.title}】`
    })
  })
}

// 编辑通知
const handleEdit = (row: NoticeItem) => {
  router.push({
    path: '/modifyNotice',
    query: {
      mode: 'edit',
      tabTitle: encodeURIComponent(`编辑通知【${row.title}】`),
      id: String(row.id)
    }
  })
}

// 新增通知
const handleAdd = () => {
  router.push({
    path: '/modifyNotice',
    query: {
      mode: 'add',
      tabTitle: encodeURIComponent(`新增通知`)
    }
  })
}

// 删除通知
const handleDelete = (row: NoticeItem) => {
  ElMessageBox.confirm('确认删除该通知吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {

  }).catch(() => {})
}

// 批量删除
const handleBatchDelete = () => {
  if (selectedNotices.value.length === 0) {
    ElMessage.warning('请选择要删除的通知')
    return
  }

  ElMessageBox.confirm(`确认删除选中的 ${selectedNotices.value.length} 条通知吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
  }).catch(() => {})
}

// 发布通知
const handlePublish = (row: NoticeItem) => {
  ElMessageBox.confirm('确认发布该通知吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'info'
  }).then(() => {
  }).catch(() => {})
}

// 撤回通知
const handleUnpublish = (row: NoticeItem) => {
  ElMessageBox.confirm('确认撤回该通知吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
  }).catch(() => {})
}

// 刷新表格数据
const refreshTable = () => {
  if (tablePageRef.value) {
    tablePageRef.value.getList()
  }
}

// 添加表格选择事件监听
onMounted(() => {
  // 需要在表格初始化后添加selection-change事件监听
  setTimeout(() => {
    const tableElement = document.querySelector('.notice-manage-container .el-table')
    if (tableElement) {
      tableElement.addEventListener('selection-change', (event: any) => {
        handleSelectionChange(event.detail)
      })
    }
  }, 500)
})
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
</style>
