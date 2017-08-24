<template>
<div class="lmmDetail">
  <div class="ui-option">
    <div class="option-left">
        <div v-if="toolbar.queryResource" class="option-item">
          <el-button class="btn" v-on:click="queryResource()"><i class="el-icon-delete el-icon--left"></i>查询材料库</el-button>
        </div>          
        <div v-if="toolbar.delete" class="option-item">
          <el-button class="btn" v-on:click="deleteDetail()"><i class="el-icon-delete el-icon--left"></i>删除</el-button>
        </div>
        <div v-if="toolbar.moveUp" class="option-item">
          <el-button class="btn" v-on:click="doMoveUp()">
            <i class="el-icon-Onthearrow el-icon--left"></i>上移
          </el-button>
        </div>
        <div v-if="toolbar.moveDown" class="option-item" v-on:click="doMoveDown()">
          <el-button class="btn">
            <i class="el-icon-downarrow el-icon--left"></i>下移
          </el-button>
        </div>
    </div>
  </div>
  <v-table-grid 
    ref="table"           
    @after-update="afterUpdate"
    class="fbfx-table2">
  </v-table-grid>
  <!--查询材料dialog start-->
  <el-dialog ref="resDialog" title="查询材料库" custom-class="commListDialog" 
    v-model="dialogResQuery" size="tiny" >
    <v-res-query ref="resQuery" :bqItemID="bqItemID" :lmmdetailID="currentID" @after-command="afterResCommand"></v-res-query>
  </el-dialog>
  <!--查询清单库dialog end-->
</div>

</template>

<script>
  import gbqModel from "../assets/js/gbq.model.js"; 
  import resQuery from './resQuery'; 
  import tableGrid2 from 'components/tableGrid2';
  import request from '../assets/js/gbq.request.js';
  

  export default {    
    name:'lmmDetail',    
    components: {
      'v-res-query': resQuery,
      'v-table-grid': tableGrid2,
    },    
    mounted: function(){
      var vueObj = this;
      vueObj.buildFields();       
      this.$on('show-detail', function(bqItemID){        
        vueObj.bqItemID = bqItemID;
        vueObj.updateToolbar();
        vueObj.getView();
      });
    },
    data: function(){
      return {    
        dialogResQuery: false,
        fieldList: [],
        bqItemID: -1, 
        currentID: -1,           
        tableData: [],
        permission: '',
        catalog: '',
        toolbar: {
          queryResource: false,
          delete: false,
          moveUp: false,
          moveDown: false
        },        
      }
    },    
    methods: {
      buildFields: function() {
        this.permission = request().getLoginInfo().permission;
        this.catalog = gbqModel().getCatalog(); 
        this.fieldList = [
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
            label: '规格型号',
            width: 300
          },
          {
            prop: 'brand',
            label: '品牌',
            width: 200
          },
          {
            prop: 'unit',
            label: '单位',
            width: 110
          },
          {
            prop: 'usage',
            label: '含量',
            width: 80,            
          },
          {
            prop: 'quantity',
            label: '数量',
            width: 80,            
          }];
        if (this.catalog == '门窗工程'||this.catalog=='幕墙工程'||this.catalog=='保温涂料工程') {
          this.fieldList.push({
            prop: 'wasteRate',
            label: '损耗率',
            width: 80,            
            });
        }
        this.fieldList.push({
            prop: 'rate',
            label: '单价',
            width: 80,            
          }); 
      },
      updateToolbar: function(){
        if (this.bqItemID == -1 || this.permission == 'gf') {
          for (var prop in this.toolbar) {
            this.toolbar[prop] = false;
          }
        } else {
          for (var prop in this.toolbar) {
            this.toolbar[prop] = true;
          }
        }
      },
      setCurrentRow: function (row) {
        this.$refs.table.$emit('set-current-row', row);
      },
      getIndex: function(record){
        var lmmDetail = gbqModel().getView("lmmDetail");
        var result = -1;
        lmmDetail.some(function(item, index){
          if(item.id==record.id){
            result = index;
            return true;
          }
        });
        return result;
      },
      doMoveUp: function(){
        var vueObj = this;
        var selected = this.selected();
        var record = this.currentRecord();
        if(selected.length > 1) {
            this.$message({message: '已选中多行无法上移!', type: 'info'});
            return;
        }
        if(record){
          var index = this.getIndex(record);
          var order = this.tableData.indexOf(record);
          if(order>0){
            gbqModel().moveUp('lmmDetail', index, false, function(){
              vueObj.getView();
              vueObj.setCurrentRow(vueObj.tableData[order - 1]);   
            });    
          }          
        }                
      },
      doMoveDown: function(){
        var vueObj = this;
        var selected = this.selected();
        var record = this.currentRecord();
        if(selected.length > 1) {
            this.$message({message: '已选中多行无法上移!', type: 'info'});
            return;
        }        
        if(record){
          var index = this.getIndex(record);
          var order = this.tableData.indexOf(record);          
          if(order<this.tableData.length - 1){
            gbqModel().moveDown('lmmDetail', index, false, function(){
              vueObj.getView();
              vueObj.setCurrentRow(vueObj.tableData[order + 1]);   
            });    
          }          
        }       
      },
      selected: function(){
        return this.$refs.table.getSelected();
      },
      deleteDetail: function(){
        var vueObj = this;
        var selected = this.selected();
        if (selected && selected.length > 0) {
          vueObj.$confirm('是否确认删除？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            gbqModel().delLmmDetail(selected, function(){            
              vueObj.getView();
              vueObj.$emit('refresh');            
            });
          });          
        }
      },
      afterResCommand: function(){
        this.getView();
        var record = this.currentRecord();
        if(record){
          this.currentID = this.currentRecord().id;          
        }
        this.$emit('refresh');
      },
      currentRecord: function(){
        return this.$refs.table.getCurrentRecord();
      },
      queryResource: function(){
        var record = this.currentRecord();
        if(record){
          this.currentID = this.currentRecord().id;          
        }
        this.dialogResQuery = true;
      },
      afterUpdate: function(row, prop){
        var vueObj = this;
        if(prop=='usage'){
          if (isNaN(parseFloat(row[prop]))) {
            row[prop] = 0;
          }
          row[prop] = parseFloat(row[prop]);
        }
        gbqModel().updateLmmDetail(row, function(){
          vueObj.getView();
          vueObj.$emit('refresh');
        })
      },
      getView: function(){
        this.tableData = gbqModel().getLmmDetailView(this.bqItemID);                  
        this.$refs.table.$emit('show-grid', this.tableData, this.fieldList, this.getEditStyle, false);
      },
      getEditStyle: function(row, prop){
        if (!row||!prop) {
          return 'readonly';
        }

        if(prop=="usage"){
          if (this.permission == 'gf') {
            if (!row.isUsageEmpty) {
              return 'readonly';
            } else {
              return 'text';
            }
          }
          return "text";
        }else{
          return "readonly";
        }
      }
    },    
  }

</script>
