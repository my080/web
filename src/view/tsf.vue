<template>
  <div class="fbfx">
    <div class="fbfx-option ui-option">
      <div class="option-left">
        <div v-if="toolbar.copy" class="option-item">
          <el-button class="btn" v-on:click="doCopy()"><i class="el-icon-copy el-icon--left"></i>复制</el-button>
        </div>
        <div v-if="toolbar.cut" class="option-item">
          <el-button class="btn" v-on:click="doCut()"><i class="el-icon-cut el-icon--left"></i>剪切</el-button>
        </div>
        <div v-if="toolbar.paste" class="option-item">
          <el-button class="btn" v-on:click="doPaste()"><i class="el-icon-paste el-icon--left"></i>粘贴</el-button>
        </div>
        <div v-if="toolbar.delete" class="option-item">
          <el-button class="btn" v-on:click="doDelete()"><i class="el-icon-delete el-icon--left"></i>删除</el-button>
        </div>
        <div v-if="toolbar.insert" class="option-item">
          <el-dropdown menu-align="start" trigger="click" @command="insertTitle">
            <el-button class="btn">
              <i class="el-icon-insert el-icon--left"></i>插入<i class="el-icon-caret-bottom el-icon--right"></i>
            </el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="title">分部</el-dropdown-item>
              <el-dropdown-item command="subtitle">子分部</el-dropdown-item>
              <el-dropdown-item command="item">项</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
        <div v-if="toolbar.queryBQDB" class="option-item">
          <el-button class="btn" @click="queryBQDB"><i class="el-icon-querylist el-icon--left"></i>查询定额库</el-button>
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
      <div class="option-right">
          <div class="option-item">
            <span class="count-num">
              共<b>{{ tableData.length }}</b>条清单
            </span>
          </div>
        </div>
    </div>
  <div class="fbfx-table">
    <v-table-grid :recordList="tableData"
      ref="table"      
      @after-update="afterUpdate"            
      @row-contextmenu="contextMenu">
    </v-table-grid>

    <!--查询清单库dialog start-->
    <el-dialog title="查询定额库" custom-class="commListDialog" v-model="dialogBQQuery" size="tiny" @close="bqQueryDialogClose">
      <v-bq-query  ref="bqQuery" v-on:afterInsert="insertBQItem"></v-bq-query>
    </el-dialog>
    <!--查询清单库dialog end-->
  </div>
    

  <!-- 右键菜单组件 -->
  <div class="contextMenu" oncontextmenu=return(false)>
    <v-rightmenu :rightmenu="menusList" @click-menu="rightMenuFn"></v-rightmenu>
  </div>

</div>
</template>

<script>
  import rightMenu from 'components/rightMenu';
  import bqQuery from 'components/bqQuery';
  import gbqModel from '../assets/js/gbq.model.js';
  import tableGrid2 from 'components/tableGrid2';
  import { bus } from '../assets/js/gbq.eventbus.js';
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
        vueObj.updateToolbar();
        vueObj.buildMenu();
        vueObj.getView();
      });
    },    
    components: {
      'v-rightmenu': rightMenu,
      'v-bq-query': bqQuery,      
      'v-table-grid': tableGrid2,
    },
    data: function(){
      return {
        permission: '',         
        clipboard: [],
        isCut: false,
        tableData: [],                
        dialogBQQuery: false,  //清单库dialog
        toolbar: {
          copy: false,
          paste: false,
          cut: false,
          delete: false,
          insert: false,
          queryBQDB: false,
          moveUp: false,
          moveDown: false
        },        
        menusList:[],
        fieldList: [
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
            prop: 'spec',
            label: '项目特征',
            width: 300
          },
          {
            prop: 'unit',
            label: '单位',
            width: 40
          },
          {
            prop: 'quantity',
            label: '工程量',
            width: 80
          },
          {
            prop: 'rate',
            label: '综合单价',
            width: 80
          },
          {
            prop: 'total',
            label: '综合合价',
            width: 80
          },          
          {
            prop: 'remark',
            label: '备注',
            width: 150
          }          
        ]
      }
    },
    methods: {
      updateToolbar: function() {
        if (this.permission == 'gf') {
          for (var prop in this.toolbar) {
            this.toolbar[prop] = false;
          }
        } else {
          for (var prop in this.toolbar) {
            this.toolbar[prop] = true;
          }
        }
      },
      buildMenu: function() {
        if (this.permission == 'gf') {
          this.menusList = [];
        } else {
          this.menusList = [
            {
              label:'复制',
              fn: ['doCopy']
            },
            {
              label:'剪切',
              fn: ['doCut']
            },
            {
              label:'粘贴',
              fn: ['doPaste']
            },
            {
              label:'删除',
              fn: ['doDelete']
            },
            {
              label:'插入',
              fn: '',
              children: [
                {
                  label:'分部',
                  fn: ['insertTitle', 'title']
                },
                {
                  label:'子分部',
                  fn: ['insertTitle', 'subtitle']
                },
                {
                  label:'项',
                  fn: ['insertTitle', 'item']
                }
              ]
            }
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
      bqQueryDialogClose: function() {
        this.$refs.bqQuery.clearMultiSelection();
      },   
      getView: function(){
        this.tableData = gbqModel().getView('tsf');
        console.log(this.tableData);
        this.$refs.table.$emit('show-grid', this.tableData, this.fieldList, this.getEditStyle, true, this.getAlignment);
      },
      doCopy: function(){
        this.clipboard = this.selected();
        this.isCut = false;
      },
      doCut: function(){
        this.clipboard = this.selected();
        this.isCut = true;
      },
      doPaste: function(){
        var record = this.currentRecord();
        if(this.clipboard.length>0&&record){
          var vueObj = this;            
          gbqModel().pasteItem('tsf', this.clipboard, this.currentRowNo(), this.isCut, function(){
            vueObj.getView();          
          });
        }
      },
      doMoveUp: function(){
        var vueObj = this;
        if (this.selected().length > 1) {
            this.$message({message: '已选中多行无法上移!', type: 'info'});
            return;
        }
        var row = vueObj.currentRecord();
        if(row){
          gbqModel().moveUp('tsf', vueObj.currentRowNo(), true, function(data, dst){
            vueObj.getView();
            vueObj.setCurrentRow(row);          
          });  
        }        
      },
      doMoveDown: function(){
        var vueObj = this;
        if (vueObj.selected().length > 1) {
          this.$message({message: '已选中多行无法下移!', type: 'info'});
          return;
        }
        var row = vueObj.currentRecord();
        if(row){
          gbqModel().moveDown('tsf', vueObj.currentRowNo(), true, function(data, dst){
            vueObj.getView();
            vueObj.setCurrentRow(row);          
          });  
        }        
      },
      getAlignment(row, prop) {
        if (prop=='unit') {
          return 'htCenter htMiddle';
        }
        if (prop=='rate'||prop=='quantity'||prop=='total') {
          return 'htRight';
        }
        return 'htLeft';
      },       
      getEditStyle(row, prop){
        if (!row||!prop) {
          return 'readonly';
        }
        
        if (row.type=='分部') {
          if (this.permission == 'gf') {
            return 'readonly';
          } 
          if (prop=='code' || prop=='description'||prop=='remark') {
            return 'text';
          } else {
            return 'readonly';
          }
        }

        if (prop=='remark'||prop=='rate') {
          return 'text';
        }

        if (prop=='total') {
          return 'readonly';
        }
        
        if (prop=='code'||prop=='description'||prop=='unit') {
          if (row.isInStore) {
            return 'readonly';  
          } 
          if (this.permission=='gf') {
            return 'readonly';
          } else {
            return 'text';
          } 
        }

        if (prop=='quantity'||prop=='spec') {
          if (this.permission == 'gf') {
            return 'readonly';
          } else {
            return 'text';
          }
        }

        return 'readonly';
      },      
      contextMenu(event) {                   
        $(".contextMenu").css({"left":event.clientX,"top":event.clientY}).show();
      },
      queryBQDB: function(){
        this.dialogBQQuery = true;
      },
      doDelete: function () {   //删除表格数据
        var vueObj = this;
        var selected = vueObj.selected();
        if(selected.length>0){
          vueObj.$confirm('是否确认删除？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            gbqModel().deleteItems('tsf', selected, function(){              
              vueObj.getView();              
            });
          });
        }        
      },
      insertTitle: function(command){  //插入        
        var vueObj = this;
        if (vueObj.selected().length > 1) {
          vueObj.$message({message: '无法进行多行插入!', type: 'info'});
          return;
        }
        // 插入分部
        var record = this.currentRecord();
        var rowno = this.currentRowNo();
        if(command=='title'){
          // 如果当前行不为空则插入同级分部
          if(record){
            if(record.type=='分部'){
              var newTitle = {};
              newTitle.pid = record.pid;
              newTitle.level = record.level;
              newTitle.type = '分部';
              var insertIdx = commJs().nextSibling(this.tableData, rowno);
              gbqModel().insertTitle('tsf', newTitle, insertIdx, function(){
                vueObj.getView();
                vueObj.setCurrentRow(vueObj.tableData[insertIdx]);
              });
            }else{
              this.$message({
                message: '请选中分部再点击插入！',
                type: 'info'
              });
            }
          }else{
            var newTitle = {};
            newTitle.pid = null;
            newTitle.level = 0;
            newTitle.type = '分部';
            gbqModel().insertTitle('tsf', newTitle, -1, function(){
              vueObj.getView();
              vueObj.setCurrentRow(vueObj.tableData[vueObj.tableData.length - 1]);
            });
          }
        } else if (command == 'subtitle') { // 插入子分部
          if(record&&record.type=='分部'&&record.itemType=='子分部'){
            // 自动展开当前记录
            this.$refs.table.$emit('set-row-collapse', record, false);
            var newTitle = {};
            newTitle.pid = record.id;
            newTitle.level = record.level + 1;
            newTitle.type = '分部';
            newTitle.itemType='子分部';
            gbqModel().insertTitle('tsf', newTitle, rowno + 1, function(){
              vueObj.getView();
              vueObj.setCurrentRow(vueObj.tableData[rowno + 1]);
            });
          }else{
            this.$message({
              message: '只能在分部下插入子分部！',
              type: 'info'
            });
          }
        } else { // 插入项
          if(record) {            
            if(record.type=='清单') { // 插入同级项
              var insertIdx = commJs().nextSibling(vueObj.tableData, rowno);
              gbqModel().insertTsfItem(insertIdx, record.pid, function(){
                vueObj.getView();
                vueObj.setCurrentRow(vueObj.tableData[insertIdx]);
              });  
            } else {
                // 自动展开当前记录
              this.$refs.table.$emit('set-row-collapse', record, false);
              gbqModel().insertTsfItem(rowno + 1, record.id, function(){
                vueObj.getView();
                vueObj.setCurrentRow(vueObj.tableData[rowno + 1]);
              });  
            }
          } else {            
            if(vueObj.tableData.length==0){
              gbqModel().insertTsfItem(-1, null, function(){
                vueObj.getView();               
              }); 
            } else {
              this.$message({
                message: '请选中一条记录后再插入！',
                type: 'info'
              });
            }
          }  
        }
      },
      insertBQItem: function(bqItem, lmmDetail, rateDict, rateDetail){
        var vueObj = this;
        var recno, pid;
        var record = this.currentRecord();
        var rowno = this.currentRowNo();
        if(record){
          if(record.type == '分部'){
            // 自动展开当前记录
            this.$refs.table.$emit('set-row-collapse', record, false);
            pid = record.id;
            recno = rowno + 1;
          }else{
            pid = record.pid;
            recno = rowno + 1;
          }
        }else{
          recno = -1;
          pid = null;
        }
        gbqModel().insertTSFItemFromDB(bqItem, lmmDetail, rateDict, rateDetail, recno, pid, function(){
          vueObj.getView();
          vueObj.setCurrentRow(vueObj.tableData[recno]);
        });        
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
        var vueObj = this;
        if(prop=='quantity'||prop=='rate'){
          if (isNaN(parseFloat(row[prop]))) {
            row[prop] = 0;
          }
          row[prop] = parseFloat(row[prop]);
        }
        gbqModel().save(function(){
          vueObj.getView();
        });
      }
    },
  }

</script>

