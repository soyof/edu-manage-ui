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
        prop="status"
        label="状态"
        width="80"
        showOverflowTooltip
      >
        <template #default="scope">
          <el-tag :type="scope.row.status ? 'success' : 'danger'">
            {{ scope.row.status ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        prop="opera"
        label="操作"
        width="140"
        fixed="right"
        showOverflowTooltip
      >
        <template #default="scope">
          <a
            href="javascript:void(0)"
            class="user-manage-opera-view"
            @click="handleView(scope.row)"
          >
            查看
          </a>
          <a
            href="javascript:void(0)"
            class="user-manage-opera-edit"
            @click="handleEdit(scope.row)"
          >
            编辑
          </a>
          <a
            href="javascript:void(0)"
            class="user-manage-opera-delete"
            @click="handleDelete(scope.row)"
          >
            删除
          </a>
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
import TablePage from '@/components/global/TablePage.vue'
import ModifyUserDialog from '@/components/user/modifyUserDialog.vue'
import { ref } from 'vue'
import service from '@/utils/services'
import { ROLE_LIST } from '@/dic/dic'
import { ElMessageBox, ElMessage } from 'element-plus'
import { useUserTitleDict } from '@/hooks/useDictionary'

// 获取职称字典
const { dictList: userTitleList, getDictLabel: translateTitle } = useUserTitleDict()

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
</script>

<style lang="less" scoped>
.user-manage {
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
}
</style>
