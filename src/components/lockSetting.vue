<template>
  <div class="clear">
    <div class="option-left" style="margin-bottom:10px">
      <div class="option-item">
        <el-button class="btn" v-on:click="doSelectAll()"><i class="el-icon-copy el-icon--left"></i>全选</el-button>
        <el-button class="btn" v-on:click="doUnselectAll()"><i class="el-icon-move el-icon--left"></i>全不选</el-button>
      </div>
    </div>
    <div class="clear" >
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
    name: 'lockSetting',
    props: ['tableData', 'fieldList', 'lockCheckField'],
    created: function() {
      var vueObj = this;
      bus.$on('update-locksetting', function(){
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
        catalog: ''
      }
    },
    methods: {
      doSelectAll: function(){
        var vueObj = this;
        this.tableData.forEach(function(item){
          for (var prop in vueObj.lockCheckField) {
            item[vueObj.lockCheckField[prop]] = true;
          }
        });
        gbqModel().save(function(){
          vueObj.getView();
        });
      },
      doUnselectAll: function(){
        var vueObj = this;
        this.tableData.forEach(function(item){
         for (var prop in vueObj.lockCheckField) {
            item[vueObj.lockCheckField[prop]] = false;
          }
        });
        gbqModel().save(function(){
          vueObj.getView();
        });
      },
      currentRowNo: function(){
        return this.tableData.indexOf(this.currentRecord());
      },
      selected: function(){
        return this.$refs.table.getSelected();
      },
      currentRecord: function(){
        return this.$refs.table.getCurrentRecord();
      },      
      getView: function(){
        if (this.$refs.table) {
          this.$refs.table.$emit('show-grid', this.tableData, this.fieldList, this.getEditStyle, true, this.getAlignment);
        }
      },
      getAlignment(row, prop) {
        if (prop == 'unit' || this.lockCheckField.indexOf(prop) >= 0) {
          return 'htCenter htMiddle';
        }

        return 'htLeft';
      },
      getEditStyle(row, prop){
        if(prop===undefined||this.lockCheckField.indexOf(prop)==-1) {
          return 'readonly';
        } else {
          return 'check';
        }
      },
      setCurrentRow: function (row) {
        this.$refs.table.$emit('set-current-row', row);
      },
      afterUpdate: function(row, prop){ 
        for (var i = this.currentRowNo()+1; i < this.tableData.length; i++) {
          if (this.tableData[i].level > row.level) {
            this.tableData[i][prop] = row[prop];
          } else {
            break;
          }
        }
        var vueObj = this;
        gbqModel().save(function(){
          vueObj.getView();
        });
      }
    },
  }
</script>
