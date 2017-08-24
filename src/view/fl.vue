<template>
  <div class="fl">
    <div class="sidebar">
      <el-menu default-active="0" @select="selectDict">
        <el-menu-item v-for="item in rateDict" :index="String(item.id)" :title="item.description"><i class="el-icon-project" ></i>{{item.description}}</el-menu-item>
      </el-menu>
    </div>
    <div class="content">
      <div class="fl-option ui-option">
        <div class="option-left">
          <div v-if="toolbar.insert" class="option-item">
            <el-button class="btn" @click="insertRecord"><i class="el-icon-insert el-icon--left"></i>插入</el-button>
          </div>
          <div v-if="toolbar.delete" class="option-item">
            <el-button class="btn" @click="deleteRecord"><i class="el-icon-delete el-icon--left"></i>删除</el-button>
          </div>
          <div v-if="toolbar.moveUp" class="option-item">
            <el-button class="btn" @click="moveUpRecord"><i class="el-icon-Onthearrow el-icon--left"></i>上移</el-button>
          </div>
          <div v-if="toolbar.moveDown" class="option-item">
            <el-button class="btn" @click="moveDownRecord"><i class="el-icon-downarrow el-icon--left"></i>下移</el-button>
          </div>
        </div>
      </div>
      <div class="fl-table">
        <v-table-grid
          ref="table"                    
          @editButton-click="editButtonclick"
          @after-update="afterUpdate"
        >
        </v-table-grid>
      </div>

      <!--费用代号dialog start-->
      <el-dialog title="费用代号" v-model="dialogCostCode" :top="dialogTop">
        <v-cost-code       
          :records="macros"
          :showValue="false"
          :selectCode="selectMacro"
         ></v-cost-code>
      </el-dialog>
      <!--费用代号dialog end-->
    </div>
  </div>
</template>
<script>
  import gbqModel from '../assets/js/gbq.model.js';
  import tableGrid2 from 'components/tableGrid2';
  import ruleEngine from "../assets/js/gbq.ruleEngine.js";
  import costCode from "components/costCode";
  import request from '../assets/js/gbq.request.js';

  export default {
    beforeDestroy: function(){
      gbqModel().commit();
    },
    mounted: function() {
      var vueObj=this;
      gbqModel().read(function(data){
        vueObj.permission = request().getLoginInfo().permission;
        vueObj.updateToolbar();
        vueObj.addLockedField();
        vueObj.getRateDict();
        if(vueObj.rateDict.length > 0){
          vueObj.rateDictID = vueObj.rateDict[0].id;
          vueObj.getRateDetail();
        }        
      });
    },
    components: {
      'v-table-grid': tableGrid2,
      'v-cost-code': costCode,
    },
    data() {
      return {
        permission: '',
        macros: [],
        macroCode: [],
        dialogCostCode: false,
        dialogTop: '15%',        
        tableData: [],        
        rateDict: [],
        rateDictID: -1, 
        toolbar: {
          insert: false,
          delete: false,
          moveUp: false,
          moveDown: false
        },                      
        fieldList: [
          {
            prop: 'rateCode',
            label: '费用代号',
            width: 70
          },
          {
            prop: 'code',
            label: '编码',
            width: 140
          },
          {
            prop: 'description',
            label: '名称',
            width: 200
          },
          {
            prop: 'baseAmount',
            label: '计算基数',
            width: 200
          },
          {
            prop: 'baseAmountRemark',
            label: '基数说明',
            width: 200
          },
          {
            prop: 'ratio',
            label: '费率',
            width: 50
          },
          {
            prop: 'remark',
            label: '备注',
            width: 100
          },
          {
            prop: 'rateType',
            label: '费用类别',
            width: 100,
            options: [{
                value: '人工费',                
              }, {
                value: '主材费',                
              }, {
                value: '机械辅材费',                
              },{
                value: '综合取费',                
              },{
                value: '税金',                
              },{
                value: '综合单价',                
              }
            ],
          },
        ],
      }
    },
    methods: {
      updateToolbar: function() {
        if (this.permission == 'gf') {
          this.toolbar.insert = false;
          this.toolbar.delete = false;
          this.toolbar.moveUp = false;
          this.toolbar.moveDown = false;
        } else {
          this.toolbar.insert = true;
          this.toolbar.delete = true;
          this.toolbar.moveUp = true;
          this.toolbar.moveDown = true;
        }
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
      selectMacro(code){
        var record = this.currentRecord();
        if(record.baseAmount&&record.baseAmount.length>0){
          record.baseAmount = record.baseAmount + '+' + code;  
        }else{
          record.baseAmount = code;  
        }     
        this.afterUpdate();
      },
      editButtonclick(clientY, row, prop){ 
        this.dialogTop = (clientY + 20) + 'px';       
        this.dialogCostCode = true;
      },
      selectDict(index, indexPath) {
        this.rateDictID = parseInt(index);
        this.getRateDetail();
      },
      getRateDetail(){
        var vueObj = this;        
        this.tableData = gbqModel().getView('rateDetail').filter(function(item){          
          return item.rateDictID == vueObj.rateDictID;
        });                
        this.macros = gbqModel().getMacro('rateDetail', this.tableData);
        this.macros.forEach(function(item){
          if(item.type=='sys'){
            vueObj.macroCode.push(item.code);
          }
        });       
        this.$refs.table.$emit('show-grid', this.tableData, this.fieldList, this.getEditStyle, false, this.getAlignment);
      },
      insertRecord() {
        var vueObj = this;
        var record = this.currentRecord();        
        var row = this.currentRowNo();
        if (record) {          
          var nidx = gbqModel().getView('rateDetail').indexOf(record);
          gbqModel().inertRateDetail(this.rateDictID, nidx + 1, function(){
            vueObj.getRateDetail();
            vueObj.setCurrentRow(vueObj.tableData[row + 1]);
          });
        } else {
          gbqModel().inertRateDetail(this.rateDictID, -1, function(){
            vueObj.getRateDetail();
            vueObj.setCurrentRow(vueObj.tableData[vueObj.tableData.length - 1]);
          });
        }
      },
      deleteRecord() {
        // 判断是否能删除
        var codeList = [];
        var vueObj = this;
        var selected = this.selected();
        selected.forEach(function(record){
          if(record.rateCode!=null&&record.rateCode.length>0){
            codeList.push(record.rateCode);
          }
        });
        var exprList = [];
        this.tableData.forEach(function(record){
          if(selected.indexOf(record)==-1&&record.baseAmount!=null&&record.baseAmount.length>0){
            exprList.push(record.baseAmount);  
          }          
        });
        if(!gbqModel().isCodeUsed(codeList, exprList)){
          gbqModel().delRateDetail(vueObj.rateDictID, selected, function(){            
            vueObj.getRateDetail();
          });
        }else{
          vueObj.$message({message: '选中行被其他计算基数引用，无法删除!', type: 'info'});
        }
      },
      moveUpRecord: function(){
        var vueObj = this;
        if (this.selected().length > 1) {
            this.$message({message: '已选中多行无法上移!', type: 'info'});
            return;
        }
        var row = vueObj.currentRecord();
        gbqModel().moveUp('rateDetail', vueObj.currentRowNo(), true, function(data, dst){
          vueObj.getRateDetail();
          vueObj.setCurrentRow(row);          
        });
      },
      moveDownRecord: function(){
        var vueObj = this;
        if (vueObj.selected().length > 1) {
          this.$message({message: '已选中多行无法下移!', type: 'info'});
          return;
        }
        var row = vueObj.currentRecord();
        gbqModel().moveDown('rateDetail', vueObj.currentRowNo(), true, function(data, dst){
          vueObj.getRateDetail();
          vueObj.setCurrentRow(row);          
        });
      },
      getRateDict() {
        this.rateDict = gbqModel().getView('rateDict');
      },
      getAlignment(row, prop) {
        if (prop=='ratio'||prop=='locked') {
          return 'htCenter htMiddle';
        }
        return 'htLeft';
      },  
      getEditStyle(row, prop) {
        if (!row||!prop) {
          return 'readonly';
        }

        if (prop=='locked') {
          if (this.permission == 'mb') {
            return 'check';
          }
        }

        if (row.locked) {
          return 'readonly';
        } 

        if (prop=='baseAmountRemark') {
          return 'readonly';
        }

        if (prop=='description'||prop=='rateType'||prop=='rateCode'||prop=='code') {
          if (this.permission == 'gf') {
            return 'readonly';
          } else {
            return 'text';
          }
        }

        if (prop == 'baseAmount') {
          if (this.permission == 'gf') {
            return 'readonly';
          } else {
            return 'editButton';
          }
        } 

        if (prop=='ratio'||prop=='remark') {
          return 'text';
        }

        return 'readonly';
      },
      afterUpdate(row, field, oldValue){
        var vueObj = this;
        if (field == 'rateCode') {
          if (!row[field].match("^[A-Z][A-Za-z0-9]*$")) {
            row[field] = oldValue;
            gbqModel().save(function(){
              vueObj.getRateDetail();
            }); 
            vueObj.$message({message: '费用代号只能由大写字母开头，由字母数字构成', type: 'error'});
            return;
          }

          var count = 0; 
          this.tableData.forEach(function(item){
            if (item[field] == row[field]) {
              count++;
            }
          });
          if (count > 1) {
            row[field] = oldValue;
            gbqModel().save(function(){
              vueObj.getRateDetail();
            }); 
            vueObj.$message({message: '费用代码不能重复', type: 'error'});
            return;
          }
        }

        if(field=='ratio'){
          if (isNaN(parseFloat(row[field]))) {
            row[field] = 0;
          }
          row[field] = parseFloat(row[field]);
        }

        // 检查合法的计算基数
        var [result, info] = gbqModel().compileCalcTable(this.tableData, 'rateCode', 'baseAmount', 
          'ratio', 'total_expr', this.macroCode);        
        if(result){
          gbqModel().buildBaseAmountRemark(this.tableData, 'baseAmount', 'baseAmountRemark', this.macros);
          gbqModel().save(function(){
            vueObj.getRateDetail();
          });          
        }else{
          row[field] = oldValue;          
          gbqModel().save(function(){
            vueObj.getRateDetail();
          });
          vueObj.$message({message: info + '，修改已撤销！', type: 'error'});
        }
      },      
      setCurrentRow(row) {
        this.$refs.table.$emit('set-current-row', row);
      },
      addLockedField() {
        if (this.permission == 'mb') {
          this.fieldList.push({ prop: 'locked', label: '锁定', width: 50, align:'center', visible:'true'});
        }
      },
    },
  }
</script>
