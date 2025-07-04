<template>
  <!-- https://lin-xin.github.io/example/vue-manage-system/#/dashboard -->
  <div class="layout-wrap">
    <div class="layout-top">
      <div class="logo-wrap">合成生物研究所</div>
      <div class="other-info-wrap">
        <!-- 主题切换图标按钮 -->
        <div class="theme-switch">
          <el-dropdown trigger="click" @command="handleThemeChange">
            <div class="theme-icon">
              <el-icon :size="18">
                <component :is="themeIcon" />
              </el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item :class="{ 'is-active': currentTheme === 'dark' }" command="dark">
                  <el-icon><MoonNight /></el-icon>暗黑风格
                </el-dropdown-item>
                <el-dropdown-item :class="{ 'is-active': currentTheme === 'blue' }" command="blue">
                  <el-icon><Sunny /></el-icon>天蓝风格
                </el-dropdown-item>
                <el-dropdown-item :class="{ 'is-active': currentTheme === 'green' }" command="green">
                  <el-icon><Opportunity /></el-icon>绿色风格
                </el-dropdown-item>
                <el-dropdown-item :class="{ 'is-active': currentTheme === 'purple' }" command="purple">
                  <el-icon><Star /></el-icon>紫色风格
                </el-dropdown-item>
                <el-dropdown-item :class="{ 'is-active': currentTheme === 'orange' }" command="orange">
                  <el-icon><Orange /></el-icon>橙色风格
                </el-dropdown-item>
                <el-dropdown-item :class="{ 'is-active': currentTheme === 'red' }" command="red">
                  <el-icon><Cherry /></el-icon>红色风格
                </el-dropdown-item>
                <el-dropdown-item :class="{ 'is-active': currentTheme === 'pink' }" command="pink">
                  <el-icon><Female /></el-icon>粉色风格
                </el-dropdown-item>
                <el-dropdown-item :class="{ 'is-active': currentTheme === 'teal' }" command="teal">
                  <el-icon><Ship /></el-icon>海蓝风格
                </el-dropdown-item>
                <el-dropdown-item :class="{ 'is-active': currentTheme === 'light' }" command="light">
                  <el-icon><Monitor /></el-icon>浅色风格
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
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
              <div :key="getComponentKey(routeProps.fullPath)" class="route-component-wrapper">
                <keep-alive :include="cachedViews">
                  <component :is="Component" />
                </keep-alive>
              </div>
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
import { useRoute, useRouter } from 'vue-router'
import { useTabsStore } from '@/stores/menuTabs'
import { useThemeStore } from '@/stores/theme'
import { computed, watch, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { MoonNight, Sunny, Monitor, Brush, Opportunity, Star, Orange, Cherry, Female, Ship } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import type { ThemeType } from '@/stores/theme'

const route = useRoute()
const router = useRouter()
const store = useTabsStore()
const themeStore = useThemeStore()
const { tabsList, refreshMap } = storeToRefs(store)

// 获取当前主题
const currentTheme = computed(() => themeStore.currentTheme)

// 根据当前主题返回对应的图标
const themeIcon = computed(() => {
  switch (currentTheme.value) {
    case 'dark':
      return MoonNight
    case 'blue':
      return Sunny
    case 'green':
      return Opportunity
    case 'purple':
      return Star
    case 'orange':
      return Orange
    case 'red':
      return Cherry
    case 'pink':
      return Female
    case 'teal':
      return Ship
    case 'light':
      return Monitor
    default:
      return Brush
  }
})

// 处理主题切换
const handleThemeChange = (theme: ThemeType) => {
  themeStore.changeTheme(theme)
  ElMessage.success(`已切换到${theme === 'dark' ? '暗黑' : theme === 'blue' ? '天蓝' : theme === 'green' ? '绿色' : theme === 'purple' ? '紫色' : theme === 'orange' ? '橙色' : theme === 'red' ? '红色' : theme === 'pink' ? '粉色' : theme === 'teal' ? '海蓝' : '浅色'}风格`)
}

// 需要缓存的组件名称列表
const cachedViews = computed(() => {
  // 从tabsList中获取所有需要缓存的组件名称
  return tabsList.value
    .filter(tab => tab.name) // 过滤掉没有name的路由
    .map(tab => tab.name as string) // 提取name属性作为组件名
})

// 获取组件的key，用于强制刷新组件
const getComponentKey = (path: string) => {
  // 如果路径在refreshMap中存在，返回路径+时间戳作为key
  return refreshMap.value[path] ? `${path}_${refreshMap.value[path]}` : path
}

// 监听路由变化，处理缓存
watch(() => route.fullPath, () => {
  // 确保当前路由已添加到tabsList中
  if (route.name && !cachedViews.value.includes(route.name as string)) {
    // 如果当前路由不在缓存列表中，尝试添加到tabs中
    const currentTab = {
      path: route.path,
      fullPath: route.fullPath,
      name: route.name as string,
      query: route.query,
      params: route.params,
      meta: {
        title: route.meta.title as string,
        tabClosable: route.meta.tabClosable !== false
      }
    }
    store.addTabList(currentTab)
  }
}, { immediate: true })
</script>

<style lang="less" scoped>
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
    background: var(--headerBgColor);
    box-sizing: border-box;
    box-shadow: v-bind('currentTheme === "light" ? "0 1px 4px rgba(0, 0, 0, 0.1)" : "0 1px 4px rgba(0, 0, 0, 0.2)"');
    z-index: 1;

    .logo-wrap {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 220px;
      height: 100%;
      font-size: 24px;
      font-weight: 600;
      color: var(--logoTextColor);
      background-color: v-bind('currentTheme === "light" ? "rgba(0, 0, 0, 0.02)" : "rgba(0, 0, 0, 0.15)"');
      position: relative;
      overflow: hidden;
      transition: all 0.3s;

      &::after {
        content: '';
        position: absolute;
        top: 0;
        right: 0;
        height: 100%;
        width: 1px;
        background: v-bind('currentTheme === "light" ? "rgba(0, 0, 0, 0.05)" : "rgba(255, 255, 255, 0.1)"');
      }
    }

    .other-info-wrap {
      display: flex;
      align-items: center;
      justify-content: center;
      padding-right: 20px;

      .theme-switch {
        margin-right: 16px;

        .theme-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background-color: v-bind('currentTheme === "light" ? "rgba(0, 0, 0, 0.1)" : "rgba(255, 255, 255, 0.08)"');
          color: v-bind('currentTheme === "light" ? "rgba(0, 0, 0, 0.85)" : "rgba(255, 255, 255, 0.9)"');
          cursor: pointer;
          transition: all 0.3s;

          &:hover {
            background-color: v-bind('currentTheme === "light" ? "rgba(0, 0, 0, 0.15)" : "rgba(255, 255, 255, 0.12)"');
          }
        }
      }

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
      background: v-bind('themeStore.themeConfig.menuBgGradient || themeStore.themeConfig.menuBgColor');
      box-shadow: v-bind('currentTheme === "light" ? "0 1px 4px rgba(0, 0, 0, 0.05)" : "0 1px 4px rgba(0, 0, 0, 0.2)"');
      position: relative;
      z-index: 1;
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
  transition: all 0.5s;
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

:deep(.el-dropdown-menu__item.is-active) {
  color: var(--el-color-primary);
  background-color: rgba(64, 158, 255, 0.1);
}
</style>
