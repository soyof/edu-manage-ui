<template>
  <div class="instrument-manage-container common-action-column">
    <!-- 使用通用表格页面组件 -->
    <TablePage
      ref="tablePageRef"
      :fetchData="fetchInstrumentData"
      :initialSearchForm="initialSearchForm"
      @selectionChange="handleSelectionChange"
    >
      <!-- 搜索表单插槽 -->
      <template #search-form="{ form }">
        <el-col :span="6">
          <el-form-item label="仪器名称">
            <el-input v-model="form.instName" placeholder="请输入仪器名称" clearable />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="生产厂家">
            <el-input v-model="form.manufacturer" placeholder="请输入生产厂家" clearable />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="型号">
            <el-input v-model="form.model" placeholder="请输入型号" clearable />
          </el-form-item>
        </el-col>
        <el-col v-if="isAdmin" :span="6">
          <el-form-item label="发布状态">
            <el-select v-model="form.publishStatus" placeholder="请选择发布状态" clearable>
              <el-option
                v-for="item in InstrumentStatus.list"
                :key="item.dictId"
                :label="item.dictValue"
                :value="item.dictId"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="创建人">
            <el-input v-model="form.createUserId" placeholder="请输入创建人" clearable />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="发布时间">
            <el-date-picker
              v-model="form.publishTimesRange"
              type="daterange"
              rangeSeparator="~"
              startPlaceholder="开始日期"
              endPlaceholder="结束日期"
              valueFormat="YYYY-MM-DD"
            />
          </el-form-item>
        </el-col>
      </template>

      <!-- 操作区域插槽 -->
      <template #operation>
        <template v-if="isAdmin">
          <el-tooltip
            content="新增仪器"
            placement="top"
            :showAfter="200"
            :hideAfter="0"
          >
            <ThrottleButton size="small" type="primary" @click="handleAdd">
              <el-icon><Plus /></el-icon>
            </ThrottleButton>
          </el-tooltip>
          <el-tooltip
            content="批量删除"
            placement="top"
            :showAfter="200"
            :hideAfter="0"
          >
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
      </template>

      <!-- 表格列插槽 -->
      <el-table-column v-if="isAdmin" type="selection" width="50"
        fixed="left"
      />
      <el-table-column
        prop="instName"
        label="仪器名称"
        minWidth="180"
        showOverflowTooltip
      >
        <template #default="scope">
          <span
            class="clickable-title"
            :title="scope.row.instName"
            @click="handleView(scope.row)"
          >
            {{ scope.row.instName }}
          </span>
        </template>
      </el-table-column>
      <el-table-column
        prop="manufacturer"
        label="生产厂家"
        width="160"
        showOverflowTooltip
      />
      <el-table-column
        prop="model"
        label="型号"
        width="120"
        showOverflowTooltip
      />
      <el-table-column
        prop="publishStatus"
        label="发布状态"
        width="100"
        showOverflowTooltip
      >
        <template #default="scope">
          <el-tag :type="InstrumentStatus.getTagType(scope.row.publishStatus)">
            {{ InstrumentStatus.getName(scope.row.publishStatus) }}
          </el-tag>
        </template>
      </el-table-column>
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
      <el-table-column
        v-if="isAdmin"
        label="操作"
        width="110"
        fixed="right"
      >
        <template #default="scope">
          <div class="action-buttons">
            <!-- 编辑 - 仅未发布时可编辑 -->
            <el-tooltip
              :content="scope.row.publishStatus === '1' ? '已发布仪器不可编辑' : '编辑'"
              placement="top"
              :showAfter="200"
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
              :showAfter="200"
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
            <el-tooltip
              :content="scope.row.publishStatus === '1' ? '已发布仪器不能删除' : '删除'"
              placement="top"
              :showAfter="200"
              :hideAfter="0"
            >
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
import { useUserInfoStore } from '@/stores/userInfo'
import { EditPen, Delete, Check, CircleClose, Plus } from '@element-plus/icons-vue'
import ThrottleButton from '@/components/global/throttleButton.vue'
import TablePage from '@/components/global/tablePage.vue'
import service from '@/utils/services'
import { createStatusConfig } from '@/dic/statusConfig'

// 创建仪器状态配置
const InstrumentStatus = createStatusConfig('待发布', '已发布', '已下线')

const router = useRouter()
const userInfoStore = useUserInfoStore()

// 获取管理员权限状态
const isAdmin = userInfoStore.isAdmin

interface InstrumentItem {
  id: number
  instName: string
  instNameEn: string
  manufacturer: string
  manufacturerEn: string
  model: string
  publishStatus: string
  publishTimes: string | null
  publishUserName: string | null
  updateUserName: string | null
  updatedTimes: string | null
  createUserName: string
  createdTimes: string
}

// 搜索表单初始值
const initialSearchForm = {
  instName: '',
  manufacturer: '',
  model: '',
  publishStatus: '',
  createUserId: '',
  publishTimesRange: [] as string[]
}

// 表格页面组件引用
const tablePageRef = ref<any>(null)

// 表格相关
const selectedInstruments = ref<InstrumentItem[]>([])

// 计算属性：判断批量删除按钮是否应该禁用
const isDeleteButtonDisabled = computed(() => {
  return selectedInstruments.value.length === 0 || selectedInstruments.value.some(item => item.publishStatus === '1')
})

// 获取仪器数据的方法（适配tablePage组件的接口）
const fetchInstrumentData = (params: any) => {
  return service.post('/api/instrument/list', params)
}

// 处理表格选择变化
const handleSelectionChange = (selection: InstrumentItem[]) => {
  selectedInstruments.value = selection
}

// 查看仪器
const handleView = (row: InstrumentItem) => {
  const tabTitle = `仪器详情【${row.instName}】`
  router.push({
    path: '/instrumentDetail',
    query: {
      mode: 'view',
      id: String(row.id),
      tabTitle: encodeURIComponent(tabTitle)
    }
  })
}

// 编辑仪器
const handleEdit = (row: InstrumentItem) => {
  const tabTitle = `编辑仪器【${row.instName}】`
  router.push({
    path: '/modifyInstrumentInfos',
    query: {
      mode: 'edit',
      id: String(row.id),
      tabTitle: encodeURIComponent(tabTitle)
    }
  })
}

// 新增仪器
const handleAdd = () => {
  const tabTitle = `新增仪器`
  router.push({
    path: '/modifyInstrumentInfos',
    query: {
      mode: 'add',
      tabTitle: encodeURIComponent(tabTitle)
    }
  })
}

// 删除仪器
const handleDelete = (row?: InstrumentItem) => {
  // 如果传入了row参数，则为单个删除，否则为批量删除
  const isBatchDelete = !row

  // 批量删除时检查是否有选中项
  if (isBatchDelete && selectedInstruments.value.length === 0) {
    ElMessage.warning('请选择要删除的仪器')
    return
  }

  // 检查是否包含已发布的仪器
  if (isBatchDelete && selectedInstruments.value.some(item => item.publishStatus === '1')) {
    ElMessage.warning('已发布的仪器不能删除')
    return
  }

  // 单个删除时检查是否为已发布状态
  if (!isBatchDelete && row?.publishStatus === '1') {
    ElMessage.warning('已发布的仪器不能删除')
    return
  }

  // 获取要删除的ID
  const ids = isBatchDelete
    ? selectedInstruments.value.map(item => item.id)
    : row!.id

  // 确认提示信息
  const confirmMessage = isBatchDelete
    ? `确认删除选中的 ${selectedInstruments.value.length} 条仪器信息吗？`
    : '确认删除该仪器信息吗？'

  ElMessageBox.confirm(confirmMessage, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    service.post('/api/instrument/delete', { ids })
      .then(() => {
        ElMessage.success('删除成功')
        refreshTable(1)
      })
  }).catch(() => {})
}

// 处理仪器发布状态（发布/下线）
const handlePublishStatus = (row: InstrumentItem, action: 'publish' | 'unpublish') => {
  const isPublish = action === 'publish'
  const actionText = isPublish ? '发布' : '下线'

  ElMessageBox.confirm(`确认${actionText}该仪器吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: isPublish ? 'info' : 'warning'
  }).then(() => {
    service.post('/api/instrument/publish', {
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
.instrument-manage-container {
  :deep(.el-table .cell) {
    word-break: break-all;
  }
}
</style>
