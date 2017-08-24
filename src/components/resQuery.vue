<template>
  <div class="clear">
    <div class="search-sidebar">      
      <el-tree :data="rescatalog" :props="treeProps" @node-click="clickCatalog"></el-tree>
    </div>
    <div class="search-box">
      <div class="ui-option option-margin">
        <div class="option-left">
          <div class="option-item">
            <el-input class="ui-w300"
              placeholder="关键字"
              icon="search"
              v-model="filter"
              @change="filterResource"              
              id="filterInput">
            </el-input>
          </div>
          <div class="option-item">
            <el-button class="btn" v-on:click="insertDetail"><i class="el-icon-insert el-icon--left"></i>插入</el-button>
          </div>
          <div class="option-item">
            <el-button class="btn" v-on:click="replaceDetail"><i class="el-icon-move el-icon--left"></i>替换</el-button>
          </div>
        </div>      
      </div>
      <v-table-grid 
        ref="table"     
        asTree="false">
      </v-table-grid>
    </div>
  </div>  
</template>

<script>
  import gbqModel from "../assets/js/gbq.model.js";  
  import commonJS from "../assets/js/gbq.utils_b.js";
  import tableGrid2 from 'components/tableGrid2';

  export default {
    name:'resQuery',
    components: {      
      'v-table-grid': tableGrid2,
    }, 
    props: ['lmmdetailID', 'bqItemID'],
    mounted: function(){
      var vueObj = this;        
      gbqModel().getBQDBs(function(data){   
        if(data&&data.length>0){
          var id = data[0].id;        
          gbqModel().getBQDB(id, function(db){                              
            vueObj.curBQDB = db;
            vueObj.rescatalog = commonJS().buildTreeByPID(db.ResCatalog, 'Key', 'PID', 'Description');
          });  
        }             
      });           
    },
    data: function(){
      return {   
        curBQDB: '',             
        rescatalog: [],   //材料章节树
        treeProps: {
          children: 'children',
          label: 'label'
        },
        currentCatalog: null,
        resource: [],  //查询材料库中的选中材料的数据
        fieldList: [
          {
            prop: 'Code',
            label: '编码',
            width: 80
          },
          {
            prop: 'Description',
            label: '名称',
            width: 100
          },
          {
            prop: 'Spec',
            label: '规格型号',
            width: 100
          },
          {
            prop: 'Brand',
            label: '品牌',
            width: 80
          },
          {
            prop: 'Unit',
            label: '单位',
            width: 60
          },
          {
            prop: 'WasteRate',
            label: '损耗率',
            width: 50,            
          },         
          {
            prop: 'MarketRate',
            label: '单价',
            width: 50,            
          }
        ],
        filter: '',                        
      }
    },
    methods: {
      selected: function(){
        return this.$refs.table.getSelected();
      },
      getEditStyle: function(row, prop){
        return "readonly";
      },
      clickCatalog: function(catalog){  //左侧材料分类树被点击      
        if(catalog){
          this.currentCatalog = catalog;
          this.resource = this.curBQDB.Resource.filter(function(item){
            return item.ResCatalogID == catalog.id;
          });
          this.$refs.table.$emit('show-grid', this.resource, this.fieldList, this.getEditStyle, false);
          this.filter = "";  
        }           
      },
      filterResource: function(){  //搜索材料   
        var vueObj = this; 
        var sFilter = this.filter.trim();
        if(sFilter.length > 0){
          this.resource = this.curBQDB.Resource.filter(function(item){
            return (item.Code.indexOf(sFilter) >= 0)||(item.Description.indexOf(sFilter) >= 0)||(item.Spec.indexOf(sFilter) >= 0);
          }); 
          this.$refs.table.$emit('show-grid', this.resource, this.fieldList, this.getEditStyle, false);
        }else if(this.currentCatalog){
          this.clickCatalog(this.currentCatalog);
        }
      },      
      insertDetail: function(){
        var vueObj = this;
        var selected = this.selected();        
        if(selected&&selected.length>0){          
          gbqModel().insertLmmDetail(this.bqItemID, this.lmmdetailID, selected, function(data){
            vueObj.$emit('after-command');
          });  
        }        
      },
      replaceDetail: function() {
        var vueObj = this;
        var selected = this.selected();        
        if(selected&&selected.length>0&&this.lmmdetailID>=0){
          gbqModel().replaceLmmDetail(this.lmmdetailID, selected[0], function(data){
            vueObj.$emit('after-command');
          });  
        }        
      },                  
    },
  }

</script>
