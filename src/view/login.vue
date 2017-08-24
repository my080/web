<template>
  <div class="login">
    <div class="login-form">
      <h1 class="logo"></h1>
      <p class="login-name">
        <input id="username" v-model="loginModel.username" type="text" placeholder="用户名">
        <label class="el-icon-personnel" for="username"></label>
      </p>
      <p class="login-password">
        <input id="password" v-model="loginModel.password" @keyup.enter="submit" type="password" placeholder="密码">
        <label class="el-icon-password" for="password"></label>
      </p>
      <p class="login-option">
        <span class="option-left">
          <el-checkbox v-model="checked" checked>记住账号</el-checkbox>
        </span>
        <span class="option-right">
          <a class="forget-password" target="_blank" href="https://account.glodon.com/forgetInit">忘记登录密码</a>
        </span>
      </p>
      <p class="login-submit">
        <el-button type="primary" @click="submit" size="large">登  录</el-button>
      </p>
    </div>
  </div>
</template>
<script>
  import request from '../assets/js/gbq.request.js'

  export default {
    data(){
      return {        
        loginModel: {
          username: '',
          password: ''
        },
        checked: true
      }
    },
    methods:{
      submit: function () {
        if (this.checked) {
          setCookie('username',this.loginModel.username,365);
        } else {
          delCookie('username');
        };
        var vueThisObj = this;
        request().login(this.loginModel.username, this.loginModel.password, 
          function(data){            
            // 路由跳转            
            vueThisObj.$router.push('/home');
          }, 
          function(data){
            vueThisObj.$message({
              message: '帐号或密码错误！',
              type: 'error'
            });
          });        
      }
    },
    mounted:function() {
      this.loginModel.username = getCookie('username');      
    },
  };
  // 设置Cookie
  function setCookie(name,value,expiredays){
    var exdate=new Date();
    exdate.setDate(exdate.getDate()+expiredays);
    document.cookie=name+ "=" +escape(value)+
    ((expiredays==null) ? "" : ";expires="+exdate.toGMTString());
  };
  // 获取Cookie
  function getCookie(name){
    var arrstr = document.cookie.split("; ");
    for(var i = 0;i < arrstr.length;i ++){
      var temp = arrstr[i].split("=");
      if(temp[0] == name) {
        return unescape(temp[1])
      };
    }
  }
  // 清除Cookie
  function delCookie(name) {
    var exdate = new Date();
    exdate.setTime(exdate.getTime() + (-1 * 24 * 60 * 60 * 1000));
    var cookieVal = getCookie(name);
    document.cookie = name + "=" + cookieVal + "; expires=" + exdate.toGMTString();
  }
</script>
<style>
</style>