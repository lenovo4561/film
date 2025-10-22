<template>
  <div class="offerwall-demo-container">
    <!-- 顶部标题 -->
    <div class="header">
      <div class="title">积分墙测试页面</div>
      <div class="subtitle">测试签名验证和API接口</div>
    </div>

    <!-- 测试按钮组 -->
    <div class="test-buttons">
      <button @click="testTemplate" class="test-btn">
        📋 测试获取模版数据
      </button>
      <button @click="testWelfareTasks" class="test-btn">
        🎁 测试获取福利任务
      </button>
      <button @click="testTaskList" class="test-btn">
        📝 测试获取任务列表
      </button>
    </div>

    <!-- 结果展示区 -->
    <div class="result-container">
      <div class="result-header">
        <span class="result-title">{{ resultTitle }}</span>
        <button v-if="resultData" @click="clearResult" class="clear-btn">清空</button>
      </div>

      <div v-if="loading" class="loading-box">
        <div class="loading-spinner"></div>
        <div>加载中...</div>
      </div>

      <div v-if="resultData" class="result-content">
        <pre>{{ JSON.stringify(resultData, null, 2) }}</pre>
      </div>

      <div v-if="errorMsg" class="error-box">
        <div class="error-icon">❌</div>
        <div class="error-text">{{ errorMsg }}</div>
      </div>
    </div>

    <!-- 签名信息展示 -->
    <div class="signature-info">
      <div class="info-title">🔐 签名配置信息</div>
      <div class="info-item">
        <span class="info-label">Channel:</span>
        <span class="info-value">CS001</span>
      </div>
      <div class="info-item">
        <span class="info-label">Secret Key:</span>
        <span class="info-value">804c73be...161d2512</span>
      </div>
      <div class="info-item">
        <span class="info-label">User ID:</span>
        <span class="info-value">{{ userId }}</span>
      </div>
      <div class="info-item">
        <span class="info-label">API地址:</span>
        <span class="info-value">/api/offerwall → http://localhost:3000</span>
      </div>
    </div>

    <!-- API列表 -->
    <div class="api-list">
      <div class="api-title">📡 可用接口列表</div>
      <div class="api-item">
        <div class="api-method get">GET</div>
        <div class="api-path">/api/offerwall/template</div>
        <div class="api-desc">获取积分墙模版数据</div>
      </div>
      <div class="api-item">
        <div class="api-method get">GET</div>
        <div class="api-path">/api/offerwall/welfare/tasks</div>
        <div class="api-desc">获取福利中心任务列表</div>
      </div>
      <div class="api-item">
        <div class="api-method get">GET</div>
        <div class="api-path">/api/offerwall/tasks</div>
        <div class="api-desc">获取积分墙任务列表</div>
      </div>
    </div>
  </div>
</template>

<script>
import { getOfferwallTemplate, getWelfareTasks, getOfferwallTasks } from '@/api/offerwall'
import { Toast } from 'mint-ui'

export default {
  name: 'OfferwallDemo',
  data() {
    return {
      loading: false,
      resultTitle: '等待测试...',
      resultData: null,
      errorMsg: '',
      userId: localStorage.getItem('userId') || '1'
    }
  },
  methods: {
    clearResult() {
      this.resultData = null
      this.errorMsg = ''
      this.resultTitle = '等待测试...'
    },

    async testTemplate() {
      this.clearResult()
      this.loading = true
      this.resultTitle = '获取积分墙模版数据'

      try {
        console.log('=== 测试获取模版数据 ===')
        const res = await getOfferwallTemplate()
        console.log('模版数据响应:', res)

        if (res.code === 200) {
          this.resultData = res.data
          Toast({
            message: '获取模版数据成功！',
            position: 'middle',
            duration: 2000,
            iconClass: 'mintui mintui-success'
          })
        } else {
          this.errorMsg = res.message || '获取失败'
        }
      } catch (error) {
        console.error('获取模版数据失败:', error)
        this.errorMsg = error.message || '请求失败'
        Toast({
          message: '获取模版数据失败',
          position: 'middle',
          duration: 2000
        })
      } finally {
        this.loading = false
      }
    },

    async testWelfareTasks() {
      this.clearResult()
      this.loading = true
      this.resultTitle = '获取福利中心任务列表'

      try {
        console.log('=== 测试获取福利任务 ===')
        const res = await getWelfareTasks({ page: 1, limit: 10 })
        console.log('福利任务响应:', res)

        if (res.code === 200) {
          this.resultData = res.data
          Toast({
            message: `获取成功！共 ${res.data.total} 个任务`,
            position: 'middle',
            duration: 2000,
            iconClass: 'mintui mintui-success'
          })
        } else {
          this.errorMsg = res.message || '获取失败'
        }
      } catch (error) {
        console.error('获取福利任务失败:', error)
        this.errorMsg = error.message || '请求失败'
        Toast({
          message: '获取福利任务失败',
          position: 'middle',
          duration: 2000
        })
      } finally {
        this.loading = false
      }
    },

    async testTaskList() {
      this.clearResult()
      this.loading = true
      this.resultTitle = '获取积分墙任务列表'

      try {
        console.log('=== 测试获取任务列表 ===')
        const res = await getOfferwallTasks()
        console.log('任务列表响应:', res)

        if (res.code === 200) {
          this.resultData = res.data
          Toast({
            message: `获取成功！共 ${res.data.length} 个任务`,
            position: 'middle',
            duration: 2000,
            iconClass: 'mintui mintui-success'
          })
        } else {
          this.errorMsg = res.message || '获取失败'
        }
      } catch (error) {
        console.error('获取任务列表失败:', error)
        this.errorMsg = error.message || '请求失败'
        Toast({
          message: '获取任务列表失败',
          position: 'middle',
          duration: 2000
        })
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.offerwall-demo-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20px;
  padding-bottom: 80px;
}

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 30px 20px;
  border-radius: 12px;
  text-align: center;
  margin-bottom: 20px;
}

.title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 8px;
}

.subtitle {
  font-size: 14px;
  opacity: 0.9;
}

.test-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.test-btn {
  background: white;
  border: none;
  padding: 16px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: bold;
  color: #333;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s;
}

.test-btn:active {
  transform: scale(0.98);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.result-container {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.result-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.clear-btn {
  background: #ff6b6b;
  color: white;
  border: none;
  padding: 6px 16px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
}

.loading-box {
  text-align: center;
  padding: 40px;
  color: #999;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  margin: 0 auto 15px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.result-content {
  max-height: 400px;
  overflow-y: auto;
  background: #f8f9fa;
  border-radius: 8px;
  padding: 15px;
}

.result-content pre {
  margin: 0;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  color: #333;
  white-space: pre-wrap;
  word-break: break-all;
}

.error-box {
  text-align: center;
  padding: 30px;
  color: #ff6b6b;
}

.error-icon {
  font-size: 48px;
  margin-bottom: 15px;
}

.error-text {
  font-size: 16px;
}

.signature-info {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.info-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-bottom: 15px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  font-weight: bold;
  color: #666;
}

.info-value {
  color: #333;
  font-family: 'Courier New', monospace;
  font-size: 13px;
}

.api-list {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.api-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-bottom: 15px;
}

.api-item {
  display: flex;
  align-items: center;
  padding: 12px;
  margin-bottom: 10px;
  background: #f8f9fa;
  border-radius: 8px;
  gap: 12px;
}

.api-method {
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
  color: white;
  flex-shrink: 0;
}

.api-method.get {
  background: #4caf50;
}

.api-method.post {
  background: #2196f3;
}

.api-path {
  font-family: 'Courier New', monospace;
  font-size: 13px;
  color: #333;
  font-weight: bold;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.api-desc {
  font-size: 13px;
  color: #666;
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .api-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .api-path {
    width: 100%;
  }
}
</style>
