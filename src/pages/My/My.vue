<template>
    <div id="my">
      <div
        class="header"
      >
        <div class="left">
          <div class="avatar">
            <img :src="avatar" alt="">
          </div>
          <span @click="$router.push('login')" v-if="!jsonData.user_id" class="go-login">登录/注册</span>
          <div v-else class="user-info">
            <span class="ellipsis" style="font-size: .375rem;line-height: .6rem;margin-bottom: .12rem">{{jsonData.user_name}}</span>
            <span class="ellipsis">{{jsonData.sign?jsonData.sign:'同学有点懒，还没写下签名'}}</span>
          </div>
        </div>
        <div class="right" v-if="jsonData.user_name" @click="viewUserInfo"><span>个人信息</span><span class="icon-more"></span></div>
      </div>
      <div class="content">
          <div class="list">
            <div class="item" @click="viewMyOrder">我的订单 <span class="icon-more"></span></div>
            <div class="item" @click="viewMyMovie(1)">想看的电影 <span class="icon-more"></span></div>
            <div class="item" @click="viewMyMovie(0)">看过的电影 <span class="icon-more"></span></div>
            <div class="item task-item" @click="goToTaskCenter">
              <div class="task-left">
                <span class="task-icon">🎯</span>
                <span>任务中心</span>
              </div>
              <div class="task-right">
                <span class="coin-badge">领金币</span>
                <span class="icon-more"></span>
              </div>
            </div>
          </div>
      </div>
    </div>
</template>

<script>
    import {getUserInfo} from '../../api/index'
    import {Indicator} from 'mint-ui'
    export default {
        name: "My",
        data(){
          return{
            jsonData:{},
            avatar:'http://localhost:4000/images/avatar/userIcon.png'
          }
        },
        created(){
          this.loadUserInfo();
        },
        methods:{
          //用户头像
          userAvatar(){
            if (this.jsonData){
              this.avatar = 'http://localhost:4000'+this.jsonData.avatar
            } else {
              this.avatar = 'http://localhost:4000/images/avatar/userIcon.png'
            }
          },
          //加载用户信息
          async loadUserInfo(){
            if (this.$cookies.get('user_id')) {
              Indicator.open('Loading...');
              let json = await getUserInfo(this.$cookies.get('user_id'));
              if (json.success_code===200) {
                this.jsonData = json.data;
                this.userAvatar();
              } else {
                this.jsonData = {};
              }
              Indicator.close();
            } else{
              this.jsonData = {};
              Indicator.close();
            }
          },
          //查看个人信息
          viewUserInfo(){
            if (this.$cookies.get('user_id')) {
              this.$router.push('my_info')
            }
          },
          //查看个人订单
          viewMyOrder(flag){
            if (this.$cookies.get('user_id')) {
              this.$router.push({path:'my_order',query:{'user_id':this.$cookies.get('user_id')}});
            } else{
              this.$router.push('login');
            }
          },
          //查看个人电影
          viewMyMovie(flag){
            if (this.$cookies.get('user_id')) {
              this.$router.push({path:'my_movie',query:{'user_id':this.$cookies.get('user_id'),'wish_movie':flag}});
            } else{
              this.$router.push('login');
            }
          },
          //前往任务中心
          goToTaskCenter(){
            this.$router.push('task_center');
          }
        },
    }
</script>

<style scoped lang="stylus" ref="stylesheet/stylus">
  #my
    width 100%
    height 100%
    .header
      font-size .3125rem
      font-weight bolder
      height 2.8rem
      display flex
      justify-content space-between
      align-items center
      background-color #dd2727
      color #fff
      position relative
      .left
        width 4rem
        height 2rem
        position relative
        display flex
        justify-content center
        align-items center
        margin-left .4rem
        .avatar
          position absolute
          box-sizing border-box
          border .08rem solid #f1f1f1
          left 0
          width 1.6rem
          height 1.6rem
          border-radius 50%
          overflow hidden
          font-size 0
          img
            width 100%
            height 100%
        .go-login
          position absolute
          left 2rem
        .user-info
          width 100%
          position absolute
          left 2rem
          display flex
          flex-flow column
          span:last-child
            font-size .25rem
      .right
        display flex
        font-weight lighter
        justify-content center
        align-items center
        font-size .24rem
        width 1.2rem
        height .4rem
        padding 0 .2rem
        background-color: rgba(255,255,255,.3);
        border-radius .2rem 0 0 .2rem
    .content
      border-top .4rem solid #f1f1f1
      font-size .3125rem
      position fixed
      top 2.8rem
      left 0
      bottom 0
      width 100%
      background-color #f1f1f1
      .list
        background-color #fff
        .item
          display flex
          justify-content space-between
          align-items center
          padding .3rem
          font-size .3125rem
          border-bottom .12rem solid #f1f1f1
          &.task-item
            background linear-gradient(135deg, #fff5f5 0%, #fff 100%)
            .task-left
              display flex
              align-items center
              .task-icon
                font-size .4rem
                margin-right .2rem
            .task-right
              display flex
              align-items center
              .coin-badge
                background-color #dd2727
                color #fff
                padding .08rem .2rem
                border-radius .3rem
                font-size .24rem
                margin-right .2rem
        .icon-more
          font-weight 700
</style>
