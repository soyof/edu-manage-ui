<template>
  <div class="lab-profile-manage-container common-action-column">
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
          <el-form-item label="类型">
            <el-select v-model="form.profileType" placeholder="请选择类型" clearable>
              <el-option
                v-for="item in introTypeList"
                :key="item.dictId"
                :label="item.dictValue"
                :value="item.dictId"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="发布状态">
            <el-select v-model="form.publishStatus" placeholder="请选择状态" clearable>
              <el-option
                v-for="item in ProfileStatus.list"
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
          <el-form-item label="更新人">
            <el-input v-model="form.updateUserId" placeholder="请输入更新人" clearable />
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
        <el-col :span="6">
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
        <el-tooltip
          content="新增简介"
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

      <!-- 表格列插槽 -->
      <el-table-column type="selection" width="50" fixed="left" />
      <el-table-column
        prop="title"
        label="简介标题"
        minWidth="200"
        showOverflowTooltip
      />
      <el-table-column
        prop="profileType"
        label="简介类型"
        width="150"
        showOverflowTooltip
      >
        <template #default="scope">
          {{ getIntroTypeLabel(scope.row.profileType) }}
        </template>
      </el-table-column>
      <el-table-column
        prop="publishStatus"
        label="发布状态"
        width="100"
        showOverflowTooltip
      >
        <template #default="scope">
          <el-tag :type="ProfileStatus.getTagType(scope.row.publishStatus)">
            {{ ProfileStatus.getName(scope.row.publishStatus) }}
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
        minWidth="180"
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
        minWidth="180"
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
        minWidth="180"
        showOverflowTooltip
      />
      <el-table-column label="操作" width="130" fixed="right">
        <template #default="scope">
          <div class="action-buttons">
            <!-- 查看 -->
            <el-tooltip
              content="查看"
              placement="top"
              :showAfter="200"
              :hideAfter="0"
            >
              <span class="action-icon-wrapper" @click="handleView(scope.row)">
                <el-icon class="action-icon view-icon"><View /></el-icon>
              </span>
            </el-tooltip>

            <!-- 编辑 - 仅未发布时可编辑 -->
            <el-tooltip
              :content="scope.row.publishStatus === '1' ? '生效中的简介不可编辑' : '编辑'"
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
              :content="scope.row.publishStatus === '1' ? '生效中的简介不能删除' : '删除'"
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
import { View, EditPen, Delete, Check, CircleClose, Plus } from '@element-plus/icons-vue'
import ThrottleButton from '@/components/global/throttleButton.vue'
import TablePage from '@/components/global/tablePage.vue'
import service from '@/utils/services'
import { ProfileStatus } from '@/dic/statusConfig'
import { useDictionary } from '@/hooks/useDictionary'

const router = useRouter()

// 获取简介类型字典数据
const { dictList: introTypeList, getDictLabel: getIntroTypeLabel } = useDictionary({
  dictType: 'intro_type',
  autoLoad: true
})

interface ProfileItem {
  id: number
  title: string
  profileType: string
  publishStatus: string
  content: string
  content_en: string
  publishTimes: string | null
  publishUserName: string
  createUserName: string
  updateUserName: string
  createdTimes: string
  updatedTimes: string
}

// 搜索表单初始值
const initialSearchForm = {
  profileType: '',
  title: '',
  publishStatus: '',
  createUserId: '',
  updateUserId: '',
  publishTimesRange: [] as string[],
  updatedTimesRange: [] as string[]
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
  const confirmMessage = isPublish ? `发布新简介后，当前生效中的【${getIntroTypeLabel(row.profileType)}】简介将会被下线。确定要发布吗？` : '确定要将该简介下线吗？下线后将不再生效'

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
}

:deep(.el-table .cell) {
  word-break: break-all;
}
</style>
