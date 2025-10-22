<template>
  <div class="offerwall-container">
    <!-- 头部 -->
    <div class="header">
      <div class="title">任务中心</div>
      <div class="subtitle">完成任务赚取积分</div>

      <!-- 用户金币显示 -->
      <div class="coin-display">
        <div class="coin-icon">💰</div>
        <div class="coin-info">
          <div class="coin-label">你的金币</div>
          <div class="coin-amount">{{ userCoins }}</div>
        </div>
      </div>
    </div>

    <!-- 任务列表 -->
    <div class="task-list">
      <div
        v-for="task in taskList"
        :key="task.id"
        class="task-item"
        @click="goToTaskDetail(task)"
      >
        <div class="task-icon">
          <img v-if="task.icon" :src="server + task.icon" alt="任务图标">
          <div v-else class="default-icon">📋</div>
        </div>

        <div class="task-info">
          <div class="task-title">{{ task.title }}</div>
          <div class="task-desc">{{ task.description }}</div>
          <div class="task-type">
            <span class="type-tag">{{ task.taskType ? task.taskType.name : '普通任务' }}</span>
            <span v-if="task.isNewbie" class="newbie-tag">新手</span>
          </div>
        </div>

        <div class="task-reward">
          <div class="points">+{{ task.points }}</div>
          <div class="points-label">积分</div>
          <div v-if="task.isCompleted" class="completed-badge">已完成</div>
          <div v-else-if="task.userStatus === 'in_progress'" class="progress-badge">进行中</div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="taskList.length === 0 && !loading" class="empty-state">
      <div class="empty-icon">📭</div>
      <div class="empty-text">暂无可用任务</div>
    </div>

    <!-- 加载中 -->
    <div v-if="loading" class="loading">
      加载中...
    </div>
  </div>
</template>

<script>
import { getOfferwallTasks, getUserCoins } from '@/api/offerwall'
import { Indicator, Toast } from 'mint-ui'

export default {
  name: 'OfferwallTasks',
  data() {
    return {
      server: 'http://localhost:4000',
      taskList: [],
      loading: false,
      userCoins: 0 // 用户金币余额
    }
  },
  created() {
    this.loadUserCoins()
    this.loadTasks()
  },
  methods: {
    // 加载用户金币
    async loadUserCoins() {
      try {
        const res = await getUserCoins()
        console.log('用户金币:', res)

        if ((res.success_code === 200 || res.code === 200) && res.data) {
          this.userCoins = res.data.coin_balance || res.data.balance || 0
        }
      } catch (error) {
        console.error('加载用户金币失败:', error)
        // 不显示错误提示，保持用户体验
      }
    },
    // 加载任务列表
    async loadTasks() {
      this.loading = true
      Indicator.open('加载中...')

      try {
        const res = await getOfferwallTasks()
        console.log('任务列表:', res)

        if (res.code === 200) {
          this.taskList = res.data || []
        } else {
          Toast({
            message: res.message || '加载失败',
            position: 'middle',
            duration: 2000
          })
        }
      } catch (error) {
        console.error('加载任务列表失败:', error)
        Toast({
          message: '加载任务列表失败',
          position: 'middle',
          duration: 2000
        })
      } finally {
        this.loading = false
        Indicator.close()
      }
    },

    // 跳转任务详情
    goToTaskDetail(task) {
      this.$router.push({
        path: '/offerwall/task-detail',
        query: { id: task.id }
      })
    }
  }
}
</script>

<style scoped>
.offerwall-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 50px;
}

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 30px 20px 20px;
  text-align: center;
}

.title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 5px;
}

.subtitle {
  font-size: 14px;
  opacity: 0.9;
  margin-bottom: 15px;
}

/* 金币显示区域 */
.coin-display {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 15px 20px;
  margin: 15px auto 0;
  max-width: 300px;
  display: flex;
  align-items: center;
  gap: 15px;
}

.coin-icon {
  font-size: 48px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.coin-info {
  flex: 1;
  text-align: left;
}

.coin-label {
  font-size: 14px;
  opacity: 0.9;
  margin-bottom: 5px;
}

.coin-amount {
  font-size: 32px;
  font-weight: bold;
  letter-spacing: 1px;
}

.task-list {
  padding: 10px 15px;
}

.task-item {
  background: white;
  border-radius: 12px;
  padding: 15px;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}

.task-item:active {
  transform: scale(0.98);
}

.task-icon {
  width: 50px;
  height: 50px;
  border-radius: 10px;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  flex-shrink: 0;
}

.task-icon img {
  width: 100%;
  height: 100%;
  border-radius: 10px;
  object-fit: cover;
}

.default-icon {
  font-size: 24px;
}

.task-info {
  flex: 1;
  min-width: 0;
}

.task-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 5px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.task-desc {
  font-size: 13px;
  color: #666;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.task-type {
  display: flex;
  gap: 5px;
}

.type-tag {
  background: #e8f5e9;
  color: #4caf50;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
}

.newbie-tag {
  background: #fff3e0;
  color: #ff9800;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
}

.task-reward {
  text-align: center;
  flex-shrink: 0;
  margin-left: 10px;
}

.points {
  font-size: 20px;
  font-weight: bold;
  color: #ff6b6b;
}

.points-label {
  font-size: 12px;
  color: #999;
}

.completed-badge {
  background: #4caf50;
  color: white;
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 11px;
  margin-top: 5px;
}

.progress-badge {
  background: #2196f3;
  color: white;
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 11px;
  margin-top: 5px;
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
}

.empty-icon {
  font-size: 60px;
  margin-bottom: 20px;
}

.empty-text {
  font-size: 16px;
  color: #999;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #999;
}
</style>
