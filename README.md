# 教育管理系统前端

这是一个基于 Vue 3 + TypeScript + Vite 开发的教育管理系统前端项目。

## 路由缓存机制

本项目实现了基于路由名称的组件缓存机制，解决了以下几个问题：

1. 同一组件不同参数导致的缓存问题
2. 标签页切换时保持状态
3. 支持按需刷新组件

### 实现原理

1. **动态缓存控制**：

   - 使用 Vue 的内置 keep-alive 组件的 include 属性控制缓存
   - 通过动态计算 cachedViews 列表来决定哪些组件需要被缓存
   - 当需要刷新组件时，从缓存列表中排除该组件

2. **动态组件 key**：

   - 使用路由名称和路径的组合作为组件 key
   - 当需要刷新时，在 key 中添加时间戳强制组件重新渲染

3. **刷新机制**：
   - 通过 Pinia store 中的 refreshMap 记录需要刷新的组件
   - 提供 refreshTab 方法支持按需刷新指定路径的组件

### 使用方法

**缓存组件**：
组件默认会被缓存，无需额外配置。

**刷新组件**：

```js
// 在组件内刷新当前组件
import { useTabsStore } from '@/stores/menuTabs'
import { useRoute } from 'vue-router'

const route = useRoute()
const store = useTabsStore()

// 刷新当前页面
const refreshCurrent = () => {
  store.refreshTab(route.fullPath)
}
```

**右键菜单刷新**：
右键点击标签页，选择"刷新当前"选项可刷新对应组件。

## 启动项目

```bash
# 安装依赖
npm install

# 开发环境启动
npm run dev

# 构建生产环境
npm run build
```

## 技术栈

- Vue 3
- TypeScript
- Vite
- Element Plus
- Pinia
- Vue Router
