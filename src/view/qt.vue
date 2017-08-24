<template>
  <div class="qt">
    <div class="sidebar">
      <div class="class-edit-item">
          <el-button class="btnNewClass" v-on:click="newClass"><i class="el-icon-add el-icon--left"></i>新建费用
          </el-button>
          <el-button class="btnDeleteClass"  v-on:click="deleteClass"><i class="el-icon-delete el-icon--left"></i>删除</el-button>
      </div>

      <el-menu default-active="0" @select="selectOtherItemClass">
          <el-menu-item class="root-item" :index="String(rootItem.id)" :title="rootItem.description"><i class="el-icon-project"></i>{{rootItem.description}}</el-menu-item>
          <el-menu-item v-for="item in otherItemClass" :index="String(item.id)" :title="item.description"><i class="el-icon-project" ></i>{{item.description}}</el-menu-item>
      </el-menu>
    </div>
    <div class="content">
      <div class="qt-option ui-option">
        <div class="option-left">
          <div class="option-item">
            <el-dropdown menu-align="start" trigger="click" @command="insertRec">
              <el-button class="btn">
                <i class="el-icon-insert el-icon--left"></i>插入<i class="el-icon-caret-bottom el-icon--right"></i>
              </el-button>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item class="insertOtherItem" command="item">插入项</el-dropdown-item>
                <el-dropdown-item class="insertChildOtherItem" command="child">插入子项</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </div>
          <div class="option-item">
            <el-button class="btnDelete" v-on:click="deleteRec"><i class="el-icon-delete el-icon--left"></i>删除</el-button>
          </div>
          <div class="option-item">
            <el-button class="btnMoveUp"  v-on:click="moveUp"><i class="el-icon-Onthearrow el-icon--left"></i>上移</el-button>
          </div>
          <div class="option-item">
            <el-button class="btnMoveDown"  v-on:click="moveDown"><i class="el-icon-downarrow el-icon--left"></i>下移</el-button>
          </div>
        </div>
        <div class="option-right">
          <div class="option-item">
            <span class="count-num">
              共<b>{{otherItem.length}}</b>条清单
            </span>
          </div>
        </div>
      </div>
      <v-table-grid
        ref="table"
        :recordList="otherItem"
        :fieldList="fieldList"
        :showRecNo="true"
        :asTree="true"
        :getEditStyle="getEditStyle"
        @row-contextmenu="contextMenu"
        @selection-change="gridSelectionChange"
        @after-update="afterUpdate"
        @current-change="currentChange">
      </v-table-grid>
    </div>

    <!--新建分类输入框dialog start-->
    <el-dialog title="新建" custom-class="newClassDialog" v-model="dialogNewClassVisible" >
      <div class="ui-option">
        <template  class="option-left">
          <div class="option-item">新建费用：</div>
        </template>
        <div class="option-item">
            <el-input class="ui-w200"
              v-model="newClassValue" >
            </el-input>
          </div>
      </div>
      <div class="ui-option">
        <template  class="option-left">
          <div class="option-item">英文缩写：</div>
        </template>
        <div class="option-item">
            <el-input class="ui-w200" readonly
              v-model="baseAmount">
            </el-input>
          </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="addNewClass">确定</el-button>
        <el-button @click="dialogNewClassVisible = false">取消</el-button>
      </span>
    </el-dialog>
    <!--内容刷dialog end-->

    <!-- 右键菜单组件 -->
    <div class="contextMenu otherItem" oncontextmenu=return(false)>
      <v-rightmenu :rightmenu="menusList" @click-menu="rightMenuFn"></v-rightmenu>
    </div>
  </div>
</template>
<script>
  import commJs from "../assets/js/gbq.utils_b.js";
  import rightMenu from 'components/rightMenu';
  import { bus } from '../assets/js/gbq.eventbus.js';
  import gbqModel from '../assets/js/gbq.model.js';
  import tableGrid from 'components/tableGrid';

  export default {    
    beforeDestroy(){      
      gbqModel().commit();
    },
    mounted: function() {
      var vueObj=this;
      gbqModel().read(function(data){
        vueObj.getOtherItemClass();
        vueObj.curClass = vueObj.rootItem;
        vueObj.getFields();
        vueObj.getOtherItem();
      });
    },
    components: {
      'v-table-grid': tableGrid,
      'v-rightmenu': rightMenu,
    },
    data(){
      return {
        selected: [],
        otherItemClass: [],
        curClass: '',
        fieldList: [],
        otherItem: [],        
        currentRowNo: -1,
        dialogNewClassVisible: false,
        newClassValue: '',
        baseAmount: "",
        rootItem: [],
        menusList:
        [
          {
            label:'插入',
            fn: '',
            children: [
              {
                label:'插入项',
                fn: ['insertRec', 'item']
              },
              {
                label:'插入子项',
                fn: ['insertRec', 'child']
              }
            ]
          },
          {
            label:'删除',
            fn: ['deleteRec']
          },
        ],
      }
    },
    watch: {
      newClassValue: function(value, event) {
        this.baseAmount = commJs().pinYin(this.newClassValue);
      }
    },
    methods:{
      contextMenu(row, event) {                    
        $(".contextMenu").css({"left":event.clientX,"top":event.clientY}).show();
      },
      getOtherItemClass(){
        var vueObj = this;
        this.otherItemClass = gbqModel().getView('otherItemClass').filter(function(item){
          if (item.description == "其他项目") {
            vueObj.rootItem = item;
          } 
          return item.description != "其他项目";
        });
      },
      getFields(){
        if(this.curClass.description=='零星项目'){
          this.fieldList = [
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
              prop: 'rate',
              label: '单价',
              width: 100
            },
            {
              prop: 'quantity',
              label: '数量',
              width: 100
            },
            {
              prop: 'total',
              label: '金额',
              width: 100
            },
          ]
        }else{
          this.fieldList = [
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
              prop: 'baseAmount',
              label: '计算基数',
              width: 100
            },
            {
              prop: 'ratio',
              label: '费率',
              width: 100
            },
            {
              prop: 'total',
              label: '金额',
              width: 100
            },
          ]
        };
      },
      getOtherItem(){
        var vueObj = this;
        this.otherItem = gbqModel().getView('otherItem').filter(function(item){
          return item.classID == vueObj.curClass.id;
        });
      },
      // 点击左边树节点响应函数
      selectOtherItemClass(key, keyPath){
        for(var i=0;i<this.otherItemClass.length;i++){
          if(this.otherItemClass[i].id==key){
            this.curClass = this.otherItemClass[i];
            break;
          } else {
            this.curClass = this.rootItem;
          }
        }
        this.getFields();
        this.getOtherItem();
      },
      // 右键菜单
      contextMenu(row, event) {
        this.contextMenuData = row;
        $(".contextMenu.otherItem").css({"left":event.clientX,"top":event.clientY}).show();
      },
      // 右键菜单fn
      rightMenuFn: function(fn){
        if(fn){
          this[fn[0]](fn[1],fn[2]);
        }
      },
      // 插入项/插入子项
      insertRec: function(command){  //插入
        var classID = this.curClass.id;
        var pid = null;
        var recno = -1;
        var vueObj = this;
        if(command=='item'){
          if(this.currentRowNo >= 0){
            pid = this.otherItem[this.currentRowNo].pid;
            recno = this.currentRowNo;  
          }        
          gbqModel().insertOtherItem(classID, pid, recno + 1, function(){
            vueObj.getOtherItem();
          });           
        }else{
          // 自动展开当前记录
          this.$refs.table.$emit('set-row-collapse', this.currentRowNo, false);
          if(this.currentRowNo >= 0){
            pid = this.otherItem[this.currentRowNo].id;
            recno = this.currentRowNo + 1;  
            gbqModel().insertOtherItem(classID, pid, recno + 1, function(){
              vueObj.getOtherItem();
            });
          }else{
            this.$message({message: '先选择项目才能插入子项!', type: 'info'});
          }           
        }        
      },
      deleteRec: function(){
        var vueObj = this;
        gbqModel().delOtherItem(this.selected, function(){
          vueObj.selected = [];
          vueObj.getOtherItem();
        });
      },
      // 新建分类按钮点击
      newClass: function(){
        this.dialogNewClassVisible = true;
      },
      // 删除分类按钮点击
      deleteClass: function(){
        var vueObj = this;
        if (this.curClass.description == "其他项目") {
          this.$message({message: '“其他项目”不能删除！', type: 'info'});
          return;
        }
        gbqModel().delOtherItemClass(this.curClass.id, function(){
          vueObj.getOtherItemClass();
          if(vueObj.otherItemClass.length > 0){
            vueObj.curClass = vueObj.otherItemClass[0];
            vueObj.getFields();
            vueObj.getOtherItem();
          }else{
            vueObj.curClass = vueObj.rootItem;
            vueObj.getFields();
            vueObj.getOtherItem();
          }          
        })
      },
      //新建分类
      addNewClass: function(){
        this.dialogNewClassVisible = false;
        var vueObj = this;
        gbqModel().insertOtherItemClass(vueObj.newClassValue, vueObj.baseAmount, function(){
          vueObj.getOtherItemClass();
          for(var i=0;i<vueObj.otherItemClass.length;i++){
            if(vueObj.otherItemClass[i].description == vueObj.newClassValue){
              vueObj.curClass = vueObj.otherItemClass[i];
              break;
            }
          }
          vueObj.getFields();
        });
      },
      moveUp: function(){
        var vueObj = this;
        if (this.selected.length > 1) {
            this.$message({message: '已选中多行无法上移!', type: 'info'});
            return;
        }
        var row = vueObj.tableData[vueObj.currentRowNo];
        gbqModel().moveUp('otherItem', vueObj.currentRowNo, true, function(data, dst){
          vueObj.getView();
          vueObj.setCurrentRow(row);
          vueObj.currentRowNo = vueObj.tableData.indexOf(row);
        });
      },
      moveDown: function(){
        var vueObj = this;
        if (vueObj.selected.length > 1) {
          this.$message({message: '已选中多行无法下移!', type: 'info'});
          return;
        }
        var row = vueObj.tableData[vueObj.currentRowNo];
        gbqModel().moveDown('otherItem', vueObj.currentRowNo, true, function(data, dst){
          vueObj.getView();
          vueObj.setCurrentRow(row);
          vueObj.currentRowNo = vueObj.tableData.indexOf(row);
        });
      },
      setCurrentRowno: function(row){
        this.$refs.table.$emit('set-current-row', row);
      },
      getEditStyle(row, column) {
        return 'text';
      },
      afterUpdate(row, field){
        gbqModel().save();
      },
      currentChange(currentRow){
        this.currentRowNo = this.otherItem.indexOf(currentRow);
      },
      gridSelectionChange: function(selection){
        this.selected = selection;
      },
    },
  }
</script>
