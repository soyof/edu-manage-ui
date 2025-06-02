<template>
  <!-- https://lin-xin.github.io/example/vue-manage-system/#/dashboard -->
  <div class="layout-wrap">
    <div class="layout-top">
      <div class="logo-wrap">合成生物研究所</div>
      <div class="other-info-wrap">
        <div class="user-info">
          <span class="user-name">张三</span>
          <span class="user-role">管理员</span>
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
          <router-view />
        </el-scrollbar>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import MenuInfo from '@/components/menuInfo.vue'
import MenuTabs from '@/components/menuTabs.vue'
</script>

<style lang="less" scoped>
.layout-wrap {
  width: 100vw;
  height: 100vh;
  background-color: @bgColor;
  overflow: hidden;
  .layout-top {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    height: @layoutTopHeight;
    background: linear-gradient(to right, @menuBgColor, @menuBgColorS);
    box-sizing: border-box;
    z-index: 1;

    .logo-wrap {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 220px;
      height: 100%;
      font-size: 28px;
      font-weight: 600;
      color: @logoTextColor;
      text-shadow: 1px 0 #fff, 1px 1px #fff, 1px -1px #fff, 0 1px #fff, 0 -1px #fff, -1px 0 #fff, -1px 1px #fff, -1px -1px #fff;
    }

    .other-info-wrap {
      display: flex;
      align-items: center;
      justify-content: center;
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
      background: linear-gradient(to right, @menuBgColor, @menuBgColorS);
      .menu-wrap {
        width: 100%;
        height: 100%;
        overflow: hidden;
      }
    }
    .layout-bottom-right {
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100%;
      flex: 1;
      .content-wrap {
        flex: 1;
      }
    }
  }
}
</style>
