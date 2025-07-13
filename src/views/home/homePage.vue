<template>
  <div class="home-container">
    <!-- 欢迎区域 -->
    <div class="welcome-section">
      <div class="welcome-content">
        <h1 class="welcome-title">欢迎来到合成生物研究所管理系统</h1>
        <p class="welcome-subtitle">科研管理 · 资源共享 · 高效协作</p>
      </div>
      <div class="welcome-decoration">
        <div class="decoration-circle"></div>
        <div class="decoration-dots"></div>
      </div>
    </div>

    <!-- 数据统计卡片区域 -->
    <div class="stats-section">
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="stats-card">
            <div class="stats-icon">
              <el-icon><Document /></el-icon>
            </div>
            <div class="stats-info">
              <div class="stats-value">{{ stats.notices }}</div>
              <div class="stats-label">通知公告</div>
            </div>
            <div class="stats-trend" :class="{ 'up': true }">
              <el-icon><ArrowUp /></el-icon>
              <span>{{ stats.noticeRate }}%</span>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stats-card">
            <div class="stats-icon">
              <el-icon><User /></el-icon>
            </div>
            <div class="stats-info">
              <div class="stats-value">{{ stats.users }}</div>
              <div class="stats-label">用户数量</div>
            </div>
            <div class="stats-trend" :class="{ 'up': true }">
              <el-icon><ArrowUp /></el-icon>
              <span>{{ stats.userRate }}%</span>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stats-card">
            <div class="stats-icon">
              <el-icon><Briefcase /></el-icon>
            </div>
            <div class="stats-info">
              <div class="stats-value">{{ stats.projects }}</div>
              <div class="stats-label">研究项目</div>
            </div>
            <div class="stats-trend" :class="{ 'up': true }">
              <el-icon><ArrowUp /></el-icon>
              <span>{{ stats.projectRate }}%</span>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stats-card">
            <div class="stats-icon">
              <el-icon><Collection /></el-icon>
            </div>
            <div class="stats-info">
              <div class="stats-value">{{ stats.publications }}</div>
              <div class="stats-label">科研成果</div>
            </div>
            <div class="stats-trend" :class="{ 'up': true }">
              <el-icon><ArrowUp /></el-icon>
              <span>{{ stats.publicationRate }}%</span>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <el-row :gutter="20">
        <!-- 左侧：通知公告 -->
        <el-col :span="16">
          <el-card class="content-card notice-card">
            <template #header>
              <div class="card-header">
                <div class="header-title">
                  <el-icon><Bell /></el-icon>
                  <span>最新通知</span>
                </div>
                <el-button text @click="goToNoticePage">查看全部</el-button>
              </div>
            </template>
            <div class="notice-list">
              <div v-if="notices.length === 0" class="empty-data">
                <el-empty description="暂无通知公告" />
              </div>
              <div v-for="(notice, index) in notices" v-else :key="index"
                class="notice-item" @click="viewNotice(notice.id)"
              >
                <div class="notice-content">
                  <div class="notice-title">
                    <el-tag size="small" :type="getNoticeTypeTag(notice.type)">{{ getNoticeTypeName(notice.type) }}</el-tag>
                    <span class="title-text">{{ notice.title }}</span>
                  </div>
                  <div class="notice-meta">
                    <span>{{ notice.createTime }}</span>
                    <span class="meta-divider">|</span>
                    <span>{{ notice.author }}</span>
                  </div>
                </div>
                <el-icon class="notice-arrow"><ArrowRight /></el-icon>
              </div>
            </div>
          </el-card>
        </el-col>

        <!-- 右侧：快捷入口 -->
        <el-col :span="8">
          <el-card class="content-card shortcuts-card">
            <template #header>
              <div class="card-header">
                <div class="header-title">
                  <el-icon><Menu /></el-icon>
                  <span>快捷入口</span>
                </div>
              </div>
            </template>
            <div class="shortcuts-grid">
              <div v-for="(shortcut, index) in shortcuts" :key="index" class="shortcut-item"
                @click="navigateTo(shortcut.path)"
              >
                <el-icon class="shortcut-icon">
                  <component :is="shortcut.icon" />
                </el-icon>
                <span class="shortcut-name">{{ shortcut.name }}</span>
              </div>
            </div>
          </el-card>

          <!-- 系统信息 -->
          <el-card class="content-card system-card">
            <template #header>
              <div class="card-header">
                <div class="header-title">
                  <el-icon><InfoFilled /></el-icon>
                  <span>系统信息</span>
                </div>
              </div>
            </template>
            <div class="system-info">
              <div class="info-item">
                <span class="info-label">当前用户：</span>
                <span class="info-value">{{ userInfo.username }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">用户角色：</span>
                <span class="info-value">{{ userInfo.roleName }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">系统版本：</span>
                <span class="info-value">v1.0.0</span>
              </div>
              <div class="info-item">
                <span class="info-label">最后登录：</span>
                <span class="info-value">{{ userInfo.lastLoginTime }}</span>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useUserInfoStore } from '@/stores/userInfo'
import { Document, User, Briefcase, Collection, Bell, Menu, InfoFilled, ArrowRight, ArrowUp } from '@element-plus/icons-vue'
import service from '@/utils/services'
import { ElMessage } from 'element-plus'

const router = useRouter()
const userInfoStore = useUserInfoStore()

// 用户信息
const userInfo = reactive({
  username: userInfoStore.userInfo?.username || '未登录',
  roleName: userInfoStore.userInfo?.role || '未知',
  lastLoginTime: '2023-07-15 08:30:45'
})

// 统计数据
const stats = reactive({
  notices: 24,
  noticeRate: 12,
  users: 156,
  userRate: 8,
  projects: 42,
  projectRate: 15,
  publications: 78,
  publicationRate: 20
})

// 通知列表
const notices = ref([
  {
    id: '1',
    title: '关于2023年度科研项目申报的通知',
    type: '2001',
    createTime: '2023-07-10',
    author: '系统管理员'
  },
  {
    id: '2',
    title: '实验室安全培训通知',
    type: '2002',
    createTime: '2023-07-08',
    author: '安全管理部'
  },
  {
    id: '3',
    title: '关于新增设备使用培训的通知',
    type: '2003',
    createTime: '2023-07-05',
    author: '设备管理部'
  },
  {
    id: '4',
    title: '2023年度学术交流会议安排',
    type: '2001',
    createTime: '2023-07-01',
    author: '学术委员会'
  }
])

// 快捷入口
const shortcuts = [
  { name: '个人中心', icon: 'User', path: '/userCenter' },
  { name: '通知管理', icon: 'Bell', path: '/noticeManage' },
  { name: '实验室简介', icon: 'House', path: '/labProfileManage' },
  { name: '招聘管理', icon: 'Briefcase', path: '/recruitManage' },
  { name: '用户管理', icon: 'UserFilled', path: '/userManage' },
  { name: '系统设置', icon: 'Setting', path: '/settings' }
]

// 获取通知类型标签
const getNoticeTypeTag = (type: string) => {
  const typeMap: Record<string, string> = {
    '2001': 'success',
    '2002': 'warning',
    '2003': 'info',
    '2004': 'danger'
  }
  return typeMap[type] || 'info'
}

// 获取通知类型名称
const getNoticeTypeName = (type: string) => {
  const typeMap: Record<string, string> = {
    '2001': '公告',
    '2002': '通知',
    '2003': '会议',
    '2004': '紧急'
  }
  return typeMap[type] || '其他'
}

// 查看通知详情
const viewNotice = (id: string) => {
  router.push({
    path: '/noticeDetail',
    query: { id }
  })
}

// 跳转到通知页面
const goToNoticePage = () => {
  router.push('/noticeManage')
}

// 导航到指定路径
const navigateTo = (path: string) => {
  router.push(path)
}

// 获取首页数据
const fetchHomeData = () => {
  // 这里可以调用API获取实际数据
  // service.get('/api/home/stats').then(res => {
  //   Object.assign(stats, res)
  // }).catch(() => {
  //   ElMessage.error('获取统计数据失败')
  // })

  // service.get('/api/home/notices').then(res => {
  //   notices.value = res
  // }).catch(() => {
  //   ElMessage.error('获取通知列表失败')
  // })
}

onMounted(() => {
  fetchHomeData()
})
</script>

<style scoped lang="less">
// 动画关键帧
@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
}

@keyframes pulse {
  0% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.05); opacity: 1; }
  100% { transform: scale(1); opacity: 0.8; }
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.home-container {
  padding: 20px;
  background-color: @pageBgColor;
  min-height: @contentHeight;

  // 欢迎区域
  .welcome-section {
    position: relative;
    background: linear-gradient(135deg,
      color-mix(in srgb, var(--primaryColor) 15%, white) 0%,
      color-mix(in srgb, var(--primaryColor) 5%, white) 100%);
    border-radius: 12px;
    padding: 30px 40px;
    margin-bottom: 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);

    .welcome-content {
      position: relative;
      z-index: 2;

      .welcome-title {
        font-size: 24px;
        font-weight: 600;
        color: var(--el-text-color-primary);
        margin: 0 0 10px 0;
      }

      .welcome-subtitle {
        font-size: 16px;
        color: var(--el-text-color-secondary);
        margin: 0;
      }
    }

    .welcome-decoration {
      position: absolute;
      right: 40px;
      top: 0;
      height: 100%;
      display: flex;
      align-items: center;
      z-index: 1;

      .decoration-circle {
        width: 120px;
        height: 120px;
        border-radius: 50%;
        background: radial-gradient(circle,
          rgba(var(--el-color-primary-rgb), 0.2) 0%,
          rgba(var(--el-color-primary-rgb), 0.05) 70%);
        animation: pulse 4s ease-in-out infinite;
      }

      .decoration-dots {
        position: absolute;
        width: 200px;
        height: 200px;
        right: -40px;
        opacity: 0.4;
        background-image: radial-gradient(var(--el-color-primary) 1px, transparent 1px);
        background-size: 12px 12px;
      }
    }
  }

  // 统计卡片区域
  .stats-section {
    margin-bottom: 24px;

    .stats-card {
      background-color: #fff;
      border-radius: 12px;
      padding: 20px;
      display: flex;
      align-items: center;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
      transition: all 0.3s ease;
      height: 100px;

      &:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
      }

      .stats-icon {
        width: 50px;
        height: 50px;
        border-radius: 12px;
        background-color: rgba(var(--el-color-primary-rgb), 0.1);
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 15px;

        .el-icon {
      font-size: 24px;
      color: var(--el-color-primary);
    }
  }

      .stats-info {
        flex: 1;

        .stats-value {
          font-size: 24px;
          font-weight: 600;
          color: var(--el-text-color-primary);
          line-height: 1.2;
        }

        .stats-label {
          font-size: 14px;
          color: var(--el-text-color-secondary);
        }
      }

      .stats-trend {
        display: flex;
        align-items: center;
        font-size: 14px;
        padding: 4px 8px;
        border-radius: 4px;

        &.up {
          color: #67C23A;
          background-color: rgba(103, 194, 58, 0.1);
        }

        &.down {
          color: #F56C6C;
          background-color: rgba(245, 108, 108, 0.1);
        }

        .el-icon {
          margin-right: 4px;
          font-size: 12px;
        }
      }
    }
  }

  // 主要内容区域
  .main-content {
    .content-card {
      border-radius: 12px;
      margin-bottom: 20px;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
      transition: all 0.3s ease;

      &:hover {
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
      }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
        padding: 15px 20px;

        .header-title {
          display: flex;
          align-items: center;
          font-size: 16px;
          font-weight: 600;

          .el-icon {
            margin-right: 8px;
            font-size: 18px;
            color: var(--el-color-primary);
          }
        }
      }

      // 通知列表样式
      &.notice-card {
        .notice-list {
          .notice-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 12px 20px;
            border-bottom: 1px solid var(--el-border-color-lighter);
            cursor: pointer;
            transition: all 0.2s ease;

            &:last-child {
              border-bottom: none;
            }

            &:hover {
              background-color: var(--el-fill-color-light);

              .notice-arrow {
                transform: translateX(3px);
                opacity: 1;
              }
            }

            .notice-content {
              flex: 1;

              .notice-title {
                display: flex;
                align-items: center;
                margin-bottom: 6px;

                .el-tag {
                  margin-right: 8px;
                }

                .title-text {
                  font-size: 14px;
                  color: var(--el-text-color-primary);
                  font-weight: 500;
                }
              }

              .notice-meta {
                font-size: 12px;
                color: var(--el-text-color-secondary);

                .meta-divider {
                  margin: 0 8px;
                }
              }
            }

            .notice-arrow {
              color: var(--el-color-primary);
              font-size: 16px;
              transition: all 0.2s ease;
              opacity: 0.5;
            }
          }

          .empty-data {
            padding: 20px 0;
          }
        }
      }

      // 快捷入口样式
      &.shortcuts-card {
        .shortcuts-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 15px;
          padding: 10px;

          .shortcut-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 15px 0;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s ease;

            &:hover {
              background-color: rgba(var(--el-color-primary-rgb), 0.1);

              .shortcut-icon {
                transform: translateY(-3px);
              }
            }

            .shortcut-icon {
              font-size: 24px;
              color: var(--el-color-primary);
              margin-bottom: 8px;
              transition: all 0.2s ease;
            }

            .shortcut-name {
              font-size: 13px;
              color: var(--el-text-color-primary);
            }
          }
        }
      }

      // 系统信息样式
      &.system-card {
        .system-info {
          padding: 10px;

          .info-item {
            display: flex;
            margin-bottom: 12px;

            &:last-child {
              margin-bottom: 0;
            }

            .info-label {
              width: 80px;
              color: var(--el-text-color-secondary);
              font-size: 14px;
            }

            .info-value {
              flex: 1;
              color: var(--el-text-color-primary);
              font-size: 14px;
              font-weight: 500;
            }
          }
        }
      }
    }
  }
}
</style>
