<template>
  <div class="lab-profile-manage-container">
    <!-- 使用通用表格页面组件 -->
    <TablePage
      ref="tablePageRef"
      :fetchData="fetchProfileData"
      :initialSearchForm="initialSearchForm"
      @selectionChange="handleSelectionChange"
    >
      <!-- 搜索表单插槽 -->
      <template #search-form="{ form }">
        <el-col :span="6">
          <el-form-item label="简介标题">
            <el-input v-model="form.title" placeholder="请输入简介标题" clearable />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="发布状态">
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
          <el-form-item label="创建人">
            <el-input v-model="form.createUserName" placeholder="请输入创建人" clearable />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="更新人">
            <el-input v-model="form.updateUserName" placeholder="请输入更新人" clearable />
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
        <el-tooltip content="新增简介" placement="top">
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
        label="简介标题"
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
          <el-tag :type="statusInfos[scope.row.publishStatus as keyof typeof statusInfos].type">
            {{ statusInfos[scope.row.publishStatus as keyof typeof statusInfos].label }}
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
              :content="scope.row.publishStatus === '1' ? '生效中的简介不可编辑' : '编辑'"
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
              :content="scope.row.publishStatus === '1' ? '生效中的简介不能删除' : '删除'"
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

const router = useRouter()

interface ProfileItem {
  id: number
  title: string
  publishStatus: string
  content: string
  content_en: string
  publishTime: string | null
  createUserName: string
  updateUserName: string
  createdTimes: string
  updatedTimes: string
}

// 搜索表单初始值
const initialSearchForm = {
  title: '',
  publishStatus: '',
  createUserName: '',
  updateUserName: '',
  publishTimeRange: [] as string[],
  updateTimeRange: [] as string[]
}

const statusList = [
  { dictId: '0', dictValue: '待发布' },
  { dictId: '1', dictValue: '生效中' },
  { dictId: '2', dictValue: '已存档' }
]

const statusInfos = {
  '0': {
    type: 'info',
    label: '待发布'
  },
  '1': {
    type: 'success',
    label: '生效中'
  },
  '2': {
    type: 'warning',
    label: '已存档'
  }
}

// 表格页面组件引用
const tablePageRef = ref<any>(null)

// 表格相关
const selectedProfiles = ref<ProfileItem[]>([])

// 计算属性：判断批量删除按钮是否应该禁用
const isDeleteButtonDisabled = computed(() => {
  return selectedProfiles.value.length === 0 || selectedProfiles.value.some(item => item.publishStatus === '1')
})

// 获取简介数据的方法（适配tablePage组件的接口）
const fetchProfileData = (params: any) => {
  return service.post('/api/labProfile/list', params)
}

// 处理表格选择变化
const handleSelectionChange = (selection: ProfileItem[]) => {
  selectedProfiles.value = selection
}

// 查看简介
const handleView = (row: ProfileItem) => {
  const tabTitle = `简介详情【${row.title}】`
  router.push({
    path: '/labProfileDetail',
    query: {
      id: String(row.id),
      tabTitle: encodeURIComponent(tabTitle)
    }
  })
}

// 编辑简介
const handleEdit = (row: ProfileItem) => {
  const tabTitle = `编辑简介【${row.title}】`
  router.push({
    path: '/modifyLabProfile',
    query: {
      mode: 'edit',
      id: String(row.id),
      tabTitle: encodeURIComponent(tabTitle)
    }
  })
}

// 新增简介
const handleAdd = () => {
  const tabTitle = `新增简介`
  router.push({
    path: '/modifyLabProfile',
    query: {
      mode: 'add',
      tabTitle: encodeURIComponent(tabTitle)
    }
  })
}

// 删除简介
const handleDelete = (row?: ProfileItem) => {
  // 如果传入了row参数，则为单个删除，否则为批量删除
  const isBatchDelete = !row

  // 批量删除时检查是否有选中项
  if (isBatchDelete && selectedProfiles.value.length === 0) {
    ElMessage.warning('请选择要删除的简介')
    return
  }

  // 检查是否包含已发布的简介
  if (isBatchDelete && selectedProfiles.value.some(item => item.publishStatus === '1')) {
    ElMessage.warning('生效中的简介不能删除')
    return
  }

  // 单个删除时检查是否为已发布状态
  if (!isBatchDelete && row?.publishStatus === '1') {
    ElMessage.warning('生效中的简介不能删除')
    return
  }

  // 获取要删除的ID
  const ids = isBatchDelete
    ? selectedProfiles.value.map(item => item.id)
    : row!.id

  // 确认提示信息
  const confirmMessage = isBatchDelete
    ? `确认删除选中的 ${selectedProfiles.value.length} 条简介吗？`
    : '确认删除该简介吗？'

  ElMessageBox.confirm(confirmMessage, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    service.post('/api/labProfile/delete', { ids })
      .then(() => {
        ElMessage.success('删除成功')
        refreshTable(1)
      })
  }).catch(() => {})
}

// 处理简介发布状态（发布/下线）
const handlePublishStatus = (row: ProfileItem, action: 'publish' | 'unpublish') => {
  const isPublish = action === 'publish'
  const actionText = isPublish ? '发布' : '下线'
  const confirmMessage = isPublish ? '发布新简介后，当前生效中的简介将会被下线。确定要发布吗？' : '确定要将该简介下线吗？下线后将不再生效'

  ElMessageBox.confirm(confirmMessage, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: isPublish ? 'info' : 'warning'
  }).then(() => {
    service.post('/api/labProfile/publish', {
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
.lab-profile-manage-container {
  .action-buttons {
    display: flex;
    gap: 6px;
    justify-content: center;

    .el-button {
      margin-left: 0;
    }
  }
}

:deep(.el-table .cell) {
  word-break: break-all;
}
</style>
