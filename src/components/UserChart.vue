<template>
  <div class="chart">
    <div v-for="(value, index) in data" :key="index" class="bar-container">
      <div class="bar" :style="{ height: `${value}%` }"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
const data = [60, 40, 60, 70, 65, 45];
</script>

<style scoped lang="less">
.chart {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  height: 60px;
  padding: 0 8px;

  .bar-container {
    flex: 1;
    height: 100%;
    display: flex;
    align-items: flex-end;
    padding: 0 2px;

    .bar {
      width: 100%;
      background-color: #1890ff;
      border-radius: 2px;
      transition: height 0.3s ease;
    }
  }
}
</style> 
