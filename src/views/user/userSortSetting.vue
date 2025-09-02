<template>
  <div class="user-sort-setting">
    <div class="sort-container">
      <div class="title-list-section animate__animated animate__slideInLeft">
        <div class="section-title">
          <el-icon class="animate__animated animate__heartBeat animate__delay-1s"><Menu /></el-icon>
          <span>用户职称列表</span>
        </div>
        <el-card shadow="hover" class="title-list-card">
          <div
            v-for="title in titleList"
            :key="title.dictId"
            class="title-item animate__animated animate__fadeIn"
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

      <div class="user-list-section animate__animated animate__slideInRight">
        <div class="section-title">
          <el-icon class="animate__animated animate__heartBeat animate__delay-1s"><Rank /></el-icon>
          <span>{{ currentTitle ? `${currentTitle.dictValue}用户列表` : '请选择一个职称' }}</span>
        </div>
        <el-card shadow="hover" class="user-list-card">
          <template #header>
            <div class="card-header">
              <div class="total-info animate__animated animate__fadeIn">
                共 <span class="user-count">{{ userListByTitle.length }}</span> 名用户
              </div>
              <div class="action-btns">
                <ThrottleButton
                  size="small"
                  type="primary"
                  class="save-btn"
                  :class="{'animate__animated animate__pulse animate__infinite animate__slow': hasChanged && currentTitle}"
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
            class="animate__animated animate__fadeIn"
          />
          <el-empty
            v-else-if="userListByTitle.length === 0"
            description="暂无用户数据"
            class="animate__animated animate__fadeIn"
          />
          <div v-else class="user-sort-list">
            <el-alert
              type="info"
              showIcon
              :closable="false"
              class="animate__animated animate__bounceIn"
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
                <div class="user-item cursor-move animate__animated animate__fadeInUp" :style="{'animation-delay': index * 0.05 + 's'}">
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
                      <el-tag
                        v-if="element.isDisplay"
                        size="small"
                        type="primary"
                        class="animate__animated animate__fadeIn"
                      >
                        门户展示
                      </el-tag>
                      <el-tag
                        v-else
                        size="small"
                        type="info"
                        class="animate__animated animate__fadeIn"
                      >
                        不展示
                      </el-tag>
                    </div>
                    <div class="user-title">
                      <span class="label">职称:</span>
                      <span>{{ translateTitle(element.title) }}</span>
                    </div>
                  </div>
                  <div class="user-sort">
                    <div class="sort-value">
                      <span class="label">排序值:</span>
                      <span class="order-value">{{ element.displayOrder || '未设置' }}</span>
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
  // 如果选择的是同一个职称，不做处理
  if (currentTitle.value?.dictId === title.dictId) return
  currentTitle.value = title

  // 过滤当前职称的用户
  const filteredUsers = allUsers.value
    .filter(user => user.title === title.dictId && user.isDisplay)
    .sort((a, b) => {
      // 按排序值升序排列
      return (a.displayOrder || 9999) - (b.displayOrder || 9999)
    })

  // 清除之前保存按钮的动画效果
  const saveBtn = document.querySelector('.save-btn')
  if (saveBtn) {
    saveBtn.classList.remove('animate__animated', 'animate__pulse', 'animate__infinite', 'animate__slow')
  }

  // 添加列表切换动画效果
  const userListSection = document.querySelector('.user-list-section')
  if (userListSection) {
    userListSection.classList.add('animate__animated', 'animate__fadeOut')
    // 短暂延迟后更新数据并恢复显示
    setTimeout(() => {
      userListByTitle.value = [...filteredUsers]
      // 保存原始排序，用于检测变更
      originalUserOrder.value = JSON.parse(JSON.stringify(filteredUsers))

      // 移除淡出动画，添加淡入动画
      userListSection.classList.remove('animate__animated', 'animate__fadeOut')
      userListSection.classList.add('animate__animated', 'animate__fadeIn')

      // 动画结束后移除类
      setTimeout(() => {
        userListSection.classList.remove('animate__animated', 'animate__fadeIn')
      }, 1000)
    }, 300)
  } else {
    // 如果没有找到元素，则直接更新数据
    userListByTitle.value = [...filteredUsers]
    // 保存原始排序，用于检测变更
    originalUserOrder.value = JSON.parse(JSON.stringify(filteredUsers))
  }
}

// 保存排序
const handleSave = () => {
  if (!currentTitle.value || !userListByTitle.value.length) return

  // 清除保存按钮的动画效果
  const saveBtn = document.querySelector('.save-btn')
  if (saveBtn) {
    saveBtn.classList.remove('animate__animated', 'animate__pulse', 'animate__infinite', 'animate__slow')
  }

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
      // 为用户卡片添加动画效果
      const userItems = document.querySelectorAll('.user-item')
      userItems.forEach((item, idx) => {
        setTimeout(() => {
          item.classList.add('animate__animated', 'animate__flipInX')
        }, idx * 50)
      })

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

          // 添加成功动画效果
          setTimeout(() => {
            // 移除之前的动画效果
            userItems.forEach(item => {
              item.classList.remove('animate__animated', 'animate__flipInX')
              item.classList.add('animate__animated', 'animate__pulse')

              // 1秒后移除所有动画类
              setTimeout(() => {
                item.classList.remove('animate__animated', 'animate__pulse')
              }, 1000)
            })

            // 保存当前选中的职称ID
            const currentTitleId = currentTitle.value?.dictId
            // 重新获取数据后，重新选择当前职称
            fetchAllUsers().then(() => {
              if (currentTitleId) {
                // 找到当前选中的职称并重新选择
                const targetTitle = titleList.value.find(title => title.dictId === currentTitleId)
                if (targetTitle) {
                  // 直接设置当前职称，避免触发切换动画
                  currentTitle.value = targetTitle

                  // 过滤当前职称的用户
                  const filteredUsers = allUsers.value
                    .filter(user => user.title === targetTitle.dictId && user.isDisplay)
                    .sort((a, b) => {
                      // 按排序值升序排列
                      return (a.displayOrder || 9999) - (b.displayOrder || 9999)
                    })

                  userListByTitle.value = [...filteredUsers]
                  // 保存原始排序，用于检测变更
                  originalUserOrder.value = JSON.parse(JSON.stringify(filteredUsers))
                }
              }
            })
          }, 500)
        })
        .finally(() => {
          changeLoading(false)
        })
    })
}

// 重置排序
const handleReset = () => {
  // 清除保存按钮的动画效果
  const saveBtn = document.querySelector('.save-btn')
  if (saveBtn) {
    saveBtn.classList.remove('animate__animated', 'animate__pulse', 'animate__infinite', 'animate__slow')
  }

  // 为容器添加一个轻微的抖动效果
  const container = document.querySelector('.user-sort-list')
  if (container) {
    container.classList.add('animate__animated', 'animate__shakeX')

    // 动画结束后移除类
    setTimeout(() => {
      container.classList.remove('animate__animated', 'animate__shakeX')

      // 重置为原始排序
      if (originalUserOrder.value && originalUserOrder.value.length) {
        // 添加重置动画效果
        const userItems = document.querySelectorAll('.user-item')

        userItems.forEach((item) => {
          item.classList.add('animate__animated', 'animate__fadeOut')
        })

        // 短暂延迟后更新数据
        setTimeout(() => {
          userListByTitle.value = JSON.parse(JSON.stringify(originalUserOrder.value))

          // 在下一个 tick 中添加淡入动画
          setTimeout(() => {
            document.querySelectorAll('.user-item').forEach((item) => {
              item.classList.remove('animate__fadeOut')
              item.classList.add('animate__fadeIn')

              // 动画结束后移除类
              setTimeout(() => {
                item.classList.remove('animate__animated', 'animate__fadeIn')
              }, 1000)
            })
          }, 50)
        }, 300)
      }
    }, 500)
  } else {
    // 如果没有找到容器，直接重置
    if (originalUserOrder.value && originalUserOrder.value.length) {
      userListByTitle.value = JSON.parse(JSON.stringify(originalUserOrder.value))
    }
  }
}

// 拖拽事件处理
interface DragEvent {
  item: HTMLElement;
  newIndex: number;
  oldIndex: number;
}

const dragStart = (evt: DragEvent) => {
  // 添加拖拽开始时的动画效果
  if (evt.item) {
    evt.item.classList.add('animate__animated', 'animate__pulse')
    evt.item.classList.add('sortable-dragging')
  }
  // 其他项目稍微淡化
  document.querySelectorAll('.user-item').forEach((item: Element) => {
    if (item !== evt.item && item instanceof HTMLElement) {
      item.style.opacity = '0.6'
    }
  })
}

const dragEnd = (evt: DragEvent) => {
  // 拖拽结束后移除动画类
  if (evt.item) {
    evt.item.classList.remove('animate__animated', 'animate__pulse')
    evt.item.classList.remove('sortable-dragging')
    // 添加新的位置动画效果
    evt.item.classList.add('animate__animated', 'animate__bounceIn')
    setTimeout(() => {
      evt.item.classList.remove('animate__animated', 'animate__bounceIn')
    }, 1000)
  }
  // 恢复所有项目的不透明度
  document.querySelectorAll('.user-item').forEach((item: Element) => {
    if (item instanceof HTMLElement) {
      item.style.opacity = '1'
    }
  })

  // 排序变更时的提示效果
  if (hasChanged.value) {
    const saveBtn = document.querySelector('.save-btn')
    if (saveBtn && saveBtn instanceof HTMLElement && !saveBtn.classList.contains('animate__pulse')) {
      saveBtn.classList.add('animate__animated', 'animate__pulse', 'animate__infinite', 'animate__slow')
    }
  }
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
  position: relative;
  /* 添加淡出淡入动画的持续时间 */
  .animate__fadeOut {
    animation-duration: 0.3s !important;
  }
  .animate__fadeIn {
    animation-duration: 0.5s !important;
  }
  /* 拖拽中的元素样式 */
  .sortable-dragging {
    transform: scale(1.03) !important;
    box-shadow: 0 12px 28px rgba(0, 0, 0, 0.15) !important;
    z-index: 10;
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 120px;
    background: linear-gradient(to bottom right,
      rgba(var(--el-color-primary-rgb), 0.05) 0%,
      rgba(var(--el-color-primary-rgb), 0.01) 100%);
    z-index: 0;
  }

  .sort-container {
    display: flex;
    gap: 24px;
    position: relative;
    z-index: 1;

    .title-list-section {
      width: 300px;
      flex-shrink: 0;

      .section-title {
        display: flex;
        align-items: center;
        font-size: 18px;
        font-weight: 600;
        margin-bottom: 18px;
        color: var(--el-text-color-primary);
        position: relative;
        padding-bottom: 10px;

        &::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 40px;
          height: 3px;
          background: var(--el-color-primary);
          border-radius: 3px;
        }

        .el-icon {
          margin-right: 10px;
          color: var(--el-color-primary);
          font-size: 22px;
          filter: drop-shadow(0 2px 2px rgba(var(--el-color-primary-rgb), 0.3));
        }
      }

      .title-list-card {
        height: calc(@contentHeight - 90px);
        overflow-y: auto;
        background-color: var(--el-bg-color-overlay);
        border-radius: 10px;
        border: 1px solid var(--el-border-color-light);
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.05);
        transition: all 0.3s ease;

        &:hover {
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.08);
        }

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
          padding: 14px 16px;
          border-radius: 8px;
          margin: 8px;
          cursor: pointer;
          transition: all 0.3s;
          background-color: var(--el-fill-color-light);
          position: relative;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);

          &::before {
            content: '';
            position: absolute;
            left: 0;
            top: 0;
            height: 100%;
            width: 3px;
            background-color: var(--el-color-primary);
            opacity: 0;
            transition: opacity 0.3s;
          }

          &:hover {
            background-color: var(--el-fill-color-darker);
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);

            &::before {
              opacity: 0.6;
            }

            .count-badge {
              transform: scale(1.05);
            }
          }

          &.active {
            background: linear-gradient(to right,
              color-mix(in srgb, var(--el-color-primary) 15%, var(--el-bg-color)),
              color-mix(in srgb, var(--el-color-primary) 5%, var(--el-bg-color))
            );
            color: var(--el-color-primary);
            font-weight: 500;
            border-left: 3px solid var(--el-color-primary);
            box-shadow: 0 6px 14px rgba(var(--el-color-primary-rgb), 0.15);

            &::before {
              opacity: 1;
            }
          }

          .title-item-content {
            display: flex;
            align-items: center;

            .el-icon {
              margin-right: 10px;
              font-size: 20px;
            }

            .count-badge {
              margin-left: auto;
              background-image: linear-gradient(to right, var(--el-color-primary), var(--el-color-primary-light-3));
              color: white;
              border-radius: 12px;
              padding: 3px 10px;
              font-size: 12px;
              font-weight: 600;
              box-shadow: 0 2px 6px rgba(var(--el-color-primary-rgb), 0.35);
              transition: all 0.3s;
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
        font-size: 18px;
        font-weight: 600;
        margin-bottom: 18px;
        color: var(--el-text-color-primary);
        position: relative;
        padding-bottom: 10px;

        &::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 40px;
          height: 3px;
          background: var(--el-color-primary);
          border-radius: 3px;
        }

        .el-icon {
          margin-right: 10px;
          color: var(--el-color-primary);
          font-size: 22px;
          filter: drop-shadow(0 2px 2px rgba(var(--el-color-primary-rgb), 0.3));
        }
      }

      .user-list-card {
        height: calc(@contentHeight - 90px);
        background-color: var(--el-bg-color-overlay);
        border-radius: 10px;
        border: 1px solid var(--el-border-color-light);
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.05);
        transition: all 0.3s ease;

        &:hover {
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.08);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          border-bottom: 1px solid var(--el-border-color-light);

          .total-info {
            font-size: 15px;
            color: var(--el-text-color-secondary);

            .user-count {
              color: var(--el-color-primary);
              font-weight: 600;
              font-size: 16px;
            }
          }

          .action-btns {
            display: flex;
            gap: 10px;

            .save-btn {
              background: linear-gradient(45deg, var(--el-color-primary), var(--el-color-primary-light-3));
              border: none;
              box-shadow: 0 3px 8px rgba(var(--el-color-primary-rgb), 0.3);
              transition: all 0.3s;

              &:hover:not(:disabled) {
                transform: translateY(-2px);
                box-shadow: 0 5px 12px rgba(var(--el-color-primary-rgb), 0.4);
              }
            }
          }
        }

        .user-sort-list {
          overflow-y: auto;
          height: calc(@contentHeight - 190px);
          padding: 0 8px;

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

          .el-alert {
            margin-bottom: 16px;
            border-radius: 8px;
          }

          .draggable-container {
            margin-top: 12px;
          }

          .user-item {
            display: flex;
            align-items: center;
            padding: 16px;
            border-radius: 12px;
            background-color: var(--el-bg-color-overlay);
            border: 1px solid var(--el-border-color-lighter);
            margin-bottom: 12px;
            transition: all 0.3s;
            position: relative;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);

            &:hover {
              background-color: var(--el-fill-color-darker);
              border-color: var(--el-border-color);
              transform: translateY(-3px);
              box-shadow: 0 8px 20px rgba(var(--el-color-primary-rgb), 0.12);
            }

            &::before {
              content: '';
              position: absolute;
              left: 0;
              top: 0;
              height: 100%;
              width: 4px;
              background: linear-gradient(to bottom, var(--el-color-primary), var(--el-color-primary-light-5));
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
              background-color: var(--el-color-primary-light-9);
              border: 2px dashed var(--el-color-primary);
              box-shadow: 0 0 15px rgba(var(--el-color-primary-rgb), 0.2);
            }

            &.sortable-chosen {
              cursor: grabbing;
              box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
            }

            .user-order {
              width: 32px;
              height: 32px;
              border-radius: 10px;
              background-image: linear-gradient(135deg, var(--el-color-primary), var(--el-color-primary-light-5));
              color: white;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 15px;
              font-weight: 600;
              margin-right: 16px;
              box-shadow: 0 3px 8px rgba(var(--el-color-primary-rgb), 0.35);
              transition: all 0.3s;

              &:hover {
                transform: scale(1.05);
                box-shadow: 0 4px 10px rgba(var(--el-color-primary-rgb), 0.45);
              }
            }

            .user-avatar {
              margin-right: 16px;

              .el-avatar {
                box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
                border: 2px solid rgba(var(--el-color-primary-rgb), 0.2);
              }
            }

            .user-info {
              flex: 1;

              .user-name {
                font-weight: 600;
                font-size: 15px;
                margin-bottom: 6px;
                display: flex;
                align-items: center;

                .el-tag {
                  margin-left: 10px;
                  border-radius: 4px;
                  padding: 0 8px;
                }
              }

              .user-title {
                font-size: 13px;
                color: var(--el-text-color-secondary);

                .label {
                  margin-right: 5px;
                  opacity: 0.8;
                }
              }
            }

            .user-sort {
              .sort-value {
                font-size: 13px;
                color: var(--el-text-color-secondary);

                .label {
                  margin-right: 5px;
                  opacity: 0.8;
                }
                .order-value {
                  font-weight: 600;
                  color: var(--el-color-primary);
                  background: rgba(var(--el-color-primary-rgb), 0.1);
                  padding: 2px 8px;
                  border-radius: 4px;
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

