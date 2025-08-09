<template>
  <div class="home-container">
    <!-- 欢迎区域 -->
    <div class="welcome-section animate__animated animate__fadeInDown">
      <div class="welcome-content">
        <h1 class="welcome-title">欢迎来到教育管理系统</h1>
        <p class="welcome-subtitle">科研管理 · 资源共享 · 学术协作 · 数据驱动</p>
        <div class="welcome-stats">
          <span class="time-info">{{ currentTime }}</span>
          <span class="login-info">最后登录：{{ userInfo.lastLoginTime }}</span>
        </div>
      </div>
      <div class="welcome-decoration">
        <div class="decoration-circle"></div>
        <div class="decoration-dots"></div>
      </div>
    </div>

    <!-- 数据统计组件 -->
    <DashboardStats />

    <!-- 主要内容区域 -->
    <div class="main-content animate__animated animate__fadeIn" style="animation-delay: 0.4s;">
      <el-row :gutter="24">
        <!-- 左侧：最新通知 -->
        <el-col :xl="12" :lg="12" :md="24"
          :sm="24" :xs="24"
        >
          <LatestNotices />
        </el-col>

        <!-- 右侧：最新动态 -->
        <el-col :xl="12" :lg="12" :md="24"
          :sm="24" :xs="24"
        >
          <LatestDynamics />
        </el-col>
      </el-row>

      <!-- 第二行：最新科研成果和系统信息 -->
      <el-row :gutter="24" style="margin-top: 24px;">
        <!-- 左侧：最新科研成果 -->
        <el-col :xl="16" :lg="16" :md="24"
          :sm="24" :xs="24"
        >
          <LatestResearch />
        </el-col>

        <!-- 右侧：快捷入口和系统信息 -->
        <el-col :span="8">
          <!-- 快捷入口 -->
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
                <span class="info-value">v2.0.0</span>
              </div>
              <div class="info-item">
                <span class="info-label">在线用户：</span>
                <span class="info-value">{{ systemStats.onlineUsers || 0 }}</span>
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
import {
  Menu, InfoFilled
} from '@element-plus/icons-vue'
import DashboardStats from '@/components/dashboard/dashboardStats.vue'
import { LatestNotices, LatestDynamics, LatestResearch } from '@/components/home'

const router = useRouter()
const userInfoStore = useUserInfoStore()

// 当前时间
const currentTime = ref('')

// 用户信息
const userInfo = reactive({
  username: userInfoStore.userInfo?.username || '未登录',
  roleName: userInfoStore.userInfo?.role || '未知',
  lastLoginTime: new Date().toLocaleString()
})

// 系统信息统计
const systemStats = reactive({
  onlineUsers: 0
})

// 快捷入口
const shortcuts = [
  { name: '个人中心', icon: 'User', path: '/userCenter' },
  { name: '通知管理', icon: 'Bell', path: '/noticeManage' },
  { name: '论文管理', icon: 'Document', path: '/paperManage' },
  { name: '专利管理', icon: 'Medal', path: '/patentManage' },
  { name: '仪器管理', icon: 'Suitcase', path: '/instrumentManage' },
  { name: '用户管理', icon: 'UserFilled', path: '/userManage' },
  { name: '招聘管理', icon: 'Briefcase', path: '/recruitManage' },
  { name: '工具管理', icon: 'Tools', path: '/toolManage' },
  { name: '简介管理', icon: 'InfoFilled', path: '/labProfileManage' }
]

// 更新时间
const updateCurrentTime = () => {
  currentTime.value = new Date().toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// 导航到指定路径
const navigateTo = (path: string) => {
  router.push(path)
}

// 获取系统统计数据
const fetchSystemStats = async() => {
  try {
    // 模拟在线用户数据
    systemStats.onlineUsers = Math.floor(Math.random() * 50) + 10
  } catch (error) {
    console.error('获取系统统计数据失败', error)
  }
}

// 获取首页数据
const fetchHomeData = async() => {
  await fetchSystemStats()
}

onMounted(() => {
  updateCurrentTime()
  // 每秒更新时间
  setInterval(updateCurrentTime, 1000)

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
      color-mix(in srgb, var(--el-color-primary) 15%, white) 0%,
      color-mix(in srgb, var(--el-color-primary) 5%, white) 100%);
    border-radius: 16px;
    padding: 35px 40px;
    margin-bottom: 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    overflow: hidden;
    box-shadow: 0 6px 30px rgba(0, 0, 0, 0.08);
    transition: all 0.3s ease;

    &:hover {
      box-shadow: 0 8px 40px rgba(0, 0, 0, 0.12);
      transform: translateY(-2px);
    }

    .welcome-content {
      position: relative;
      z-index: 2;

      .welcome-title {
        font-size: 28px;
        font-weight: 700;
        background: linear-gradient(135deg, var(--el-color-primary), #409eff);
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
        margin: 0 0 12px 0;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .welcome-subtitle {
        font-size: 16px;
        color: var(--el-text-color-secondary);
        margin: 0 0 15px 0;
        letter-spacing: 1px;
      }

      .welcome-stats {
        display: flex;
        gap: 20px;
        margin-top: 10px;

        .time-info, .login-info {
          font-size: 14px;
          color: var(--el-text-color-regular);
          padding: 6px 12px;
          background: rgba(255, 255, 255, 0.7);
          border-radius: 20px;
          backdrop-filter: blur(10px);
        }
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
  .stats-section, .stats-section-second {
    margin-bottom: 24px;

    .stats-card {
      background-color: #fff;
      border-radius: 16px;
      padding: 24px 20px;
      display: flex;
      align-items: center;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      height: 110px;
      cursor: pointer;
      position: relative;
      overflow: hidden;

      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 3px;
        background: linear-gradient(90deg, var(--el-color-primary), #409eff);
        transform: translateX(-100%);
        transition: transform 0.3s ease;
      }

      &:hover {
        transform: translateY(-8px) scale(1.02);
        box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);

        &::before {
          transform: translateX(0);
        }

        .stats-icon {
          transform: scale(1.1);
        }

        .stats-value {
          color: var(--el-color-primary);
        }
      }

      .stats-icon {
        width: 56px;
        height: 56px;
        border-radius: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 18px;
        transition: all 0.3s ease;

        &.notice-icon {
          background: linear-gradient(135deg, rgba(67, 56, 202, 0.1), rgba(99, 102, 241, 0.1));
        }
        &.user-icon {
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(34, 197, 94, 0.1));
        }
        &.paper-icon {
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(99, 102, 241, 0.1));
        }
        &.instrument-icon {
          background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(251, 191, 36, 0.1));
        }
        &.patent-icon {
          background: linear-gradient(135deg, rgba(236, 72, 153, 0.1), rgba(244, 114, 182, 0.1));
        }
        &.book-icon {
          background: linear-gradient(135deg, rgba(139, 69, 19, 0.1), rgba(202, 138, 4, 0.1));
        }
        &.recruit-icon {
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(124, 58, 237, 0.1));
        }
        &.tool-icon {
          background: linear-gradient(135deg, rgba(14, 165, 233, 0.1), rgba(6, 182, 212, 0.1));
        }

        .el-icon {
          font-size: 28px;
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
        font-size: 13px;
        font-weight: 600;
        padding: 6px 10px;
        border-radius: 20px;
        transition: all 0.3s ease;

        &.up {
          color: #67C23A;
          background-color: rgba(103, 194, 58, 0.15);
        }

        &.down {
          color: #F56C6C;
          background-color: rgba(245, 108, 108, 0.15);
        }

        .el-icon {
          margin-right: 4px;
          font-size: 14px;
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

      // 动态列表样式
      &.dynamics-card {
        .dynamics-list {
          .dynamic-item {
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

              .dynamic-arrow {
                transform: translateX(3px);
                opacity: 1;
              }
            }

            .dynamic-content {
              flex: 1;

              .dynamic-title {
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

              .dynamic-meta {
                font-size: 12px;
                color: var(--el-text-color-secondary);

                .meta-divider {
                  margin: 0 8px;
                }
              }
            }

            .dynamic-arrow {
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

      // 科研成果样式
      &.research-card {
        .card-header {
          .el-tabs {
            margin-left: auto;
          }
        }

        .research-list {
          .research-item {
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

              .research-arrow {
                transform: translateX(3px);
                opacity: 1;
              }
            }

            .research-content {
              flex: 1;

              .research-title {
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

              .research-meta {
                font-size: 12px;
                color: var(--el-text-color-secondary);

                .meta-divider {
                  margin: 0 8px;
                }
              }
            }

            .research-arrow {
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
