<template>  
  <el-table :data="records" border highlight-current-row @row-dblclick="selectRow">
    <el-table-column property="code" label="费用代码">
      <template scope="scope">
        <div class="readonly">
          <p>{{scope.row.code}}</p>
        </div>
      </template>
    </el-table-column>
    <el-table-column property="description" label="费用名称">
      <template scope="scope">
        <div class="readonly">
          <p>{{scope.row.description}}</p>
        </div>
      </template>
    </el-table-column>
    <el-table-column v-if="showValue" property="value" label="费用金额">
      <template scope="scope">
        <div class="readonly">
          <p>{{scope.row.value}}</p>
        </div>
      </template>
    </el-table-column>
  </el-table> 
</template>

<script>  
  export default {
    name:'costCode',
    props: ['records', 'showValue', 'selectCode'],                
    mounted: function(){      
    },
    data: function(){
      return {                          
      }
    },  
    methods: {          
      selectRow: function(row){
        this.selectCode(row.code);
      },        
    },
  }
</script>
