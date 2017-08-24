<template>
  <div>
    <div class="fbfx-option ui-option">
      <div class="option-item">
        <el-button class="btn" v-on:click="insert()">
          插入
        </el-button>
      </div>
      <div class="option-item">
        <el-button class="btn" v-on:click="del()">
          删除
        </el-button>
      </div>      
    </div>
    <el-table
      ref="grid"
      highlight-current-row
      @current-change="currentChange" 
      :data="list">
      <el-table-column
        prop="description"
        label="名称">
        <template scope="scope">
          <div class="edit">
            <el-input type="textarea" autosize v-model="scope.row.description"></el-input>
          </div>
        </template>
      </el-table-column>
    </el-table>    
  </div>
</template>

<script>
  export default {
    name:'listGrid',
    props: ['list'],    
    methods: {      
      insert: function (){
        this.list.splice(this.currentRowNo + 1, 0, {});
      },
      del: function(){
        this.list.splice(this.currentRowNo, 1);
      },     
      currentChange: function(currentRow){
        this.currentRowNo = this.list.indexOf(currentRow);             
      },
    },
    data: function(){
      return {   
        currentRowNo: -1,                      
      }
    },    
  }

</script>