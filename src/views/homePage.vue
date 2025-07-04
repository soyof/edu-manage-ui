<template>
  <div class="home-container">
    <!-- Welcome Message -->
    <div class="welcome-message">
      <img src="../assets/logo.png" class="logo" alt="Logo">
      <div class="message">
        <h2>晚上好 admin，愿您天黑有灯，下雨有伞。</h2>
        <p class="sub-message">
          🚀 Vue Shop Vite最新完整版本，3小主题，无数体验已完成，赠送绝大多数使用场景，大幅提升开发效率。
        </p>
      </div>
    </div>

    <!-- Stats Grid -->
    <div class="stats-grid">
      <!-- Total Sales Card -->
      <div class="stat-card sales">
        <div class="stat-content">
          <h3>总销量</h3>
          <div class="amount">¥ 17,998.00</div>
          <div class="trend">
            <span class="label">月上周以来</span>
            <span class="value increase">↑ 10%</span>
          </div>
        </div>
      </div>

      <!-- Active Users Card -->
      <div class="stat-card users">
        <div class="stat-content">
          <h3>活跃用户</h3>
          <div class="amount">14,375</div>
          <div class="trend">
            <span class="label">月上周以来</span>
            <span class="value increase">↑ 30%</span>
          </div>
        </div>
        <div class="chart-container">
          <UserChart />
        </div>
      </div>

      <!-- Total Orders Card -->
      <div class="stat-card orders">
        <div class="stat-content">
          <h3>总成交</h3>
          <div class="amount">5,998</div>
          <div class="trend">
            <span class="label">月上周以来</span>
            <span class="value increase">↑ 44%</span>
          </div>
        </div>
      </div>

      <!-- Orders Card -->
      <div class="stat-card total-orders">
        <div class="stat-content">
          <h3>订单</h3>
          <div class="amount">4,986</div>
          <div class="trend">
            <span class="label">月上周以来</span>
            <span class="value increase">↑ 10%</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Order Status Section -->
    <div class="order-status-section">
      <div class="status-card warning">
        <div class="status-icon">⚠️</div>
        <div class="status-content">
          <h4>订单预警</h4>
          <p>产品缺货，请及时处理</p>
        </div>
      </div>
      <div class="status-card info">
        <div class="status-icon">ℹ️</div>
        <div class="status-content">
          <h4>待后上单</h4>
          <p>订单号：1234568965421</p>
        </div>
      </div>
    </div>

    <!-- Version Info Section -->
    <div class="version-info">
      <h3>信息</h3>
      <div class="version-grid">
        <div class="version-item">
          <span class="name">vite</span>
          <span class="version">^6.3.3</span>
        </div>
        <div class="version-item">
          <span class="name">typescript</span>
          <span class="version">^5.8.3</span>
        </div>
        <div class="version-item">
          <span class="name">vue</span>
          <span class="version">^3.5.13</span>
        </div>
        <div class="version-item">
          <span class="name">pinia</span>
          <span class="version">^3.0.2</span>
        </div>
      </div>
      <div class="action-buttons">
        <button class="btn-shop">shop-vite ¥1899</button>
        <button class="btn-admin">admin-plus ¥799</button>
      </div>
    </div>

    <!-- Management Links -->
    <div class="management-section">
      <h3>经营建议</h3>
      <div class="management-grid">
        <div class="management-card">
          <div class="icon">🏛️</div>
          <div class="content">
            <h4>工商建议</h4>
            <p>工商建议咨询入口</p>
          </div>
        </div>
        <div class="management-card">
          <div class="icon">©️</div>
          <div class="content">
            <h4>商标管理</h4>
            <p>商标管理咨询入口</p>
          </div>
        </div>
        <div class="management-card">
          <div class="icon">📋</div>
          <div class="content">
            <h4>专利查询</h4>
            <p>专利查询咨询入口</p>
          </div>
        </div>
        <div class="management-card">
          <div class="icon">📝</div>
          <div class="content">
            <h4>著作权查询</h4>
            <p>著作权查询咨询入口</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import UserChart from '../components/UserChart.vue'
</script>

<style scoped lang="less">
.home-container {
  padding: 24px;
  background-color: #f5f7fa;

  .welcome-message {
    display: flex;
    align-items: center;
    background: #fff;
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 24px;

    .logo {
      width: 48px;
      height: 48px;
      margin-right: 16px;
    }

    .message {
      h2 {
        margin: 0;
        font-size: 20px;
        color: #1a1a1a;
      }

      .sub-message {
        margin: 8px 0 0;
        color: #666;
      }
    }
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 24px;
    margin-bottom: 24px;

    .stat-card {
      background: #fff;
      padding: 24px;
      border-radius: 8px;

      .amount {
        font-size: 24px;
        font-weight: bold;
        margin: 16px 0;
      }

      .trend {
        display: flex;
        align-items: center;
        justify-content: space-between;
        color: #666;

        .increase {
          color: #52c41a;
        }
      }
    }
  }

  .order-status-section {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 24px;
    margin-bottom: 24px;

    .status-card {
      display: flex;
      align-items: center;
      background: #fff;
      padding: 20px;
      border-radius: 8px;

      &.warning {
        border-left: 4px solid #faad14;
      }

      &.info {
        border-left: 4px solid #1890ff;
      }

      .status-icon {
        font-size: 24px;
        margin-right: 16px;
      }

      .status-content {
        h4 {
          margin: 0;
          font-size: 16px;
        }

        p {
          margin: 4px 0 0;
          color: #666;
        }
      }
    }
  }

  .version-info {
    background: #fff;
    padding: 24px;
    border-radius: 8px;
    margin-bottom: 24px;

    .version-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      margin: 16px 0;

      .version-item {
        display: flex;
        justify-content: space-between;
        padding: 8px;
        background: #f5f7fa;
        border-radius: 4px;
      }
    }

    .action-buttons {
      display: flex;
      gap: 16px;
      margin-top: 16px;

      button {
        padding: 8px 16px;
        border-radius: 4px;
        border: none;
        cursor: pointer;

        &.btn-shop {
          background: #1890ff;
          color: white;
        }

        &.btn-admin {
          background: #faad14;
          color: white;
        }
      }
    }
  }

  .management-section {
    background: #fff;
    padding: 24px;
    border-radius: 8px;

    .management-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 24px;
      margin-top: 16px;

      .management-card {
        display: flex;
        align-items: center;
        padding: 16px;
        border: 1px solid #e8e8e8;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s;

        &:hover {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.09);
        }

        .icon {
          font-size: 24px;
          margin-right: 12px;
        }

        .content {
          h4 {
            margin: 0;
            font-size: 16px;
          }

          p {
            margin: 4px 0 0;
            color: #666;
            font-size: 14px;
          }
        }
      }
    }
  }
}
</style>
