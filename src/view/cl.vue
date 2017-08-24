<template>
  <div class="cl">
    <div class="cl-option ui-option">
      <div class="option-left">
        <div v-if="toolbar.importMarketRate" class="option-item">
          <el-button class="btn" @click="importMarketRate"><i class="el-icon-search1 el-icon--left"></i>载入市场价</el-button>
        </div>
        <div class="option-item">
          <el-button class="btn" @click="handleRefItem"><i class="el-icon-search1 el-icon--left"></i>反查清单</el-button>
        </div>
        <div v-if="toolbar.lockSetting" class="option-item">
          <el-button class="btn" @click="setColumnLock"><i class="el-icon-search1 el-icon--left"></i>锁定设置</el-button>
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
          <el-input class="ui-w200"
          placeholder="关键字"
          icon="search"
          v-model="keyword"
          @change="searchItem">
          </el-input>
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
    <div class="cl-table">
      <v-table-grid
        ref="table"                
        @after-update="afterUpdate"
      >
      </v-table-grid>
    </div>
    <el-dialog title="反查清单" v-model="showRefItem" custom-class="checkingQD">
      <el-table border :data="refItem" max-height="300" style="width: 100%">
        <el-table-column property="code" label="编码" width="150">
          <template scope="scope">
            <div class="readonly">
              <p>{{scope.row.code}}</p>
            </div>
          </template>
        </el-table-column>
        <el-table-column property="description" label="清单名称" width="200">
          <template scope="scope">
            <div class="readonly">
              <p>{{scope.row.description}}</p>
            </div>
          </template>
        </el-table-column>
        <el-table-column property="spec" label="项目特征">
          <template scope="scope">
            <div class="readonly">
              <p>{{scope.row.spec}}</p>
            </div>
          </template>
        </el-table-column>
        <el-table-column property="unit" label="单位">
          <template scope="scope">
            <div class="readonly">
              <p>{{scope.row.unit}}</p>
            </div>
          </template>
        </el-table-column>
        <el-table-column property="remark" label="说明">
          <template scope="scope">
            <div class="readonly">
              <p>{{scope.row.remark}}</p>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
    <el-dialog title="载入市场价" v-model="dialogImportMarketRate" custom-class="ImportMarketRateDialog">
      <div>
        <el-form :inline="true">
          <el-form-item label="区域:">
            <el-select v-model="regionId" placeholder="区域">
              <el-option
                v-for="item in regions"
                :key="item.description"
                :label="item.description"
                :value="item.id">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="价格期数:">
            <el-select v-model="rateDateId" placeholder="价格期数">
              <el-option
                v-for="item in rateDates"
                :key="item"
                :label="item.description"
                :value="item.id">
              </el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </div>
      <div slot="footer" class="dialog-footer">
      <el-button type="primary" size="large" @click="doImportMarketRate">确定</el-button>
      <el-button size="large" @click="dialogImportMarketRate = false">取消</el-button>
    </div>
    </el-dialog>

    <el-dialog title="锁定设置" v-model="dialogLockSetting" custom-class="LockSettingDialog sdsz" @close='refresh'>
      <v-lock-setting ref="lockSetting" :tableData="tableData" :fieldList="lockSettingFieldList" :lockCheckField="lockSettingCheckProp">
      </v-lock-setting>
    </el-dialog>
  </div>
</template>
<script>
  import gbqModel from '../assets/js/gbq.model.js';
  import tableGrid2 from 'components/tableGrid2';
  import request from '../assets/js/gbq.request.js';
  import lockSettings from 'components/lockSetting';
  import { bus } from '../assets/js/gbq.eventbus.js';

  export default {
    beforeDestroy: function(){      
      gbqModel().commit();
    },
    mounted: function(){      
      var vueObj=this;
      gbqModel().read(function(data){
        vueObj.buildFields();
        vueObj.updateToolbar();
        vueObj.getView();
      });
    },
    components: {
      'v-table-grid': tableGrid2,
      'v-lock-setting' : lockSettings,
    },
    data() {
      return {
        keyword: '',
        permission: '',
        catalog: '',
        tableData: [],        
        refItem: [],
        showRefItem: false,
        toolbar: {
          importMarketRate: false,
          moveUp: false,
          moveDown: false,
          lockSetting: false,
        },        
        fieldList: [],
        regions:[],
        regionId: '',
        rateDates: [],
        rateDateId:'',
        dialogImportMarketRate: false,
        inSearch: false,
        dialogLockSetting: false,
        lockSettingFieldList: [
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
            width: 200
          },
          {
            prop: 'brand',
            label: '品牌',
            width: 100
          },
          {
            prop: 'unit',
            label: '单位',
            width: 40
          },
          {
            prop: 'locked',
            label: '锁定',
            width: 50
          }],
        lockSettingCheckProp: [
          'locked',
        ],
      }
    },
    methods: {
      refresh: function(){
        this.getView();
      },
      setColumnLock: function() {
        this.dialogLockSetting = true;
        bus.$emit('update-locksetting');
      },
      searchItem: function(){
        this.inSearch = this.keyword.length > 0;
        this.getView();
      },
      buildFields: function() {
        this.permission = request().getLoginInfo().permission;
        this.catalog = gbqModel().getCatalog();
        this.fieldList = [
          {
            prop: 'code',
            label: '编码',
            width: 100
          },
          {
            prop: 'description',
            label: '名称',
            width: 200
          },
          {
            prop: 'spec',
            label: '规格型号',
            width: 200
          },
          {
            prop: 'brand',
            label: '品牌',
            width: 100
          },
          {
            prop: 'unit',
            label: '单位',
            width: 40
          },
          {
            prop: 'quantity',
            label: '数量',
            width: 110
          },
          {
            prop: 'rate',
            label: '单价',
            width: 110
          },
          {
            prop: 'total',
            label: '合价',
            width: 110
          }];
        if (this.catalog =='门窗工程'||this.catalog=='幕墙工程'||this.catalog=='保温涂料工程') {
          this.fieldList.push({
            prop: 'wasteRate',
            label: '损耗',
            width: 110
          });
        }
        this.fieldList = this.fieldList.concat(
          [{
            prop: 'zd',
            label: '暂定',
            width: 55,
            align: 'center',
            visible: 'true'
          },
          {
            prop: 'supplyType',
            label: '供货方式',
            options: [{
              value: '乙供材料',              
            }, {
              value: '甲定材料',              
            }, {
              value: '甲供材料',              
            }],
            width: 110
          },
          {
            prop: 'supplier',
            label: '厂商',
            width: 110
          },
          {
            prop: 'remark',
            label: '备注',
            width: 110
          },
          {
            prop: 'rateSource',
            label: '价格来源',
            width: 110
          },
        ]);
        if (this.permission != 'gf') {
          this.fieldList.push({
            prop: 'locked',
            label: '锁定',
            width: 55,
            align:'center',
            visible: 'true' });
        }
      },
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
      importMarketRate: function() {
        var vueObj = this;
        request().getRegionAndRateDate(function(data){
          vueObj.rateDates = data.periodsList;
          vueObj.regions= data.regionList;
          vueObj.dialogImportMarketRate = true;
        });
      },
      doImportMarketRate: function() {
        this.dialogImportMarketRate = false;
        var regionDate = {};
        regionDate["periodId"] = this.rateDateId;
        regionDate["regionId"]= this.regionId;
        var vueObj = this;
        request().getMarketRate(regionDate, function(data){
          var idxMap = {}, i = 0;
          data.forEach(function(item){
            idxMap[item.Code] = i++;
          });

          var rateDateDescription = '';
          for (var i = vueObj.rateDates.length - 1; i >= 0; i--) {
            if (vueObj.rateDates[i].id == vueObj.rateDateId) {
              rateDateDescription = vueObj.rateDates[i].description;  
            }
          }

          vueObj.tableData.forEach(function(item){
            if (!item.locked) {
              if (idxMap[item.code]) {
                item.rate = data[idxMap[item.code]].Rate;
                item.rateSource = rateDateDescription;
                if (data[idxMap[item.code]].RateSource) {
                  item.rateSource = item.rateSource + ': ' + data[idxMap[item.code]].RateSource;
                } 
              }
            }
          });
          gbqModel().save(function(){
            vueObj.getView();
          });
        });
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
      getView() {
        var keyword = this.keyword;
        if(this.inSearch){
          this.tableData = gbqModel().getView('resource').filter(function(record){
            return (record.code&&record.code.indexOf(keyword)>=0)||
              (record.description&&record.description.indexOf(keyword)>=0);
          });
        }else{
          this.tableData = gbqModel().getView('resource');
        }
        
        this.$refs.table.$emit('show-grid', this.tableData, this.fieldList, this.getEditStyle, true, this.getAlignment, 4);
      },      
      doMoveUp: function(){
        var vueObj = this;
        if (this.selected().length > 1) {
            this.$message({message: '已选中多行无法上移!', type: 'info'});
            return;
        }
        var record = this.currentRecord();        
        gbqModel().moveUp('resource', vueObj.currentRowNo(), true, function(data, dst){
          vueObj.getView();
          vueObj.setCurrentRow(record);          
        });
      },
      doMoveDown: function(){
        var vueObj = this;
        if (vueObj.selected().length > 1) {
          this.$message({message: '已选中多行无法下移!', type: 'info'});
          return;
        }
        var record = this.currentRecord();
        gbqModel().moveDown('resource', vueObj.currentRowNo(), true, function(data, dst){
          vueObj.getView();
          vueObj.setCurrentRow(record);          
        });
      },
      getAlignment(row, prop) {
        if (prop=='unit'||prop=='wasteRate'||prop=='zd'||prop=='locked') {
          return 'htCenter htMiddle';
        }
        if (prop=='quantity'||prop.indexOf('quantity_')==0||prop=='rate'||prop=='total') {
          return 'htRight';
        }
        return 'htLeft';
      },
      getEditStyle(row, prop) {
        if (!row||!prop) {
          return 'readonly';
        }

        if(prop=='code'||prop=='description'||prop=='quantity'||prop=='total'||prop=='unit'||prop=='rateSource') {
          return 'readonly';
        }
        
        if (prop=='brand'||prop=='remark'||prop=='supplier') {
          return 'text';
        }

        if (prop=='spec'||prop=='supplyType'||prop=='wasteRate') {
          if (this.permission=='gf') {
            return 'readonly';
          } else {
            return 'text';
          }
        }

        if (prop=='zd'||prop=='locked') {
          if (this.permission=='gf') {
            return 'readonlyCheck';
          } else {
            return 'check';  
          }
        }

        if (prop=='rate') {
          if (row.locked ) {
            return 'readonly'  
          } else {
            return 'text';  
          }
        } 
        
        return 'readonly';        
      },
      afterUpdate(row, prop){
        if(prop=='rate'||prop=='wasteRate'){
          if (isNaN(parseFloat(row[prop]))) {
            row[prop] = 0;
          }
          row[prop] = parseFloat(row[prop]);
        }
        var vueObj = this;
        gbqModel().save(function(){
          vueObj.getView();
        });
      },      
      setCurrentRow: function(row){
        this.$refs.table.$emit('set-current-row', row);
      },
      handleRefItem(){        
        var record = this.currentRecord();
        if(record){
          this.refItem = gbqModel().refBQItem(record.id);        
          this.showRefItem = true;        
        }        
      }
    },

  }
</script>
