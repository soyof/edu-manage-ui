import { defineStore } from 'pinia'
import { computed } from 'vue'
import services from '@/utils/services'

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
      return new Promise((resolve, reject) => {
        // 调用系统退出接口
        services.post('/api/logout').then(res => {
          // 退出成功后，清除本地用户信息和token
          this.token = ''
          this.userInfo = {}
          localStorage.removeItem('token')
          resolve(res)
        }).catch(error => {
          reject(error)
        })
      })
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
