<template>
  <div class="recruit-manage-container common-action-column">
    <!-- 使用通用表格页面组件 -->
    <TablePage
      ref="tablePageRef"
      :fetchData="fetchRecruitData"
      :initialSearchForm="initialSearchForm"
      @selectionChange="handleSelectionChange"
    >
      <!-- 搜索表单插槽 -->
      <template #search-form="{ form }">
        <el-col :span="6">
          <el-form-item label="招聘类型">
            <el-select v-model="form.recruitmentType" placeholder="请选择招聘类型" clearable
              :loading="recruitTypeLoading"
            >
              <el-option
                v-for="item in recruitTypeList"
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
                v-for="item in RecruitStatus.list"
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
          content="新增招聘信息"
          placement="top"
          :showAfter="200"
          :hideAfter="0"
        >
          <ThrottleButton size="small" type="primary" @click="addRecruitInfo">
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
            @click="batchDelete"
          >
            <el-icon><Delete /></el-icon>
          </ThrottleButton>
        </el-tooltip>
      </template>

      <!-- 表格列插槽 -->
      <el-table-column type="selection" width="50" fixed="left" />
      <el-table-column prop="id" label="ID" width="50" />
      <el-table-column label="招聘类型" minWidth="180">
        <template #default="scope">
          {{ getRecruitTypeLabel(scope.row.recruitmentType) }}
        </template>
      </el-table-column>
      <el-table-column label="状态" width="120">
        <template #default="scope">
          <el-tag :type="RecruitStatus.getTagType(scope.row.status)">
            {{ RecruitStatus.getName(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        prop="publishUserName"
        label="发布人"
        width="150"
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
        width="150"
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
        width="150"
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
              <span class="action-icon-wrapper" @click="viewRecruitInfo(scope.row)">
                <el-icon class="action-icon view-icon"><View /></el-icon>
              </span>
            </el-tooltip>

            <!-- 编辑 - 仅未发布和已存档状态可编辑 -->
            <el-tooltip
              :content="scope.row.status === '1' ? '生效中的信息不可编辑' : '编辑'"
              placement="top"
              :showAfter="200"
              :hideAfter="0"
            >
              <span
                class="action-icon-wrapper"
                :class="{'disabled-wrapper': scope.row.status === '1'}"
                @click="scope.row.status !== '1' && editRecruitInfo(scope.row)"
              >
                <el-icon class="action-icon edit-icon"><EditPen /></el-icon>
              </span>
            </el-tooltip>

            <!-- 发布/存档 -->
            <el-tooltip
              :content="scope.row.status === '1' ? '存档' : '发布'"
              placement="top"
              :showAfter="200"
              :hideAfter="0"
            >
              <span
                class="action-icon-wrapper"
                @click="handleStatusChange(scope.row, scope.row.status === '1' ? 'archive' : 'publish')"
              >
                <el-icon class="action-icon" :class="scope.row.status === '1' ? 'unpublish-icon' : 'publish-icon'">
                  <CircleClose v-if="scope.row.status === '1'" />
                  <Check v-else />
                </el-icon>
              </span>
            </el-tooltip>

            <!-- 删除 -->
            <el-tooltip
              :content="scope.row.status === '1' ? '生效中的信息不能删除' : '删除'"
              placement="top"
              :showAfter="200"
              :hideAfter="0"
            >
              <span
                class="action-icon-wrapper"
                :class="{'disabled-wrapper': scope.row.status === '1'}"
                @click="scope.row.status !== '1' && deleteRecruitInfo(scope.row)"
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
import { useDictInfo } from '@/hooks/useDictionary'
import { RecruitStatus } from '@/dic/statusConfig'

const router = useRouter()

// 使用字典获取招聘类型选项
const { dictList: recruitTypeList, loading: recruitTypeLoading, getDictLabel: getRecruitTypeLabel } = useDictInfo('recruitment_type', true)

// 招聘信息列表响应数据
interface RecruitListData {
  list: RecruitItem[]
  total: number
}

// 分页数据结构
interface PageData<T> {
  list: T[]
  total: number
}

// 招聘信息类型定义
interface RecruitItem {
  id: string | number
  recruitmentType: string
  content: string
  contentEn: string
  status: string
  publishTimes: string | null
  createdTimes: string
  updatedTimes: string
  createUserId: string
  updateUserId: string
}

// 搜索表单初始值
const initialSearchForm = {
  recruitmentType: '',
  status: '',
  publishUserId: '',
  createUserId: '',
  updateUserId: '',
  publishTimesRange: [] as string[],
  updatedTimesRange: [] as string[]
}

// 表格引用
const tablePageRef = ref()
// 选中的行
const selectedRows = ref<RecruitItem[]>([])
// 批量删除按钮是否禁用
const isDeleteButtonDisabled = computed(() => !selectedRows.value.length || selectedRows.value.some(row => row.status === '1'))

// 处理选择变化
const handleSelectionChange = (rows: RecruitItem[]) => {
  selectedRows.value = rows
}

// 获取招聘信息列表
const fetchRecruitData = (params: any) => {
  return service.post<RecruitListData>('/api/recruit/list', params)
}

// 新增招聘信息
const addRecruitInfo = () => {
  router.push({
    path: '/modifyRecruitInfo',
    query: {
      mode: 'add',
      tabTitle: encodeURIComponent('新增招聘信息')
    }
  })
}

// 编辑招聘信息
const editRecruitInfo = (row: RecruitItem) => {
  router.push({
    path: '/modifyRecruitInfo',
    query: {
      mode: 'edit',
      id: row.id,
      tabTitle: encodeURIComponent(`编辑招聘信息【${getRecruitTypeLabel(row.recruitmentType)}】`)
    }
  })
}

// 发布/存档招聘信息
const handleStatusChange = (row: RecruitItem, action: 'publish' | 'archive') => {
  const isPublish = action === 'publish'
  const actionText = isPublish ? '发布' : '存档'
  const tipsTitle = isPublish ? '确认发布该招聘信息' : '存档'
  const tipsMsg = isPublish ? `发布后，此信息将成为唯一有效的【${getRecruitTypeLabel(row.recruitmentType)}】招聘信息，之前发布的同类型信息将自动归档。` : '确认要存档该招聘信息吗？存档后将不再生效'

  ElMessageBox.confirm(tipsMsg, tipsTitle, {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    return service.post('/api/recruit/publish', {
      id: row.id,
      action: isPublish ? 'publish' : 'archive'
    })
      .then(() => {
        ElMessage.success(`${actionText}成功`)
        // 刷新数据
        tablePageRef.value?.getList(1)
      })
  }).catch(() => {})
}

// 删除单个招聘信息
const deleteRecruitInfo = (row?: RecruitItem) => {
  const ids = row ? [row.id] : selectedRows.value.map(item => item.id)
  if (!ids.length) return

  ElMessageBox.confirm(
    `确认要删除${ids.length > 1 ? '选中的' + ids.length + '条' : '该'}招聘信息吗？此操作不可恢复！`,
    '警告',
    {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    return service.post('/api/recruit/delete', { ids })
      .then(() => {
        ElMessage.success('删除成功')
        // 刷新数据
        tablePageRef.value?.getList(1)
      })
  }).catch(() => {})
}

// 批量删除
const batchDelete = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要删除的招聘信息')
    return
  }

  // 过滤掉生效中的信息
  const validRows = selectedRows.value.filter(row => row.status !== '1')
  if (validRows.length === 0) {
    ElMessage.warning('选中的招聘信息均为生效中状态，不能删除')
    return
  }

  deleteRecruitInfo()
}

// 查看招聘信息详情
const viewRecruitInfo = (row: RecruitItem) => {
  router.push({
    path: '/recruitInfoDetail',
    query: {
      id: row.id,
      tabTitle: encodeURIComponent(`招聘信息详情【${getRecruitTypeLabel(row.recruitmentType)}】`)
    }
  })
}
</script>

<style lang="less" scoped>
.recruit-manage-container {
  width: 100%;
  height: 100%;
}
</style>
