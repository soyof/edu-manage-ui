import { defineStore } from 'pinia'
import { computed } from 'vue'
import services from '@/utils/services'
import { useTabsStore } from '@/stores/menuTabs'
import { useDictStore } from '@/stores/dict'

export interface UserInfoState {
  userInfo: any,
  token: string
}

export const useUserInfoStore = defineStore('userInfo', {
  state: (): UserInfoState => {
    return {
      userInfo: {},
      token: ''
    }
  },
  getters: {
    getUserInfo: (state) => {
      return computed(() => state.userInfo)
    },
    getToken: (state) => {
      return computed(() => state.token || localStorage.getItem('token'))
    },
    isAdmin: (state) => {
      return computed(() => {
        const userInfo = state.userInfo
        return userInfo?.role === 'admin' || userInfo?.role === '管理员'
      })
    }
  },
  actions: {
    updateUserInfo(userInfo: any) {
      this.userInfo = userInfo
    },
    updateToken(token: string) {
      this.token = token
      localStorage.setItem('token', token)
    },
    removeToken() {
      this.token = ''
      localStorage.removeItem('token')
    },
    updateAvatar(avatar: string) {
      this.userInfo.avatar = avatar
    },
    // 更新用户其他信息
    updateUserOtherInfo(otherInfo: any) {
      this.userInfo.otherInfo = otherInfo
    },
    // 获取用户信息
    async getUserInfoAction() {
      try {
        const res: any = await services.get('/api/getCurrentUser')
        if (res) {
          this.updateUserInfo(res)
          return res
        }
        return null
      } catch (error) {
        console.error('获取用户信息失败', error)
        throw error
      }
    },
    // 退出登录
    logout() {
      // 取消所有正在进行的请求
      try {
        services.cancelAllRequests()
      } catch (e) {
        console.log('取消请求失败', e)
        // 取消请求失败不影响后续操作
      }

      return new Promise((resolve) => {
        try {
          // 调用系统退出接口
          services.post('/api/logout').then(res => {
            // 清除用户数据
            this.clearUserData()
            resolve(res)
          }).catch(error => {
            // 即使接口失败也清理本地状态
            this.clearUserData()
            resolve(error)
          })
        } catch (e) {
          // 处理任何意外错误
          this.clearUserData()
          resolve(e)
        }
      })
    },

    // 清除用户数据的方法
    clearUserData() {
      // 清除用户信息
      this.token = ''
      this.userInfo = {}
      localStorage.removeItem('token')

      // 清除页签信息
      const tabsStore = useTabsStore()
      tabsStore.clearAllTabs() // 完全清除所有页签数据和本地存储

      // 清除字典信息
      const dictStore = useDictStore()
      dictStore.clearAllDictCache() // 清除所有字典缓存
    }
  },
  persist: {
    storage: localStorage,
    key: 'userInfo',
    serializer: {
      serialize: (value) => JSON.stringify(value),
      deserialize: (value) => JSON.parse(value)
    }
  }
})
