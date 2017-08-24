<template>
  <div class="fyhz">
    <div class="cs-option ui-option">
      <div class="option-left">
        <div v-if="toolbar.insert" class="option-item">
          <el-button class="btn btnInsert"
                     v-on:click="insertRec">
            <i class="el-icon-insert el-icon--left"></i>插入
          </el-button>
        </div>
        <div v-if="toolbar.delete" class="option-item">
          <el-button class="btn btnDelete"
                     v-on:click="deleteRec"><i class="el-icon-delete el-icon--left"></i>删除</el-button>
        </div>
        <div v-if="toolbar.moveUp" class="option-item">
          <el-button class="btn btnMoveUp"
                     v-on:click="moveUp"><i class="el-icon-Onthearrow el-icon--left"></i>上移</el-button>
        </div>
        <div v-if="toolbar.moveDown" class="option-item">
          <el-button class="btn btnMoveDown"
                     v-on:click="moveDown"><i class="el-icon-downarrow el-icon--left"></i>下移</el-button>
        </div>
      </div>
      <div class="option-right">
        <div class="option-item">
          <span class="count-num">
            共<b>{{tableData.length}}</b>条清单
          </span>
        </div>        
      </div>
    </div>
    <div class="fyhz-table">
      <v-table-grid 
        ref="table"          
        @editButton-click="editButtonclick"           
        @after-update="afterUpdate"
        @row-contextmenu="contextMenu">      
      </v-table-grid>
    </div>

    <!--费用代号dialog start-->
    <el-dialog title="费用代吗" v-model="dialogCostCode" :top="dialogTop">
      <v-cost-code       
        :records="macros"
        :showValue="true"
        :selectCode="selectMacro"
       ></v-cost-code>
    </el-dialog>
    <!--费用代号dialog end-->

    <!-- 右键菜单组件 -->
    <div class="contextMenu " oncontextmenu=return(false)>
      <v-rightmenu :rightmenu="menusList" @click-menu="rightMenuFn"></v-rightmenu>
    </div>
  </div>
</template>

<script>  
  import gbqModel from '../assets/js/gbq.model.js';
  import rightMenu from 'components/rightMenu';
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
        vueObj.buildFields();
        vueObj.updateToolbar();
        vueObj.buildMenu();
        vueObj.getSummary();
      }); 
    },
    components: {
      'v-rightmenu': rightMenu,    
      'v-table-grid': tableGrid2,
      'v-cost-code': costCode,
    }, 
    data() {
      return {
        permission: '',
        catalog:'',
        toolbar: {
          insert: true,
          delete: true,
          moveUp: true,
          moveDown: true
        },
        menusList:[],
        dialogTop: '15%',
        macros: [],
        macroCode: [],
        dialogCostCode: false,          
        tableData: [],        
        fieldList: [],        
      }
    },
    methods: {
      buildFields: function(){
        this.permission = request().getLoginInfo().permission;
        this.catalog = gbqModel().getCatalog();
        this.fieldList = [
          {
            prop: 'rateCode',
            label: '费用代号',            
            width: 100
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
            prop: 'total',
            label: '金额',
            width: 120
          },
          {
            prop: 'remark',
            label: '备注',
            width: 120
          }]; 
          var rateType = {
            prop: 'rateType',
            label: '费用类别',
            width: 110,
            options: [
              { 
                value: '分部分项费'
              }, 
              { 
                value: '措施费一'
              }, 
              {                
                value: '措施费二'
              },
            ],
          };
          if (this.catalog=='土建工程') {
            rateType.options.push({                
                value: '土石方'
              });            
          }
          if (this.catalog=='消防工程') {
            rateType.options.push({                
                value: '其他項目'
              });            
          }
          rateType.options.push({                
              value: '增值税'
            },
            {                
              value: '总造价'
            });
          this.fieldList.push(rateType);     
      },
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
      buildMenu: function() {
        if (this.permission == 'gf') {
          this.menusList = [
            {
              label:'上移',
              fn: ['moveUp']
            },
            {
              label:'下移',
              fn: ['moveDown']
            }];
        } else {
          this.menusList = [          
            {
              label:'插入',
              fn: ['insertRec']
            },
            {
              label:'删除',
              fn: ['deleteRec']
            },
            {
              label:'上移',
              fn: ['moveUp']
            },
            {
              label:'下移',
              fn: ['moveDown']
            },                   
          ];
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
      // 右键菜单fn
      rightMenuFn: function(fn){
        if(fn){
          this[fn[0]](fn[1],fn[2]);
        }
      },
      selectMacro(code){
        var record = this.currentRecord();
        if(record){
          if(record.baseAmount&&record.baseAmount.length>0){
            record.baseAmount = record.baseAmount + '+' + code;  
          }else{
            record.baseAmount = code;  
          }          
          this.afterUpdate();  
        }        
      },
      editButtonclick(clientY, row, prop){ 
        this.dialogTop = (clientY + 20) + 'px';       
        this.dialogCostCode = true;
      },
      getSummary(){
        var vueObj = this;
        this.tableData = gbqModel().getView('summary');        
        // 添加宏代码
        this.macros = gbqModel().getMacro('summary', this.tableData);  
        this.macros.forEach(function(item){
          if(item.type=='sys'){
            vueObj.macroCode.push(item.code);
          }
        });       
        this.$refs.table.$emit('show-grid', this.tableData, this.fieldList, this.getEditStyle, false, this.getAlignment);
      },
      contextMenu(event) {        
        $(".contextMenu").css({"left":event.clientX,"top":event.clientY}).show();
      },
      insertRec(command, type) {
        var vueObj = this;
        if (vueObj.selected().length > 1) {
          vueObj.$message({message: '无法进行多行插入!', type: 'info'});
          return;
        }
        var summary = {};    
        var rowno = vueObj.currentRowNo();    
        if (rowno>=0) {          
          gbqModel().insertSummary(summary, rowno + 1, function() {            
            vueObj.getSummary();
            vueObj.setCurrentRow(vueObj.tableData[rowno + 1]);
          });
        } else {                    
          gbqModel().insertSummary(summary, vueObj.tableData.length, function() {
            vueObj.getSummary();
            vueObj.setCurrentRow(vueObj.tableData[vueObj.tableData.length]);
          });
        }
      },
      deleteRec() {
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
          gbqModel().delSummary(selected, function(){            
            vueObj.getSummary();
          });
        }else{
          vueObj.$message({message: '选中行被其他计算基数引用，无法删除!', type: 'info'});
        }        
      },
      moveUp: function(){
        var vueObj = this;
        if (this.selected().length > 1) {
            this.$message({message: '已选中多行无法上移!', type: 'info'});
            return;
        }

        var row = vueObj.currentRecord();
        if(row){
          gbqModel().moveUp('summary', vueObj.currentRowNo(), true, function(data, dst){
            vueObj.getSummary();
            vueObj.setCurrentRow(row);             
          });  
        }        
      },
      moveDown: function(){
        var vueObj = this;
        if (vueObj.selected().length > 1) {
          this.$message({message: '已选中多行无法下移!', type: 'info'});
          return;
        }
        var row = vueObj.currentRecord();
        if(row){
          gbqModel().moveDown('summary', vueObj.currentRowNo(), true, function(data, dst){
            vueObj.getSummary();
            vueObj.setCurrentRow(row);              
          });  
        }        
      },
      getAlignment(row, prop) {
        if (prop=='ratio') {
          return 'htCenter htMiddle';
        }
        if (prop=='total') {
          return 'htRight';
        }
        return 'htLeft';
      }, 
      getEditStyle(row, prop) {
        if (!row||!prop) {
          return 'readonly';
        }
        if (this.permission == 'gf') {
          return 'readonly';
        }

        if(prop=='total'||prop=='baseAmountRemark'){
          return 'readonly';
        }else if(prop=='baseAmount'){
          return 'editButton';
        }else{
          return 'text';
        }
      },      
      afterUpdate(row, prop, oldValue){        
        var vueObj = this;
        if (prop == 'rateCode') {
          if (!row[prop].match("^[A-Z][A-Za-z0-9]*$")) {
            row[prop] = oldValue;
            gbqModel().save(function(){            
              vueObj.getSummary();                         
            }); 
            vueObj.$message({message: '费用代号只能由大写字母开头，由字母数字构成', type: 'error'});
            return;
          }

          var count = 0; 
          this.tableData.forEach(function(item){
            if (item[prop] == row[prop]) {
              count++;
            }
          });
          if (count > 1) {
            row[prop] = oldValue;
            gbqModel().save(function(){            
              vueObj.getSummary();                         
            }); 
            vueObj.$message({message: '费用代码不能重复', type: 'error'});
            return;
          }
        }

        if(prop=='ratio'){
          if (isNaN(parseFloat(row[prop]))) {
            row[prop] = 0;
          }
          row[prop] = parseFloat(row[prop]);
        }

        var [result, info] = gbqModel().compileCalcTable(this.tableData, 'rateCode', 'baseAmount', 
          'ratio', 'total_expr', this.macroCode);
        if(result){ 
          gbqModel().buildBaseAmountRemark(this.tableData, 'baseAmount', 'baseAmountRemark', this.macros);         
          gbqModel().save(function(){            
            vueObj.getSummary();                         
          });            
        }else{
          row[prop] = oldValue;
          gbqModel().save(function(){            
            vueObj.getSummary();                         
          }); 
          this.$message({message: info + '，修改已撤销！', type: 'error'});
        }        
      },      
      setCurrentRow: function (row) {
        this.$refs.table.$emit('set-current-row', row);
      }, 
    },      
  }

</script>