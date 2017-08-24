<template>
  <ul>
    <template v-for="item in rightmenu">
      <li @click="clickMenu(item.fn)" v-if="!item.children">{{item.label}}</li>
      <template v-else>
        <li class="subMenu" onclick="event.stopPropagation()">{{item.label}}
          <rightmenu :rightmenu="item.children" @click-menu="rightMenuFn"></rightmenu>
        </li>
      </template>
    </template>
  </ul>
</template>

<script>  
  export default {
    name:'rightmenu',
    props:['rightmenu'],
    methods: {
      clickMenu(fn){        
        this.$emit('click-menu', fn);
      },
      rightMenuFn(fn){
        this.$emit('click-menu', fn);
      },
    }
  }

  $(function(){
    $("body").click(function(){
      hideRightMenu();
    });
  });

  function hideRightMenu(){
    $(".contextMenu").hide();
  }
</script>