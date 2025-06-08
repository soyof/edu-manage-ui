<template>
  <div ref="pageRef" v-loading="loading" class="user-manage">
    <div ref="headerRef" class="user-manage-header">
      <el-form
        ref="ruleFormRef"
        :model="ruleForm"
        statusIcon
        labelWidth="auto"
        size="default"
        inline
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="ruleForm.username" autocomplete="off" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input
            v-model="ruleForm.email"
            autocomplete="off"
          />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="ruleForm.phone" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="getList">
            查询
          </el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div ref="operaRef" class="user-manage-opera">
      <el-button>新增</el-button>
    </div>
    <div ref="tableRef" class="user-manage-content">
      <el-table
        :data="tableList"
        border
        :height="tableHeight"
      >
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
      </el-table>
    </div>
    <div ref="pagerRef" class="user-manage-pager">
      <Pagination
        v-model:pager="pager"
        @change="getList"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import Pagination from '@/components/global/pagination.vue'
import { ref, useTemplateRef } from 'vue'
import service from '@/utils/services'
import { useAutoTable } from '@/hooks/useAutoTable'

const pager = ref({
  pageNo: 1,
  pageSize: 20,
  total: 0
})

const ruleForm = ref({
  username: '',
  email: '',
  phone: ''
})

const tableList = ref([])
const loading = ref(false)

// 表格相关引用
const pageRef = useTemplateRef('pageRef')
const headerRef = useTemplateRef('headerRef')
const operaRef = useTemplateRef('operaRef')
const pagerRef = useTemplateRef('pagerRef')

// 使用自动表格高度计算钩子
const { tableHeight } = useAutoTable({
  pageRef,
  deductRefs: [headerRef, operaRef, pagerRef]
})

const resetForm = () => {
  ruleForm.value = {
    username: '',
    email: '',
    phone: ''
  }
}

const getList = () => {
  loading.value = true
  service.post('/api/getAllUsersInfos', {
    pageNo: pager.value.pageNo,
    pageSize: pager.value.pageSize
  }).then((res: any) => {
    pager.value = {
      ...pager.value,
      total: res.total || 0
    }
    tableList.value = res.list || []
  }).finally(() => {
    loading.value = false
  })
}

getList()
</script>

<style lang="less" scoped>
.user-manage {
  width: 100%;
  height: 100%;
  min-height: @contentHeight;
  max-height: @contentHeight;
  background-color: @pageBgColor;
  padding: 6px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  .user-manage-header {
    width: 100%;
    .el-form {
      .el-form-item {
        margin-right: 12px;
        margin-bottom: 8px;
      }
    }
  }
  .user-manage-opera {
    padding-bottom: 8px;
  }
  .user-manage-content {
    width: 100%;
    .el-table {
      width: 100%;
    }
  }
  .user-manage-pager {
  }
}
</style>
