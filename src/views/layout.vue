<template>
  <!-- https://lin-xin.github.io/example/vue-manage-system/#/dashboard -->
  <div class="layout-wrap">
    <div class="layout-top">
      <div class="logo-wrap" :class="{ 'collapsed': isCollapsed }">
        <div class="logo-container">
          <!-- DNA/分子结构图标 -->
          <div class="logo-icon">
            <svg
              viewBox="0 0 40 40"
              class="dna-icon"
            >
              <path
                d="M8 10 Q20 5 32 10 Q20 15 8 10"
                class="dna-strand"
              />
              <path
                d="M8 20 Q20 15 32 20 Q20 25 8 20"
                class="dna-strand"
              />
              <path
                d="M8 30 Q20 25 32 30 Q20 35 8 30"
                class="dna-strand"
              />
              <circle
                cx="12"
                cy="10"
                r="1.5"
                class="dna-node"
              />
              <circle
                cx="20"
                cy="12"
                r="1.5"
                class="dna-node"
              />
              <circle
                cx="28"
                cy="10"
                r="1.5"
                class="dna-node"
              />
              <circle
                cx="16"
                cy="20"
                r="1.5"
                class="dna-node"
              />
              <circle
                cx="24"
                cy="20"
                r="1.5"
                class="dna-node"
              />
              <circle
                cx="12"
                cy="30"
                r="1.5"
                class="dna-node"
              />
              <circle
                cx="20"
                cy="28"
                r="1.5"
                class="dna-node"
              />
              <circle
                cx="28"
                cy="30"
                r="1.5"
                class="dna-node"
              />
            </svg>
          </div>
          <!-- 品牌文字 -->
          <div class="logo-text-container">
            <div class="brand-name" data-text="合成生物学">合成生物学</div>
            <div class="brand-subtitle" data-text="研究所">研究所</div>
          </div>
        </div>
        <!-- 玻璃态装饰效果 -->
        <div class="glass-overlay"></div>
        <div class="floating-particles"></div>
      </div>
      <div class="other-info-wrap">
        <!-- 主题切换组件 -->
        <themeSwitch />
        <div class="user-info">
          <UserDropdown />
        </div>
      </div>
    </div>
    <div class="layout-bottom">
      <div class="layout-bottom-left" :class="{ 'menu-collapsed': isCollapsed }">
        <div class="menu-collapse-btn" @click="toggleCollapse">
          <el-icon>
            <component :is="isCollapsed ? Expand : Fold" />
          </el-icon>
        </div>
        <div class="menu-wrap">
          <MenuInfo :isCollapsed="isCollapsed" />
        </div>
      </div>
      <div class="layout-bottom-right" :class="{ 'expanded': isCollapsed }">
        <MenuTabs />
        <el-scrollbar class="content-wrap">
          <router-view v-slot="{ Component, route: routeProps }">
            <transition name="fade-transform" mode="out-in">
              <keep-alive :include="cachedViews">
                <component
                  :is="wrapComponent(Component, routeProps)"
                  :key="getComponentKey(routeProps)"
                />
              </keep-alive>
            </transition>
          </router-view>
        </el-scrollbar>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import MenuInfo from '@/components/menuInfo.vue'
import MenuTabs from '@/components/menuTabs.vue'
import UserDropdown from '@/components/userDropdown.vue'
import themeSwitch from '@/components/themeSwitch.vue'
import { useRoute } from 'vue-router'
import { useTabsStore } from '@/stores/menuTabs'
import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { componentWrap, clearComponentCache } from '@/utils/componentWrap'
// Element Plus 图标
import { Expand, Fold } from '@element-plus/icons-vue'

const route = useRoute()
const store = useTabsStore()
const { tabsList, refreshMap } = storeToRefs(store)

// 菜单折叠状态
const isCollapsed = ref(false)

// 切换菜单折叠状态
const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
  // 这里可以加入本地存储，记住用户的偏好
  localStorage.setItem('menuCollapsed', isCollapsed.value.toString())
}

// 初始化菜单折叠状态
const initCollapsedState = () => {
  const savedState = localStorage.getItem('menuCollapsed')
  if (savedState !== null) {
    isCollapsed.value = savedState === 'true'
  }
}

// 页面加载时初始化菜单状态
initCollapsedState()

// 需要缓存的组件名称列表（实际上是路径列表）
const cachedViews = computed(() => {
  return tabsList.value
    .filter(tab => tab.fullPath) // 确保有fullPath
    .map(tab => tab.fullPath) // 使用fullPath作为缓存键
})

// 包装组件，使组件name与路由路径一致
const wrapComponent = (Component: any, routeProps: any) => {
  const { fullPath } = routeProps

  // 检查是否需要刷新
  if (refreshMap.value[fullPath]) {
    // 如果需要刷新，先清除缓存
    clearComponentCache(fullPath)
  }

  // 使用组件包装器重写组件名称
  return componentWrap(Component, fullPath)
}

// 获取组件的key，用于控制组件更新和缓存
const getComponentKey = (routeProps: any) => {
  const { fullPath } = routeProps

  // 检查当前路径是否在刷新列表中
  if (refreshMap.value[fullPath]) {
    return `${fullPath}-${refreshMap.value[fullPath]}` // 添加时间戳强制刷新
  }

  return fullPath
}

// 监听路由变化，处理缓存
watch(() => route.fullPath, () => {
  // 确保当前路由已添加到tabsList中
  const routeName = route.name as string
  if (routeName) {
    // 找到当前路由对应的标签
    const existingTab = tabsList.value.find(tab => tab.fullPath === route.fullPath)

    if (!existingTab) {
      // 如果不存在，添加到tabs中
      const currentTab = {
        path: route.path,
        fullPath: route.fullPath,
        name: routeName,
        query: route.query,
        params: route.params,
        meta: {
          title: route.meta.title as string,
          tabClosable: route.meta.tabClosable !== false
        }
      }
      store.addTabList(currentTab)
    }
  }
}, { immediate: true })
</script>

<style lang="less" scoped>
// 现代化动画关键帧
@keyframes dnaRotate {
  0% { transform: rotate(0deg) scale(1); }
  50% { transform: rotate(180deg) scale(1.05); }
  100% { transform: rotate(360deg) scale(1); }
}

@keyframes brandGlow {
  0% {
    text-shadow: 0 0 10px rgba(var(--el-color-primary-rgb), 0.3);
    transform: translateY(0px);
  }
  50% {
    text-shadow: 0 0 20px rgba(var(--el-color-primary-rgb), 0.6);
    transform: translateY(-1px);
  }
  100% {
    text-shadow: 0 0 10px rgba(var(--el-color-primary-rgb), 0.3);
    transform: translateY(0px);
  }
}

@keyframes glassShimmer {
  0% { transform: translateX(-100%) skewX(-15deg); }
  100% { transform: translateX(300%) skewX(-15deg); }
}

@keyframes particleFloat {
  0% {
    transform: translate(0, 0) scale(0.8);
    opacity: 0.4;
  }
  50% {
    transform: translate(10px, -10px) scale(1);
    opacity: 0.8;
  }
  100% {
    transform: translate(20px, -20px) scale(0.6);
    opacity: 0.2;
  }
}

@keyframes morphingGradient {
  0% {
    background: linear-gradient(45deg,
      rgba(var(--el-color-primary-rgb), 0.1) 0%,
      rgba(var(--el-color-primary-rgb), 0.05) 50%,
      transparent 100%);
  }
  50% {
    background: linear-gradient(225deg,
      rgba(var(--el-color-primary-rgb), 0.15) 0%,
      rgba(var(--el-color-primary-rgb), 0.08) 50%,
      transparent 100%);
  }
  100% {
    background: linear-gradient(45deg,
      rgba(var(--el-color-primary-rgb), 0.1) 0%,
      rgba(var(--el-color-primary-rgb), 0.05) 50%,
      transparent 100%);
  }
}

// 新增的动画关键帧
@keyframes dnaFlow {
  0% {
    stroke-dasharray: 0 10;
    opacity: 0.7;
  }
  50% {
    stroke-dasharray: 5 5;
    opacity: 1;
  }
  100% {
    stroke-dasharray: 10 0;
    opacity: 0.7;
  }
}

@keyframes breathe {
  0%, 100% {
    transform: scale(1);
    opacity: 0.6;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.9;
  }
}

.layout-wrap {
  width: 100vw;
  height: 100vh;
  background-color: var(--bgColor);
  overflow: hidden;
  .layout-top {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    height: @layoutTopHeight;
    background: var(--headerBgGradient);
    box-sizing: border-box;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
    z-index: 1;
    overflow: hidden;

    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(to right, rgba(255, 255, 255, 0.07), rgba(255, 255, 255, 0.0));
      pointer-events: none;
    }

    .logo-wrap {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      padding: 0 20px;
      width: 220px;
      height: 100%;
      color: var(--logoTextColor);
      position: relative;
      overflow: hidden;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);

      // 优化背景增强文字可见性
      background: linear-gradient(135deg,
        rgba(255, 255, 255, 0.15) 0%,
        rgba(255, 255, 255, 0.08) 50%,
        rgba(64, 158, 255, 0.05) 100%
      );
      backdrop-filter: blur(15px) saturate(1.2);
      border-right: 1px solid rgba(255, 255, 255, 0.2);

      // 添加更强的立体感和对比度
      box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, 0.25),
        inset 0 -1px 0 rgba(0, 0, 0, 0.1),
        0 4px 12px rgba(0, 0, 0, 0.1),
        0 0 20px rgba(64, 158, 255, 0.1);

      &.collapsed {
        width: 64px;
        padding: 0;
        justify-content: center;

        .logo-container {
          justify-content: center;

          .logo-text-container {
            opacity: 0;
            transform: translateX(-20px);
            width: 0;
            overflow: hidden;
          }

          .logo-icon {
            margin-right: 0;
            margin-left: 0;
          }
        }

        // 折叠状态下隐藏装饰效果
        &::after {
          opacity: 0;
        }

        .glass-overlay::before {
          animation-play-state: paused;
        }

        .floating-particles {
          opacity: 0;
        }
      }

      .logo-container {
        display: flex;
        align-items: center;
        justify-content: flex-start;
        position: relative;
        z-index: 3;
        transition: all 0.4s ease;
        width: 100%;
      }

      .logo-icon {
        width: 40px;
        height: 40px;
        margin-right: 16px;
        position: relative;
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);

        .dna-icon {
          width: 100%;
          height: 100%;
          filter: drop-shadow(0 3px 8px rgba(0, 0, 0, 0.2));
          animation: dnaRotate 10s linear infinite;
          .dna-strand {
            fill: none;
            stroke: var(--primaryColor, #409eff);
            stroke-width: 2;
            stroke-linecap: round;
            opacity: 0.9;
            transition: all 0.3s ease;

            // 添加发光效果
            filter: drop-shadow(0 0 3px var(--primaryColor, #409eff));

            &:nth-child(1) {
              animation: dnaFlow 4s ease-in-out infinite;
              animation-delay: 0s;
            }
            &:nth-child(2) {
              animation: dnaFlow 4s ease-in-out infinite;
              animation-delay: 1.3s;
            }
            &:nth-child(3) {
              animation: dnaFlow 4s ease-in-out infinite;
              animation-delay: 2.6s;
            }
          }

          .dna-node {
            fill: var(--primaryColor, #409eff);
            opacity: 1;
            transition: all 0.3s ease;

            // 添加节点发光效果
            filter: drop-shadow(0 0 4px var(--primaryColor, #409eff));

            &:nth-child(n+4) {
              animation: particleFloat 3s ease-in-out infinite;
              animation-delay: calc(var(--i, 0) * 0.3s);
            }
          }
        }

        // 添加背景光环效果
        &::before {
          content: '';
          position: absolute;
          top: -4px;
          left: -4px;
          right: -4px;
          bottom: -4px;
          background: radial-gradient(circle,
            rgba(64, 158, 255, 0.1) 0%,
            rgba(64, 158, 255, 0.05) 50%,
            transparent 100%
          );
          border-radius: 50%;
          opacity: 0.8;
          animation: breathe 3s ease-in-out infinite;
        }

        &:hover {
          .dna-icon {
            animation-duration: 3s;
            transform: scale(1.15);

            .dna-strand {
              stroke-width: 2.5;
              opacity: 1;
              filter: drop-shadow(0 0 6px var(--primaryColor, #409eff));
            }

            .dna-node {
              filter: drop-shadow(0 0 8px var(--primaryColor, #409eff));
            }
          }

          &::before {
            opacity: 1;
            transform: scale(1.2);
          }
        }
      }

      .logo-text-container {
        display: flex;
        flex-direction: column;
        transition: all 0.4s ease;

        // 统一的品牌文字样式 - 高清晰度方案
        .brand-name,
        .brand-subtitle {
          position: relative;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Helvetica Neue', Helvetica, Arial, sans-serif;
          color: #ffffff;
          transition: all 0.4s ease;

          // 避免模糊的高清晰度文字阴影方案
          text-shadow:
            0 0 1px rgba(0, 0, 0, 0.8),
            0 1px 3px rgba(0, 0, 0, 0.6),
            0 0 8px rgba(255, 255, 255, 0.4),
            0 0 16px var(--primaryColor, #409eff),
            0 0 24px rgba(64, 158, 255, 0.3);

          // 添加锐化滤镜确保清晰度
          filter: contrast(1.1) brightness(1.05);

          // 使用伪元素创建渐变效果而不影响文字清晰度
          &::before {
            content: attr(data-text);
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg,
              rgba(255, 255, 255, 0.8) 0%,
              rgba(255, 255, 255, 0.6) 30%,
              var(--primaryColor, #409eff) 70%,
              rgba(255, 255, 255, 0.7) 100%
            );
            -webkit-background-clip: text;
            background-clip: text;
            -webkit-text-fill-color: transparent;
            opacity: 0.25;
            z-index: -1;
            transition: opacity 0.3s ease;
            pointer-events: none;

            // 如果不支持background-clip，则隐藏
            @supports not (-webkit-background-clip: text) {
              display: none;
            }
          }

          // 添加额外的高对比度轮廓确保清晰度
          &::after {
            content: attr(data-text);
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            color: transparent;
            -webkit-text-stroke: 0.5px rgba(255, 255, 255, 0.3);
            z-index: -2;
            pointer-events: none;
          }

          // 悬停时增强效果
          &:hover {
            color: #ffffff;
            text-shadow:
              0 0 1px rgba(0, 0, 0, 0.9),
              0 1px 4px rgba(0, 0, 0, 0.7),
              0 0 12px rgba(255, 255, 255, 0.6),
              0 0 20px var(--primaryColor, #409eff),
              0 0 32px rgba(64, 158, 255, 0.4);

            filter: contrast(1.2) brightness(1.1);

            &::before {
              opacity: 0.5;
            }
          }
        }

        .brand-name {
          font-size: 18px;
          font-weight: 700;
          line-height: 1.1;
          letter-spacing: 0.8px;
          margin-bottom: 2px;

          // 高分辨率显示优化
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          text-rendering: optimizeLegibility;
        }

        .brand-subtitle {
          font-size: 12px;
          font-weight: 500;
          line-height: 1.2;
          letter-spacing: 2px;
          opacity: 0.95;

          // 高分辨率显示优化
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          text-rendering: optimizeLegibility;
        }
      }

            // 玻璃态光泽效果
      .glass-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(
          135deg,
          rgba(255, 255, 255, 0.15) 0%,
          rgba(255, 255, 255, 0.05) 50%,
          rgba(255, 255, 255, 0) 100%
        );
        z-index: 1;

        &::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 40%;
          height: 100%;
          background: linear-gradient(90deg,
            transparent,
            rgba(255, 255, 255, 0.3),
            transparent);
          animation: glassShimmer 3s ease-in-out infinite;
          animation-delay: 2s;
        }
      }

            // 浮动粒子效果
      .floating-particles {
        position: absolute;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 2;

        &::before, &::after {
          content: '';
          position: absolute;
          width: 3px;
          height: 3px;
          background: radial-gradient(circle, var(--el-color-primary), transparent);
          border-radius: 50%;
          animation: particleFloat 4s ease-in-out infinite;
        }

        &::before {
          top: 25%;
          left: 15%;
          animation-delay: 0s;
        }

        &::after {
          top: 60%;
          right: 20%;
          animation-delay: 2s;
        }
      }

            // 底部装饰线
      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 20px;
        right: 20px;
        height: 2px;
        background: linear-gradient(90deg,
          transparent,
          var(--el-color-primary),
          transparent);
        opacity: 0.6;
        animation: morphingGradient 4s ease-in-out infinite;
      }

      &:hover {
        background: rgba(255, 255, 255, 0.12);

        .logo-icon .dna-icon {
          animation-duration: 1s;
        }

        .brand-name {
          animation-duration: 1s;
        }
      }
    }

    .other-info-wrap {
      display: flex;
      align-items: center;
      justify-content: center;
      padding-right: 20px;

      .user-info {
        display: flex;
        align-items: center;
      }
    }
  }
  .layout-bottom {
    display: flex;
    width: 100%;
    height: @layoutBottomHeight;
    overflow: hidden;
    .layout-bottom-left {
      width: @menuWidth;
      min-width: @menuWidth;
      height: 100%;
      background: var(--menuBgGradient);
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
      position: relative;
      z-index: 1;
      overflow: hidden;
      transition: all 0.3s ease;

      &.menu-collapsed {
        width: 64px;
        min-width: 64px;
      }

      .menu-collapse-btn {
        position: absolute;
        bottom: 20px;
        left: 0;
        right: 0;
        margin: 0 auto;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.1);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        color: var(--menuTextColor);
        z-index: 10;
        transition: all 0.3s ease;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        backdrop-filter: blur(5px);

        &:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: scale(1.1);
        }

        .el-icon {
          font-size: 18px;
          transition: transform 0.3s;
        }
      }

      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(to bottom,
          rgba(255, 255, 255, 0.08) 0%,
          rgba(255, 255, 255, 0.05) 30%,
          rgba(0, 0, 0, 0.03) 70%,
          rgba(0, 0, 0, 0.08) 100%);
        z-index: -1;
        pointer-events: none;
      }

      &::after {
        content: '';
        position: absolute;
        top: 0;
        right: 0;
        width: 1px;
        height: 100%;
        background: linear-gradient(to bottom,
          rgba(255, 255, 255, 0.05) 0%,
          rgba(255, 255, 255, 0.1) 50%,
          rgba(255, 255, 255, 0.05) 100%);
        pointer-events: none;
      }

      .menu-wrap {
        width: 100%;
        height: 100%;
        overflow: hidden;
      }
    }
    .layout-bottom-right {
      display: flex;
      flex-direction: column;
      width: calc(100% - @menuWidth);
      min-width: calc(100% - @menuWidth);
      max-width: calc(100% - @menuWidth);
      height: 100%;
      flex: 1;
      overflow: hidden;
      transition: all 0.3s ease;

      &.expanded {
        width: calc(100% - 64px);
        min-width: calc(100% - 64px);
        max-width: calc(100% - 64px);
      }
      .content-wrap {
        position: relative;
        width: 100%;
        height: @layoutContentHeight;
        min-height: @layoutContentHeight;
        max-height: @layoutContentHeight;
        padding: 12px;
        flex: 1;
      }
    }
  }
}

// 路由过渡动画
.fade-transform-enter-active,
.fade-transform-leave-active {
  transition: all 0.1s;
}

.fade-transform-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}

.fade-transform-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

/* 添加路由组件包装器样式 */
.route-component-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
}
</style>
