<template>
    <div class="clear" style="margin-left:20pt">
      <br />
      <div class="option-right">
        <div class="option-item">
          <span class="font-red">以下清单存在材料损耗为空或者工料机含量为0的情况,请仔细检查</span>
        </div>
      </div>
      <br />
      <div>
        <v-table-grid 
          ref="table"     
          @after-update="afterUpdate">
        </v-table-grid>
      </div>
    </div> 
</template>

<script>
  import gbqModel from '../assets/js/gbq.model.js';
  import tableGrid2 from 'components/tableGrid2';
  import { bus } from '../assets/js/gbq.eventbus.js';

  export default { 
    name: 'invalidItem',
    created: function() {
      var vueObj = this;
      bus.$on('update-items', function(){
        vueObj.getView(); 
      });
    },
    mounted: function(){
      var vueObj=this;
      gbqModel().read(function(data) {           
        vueObj.getView();        
      });
    },    
    components: { 
      'v-table-grid': tableGrid2
    },
    data: function(){
      return {   
        tableData: [],                      
        catalog: '',      
        fieldList: [
          {
            prop: 'code',
            label: '编码',
            width: 100
          },
          {
            prop: 'description',
            label: '名称',
            width: 200
          },
          {
            prop: 'spec',
            label: '项目特征',
            width: 250
          },
          {
            prop: 'unit',
            label: '单位',
            width: 40
          },
          {
            prop: 'isWasteRateEmpty',
            label: '损耗率为空',
            width: 70
          },
          {
            prop: 'isUsageEmpty',
            label: '含量为0',
            width: 70
          }],
      }
    },
    methods: {     
      getView: function(){
        this.tableData = gbqModel().checkBQItems();
        this.$refs.table.$emit('show-grid', this.tableData, this.fieldList, this.getEditStyle, false,this.getAlignment);
      },
      getEditStyle(row, prop){
        if (prop=='isWasteRateEmpty'||prop=='isUsageEmpty') {
          return 'readonlyCheck'
        }
        if (prop=='code'||prop=='description'){
          return 'text';
        }
        return 'readonly';
      },
      getAlignment(row, prop) {
        if (prop=='unit'||prop=='isWasteRateEmpty'||prop=='isUsageEmpty') {
          return 'htCenter htMiddle';
        }
        return 'htLeft';
      },
      afterUpdate: function(row, prop){ 
      }
    },
  }
</script>

