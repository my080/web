<template>
  <div class="clear">
    <div class="search-sidebar">
      <el-select v-model="selectedDBID" placeholder="请选择" @change="changeDBID">
        <el-option
          v-for="item in bqDBs"
          :label="item.description"
          :value="item.id">
        </el-option>
      </el-select>
      <el-tree :data="section" :props="TreeProps" @node-click="clickSection"></el-tree>
    </div>
    <div class="search-box">
      <div class="ui-option">
        <div class="option-left">
          <div class="option-item">
            <el-input class="ui-w300"
              placeholder="关键字"
              icon="search"
              v-model="filter"
              @change="filterBQItem"              
              id="filterInput">
            </el-input>
          </div>
          <div class="option-item">
            <el-button class="btn btnInsert" v-on:click="onBtnInsertItem">
              <i class="el-icon-insert el-icon--left"></i>插入
            </el-button>
          </div>
        </div>
        <div class="option-right">
          <div class="option-item">
            <span class="font-red">*请双击表格添加清单</span>
          </div>
        </div>
      </div>
      <el-table
        ref="multipleTable"
        :data="bqItem"
        height="408"
        border
        style="width: 100%"
        @row-dblclick="rowdblclick"
        @selection-change="handleSelectionChange">
        <el-table-column
          type="selection"
          align="center"
          width="55">
        </el-table-column>
        <el-table-column
          prop="Code"
          label="编号"
          width="100">
          <template scope="scope">
            <div class="readonly">
              <p>{{scope.row.Code}}</p>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          prop="Description"
          label="名称"
          width="140">
          <template scope="scope">
            <div class="readonly">
              <p>{{scope.row.Description}}</p>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          prop="Spec"
          label="项目特征"
          width="240">
          <template scope="scope">
            <div class="readonly">
              <p>{{scope.row.Spec}}</p>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          prop="Unit"
          label="单位"
          width="50"
          align="center">
          <template scope="scope">
            <div class="readonly">
              <p>{{scope.row.Unit}}</p>
            </div>
          </template>
        </el-table-column>   
        <el-table-column
          prop="BaseRate"
          label="基价"
          width="60"
          align="right">
          <template scope="scope">
            <div class="readonly">
              <p>{{scope.row.BaseRate}}</p>
            </div>
          </template>
        </el-table-column>       
      </el-table>
    </div>
  </div>
</template>

<script>
  import gbqModel from "../assets/js/gbq.model.js";    
  import commonJs from "../assets/js/gbq.utils_b.js";

  export default {
    name:'bqQuery',
    props: ['tableName', 'recno', 'PID'],
    methods: {            
      changeDBID: function(){  //切换清单库
        var vueObj = this;
        gbqModel().getBQDB(this.selectedDBID, function(data){   
          vueObj.curBQDB = data;          
          vueObj.section = commonJs().buildTreeByPID(vueObj.curBQDB.Section, 'Key', 'PID', 'Description');           
        });        
      },
      clickSection: function(section){  //左侧清单树被点击  
        this.curSection = section;              
        this.bqItem = this.curBQDB.BQItem.filter(function(item){
          return item.SectionID == section.id;
        });        
      },      
      filterBQItem: function(){  //搜索清单           
        var sFilter = this.filter.trim();        
        if(sFilter.length > 0){
          this.bqItem = this.curBQDB.BQItem.filter(function(item){
            return (item.Code.indexOf(sFilter) >= 0)||(item.Description.indexOf(sFilter) >= 0)||(item.Spec.indexOf(sFilter) >= 0);
          });        
        }else{          
          if(this.curSection){
            var vueObj = this;
            this.bqItem = this.curBQDB.BQItem.filter(function(item){
              return item.SectionID == vueObj.curSection.id;
            });  
          }          
        }
      },
      rowdblclick: function(data) {  //双击清单库内清单       
        //从清单库中插入清单
        this.insertItem(data);              
      },
      handleSelectionChange(val) {
        this.multipleSelection = val;
      },
      onBtnInsertItem: function() {
        for (var i = 0; i < this.multipleSelection.length; i++) {
          this.insertItem(this.multipleSelection[i]);
        }
      },
      insertItem: function (data) {
        var vueObj = this;
        var bqItem = data;
        //得到清单下含量
        var lmmDetail = this.curBQDB.LMMDetail.filter(function(item){
          return item.BQItemID == bqItem.Key;
        });        
        // 得到含量引用的材料
        var resIndex = {};
        this.curBQDB.Resource.forEach(function(item){
          resIndex[item.Key] = item;
        });        
        lmmDetail.forEach(function(item){
          item.resource = resIndex[item.ResID];
        });
        // 得到单价构成       
        var rateDict = null;
        var rateDetail = null;
        if(bqItem.RateDictID){
          rateDict = this.curBQDB.RateDict.filter(function(item){
            return item.Key == bqItem.RateDictID
          });
          rateDetail = this.curBQDB.RateDetail.filter(function(item){
            return item.RateDictID == bqItem.RateDictID;
          });  
        }                         
        vueObj.$emit('afterInsert', bqItem, lmmDetail, rateDict, rateDetail);   
      },
      clearMultiSelection: function() {
        this.$refs.multipleTable.clearSelection();
      }      
    },
    data: function(){
      return {
        bqDBs: '',  //清单库     
        curBQDB: '',   
        selectedDBID: '',        
        section: [],   //清单章节树
        TreeProps: {
          children: 'children',
          label: 'label'
        },
        bqItem: [],  //查询清单库中的选中清单的数据
        curSection: '',
        filter: '',
        session: '',
        multipleSelection: [],
      }
    },
    mounted: function(){      
      var vueObj = this;
      gbqModel().getBQDBs(function(data){
        vueObj.bqDBs = data;        
        if(vueObj.bqDBs!==null && vueObj.bqDBs.length > 0){
          vueObj.selectedDBID = vueObj.bqDBs[0].id;
        }
      });      
    }
  }

</script>