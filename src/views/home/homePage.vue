<template>
  <div class="home-container">
    <div class="welcome-section">
      <h1>欢迎来到合成生物研究所管理系统</h1>
      <p>组件缓存测试区域</p>
    </div>

    <el-card class="test-card">
      <template #header>
        <div class="card-header">
          <span>页面缓存测试</span>
          <el-button type="primary" @click="refreshCurrent">刷新当前页面</el-button>
        </div>
      </template>

      <div class="card-content">
        <p>页面加载时间: {{ loadTime }}</p>
        <p>缓存状态: {{ isCached ? '已缓存' : '未缓存' }}</p>
        <p>随机数据: {{ randomData }}</p>

        <el-input v-model="inputValue" placeholder="输入内容将被缓存" style="margin-top: 20px;" />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onActivated } from 'vue'
import { useTabsStore } from '@/stores/menuTabs'
import { useRoute } from 'vue-router'

const route = useRoute()
const store = useTabsStore()

// 测试数据
const loadTime = ref(new Date().toLocaleTimeString())
const randomData = ref(Math.floor(Math.random() * 1000))
const inputValue = ref('')
const isCached = ref(false)

// 刷新当前页面
const refreshCurrent = () => {
  store.refreshTab(route.fullPath)
}

// 组件挂载时的处理
onMounted(() => {
  loadTime.value = new Date().toLocaleTimeString()
  randomData.value = Math.floor(Math.random() * 1000)
  isCached.value = false
  console.log('组件被挂载', loadTime.value)
})

// 从缓存激活时的处理
onActivated(() => {
  isCached.value = true
  console.log('组件从缓存中激活', loadTime.value)
})
</script>

<style scoped lang="less">
.home-container {
  padding: 20px;

  .welcome-section {
    margin-bottom: 30px;
    text-align: center;

    h1 {
      font-size: 24px;
      color: var(--el-color-primary);
    }
  }

  .test-card {
    max-width: 800px;
    margin: 0 auto;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .card-content {
      p {
        margin: 10px 0;
      }
    }
  }
}
</style>
