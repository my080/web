<template>
  <div id="app" class="body">
    <v-header v-if="!($route.name=='login'||$route.name=='bctj')"></v-header>
    <router-view></router-view>
    <!-- <v-footer></v-footer> -->
  </div>
</template>
<script>
  import Header from './components/header'
  // import Footer from './components/footer'

  export default {
    components: { 
    'v-header': Header,
    // 'v-footer': Footer,
    },
  }
</script>