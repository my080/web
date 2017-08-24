<!-- scoped lang="scss" -->
<style>
.home .card-list {
  width: 1220px;
}
.home .add-project {
  width: 816px;
  min-width: 816px;
}
.home .select-templet .templet-box li span {
    max-width: 6em;
}
.home .project-name {
  cursor: pointer;
}
</style>

<template>
  <div class="home">
    <div class="wrap">
      <div class="project-option ui-option">
        <div class="option-left">
          <div class="option-item">
            <span class="count-num">
              当前共有<b>{{items.length}}</b>个工程文件
            </span></div>
        </div>
        <div class="option-right">         
          <div class="option-item">
            <el-select class="ui-w120" v-model="timeFilter" placeholder="请选择" @change="filterChange">
              <el-option
                v-for="item in timeOptions"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
          </div>
          <div class="option-item">
            <el-input class="ui-w260"
              placeholder="关键字"
              icon="search"
              v-model="keyword"              
              @change="keywordChange">
            </el-input>
          </div>
          <div class="option-item">
            <el-button-group>
              <el-button title="卡片" class="switch current" @click="switchCart($event)"><i class="el-icon-menu"></i></el-button>
              <el-button title="列表" class="switch" @click="switchList($event)"><i class="el-icon-liest"></i></el-button>
            </el-button-group>
          </div>
        </div>
      </div>
      <div class="project-list" :class="[isCardList ? 'card-list' : 'table-list']">
        <div class="new-project project-item">
          <a href="javascript:void(0)" @click="permission=='mb'?newTemplet=true:(permission=='yz'?newProject=true:newTB=true)">
            <i class="el-icon-new"></i>
            <span v-if="permission=='mb'">新建模板</span>
            <span v-else-if="permission=='yz'">新建招标</span>
            <span v-else-if="permission=='gf'">新建投标</span>
          </a>
        </div>
        <dl v-for="(item, index) in items" class="project-item" :date-id="index">
          <dt><i class="el-icon-folder"></i><h2 class="project-name" @click="openProject(item)">{{item.description}}</h2></dt>          
          <dd class="project-author"><i class="el-icon-personnel card-icon"></i>编制人：{{item.userID}}</dd>
          <dd class="project-time"><i class="el-icon-time1 card-icon"></i>编制日期：{{item.createTime}}</dd>
          <dd class="project-opt">
            <el-button type="text" icon="edit" @click="updateProjectName(item)"></el-button>
            <el-button type="text" icon="copy" @click="copyProject(item)"></el-button>            
            <el-button type="text" icon="delete" @click="delProject(item)"></el-button>
            <el-button type="text" icon="share" @click="shareProject(item)"></el-button>
          </dd>
        </dl>
      </div>
    </div>

    <!-- 修改项目名称 -->
    <el-dialog title="修改文件名称" custom-class="add-templet" v-model="updateProjectNameDialog">
      <table class="form-table" width="100%" cellspacing="0" cellpadding="0">
        <tbody>
          <tr>
            <th width="70">文件名称</th>
            <td><el-input class="ui-w280" v-model="editProjectName"></el-input></td>
          </tr>
        </tbody>
      </table>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" size="large" @click="doUpdateProjectName">确定</el-button><el-button size="large" @click="updateProjectNameDialog = false">取消</el-button>
      </div>
    </el-dialog>

    <!-- 新建模板 -->
    <el-dialog title="新建模板" custom-class="add-templet" v-model="newTemplet">
      <div>
        <table class="form-table" width="100%" cellspacing="0" cellpadding="0">
          <tbody>
            <tr>
              <th width="70">模板名称</th>
              <td><el-input class="ui-w280" v-model="newTempletName"></el-input></td>
            </tr>
            <tr>
              <th>选择分类</th>
              <td>
                <el-select class="ui-w280" v-model="newTempletCatalogID" placeholder="请选择">
                  <el-option
                    v-for="item in catalog"
                    :label="item.Description"
                    :value="item.ID"
                    >
                  </el-option>
                </el-select>
              </td>
            </tr>
          </tbody>
        </table>      
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" size="large" @click="createTemplet">确定</el-button><el-button size="large" @click="newTemplet = false">取消</el-button>
      </div>
    </el-dialog>

    <!-- 新建招标 -->
    <el-dialog title="新建招标" custom-class="add-project" v-model="newProject">
      <div>
        <div class="form-table ui-mb10">
          <table width="100%" cellspacing="0" cellpadding="0">
            <tbody>
              <tr>
                <th width="80">文件名称</th>
                <td><el-input class="ui-w400" v-model="newProjectName" placeholder="请填写文件名称"></el-input></td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="select-templet">
          <div class="templet-tree">
            <el-tree node-key="id" :data="templetTree" :props="treeProps" highlight-current default-expand-all :current-node-key="1" @node-click="handleNodeClick"></el-tree>
          </div>
          <div class="templet-box">
            <ul>
              <li v-for="(item, index) in templetListInCatalog" 
                  @click="selectTemplet(item, $event)"
                  :title="item.description" :data-id="item.projectid" :data-index="index">
                <span>{{item.description}}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" size="large" @click="createProject">确定</el-button><el-button size="large" @click="newProject = false">取消</el-button>
      </div>
    </el-dialog>  

    <!-- 新建投标 -->
    <el-dialog title="新建投标" custom-class="add-project" v-model="newTB">
      <div>        
        <div class="select-templet">          
          <div class="templet-box">
            <ul>
              <li v-for="(item, index) in ZBFile" 
                  @click="selectZB(item,$event)"
                  :title="item.description" :data-id="item.projectid" :data-index="index">
                <span>{{item.description}}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" size="large" @click="createTB">确定</el-button><el-button size="large" @click="newTB = false">取消</el-button>
      </div>
    </el-dialog>

    <!-- 分享文件 -->
    <el-dialog title="分享文件" custom-class="add-project" v-model="dialogUser">
      <div>        
        <el-select class="ui-w280" v-model="shareUserID" placeholder="请选择">
          <el-option
            v-for="item in userList"
            :label="item.name"
            :value="item.account"
            >
          </el-option>
        </el-select>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" size="large" @click="doShare">确定</el-button><el-button size="large" @click="dialogUser = false">取消</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>

import gbqModel from '../assets/js/gbq.model.js'
import projectManager from '../assets/js/gbq.projectManager.js'
import commonJS from "../assets/js/gbq.utils_b.js";
import { bus } from '../assets/js/gbq.eventbus.js';

//检测模板名称是否有重复
function isNameRepeat(items, templetName){
  return  items.some(function(item){
    return item.description == templetName;
  });
}

export default {
  mounted: function(){
    gbqModel().closeCurProject();
    this.permission = projectManager().getPermission();
    this.getView();
    var vueObj = this;
    projectManager().getTempletCatalog(function(data){
      vueObj.catalog = data;      
      vueObj.templetTree = commonJS().buildTreeByPID(vueObj.catalog, 'ID', 'PID', 'Description');
    });    
    projectManager().getTemplet(function(data){
      vueObj.templetList = data;
    });
    projectManager().getZBFile(function(data){      
      vueObj.ZBFile = data;
    });
  },
  data: function() {
    return {
      dialogUser: false,
      shareItem: '',
      shareUserID: '',
      userList: [],
      newTB: false,
      ZBFile: [],      
      newTempletName: '',
      newTempletCatalogID: '',
      newProjectName: '',
      selectedTemplet: '',    
      selectedZB: '',  
      permission: '',             
      isCardList: true,
      timeFilter: 'all',
      keyword: '',
      newTemplet: false,
      newProject: false,      
      editProjectName: '',  //修改的项目名称      
      updateProjectNameDialog: false, //修改项目名称dialog     
      updateProjectNameItem: '', 
      templetList:[],   //模板工程列表
      templetListInCatalog:[],   //筛选模板工程列表
      catalog: [],     //模板分类      
      timeOptions: [
        {
          value: 'all',
          label: '全部'
        },{
          value: '7',
          label: '一周内'
        }, {
          value: '30',
          label: '一个月内'
        }, {
          value: '90',
          label: '三个月内'
        }
      ],
      allitems:[],   //用户工程列表
      items:[],   //显示的用户工程列表                  
      templetTree: [], 
      treeProps: {
        children: 'children',
        label: 'label'
      }      
    }
  },
  methods: {
    shareProject: function(item){
      var vueObj = this;
      projectManager().getUserList(function(data){
        vueObj.shareItem = item;
        vueObj.userList = data;
        vueObj.dialogUser = true;      
      });      
    },
    doShare: function(){
      var vueObj = this;
      projectManager().shareProject(vueObj.shareItem._id, vueObj.shareUserID, function(){
        vueObj.$message({
          message: '分享已经完成！',
          type: 'info'
        });
        vueObj.dialogUser = false;
      });
    },
    selectZB: function(item,e){
      $('.templet-box li').removeClass('active');
      $(e.currentTarget).addClass('active');
      this.selectedZB = item;
    },
    createTB: function(){
      var vueObj = this;      
      projectManager().createTB(this.selectedZB.description + '_投标', this.selectedZB._id,         
        function(data){
          vueObj.newTB = false;
          vueObj.keyword = '';
          vueObj.getView(vueObj.openProject);
        }
      );        
    },
    selectTemplet: function(item, e){
      $('.templet-box li').removeClass('active');
      $(e.currentTarget).addClass('active');
      this.selectedTemplet = item;
    },
    getView: function(open){
      var vueObj = this;
      projectManager().getAllProject(function(data){          
        vueObj.allitems = data;
        console.log(vueObj.allitems);
        vueObj.items = vueObj.allitems.filter(function(item){          
          if(vueObj.timeFilter=='all'){
            return item.description.indexOf(vueObj.keyword) >= 0;
          }else{
            var timeValue = new Date(item.createTime).getTime();
            var targetTime = new Date().getTime() - parseFloat(vueObj.timeFilter)*24*60*60*1000;
            return item.description.indexOf(vueObj.keyword)>=0 && timeValue>targetTime;
          }          
        });
        vueObj.items.sort(function(first, second) {
          return first.lastModify > second.lastModify ? -1 : (first.lastModify < second.lastModify ? 1 : 0);  
        });
        if (open) {
          open(vueObj.allitems[vueObj.allitems.length-1]);
        }
      });  
    },
    createProject: function(){      
      var vueObj = this;      
      if(vueObj.newProjectName == ""){
        vueObj.$message({
          message: '请输入工程名称！',
          type: 'error'
        });
      }else if(vueObj.selectedTemplet == ""){
        vueObj.$message({
          message: '请选择模板分类！',
          type: 'error'
        });
      }else{
        var isRepeat = isNameRepeat(vueObj.allitems, vueObj.newProjectName);
        if(isRepeat){
          vueObj.$message({
            message: '工程名称已存在！',
            type: 'error'
          });
        }else{
          projectManager().createZB(vueObj.newProjectName, vueObj.selectedTemplet._id,             
            function(data){
              vueObj.newProject = false;
              vueObj.keyword = '';
              vueObj.getView(vueObj.openProject);
            }
          );          
        }
      }
    },
    createTemplet: function(){      
      var vueObj = this;
      if(vueObj.newTempletName == ""){
        vueObj.$message({
          message: '请输入模板名称！',
          type: 'error'
        });
      }else if(vueObj.newTempletCatalogID == ""){
        vueObj.$message({
          message: '请选择模板分类！',
          type: 'error'
        });
      }else{
        var isRepeat = isNameRepeat(vueObj.allitems, vueObj.newTempletName);
        if(isRepeat){
          vueObj.$message({
            message: '模板名称已存在！',
            type: 'error'
          });
        }else{
          var catalogName = '';
          vueObj.catalog.forEach(function(item){
            if(item.ID==vueObj.newTempletCatalogID){
              catalogName = item.Description;
            }
          });      
          projectManager().createTemplet(vueObj.newTempletCatalogID, catalogName, vueObj.newTempletName, function(data){
              vueObj.newTemplet = false;        
              vueObj.keyword = '';
              vueObj.getView(vueObj.openProject);             
          });      
        }
      }
    },           
    // 删除
    delProject: function(item) {
      var vueObj = this;
      vueObj.$confirm('此操作将删除该模板, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        projectManager().delProject(item._id, function(data){
          vueObj.getView();
          vueObj.$message = {
            type: 'success',
            message: '删除成功!'
          }; 
        });    
      });
    },
    // 点击树
    handleNodeClick: function(node) {    
      this.templetListInCatalog = this.templetList.filter(function(item){
        return item.catalogID == node.id;
      });
    },
    // 切换风格
    switchCart:function(e){
      this.isCardList = true;
      $('.switch').removeClass('current');
      $(e.currentTarget).addClass('current');
    },
    switchList:function(e){
      this.isCardList = false;
      $('.switch').removeClass('current');
      $(e.currentTarget).addClass('current');
    },
    keywordChange: function(item) {
      this.getView();      
    },    
    //修改项目名称
    updateProjectName: function(item){
      this.updateProjectNameDialog = true;      
      this.updateProjectNameItem = item;
    },
    doUpdateProjectName: function(){
      var vueObj = this;
      if(vueObj.editProjectName == ""){
        vueObj.$message({
          message: '请输入新的项目名称！',
          type: 'error'
        });
      }else{
        var isRepeat = isNameRepeat(vueObj.allitems, vueObj.editProjectName);
        if(isRepeat){
          vueObj.$message({
            message: '项目名称已存在！',
            type: 'error'
          });
        }else{
          vueObj.updateProjectNameDialog = false;
          projectManager().updateTemplateName(vueObj.updateProjectNameItem._id, vueObj.editProjectName, function(data){
              vueObj.getView();
              vueObj.$message = {
                type: 'success',
                message: '修改成功!'
              };        
            }
          );      
        }
      }
    },
    //复制项目
    copyProject: function(item){
      var vueObj = this;      
      vueObj.$confirm('此操作将复制该模板, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'conform'
      }).then(() => {
        projectManager().copyProject(item._id, function(){
          vueObj.getView();
          vueObj.$message = {
            type: 'success',
            message: '修改成功!'
          }; 
        });         
      });
    },
    //修改模板名称
    updateTemplateName: function(){
      updateTemplateName(this, this.session.accesstoken);
    },      
    //根据时间搜索
    filterChange: function(checked){
      this.getView();
    },
    openProject: function(item){
      var vueObj = this;        
      gbqModel().openProject(item._id, function(){
        bus.$emit('update-tabs', gbqModel().getCatalog());
        vueObj.$router.push('/gcgk');  
      });        
    }
  },
  
}
</script>
