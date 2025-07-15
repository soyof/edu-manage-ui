<template>
  <div class="login-container">
    <!-- 背景图案 - 生物科技风格 -->
    <div class="tech-background">
      <!-- 高科技粒子效果 -->
      <div class="particle-network">
        <div v-for="i in 40" :key="`particle-${i}`" class="particle"
          :style="{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            width: `${2 + Math.random() * 4}px`,
            height: `${2 + Math.random() * 4}px`,
            opacity: 0.2 + Math.random() * 0.5,
            animationDuration: `${10 + Math.random() * 20}s`,
            animationDelay: `${Math.random() * 5}s`
          }"
        ></div>
      </div>

      <!-- 分子结构网络 -->
      <div class="molecular-network">
        <div v-for="i in 6" :key="`molecule-${i}`" class="molecule"
          :style="{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            transform: `scale(${0.5 + Math.random() * 1})`
          }"
        >
          <div class="molecule-center"></div>
          <div v-for="j in 5" :key="`bond-${j}`" class="molecule-bond"
            :style="{ transform: `rotate(${j * 72}deg)` }"
          ></div>
        </div>
      </div>

      <!-- 六边形网格背景 -->
      <div class="hexagon-grid">
        <div v-for="i in 12" :key="`hex-row-${i}`" class="hex-row"
          :style="{ top: `${i * 8}%` }"
        >
          <div v-for="j in 12" :key="`hex-${i}-${j}`" class="hexagon"
            :style="{
              left: `${j * 8 - 4 * (i % 2)}%`,
              animationDelay: `${(i + j) * 0.2}s`,
              opacity: Math.random() > 0.7 ? 0.8 : 0.2
            }"
          ></div>
        </div>
      </div>

      <!-- DNA螺旋结构 -->
      <div class="dna-helix">
        <div class="dna-strand">
          <div v-for="i in 10" :key="`dna-rung-${i}`" class="dna-rung"
            :style="{ top: `${i * 10}%`, transform: `rotateY(${i * 36}deg)` }"
          >
            <div class="dna-base left"></div>
            <div class="dna-base right"></div>
          </div>
        </div>
      </div>

      <!-- 数字流 -->
      <div class="digital-stream">
        <div v-for="i in 8" :key="`stream-${i}`" class="stream-column"
          :style="{
            left: `${i * 12.5}%`,
            animationDuration: `${15 + Math.random() * 10}s`,
            opacity: 0.1 + Math.random() * 0.2
          }"
        >
          <div v-for="j in 20" :key="`digit-${i}-${j}`" class="stream-digit"
            :style="{
              animationDelay: `${j * 0.3}s`,
              opacity: Math.random() * 0.7
            }"
          >
            {{ Math.round(Math.random()) }}
          </div>
        </div>
      </div>
    </div>

    <!-- 全屏装饰性代码线条 -->
    <div class="tech-code-decoration">
      <div v-for="i in 20" :key="`code-${i}`" class="code-line"
        :style="{
          top: `${Math.random() * 100}%`,
          left: `${Math.random() * 100}%`,
          width: `${50 + Math.random() * 150}px`,
          opacity: 0.1 + Math.random() * 0.3,
          animationDuration: `${3 + Math.random() * 7}s`,
          animationDelay: `${Math.random() * 5}s`
        }"
      ></div>
    </div>

    <!-- 装饰性网格点 -->
    <div class="tech-dots">
      <div v-for="i in 30" :key="`dot-${i}`" class="tech-dot"
        :style="{
          top: `${Math.random() * 100}%`,
          left: `${Math.random() * 100}%`,
          animationDuration: `${3 + Math.random() * 5}s`,
          animationDelay: `${Math.random() * 3}s`
        }"
      ></div>
    </div>

    <div class="login-content">
      <!-- 左侧装饰区域 -->
      <div class="login-decoration">
        <!-- 科技图形装饰 -->
        <div class="tech-graphic">
          <div class="pulse-container">
            <div class="tech-circle c1"></div>
            <div class="tech-circle c2"></div>
            <div class="tech-circle c3"></div>
            <div class="tech-circle-dot"></div>
          </div>
          <div class="tech-grid"></div>
          <div class="tech-beams">
            <div v-for="i in 8" :key="i" class="tech-beam"
              :style="{transform: `rotate(${i * 45}deg)`}"
            ></div>
          </div>
        </div>

        <!-- 研究领域展示 -->
        <div class="research-areas">
          <div class="area-title">研究方向</div>
          <div class="areas-container">
            <div v-for="(area, index) in researchAreas" :key="index" class="area-item"
              :style="{ animationDelay: `${index * 0.2}s` }"
            >
              <div class="area-icon">
                <div class="icon-hexagon"></div>
                <div class="icon-circle"></div>
              </div>
              <div class="area-name">{{ area }}</div>
            </div>
          </div>

          <!-- 装饰性电路线，不会遮挡文字 -->
          <div class="circuit-decoration">
            <div v-for="i in 3" :key="i" class="circuit-line"></div>
            <div v-for="i in 4" :key="`node-${i}`" class="circuit-node"></div>
          </div>
        </div>

        <!-- 分离科技装饰，确保不会遮挡文字 -->
        <div class="bottom-decoration">
          <div class="tech-scan-line"></div>
          <div class="circuit-paths">
            <div v-for="i in 3" :key="i" class="circuit-path">
              <div class="circuit-node"></div>
            </div>
          </div>
        </div>
      </div>

      <div class="login-form-container">
        <!-- 登录表单部分保持不变 -->
        <div class="login-header">
          <h1 class="title">合成生物研究所</h1>
          <p class="subtitle">管理系统</p>
        </div>
        <el-form
          ref="loginFormRef"
          :model="loginForm"
          :rules="rules"
          class="login-form"
          @keyup.enter="submitForm"
        >
          <el-form-item prop="username">
            <el-input
              v-model="loginForm.username"
              placeholder="请输入用户名"
              :prefixIcon="User"
              size="large"
            />
          </el-form-item>
          <el-form-item prop="password">
            <el-input
              v-model="loginForm.password"
              :type="passwordIpsType"
              placeholder="请输入密码"
              :prefixIcon="Lock"
              size="large"
            >
              <template #suffix>
                <el-icon :class="['password-icon', passwordIpsType === 'password' ? '' : 'actives']" @click="handleShowPassword">
                  <View />
                </el-icon>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item prop="verifySuccess">
            <div class="slider-container">
              <div
                ref="sliderBgRef"
                class="slider-bg"
                :class="{ 'success': sliderState.success }"
              >
                <div class="slider-text">{{ sliderState.text }}</div>
                <div
                  ref="sliderBtnRef"
                  class="slider-button"
                  :style="{ left: sliderState.left + 'px' }"
                  @mousedown="handleSliderMouseDown"
                  @touchstart="handleSliderTouchStart"
                >
                  <el-icon v-if="!sliderState.success"><ArrowRight /></el-icon>
                  <el-icon v-else><Check /></el-icon>
                </div>
              </div>
            </div>
          </el-form-item>
          <el-form-item>
            <button
              class="cyber-button"
              :disabled="!sliderState.success || loading"
              @click.prevent="submitForm"
            >
              <span class="cyber-button__text">
                <template v-if="loading">
                  <span class="loading-dots">登录中<span>.</span><span>.</span><span>.</span></span>
                </template>
                <template v-else>登录</template>
              </span>
            </button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onBeforeUnmount, computed, onMounted, watch } from 'vue'
import { ElMessage, type FormInstance } from 'element-plus'
import { User, Lock, View, ArrowRight, Check } from '@element-plus/icons-vue'
import { useRouter, useRoute } from 'vue-router'
import services from '@/utils/services'
import { encodePwByMd5 } from '@/utils/pwdUtils'
import { useUserInfoStore } from '@/stores/userInfo'
import { useThemeStore } from '@/stores/theme'
import pinia from '@/stores'

const router = useRouter()
const route = useRoute()
const userStore = useUserInfoStore(pinia)
const themeStore = useThemeStore(pinia)

// 主题相关的计算属性
const primaryColor = computed(() => themeStore.themeConfig.primaryColor)
const primaryGradient = computed(() => themeStore.themeConfig.headerBgGradient)
const bgBaseColor = computed(() => themeStore.themeConfig.headerBgColor)

// 辅助函数，用于生成带透明度的颜色
const getColorWithOpacity = (color: string, opacity: number) => {
  // 将十六进制转为rgba
  const hex = color.replace('#', '')
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${opacity})`
}

// 更新CSS变量
const updateCssVariables = () => {
  const root = document.documentElement
  root.style.setProperty('--login-primary-color', primaryColor.value)
  root.style.setProperty('--login-bg-color', bgBaseColor.value)
  root.style.setProperty('--login-primary-gradient', primaryGradient.value)
  // 设置不同透明度的变量
  root.style.setProperty('--login-primary-10', getColorWithOpacity(primaryColor.value, 0.1))
  root.style.setProperty('--login-primary-20', getColorWithOpacity(primaryColor.value, 0.2))
  root.style.setProperty('--login-primary-30', getColorWithOpacity(primaryColor.value, 0.3))
  root.style.setProperty('--login-primary-40', getColorWithOpacity(primaryColor.value, 0.4))
  root.style.setProperty('--login-primary-50', getColorWithOpacity(primaryColor.value, 0.5))
  root.style.setProperty('--login-primary-70', getColorWithOpacity(primaryColor.value, 0.7))
  root.style.setProperty('--login-primary-80', getColorWithOpacity(primaryColor.value, 0.8))
  root.style.setProperty('--login-bg-40', getColorWithOpacity(bgBaseColor.value, 0.4))
  root.style.setProperty('--login-bg-70', getColorWithOpacity(bgBaseColor.value, 0.7))
}

// 监听主题变化
watch(() => themeStore.currentTheme, () => {
  updateCssVariables()
})

// 组件挂载时初始化CSS变量
onMounted(() => {
  themeStore.initTheme()
  updateCssVariables()
})

// 防抖函数
const debounce = <T extends (...args: any[]) => any>(fn: T, delay: number): ((...args: Parameters<T>) => void) => {
  let timer: number | null = null
  return function(this: any, ...args: Parameters<T>) {
    if (timer) {
      clearTimeout(timer)
    }
    timer = window.setTimeout(() => {
      fn.apply(this, args)
      timer = null
    }, delay)
  }
}

const loginFormRef = ref<FormInstance | null>(null)
const loginForm = reactive({
  username: '',
  password: '',
  verifySuccess: false
})
const loading = ref(false)
const passwordIpsType = ref('password')

// 研究方向列表
const researchAreas = [
  '合成基因组学',
  'CRISPR基因编辑',
  '蛋白质工程',
  '代谢工程',
  '生物传感器',
  '生物材料设计'
]

// 滑块验证相关
const sliderBgRef = ref<HTMLElement | null>(null)
const sliderBtnRef = ref<HTMLElement | null>(null)
const sliderState = reactive({
  isMoving: false,
  startX: 0,
  left: 0,
  success: false,
  text: '请向右滑动验证'
})

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ],
  verifySuccess: [
    {
      validator: (rule: any, value: any, callback: any) => {
        if (sliderState.success) {
          callback()
        } else {
          callback(new Error('请完成滑块验证'))
        }
      },
      trigger: 'change'
    }
  ]
}

const handleShowPassword = () => {
  passwordIpsType.value = passwordIpsType.value === 'password' ? 'text' : 'password'
}

// 滑块验证功能
const handleSliderMouseDown = (e: MouseEvent) => {
  // 检查用户名和密码是否已输入
  // if (!loginForm.username || !loginForm.password) {
  //   ElMessage.warning('请先输入用户名和密码')
  //   return
  // }
  if (sliderState.success) return
  sliderState.isMoving = true
  sliderState.startX = e.clientX
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)

  // 添加鼠标移出容器监听
  const sliderContainer = sliderBgRef.value?.parentElement
  if (sliderContainer) {
    sliderContainer.addEventListener('mouseleave', handleMouseLeave)
  }
}

// 鼠标移出滑块区域时的处理
const handleMouseLeave = () => {
  if (!sliderState.isMoving) return

  // 获取滑动条的最大宽度
  const sliderBg = sliderBgRef.value
  if (sliderBg) {
    const maxOffset = sliderBg.clientWidth - (sliderBtnRef.value?.offsetWidth || 40)

    // 如果滑块位置超过三分之一，自动完成验证
    if (sliderState.left >= maxOffset / 3) {
      sliderSuccess()
    } else if (!sliderState.success) {
      resetSlider()
    }
  }

  sliderState.isMoving = false
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)

  // 移除鼠标移出监听
  const sliderContainer = sliderBgRef.value?.parentElement
  if (sliderContainer) {
    sliderContainer.removeEventListener('mouseleave', handleMouseLeave)
  }
}

const handleSliderTouchStart = (e: TouchEvent) => {
  // 检查用户名和密码是否已输入
  if (!loginForm.username || !loginForm.password) {
    ElMessage.warning('请先输入用户名和密码')
    return
  }
  if (sliderState.success) return
  e.preventDefault()
  sliderState.isMoving = true
  sliderState.startX = e.touches[0].clientX
  document.addEventListener('touchmove', handleTouchMove)
  document.addEventListener('touchend', handleTouchEnd)
}

const handleMouseMove = (e: MouseEvent) => {
  if (!sliderState.isMoving) return
  const sliderBg = sliderBgRef.value
  if (!sliderBg) return

  const offsetX = e.clientX - sliderState.startX
  const maxOffset = sliderBg.clientWidth - (sliderBtnRef.value?.offsetWidth || 40)

  sliderState.left = Math.min(Math.max(0, sliderState.left + offsetX), maxOffset)
  sliderState.startX = e.clientX

  // 更新滑动轨迹宽度
  updateSliderTrack()

  // 成功条件
  if (sliderState.left >= maxOffset - 5) {
    sliderSuccess()
  }
}

const handleTouchMove = (e: TouchEvent) => {
  if (!sliderState.isMoving) return
  const sliderBg = sliderBgRef.value
  if (!sliderBg) return

  const offsetX = e.touches[0].clientX - sliderState.startX
  const maxOffset = sliderBg.clientWidth - (sliderBtnRef.value?.offsetWidth || 40)

  sliderState.left = Math.min(Math.max(0, sliderState.left + offsetX), maxOffset)
  sliderState.startX = e.touches[0].clientX

  // 更新滑动轨迹宽度
  updateSliderTrack()

  // 成功条件
  if (sliderState.left >= maxOffset - 5) {
    sliderSuccess()
  }
}

const handleMouseUp = () => {
  if (!sliderState.isMoving) return

  // 获取滑动条的最大宽度
  const sliderBg = sliderBgRef.value
  if (sliderBg) {
    const maxOffset = sliderBg.clientWidth - (sliderBtnRef.value?.offsetWidth || 40)

    // 如果滑块位置超过三分之一，自动完成验证
    if (sliderState.left >= maxOffset / 3) {
      sliderSuccess()
    } else if (!sliderState.success) {
      resetSlider()
    }
  } else if (!sliderState.success) {
    resetSlider()
  }

  sliderState.isMoving = false
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)

  // 移除鼠标移出监听
  const sliderContainer = sliderBgRef.value?.parentElement
  if (sliderContainer) {
    sliderContainer.removeEventListener('mouseleave', handleMouseLeave)
  }
}

const handleTouchEnd = () => {
  if (!sliderState.isMoving) return

  // 获取滑动条的最大宽度
  const sliderBg = sliderBgRef.value
  if (sliderBg) {
    const maxOffset = sliderBg.clientWidth - (sliderBtnRef.value?.offsetWidth || 40)

    // 如果滑块位置超过三分之一，自动完成验证
    if (sliderState.left >= maxOffset / 3) {
      sliderSuccess()
    } else if (!sliderState.success) {
      resetSlider()
    }
  } else if (!sliderState.success) {
    resetSlider()
  }

  sliderState.isMoving = false
  document.removeEventListener('touchmove', handleTouchMove)
  document.removeEventListener('touchend', handleTouchEnd)
}

const sliderSuccess = () => {
  sliderState.success = true
  sliderState.text = '验证成功'
  loginForm.verifySuccess = true
  // 获取滑动条的最大宽度，使滑块贴合右侧
  const sliderBg = sliderBgRef.value
  if (sliderBg) {
    // 计算滑块应该在的最右侧位置
    // 需要减去滑块的宽度，确保滑块完全在滑动区域内
    const buttonWidth = sliderBtnRef.value?.offsetWidth || 40
    const maxOffset = sliderBg.clientWidth - buttonWidth
    sliderState.left = maxOffset + 1 // 将滑块位置设置为最大偏移量
    // 确保滑动轨迹也是100%
    sliderBg.style.setProperty('--slider-track-width', `${sliderBg.clientWidth}px`)
  }
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
  document.removeEventListener('touchmove', handleTouchMove)
  document.removeEventListener('touchend', handleTouchEnd)
}

// 在滑块重置时也重置轨迹
const resetSlider = () => {
  sliderState.left = 0
  const sliderBg = sliderBgRef.value
  if (sliderBg) {
    sliderBg.style.setProperty('--slider-track-width', '0px')
  }
}

// 清理事件监听
onBeforeUnmount(() => {
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
  document.removeEventListener('touchmove', handleTouchMove)
  document.removeEventListener('touchend', handleTouchEnd)

  // 确保移除鼠标移出监听
  const sliderContainer = sliderBgRef.value?.parentElement
  if (sliderContainer) {
    sliderContainer.removeEventListener('mouseleave', handleMouseLeave)
  }
})

// 更新滑动轨迹宽度
const updateSliderTrack = () => {
  const sliderBg = sliderBgRef.value
  if (!sliderBg) return

  // 获取滑块宽度
  const buttonWidth = sliderBtnRef.value?.offsetWidth || 40
  // 设置轨迹宽度为滑块位置加上滑块一半宽度
  const trackWidth = sliderState.left + buttonWidth / 2

  // 使用样式设置轨迹宽度
  sliderBg.style.setProperty('--slider-track-width', `${trackWidth}px`)
}

// 原始表单提交方法
const _submitForm = () => {
  if (!loginFormRef.value) return

  // 验证滑块
  if (!sliderState.success) {
    ElMessage.warning('请完成滑块验证')
    return
  }

  // 防止重复提交
  if (loading.value) return

  loginFormRef.value.validate((valid: boolean) => {
    if (valid) {
      loading.value = true
      const params = {
        user_id: loginForm.username,
        password: encodePwByMd5(loginForm.password)
      }
      services.post('/api/login', params).then((res: any) => {
        if (res) {
          // 保存token到store和localStorage
          userStore.updateToken(res.token)
          userStore.updateUserInfo(res.userInfos)
          ElMessage.success('登录成功')
          // 如果存在redirect参数，则跳转到该页面，否则跳转到首页
          const redirectUrl = route.query.redirect as string
          router.push(redirectUrl || '/')
        } else {
          ElMessage.error('登录失败，返回数据格式不正确')
        }
      }).finally(() => {
        loading.value = false
      })
    } else {
      ElMessage.error('请检查输入信息')
    }
  })
}

// 添加防抖处理的表单提交方法
const submitForm = debounce(_submitForm, 500)
</script>

<style lang="less" scoped>
@import url('@/styles/loginPage.less');
</style>
