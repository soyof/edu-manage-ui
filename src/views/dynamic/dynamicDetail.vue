<template>
  <div class="dynamic-detail-container">
    <div class="dynamic-detail-wrapper animate__animated animate__fadeIn">
      <div v-if="dynamicData" class="dynamic-content-wrapper">
        <!-- 动态标题和状态 - 修复标题过长挤压右侧问题 -->
        <div class="dynamic-header animate__animated animate__fadeInDown">
          <div class="header-title">
            <div class="title-container">
              <h1 class="title">{{ dynamicData.title }}</h1>
              <div class="title-line"></div>
            </div>
            <div class="title-right">
              <div class="type-tag">
                <span>{{ getDynamicTypeLabel(dynamicData.dynamicType) }}</span>
              </div>
              <el-tag
                size="small"
                :type="DynamicStatus.getTagType(dynamicData.publishStatus)"
                class="status-tag"
                :class="{'animate__animated animate__pulse': dynamicData.publishStatus === '1'}"
              >
                {{ DynamicStatus.getName(dynamicData.publishStatus) }}
              </el-tag>
            </div>
          </div>

          <!-- 元信息 - 改为新的三列布局 -->
          <div class="info-timeline animate__animated animate__fadeIn animate__delay-1s">
            <!-- 创建信息 -->
            <div class="info-column">
              <div class="info-column-header">
                <i class="el-icon-circle-plus-outline"></i>
                <span>创建信息</span>
              </div>
              <div class="info-column-content">
                <div class="info-time">
                  <i class="el-icon-date"></i>
                  <span>{{ dynamicData.createdTimes || '--' }}</span>
                </div>
                <div class="info-user">
                  <i class="el-icon-user"></i>
                  <span>{{ dynamicData.createUserName || '--' }}</span>
                </div>
              </div>
            </div>

            <!-- 如果有发布信息则显示 -->
            <div v-if="dynamicData.publishStatus === '1'" class="info-column">
              <div class="info-column-header">
                <i class="el-icon-upload2"></i>
                <span>发布信息</span>
              </div>
              <div class="info-column-content">
                <div class="info-time">
                  <i class="el-icon-date"></i>
                  <span>{{ dynamicData.publishTimes || '--' }}</span>
                </div>
                <div class="info-user">
                  <i class="el-icon-user"></i>
                  <span>{{ dynamicData.publishUserName || '--' }}</span>
                </div>
              </div>
            </div>

            <!-- 更新信息 -->
            <div class="info-column">
              <div class="info-column-header">
                <i class="el-icon-refresh"></i>
                <span>更新信息</span>
              </div>
              <div class="info-column-content">
                <div class="info-time">
                  <i class="el-icon-date"></i>
                  <span>{{ dynamicData.updatedTimes || '--' }}</span>
                </div>
                <div class="info-user">
                  <i class="el-icon-user"></i>
                  <span>{{ dynamicData.updateUserName || '--' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="dynamic-divider"></div>

        <!-- 内容区域 - 修改为新的标签样式 -->
        <div class="dynamic-body animate__animated animate__fadeInUp animate__delay">
          <div class="content-tabs">
            <div
              class="content-tab-item"
              :class="{ active: activeTab === 'zh' }"
              @click="activeTab = 'zh'"
            >
              中文内容
            </div>
            <div
              class="content-tab-item"
              :class="{ active: activeTab === 'en' }"
              @click="activeTab = 'en'"
            >
              英文内容
            </div>
          </div>

          <div class="content-wrapper">
            <!-- 中文内容 -->
            <div v-show="activeTab === 'zh'" class="tab-content">
              <div class="rich-text-content" v-html="dynamicData.content"></div>
            </div>

            <!-- 英文内容 -->
            <div v-show="activeTab === 'en'" class="tab-content">
              <div v-if="dynamicData.contentEn" class="rich-text-content" v-html="dynamicData.contentEn"></div>
              <el-empty v-else description="暂无英文内容" />
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="!loading" class="no-data animate__animated animate__fadeIn">
        <el-empty description="暂无动态内容" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import service from '@/utils/services'
import { ElMessage } from 'element-plus'
import { DynamicStatus } from '@/dic/statusConfig'
import { useDictionary } from '@/hooks/useDictionary'
import useLoading from '@/hooks/useLoading'
import 'animate.css'

// 路由相关
const route = useRoute()
const { loading, closeLoading, changeLoading } = useLoading()

// 标签页激活状态
const activeTab = ref('zh')

// 获取动态类型字典数据
const { getDictLabel: getDynamicTypeLabel } = useDictionary({
  dictType: 'dynamic_type',
  autoLoad: true
})

// 页面参数
const dynamicId = ref(route.query.id as string)

// 动态数据
const dynamicData = ref<any>(null)

// 获取动态详情数据
const getDynamicDetail = () => {
  if (!dynamicId.value) {
    ElMessage.error('缺少动态ID参数')
    return
  }

  changeLoading(true)
  service.post('/api/dynamic/detail', {
    id: dynamicId.value
  }).then(res => {
    dynamicData.value = res
  }).finally(() => {
    closeLoading()
  })
}

onMounted(() => {
  getDynamicDetail()
})
</script>

<style scoped lang="less">
.dynamic-detail-container {
  height: 100%;
  box-sizing: border-box;
  background: linear-gradient(135deg, #f5f7fa 0%, #eef2f5 100%);

  .dynamic-detail-wrapper {
    background-color: #fff;
    border-radius: 16px;
    padding: 16px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
    min-height: calc(100% - 40px);
    transition: all 0.3s ease;

    &:hover {
      box-shadow: 0 15px 35px rgba(0, 0, 0, 0.12);
    }
  }

  .dynamic-header {
    margin-bottom: 30px;

    .header-title {
      display: flex;
      flex-wrap: wrap;
      align-items: flex-start;
      justify-content: space-between;
      margin-bottom: 24px;
      row-gap: 16px;

      .title-container {
        position: relative;
        flex: 1;
        min-width: 0;
        max-width: calc(100% - 220px);
        margin-right: 20px;

        @media screen and (max-width: 768px) {
          max-width: 100%;
          margin-right: 0;
        }

        .title {
          margin: 0;
          padding: 0;
          font-size: 28px;
          font-weight: 700;
          color: #303133;
          letter-spacing: 0.5px;
          word-break: break-word;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .title-line {
          position: absolute;
          left: 0;
          bottom: -8px;
          height: 4px;
          width: 50px;
          background: linear-gradient(90deg, #409EFF, #a0cfff);
          border-radius: 2px;
        }
      }

      .title-right {
        display: flex;
        align-items: center;
        gap: 10px;
        flex-wrap: nowrap;
        flex-shrink: 0;
        min-width: 200px;

        @media screen and (max-width: 768px) {
          width: 100%;
          justify-content: flex-start;
        }

        .type-tag {
          padding: 0 12px;
          height: 28px;
          line-height: 28px;
          border-radius: 4px;
          background-color: #e6f7ff;
          color: #1890ff;
          font-size: 14px;
          font-weight: 500;
          white-space: nowrap;
          min-width: 80px;
          text-align: center;
        }

        .status-tag {
          height: 28px;
          line-height: 26px;
          font-weight: 600;
          border-radius: 14px;
          padding: 0 12px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          min-width: 64px;
          text-align: center;
        }
      }
    }

    // 信息时间线样式
    .info-timeline {
      display: flex;
      flex-wrap: wrap;
      gap: 20px;
      margin-top: 32px;

      .info-column {
        background: #f9fafc;
        border-radius: 10px;
        padding: 16px;
        flex: 1;
        min-width: 200px;
        transition: all 0.3s ease;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);

        &:hover {
          transform: translateY(-3px);
          box-shadow: 0 6px 12px rgba(0, 0, 0, 0.08);
        }

        .info-column-header {
          display: flex;
          align-items: center;
          margin-bottom: 12px;
          color: #606266;
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
          padding-bottom: 8px;

          i {
            font-size: 18px;
            margin-right: 8px;
            color: #409EFF;
          }

          span {
            font-weight: 600;
            font-size: 15px;
          }
        }

        .info-column-content {
          .info-time, .info-user {
            display: flex;
            align-items: center;
            margin-bottom: 8px;

            i {
              color: #909399;
              margin-right: 8px;
              font-size: 14px;
              width: 16px;
              text-align: center;
            }

            span {
              color: #303133;
              font-size: 14px;
              word-break: break-word;
            }
          }
        }
      }
    }
  }

  .dynamic-divider {
    height: 1px;
    background: linear-gradient(90deg, transparent, #e0e6ed, transparent);
    margin: 16px 0;
    position: relative;

    &:before {
      content: '';
      position: absolute;
      width: 50px;
      height: 5px;
      left: 50%;
      top: -2px;
      transform: translateX(-50%);
      background: #f5f7fa;
    }
  }

  .dynamic-body {
    // 新的内容标签样式
    .content-tabs {
      display: flex;
      border-bottom: 1px solid #e4e7ed;
      margin-bottom: 20px;

      .content-tab-item {
        padding: 0 20px 12px;
        font-size: 16px;
        color: #606266;
        cursor: pointer;
        position: relative;
        transition: all 0.3s;

        &:hover {
          color: #409EFF;
        }

        &.active {
          color: #409EFF;
          font-weight: 500;

          &:after {
            content: '';
            position: absolute;
            bottom: -1px;
            left: 0;
            width: 100%;
            height: 3px;
            background-color: #409EFF;
            border-radius: 3px 3px 0 0;
          }
        }
      }
    }

    .content-wrapper {
      background-color: #fff;
      border-radius: 8px;
      padding: 20px;
      min-height: 300px;
    }

    .tab-content {
      animation: fadeIn 0.5s ease-in-out;
    }
  }

  .no-data {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 400px;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
