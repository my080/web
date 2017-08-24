<template>
  <div class="bbfx">
    <iframe id="show-iframe" ref="iframe" src="" ></iframe>
  </div>
</template>
<script>
  import gbqModel from '../assets/js/gbq.model.js';

  export default {
    mounted: function(){
      var oIframe = document.getElementById('show-iframe');      
      var deviceWidth = document.documentElement.clientWidth;
      var deviceHeight = document.documentElement.clientHeight;
      oIframe.style.width = deviceWidth + 'px';
      oIframe.style.height = deviceHeight + 'px';
      oIframe.src = "http://element.eleme.io/#/zh-CN";
    },
    data(){
      return {
      }
    },
    methods:{            
    }
  }
</script>