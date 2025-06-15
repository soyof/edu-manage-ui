<template>
  <div class="user-manage">
    <TablePage
      :initialSearchForm="searchForm"
      :fetchData="fetchUserList"
    >
      <template #search-form="{ form }">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" autocomplete="off" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input
            v-model="form.email"
            autocomplete="off"
          />
        </el-form-item>
        <el-form-item label="职称" prop="title">
          <el-input
            v-model="form.title"
            autocomplete="off"
          />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="form.status" placeholder="请选择状态">
            <el-option label="启用" value="1" />
            <el-option label="禁用" value="0" />
          </el-select>
        </el-form-item>
      </template>

      <template #operation>
        <el-button @click="handleAdd">新增</el-button>
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
      />
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
        minWidth="150"
        showOverflowTooltip
      />
      <el-table-column
        prop="updatedTimes"
        label="更新时间"
        minWidth="150"
        showOverflowTooltip
      />
      <el-table-column
        prop="isActive"
        label="状态"
        width="80"
        showOverflowTooltip
      >
        <template #default="scope">
          <el-tag :type="scope.row.isActive ? 'success' : 'danger'">
            {{ scope.row.isActive ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        prop="opera"
        label="操作"
        width="120"
        fixed="right"
        showOverflowTooltip
      >
        <template #default="scope">
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
    <UserDialog
      v-model:visible="dialogVisible"
      @success="handleSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import TablePage from '@/components/global/TablePage.vue'
import UserDialog from '@/components/user/UserDialog.vue'
import { ref } from 'vue'
import service from '@/utils/services'

const searchForm = {
  username: '',
  email: '',
  phone: '',
  title: '',
  status: ''
}

const dialogVisible = ref(false)

const fetchUserList = (params: any) => {
  return service.post('/api/getAllUsersInfos', params)
}

const handleAdd = () => {
  dialogVisible.value = true
}

const handleEdit = (row: any) => {
  console.log(row)
}

const handleDelete = (row: any) => {
  console.log(row)
}

const handleSuccess = () => {
  // 刷新列表
  const tablePageRef = ref()
  tablePageRef.value?.getList()
}
</script>

<style lang="less" scoped>
.user-manage {
  .user-manage-opera-edit {
    margin-right: 8px;
    color: @primaryColor;
  }
  .user-manage-opera-delete {
    color: @dangerColor;
  }
}
</style>
