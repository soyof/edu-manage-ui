<template>
  <div class="tool-manage-container common-action-column">
    <!-- 使用通用表格页面组件 -->
    <TablePage
      ref="tablePageRef"
      :fetchData="fetchToolData"
      :initialSearchForm="initialSearchForm"
      @selectionChange="handleSelectionChange"
    >
      <!-- 搜索表单插槽 -->
      <template #search-form="{ form }">
        <el-col :span="6">
          <el-form-item label="工具标题">
            <el-input v-model="form.title" placeholder="请输入工具标题" clearable />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="工具类型">
            <el-select v-model="form.toolType" placeholder="请选择工具类型" clearable>
              <el-option
                v-for="item in ToolTypeDict.dictList.value"
                :key="item.dictId"
                :label="item.dictValue"
                :value="item.dictId"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col v-if="isAdmin" :span="6">
          <el-form-item label="发布状态">
            <el-select v-model="form.publishStatus" placeholder="请选择发布状态" clearable>
              <el-option
                v-for="item in ToolStatus.list"
                :key="item.dictId"
                :label="item.dictValue"
                :value="item.dictId"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col v-if="isAdmin" :span="6">
          <el-form-item label="发布人">
            <el-input v-model="form.publishUserId" placeholder="请输入发布人" clearable />
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
            content="新增工具"
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
        prop="title"
        label="工具标题(中文)"
        minWidth="180"
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
        prop="titleEn"
        label="工具标题(英文)"
        width="180"
        showOverflowTooltip
      />
      <el-table-column
        prop="toolType"
        label="工具类型"
        width="120"
        showOverflowTooltip
      >
        <template #default="scope">
          {{ ToolTypeDict.getDictLabel(scope.row.toolType) }}
        </template>
      </el-table-column>
      <el-table-column
        prop="toolUrl"
        label="工具地址"
        width="200"
        showOverflowTooltip
      />
      <el-table-column
        prop="publishStatus"
        label="发布状态"
        width="100"
        showOverflowTooltip
      >
        <template #default="scope">
          <el-tag :type="ToolStatus.getTagType(scope.row.publishStatus)">
            {{ ToolStatus.getName(scope.row.publishStatus) }}
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
        fixed="right"
        label="操作"
        width="110"
        className="action-column"
      >
        <template #default="scope">
          <div class="action-column-container">
            <!-- 编辑按钮 -->
            <el-tooltip
              :content="scope.row.publishStatus === '1' ? '已发布工具不能编辑' : '编辑'"
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

            <!-- 发布按钮 -->
            <el-tooltip
              :content="scope.row.publishStatus === '0' ? '发布' : (scope.row.publishStatus === '1' ? '下线' : '上线')"
              placement="top"
              :showAfter="200"
              :hideAfter="0"
            >
              <span
                class="action-icon-wrapper"
                @click="handlePublishStatus(scope.row, scope.row.publishStatus === '1' ? 'unpublish' : 'publish')"
              >
                <el-icon
                  class="action-icon"
                  :class="{
                    'publish-icon': scope.row.publishStatus === '0' || scope.row.publishStatus === '2',
                    'unpublish-icon': scope.row.publishStatus === '1'
                  }"
                >
                  <component :is="scope.row.publishStatus === '1' ? CircleClose : Check" />
                </el-icon>
              </span>
            </el-tooltip>

            <!-- 删除按钮 -->
            <el-tooltip
              :content="scope.row.publishStatus === '1' ? '已发布工具不能删除' : '删除'"
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
import { useDictionary } from '@/hooks/useDictionary'

// 创建工具状态配置
const ToolStatus = createStatusConfig('待发布', '已发布', '已下线')

// 获取工具类型字典
const ToolTypeDict = useDictionary({
  dictType: 'opensource_tool_type',
  autoLoad: true
})

const router = useRouter()
const userInfoStore = useUserInfoStore()

// 获取管理员权限状态
const isAdmin = userInfoStore.isAdmin

interface ToolItem {
  id: number
  title: string
  titleEn: string
  toolType: string
  toolTypeName: string
  toolUrl: string
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
  title: '',
  toolType: '',
  publishStatus: '',
  publishUserId: '',
  publishTimesRange: [] as string[]
}

// 表格页面组件引用
const tablePageRef = ref<any>(null)

// 表格相关
const selectedTools = ref<ToolItem[]>([])

// 计算属性：判断批量删除按钮是否应该禁用
const isDeleteButtonDisabled = computed(() => {
  return selectedTools.value.length === 0 || selectedTools.value.some(item => item.publishStatus === '1')
})

// 获取工具数据的方法（适配tablePage组件的接口）
const fetchToolData = (params: any) => {
  return service.post('/api/tool/list', params)
}

// 处理表格选择变化
const handleSelectionChange = (selection: ToolItem[]) => {
  selectedTools.value = selection
}

// 查看工具
const handleView = (row: ToolItem) => {
  const tabTitle = `工具详情【${row.title}】`
  router.push({
    path: '/toolDetail',
    query: {
      mode: 'view',
      id: String(row.id),
      tabTitle: encodeURIComponent(tabTitle)
    }
  })
}

// 编辑工具
const handleEdit = (row: ToolItem) => {
  const tabTitle = `编辑工具【${row.title}】`
  router.push({
    path: '/modifyToolInfos',
    query: {
      mode: 'edit',
      id: String(row.id),
      tabTitle: encodeURIComponent(tabTitle)
    }
  })
}

// 新增工具
const handleAdd = () => {
  const tabTitle = `新增工具`
  router.push({
    path: '/modifyToolInfos',
    query: {
      mode: 'add',
      tabTitle: encodeURIComponent(tabTitle)
    }
  })
}

// 刷新表格
const refreshTable = (page?: number) => {
  tablePageRef.value?.getList(page)
}

// 删除工具
const handleDelete = (row?: ToolItem) => {
  // 如果传入了row参数，则为单个删除，否则为批量删除
  const isBatchDelete = !row

  // 批量删除时检查是否有选中项
  if (isBatchDelete && selectedTools.value.length === 0) {
    ElMessage.warning('请选择要删除的工具')
    return
  }

  // 检查是否包含已发布的工具
  if (isBatchDelete && selectedTools.value.some(item => item.publishStatus === '1')) {
    ElMessage.warning('已发布的工具不能删除')
    return
  }

  // 单个删除时检查是否为已发布状态
  if (!isBatchDelete && row?.publishStatus === '1') {
    ElMessage.warning('已发布的工具不能删除')
    return
  }

  // 获取要删除的ID
  const ids = isBatchDelete
    ? selectedTools.value.map(item => item.id)
    : row!.id

  // 确认提示信息
  const confirmMessage = isBatchDelete
    ? `确认删除选中的 ${selectedTools.value.length} 条工具信息吗？`
    : '确认删除该工具信息吗？'

  ElMessageBox.confirm(confirmMessage, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    service.post('/api/tool/delete', { ids })
      .then(() => {
        ElMessage.success('删除成功')
        refreshTable(1)
      })
  }).catch(() => {})
}

// 处理工具发布状态（发布/下线）
const handlePublishStatus = (row: ToolItem, action: 'publish' | 'unpublish') => {
  const isPublish = action === 'publish'
  const actionText = isPublish ? '发布' : '下线'

  ElMessageBox.confirm(`确认${actionText}该工具吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: isPublish ? 'info' : 'warning'
  }).then(() => {
    service.post('/api/tool/publish', {
      id: row.id,
      action
    }).then(() => {
      ElMessage.success(`${actionText}成功`)
      refreshTable(1)
    })
  }).catch(() => {})
}
</script>

<style scoped lang="less">
.tool-manage-container {
  width: 100%;
}
</style>
