<template>
    <div class="clear" >
      <div class="option-right">
        <div class="option-item">
          <span class="font-red">以下清单存在材料损耗为空或者工料机含量为0的情况,请仔细检查核对,以免影响投标!!!</span>
        </div>
      </div>
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
            width: 160
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
            label: '计量单位',
            width: 70
          }],
      }
    },
    methods: {     
      getView: function(){
        this.tableData = gbqModel().checkBQItems();
        this.$refs.table.$emit('show-grid', this.tableData, this.fieldList, this.getEditStyle, false);
      },
      getEditStyle(row, prop){
        return 'readonly';
      },
      afterUpdate: function(row, prop){ 
      }
    },
  }
</script>
