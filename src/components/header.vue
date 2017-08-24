<template>
  <div class="head">
    <h1 class="logo"></h1>
    <ul v-if="$route.name!='home'" class="nav">
      <li v-for="item in links"><router-link :to=item.path>{{item.description}}</router-link></li>      
    </ul>
    <div class="head-right">
      <div class="head-other">        
        <a href="javascript:void(0)" class="news"><i class="el-icon-notification"></i></a>
      </div>
      <div v-if="$route.name!='home'">
          <el-button class="btn" @click="quitHome">退出</el-button>
      </div>
      <div v-if="$route.name=='home'" class="login-info">
        <img class="avatar" :src="avatarpath" alt="" width="28" height="28">
        <el-dropdown trigger="click" @command="quit">
          <span class="el-dropdown-link">
            {{nickname}}<i class="el-icon-caret-bottom el-icon--right"></i>
          </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="a">退出</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </div>
  </div>
</template>

<script>
import request from "../assets/js/gbq.request.js";
import region from "../assets/js/gbq.region.js";
import gbqModel from '../assets/js/gbq.model.js';
import { bus } from '../assets/js/gbq.eventbus.js';

export default {
  created: function() {
    var vueObj = this;
    bus.$on('update-tabs', function(catalog){
      vueObj.links = region().getTabs(catalog); 
    });
  },
  mounted: function(){
    var vueObj = this;
    this.loginInfo = request().getLoginInfo();    
    if (!this.loginInfo) {
      this.$router.push('/login');
    } 
    else {
      // 提示
      this.$message({
        message: '欢迎回来，' + this.loginInfo.userName,
        type: 'success'
      });
      // 构建表头
      if(!gbqModel().isProjectNull()){        
        gbqModel().read(function(data){
          vueObj.links = region().getTabs(gbqModel().getCatalog());      
        });  
      }      
    }    
  },
  data(){
    return {
      loginInfo: "",      
      links: []
    }
  },
  methods:{
    quitHome: function() {
      this.$router.push('/home');
    },
    quit:function(command) {
      if (command='a') {
        request().logout();
        this.$router.push('/login');
      }
    }
  },
  computed:{
    avatarpath: function(){
      return this.loginInfo.avatarPath+'/48';
    },
    nickname: function(){
      if(this.loginInfo.nickname){
        return this.loginInfo.nickname;
      }else{
        return this.loginInfo.userName;
      }
    }
  }
}
</script>

<style>

</style>
