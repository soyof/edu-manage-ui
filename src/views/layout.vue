<template>
  <!-- https://lin-xin.github.io/example/vue-manage-system/#/dashboard -->
  <div class="layout-wrap">
    <div class="layout-top">
      <div class="logo-wrap">
        <div class="logo-animation-container">
          <span class="logo-text">合成生物研究所</span>
          <div class="logo-particles"></div>
          <div class="logo-glow"></div>
        </div>
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
      <div class="layout-bottom-left">
        <div class="menu-wrap">
          <MenuInfo />
        </div>
      </div>
      <div class="layout-bottom-right">
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
import { computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { componentWrap, clearComponentCache } from '@/utils/componentWrap'

const route = useRoute()
const store = useTabsStore()
const { tabsList, refreshMap } = storeToRefs(store)

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
// 定义动画关键帧
@keyframes logoGlow {
  0% { opacity: 0.5; filter: blur(8px); }
  50% { opacity: 0.8; filter: blur(12px); }
  100% { opacity: 0.5; filter: blur(8px); }
}

@keyframes logoParticleFloat {
  0% { transform: translateY(0) translateX(0); opacity: 0; }
  50% { opacity: 0.8; }
  100% { transform: translateY(-15px) translateX(5px); opacity: 0; }
}

@keyframes logoTextPulse {
  0% { text-shadow: 0 0 8px rgba(255, 255, 255, 0.3); }
  50% { text-shadow: 0 0 15px rgba(255, 255, 255, 0.5); }
  100% { text-shadow: 0 0 8px rgba(255, 255, 255, 0.3); }
}

@keyframes logoBackgroundShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
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
      justify-content: center;
      width: 220px;
      height: 100%;
      font-size: 22px;
      font-weight: 600;
      color: var(--logoTextColor);
      background-color: rgba(0, 0, 0, 0.15);
      position: relative;
      overflow: hidden;
      transition: all 0.3s;

      .logo-animation-container {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        z-index: 1;
      }

      .logo-text {
        position: relative;
        z-index: 3;
        animation: logoTextPulse 3s ease-in-out infinite;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
        background-clip: text;
        -webkit-background-clip: text;
        transition: all 0.3s ease;

        &:hover {
          transform: scale(1.03);
        }
      }

      .logo-glow {
        position: absolute;
        width: 120px;
        height: 120px;
        border-radius: 50%;
        background: radial-gradient(
          circle,
          var(--primaryColor) 0%,
          rgba(255, 255, 255, 0) 70%
        );
        opacity: 0.5;
        filter: blur(8px);
        z-index: 1;
        animation: logoGlow 4s ease-in-out infinite;
      }

      .logo-particles {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 2;
        overflow: hidden;

        &::before, &::after {
          content: '';
          position: absolute;
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background-color: rgba(255, 255, 255, 0.6);
          box-shadow: 0 0 4px rgba(255, 255, 255, 0.8);
        }

        &::before {
          top: 70%;
          left: 30%;
          animation: logoParticleFloat 3s ease-in-out infinite;
        }

        &::after {
          top: 40%;
          left: 70%;
          width: 3px;
          height: 3px;
          animation: logoParticleFloat 2.5s ease-in-out infinite 0.5s;
        }
      }

      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg,
          rgba(255, 255, 255, 0.1) 0%,
          rgba(0, 0, 0, 0.1) 100%
        );
        background-size: 200% 200%;
        animation: logoBackgroundShift 8s ease infinite;
        opacity: 0.8;
        z-index: 0;
      }

      &::after {
        content: '';
        position: absolute;
        top: 0;
        right: 0;
        height: 100%;
        width: 1px;
        background: rgba(255, 255, 255, 0.15);
      }

      &:hover {
        .logo-glow {
          opacity: 0.7;
          filter: blur(10px);
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
  transition: all 0.2s;
}

.fade-transform-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.fade-transform-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

/* 添加路由组件包装器样式 */
.route-component-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
}
</style>
