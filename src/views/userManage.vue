<template>
  <div class="user-manage">
    <TablePage
      ref="tablePageRef"
      :initialSearchForm="searchForm"
      :fetchData="fetchUserList"
    >
      <template #search-form="{ form }">
        <el-col :span="6">
          <el-form-item label="用户名" prop="username">
            <el-input v-model="form.username" autocomplete="off" />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="邮箱" prop="email">
            <el-input
              v-model="form.email"
              autocomplete="off"
            />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="职称" prop="title">
            <el-select
              v-model="form.title"
              filterable
              clearable
              placeholder="请选择职称"
            >
              <el-option
                v-for="item in userTitleList"
                :key="item.dictId"
                :label="item.dictValue"
                :value="item.dictId"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="手机号" prop="phone">
            <el-input v-model="form.phone" />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="角色" prop="role">
            <el-select
              v-model="form.role"
              filterable
              clearable
              placeholder="请选择角色"
            >
              <el-option
                v-for="item in ROLE_LIST"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="状态" prop="status">
            <el-select v-model="form.status" clearable placeholder="请选择状态">
              <el-option label="启用" value="1" />
              <el-option label="禁用" value="0" />
            </el-select>
          </el-form-item>
        </el-col>
      </template>
      <template #operation>
        <el-button type="primary" @click="handleAdd">新增</el-button>
      </template>

      <el-table-column
        prop="userId"
        label="用户编号"
        width="120"
        showOverflowTooltip
      />
      <el-table-column
        prop="username"
        label="用户名"
        width="120"
        showOverflowTooltip
      />
      <el-table-column
        prop="title"
        label="职称"
        width="120"
        showOverflowTooltip
      >
        <template #default="scope">
          {{ translateTitle(scope.row.title) || scope.row.title }}
        </template>
      </el-table-column>
      <el-table-column
        prop="status"
        label="状态"
        width="100"
        showOverflowTooltip
      >
        <template #default="scope">
          <el-tag :type="scope.row.status ? 'success' : 'danger'">
            {{ scope.row.status ? '已启用' : '已禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        prop="email"
        label="邮箱"
        minWidth="180"
        showOverflowTooltip
      />
      <el-table-column
        prop="phone"
        label="手机号"
        width="120"
        showOverflowTooltip
      />
      <el-table-column
        prop="tags"
        label="标签"
        minWidth="120"
        showOverflowTooltip
      />
      <el-table-column
        prop="role"
        label="角色"
        minWidth="120"
        showOverflowTooltip
      >
        <template #default="scope">
          {{ scope.row.role === 'admin' ? '管理员' : '普通用户' }}
        </template>
      </el-table-column>
      <!-- <el-table-column
        prop="idPic"
        label="证件照"
        width="100"
      >
        <template #default="scope">
          <el-image
            v-if="scope.row.idPic"
            :src="`/api/previewImage?filename=${scope.row.idPic}`"
            fit="cover"
            style="width: 60px; height: 80px; border-radius: 4px;"
            :previewSrcList="[`/api/previewImage?filename=${scope.row.idPic}`]"
          >
            <template #error>
              <div class="image-error">
                <el-icon><Picture /></el-icon>
                <span>加载失败</span>
              </div>
            </template>
          </el-image>
          <span v-else>-</span>
        </template>
      </el-table-column> -->
      <el-table-column
        prop="labHomepage"
        label="实验室主页"
        minWidth="120"
        showOverflowTooltip
      />
      <el-table-column
        prop="personalHomepage"
        label="个人主页"
        minWidth="120"
        showOverflowTooltip
      />
      <el-table-column
        prop="createdTimes"
        label="创建时间"
        minWidth="180"
        showOverflowTooltip
      />
      <el-table-column
        prop="updatedTimes"
        label="更新时间"
        minWidth="180"
        showOverflowTooltip
      />
      <el-table-column
        prop="opera"
        label="操作"
        width="160"
        fixed="right"
        showOverflowTooltip
      >
        <template #default="scope">
          <div class="operation-buttons">
            <el-tooltip
              content="查看"
              placement="top"
              :showAfter="1000"
              :hideAfter="0"
            >
              <el-button
                type="primary"
                link
                :icon="View"
                @click="handleView(scope.row)"
              />
            </el-tooltip>

            <el-tooltip
              content="基本信息编辑"
              placement="top"
              :showAfter="1000"
              :hideAfter="0"
            >
              <el-button
                type="primary"
                link
                :icon="EditPen"
                @click="handleEdit(scope.row)"
              />
            </el-tooltip>

            <el-tooltip
              content="学术档案"
              placement="top"
              :showAfter="1000"
              :hideAfter="0"
            >
              <el-button
                type="primary"
                link
                :icon="School"
                @click="handleEditOther(scope.row)"
              />
            </el-tooltip>

            <el-tooltip
              :content="scope.row.status ? '禁用' : '启用'"
              placement="top"
              :showAfter="1000"
              :hideAfter="0"
            >
              <el-button
                :type="scope.row.status ? 'warning' : 'success'"
                link
                :icon="scope.row.status ? Lock : Unlock"
                @click="handleToggleStatus(scope.row)"
              />
            </el-tooltip>

            <el-tooltip
              content="删除"
              placement="top"
              :showAfter="1000"
              :hideAfter="0"
            >
              <el-button
                type="danger"
                link
                :icon="Delete"
                @click="handleDelete(scope.row)"
              />
            </el-tooltip>
          </div>
        </template>
      </el-table-column>
    </TablePage>

    <!-- 新增用户弹窗 -->
    <ModifyUserDialog
      v-model:visible="dialogVisible"
      :config="modifyUserConfig"
      @success="handleSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import TablePage from '@/components/global/tablePage.vue'
import ModifyUserDialog from '@/components/user/modifyUserDialog.vue'
import { ref } from 'vue'
import service from '@/utils/services'
import { ROLE_LIST } from '@/dic/dic'
import { ElMessageBox, ElMessage } from 'element-plus'
import { useDictionary } from '@/hooks/useDictionary'
import { useRouter } from 'vue-router'
import { View, EditPen, Delete, School, Lock, Unlock } from '@element-plus/icons-vue'
import { useUserInfoStore } from '@/stores/userInfo'

// 获取职称字典
const { dictList: userTitleList, getDictLabel: translateTitle } = useDictionary({
  dictType: 'user_title',
  autoLoad: true
})

const $router = useRouter()
// 获取用户信息存储
const userInfoStore = useUserInfoStore()

const searchForm = {
  username: '',
  email: '',
  phone: '',
  title: '',
  status: ''
}

const dialogVisible = ref(false)
const modifyUserConfig = ref({
  type: 'A',
  info: {}
})

// 表格组件引用
const tablePageRef = ref()

const fetchUserList = (params: any) => {
  return service.post('/api/getAllUsersInfos', params)
}

const handleAdd = () => {
  dialogVisible.value = true
  modifyUserConfig.value = {
    type: 'A',
    info: {}
  }
}

// 处理用户数据，确保标签格式正确
const processUserData = (userData: any) => {
  const processedData = { ...userData }

  // 处理标签数据
  if (typeof processedData.tags === 'string' && processedData.tags) {
    // 如果标签是字符串格式，转换为数组
    processedData.tags = processedData.tags.split(',').map((tag: string) => tag.trim()).filter(Boolean)
  } else if (!Array.isArray(processedData.tags)) {
    // 如果标签不是数组，设为空数组
    processedData.tags = []
  }

  return processedData
}

const handleEdit = (row: any) => {
  dialogVisible.value = true
  modifyUserConfig.value = {
    type: 'E',
    info: processUserData(row)
  }
}

const handleEditOther = (row: any) => {
  $router.push({
    path: `/modifyUserOtherInfos`,
    query: {
      userId: row.userId,
      userName: row.username,
      tabTitle: encodeURIComponent(`【${row.username}】学术档案`)
    }
  })
}

const handleDelete = (row: any) => {
  ElMessageBox.confirm(
    `确认删除【${row.username}_${row.userId}】用户吗？`,
    '删除确认',
    {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    service.post('/api/deleteUser', {
      userId: row.userId
    }).then(() => {
      ElMessage.success('删除成功')
      tablePageRef.value?.getList()
    })
  })
}

const handleView = (row: any) => {
  dialogVisible.value = true
  modifyUserConfig.value = {
    type: 'V',
    info: processUserData(row)
  }
}

const handleSuccess = () => {
  // 刷新列表
  tablePageRef.value?.getList()
}

const handleToggleStatus = (row: any) => {
  // 判断是否是当前登录用户
  const currentUserId = userInfoStore.userInfo?.userId
  if (currentUserId === row.userId) {
    ElMessage.warning('不能修改自己的账号状态')
    return
  }

  const newStatus = !row.status
  const statusText = newStatus ? '启用' : '禁用'

  ElMessageBox.confirm(
    `确认${statusText}【${row.username}_${row.userId}】用户吗？`,
    `${statusText}确认`,
    {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: newStatus ? 'success' : 'warning'
    }
  ).then(() => {
    service.post('/api/updateUserStatus', {
      userId: row.userId,
      status: newStatus ? 1 : 0
    }).then(() => {
      ElMessage.success(`${statusText}成功`)
      tablePageRef.value?.getList()
    })
  })
}
</script>

<style lang="less" scoped>
.user-manage {
  .operation-buttons {
    display: flex;
    justify-content: center;

    .el-button {
      padding: 2px;
    }
  }

  .user-manage-opera-view {
    margin-right: 8px;
    color: @primaryColor;
  }
  .user-manage-opera-edit {
    margin-right: 8px;
    color: @primaryColor;
  }
  .user-manage-opera-delete {
    color: @dangerColor;
  }

  .image-error {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 60px;
    height: 80px;
    background-color: #f5f7fa;
    border-radius: 4px;
    color: #909399;
    font-size: 12px;

    .el-icon {
      font-size: 20px;
      margin-bottom: 4px;
    }
  }

  :deep(.el-image) {
    cursor: pointer;
    transition: transform 0.3s;

    &:hover {
      transform: scale(1.05);
    }
  }
}
</style>
