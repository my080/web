<template>
  <div class="rjf">
    <div class="rjf-option ui-option">      
      <div class="option-right">
        <div class="option-item">
          <span class="count-num">
            共<b>{{tableData.length}}</b>条清单
          </span>
        </div>
      </div>
    </div>
    <div class="rjf-table">
      <v-table-grid :recordList="tableData" 
        :fieldList="fieldList" 
        :showRecNo="true"   
        :getEditStyle="getEditStyle"            
        :readOnly="false">      
      </v-table-grid>      
    </div>
  </div>
</template>
<script>  
  import gbqModel from '../assets/js/gbq.model.js';
  import tableGrid from 'components/tableGrid';

  export default {    
    mounted: function() {
      var vueObj = this;
      gbqModel().read(function(){
        vueObj.tableData = gbqModel().getBQItemMerge();
      });      
    },
    beforeDestroy: function() {            
      gbqModel().saveBQItemMerge(this.tableData, function(){
        gbqModel().commit();
      });
    },
    data() {
      return {        
        tableData: [],        
        fieldList: [
          {
            prop: 'code',
            label: '编码',            
            width: 180
          },
          {
            prop: 'description',
            label: '名称',
            width: 300
          },
          {
            prop: 'spec',
            label: '项目特征',
            width: 300
          },          
          {
            prop: 'unit',
            label: '单位',
            width: 110
          },                    
          {
            prop: 'RGF',
            label: '人工费',
            width: 110
          },
          {            
            prop: 'JXFC',
            label: '机械费',
            width: 110
          },          
          {
            prop: 'QTCLF',
            label: '其他材料费',
            width: 150
          }
        ],
      }
    },
    components: {      
      'v-table-grid': tableGrid,
    },
    methods: {
      getEditStyle(row, column){
        if(column.label == '编码' || column.label == '名称' || column.label == '单位' || column.label == '项目特征' || column.label == '综合单价'){
          return 'readonly';
        }else{
          return 'text';
        }
      },       
    },    
  }
</script>
