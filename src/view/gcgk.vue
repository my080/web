<template>
  <div class="gcgk">
    <div class="sidebar">
      <el-menu default-active="1">
      <el-menu-item index="1" @click="Info()"><i class="el-icon-project"></i>项目信息</el-menu-item>
      <el-menu-item index="2" @click="Specification()"><i class="el-icon-Prepareinstructions"></i>工程特征</el-menu-item>
      <el-menu-item index="3" @click="Preface()"><i class="el-icon-Prepareinstructions"></i>编制说明</el-menu-item>
    </el-menu>
    </div>
    <div class="content">
      <div class="project-info" v-show="showInfo">
        <table class="form-table" ref="projectInfo" :model="projectInfo" width="550" cellspacing="0" cellpadding="0">
          <tbody>
            <tr>
              <th width="160">当前文件名称</th>
              <td width="360"><el-input class="ui-w340" v-model="fileName" :disabled="permission=='gf'" @blur="changeFileName"></el-input></td>
            </tr>
            <tr>
              <th><font color='red'>采购计划名称*</font></th>
              <td>
                <el-select class="ui-w340" v-model="projectInfo.purchasePlanName" filterable @change='purchasePlanChange' placeholder="请选择" :disabled="permission=='gf'">
                  <el-option
                    v-for="item in purchasePlans"
                    :key="item.value"
                    :label="item.value"
                    :value="item.value">
                  </el-option>
                </el-select>
              </td>
            </tr>
            <tr>
              <th>项目名称</th>
              <td><el-input class="ui-w340" v-model="projectInfo.projectName" :disabled="true"></el-input></td>
            </tr>
            <tr>
              <th>公司名称</th>
              <td><el-input class="ui-w340" v-model="projectInfo.company" :disabled="true"></el-input></td>
            </tr>
            <tr>
              <th>地域</th>
              <td><el-input class="ui-w340" v-model="projectInfo.region" :disabled="permission=='gf'"></el-input></td>
            </tr>
            <tr>
              <th>质量</th>
              <td><el-input class="ui-w340" v-model="projectInfo.quality" :disabled="permission=='gf'"></el-input></td>
            </tr>
            <tr>
              <th>工期</th>
              <td><el-input class="ui-w340" v-model="projectInfo.Duration" :disabled="permission=='gf'"></el-input></td>
            </tr>
            <tr v-for="(item, index) in projectInfo.items" :key="item.key">
              <th>
              <el-input class="ui-w120" v-model='item.name' :disabled="permission=='gf'"></el-input>
              </th>
              <td>
                <el-input class="ui-w340" v-model="item.value" :disabled="permission=='gf'"></el-input><el-button class="delItem" type="text" icon="delete" @click="removeItem(item)" :disabled="permission=='gf'"></el-button>
              </td>
            </tr>
            <tr height="60" v-if="permission!='gf'">
              <th></th>
              <td>
                <a href="javascript:void(0)" class="font-blue" @click="addItem">+添加行</a></td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="project-explain" v-show="showPreface">
        <el-button type="primary" size="small" class="save-project_explain" @click="savePreface">保存</el-button>
        <v-editor
        ref='editor'
        :input-content="inputContent"
        :upload-url="uploadURL"
        :vueObj = "this"
        v-model="outputContent"></v-editor>
      </div>
      <div class="project-spec" v-show="showSpec">
        <div class="gctz-table">
          <v-table-grid 
            :recordList="tableData"
            ref="table"
            :fieldList="fieldList"
            :showRecNo="true"
            :getEditStyle="getEditStyle"
            @after-update="afterUpdate">
          </v-table-grid>
        </div>
      </div>
    </div>
  </div>
</template>
<script>  
  import Editor from 'components/Editor';
  import gbqModel from '../assets/js/gbq.model.js';
  import tableGrid from 'components/tableGrid';
  import commJs from '../assets/js/gbq.utils_b.js';
  import request from '../assets/js/gbq.request.js';
  import projectManager from '../assets/js/gbq.projectManager.js'

  export default {
    beforeDestroy: function(){      
      gbqModel().commit();
    },
    data: function() {
      return {
        allProject: [],
        permission: '',
        // input content to editor
        inputContent: '',
        // output content from editor
        outputContent: '',
        // set image upload api url
        uploadURL: process.env.API_ROOT + 'uploadfile',
        fileName: '', // 文件名称
        projectInfo: {},        
        showInfo:true,
        showPreface:false,
        showSpec:false,
        tableData: [],
        fieldList: [
          {
            prop: 'Description',
            label: '工程特征项',
            width: 200
          }
        ],
        purchasePlans:[],       
      }
    },
    methods: {
      isNameRepeat: function(newName){
        return this.allProject.some(function(item){
            return item.description == newName;
        });
      },
      changeFileName: function() {
        var isRepeat = this.isNameRepeat(this.fileName);
        if(isRepeat&&this.fileName != gbqModel().getFileName()){
          this.$message({
            message: '工程名称已存在！',
            type: 'error'
          });
          this.fileName = gbqModel().getFileName();
        } else {
          gbqModel().changeFileName(this.fileName);          
        }
      },
      purchasePlanChange: function(value) {
      },
      savePreface : function() {
        var vueObj = this;
        gbqModel().savePreface(this.outputContent, function(){
          vueObj.$message({
            message: '保存成功！',
            type: 'info'
          });
        });
      },
      Info: function() {
        this.showInfo = true;
        this.showPreface = false;
        this.showSpec = false;

      },
      Preface: function() {
        this.showInfo = false;
        this.showPreface = true;
        this.showSpec = false;
      },
      Specification(){
        this.showInfo = false;
        this.showPreface = false;
        this.showSpec = true;
      },
      addItem() {        
        this.projectInfo.items.push({
          name:'',
          value: '',
          key: Date.now()
        });        
      },
      removeItem(item) {
        var index = this.projectInfo.items.indexOf(item)        
        if (index !== -1) {
          this.projectInfo.items.splice(index, 1)
        }
      },
      saveProjectInfo() {
        var vueObj = this;
        gbqModel().saveProjectInfo(this.projectInfo, function(){
          vueObj.$message({
            message: '保存成功！',
            type: 'info'
          });
        });
      },
      getEditStyle(row, column){
        if (this.permission=='gf') {
          return 'readonly';
        }
        if(column===undefined||column.label=='工程特征项'){
          return 'readonly';
        }
        return 'text';
      },
      afterUpdate: function(row, field){
        if (row.DataType == 'NUM') {
          if (isNaN(parseFloat(row[field.prop]))) {
            row[field.prop] = 0;
          }
          row[field.prop] == parseFloat(row[field.prop]);
          gbqModel().recalcProjectSpec(row);
        }
        gbqModel().save();
      },
      getProjectSpecViewSuccess: function(data){
        gbqModel().saveProjectSpec(data);
        this.tableData = gbqModel().getView('projectSpec')
      },
      getProjectSpecView: function() {
        this.tableData = gbqModel().getView('projectSpec');
        if (this.tableData.length == 0) {
          gbqModel().getProjectSpec(this.getProjectSpecViewSuccess);
        }
      },
    },
    components: {
      'v-editor': Editor,
      'v-table-grid': tableGrid
    },
    mounted: function(){
      var vueObj = this;      
      gbqModel().read(function(){
        vueObj.permission = request().getLoginInfo().permission;
        projectManager().getAllProject(function(data){          
          vueObj.allProject = data;
        });
        vueObj.fileName = gbqModel().getFileName();
        vueObj.projectInfo = gbqModel().getView('projectInfo');
        vueObj.inputContent = gbqModel().getView('preface');
        vueObj.getProjectSpecView();
        var bidNode=gbqModel().getView('bidNode');
        commJs().addBidNodeProjectSpecFields(bidNode, vueObj.fieldList);
      });     
    }
  }
</script>