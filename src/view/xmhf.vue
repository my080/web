<template>
  <div class="fbfx">
    <div class="fbfx-option ui-option">
      <div class="option-left">
        
        <div v-if="toolbar.delete" class="option-item">
          <el-button class="btn" v-on:click="doDelete()"><i class="el-icon-delete el-icon--left"></i>删除</el-button>
        </div>
        <div v-if="toolbar.insert" class="option-item">
          <el-dropdown menu-align="start" trigger="click" @command="insertTitle">
            <el-button class="btn">
          <i class="el-icon-insert el-icon--left"></i>插入<i class="el-icon-caret-bottom el-icon--right"></i>
          </el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="title">分类</el-dropdown-item>
              <el-dropdown-item command="subtitle">子分类</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
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
        <div v-if="toolbar.setCount" class="option-item">
          <el-button class="btn" v-on:click="showCountTable()">
            设置复数列
          </el-button>
        </div>        
      </div>  
    </div>    
  <div class="fbfx-table">
    <v-table-grid :recordList="tableData"
      ref="table"              
      @after-update="afterUpdate"          
      @row-contextmenu="contextMenu">
    </v-table-grid>   

    <!-- 右键菜单组件 -->
    <div class="contextMenu" oncontextmenu=return(false)>
      <v-rightmenu :rightmenu="menusList" @click-menu="rightMenuFn"></v-rightmenu>
    </div>
  </div>
  <!--复数列表 start-->
  <el-dialog title="复数列设置" custom-class="ContentBrushDialog" v-model="dialogCountTable">
    <v-list-grid :list="countTable"></v-list-grid>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" size="large" @click="setCountTable">确定</el-button>
      <el-button size="large" @click="dialogCountTable = false">取消</el-button>
    </div>
  </el-dialog>
  <!--复数列表 end-->
</div>
</template>

<script>
  import rightMenu from 'components/rightMenu';  
  import gbqModel from '../assets/js/gbq.model.js';    
  import tableGrid2 from 'components/tableGrid2';
  import listGrid from 'components/listGrid';
  import { bus } from '../assets/js/gbq.eventbus.js'
  import commJs from '../assets/js/gbq.utils_b.js';
  import request from '../assets/js/gbq.request.js';

  export default{
    beforeDestroy: function(){      
      gbqModel().commit();
    },
    mounted: function(){
      var vueObj=this;
      gbqModel().read(function(data){
        vueObj.permission = request().getLoginInfo().permission;
        vueObj.catalog = gbqModel().getCatalog();
        vueObj.updateToolbar();
        vueObj.buildMenu();
        vueObj.getView();
      });
    },    
	components: {
      'v-rightmenu': rightMenu,      
      'v-table-grid': tableGrid2,
      'v-list-grid': listGrid,
    },
    data: function(){
      return {
        dialogCountTable: false,
        countTable: [],        
        tableData: [],                              
        menusList: [],
        fieldList: [],
        toolbar: {
          insert: true,
          delete: true,
          moveUp: true,
          moveDown: true,
          setCount: true
        },
        permission: '',
        catalog: '',
      }
    },
    methods: {
      updateToolbar: function() {
        if (this.permission == 'gf') {
          this.toolbar.insert = false;
          this.toolbar.delete = false;
          this.toolbar.moveUp = false;
          this.toolbar.moveDown = false;
          this.toolbar.setCount = false;
        } else {
          this.toolbar.insert = true;
          this.toolbar.delete = true;
          this.toolbar.moveUp = true;
          this.toolbar.moveDown = true;
          this.toolbar.setCount = this.catalog == '精装修工程' ? true : false;
        }
      },
      buildMenu: function() {
        if (this.permission == 'gf') {
          this.menusList = [];
        } else {
          this.menusList = [          
            {
              label:'删除',
              fn: ['doDelete']
            },
            {
              label:'插入',
              fn: '',
              children: [
                {
                  label:'分类',
                  fn: ['insertTitle', 'title']
                },
                {
                  label:'子分类',
                  fn: ['insertTitle', 'subtitle']
                }
              ]
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
      showCountTable: function(){
        this.countTable = gbqModel().getView('countTable').slice(0);
        this.dialogCountTable = true;
      },      
      buildFields: function(){
        this.fieldList = [];
        this.fieldList.push({prop: 'code',label: '序号',width: 200});
        this.fieldList.push({prop: 'description',label: '名称',width: 200});
        var vueObj = this;
        this.countTable.forEach(function(item, index){
          vueObj.fieldList.push({prop:'count_'+index, label:item.description, width: 100});
        });
        if (this.countTable.length > 0) {
          this.fieldList.push({prop: 'count',label: '复数',width: 100});  
        }
      },
      isFieldExist: function(field) {
        for (var i = this.fieldList.length - 1; i >= 0; i--) {
          if (this.fieldList[i].prop == field) {
            return true;
          }
        }
        return false;
      },
      recalcCount: function() {
        var vueObj = this;
        this.tableData.forEach(function(item){
          item.count = 0;
          for (var prop in item) {
            if (prop.indexOf('count_') == 0) {
              console.log(prop);
              if (vueObj.isFieldExist(prop)) {
                item.count = item.count + parseFloat(item[prop]);
              } else {
                delete item[prop];
              }
            }
          }
        });
      },
      setCountTable: function(){
        var vueObj = this;
        gbqModel().setView('countTable', this.countTable);
        this.buildFields();
        this.recalcCount();
        this.dialogCountTable = false;        
        gbqModel().save(function(){
          vueObj.getView();
        });
      },
      getView: function(){
        this.countTable = gbqModel().getView('countTable');
        this.tableData = gbqModel().getView('bidNode');
        this.buildFields();
        this.$refs.table.$emit('show-grid', this.tableData, this.fieldList, this.getEditStyle, true);
      },      
      doMoveUp: function(){
        var vueObj = this;
        if (this.selected.length > 1) {
            this.$message({message: '已选中多行无法上移!', type: 'info'});
            return;
        }        
        var record = vueObj.currentRecord();
        gbqModel().moveUp('bidNode', vueObj.currentRowNo(), true, function(data, dst){
          vueObj.getView();      
          vueObj.setCurrentRow(record);    
        });
      },
      doMoveDown: function(){
        var vueObj = this;
        if (vueObj.selected.length > 1) {
          this.$message({message: '已选中多行无法下移!', type: 'info'});
          return;
        }        
        var record = vueObj.currentRecord();
        gbqModel().moveDown('bidNode', vueObj.currentRowNo(), true, function(data, dst){
          vueObj.getView();          
          vueObj.setCurrentRow(record);
        });
      },
      getEditStyle(row, prop){ 
        if (this.permission=='gf') {
          return 'readonly';
        }       
        if(prop&&prop.indexOf('count')==0){          
          return row.pid==null?'text':'readonly';
        }else{
          return 'text';  
        }        
      },      
      contextMenu(event) {                
        $(".contextMenu").css({"left":event.clientX,"top":event.clientY}).show();
      },      
      doDelete: function () {   //删除表格数据
        var vueObj = this;
        vueObj.$confirm('是否确认删除？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          gbqModel().delBidNode(vueObj.selected(), function(){            
            vueObj.getView();            
          });
        });
      },
      insertTitle: function(command){  //插入        
        var vueObj = this;
        if (vueObj.selected&&vueObj.selected.length > 1) {
          vueObj.$message({message: '无法进行多行插入!', type: 'info'});
          return;
        }
        // 插入分部
        var current = this.currentRecord();
        var row = this.currentRowNo();
        if(command=='title'){
          // 如果当前行不为空则插入同级分部
          if(current){
            if(current.pid==null){
              var newTitle = {};
              newTitle.pid = null;
              newTitle.level = 0;
              newTitle.fullDescription = '';
              if(this.countTable.length==0){
                newTitle.count = 1;  
              }                 
              var insertIdx = commJs().nextSibling(this.tableData, row);      
              gbqModel().insertBidNode(newTitle, insertIdx, function(){
                vueObj.getView();
                vueObj.setCurrentRow(vueObj.tableData[insertIdx]);
              });
            }else{
              this.$message({
                message: '请选中分类再点击插入！',
                type: 'info'
              });
            }
          }else{
            var newTitle = {};
            newTitle.pid = null;
            newTitle.level = 0;            
            if(this.countTable.length==0){
              newTitle.count = 1;  
            }
            newTitle.fullDescription = '';
            gbqModel().insertBidNode(newTitle, -1, function(){
              vueObj.getView();              
              vueObj.setCurrentRow(vueObj.tableData[vueObj.tableData.length - 1]);
            });
          }
        }
        // 插入子分部
        else{
          if(current){
            var newTitle = {};
            if(current.pid==null){
              newTitle.pid = current.id;   
              // 自动展开当前记录
              this.$refs.table.$emit('set-row-collapse', current, false);             
            }else{
              newTitle.pid = current.pid;  
            }
            newTitle.level = 1;                        
            gbqModel().insertBidNode(newTitle, row + 1, function(){
              vueObj.getView();
              vueObj.setCurrentRow(vueObj.tableData[row + 1]);
            });
          }else{
            this.$message({
              message: '只能在分类下插入子分类！',
              type: 'info'
            });
          }

        }
      },      
      rightMenuFn: function(fn){            
        if(fn){
          this[fn[0]](fn[1],fn[2]);
        }
      },      
      setCurrentRow: function (row) {
        this.$refs.table.$emit('set-current-row', row);
      },
      afterUpdate: function(row, prop){ 
        // 数字字段增加校验
        if (prop.indexOf('count_')==0) {
          if (isNaN(parseFloat(row[prop]))) {
            row[prop] = 0;
          } 
          row[prop] = parseFloat(row[prop]);
        }

        // 计算count
        var vueObj = this;
        if(row&&this.countTable.length>0){
          row.count = 0;
          this.fieldList.forEach(function(item){
            if(item.prop.indexOf('count_')==0&&row[item.prop]){
              row.count = row.count + parseFloat(row[item.prop]);
            }
          });
        }

        // 增加修改fullDescription字段, 为报表数据源服务
        if (prop=='description') {
          if (row.pid) {
            // 找到父修改自己的fullDescription
            for (var i = 0; i < this.tableData.length; i++) {
              if (this.tableData[i].id == row.pid) {
                row['fullDescription'] = this.tableData[i].description + row.description;
                break;
              }
            }
          } else { // 修改自己的子的fullDescription
            row.fullDescription = row.description;
            var idx = this.tableData.indexOf(row)+1;
            while (idx < this.tableData.length) {
              if (this.tableData[idx].level > row.level) {
                this.tableData[idx]['fullDescription'] = row.description + this.tableData[idx].description;
                idx++;
              } else {
                break;
              }
            }
          }
        }

        gbqModel().save(function(){
          vueObj.getView();
        });
      }
    },
  }

</script>

