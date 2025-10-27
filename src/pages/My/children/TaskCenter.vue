<template>
  <div id="task-center">
    <!-- 顶部导航 -->
    <div class="header">
      <span class="icon-back" @click="$router.back()"></span>
      <span class="title">任务中心</span>
    </div>

    <!-- 金币余额 -->
    <div class="coin-balance">
      <div class="balance-card">
        <div class="coin-icon">💰</div>
        <div class="balance-info">
          <div class="label">你的金币</div>
          <div class="amount">{{ userCoins }}</div>
        </div>
      </div>
    </div>

    <!-- 签到领奖励 -->
    <div class="sign-in-section">
      <div class="section-title">
        <span class="icon">🎁</span>
        <span>签到领奖励</span>
      </div>
      <div class="sign-in-card">
        <div class="sign-days">
          <div
            v-for="day in 7"
            :key="day"
            :class="['day-item', { active: day === 1, completed: day < 1 }]"
          >
            <div class="reward">+{{ day === 1 ? 20 : day * 10 }}</div>
            <div class="coin-icon-small">🪙</div>
            <div class="day-label">{{ day === 1 ? "今日" : `第${day}天` }}</div>
          </div>
        </div>
        <div class="sign-button" @click="handleSignIn">
          <span>签到 + 20 奖励币</span>
        </div>
      </div>
    </div>

    <!-- 积分墙场景（如果有模版数据） -->
    <div
      class="offerwall-section"
      v-if="offerwallTemplate && offerwallTemplate.scenes"
    >
      <!-- <div class="section-header">
        <div class="section-title">
          <span class="label">{{offerwallTemplate.config.title || '积分墙'}}</span>
        </div>
        <div class="section-subtitle">{{offerwallTemplate.config.subtitle || '完成任务赚取积分'}}</div>
      </div> -->

      <!-- 场景列表 -->
      <div class="scene-list" v-if="offerwallTemplate.scenes.length > 0">
        <!-- <div
          v-for="scene in offerwallTemplate.scenes"
          :key="scene.id"
          class="scene-item"
          @click="handleScene(scene)"
        >
          <div class="scene-icon">{{scene.icon || '🎯'}}</div>
          <div class="scene-info">
            <div class="scene-name">{{scene.name}}</div>
            <div class="scene-desc">{{scene.description}}</div>
          </div>
          <div class="scene-arrow">→</div>
        </div> -->
      </div>
    </div>

    <!-- 福利中心任务 (taskTypeId = 1) -->
    <div class="task-section">
      <div class="section-header">
        <div class="section-title">
          <span class="label">🎁 福利中心</span>
        </div>
        <div class="section-subtitle">完成任务领取丰厚奖励</div>
      </div>

      <!-- 任务列表 -->
      <div v-if="welfareTasks && welfareTasks.length > 0" class="task-list">
        <div
          v-for="task in welfareTasks"
          :key="'welfare-' + task.id"
          :class="['task-item', { completed: task.completed }]"
        >
          <div class="task-icon">{{ task.icon }}</div>
          <div class="task-info">
            <div class="task-title">{{ task.title }}</div>
            <div class="task-reward">+{{ task.reward }} 🪙</div>
            <div v-if="task.description" class="task-desc">
              {{ task.description }}
            </div>
          </div>
          <div class="task-action">
            <button
              :class="['action-btn', { completed: task.completed }]"
              @click.stop="handleTaskClick(task)"
            >
              {{ task.completed ? "已完成" : "去完成" }}
            </button>
          </div>
        </div>
      </div>

      <!-- 空状态提示 -->
      <div v-else class="empty-state">
        <div class="empty-image">
          <img src="@/assets/images/empty-task.svg" alt="暂无任务" />
        </div>
        <div class="empty-text">暂无福利任务</div>
      </div>
    </div>

    <!-- 新手专属任务 (taskTypeId = 2) -->
    <div class="task-section">
      <div class="section-header">
        <div class="section-title">
          <span class="label">⭐ 新手专属任务</span>
        </div>
        <div class="section-subtitle">仅有一次机会</div>
      </div>

      <!-- 任务列表 -->
      <div v-if="newbieTasks && newbieTasks.length > 0" class="task-list">
        <div
          v-for="task in newbieTasks"
          :key="'newbie-' + task.id"
          :class="['task-item', { completed: task.completed }]"
        >
          <div class="task-icon">{{ task.icon }}</div>
          <div class="task-info">
            <div class="task-title">{{ task.title }}</div>
            <div class="task-reward">+{{ task.reward }} 🪙</div>
            <div v-if="task.description" class="task-desc">
              {{ task.description }}
            </div>
          </div>
          <div class="task-action">
            <button
              :class="['action-btn', { completed: task.completed }]"
              @click.stop="handleTaskClick(task)"
            >
              {{ task.completed ? "已完成" : "去完成" }}
            </button>
          </div>
        </div>
      </div>

      <!-- 空状态提示 -->
      <div v-else class="empty-state">
        <div class="empty-image">
          <img src="@/assets/images/empty-task.svg" alt="暂无任务" />
        </div>
        <div class="empty-text">暂无新手任务</div>
      </div>
    </div>

    <!-- 广告任务 (taskTypeId = 5) -->
    <div class="task-section ad-task-section">
      <div class="section-header">
        <div class="section-title">
          <span class="label">📺 {{ adTaskTitle }}</span>
        </div>
        <div class="section-subtitle">{{ adTaskSubtitle }}</div>
      </div>

      <!-- 任务列表 -->
      <div v-if="adTasks && adTasks.length > 0" class="task-list">
        <div
          v-for="task in adTasks"
          :key="'ad-' + task.id"
          :class="['task-item', { completed: task.isCompleted }]"
          :style="taskItemStyle"
        >
          <div class="task-icon" :style="taskIconStyle">
            <img v-if="defaultImage" :src="defaultImage" alt="task icon" />
            <span v-else>{{ task.icon }}</span>
          </div>
          <div class="task-info">
            <div class="task-title" :style="taskTitleStyle">
              {{ getTaskTitle(task) }}
            </div>
            <div class="task-reward" :style="rewardStyle">
              🪙 +{{ task.reward }}
            </div>
            <div v-if="task.description" class="task-desc">
              {{ task.description }}
            </div>
          </div>
          <div class="task-action">
            <button
              :class="['action-btn', { completed: task.isCompleted }]"
              :style="getButtonStyle(task)"
              :disabled="task.isCompleted"
              @click.stop="handleTaskClick(task)"
            >
              {{ task.isCompleted ? "已完成" : "去完成" }}
            </button>
          </div>
        </div>
      </div>

      <!-- 空状态提示 -->
      <div v-else class="empty-state">
        <div class="empty-image">
          <img src="@/assets/images/empty-task.svg" alt="暂无任务" />
        </div>
        <div class="empty-text">暂无广告任务</div>
      </div>
    </div>
  </div>
</template>

<script>
import { Toast } from "mint-ui";
import {
  startTask,
  completeTask,
  getMySigninStatus,
  doSignin
} from "@/api/points";
// 导入积分墙API
import {
  getOfferwallTemplate,
  getWelfareTasks,
  getOfferwallConfig, // ✅ 导入配置API
  getUserCoins, // ✅ 导入金币查询API
  generateTaskToken, // ✅ 导入生成token API
  verifyTaskComplete // ✅ 导入验证任务完成API
} from "@/api/offerwall";

export default {
  name: "TaskCenter",
  data() {
    return {
      userCoins: 0,
      signedDays: 0,
      hasSignedToday: false,
      videoProgress: 0,
      videoMilestones: [
        { time: 3, reward: 5 },
        { time: 5, reward: 10 },
        { time: 8, reward: 10 },
        { time: 12, reward: 10 },
        { time: 15, reward: 10 }
      ],
      loading: false,
      // 积分墙数据
      offerwallTemplate: null, // 积分墙模版数据
      offerwallConfig: null, // 积分墙UI配置信息（从数据库读取的样式配置）
      // 按任务类型分类的任务列表
      welfareTasks: [], // taskTypeId = 1, 福利中心任务
      newbieTasks: [], // taskTypeId = 2, 新手专属任务
      adTasks: [] // taskTypeId = 5, 广告任务
    };
  },
  computed: {
    videoProgressPercent() {
      return Math.min((this.videoProgress / 15) * 100, 100);
    },

    // 广告任务板块标题
    adTaskTitle() {
      return (
        (this.offerwallConfig &&
          this.offerwallConfig.adSection &&
          this.offerwallConfig.adSection.title) ||
        "广告任务"
      );
    },

    // 广告任务板块副标题
    adTaskSubtitle() {
      return (
        (this.offerwallConfig &&
          this.offerwallConfig.adSection &&
          this.offerwallConfig.adSection.subtitle) ||
        "每天获取大量奖励币"
      );
    },

    // 任务条目背景样式
    taskItemStyle() {
      // 优先使用 global.bottomBackground，如果没有则使用 taskCard.backgroundColor
      if (
        this.offerwallConfig &&
        this.offerwallConfig.global &&
        this.offerwallConfig.global.bottomBackground
      ) {
        return {
          backgroundColor: this.offerwallConfig.global.bottomBackground
        };
      }

      // 降级方案：使用 taskCard.backgroundColor
      if (
        this.offerwallConfig &&
        this.offerwallConfig.adSection &&
        this.offerwallConfig.adSection.taskCard
      ) {
        const taskCard = this.offerwallConfig.adSection.taskCard;
        return {
          backgroundColor: taskCard.backgroundColor
        };
      }

      // 默认背景色
      return {
        backgroundColor: "#16213e"
      };
    },

    // 任务卡片图标样式
    taskIconStyle() {
      // 暂时返回空对象，图标样式可以用默认的
      return {};
    },

    // 任务标题样式
    taskTitleStyle() {
      if (
        !this.offerwallConfig ||
        !this.offerwallConfig.adSection ||
        !this.offerwallConfig.adSection.taskTitle
      )
        return {};
      const title = this.offerwallConfig.adSection.taskTitle;
      return {
        color: title.color,
        fontSize: title.fontSize,
        fontWeight: title.fontWeight
      };
    },

    // 奖励样式
    rewardStyle() {
      if (
        !this.offerwallConfig ||
        !this.offerwallConfig.adSection ||
        !this.offerwallConfig.adSection.reward
      )
        return {};
      const reward = this.offerwallConfig.adSection.reward;
      return {
        color: reward.color,
        fontSize: reward.fontSize
      };
    },

    // 按钮文字
    buttonText() {
      return (
        (this.offerwallConfig &&
          this.offerwallConfig.adSection &&
          this.offerwallConfig.adSection.button &&
          this.offerwallConfig.adSection.button.text) ||
        "去完成"
      );
    },

    // 已完成按钮文字
    buttonCompletedText() {
      return (
        (this.offerwallConfig &&
          this.offerwallConfig.adSection &&
          this.offerwallConfig.adSection.button &&
          this.offerwallConfig.adSection.button.completedText) ||
        "已完成"
      );
    },

    // 默认图片URL
    defaultImage() {
      return (
        (this.offerwallConfig &&
          this.offerwallConfig.images &&
          this.offerwallConfig.images.defaultImage) ||
        null
      );
    }
  },
  created() {
    this.init();
  },
  mounted() {
    // 监听页面可见性变化，用于检测用户从H5返回
    document.addEventListener("visibilitychange", this.handleVisibilityChange);

    // 检查是否有待验证的任务token
    this.checkPendingTask();
  },
  beforeDestroy() {
    // 移除监听器
    document.removeEventListener(
      "visibilitychange",
      this.handleVisibilityChange
    );
  },
  methods: {
    // 动态生成任务标题（包含进度）
    getTaskTitle(task) {
      console.log(
        `[TaskCenter] 🎯 生成标题: ID=${task.id}, title="${
          task.title
        }", i18nContent="${task.i18nContent}", progress=${
          task.progress
        }, targetCount=${task.targetCount}`
      );

      // 基础标题（优先使用 i18nContent 的英文内容）
      let baseTitle = task.title || "";

      // 1️⃣ 优先判断 i18nContent 字段是否有值
      if (task.i18nContent) {
        try {
          // 解析 i18nContent JSON 字符串
          const i18nData =
            typeof task.i18nContent === "string"
              ? JSON.parse(task.i18nContent)
              : task.i18nContent;

          console.log(`[TaskCenter] 📖 i18nContent 解析结果:`, i18nData);

          // 优先使用英文内容（en 字段）
          if (i18nData.en) {
            baseTitle = i18nData.en;
            console.log(`[TaskCenter] ✅ 使用英文标题: "${baseTitle}"`);
          } else if (i18nData.zh_CN) {
            // 如果没有英文，使用中文
            baseTitle = i18nData.zh_CN;
            console.log(`[TaskCenter] ✅ 使用中文标题: "${baseTitle}"`);
          }
        } catch (error) {
          console.error(`[TaskCenter] ❌ i18nContent 解析失败:`, error);
          // 解析失败时使用原 title
        }
      }

      if (!baseTitle) return "";

      // 2️⃣ 检查标题中是否包含括号格式的进度信息，如 "(0/5)" 或 "(4/5)"
      const progressPattern = /\((\d+)\/(\d+)\)/;
      const match = baseTitle.match(progressPattern);

      if (match) {
        // 如果标题中包含进度格式，使用全局的 progress 和 targetCount 替换
        const progress = task.progress || 0; // 用户完成进度
        const targetCount = task.targetCount || parseInt(match[2]) || 1;

        // 替换括号中的进度
        const newTitle = baseTitle.replace(
          progressPattern,
          `(${progress}/${targetCount})`
        );
        console.log(`[TaskCenter] ✅ 替换后标题: "${newTitle}"`);
        return newTitle;
      }

      // 3️⃣ 如果标题中没有进度格式，但任务有 targetCount > 1，则添加进度显示
      if (task.targetCount && task.targetCount > 1) {
        const progress = task.progress || 0;
        const newTitle = `${baseTitle} (${progress}/${task.targetCount})`;
        console.log(`[TaskCenter] ✅ 添加进度后标题: "${newTitle}"`);
        return newTitle;
      }

      // 4️⃣ 如果没有进度格式且 targetCount = 1，直接返回标题
      console.log(`[TaskCenter] ✅ 保持标题: "${baseTitle}"`);
      return baseTitle;
    },

    // 处理任务点击事件
    async handleTaskClick(task) {
      // 如果任务已完成,提示用户并阻止点击
      if (task.isCompleted) {
        Toast({
          message: "该任务已完成",
          position: "middle",
          duration: 1500
        });
        return;
      }

      // 如果没有跳转链接,提示用户
      if (!task.jumpUrl) {
        Toast({
          message: "该任务暂无跳转链接",
          position: "middle",
          duration: 1500
        });
        return;
      }

      try {
        // 显示加载提示
        Toast({
          message: "正在生成任务token...",
          position: "middle",
          duration: 1000
        });

        // 调用后端生成token（自动从localStorage获取userId，并添加签名）
        console.log("[TaskCenter] 生成token，任务ID:", task.id);
        const res = await generateTaskToken(task.id);

        console.log("[TaskCenter] token生成响应:", res);

        if (res.code === 200 && res.data && res.data.token) {
          const token = res.data.token;
          console.log("[TaskCenter] ✅ token生成成功:", token);

          // 将token保存到localStorage，供后续验证使用
          localStorage.setItem("currentTaskToken", token);
          localStorage.setItem("currentTaskId", task.id);

          // 跳转到任务页面
          console.log("[TaskCenter] 跳转到任务链接:", task.jumpUrl);
          this.openInBrowser(task.jumpUrl);
        } else {
          Toast({
            message: res.message || "生成token失败",
            position: "middle",
            duration: 2000
          });
        }
      } catch (error) {
        console.error("[TaskCenter] ❌ 生成token失败:", error);
        Toast({
          message:
            (error.response &&
              error.response.data &&
              error.response.data.message) ||
            "生成token失败，请重试",
          position: "middle",
          duration: 2000
        });
      }
    },

    // 在指定浏览器中打开链接
    openInBrowser(url) {
      // 检测操作系统
      const isWindows = navigator.platform.indexOf("Win") > -1;
      const isMac = navigator.platform.indexOf("Mac") > -1;
      const isAndroid = /Android/i.test(navigator.userAgent);
      const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

      console.log("[TaskCenter] 打开链接:", url);
      console.log("[TaskCenter] 系统信息:", {
        isWindows,
        isMac,
        isAndroid,
        isIOS
      });

      // 尝试使用不同的方案
      if (isWindows) {
        // Windows系统 - 尝试使用Edge浏览器的URL Scheme
        // microsoft-edge: 协议可以在Windows 10+上启动Edge浏览器
        const edgeUrl = `microsoft-edge:${url}`;
        console.log("[TaskCenter] 尝试使用Edge打开:", edgeUrl);

        // 创建一个隐藏的iframe尝试打开Edge
        const iframe = document.createElement("iframe");
        iframe.style.display = "none";
        iframe.src = edgeUrl;
        document.body.appendChild(iframe);

        // 等待一段时间，如果Edge没有打开，使用默认浏览器
        setTimeout(() => {
          document.body.removeChild(iframe);
          // 如果Edge无法打开，降级到默认浏览器
          if (document.hidden) {
            console.log("[TaskCenter] Edge已打开");
          } else {
            console.log("[TaskCenter] Edge无法打开，使用默认浏览器");
            window.open(url, "_blank");
          }
        }, 500);
      } else if (isAndroid) {
        // Android系统 - 可以尝试使用Chrome的intent
        const intent = `intent://${url.replace(
          /^https?:\/\//,
          ""
        )}#Intent;scheme=https;package=com.android.chrome;end`;
        console.log("[TaskCenter] Android - 尝试使用Chrome打开");

        // 先尝试Chrome
        window.location.href = intent;

        // 备用方案
        setTimeout(() => {
          if (document.hidden) {
            console.log("[TaskCenter] Chrome已打开");
          } else {
            console.log("[TaskCenter] Chrome无法打开，使用默认浏览器");
            window.open(url, "_blank");
          }
        }, 500);
      } else {
        // 其他系统（Mac, iOS等）- 直接使用默认浏览器或window.open
        console.log("[TaskCenter] 使用默认方式打开链接");

        // 尝试在新窗口打开
        const opened = window.open(url, "_blank");

        // 如果window.open被阻止，使用location.href
        if (!opened) {
          console.log("[TaskCenter] window.open被阻止，使用location.href");
          window.location.href = url;
        }
      }
    },

    // 检查是否有待验证的任务
    checkPendingTask() {
      const token = localStorage.getItem("currentTaskToken");
      const taskId = localStorage.getItem("currentTaskId");

      if (token && taskId) {
        console.log(
          "[TaskCenter] 检测到待验证任务，token:",
          token,
          "taskId:",
          taskId
        );
        // 自动验证（可以选择立即验证或等待用户手动触发）
        // this.verifyTaskCompletion();
      }
    },

    // 处理页面可见性变化（用户从H5返回时触发）
    handleVisibilityChange() {
      if (!document.hidden) {
        // 页面变为可见，检查是否有待验证的任务
        console.log("[TaskCenter] 页面可见，检查待验证任务");
        const token = localStorage.getItem("currentTaskToken");

        if (token) {
          // 用户从H5返回，自动验证任务完成
          this.verifyTaskCompletion();
        }
      }
    },

    // 验证任务完成
    async verifyTaskCompletion() {
      const token = localStorage.getItem("currentTaskToken");
      const taskId = localStorage.getItem("currentTaskId");

      if (!token) {
        console.log("[TaskCenter] 没有待验证的token");
        return;
      }

      try {
        console.log("[TaskCenter] 开始验证任务完成，token:", token);

        Toast({
          message: "正在验证任务完成...",
          position: "middle",
          duration: 1500
        });

        // 调用验证接口
        const res = await verifyTaskComplete(token);

        console.log("[TaskCenter] 验证响应:", res);

        // 判断条件：状态码 200 && message == "ok"
        if (res.code === 200 && res.message === "ok") {
          // 验证成功，使用返回的任务列表数据更新UI
          if (res.data && Array.isArray(res.data)) {
            console.log(
              "[TaskCenter] ✅ 任务完成，收到任务列表数据，共",
              res.data.length,
              "个任务"
            );

            // ✅ 完全替换任务列表（先清空）
            this.welfareTasks = []; // taskTypeId = 1
            this.newbieTasks = []; // taskTypeId = 2
            this.adTasks = []; // taskTypeId = 5

            console.log("[TaskCenter] 🔄 已清空旧任务列表，开始填充新数据...");

            res.data.forEach(task => {
              console.log(
                `[TaskCenter] 📊 处理任务数据: ID=${task.id}, title="${
                  task.title
                }", userProgress=${task.userProgress}, completedCount=${
                  task.completedCount
                }, targetCount=${task.targetCount}, isCompleted=${
                  task.isCompleted
                }`
              );

              const taskItem = {
                id: task.id,
                icon: task.icon || this.getDefaultIcon(task.taskTypeId),
                title: task.title,
                i18nContent: task.i18nContent || null, // ✅ 添加 i18nContent 字段
                reward: task.rewardPoints,
                isCompleted: task.isCompleted || false, // 按钮状态：是否完成
                completedCount: task.userProgress || task.completedCount || 0, // 用户个人完成次数（用于标题显示）
                progress: task.userProgress || task.completedCount || 0, // 用户完成进度（用于标题显示）
                targetCount: task.targetCount || 1, // 目标完成次数
                jumpUrl: task.jumpUrl || "",
                pageDuration: task.pageDuration || 0,
                description: task.description || ""
              };

              console.log(
                `[TaskCenter] 📦 构建的taskItem: ID=${taskItem.id}, progress=${
                  taskItem.progress
                }, targetCount=${taskItem.targetCount}, completedCount=${
                  taskItem.completedCount
                }`
              );

              // 根据 taskTypeId 分类
              if (task.taskTypeId === 1) {
                this.welfareTasks.push(taskItem);
              } else if (task.taskTypeId === 2) {
                this.newbieTasks.push(taskItem);
              } else if (task.taskTypeId === 5) {
                this.adTasks.push(taskItem);
              }
            });

            console.log("[TaskCenter] ✅ 任务列表已完全替换:");
            console.log("- 福利中心:", this.welfareTasks.length);
            console.log("- 新手专属:", this.newbieTasks.length);
            console.log("- 广告任务:", this.adTasks.length);

            Toast({
              message: "任务完成！任务列表已更新",
              position: "middle",
              duration: 3000
            });
          } else {
            Toast({
              message: "任务完成！",
              position: "middle",
              duration: 2000
            });
          }

          // 清除localStorage中的token
          localStorage.removeItem("currentTaskToken");
          localStorage.removeItem("currentTaskId");

          // 刷新金币
          this.loadUserPoints();
        } else if (res.code === 200) {
          // 状态码 200 但 message 不是 "ok"，可能是时间不足等情况
          Toast({
            message: res.message || "任务未完成",
            position: "middle",
            duration: 2000
          });
        } else {
          Toast({
            message: res.message || "任务验证失败",
            position: "middle",
            duration: 2000
          });

          // 如果是token过期，清除localStorage
          if (res.message && res.message.includes("过期")) {
            localStorage.removeItem("currentTaskToken");
            localStorage.removeItem("currentTaskId");
          }
        }
      } catch (error) {
        console.error("[TaskCenter] ❌ 任务验证失败:", error);

        const errorMsg =
          (error.response &&
            error.response.data &&
            error.response.data.message) ||
          "任务验证失败，请重试";

        Toast({
          message: errorMsg,
          position: "middle",
          duration: 2000
        });

        // 如果是token相关错误，清除localStorage
        if (errorMsg.includes("过期") || errorMsg.includes("无效")) {
          localStorage.removeItem("currentTaskToken");
          localStorage.removeItem("currentTaskId");
        }
      }
    },

    async init() {
      this.loading = true;
      try {
        // 加载所有数据
        await Promise.all([
          this.loadUserPoints(), // ✅ 加载用户金币（不需要token）
          this.loadSigninStatus(), // ✅ 加载签到状态（不需要token）
          this.loadOfferwallConfig(), // ✅ 加载积分墙UI配置
          this.loadOfferwallTemplate(), // 加载积分墙模版数据
          this.loadWelfareTasks() // 加载并分类所有任务（按 taskTypeId）
        ]);
      } catch (error) {
        console.error("初始化失败:", error);
      } finally {
        this.loading = false;
      }
    },

    // 新增：加载积分墙UI配置信息（从数据库读取样式配置）
    async loadOfferwallConfig() {
      try {
        console.log("=== 开始加载积分墙UI配置（广告任务样式） ===");
        const res = await getOfferwallConfig();
        console.log("积分墙配置响应:", res);
        console.log("完整响应数据:", JSON.stringify(res, null, 2));

        // 处理成功响应且有数据
        if (res.code === 200 && res.data) {
          this.offerwallConfig = res.data;
          console.log("✅ 积分墙配置加载成功");
          console.log(
            "offerwallConfig.adSection:",
            this.offerwallConfig.adSection
          );
          console.log(
            "offerwallConfig.adSection.taskCard:",
            this.offerwallConfig.adSection &&
              this.offerwallConfig.adSection.taskCard
          );
          console.log("offerwallConfig.global:", this.offerwallConfig.global);

          // 应用样式配置
          this.applyThemeConfig(res.data);
        }
        // 处理无数据的情况（数据库中没有配置）
        else if (res.code === 200 && !res.data) {
          console.log("⚠️ 数据库无样式配置，使用默认样式");
          this.offerwallConfig = null;
        }
        // 处理错误响应
        else {
          console.warn("⚠️ 积分墙配置响应异常:", res);
          this.offerwallConfig = null;
        }
      } catch (error) {
        console.error("❌ 获取积分墙配置失败:", error);
        // 失败时不报错，静默降级，使用默认样式
        this.offerwallConfig = null;
        console.log("💡 使用默认样式");
      }
    },

    // 应用主题配置
    applyThemeConfig(config) {
      if (!config) {
        console.log("无样式配置，使用默认样式");
        return;
      }

      // 打印样式配置，方便调试
      console.log("成功加载样式配置:");
      console.log("- 主题:", config.theme);
      console.log("- 广告任务板块:", config.adSection);
      if (config.adSection) {
        console.log("  - 标题:", config.adSection.title);
        console.log("  - 标题颜色:", config.adSection.titleColor);
        console.log("  - 副标题:", config.adSection.subtitle);
        console.log("  - 背景色:", config.adSection.backgroundColor);
        console.log("  - 边框色:", config.adSection.borderColor);
        console.log("  - 任务卡片样式:", config.adSection.taskCard);
        if (config.adSection.taskCard) {
          console.log(
            "    - 任务条目背景色(task_item_bg):",
            config.adSection.taskCard.backgroundColor
          );
        }
        console.log("  - 任务标题样式:", config.adSection.taskTitle);
        console.log("  - 奖励样式:", config.adSection.reward);
        console.log("  - 按钮样式:", config.adSection.button);
      }
      console.log("- 全局样式:", config.global);
      if (config.global) {
        console.log(
          "  - 底部背景色(bottomBackground):",
          config.global.bottomBackground
        );
        console.log("  💡 使用 bottomBackground 作为 .task-item 背景色");
      }
    },

    // 获取任务卡片样式
    getTaskCardStyle(task) {
      if (
        !this.offerwallConfig ||
        !this.offerwallConfig.adSection ||
        !this.offerwallConfig.adSection.taskCard
      )
        return {};
      const card = this.offerwallConfig.adSection.taskCard;
      return {
        backgroundColor: card.backgroundColor,
        borderRadius: card.borderRadius,
        padding: card.padding
      };
    },

    // 获取按钮样式
    getButtonStyle(task) {
      if (
        !this.offerwallConfig ||
        !this.offerwallConfig.adSection ||
        !this.offerwallConfig.adSection.button
      )
        return {};
      const button = this.offerwallConfig.adSection.button;

      // 根据任务完成状态返回不同样式
      if (task.isCompleted) {
        return {
          backgroundColor: button.completedBackgroundColor || "#999",
          color: button.textColor,
          borderRadius: button.borderRadius,
          padding: button.padding,
          cursor: "not-allowed",
          opacity: 0.6
        };
      } else {
        return {
          backgroundColor: button.backgroundColor,
          color: button.textColor,
          borderRadius: button.borderRadius,
          padding: button.padding
        };
      }
    },

    // 新增：加载积分墙模版数据
    async loadOfferwallTemplate() {
      try {
        console.log("=== 开始加载积分墙模版数据 ===");
        const res = await getOfferwallTemplate();
        console.log("积分墙模版数据响应:", res);

        if (res.code === 200 && res.data) {
          this.offerwallTemplate = res.data;
          console.log("积分墙模版数据加载成功:");
          console.log("- 场景列表:", res.data.scenes);
          console.log("- 任务类型:", res.data.taskTypes);
          console.log("- 配置信息:", res.data.config);

          Toast({
            message: "积分墙模版加载成功",
            position: "middle",
            duration: 1500
          });
        } else {
          console.warn("积分墙模版数据格式异常:", res);
        }
      } catch (error) {
        console.error("获取积分墙模版数据失败:", error);
        Toast({
          message: "加载积分墙模版失败",
          position: "middle",
          duration: 1500
        });
      }
    },

    // 新增：加载福利中心任务列表（按 taskTypeId 分类）
    async loadWelfareTasks() {
      try {
        console.log("=== 开始加载福利中心任务列表 ===");
        const res = await getWelfareTasks({ page: 1, limit: 100 });
        console.log("福利中心任务列表响应:", res);

        if (res.code === 200 && res.data) {
          const allTasks = res.data.data || [];
          console.log("任务列表加载成功，总任务数:", allTasks.length);

          // 按 taskTypeId 分类任务
          this.welfareTasks = []; // taskTypeId = 1, 福利中心任务
          this.newbieTasks = []; // taskTypeId = 2, 新手专属任务
          this.adTasks = []; // taskTypeId = 5, 广告任务

          allTasks.forEach(task => {
            const taskItem = {
              id: task.id,
              icon: task.icon || this.getDefaultIcon(task.taskTypeId),
              title: task.title,
              i18nContent: task.i18nContent || null, // ✅ 添加 i18nContent 字段
              reward: task.rewardPoints,
              isCompleted: task.isCompleted || false,
              completedCount: task.userProgress || task.completedCount || 0,
              progress: task.userProgress || task.completedCount || 0, // 用户完成进度（用于标题显示）
              targetCount: task.targetCount || 0,
              jumpUrl: task.jumpUrl || "",
              pageDuration: task.pageDuration || 0,
              description: task.description || ""
            };

            // 根据 taskTypeId 分类
            if (task.taskTypeId === 1) {
              // 福利中心任务
              this.welfareTasks.push(taskItem);
            } else if (task.taskTypeId === 2) {
              // 新手专属任务
              this.newbieTasks.push(taskItem);
            } else if (task.taskTypeId === 5) {
              // 广告任务
              this.adTasks.push(taskItem);
            }
          });

          console.log("任务分类完成:");
          console.log(
            "- 福利中心任务(taskTypeId=1):",
            this.welfareTasks.length
          );
          console.log("- 新手专属任务(taskTypeId=2):", this.newbieTasks.length);
          console.log("- 广告任务(taskTypeId=5):", this.adTasks.length);

          Toast({
            message: `加载 ${allTasks.length} 个任务`,
            position: "middle",
            duration: 1500
          });
        } else {
          console.warn("福利中心任务列表格式异常:", res);
        }
      } catch (error) {
        console.error("获取福利中心任务列表失败:", error);
        Toast({
          message: "加载福利任务失败",
          position: "middle",
          duration: 1500
        });
      }
    },

    // 根据任务类型返回默认图标
    getDefaultIcon(taskTypeId) {
      const iconMap = {
        1: "🎁", // 福利中心
        2: "⭐", // 新手专属
        5: "📺" // 广告任务
      };
      return iconMap[taskTypeId] || "📋";
    },

    // 加载用户金币（从 film_api）
    async loadUserPoints() {
      try {
        console.log("[TaskCenter] 开始加载用户金币...");

        // 使用金币系统而不是积分系统
        const res = await getUserCoins();

        console.log("[TaskCenter] getUserCoins 响应:", res);
        console.log("[TaskCenter] success_code:", res.success_code);
        console.log("[TaskCenter] data:", res.data);

        if (res.success_code === 200 && res.data) {
          // ✅ 使用 coin_balance（总金币余额）
          this.userCoins = res.data.coin_balance || 0;
          console.log("[TaskCenter] ✅ 金币加载成功，总金币:", this.userCoins);
          console.log("[TaskCenter] 数据详情:", {
            coin_balance: res.data.coin_balance,
            total_earned: res.data.total_earned,
            continuous_days: res.data.continuous_days
          });
        } else {
          console.warn("[TaskCenter] ⚠️ 响应格式不正确或无数据");
          this.userCoins = 0;
        }
      } catch (error) {
        console.error("[TaskCenter] ❌ 获取金币失败:", error);
        console.error("[TaskCenter] 错误详情:", {
          message: error.message,
          response: error.response && error.response.data,
          status: error.response && error.response.status
        });
        // 失败时设置为 0，避免显示错误
        this.userCoins = 0;
      }
    },

    // 加载签到状态（金币系统）
    async loadSigninStatus() {
      try {
        console.log("[TaskCenter] 🔍 检查签到状态...");
        const res = await getMySigninStatus();
        // film_api 返回格式: { success_code: 200, checked: true/false, data: { last_checkin_date, continuous_days } }
        if (res.success_code === 200) {
          this.hasSignedToday = res.checked || false;
          if (res.data) {
            this.signedDays = res.data.continuous_days || 0;
          }
          console.log("[TaskCenter] ✅ 签到状态:", {
            hasSignedToday: this.hasSignedToday,
            signedDays: this.signedDays,
            lastCheckinDate: res.data && res.data.last_checkin_date
          });
        }
      } catch (error) {
        console.error("[TaskCenter] ❌ 获取签到状态失败:", error);
        this.hasSignedToday = false;
      }
    },

    // 签到
    async handleSignIn() {
      if (this.hasSignedToday) {
        Toast({
          message: "今日已签到",
          position: "middle",
          duration: 1500
        });
        return;
      }

      try {
        const res = await doSignin();
        // film_api 返回格式: { success_code: 200, data: { reward_coins, continuous_days, ... } }
        if (res.success_code === 200 && res.data) {
          Toast({
            message:
              res.data.message ||
              `签到成功！获得 ${res.data.reward_coins} 金币`,
            position: "middle",
            duration: 2000
          });
          this.hasSignedToday = true;
          this.signedDays = res.data.continuous_days || 0;
          // 刷新金币余额
          this.loadUserPoints();
        }
      } catch (error) {
        console.error("签到失败:", error);
        Toast({
          message: error.message || "签到失败，请重试",
          position: "middle",
          duration: 2000
        });
      }
    },

    // 处理任务
    async handleTask(task) {
      if (task.completed || task.progress >= task.total) {
        Toast({
          message: "该任务已完成",
          position: "middle",
          duration: 1500
        });
        return;
      }

      try {
        // 开始任务
        await startTask(task.id);

        // 这里应该跳转到任务执行页面
        // 为了演示，直接完成任务
        Toast({
          message: "正在执行任务...",
          position: "middle",
          duration: 1000
        });

        // 模拟任务完成（实际应该根据任务类型跳转到对应页面）
        setTimeout(async () => {
          try {
            const res = await completeTask(task.id);
            Toast({
              message: `任务完成！获得 ${res.data.points} 金币`,
              position: "middle",
              duration: 2000
            });
            task.completed = true;
            // 刷新积分
            this.loadUserPoints();
          } catch (error) {
            console.error("完成任务失败:", error);
          }
        }, 1500);
      } catch (error) {
        console.error("开始任务失败:", error);
      }
    },

    // 处理视频任务
    async handleVideoTask() {
      try {
        // 获取视频广告
        const res = await getClientAds({
          adType: "rewarded_video",
          status: "active"
        });
        if (res.data && res.data.length > 0) {
          const videoAd = res.data[0];

          Toast({
            message: "正在加载视频...",
            position: "middle",
            duration: 1000
          });

          // 模拟观看视频（实际应该调用广告SDK）
          setTimeout(async () => {
            try {
              const watchRes = await watchAd(videoAd.id, { duration: 60 });
              Toast({
                message: `观看完成！获得 ${watchRes.data.points} 金币`,
                position: "middle",
                duration: 2000
              });
              this.videoProgress += 1;
              // 刷新积分
              this.loadUserPoints();
            } catch (error) {
              console.error("观看广告失败:", error);
            }
          }, 2000);
        } else {
          Toast({
            message: "暂无可用视频",
            position: "middle",
            duration: 1500
          });
        }
      } catch (error) {
        console.error("获取视频广告失败:", error);
      }
    },

    // 新增：处理场景点击
    handleScene(scene) {
      console.log("点击场景:", scene);
      Toast({
        message: `进入场景：${scene.name}`,
        position: "middle",
        duration: 1500
      });
      // 可以跳转到场景详情页或任务列表页
      // this.$router.push({ path: '/offerwall/scene', query: { sceneId: scene.id } })
    },

    // 新增：处理福利任务点击
    async handleWelfareTask(task) {
      console.log("点击福利任务:", task);

      if (task.isCompleted) {
        Toast({
          message: "该任务已完成",
          position: "middle",
          duration: 1500
        });
        return;
      }

      // 可以跳转到任务详情页或直接执行任务
      Toast({
        message: `开始任务：${task.title}`,
        position: "middle",
        duration: 1500
      });

      // 这里可以调用积分墙的开始任务接口
      // 例如: await startOfferwallTask(task.id)
    }
  }
};
</script>

<style scoped lang="stylus">
#task-center
  width 100%
  max-width 100vw
  min-height 100vh
  background-color #1a1a2e
  color #fff
  padding-bottom 1rem
  overflow-x hidden
  position relative
  box-sizing border-box

  .header
    position fixed
    top 0
    left 0
    right 0
    height 1rem
    background-color #16213e
    display flex
    align-items center
    padding 0 .3rem
    z-index 100
    .icon-back
      font-size .5rem
      cursor pointer
    .title
      flex 1
      text-align center
      font-size .4rem
      font-weight bold
      margin-right .5rem

  .coin-balance
    margin-top 1.2rem
    padding .4rem
    box-sizing border-box
    .balance-card
      background linear-gradient(135deg, #667eea 0%, #764ba2 100%)
      border-radius .3rem
      padding .5rem
      display flex
      align-items center
      box-shadow 0 .1rem .3rem rgba(0,0,0,0.3)
      box-sizing border-box
      .coin-icon
        font-size 1.5rem
        margin-right .3rem
      .balance-info
        .label
          font-size .28rem
          opacity 0.8
        .amount
          font-size .8rem
          font-weight bold
          margin-top .1rem

  .sign-in-section
    padding .3rem .4rem
    box-sizing border-box
    .section-title
      font-size .35rem
      font-weight bold
      margin-bottom .3rem
      display flex
      align-items center
      .icon
        font-size .4rem
        margin-right .2rem
    .sign-in-card
      background-color #16213e
      border-radius .3rem
      padding .4rem
      box-sizing border-box
      overflow hidden
      .sign-days
        display flex
        justify-content space-between
        margin-bottom .4rem
        overflow hidden
        .day-item
          flex 1
          display flex
          flex-direction column
          align-items center
          padding .2rem
          border-radius .2rem
          position relative
          &.active
            background-color rgba(221, 39, 39, 0.2)
            border .02rem solid #dd2727
          &.completed
            opacity 0.5
          .reward
            font-size .3rem
            font-weight bold
            color #ffb400
          .coin-icon-small
            font-size .4rem
            margin .1rem 0
          .day-label
            font-size .24rem
            opacity 0.7
      .sign-button
        background linear-gradient(135deg, #f093fb 0%, #f5576c 100%)
        color #fff
        text-align center
        padding .35rem
        border-radius .5rem
        font-size .35rem
        font-weight bold
        cursor pointer
        box-shadow 0 .1rem .2rem rgba(245, 87, 108, 0.4)
        &:active
          transform scale(0.98)

  .offerwall-section
    padding .3rem .4rem
    margin-bottom .3rem
    box-sizing border-box
    .section-header
      margin-bottom .3rem
      .section-title
        font-size .35rem
        font-weight bold
        margin-bottom .15rem
        .label
          color #fff
      .section-subtitle
        font-size .26rem
        color #999

    .scene-list
      display flex
      flex-direction column
      gap .2rem
      .scene-item
        background-color #16213e
        border-radius .3rem
        padding .3rem
        display flex
        align-items center
        cursor pointer
        transition all 0.3s
        &:active
          transform scale(0.98)
          background-color #1a2642
        .scene-icon
          font-size .8rem
          margin-right .3rem
          flex-shrink 0
        .scene-info
          flex 1
          min-width 0
          .scene-name
            font-size .32rem
            font-weight bold
            margin-bottom .1rem
          .scene-desc
            font-size .24rem
            color #999
            overflow hidden
            text-overflow ellipsis
            white-space nowrap
        .scene-arrow
          font-size .4rem
          color #999
          flex-shrink 0
          margin-left .2rem

  .task-section
    padding .3rem .4rem
    margin-bottom .3rem
    box-sizing border-box
    .section-header
      margin-bottom .3rem
      .section-title
        font-size .35rem
        font-weight bold
        margin-bottom .15rem
        .label
          color #fff
      .section-subtitle
        font-size .26rem
        color #999

    .video-task
      background-color #16213e
      border-radius .3rem
      padding .3rem
      margin-bottom .3rem
      box-sizing border-box
      overflow hidden
      .video-header
        display flex
        align-items center
        margin-bottom .3rem
        flex-wrap wrap
        .video-icon
          font-size .8rem
          margin-right .2rem
        .video-info
          flex 1
          min-width 0
          overflow hidden
          .video-title
            font-size .32rem
            font-weight bold
            margin-bottom .1rem
            word-wrap break-word
            overflow-wrap break-word
          .video-subtitle
            font-size .24rem
            color #ffb400
            word-wrap break-word
            overflow-wrap break-word
        .video-btn
          background-color #dd2727
          color #fff
          border none
          padding .2rem .4rem
          border-radius .4rem
          font-size .28rem
          cursor pointer
          white-space nowrap
          flex-shrink 0
      .video-progress
        display flex
        justify-content space-between
        margin-bottom .2rem
        overflow hidden
        .milestone
          flex 1
          display flex
          flex-direction column
          align-items center
          padding .15rem
          opacity 0.5
          min-width 0
          &.active
            opacity 1
          .gift-icon
            font-size .5rem
          .reward-text
            font-size .24rem
            color #ffb400
            margin .05rem 0
          .time-text
            font-size .2rem
            color #999
      .progress-bar
        width 100%
        height .15rem
        background-color rgba(255,255,255,0.1)
        border-radius .1rem
        overflow hidden
        .progress-fill
          height 100%
          background linear-gradient(90deg, #f093fb 0%, #f5576c 100%)
          border-radius .1rem
          transition width 0.3s ease

    .task-list
      .task-item
        background-color #16213e
        border-radius .3rem
        padding .3rem
        margin-bottom .2rem
        display flex
        align-items center
        cursor pointer
        transition all 0.3s
        box-sizing border-box
        overflow hidden
        &:active
          transform scale(0.98)
        &.completed
          opacity 0.6
        .task-icon
          font-size .8rem
          margin-right .3rem
          flex-shrink 0
          width .8rem
          height .8rem
          display flex
          align-items center
          justify-content center
          img
            width 100%
            height 100%
            object-fit cover
            border-radius .1rem
        .task-info
          flex 1
          min-width 0
          overflow hidden
          .task-title
            font-size .3rem
            margin-bottom .1rem
            word-wrap break-word
            overflow-wrap break-word
          .task-reward
            font-size .26rem
            color #ffb400
          .task-desc
            font-size .22rem
            color #999
            margin-top .1rem
            word-wrap break-word
            overflow-wrap break-word
        .task-action
          flex-shrink 0
          margin-left .2rem
          display flex
          align-items center
          justify-content center
          .action-btn
            background-color #dd2727
            color #fff
            border none
            padding .2rem .4rem
            border-radius .4rem
            font-size .26rem
            cursor pointer
            white-space nowrap
            &.completed
              background-color #666
              color #ccc

  // 空状态样式
  .empty-state
    text-align center
    padding 1.5rem 1rem
    color #999
    .empty-image
      margin-bottom .4rem
      img
        width 3rem
        height 3rem
        opacity 0.6
    .empty-icon
      font-size 1.2rem
      margin-bottom .3rem
    .empty-text
      font-size .28rem
      color #888
</style>
