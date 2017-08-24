<template>
  <div class="cs">
    <div class="cs-option ui-option">
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
          <el-dropdown menu-align="start" trigger="click" @command="insertRecord">
            <el-button class="btn">
              <i class="el-icon-insert el-icon--left"></i>插入<i class="el-icon-caret-bottom el-icon--right"></i>
            </el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="title">分部</el-dropdown-item>
              <el-dropdown-item command="measure">措施项</el-dropdown-item>
              <el-dropdown-item command="submeasure">子措施项</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
        <div v-if="toolbar.queryBQDB" class="option-item">
          <el-button class="btn" @click="queryBQDB"><i class="el-icon-querylist el-icon--left"></i>查询定额库</el-button>
        </div>
        <div v-if="toolbar.moveUp" class="option-item">
          <el-button class="btn" @click="doMoveUp()"><i class="el-icon-Onthearrow el-icon--left"></i>上移</el-button>
        </div>
        <div v-if="toolbar.moveDown" class="option-item">
          <el-button class="btn" @click="doMoveDown()"><i class="el-icon-downarrow el-icon--left"></i>下移</el-button>
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
    <div class="cs-table">
      <v-table-grid :recordList="tableData"
        ref="table"        
        @header-click="headClick"
        @after-update="afterUpdate"                
        @row-contextmenu="contextMenu">
      </v-table-grid>

      <!--查询清单库dialog start-->
      <el-dialog title="查询清单库" custom-class="commListDialog" v-model="dialogBQQuery" size="tiny" @close="bqQueryDialogClose">
        <v-bq-query  ref="bqQuery" v-on:afterInsert="insertMeasureItem"></v-bq-query>
      </el-dialog>
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
        var bidNode=gbqModel().getView('bidNode');
        commJs().addBidNodeFields('quantity', bidNode, vueObj.fieldList);
        commJs().addBidNodeFields('total', bidNode, vueObj.fieldList);        
        vueObj.getView();        
      });
    },
    components: {
      'v-rightmenu': rightMenu,
      'v-bq-query': bqQuery,
      'v-table-grid': tableGrid2
    },
    data: function(){
      return {
        permission: '',        
        clipboard: [],
        isCut: false,
        tableData: [],                
        contextMenuData: '',  //右键菜单选中行数据
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
        menusList: [],
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
            edit: false,
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
            width: 100
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
          },
        ],
        hideQuantity: false,
        hideTotal: false,
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
                  fn: ['insertRecord', 'title']
                },
                {
                  label:'措施',
                  fn: ['insertRecord', 'measure']
                },
                {
                  label:'子措施',
                  fn: ['insertRecord', 'submeasure']
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
      bqQueryDialogClose: function() {
        this.$refs.bqQuery.clearMultiSelection();
      },
      headClick: function(property){
        var vueObj = this;        
        var field = null;
        this.fieldList.some(function(item){
          if(item.prop==property){
            field = item;
            return true;
          }else{
            return false;
          }            
        });

        if(property=='quantity'){
          this.hideQuantity = !this.hideQuantity;                   
          field.label = this.hideQuantity?'工程量 <<':'工程量 >>';
          this.fieldList.forEach(function(item){
            if(item.prop&&item.prop.indexOf('quantity_')==0){
              item.label = vueObj.hideQuantity?'':item.description;
              item.childList.forEach(function(child){
                child.label = vueObj.hideQuantity?'':child.description;
                child.width = vueObj.hideQuantity?1:80;
              })
              item.width = vueObj.hideQuantity?1:80;;
            }
          })
        }else if(property=='total'){
          this.hideTotal = !this.hideTotal;    
          field.label = this.hideTotal?'金额 <<':'金额 >>';      
          this.fieldList.forEach(function(item){
            if(item.prop&&item.prop.indexOf('total_')==0){
              item.label = vueObj.hideTotal?'':item.description;
              item.childList.forEach(function(child){
                child.label = vueObj.hideTotal?'':child.description;
                child.width = vueObj.hideTotal?1:80;
              })
              item.width = vueObj.hideTotal?1:80;
            }
          })
        }else if(property&&(property.indexOf('quantity_')==0||property.indexOf('total_')==0)){          
          if(field&&field.childList&&field.childList.length>0){
            field.collapse = !field.collapse;
            field.label = field.collapse?field.description + ' <<':field.description + ' >>';
            field.childList.forEach(function(child, idx){
              if(idx < field.childList.length - 1){
                child.label = field.collapse?'':child.description;
                child.width = field.collapse?1:80;   
              }              
            })
          }
        }   
        this.getView();        
      },
      getView: function(){
        this.tableData = gbqModel().getView('measureItem');
        this.$refs.table.$emit('show-grid', this.tableData, this.fieldList, this.getEditStyle, true, this.getAlignment, 0);
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
          gbqModel().pasteItem('measureItem', this.clipboard, this.currentRowNo(), this.isCut, 
            function(){
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
        gbqModel().moveUp('measureItem', vueObj.currentRowNo(), true, function(data, dst){
          vueObj.getView();
          vueObj.setCurrentRow(row);          
        });
      },
      doMoveDown: function(){
        var vueObj = this;
        if (vueObj.selected().length > 1) {
          this.$message({message: '已选中多行无法下移!', type: 'info'});
          return;
        }
        var row = vueObj.currentRecord();
        gbqModel().moveDown('measureItem', vueObj.currentRowNo(), true, function(data, dst){
          vueObj.getView();
          vueObj.setCurrentRow(row);          
        });
      },
      getAlignment(row, prop) {
        if (prop=='unit') {
          return 'htCenter htMiddle';
        }
        if (prop=='quantity'||prop=='rate'||prop=='total'||prop.indexOf('quantity_')==0) {
          return 'htRight';
        }
        return 'htLeft';
      },       
      getEditStyle(row, prop){
        if (!row||!prop) {
          return 'readonly';
        }
        
        if (row.type == '分部') {
          if (this.permission == 'gf') {
            return 'readonly';
          }
          if (prop=='code' || prop=='description'||prop=='remark') {
            return 'text';
          } else {
            return 'readonly';
          }
        }

        if (prop=='total') {
          return 'readonly';
        }

        if (prop=='code'|| prop=='unit'||prop=='description') {
          if (row.isInStore) {
            return 'readonly';  
          } 
          if (this.permission=='gf'){
            return 'readonly';
          } else {
            return 'text';
          }
        }

        if (prop=='remark') {
          return 'text';
        }

        if (prop=='rate') {
          if (row.childCount > 0) {
            return 'readonly';
          } else {
            return 'text';
          }
        }

        if (prop=='spec') {
            if (this.permission == 'gf') {
            return 'readonly';
          } else {
            return 'text';
          }
        }

        if (prop=='quantity'||prop.indexOf('quantity_')==0) {
          if (this.permission=='gf'||row.childCount > 0) {
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
      doDelete: function (type) {   //删除表格数据
        var vueObj = this;
        vueObj.$confirm('是否确认删除？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          gbqModel().delMeasureItem(vueObj.selected(), function(){            
            vueObj.getView();            
          });
        });
      },
      insertRecord: function(command,type){  //插入        
        var vueObj = this;
        var selected = vueObj.selected();
        if (vueObj.selected.length > 1) {
          vueObj.$message({message: '无法进行多行插入!', type: 'info'});
          return;
        }
        var currentRow = vueObj.currentRecord();                
        var rowno = vueObj.currentRowNo();
        // 插入分部
        if(command=='title'){
          // 如果当前行不为空则插入同级分部
          if(currentRow){
            if(currentRow.type=='分部'){              
              var insertIdx = commJs().nextSibling(vueObj.tableData, rowno);
              gbqModel().insertMeasureItemTitle(insertIdx, function(){
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
            gbqModel().insertMeasureItemTitle(-1, function(){
              vueObj.getView();
              vueObj.setCurrentRow(vueObj.tableData[vueObj.tableData.length - 1]);              
            });
          }
        }else{          
          // 插入措施和子措施          
          if(currentRow){            
            if(currentRow.type=='清单'){              
              if(command=='measure'){ 
                // 插入同级措施
                var insertIdx = commJs().nextSibling(vueObj.tableData, rowno);
                gbqModel().insertMeasureItem(insertIdx, currentRow.pid, currentRow.itemType, function(){
                  vueObj.getView();
                  vueObj.setCurrentRow(vueObj.tableData[insertIdx]);
                });  
              }else{
                if (currentRow.itemType=='子措施') {
                    this.$message({
                    message: '子措施下不能再插入子措施！',
                    type: 'info'
                  });
                  return;
                }
                // 插入子措施
                // 自动展开当前记录
                this.$refs.table.$emit('set-row-collapse', currentRow, false);
                
                // 插入子措施需要将父措施的单价和工程量清空
                currentRow.rate = null;
                for (var prop in currentRow) {
                  if (prop.indexOf("quantity") == 0) {
                    currentRow[prop] = null;
                  }
                }

                gbqModel().insertMeasureItem(rowno + 1, currentRow.id, '子措施', function(){
                  vueObj.getView();
                  vueObj.setCurrentRow(vueObj.tableData[rowno + 1]);
                });  
              }              
            }else{
              if(command=='measure'){ // 分部下插入措施
                // 自动展开当前记录
                this.$refs.table.$emit('set-row-collapse', currentRow, false);
                gbqModel().insertMeasureItem(rowno + 1, currentRow.id, '措施', function(){
                  vueObj.getView();
                  vueObj.setCurrentRow(vueObj.tableData[rowno + 1]);
                });  
              }else{
                this.$message({
                  message: '分部下不能插入子措施！',
                  type: 'info'
                });
              }
            }
          }else{            
            if(vueObj.tableData.length==0){
              gbqModel().insertMeasureItem(-1, null, '措施', function(){
                vueObj.getView();               
              }); 
            }else{
              this.$message({
                message: '请选中一条记录后再插入！',
                type: 'info'
              });
            }
          }
        }
      },
      insertMeasureItem: function(item, lmmDetail, rateDict, rateDetail){
        var vueObj = this;
        var recno, pid, itemType;
        var rowno = this.currentRowNo();
        var record = this.currentRecord();
        if(record){
          if(record.type == '分部'){
            // 自动展开当前记录
            this.$refs.table.$emit('set-row-collapse', record, false);
            pid = record.id;
            recno = rowno + 1;
            itemType = '措施';
          }else{
            pid = record.pid;
            recno = commJs().nextSibling(vueObj.tableData, rowno);
            itemType = record.itemType; 
          }           
        }
        else{
          recno = -1;
          pid = null;
        }
        gbqModel().insertMeasureItemFromDB(item, lmmDetail, rateDict, rateDetail, recno, pid, itemType, function(){
          vueObj.getView();
          vueObj.setCurrentRow(vueObj.tableData[recno]);
        });
      },
      rightMenuFn: function(fn){
        if(fn){
          this[fn[0]](fn[1],fn[2]);
        }
      },
      setCurrentRow: function(row){
        this.$refs.table.$emit('set-current-row', row);
      },      
      afterUpdate: function(row, prop){
        var vueObj = this;

        if(prop=='quantity'||prop.indexOf('quantity_')==0||prop=='rate'){
          if (isNaN(parseFloat(row[prop]))) {
            row[prop] = 0;
          }
          row[prop] = parseFloat(row[prop]);
        }

        if(prop=='quantity'){
          var bidNode=gbqModel().getView('bidNode');
          bidNode.forEach(function(item){
            row['quantity_' + item.id] = null;
          });
        }else if(prop.indexOf('quantity_')==0){
          gbqModel().sumByBidNode(row, gbqModel().getView('bidNode'), 'quantity');
        }
        
        gbqModel().save(function(){
          vueObj.getView();
        });
      }
    },
  }

</script>
