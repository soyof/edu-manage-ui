<template>
  <div class="user-sort-setting">
    <div class="sort-container">
      <div class="title-list-section">
        <div class="section-title">
          <el-icon><Menu /></el-icon>
          <span>用户职称列表</span>
        </div>
        <el-card shadow="hover" class="title-list-card">
          <div
            v-for="title in titleList"
            :key="title.dictId"
            class="title-item"
            :class="{ active: currentTitle?.dictId === title.dictId }"
            @click="handleTitleSelect(title)"
          >
            <div class="title-item-content">
              <el-icon><UserFilled /></el-icon>
              <span>{{ title.dictValue }}</span>
              <span class="count-badge">{{ getUserCountByTitle(title.dictId) }}</span>
            </div>
          </div>
          <el-empty v-if="titleList.length === 0" description="暂无职称数据" />
        </el-card>
      </div>

      <div class="user-list-section">
        <div class="section-title">
          <el-icon><Rank /></el-icon>
          <span>{{ currentTitle ? `${currentTitle.dictValue}用户列表` : '请选择一个职称' }}</span>
        </div>
        <el-card shadow="hover" class="user-list-card">
          <template #header>
            <div class="card-header">
              <div class="total-info">
                共 {{ userListByTitle.length }} 名用户
              </div>
              <div class="action-btns">
                <ThrottleButton
                  size="small"
                  type="primary"
                  :disabled="!currentTitle || !hasChanged"
                  @click="handleSave"
                >
                  保存排序
                </ThrottleButton>
                <ThrottleButton
                  size="small"
                  :disabled="!currentTitle || !hasChanged"
                  @click="handleReset"
                >
                  重置排序
                </ThrottleButton>
              </div>
            </div>
          </template>

          <el-empty
            v-if="!currentTitle"
            description="请先从左侧选择一个职称"
          />
          <el-empty
            v-else-if="userListByTitle.length === 0"
            description="暂无用户数据"
          />
          <div v-else class="user-sort-list">
            <el-alert
              type="info"
              showIcon
              :closable="false"
            >
              <template #title>
                <span>直接拖拽整个用户卡片可调整排序，<b>数字越小排序越靠前</b>，保存后将影响门户展示顺序</span>
              </template>
            </el-alert>

            <draggable
              v-model="userListByTitle"
              animation="300"
              itemKey="userId"
              class="draggable-container"
              @start="dragStart"
              @end="dragEnd"
            >
              <template #item="{ element, index }">
                <div class="user-item cursor-move">
                  <div class="user-order">{{ index + 1 }}</div>
                  <div class="user-avatar">
                    <el-avatar
                      :size="40"
                      :src="element.avatar || ''"
                    >
                      {{ element.username?.substring(0, 1)?.toUpperCase() }}
                    </el-avatar>
                  </div>
                  <div class="user-info">
                    <div class="user-name">
                      {{ element.username }}
                      <el-tag v-if="element.isDisplay" size="small" type="primary">门户展示</el-tag>
                      <el-tag v-else size="small" type="info">不展示</el-tag>
                    </div>
                    <div class="user-title">
                      <span class="label">职称:</span>
                      <span>{{ translateTitle(element.title) }}</span>
                    </div>
                  </div>
                  <div class="user-sort">
                    <div class="sort-value">
                      <span class="label">排序值:</span>
                      <span>{{ element.displayOrder || '未设置' }}</span>
                    </div>
                  </div>
                </div>
              </template>
            </draggable>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import service from '@/utils/services'
import ThrottleButton from '@/components/global/throttleButton.vue'
import { Menu, UserFilled, Rank } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useDictionary } from '@/hooks/useDictionary'
import useLoading from '@/hooks/useLoading'
// @ts-ignore
import draggable from 'vuedraggable'

const { changeLoading } = useLoading()

// 用户和职称类型定义
interface UserTitle {
  dictId: string;
  dictValue: string;
  dictType?: string;
}

interface UserInfo {
  userId: string;
  username: string;
  title: string;
  isDisplay: boolean;
  displayOrder?: number;
  avatar?: string;
}

// 获取职称字典
const { dictList: titleList, getDictLabel: translateTitle } = useDictionary({
  dictType: 'user_title',
  autoLoad: true
})

// 当前选中的职称
const currentTitle = ref<UserTitle | null>(null)

// 所有用户数据
const allUsers = ref<UserInfo[]>([])

// 当前职称下的用户列表
const userListByTitle = ref<UserInfo[]>([])

// 原始用户排序数据（用于检测是否有变更）
const originalUserOrder = ref<UserInfo[]>([])

// 判断排序是否有变化
const hasChanged = computed(() => {
  if (!userListByTitle.value.length || !originalUserOrder.value.length) {
    return false
  }

  // 检查是否有顺序变更
  for (let i = 0; i < userListByTitle.value.length; i++) {
    const currentUserId = userListByTitle.value[i].userId
    const originalIndex = originalUserOrder.value.findIndex(user => user.userId === currentUserId)
    if (originalIndex !== i) {
      return true
    }
  }

  return false
})

// 根据职称ID获取该职称下的用户数量
const getUserCountByTitle = (titleId: string) => {
  if (!allUsers.value || !allUsers.value.length) return 0
  return allUsers.value.filter(user => user.title === titleId && user.isDisplay).length
}

// 获取所有用户信息
const fetchAllUsers = () => {
  // 使用门户展示为1的筛选条件
  changeLoading(true)
  return service.get('/api/getPortalUsers')
    .then((res: any) => {
      if (res) {
        // 对用户进行处理，确保有排序字段
        allUsers.value = (res as UserInfo[]).map(user => {
          // 如果没有排序字段，则添加一个默认值
          if (user.displayOrder === undefined || user.displayOrder === null) {
            user.displayOrder = 9999 // 默认排序值
          }
          return user
        })
      }
      return res
    })
    .catch((error) => {
      console.error('获取用户数据失败:', error)
      ElMessage.error('获取用户数据失败')
    })
    .finally(() => {
      changeLoading(false)
    })
}

// 选择职称
const handleTitleSelect = (title: UserTitle) => {
  currentTitle.value = title

  // 过滤当前职称的用户
  const filteredUsers = allUsers.value
    .filter(user => user.title === title.dictId && user.isDisplay)
    .sort((a, b) => {
      // 按排序值升序排列
      return (a.displayOrder || 9999) - (b.displayOrder || 9999)
    })

  userListByTitle.value = [...filteredUsers]
  // 保存原始排序，用于检测变更
  originalUserOrder.value = JSON.parse(JSON.stringify(filteredUsers))
}

// 保存排序
const handleSave = () => {
  if (!currentTitle.value || !userListByTitle.value.length) return

  // 确认保存
  ElMessageBox.confirm(
    '确定要保存当前排序吗？这将影响门户展示顺序。',
    '保存排序',
    {
      confirmButtonText: '确定保存',
      cancelButtonText: '取消',
      type: 'warning'
    }
  )
    .then(() => {
      // 更新排序值
      const updateData = userListByTitle.value.map((user: UserInfo, index) => {
        return {
          userId: user.userId,
          displayOrder: index + 1 // 从1开始的排序值
        }
      })

      changeLoading(true)
      // 批量更新用户排序
      return service.post('/api/updateUserDisplayOrder', {
        users: updateData
      })
        .then(() => {
          ElMessage.success('保存排序成功')
          // 保存当前选中的职称ID
          const currentTitleId = currentTitle.value?.dictId
          // 重新获取数据后，重新选择当前职称
          fetchAllUsers().then(() => {
            if (currentTitleId) {
              // 找到当前选中的职称并重新选择
              const targetTitle = titleList.value.find(title => title.dictId === currentTitleId)
              if (targetTitle) {
                handleTitleSelect(targetTitle)
              }
            }
          })
        })
        .finally(() => {
          changeLoading(false)
        })
    })
}

// 重置排序
const handleReset = () => {
  // 重置为原始排序
  if (originalUserOrder.value && originalUserOrder.value.length) {
    userListByTitle.value = JSON.parse(JSON.stringify(originalUserOrder.value))
  }
}

// 拖拽事件处理
const dragStart = () => {
  // 拖拽开始
}

const dragEnd = () => {
  // 拖拽结束
}

onMounted(() => {
  // 获取用户数据并默认选择第一个职称
  fetchAllUsers().then(() => {
    // 如果有职称数据，默认选中第一个
    if (titleList.value && titleList.value.length > 0) {
      handleTitleSelect(titleList.value[0])
    }
  })
})
</script>

<style lang="less" scoped>
.user-sort-setting {
  padding: 20px 12px;
  background-color: var(--el-bg-color, @pageBgColor);
  height: @contentHeight;

  .sort-container {
    display: flex;
    gap: 20px;

    .title-list-section {
      width: 280px;
      flex-shrink: 0;

      .section-title {
        display: flex;
        align-items: center;
        font-size: 16px;
        font-weight: 600;
        margin-bottom: 16px;
        color: var(--el-text-color-primary);

        .el-icon {
          margin-right: 8px;
          color: var(--primaryColor);
          font-size: 20px;
        }
      }

      .title-list-card {
        height: calc(@contentHeight - 80px);
        overflow-y: auto;
        background-color: var(--el-bg-color-overlay);
        border: 1px solid var(--el-border-color-light);
        box-shadow: var(--el-box-shadow-light);

        &::-webkit-scrollbar {
          width: 4px;
        }

        &::-webkit-scrollbar-thumb {
          background-color: var(--el-color-primary-light-7);
          border-radius: 3px;

          &:hover {
            background-color: var(--el-color-primary-light-5);
          }
        }

        &::-webkit-scrollbar-track {
          background-color: var(--el-fill-color-lighter);
          border-radius: 3px;
        }

        .title-item {
          padding: 12px 16px;
          border-radius: 6px;
          margin-bottom: 8px;
          cursor: pointer;
          transition: all 0.3s;
          background-color: var(--el-fill-color-light);

          &:hover {
            background-color: var(--el-fill-color-dark);
          }

          &.active {
            background-color: color-mix(in srgb, var(--el-color-primary) 15%, var(--el-bg-color));
            color: var(--el-color-primary);
            font-weight: 500;
            border-left: 3px solid var(--el-color-primary);
          }

          .title-item-content {
            display: flex;
            align-items: center;

            .el-icon {
              margin-right: 8px;
              font-size: 18px;
            }

            .count-badge {
              margin-left: auto;
              background-image: linear-gradient(to right, var(--el-color-primary), var(--el-color-primary-light-3));
              color: white;
              border-radius: 10px;
              padding: 2px 8px;
              font-size: 12px;
              box-shadow: 0 2px 4px rgba(var(--el-color-primary-rgb), 0.3);
            }
          }
        }
      }
    }

    .user-list-section {
      flex: 1;

      .section-title {
        display: flex;
        align-items: center;
        font-size: 16px;
        font-weight: 600;
        margin-bottom: 16px;
        color: var(--el-text-color-primary);

        .el-icon {
          margin-right: 8px;
          color: var(--el-color-primary);
          font-size: 20px;
        }
      }

      .user-list-card {
        height: calc(@contentHeight - 80px);
        background-color: var(--el-bg-color-overlay);
        border: 1px solid var(--el-border-color-light);
        box-shadow: var(--el-box-shadow-light);

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;

          .total-info {
            font-size: 14px;
            color: var(--el-text-color-secondary);
          }

          .action-btns {
            display: flex;
            gap: 8px;
          }
        }

        .user-sort-list {
          overflow-y: auto;
          height: calc(@contentHeight - 180px);

          &::-webkit-scrollbar {
            width: 6px;
          }

          &::-webkit-scrollbar-thumb {
            background-color: var(--el-color-primary-light-7);
            border-radius: 3px;

            &:hover {
              background-color: var(--el-color-primary-light-5);
            }
          }

          &::-webkit-scrollbar-track {
            background-color: var(--el-fill-color-lighter);
            border-radius: 3px;
          }

          .draggable-container {
            margin-top: 8px;
          }

          .user-item {
            display: flex;
            align-items: center;
            padding: 12px 16px;
            border-radius: 8px;
            background-color: var(--el-bg-color-overlay);
            border: 1px solid var(--el-border-color-lighter);
            margin-bottom: 10px;
            transition: all 0.3s;
            position: relative;
            overflow: hidden;

            &:hover {
              background-color: var(--el-fill-color-darker);
              border-color: var(--el-border-color);
              transform: translateY(-2px);
              box-shadow: 0 5px 15px rgba(var(--el-color-primary-rgb), 0.1);
            }

            &::before {
              content: '';
              position: absolute;
              left: 0;
              top: 0;
              height: 100%;
              width: 4px;
              background-color: var(--el-color-primary);
              opacity: 0;
              transition: opacity 0.3s;
            }

            &:hover::before {
              opacity: 1;
            }

            &.cursor-move {
              cursor: move;
              cursor: grab;
            }

            &.sortable-ghost {
              opacity: 0.8;
              background-color: var(--el-color-primary-light-8);
              border: 1px dashed var(--el-color-primary);
            }

            &.sortable-chosen {
              cursor: grabbing;
            }

            .user-order {
              width: 28px;
              height: 28px;
              border-radius: 8px;
              background-image: linear-gradient(135deg, var(--el-color-primary), var(--el-color-primary-light-5));
              color: white;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 14px;
              margin-right: 12px;
              box-shadow: 0 2px 6px rgba(var(--el-color-primary-rgb), 0.3);
            }

            .user-avatar {
              margin-right: 12px;
            }

            .user-info {
              flex: 1;

              .user-name {
                font-weight: 500;
                margin-bottom: 4px;
                display: flex;
                align-items: center;

                .el-tag {
                  margin-left: 8px;
                }
              }

              .user-title {
                font-size: 13px;
                color: var(--el-text-color-secondary);

                .label {
                  margin-right: 4px;
                }
              }
            }

            .user-sort {
              .sort-value {
                font-size: 13px;
                color: var(--el-text-color-secondary);

                .label {
                  margin-right: 4px;
                }
              }
            }
          }
        }
      }
    }
  }
}
</style>

