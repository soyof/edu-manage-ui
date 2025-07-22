<template>
  <div class="patent-manage-container common-action-column">
    <!-- 使用通用表格页面组件 -->
    <TablePage
      ref="tablePageRef"
      :fetchData="fetchPatentData"
      :initialSearchForm="initialSearchForm"
      @selectionChange="handleSelectionChange"
    >
      <!-- 搜索表单插槽 -->
      <template #search-form="{ form }">
        <el-col :span="6">
          <el-form-item label="专利名称">
            <el-input v-model="form.title" placeholder="请输入专利名称" clearable />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="申请号">
            <el-input v-model="form.applicationNum" placeholder="请输入申请号" clearable />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="发布状态">
            <el-select v-model="form.publishStatus" placeholder="请选择发布状态" clearable>
              <el-option
                v-for="item in PatentStatus.list"
                :key="item.dictId"
                :label="item.dictValue"
                :value="item.dictId"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="申请日期">
            <el-date-picker
              v-model="form.applicationDateRange"
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
        <el-tooltip content="新增专利" placement="top">
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
        label="专利名称"
        minWidth="180"
        showOverflowTooltip
      />
      <el-table-column
        prop="applicationNum"
        label="申请号"
        width="120"
        showOverflowTooltip
      />
      <el-table-column
        prop="applicants"
        label="申请人"
        width="150"
        showOverflowTooltip
      />
      <el-table-column
        prop="publishStatus"
        label="发布状态"
        width="100"
        showOverflowTooltip
      >
        <template #default="scope">
          <el-tag :type="PatentStatus.getTagType(scope.row.publishStatus)">
            {{ PatentStatus.getName(scope.row.publishStatus) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        prop="isServicePatent"
        label="职务专利"
        width="100"
        showOverflowTooltip
      >
        <template #default="scope">
          <el-tag :type="scope.row.isServicePatent === '1' ? 'success' : 'info'">
            {{ scope.row.isServicePatent === '1' ? '是' : '否' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        prop="applicationDate"
        label="申请日期"
        width="120"
        showOverflowTooltip
      />
      <el-table-column
        prop="authorizationDate"
        label="授权日期"
        width="120"
        showOverflowTooltip
      />
      <el-table-column
        prop="patentPublishDate"
        label="专利发布日期"
        width="120"
        showOverflowTooltip
      />
      <el-table-column
        prop="updateUserName"
        label="更新人"
        width="100"
        showOverflowTooltip
      />
      <el-table-column
        prop="updatedTimes"
        label="更新时间"
        width="160"
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
              :content="scope.row.publishStatus === '1' ? '已发布专利不可编辑' : '编辑'"
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
            <el-tooltip :content="scope.row.publishStatus === '1' ? '已发布专利不能删除' : '删除'" placement="top">
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
import { PatentStatus } from '@/dic/statusConfig'

const router = useRouter()

interface PatentItem {
  id: number
  title: string
  titleEn: string
  publishStatus: string
  applicationNum: string
  applicants: string
  isServicePatent: string
  applicationDate: string
  authorizationDate: string | null
  patentPublishDate: string | null
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
  applicationNum: '',
  publishStatus: '',
  applicationDateRange: [] as string[],
  updatedTimesRange: [] as string[]
}

// 表格页面组件引用
const tablePageRef = ref<any>(null)

// 表格相关
const selectedPatents = ref<PatentItem[]>([])

// 计算属性：判断批量删除按钮是否应该禁用
const isDeleteButtonDisabled = computed(() => {
  return selectedPatents.value.length === 0 || selectedPatents.value.some(item => item.publishStatus === '1')
})

// 获取专利数据的方法（适配tablePage组件的接口）
const fetchPatentData = (params: any) => {
  return service.post('/api/patent/list', params)
}

// 处理表格选择变化
const handleSelectionChange = (selection: PatentItem[]) => {
  selectedPatents.value = selection
}

// 查看专利
const handleView = (row: PatentItem) => {
  const tabTitle = `专利详情【${row.title}】`
  router.push({
    path: '/patentDetail',
    query: {
      mode: 'view',
      id: String(row.id),
      tabTitle: encodeURIComponent(tabTitle)
    }
  })
}

// 编辑专利
const handleEdit = (row: PatentItem) => {
  const tabTitle = `编辑专利【${row.title}】`
  router.push({
    path: '/modifyPatent',
    query: {
      mode: 'edit',
      id: String(row.id),
      tabTitle: encodeURIComponent(tabTitle)
    }
  })
}

// 新增专利
const handleAdd = () => {
  const tabTitle = `新增专利`
  router.push({
    path: '/modifyPatent',
    query: {
      mode: 'add',
      tabTitle: encodeURIComponent(tabTitle)
    }
  })
}

// 删除专利
const handleDelete = (row?: PatentItem) => {
  // 如果传入了row参数，则为单个删除，否则为批量删除
  const isBatchDelete = !row

  // 批量删除时检查是否有选中项
  if (isBatchDelete && selectedPatents.value.length === 0) {
    ElMessage.warning('请选择要删除的专利')
    return
  }

  // 检查是否包含已发布的专利
  if (isBatchDelete && selectedPatents.value.some(item => item.publishStatus === '1')) {
    ElMessage.warning('已发布的专利不能删除')
    return
  }

  // 单个删除时检查是否为已发布状态
  if (!isBatchDelete && row?.publishStatus === '1') {
    ElMessage.warning('已发布的专利不能删除')
    return
  }

  // 获取要删除的ID
  const ids = isBatchDelete
    ? selectedPatents.value.map(item => item.id)
    : row!.id

  // 确认提示信息
  const confirmMessage = isBatchDelete
    ? `确认删除选中的 ${selectedPatents.value.length} 条专利信息吗？`
    : '确认删除该专利信息吗？'

  ElMessageBox.confirm(confirmMessage, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    service.post('/api/patent/delete', { ids })
      .then(() => {
        ElMessage.success('删除成功')
        refreshTable(1)
      })
  }).catch(() => {})
}

// 处理专利发布状态（发布/下线）
const handlePublishStatus = (row: PatentItem, action: 'publish' | 'unpublish') => {
  const isPublish = action === 'publish'
  const actionText = isPublish ? '发布' : '下线'

  ElMessageBox.confirm(`确认${actionText}该专利吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: isPublish ? 'info' : 'warning'
  }).then(() => {
    service.post('/api/patent/publish', {
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
.patent-manage-container {
  .patent-detail {
    padding: 10px;

    .patent-title {
      text-align: center;
      margin-bottom: 15px;
    }

    .patent-info {
      display: flex;
      justify-content: space-around;
      margin-bottom: 20px;
      color: #666;
      font-size: 14px;
      border-bottom: 1px solid #eee;
      padding-bottom: 10px;
    }

    .patent-content {
      line-height: 1.8;
    }
  }
}

:deep(.el-table .cell) {
  word-break: break-all;
}
</style>
