<template>
  <div class="mc">
    <div class="content">
      <div class="fl-option ui-option">
        <div class="option-left">
          <div v-if="toolbar.exportQuantity" class="option-item">
            <el-button class="btn" v-on:click="exportExcel()">
              导出填量
            </el-button>
          </div>
          <div v-if="toolbar.importUsageQuantity" class="option-item">
            <el-button class="btn" v-on:click="importExcel()">
              上传量
            </el-button>
          </div>
        </div>
        <div class="option-right">
          <div class="option-item">
            <el-input class="ui-w200"
            placeholder="关键字"
            icon="search"
            v-model="keyword"
            @change="searchBQItem">
            </el-input>
          </div>
        </div>
      </div>

      <div class="fl-table">
        <v-table-grid
          ref="table"
          @after-update="afterUpdate">
        </v-table-grid>
      </div>
      <!--导入Excel dialog start-->
      <el-dialog title="选择填量Excel" custom-class="ContentBrushDialog" v-model="dialogSelectExcel">
        <input id="excelFile" type="file" accept=".xlsx"></input>
        <div slot="footer" class="dialog-footer">
          <el-button type="primary" size="large" @click="doImportExcel">确定</el-button>
          <el-button size="large" @click="dialogSelectExcel = false">取消</el-button>
        </div>
      </el-dialog>
      <!--导入Excel dialog end-->
    </div>
  </div>

</template>
<script>
  import gbqModel from '../assets/js/gbq.model.js';
  import tableGrid2 from 'components/tableGrid2';
  import ruleEngine from "../assets/js/gbq.ruleEngine.js";
  import costCode from "components/costCode";
  import commJs from '../assets/js/gbq.utils_b.js';
  import request from '../assets/js/gbq.request.js';

  export default {
    beforeDestroy: function(){
      gbqModel().commit();
    },
    mounted: function() {
      var vueObj=this;
      gbqModel().read(function(data){
        vueObj.permission = request().getLoginInfo().permission;
        vueObj.updateToolbar();
        var bidNode = gbqModel().getView('bidNode');
        commJs().addBidNodeFields('hall', bidNode, vueObj.fieldList);        
        vueObj.getView();
      });
    },
    components: {
      'v-table-grid': tableGrid2
    },
    data() {
      return {
        permission: '',
        toolbar: {
          exportQuantity: false,
          importUsageQuantity: false
        },
        inSearch: false,
        tableData: [],
        keyword: '',
        dialogSelectExcel: false,
        fieldList: [
          {
            prop: 'code',
            label: '编号',            
            width: 140
          },
          {
            prop: 'description',
            label: '名称',            
            width: 200
          },
          {
            prop: 'holeWidth',
            label: '洞口宽(m)',
            width: 100
          },
          {
            prop: 'holeHeight',
            label: '洞口高(m)',
            width: 100
          },
          {
            prop: 'holeArea',
            label: '洞口面积(m2)',            
            width: 100
          },
          {
            prop: 'doorWindowWidth',
            label: '门窗宽(m)',
            width: 100
          },
          {
            prop: 'doorWindowHeight',
            label: '门窗高(m)',
            width: 100
          },
          {
            prop: 'doorWindowArea',
            label: '门窗面积(m2)',
            width: 100
          },
          {
            prop: 'hall',
            label: '合计',
            childList:[],            
            width: 120
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
          this.toolbar.checkBQItem = true;
        } else {
          for (var prop in this.toolbar) {
            this.toolbar[prop] = true;
          }
        }
      },
      searchBQItem: function(){
        this.inSearch = this.keyword.length > 0;
        this.getView();
      },
      getView: function(){
        var keyword = this.keyword;
        if(this.inSearch){
          this.tableData = gbqModel().getView('bqItem').filter(function(record){
            return (record.code&&record.code.indexOf(keyword)>=0)||
              (record.description&&record.description.indexOf(keyword)>=0);
          });
        }else{
          this.tableData = gbqModel().getView('bqItem');
        }
        this.$refs.table.$emit('show-grid', this.tableData, this.fieldList, this.getEditStyle, true, this.getAlignment);
      },
      exportExcel: function() {
        var vueObj = this;
        gbqModel().read(function(project) {
          var data = {};
          data['project'] = project;
          request().excel(data, "MC",function(success) {
            request().download(success.file);
            vueObj.$message({
              message: '导出成功！',
              type: 'info'
            });
          });
        }, function(err) {

        });
      },
      doImportExcel: function() {
        var vueObj = this;
        // 获取选择的文件
        var el = document.getElementById('excelFile');
        if(el.files.length>0){
          commJs().readExcel(el.files[0], function(workbook){
            var excelData = workbook.Sheets[workbook.SheetNames[0]];
            var config = JSON.parse(excelData['A1'].v);
            if (!gbqModel().isSameProject(config.pid)) {
              vueObj.$message({
                message: '请选择同一工程的 Excel 文件！',
                type: 'info'
              });
              return;
            }
            if (config.type != "MC") {
              vueObj.$message({
                message: '请选择门窗填量的 Excel 文件，其他类型或普通 Excel 缺少相应的导入信息，无法进行数据导入及计算！',
                type: 'info'
              });
              return;
            }
            for (var key in excelData) {
              var num = parseInt(commJs().getNum(key));
              if (num) {
                var headChar = commJs().trimNumber(key);
                var head = commJs().isInExcelHeader(config, key);
                if (!head) {
                  var rowN = "A" + num;
                  var colN = headChar + "1";
                  if (excelData[rowN] && excelData[colN]) {
                    var rowObj = JSON.parse(excelData[rowN].v);
                    var conObj = JSON.parse(excelData[colN].v);
                    if (conObj && conObj.edit) {
                      var tableItem = gbqModel().queryDataByField('bqItem', 'id', rowObj.id);
                      if (tableItem && tableItem.type == "清单" && tableItem.itemType == "普通") {
                        tableItem[conObj.prop] = excelData[key].v;
                        gbqModel().setDataByField('bqItem', 'id', tableItem);
                      }
                    }
                  }
                }
              }
            }
            for (var i = 0; i < vueObj.tableData.length; i ++) {
              if (vueObj.tableData[i].type == "清单" && vueObj.tableData[i].itemType == "普通") {
                vueObj.calcRow(vueObj.tableData[i]);
              }
            }
            gbqModel().save(function(){
              vueObj.getView();
            });
            vueObj.dialogSelectExcel = false;
            vueObj.$message({
              message: '导入成功！',
              type: 'info'
            });
          });
        } else {
          vueObj.$message({
            message: '请选择excel文件！',
            type: 'info'
          });
        }
      },
      importExcel: function() {
        this.dialogSelectExcel = true;
      },
      calcRow: function(row){
        var vueObj = this;
        var bidNode = gbqModel().getView('bidNode');
        // 计算单体面积
        row.holeWidth = row.holeWidth||0;
        row.holeHeight = row.holeHeight||0;
        row.doorWindowWidth = row.doorWindowWidth||0;
        row.doorWindowHeight = row.doorWindowHeight||0;
        row.holeArea = Math.round(row.holeWidth * row.holeHeight * 100000) / 100000;
        row.doorWindowArea = Math.round(row.doorWindowWidth * row.doorWindowHeight * 100000) / 100000;
        // 计算房间数
        gbqModel().sumByBidNode(row, bidNode, 'hall');
        // 然后计算工程
        bidNode.forEach(function(item){
          row['quantity_'+item.id] =  Math.round(row['hall_'+item.id]*row.doorWindowArea*100000)/100000;
        });
        // 汇总工程量
        gbqModel().sumByBidNode(row, bidNode, 'quantity');
      },
      afterUpdate: function(row, prop) {
        var vueObj = this;
        if (isNaN(parseFloat(row[prop]))) {
          row[prop] = 0;
        }
        row[prop] = parseFloat(row[prop]);

        this.calcRow(row);
        gbqModel().save(function(){
          vueObj.getView();
        });
      },
      getEditStyle(row, prop){
        if (!row||!prop) {
          return 'readonly'
        }

        if (row.type == "分部") {
          return "readonly";
        } 
        
        if (this.permission=='gf') {
          return 'readonly';
        }

        if ( prop=='code' || prop=='description' || prop == "holeArea" || prop == "doorWindowArea") {
          return 'readonly';
        } else {
          return 'text';
        }

        if (prop == "hall") {
          if (gbqModel().getView('bidNode').length > 0) {
            return 'readonly';
          } else {
            return 'text';
          }
        }
      },
      getAlignment(row, prop) {
        if (prop=='holeWidth'||prop=='holeHeight'||prop=='holeArea'||prop=='doorWindowWidth'||prop=='doorWindowHeight'||prop=='doorWindowArea'||prop=='hall'||prop.indexOf("hall_")==0) {
          return 'htRight';
        }
        return 'htLeft';
      },
    }
  }
</script>
