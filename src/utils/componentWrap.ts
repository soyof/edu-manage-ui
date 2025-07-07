import { defineComponent, h, getCurrentInstance, onMounted, onUnmounted } from 'vue'

// 缓存已创建的包装组件
const pages = new Map<string, any>()

// 定义组件实例类型
interface ComponentInstance {
  activated?: () => void;
  deactivated?: () => void;
  [key: string]: any;
}

/**
 * 终极修复的组件包装器
 * @param component 原始组件
 * @param key 新的组件名称（路由路径）
 * @returns 包装后的组件
 */
export const componentWrap = (component: any, key: string) => {
  if (!component) return component

  // 返回缓存的组件（如果存在）
  if (pages.has(key)) {
    return pages.get(key)
  }

  // 不需要包装的情况（不包含查询参数）
  if (!key.includes('?')) {
    return component
  }

  const originalComponent = component.type || component

  // 创建修复后的包装组件
  const wrappedComponent = defineComponent({
    name: key,

    setup(props, { attrs, slots }) {
      const instance = getCurrentInstance()!
      let innerComponent: ComponentInstance | null = null

      // 核心修复：确保组件实例包含必要的上下文方法
      if (instance) {
        // 添加必要的上下文方法
        if (!instance.ctx) instance.ctx = {}

        // 激活方法
        instance.ctx.activate = () => {
          if (innerComponent?.activated) {
            innerComponent.activated()
          }
          // 触发 Vue 内部激活钩子
          if (instance.proxy?.$emit) {
            instance.proxy.$emit('hook:activated')
          }
        }

        // 停用方法
        instance.ctx.deactivate = () => {
          if (innerComponent?.deactivated) {
            innerComponent.deactivated()
          }
          // 触发 Vue 内部停用钩子
          if (instance.proxy?.$emit) {
            instance.proxy.$emit('hook:deactivated')
          }
        }
      }

      // 处理生命周期钩子
      onMounted(() => {
        if (innerComponent?.activated) {
          innerComponent.activated()
        }
      })

      onUnmounted(() => {
        if (innerComponent?.deactivated) {
          innerComponent.deactivated()
        }
      })

      return () => {
        return h(originalComponent, {
          ...attrs,
          ref: (el: ComponentInstance) => {
            innerComponent = el
            // 处理原始组件的 ref
            if (attrs.ref) {
              if (typeof attrs.ref === 'function') {
                attrs.ref(el)
              } else if (attrs.ref && 'value' in attrs.ref) {
                attrs.ref.value = el
              }
            }
          }
        }, slots)
      }
    }
  })

  // 添加内部标志
  Object.defineProperty(wrappedComponent, '__isKeepAlive', {
    value: true,
    enumerable: false,
    configurable: true
  })

  // 缓存并返回组件
  pages.set(key, wrappedComponent)
  return wrappedComponent
}

/**
 * 清除指定路径的组件缓存
 * @param key 需要清除缓存的路径
 */
export const clearComponentCache = (key: string) => {
  if (pages.has(key)) {
    pages.delete(key)
    return true
  }
  return false
}

/**
 * 清除所有组件缓存
 */
export const clearAllComponentCache = () => {
  pages.clear()
}
