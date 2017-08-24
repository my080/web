// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import App from './App';
import VueRouter from 'vue-router';
// 引入ElementUI
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-default/index.css';
// 引入Jquery
import $ from 'jquery';
// 导入样式
import './assets/css/common.scss';
// 定义路由
import Login from './view/login';
import Home from './view/home';
import GCGK from './view/gcgk';
import FBFX from './view/fbfx';
import RJF from './view/rjf';
import CL from './view/cl';
import FL from './view/fl';
import CS from './view/cs';
import QT from './view/qt';
import FYHZ from './view/fyhz';
import BBFX from './view/bbfx';
import XMHF from './view/xmhf';
import LXXM from './view/lxxm';
import MC from './view/mc';
import TSF from './view/tsf'
import QTXM from './view/qtxm'
import XZBD from './view/xzbd'
import BCTJ from './view/bctj'


Vue.use(VueRouter);
Vue.use(ElementUI);

const router = new VueRouter({
  linkActiveClass: 'active',
  routes : [
    // 登录
    {
      path : '/login',
      name: 'login',
      component : Login
    },
    // 首页
    {
      path : '/home',
      name: 'home',
      component : Home
    },
    // 工程概况
    {
      path : '/gcgk',
      name: 'gcgk',
      component : GCGK
    },
    // 分部分项清单
    {
      path : '/fbfx',
      name: 'fbfx',
      component : FBFX
    },
    // 门窗量填报
    {
      path : '/mc',
      name: 'mc',
      component : MC
    },
    // 人机费清单
    {
      path : '/rjf',
      name: 'rjf',
      component : RJF
    },
    // 材料清单
    {
      path : '/cl',
      name: 'cl',
      component : CL
    },
    // 费率清单
    {
      path : '/fl',
      name: 'fl',
      component : FL
    },
    // 措施清单
    {
      path : '/cs',
      name: 'cs',
      component : CS
    },
    // 其他项目
    {
      path : '/qt',
      name: 'qt',
      component : QT
    },
    // 费用汇总
    {
      path : '/fyhz',
      name: 'fyhz',
      component : FYHZ
    },
    // 报表分析
    {
      path : '/bbfx',
      name: 'bbfx',
      component : BBFX
    },
    // 项目划分
    {
      path : '/xmhf',
      name: 'xmhf',
      component : XMHF
    },
    // 零星清單
    {
      path : '/lxxm',
      name: 'lxxm',
      component : LXXM
    },
    // 土石方
    {
      path : '/tsf',
      name: 'tsf',
      component : TSF
    },
    // 其他項目
    {
      path : '/qtxm',
      name: 'qtxm',
      component : QTXM
    },
    // 线重表单
    {
      path : '/xzbd',
      name: 'xzbd',
      component : XZBD
    },
    {
      path : '/bctj',
      name: 'bctj',
      component : BCTJ
    },
    // 重定向
    { 
      path: '/', 
      redirect: '/login' 
    },
    { 
      path: '*', 
      redirect: '/' 
    },
  ]
});

/* eslint-disable no-new */
var app = new Vue({
  el: '#app',
  router,
  template: '<App/>',
  components: { App }
})