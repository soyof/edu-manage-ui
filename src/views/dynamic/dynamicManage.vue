<template>
  <div class="dynamic-manage-container common-action-column">
    <!-- 使用通用表格页面组件 -->
    <TablePage
      ref="tablePageRef"
      :fetchData="fetchDynamicData"
      :initialSearchForm="initialSearchForm"
      @selectionChange="handleSelectionChange"
    >
      <!-- 搜索表单插槽 -->
      <template #search-form="{ form }">
        <el-col :span="6">
          <el-form-item label="动态标题">
            <el-input v-model="form.title" placeholder="请输入动态标题" clearable />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="类型">
            <el-select v-model="form.dynamicType" placeholder="请选择类型" clearable>
              <el-option
                v-for="item in dynamicTypeList"
                :key="item.dictId"
                :label="item.dictValue"
                :value="item.dictId"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col v-if="isAdmin" :span="6">
          <el-form-item label="发布状态">
            <el-select v-model="form.publishStatus" placeholder="请选择状态" clearable>
              <el-option
                v-for="item in DynamicStatus.list"
                :key="item.dictId"
                :label="item.dictValue"
                :value="item.dictId"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="动态发布日期">
            <el-date-picker
              v-model="form.publishDateRange"
              type="daterange"
              rangeSeparator="~"
              startPlaceholder="开始日期"
              endPlaceholder="结束日期"
              valueFormat="YYYY-MM-DD"
            />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="创建人">
            <el-input v-model="form.createUserId" placeholder="请输入创建人" clearable />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="更新人">
            <el-input v-model="form.updateUserId" placeholder="请输入更新人" clearable />
          </el-form-item>
        </el-col>
        <el-col v-if="false" :span="6">
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
        <el-col v-if="false" :span="6">
          <el-form-item label="更新时间">
            <el-date-picker
              v-model="form.updatedTimesRange"
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
            content="新增动态"
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
      <el-table-column
        v-if="isAdmin"
        type="selection"
        width="50"
        fixed="left"
      />
      <el-table-column
        prop="title"
        label="动态标题"
        minWidth="200"
        showOverflowTooltip
      >
        <template #default="scope">
          <span
            class="clickable-title"
            :title="scope.row.title"
            @click="handleView(scope.row)"
          >
            {{ scope.row.title }}
          </span>
        </template>
      </el-table-column>
      <el-table-column
        prop="dynamicType"
        label="动态类型"
        width="150"
        showOverflowTooltip
      >
        <template #default="scope">
          {{ getDynamicTypeLabel(scope.row.dynamicType) }}
        </template>
      </el-table-column>
      <el-table-column
        prop="publishStatus"
        label="状态"
        width="100"
        align="center"
      >
        <template #default="scope">
          <el-tag
            :type="DynamicStatus.getTagType(scope.row.publishStatus)"
            size="small"
          >
            {{ DynamicStatus.getName(scope.row.publishStatus) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        prop="publishDate"
        label="动态发布日期"
        width="120"
        showOverflowTooltip
      />
      <el-table-column
        prop="publishUserName"
        label="发布人"
        width="120"
      />
      <el-table-column
        prop="publishTimes"
        label="发布时间"
        minWidth="180"
      />
      <el-table-column
        prop="createUserName"
        label="创建人"
        width="120"
      />
      <el-table-column
        prop="createdTimes"
        label="创建时间"
        minWidth="180"
      />
      <el-table-column
        prop="updateUserName"
        label="更新人"
        width="120"
      />
      <el-table-column
        prop="updatedTimes"
        label="更新时间"
        minWidth="180"
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
              :content="scope.row.publishStatus === '1' ? '发布中的动态不可编辑' : '编辑'"
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
              :content="scope.row.publishStatus === '1' ? '发布中的动态不能删除' : '删除'"
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
import { DynamicStatus } from '@/dic/statusConfig'
import { useDictionary } from '@/hooks/useDictionary'

const router = useRouter()
const userInfoStore = useUserInfoStore()

// 获取管理员权限状态
const isAdmin = userInfoStore.isAdmin

// 获取动态类型字典数据
const { dictList: dynamicTypeList, getDictLabel: getDynamicTypeLabel } = useDictionary({
  dictType: 'dynamic_type',
  autoLoad: true
})

interface DynamicItem {
  id: number
  title: string
  titleEn: string
  dynamicType: string
  publishStatus: string
  content: string
  contentEn: string
  publishTimes: string | null
  publishDate: string | null
  publishUserId: string
  publishUserName: string
  createUserId: string
  createUserName: string
  updateUserId: string
  updateUserName: string
  createdTimes: string
  updatedTimes: string
}

// 搜索表单初始值
const initialSearchForm = {
  dynamicType: '',
  title: '',
  publishStatus: '',
  createUserId: '',
  updateUserId: '',
  publishTimesRange: [] as string[],
  updatedTimesRange: [] as string[],
  publishDateRange: [] as string[]
}

// 表格页面组件引用
const tablePageRef = ref<any>(null)

// 表格相关
const selectedDynamics = ref<DynamicItem[]>([])

// 计算属性：判断批量删除按钮是否应该禁用
const isDeleteButtonDisabled = computed(() => {
  return selectedDynamics.value.length === 0 || selectedDynamics.value.some(item => item.publishStatus === '1')
})

// 获取动态数据的方法（适配tablePage组件的接口）
const fetchDynamicData = (params: any) => {
  return service.post('/api/dynamic/list', params)
}

// 处理表格选择变化
const handleSelectionChange = (selection: DynamicItem[]) => {
  selectedDynamics.value = selection
}

// 查看动态
const handleView = (row: DynamicItem) => {
  const tabTitle = `动态详情【${row.title}】`
  router.push({
    path: '/dynamicDetail',
    query: {
      id: String(row.id),
      tabTitle: encodeURIComponent(tabTitle)
    }
  })
}

// 编辑动态
const handleEdit = (row: DynamicItem) => {
  const tabTitle = `编辑动态【${row.title}】`
  router.push({
    path: '/modifyDynamic',
    query: {
      mode: 'edit',
      id: String(row.id),
      tabTitle: encodeURIComponent(tabTitle)
    }
  })
}

// 新增动态
const handleAdd = () => {
  const tabTitle = `新增动态`
  router.push({
    path: '/modifyDynamic',
    query: {
      mode: 'add',
      tabTitle: encodeURIComponent(tabTitle)
    }
  })
}

// 删除动态
const handleDelete = (row?: DynamicItem) => {
  // 如果传入了row参数，则为单个删除，否则为批量删除
  const isBatchDelete = !row

  // 批量删除时检查是否有选中项
  if (isBatchDelete && selectedDynamics.value.length === 0) {
    ElMessage.warning('请选择要删除的动态')
    return
  }

  // 检查是否包含已发布的动态
  if (isBatchDelete && selectedDynamics.value.some(item => item.publishStatus === '1')) {
    ElMessage.warning('发布中的动态不能删除')
    return
  }

  // 单个删除时检查是否为已发布状态
  if (!isBatchDelete && row?.publishStatus === '1') {
    ElMessage.warning('发布中的动态不能删除')
    return
  }

  // 获取要删除的ID
  const ids = isBatchDelete
    ? selectedDynamics.value.map(item => item.id)
    : row!.id

  // 确认提示信息
  const confirmMessage = isBatchDelete
    ? `确认删除选中的 ${selectedDynamics.value.length} 条动态信息吗？`
    : '确认删除该动态信息吗？'

  ElMessageBox.confirm(confirmMessage, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    service.post('/api/dynamic/delete', { ids })
      .then(() => {
        ElMessage.success('删除成功')
        refreshTable(1)
      })
  }).catch(() => {})
}

// 处理动态发布状态（发布/下线）
const handlePublishStatus = (row: DynamicItem, action: 'publish' | 'unpublish') => {
  const isPublish = action === 'publish'
  const actionText = isPublish ? '发布' : '下线'

  ElMessageBox.confirm(`确定要${actionText}该动态吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: isPublish ? 'info' : 'warning'
  }).then(() => {
    service.post('/api/dynamic/publish', {
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
.dynamic-manage-container {
  position: relative;
}

:deep(.el-table .cell) {
  word-break: break-all;
}
</style>
