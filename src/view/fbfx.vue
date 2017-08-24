<template>
  <div class="fbfx">
    <div class="fbfx-option ui-option">
      <div class="option-left">
        <div v-if="toolbar.copy" class="option-item">
          <el-button title="复制" class="btn" v-on:click="doCopy()"><i class="el-icon-copy"></i></el-button>
        </div>
        <div v-if="toolbar.cut" class="option-item">
          <el-button title="剪切" class="btn" v-on:click="doCut()"><i class="el-icon-cut"></i></el-button>
        </div>
        <div v-if="toolbar.paste" class="option-item">
          <el-button title="粘贴" class="btn" v-on:click="doPaste()"><i class="el-icon-paste"></i></el-button>
        </div>
        <div v-if="toolbar.delete" class="option-item">
          <el-button title="删除" class="btn" v-on:click="doDelete()"><i class="el-icon-delete"></i></el-button>
        </div>
        <div v-if="toolbar.moveUp" class="option-item">
          <el-button title="上移" class="btn" v-on:click="doMoveUp()"><i class="el-icon-Onthearrow"></i></el-button>
        </div>
        <div v-if="toolbar.moveDown" class="option-item" v-on:click="doMoveDown()">
          <el-button title="下移" class="btn"><i class="el-icon-downarrow"></i></el-button>
        </div>
        <div v-if="toolbar.insert" class="option-item">
          <el-dropdown menu-align="start" trigger="click" @command="insertTitle">
            <el-button class="btn">
          <i class="el-icon-insert el-icon--left"></i>插入<i class="el-icon-caret-bottom el-icon--right"></i>
          </el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="title">分部</el-dropdown-item>
              <el-dropdown-item command="subtitle">子分部</el-dropdown-item>
              <el-dropdown-item command="descItem">集中描述</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
        <div v-if="toolbar.queryBQDB" class="option-item">
          <el-button class="btn" @click="queryBQDB"><i class="el-icon-querylist el-icon--left"></i>查询定额库</el-button>
        </div>
        <div v-if="toolbar.arrangeTitle||toolbar.delTitle" class="option-item">
          <el-dropdown menu-align="start" trigger="click" @command="putTitle">
            <el-button class="btn"><i class="el-icon-distribution el-icon--left"></i>整理<i class="el-icon-caret-bottom el-icon--right"></i></el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item v-if="toolbar.arrangeTitle" command="arrT">分部整理</el-dropdown-item>
              <el-dropdown-item v-if="toolbar.delTitle" command="delT">取消整理</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
        <div class="option-item">
          <el-dropdown menu-align="start" trigger="click" @command="colorCommand">
            <el-button class="btn">
              <i class="el-icon-pigmentbucket el-icon--left"></i>标记<i class="el-icon-caret-bottom el-icon--right"></i>
            </el-button>
            <el-dropdown-menu slot="dropdown" class="color-box">
              <el-dropdown-item v-for="n in 45" :class="'tagColor'+n" :command="'tagColor'+n"></el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
        <div v-if="toolbar.adjustRatio" class="option-item">
          <el-button class="btn" v-on:click="adjustCoefficient()">
            <i class="el-icon-setting el-icon--left"></i>量调整
          </el-button>
        </div>
        <div class="option-item">
          <el-dropdown menu-align="start" trigger="click" @command="exportExcel">
            <el-button class="btn">
          <i class="el-icon-insert el-icon--left"></i>导出量<i class="el-icon-caret-bottom el-icon--right"></i>
          </el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item v-if="toolbar.exportUsage" command="fill">导出填含量</el-dropdown-item>
              <el-dropdown-item v-if="toolbar.exportQuantity" command="quantities">导出填量</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
        <div v-if="toolbar.importUsageQuantity" class="option-item">
          <el-dropdown menu-align="start" trigger="click" @command="importExcel">
            <el-button class="btn">
          <i class="el-icon-insert el-icon--left"></i>上传量<i class="el-icon-caret-bottom el-icon--right"></i>
          </el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="fill">上传填含量</el-dropdown-item>
              <el-dropdown-item command="quantities">上传填量</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
        <div v-if="toolbar.importBqItem" class="option-item">
          <el-button class="btn" v-on:click="showImportGBQ()"><i class="el-icon-insert el-icon--left"></i>合并</el-button>
        </div>
        <div  v-if="toolbar.lockSetting" class="option-item">
          <el-button class="btn" v-on:click="setColumnLock()"><i class="el-icon-insert el-icon--left"></i>锁定设置</el-button>
        </div>
        <div  v-if="toolbar.checkBQItem" class="option-item">
          <el-button class="btn" v-on:click="doCheckBqItems()"><i class="el-icon-insert el-icon--left"></i>保存提交</el-button>
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
      <div class="option-right">
          <div class="option-item">
            <span class="count-num">
              共<b>{{ tableData.length }}</b>条清单
            </span>
          </div>
        </div>
    </div>
  <div class="fbfx-table" v-bind:class="{ fbfxactive: fbfxActive }">
    <v-table-grid
      ref="table"
      @after-update="afterUpdate"
      @row-contextmenu="contextMenu"
      @header-click="headClick"
      @current-change="currentChange"
      class="fbfx-table1">
    </v-table-grid>
    <div class="fbfx-line" v-on:click="fbfxShow()">
      <i class="el-icon-caret-top"></i>
    </div>
    <v-lmmDetail 
      ref="detail"
      @refresh="refresh"
    ></v-lmmDetail>
  </div>

  <!--查询清单库dialog start-->
  <el-dialog title="查询定额库" custom-class="commListDialog" v-model="dialogBQQuery" size="tiny" @close="bqQueryDialogClose">
    <v-bq-query  ref="bqQuery" v-on:afterInsert="insertBQItem"></v-bq-query>
  </el-dialog>
  <!--查询清单库dialog end-->

  <!--导入Excel dialog start-->
  <el-dialog title="选择填量Excel" custom-class="ContentBrushDialog" v-model="dialogSelectExcel">
    <input id="excelFile" type="file" accept=".xlsx"></input>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" size="large" @click="doImportExcel">确定</el-button>
      <el-button size="large" @click="dialogSelectExcel = false">取消</el-button>
    </div>
  </el-dialog>
  <!--导入Excel dialog end-->

  <!-- 系数调整对话框 -->
  <el-dialog title="系数调整" v-model="dialogAdjustCoefficient" custom-class="AdjustCoefficientDialog">
    <el-form ref="form" label-width="80px">
      <el-form-item label="工程量">
        <el-input v-model="quantityAdjustRatio"></el-input>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" size="large" @click="doAdjustCoefficient">确定</el-button>
      <el-button size="large" @click="dialogAdjustCoefficient = false">取消</el-button>
    </div>
  </el-dialog>

  <el-dialog title="页面设置" v-model="dialogColumnSetting" custom-class="ColumnSettingDialog">
    <el-form ref="form" label-width="80px">
      <el-form-item>
          <el-checkbox v-model="columnsSetting.workScope">工作内容</el-checkbox>
          <el-checkbox v-model="columnsSetting.baseRate">基价</el-checkbox>
          <el-checkbox v-model="columnsSetting.laborRate">人工费</el-checkbox>
          <el-checkbox v-model="columnsSetting.materialRate">材料费</el-checkbox>
          <el-checkbox v-if="!(catalog=='门窗工程'||catalog=='幕墙工程'||catalog=='保温涂料工程')" v-model="columnsSetting.wasteRate">材料损耗</el-checkbox>
          <el-checkbox v-model="columnsSetting.jxfcRate">机械及辅材</el-checkbox>
      </el-form-item>
      <el-form-item>
          <el-checkbox v-model="columnsSetting.zhqf">综合取费列</el-checkbox>
          <el-checkbox v-model="columnsSetting.outputTax">增值税</el-checkbox>
          <el-checkbox v-model="columnsSetting.Remark">补充说明</el-checkbox>
          <el-checkbox v-model="columnsSetting.JLGZ">计量规则</el-checkbox>
          <el-checkbox v-model="columnsSetting.osmSuplly">甲供</el-checkbox>
          <el-checkbox v-model="columnsSetting.variant">变量</el-checkbox>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" size="large" @click="doSetColumns">确定</el-button>
      <el-button size="large" @click="dialogColumnSetting = false">取消</el-button>
    </div>
  </el-dialog>

  <el-dialog title="锁定设置" v-model="dialogLockSetting" custom-class="LockSettingDialog sdsz" @close='refresh'>
    <v-lock-setting ref="lockSetting" :tableData="tableData" :fieldList="lockSettingFieldList" :lockCheckField="lockSettingCheckProp">
     </v-lock-setting>
  </el-dialog>

  <el-dialog title="保存提交" v-model="dialogInvalidItems" custom-class="ContentBrushDialog bctj">
    <v-invalid-item class="" ref="invalidItems"> </v-invalid-item>
  </el-dialog>

  <el-dialog title="导入清单" v-model="dialogImportGBQ" custom-class="ContentBrushDialog">
    <div>        
      <div class="select-templet">          
        <div class="templet-box">
          <ul>
            <li v-for="(item, index) in userFile" 
                @click="selectGBQ(item,$event)"
                :title="item.description" :data-id="item.projectid" :data-index="index">
              <span>{{item.description}}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" size="large" @click="doImportBqItem">确定</el-button>
      <el-button size="large" @click="dialogImportGBQ = false">取消</el-button>
    </div>
  </el-dialog>

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
  import lmmDetail from 'components/lmmDetail';
  import tableGrid2 from 'components/tableGrid2';
  import { bus } from '../assets/js/gbq.eventbus.js';
  import commJs from '../assets/js/gbq.utils_b.js';
  import request from '../assets/js/gbq.request.js';
  import lockSettings from 'components/lockSetting';
  import projectManager from '../assets/js/gbq.projectManager.js';
  import invalideItems from 'components/invalidItem';

  export default{
    beforeDestroy: function(){
      gbqModel().commit();
    },
    mounted: function(){
      var vueObj=this;
      gbqModel().read(function(data){
        vueObj.buildFields();
        vueObj.updateToolbar();
        vueObj.buildMenu();
        vueObj.getView();
        vueObj.doColumnsSettting();
        vueObj.buildLockSettingFields();
      });
    },
    components: {
      'v-rightmenu': rightMenu,
      'v-bq-query': bqQuery,
      'v-lmmDetail': lmmDetail,
      'v-table-grid': tableGrid2,
      'v-lock-setting' : lockSettings,
      'v-invalid-item' : invalideItems,
    },
    data: function(){
      return {
        dialogImportGBQ: false,
        selectedGBQ: '',
        userFile: [],
        fbfxActive:false,
        excelType: "fill",
        keyword: '',
        dialogSelectExcel: false,
        clipboard: [],
        isCut: false,
        tableData: [],
        dialogBQQuery: false,  //清单库dialog
        dialogAdjustCoefficient: false, // 系数调整dialog
        dialogColumnSetting: false, // 页面设置dialog
        dialogLockSetting: false, // 锁定设置dialog
        dialogInvalidItems: false, // 检查的无效清单对话框  
        quantityAdjustRatio:'',
        permission: '',
        catalog: '',
        columnsSetting: 
        {
          workScope: true,
          baseRate: true,
          laborRate: true,
          materialRate: true,
          wasteRate: true,
          jxfcRate: true,
          zhqf: true,
          outputTax: true,
          Remark: true,
          JLGZ: true,
          osmSuplly: true,
          variant: true
        },
        toolbar: {
          copy: false,
          cut: false,
          delete: false,
          paste: false,
          insert: false,
          moveUp: false,
          moveDown: false,
          queryBQDB: false,
          arrangeTitle: false,
          delTitle: false,
          adjustRatio: false,
          lockSetting: false,
          exportQuantity: false, // 导出工程量
          exportUsage: false, // 导出填含量
          importUsageQuantity: false, // 上传量
          importBqItem: false, // 导入清单
          checkBQItem: false, // 检查清单
        },
        menusList:[],
        fieldList: [],
        hideQuantity: false,
        hideTotal: false,
        inSearch: false,
        lockSettingFieldList: [],
        lockSettingCheckProp: [
          'lockCLF',
          'lockWasteRate',
          'lockBhf'
        ],
      }
    },
    methods: {
      buildFields: function() {
        this.permission = request().getLoginInfo().permission;
        this.catalog = gbqModel().getCatalog();
        this.fieldList = [
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
            prop: 'workScope',
            label: '工作内容',
            width: 200,
            hide: true
          },
          {
            prop: 'unit',
            label: '单位',
            width: 40
          },
          {
            prop: 'baseRate',
            label: '基价',
            width: 80,
            hide: true
          },
          {
            prop: 'RGF',
            label: '人工费',
            width: 80,
            hide: true
          },
          {
            prop: 'CLF',
            label: '材料费',
            width: 80,
            hide: true
          }];
        if (!(this.catalog == '门窗工程'||this.catalog=='幕墙工程'||this.catalog=='保温涂料工程')) {
          this.fieldList.push({
            prop: 'wasteRate',
            label: '材料损耗',
            width: 80,
            hide: true
          });
        }
        this.fieldList.push({
            prop: 'JXFC',
            label: '机械辅材费',
            width: 80,
            hide: true
          });
        if (this.catalog == '景观工程') {
          this.fieldList.push({
                prop: 'bhf',
                label: '保活费',
                width: 80
            });
        }
        this.fieldList = this.fieldList.concat([
          {
            prop: 'ZHQF',
            label: '综合取费',
            width: 80,
            hide: true
          },
          {
            prop: 'outputTax',
            label: '增值税',
            width: 80,
            hide: true
          },
          {
            prop: 'rate',
            label: '综合单价',
            width: 80
          },
          {
            prop: 'quantity',
            label: '工程量',
            childList:[],
            width: 80
          },
          {
            prop: 'total',
            label: '综合合价',
            childList:[],
            width: 80
          },
          {
            prop: 'Remark',
            label: '补充说明',
            width: 150,
            hide: true
          },
          {
            prop: 'jlgz',
            label: '计量规则',
            width: 200,
            hide: true
          },
          {
            prop: 'osmSuplly',
            label: '甲供',
            width: 50,
            align: 'center',
            visible: 'true',
            hide: true
          },
          {
            prop: 'variant',
            label: '变量',
            width: 80,
            hide: true
          }
        ]);
        var bidNode=gbqModel().getView('bidNode');
        commJs().addBidNodeFields('quantity', bidNode, this.fieldList);
        commJs().addBidNodeFields('total', bidNode, this.fieldList);
      },
      fbfxShow:function() {
        this.fbfxActive = !this.fbfxActive;
        this.grid
      },
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
          this.toolbar.checkBQItem = false;
          // this.toolbar.importUsageQuantity = this.catalog == '门窗工程' ? false : true;
          this.toolbar.importBqItem = (this.catalog == '土建工程' || this.catalog == '景观工程' || this.catalog == '精装修工程' ) ? true : false;
          this.toolbar.exportQuantity = this.catalog == '门窗工程' ? false : true;
          this.toolbar.exportUsage = (this.catalog == '门窗工程' || this.catalog == '幕墙工程' || this.catalog == '保温涂料工程') ?   true : false;
        }
      },
      buildMenu: function() {
        if (this.permission == 'gf') {
          this.menusList = [
            {
              label:'页面设置',
              fn: ['setColumns']
            }];  
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
                }
              ]
            },
            {
              label:'分部整理',
              fn: ['arrangeTitle']
            },
            {
              label:'删除分部',
              fn: ['delTitle']
            },
            {
              label:'页面设置',
              fn: ['setColumns']
            },
          ];
        }
      },
      doCheckBqItems: function() {
        if (gbqModel().checkBQItems(this.catalog).length > 0) {
          // this.dialogInvalidItems = true;
          // bus.$emit('update-items');
          window.open('http://10.129.8.187:3000/index#/bctj');
        } else {
            this.$message({
              message: '提交成功', 
              type: 'info'});
        }
      },
      showImportGBQ: function(){
        var vueObj = this;
        vueObj.dialogImportGBQ = true;
        projectManager().getAllProject(function(data){          
          vueObj.userFile = data;          
        });  //获取用户工程列表
      },
      selectGBQ: function(item, e){
        $('.templet-box li').removeClass('active');
        $(e.currentTarget).addClass('active');
        this.selectedGBQ = item;
      },
      doImportBqItem : function() {
        var vueObj = this;
        var errInfo = [];
        gbqModel().importGBQ(this.selectedGBQ._id, 
          function(srcProject){
            vueObj.$confirm('要合并的工程与现有工程存在相同材料但价格却不一致, 是否继续合并?', '提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'conform'
            }).then(() => {
              gbqModel().doImportGBQ(srcProject, function(){
                vueObj.getView();
                vueObj.$message = {
                  type: 'info',
                  message: '导入完成!'
                }; 
                vueObj.dialogImportGBQ = false;
              });         
            }).catch(e => {
              vueObj.dialogImportGBQ = false;
            });
          }, 
          function(msg){
            vueObj.$message({
            message: msg, 
            type: 'error'});
            vueObj.dialogImportGBQ = false;
          },
          function(){
            vueObj.getView();
            vueObj.$message({
              message: '导入完成!', 
              type: 'info'});
            vueObj.dialogImportGBQ = false;
        });
      },
      buildLockSettingFields: function() {
        this.catalog = gbqModel().getCatalog();
        this.lockSettingFieldList = [
          {
            prop: 'code',
            label: '编码',
            width: 160
          },
          {
            prop: 'description',
            label: '名称',
            width: 200
          },
          {
            prop: 'spec',
            label: '项目特征',
            width: 250
          },
          {
            prop: 'unit',
            label: '计量单位',
            width: 70
          },
          {
            prop: 'lockCLF',
            label: '材料费',
            width: 50
          }];
        if (this.catalog != '外檐工程') {
          this.lockSettingFieldList.push({
            prop: 'lockWasteRate',
            label: '材料损耗',
            width: 70
          });
        }
        if (this.lockSettingFieldList == '景观工程') {
          this.fieldList.push({
              prop: 'lockBhf',
              label: '保活费',
              width: 50
          });
        } 
      },
      setColumnLock: function() {
        this.dialogLockSetting = true;
        bus.$emit('update-locksetting');
      },
      currentChange: function(record){
        if(record){
          var id = -1;
          if(record.type=='清单'&&record.itemType!='描述') {
            id = record.id;
          }
          this.$refs.detail.$emit("show-detail", id);
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
      searchBQItem: function(){
        this.inSearch = this.keyword.length > 0;
        this.getView();
      },
      bqQueryDialogClose: function() {
        this.$refs.bqQuery.clearMultiSelection();
      },
      doColumnsSettting: function() {
        var vueObj = this;
        var setting = gbqModel().getColomnsSetting('bqItem');
        if (!setting) {
            setting = JSON.parse(JSON.stringify(this.columnsSetting));
            gbqModel().setColomnSetting('bqItem', this.columnsSetting);
        }
        this.fieldList.forEach(function(item){
          if (item.label == '工作内容') {
            item['hide'] = !setting.workScope;
          } else if (item.label == '基价') {
            item['hide'] = !setting.baseRate;
          } else if (item.label == '人工费') {
            item['hide'] = !setting.laborRate;
          } else if (item.label == '材料费') {
            item['hide'] = !setting.materialRate;
          } else if (item.label == '材料损耗') {
            item['hide'] = !setting.wasteRate;
          } else if (item.label == '机械辅材费') {
            item['hide'] = !setting.jxfcRate;
          } else if (item.label == '综合取费') {
            item['hide'] = !setting.zhqf;
          } else if (item.label == '增值税') {
            item['hide'] = !setting.outputTax;
          } else if (item.label == '补充说明') {
            item['hide'] = !setting.Remark;
          } else if (item.label == '计量规则') {
            item['hide'] = !setting.JLGZ;
          } else if (item.label == '甲供') {
            item['hide'] = !setting.osmSuplly;
          } else if (item.label == '变量') {
            item['hide'] = !setting.variant;
          }
        });
        gbqModel().save(function(){
          vueObj.getView();
        });
      },
      setColumns: function() {
        this.columnsSetting = JSON.parse(JSON.stringify(gbqModel().getColomnsSetting('bqItem')));
        this.dialogColumnSetting = true;
      },
      doSetColumns: function() {
        gbqModel().setColomnSetting('bqItem', this.columnsSetting);
        this.doColumnsSettting();
        this.dialogColumnSetting = false;
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
          });
        }else if(property=='total'){
          this.hideTotal = !this.hideTotal;
          field.label = this.hideTotal?'综合合价 <<':'综合合价 >>';
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
      colorCommand: function(command){
        var vueObj = this;
        this.selected().forEach(function(item){
          item.color = command;
          vueObj.$refs.table.gridObj.render();
        });
        gbqModel().save();
      },
      getRowClass: function(row){
        if(row.color!=null){
          return row.color;
        }else{
          return '';
        }
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
        var vueObj = this;
        var target = this.currentRecord();
        if(!target) {
          return;
        }
        gbqModel().pasteBQItem(this.clipboard, target, this.isCut, function(){
          vueObj.getView();
        });
      },
      doMoveUp: function(){
        var vueObj = this;
        if (this.selected().length > 1) {
            this.$message({message: '已选中多行无法上移!', type: 'info'});
            return;
        }
        var record = this.currentRecord();
        gbqModel().moveUp('bqItem', vueObj.currentRowNo(), true, function(data, dst){
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
        gbqModel().moveDown('bqItem', vueObj.currentRowNo(), true, function(data, dst){
          vueObj.getView();
          vueObj.setCurrentRow(record);
        });
      },
      adjustCoefficient:function() {
        if (this.selected().length > 0) {
            this.dialogAdjustCoefficient = true;
          }
      },
      validateAdjustRatio:function(value) {
        if (value.length > 0 && !value.match("^(([0-9]+\\.[0-9]*[1-9][0-9]*)|([0-9]*[1-9][0-9]*\\.[0-9]+)|([0-9]*[1-9][0-9]*))$")) {
          return false;
        }
        return true;
      },
      doAdjustCoefficient:function() {
        var vueObj = this;
        var bError = false;
        if (!this.validateAdjustRatio(this.quantityAdjustRatio)) {
            bError = true;
        }
        if (bError) {
          this.$message({
              message: '调整系数只能为大于0的数',
              type: 'info'
            });
        } else {
          var adjustRatio = 1;
          if (this.quantityAdjustRatio.length > 0) {
            adjustRatio = parseFloat(this.quantityAdjustRatio);
          }
          this.selected().forEach(function(item){
            for (var i in item) {
              if (i == 'quantity' || i.indexOf('quantity_') == 0) {
                item[i] = commJs().toDecimal(item[i] * adjustRatio);
              }
            }
          });

          gbqModel().save(function(){
            vueObj.getView();
          });

          this.quantityAdjustRatio = '';
          this.dialogAdjustCoefficient = false;
        }
      },
      getAlignment(row, prop) {
        if (prop == 'unit' || prop == 'osmSuplly') {
          return 'htCenter htMiddle';
        }

        if (prop=='baseRate'||prop=='RGF'||prop=='CLF'||prop=='wasteRate'||prop=='JXFC'||prop=='ZHQF'||prop=='outputTax'||prop=='rate'||prop=='quantity'||prop=='total'||prop.indexOf("quantity_")==0||prop.indexOf("total_")==0) {
          return 'htRight';
        }

        return 'htLeft';
      },
      getEditStyle(row, prop){
        // row未定义或prop未定义
        if(!row||prop===undefined){
          return 'readonly';
        }
        
        // 分部只有编码和名称可以改
        if (row.type =='分部') {
          if (prop=='code'||prop=='description') {
            return 'text';
          } else {
            return 'readonly';
          }
        }

        if (row.type == '清单') {
          if (row.itemType=='描述') {
            if (prop=='code'||prop=='description'||prop=='spec'||prop=='workScope'||prop=='Remark'||prop=='JLGZ') {
              return 'text';
            } else {
              return 'readonly';
            }  
          }

          if (prop=='code'||prop=='description'||prop=='unit'||prop=='rate'||prop=='total'||prop=='baseRate'||prop=='RGF'||prop=='JXFC'||prop=='jlgz'||prop.indexOf('total_')==0) {
            return 'readonly';
          }

          if (prop=='workScope'||prop=='Remark'||prop=='spec'||prop=='variant') {
            if (this.permission == 'gf') {
              return 'readonly';
            } else {
              return 'text';
            }  
          }

          if (prop=='quantity'||prop.indexOf('quantity_')==0) {
            if (this.permission == 'gf') {
              return 'readonly';
            } 
            if (this.catalog=='门窗工程') {
              if (row['hall'] > 0 && row['doorWindowArea'] > 0) {
                return 'readonly';  
              }
              return 'text';
            } else {
              return 'text';
            }   
          }

          if (prop=='osmSuplly') {
            if (this.permission == 'gf') {
              return 'readonlyCheck';  
            } else {
              return 'check';  
            }
          }

          if (prop=='CLF') {
            if (row.lockCLF != undefined && row.lockCLF) {
              return 'readonly'
            }

            // 含有工料机，直接计算否则可以输入
            var lmmDetail = gbqModel().getView('lmmDetail').filter(function(item) {
              return item.bqItemID==row.id;
            });
            if (lmmDetail&&lmmDetail.length > 0) {
              return 'readonly';
            } else {
              return 'text';
            }
          }

          if (prop=='wasteRate') {
            if (row.lockWasteRate) {
              return 'readonly';
            }

            return 'text';
          }

          if (prop=='bhf') {
            if (!row.osmSuplly) {
              return 'readonly';
            }
            if (row.lockBhf) {
              return 'readonly';
            }
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
        vueObj.$confirm('是否确认删除？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          gbqModel().delBQItem(vueObj.selected(), function(){
            vueObj.getView();
          });
        });
      },
      insertTitle: function(command){  //插入
        var vueObj = this;
        if (vueObj.selected().length > 1) {
          vueObj.$message({message: '无法进行多行插入!', type: 'info'});
          return;
        }
        if (vueObj.inSearch){
          vueObj.$message({message: '查找模式下无法插入!', type: 'info'});
          return;
        }
        var current = this.currentRecord();
        var row = this.currentRowNo();
        // 插入分部
        if(command=='title'){
          // 如果当前行不为空则插入同级分部
          if(current){
            if(current.type=='分部'){
              var newTitle = {};
              newTitle.description = '分部';
              newTitle.pid = current.pid;
              newTitle.level = current.level;
              var insertIdx = commJs().nextSibling(this.tableData, row);
              gbqModel().insertBQItemTitle(newTitle, insertIdx, function(){
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
            newTitle.description = '分部';
            newTitle.pid = null;
            gbqModel().insertBQItemTitle(newTitle, -1, function(){
              vueObj.getView();
              vueObj.setCurrentRow(vueObj.tableData[vueObj.tableData.length - 1]);
            });
          }
        }
        // 插入子分部
        else if(command=='subtitle'){
          // 自动展开当前记录
          if(current && current.type=='分部' && current.itemType != '子分部'){
            this.$refs.table.$emit('set-row-collapse', current, false);
            var newTitle = {};
            newTitle.description = '子分部';
            newTitle.itemType = '子分部';
            newTitle.pid = current.id;
            gbqModel().insertBQItemTitle(newTitle, row + 1, function(){
              vueObj.getView();
              vueObj.setCurrentRow(vueObj.tableData[row + 1]);
            });
          }else{
            this.$message({
              message: '只能在分部下插入子分部！',
              type: 'info'
            });
          }
        }
        // 插入描述行
        else{
          // 分部下插入
          if(current && current.type=='分部'){
            // 自动展开当前记录
            this.$refs.table.$emit('set-row-collapse', current, false);
            var newItem = {};
            newItem.description = '描述清单';
            newItem.pid = current.id;
            gbqModel().insertDescItem(newItem, row + 1, function(){
              vueObj.getView();
              vueObj.setCurrentRow(vueObj.tableData[row + 1]);
            });
          }else if(current && current.type=='清单'){
            var newItem = {};
            newItem.description = '描述清单';
            newItem.pid = current.pid;
            gbqModel().insertDescItem(newItem, row + 1, function(){
              vueObj.getView();
              vueObj.setCurrentRow(vueObj.tableData[row + 1]);
            });
          }else if(this.tableData.length == 0){
            var newItem = {};
            newItem.description = '描述清单';
            newItem.pid = null;
            gbqModel().insertDescItem(newItem, -1, function(){
              vueObj.getView();
              vueObj.setCurrentRow(vueObj.tableData[0]);
            });
          }else{
            this.$message({
              message: '请选中一行再点击插入！',
              type: 'info'
            });
          }
        }
      },
      insertBQItem: function(bqItem, lmmDetail, rateDict, rateDetail){
        var vueObj = this;
        if (vueObj.inSearch){
          vueObj.$message({message: '查找模式下无法插入!', type: 'info'});
          return;
        }

        var pid, recno;
        var current = this.currentRecord();
        var row = this.currentRowNo();
        if(current){
          if(current.type == '分部'){
            // 自动展开当前记录
            this.$refs.table.$emit('set-row-collapse', current, false);
            pid = current.id;
            recno = row + 1;
          }else{
            pid = current.pid;
            recno = row + 1;
          }
        }
        else{
          recno = -1;
          pid = null;
        }

        gbqModel().insertBQItemFromDB(bqItem, lmmDetail, rateDict, rateDetail, recno, pid, function(){
          vueObj.getView();
          if(recno==-1){
            recno = vueObj.tableData.length - 1;
          }
          vueObj.setCurrentRow(vueObj.tableData[recno]);
        });
      },
      rightMenuFn: function(fn){
        if(fn){
          this[fn[0]](fn[1],fn[2]);
        }
      },
      arrangeTitle: function(){  //分部整理
        var vueObj = this;
        gbqModel().arrangeBQItem(function(){
          vueObj.getView();
          vueObj.$message({
            message: '分部整理完成！',
            type: 'info'
          });
        });
      },
      delTitle: function(){
        var vueObj = this;
        gbqModel().delBQItemTitle(function(){
          vueObj.getView();
        });
      },
      setCurrentRow: function (row) {
        this.$refs.table.$emit('set-current-row', row);
      },
      refresh: function(){
        this.getView();
      },
      afterUpdate: function(row, prop){
        if(prop.indexOf('quantity_')==0 || prop == 'quantity'||prop=='CLF'||prop=='wasteRate'){
          if (isNaN(parseFloat(row[prop]))) {
            row[prop] = 0;
          }
          row[prop] = parseFloat(row[prop]);
          gbqModel().sumByBidNode(row, gbqModel().getView('bidNode'), 'quantity');
        }
        if (prop=='CLF') {
          row.tempCLF = row.CLF;
        }
        var vueObj = this;
        gbqModel().save(function(){
          vueObj.getView();
        });
      },
      exportQuantities: function() {
        var vueObj = this;
        gbqModel().read(function(project) {
          var data = {};
          data['project'] = project;
          request().excel(data, "FBFX", function(success) {
            request().download(success.file);
            vueObj.$message({
              message: '导出成功！',
              type: 'info'
            });
          });
        }, function(err) {

        });
      },
      importFill: function() {
        var vueObj = this;
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
            if (config.type != "GLJ") {
              this.$message({
                message: '请选择分部分项填含量 Excel 文件，其他类型或普通 Excel 缺少相应的导入信息，无法进行数据导入及计算！',
                type: 'info'
              });
              return;
            }
            for (var key in excelData) {
              var keyChar = commJs().trimNumber(key);
              if (keyChar == "I") {
                if (excelData[key] != "") {
                  var num = parseInt(commJs().getNum(key));
                  var codeField = "F" + num;
                  var lmmDetailId = excelData[codeField].v;
                  var item = gbqModel().queryDataByField('lmmDetail', 'id', lmmDetailId);
                  console.log(item);
                  var propObj = JSON.parse(excelData[keyChar + 1].v);
                  if (item) {
                    item[propObj.prop.replace("lmmDetail.", "")] = excelData[key].v;
                    console.log(item[propObj.prop.replace("lmmDetail.", "")]);
                    gbqModel().setDataByField('lmmDetail', 'id', item);
                  }
                }
              }
            }
            vueObj.dialogSelectExcel = false;
            gbqModel().save(function(){
              vueObj.getView();
              vueObj.$message({
                message: '导入成功！',
                type: 'info'
              });
            });
          });
        } else {
          this.$message({
            message: '请选择excel文件！',
            type: 'info'
          });
        }
      },
      importQuantities: function() {
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
            if (config.type != "FBFX") {
              this.$message({
                message: '请选择分部分项填量 Excel 文件，其他类型或普通 Excel 缺少相应的导入信息，无法进行数据导入及计算！',
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
            vueObj.dialogSelectExcel = false;
            vueObj.tableData.forEach(function(item){
              if (item.type != "清单" && item.itemType == "普通") {
                return;
              }
              for (var prop in item) {
                if(prop.indexOf('quantity_')==0 || prop == 'quantity'){
                  if (isNaN(parseFloat(item[prop]))) {
                    item[prop] = 0;
                  }
                  item[prop] = parseFloat(item[prop]);
                  gbqModel().sumByBidNode(item, gbqModel().getView('bidNode'), 'quantity');
                }
                if (prop=='CLF') {
                  item.tempCLF = item.CLF;
                }
              }
            });
            gbqModel().save(function(){
              vueObj.getView();
              vueObj.$message({
                message: '导入成功！',
                type: 'info'
              });
            });
          });
        }else{
          this.$message({
            message: '请选择excel文件！',
            type: 'info'
          });
        }
      },
      exportFill: function() {
        var vueObj = this;
        gbqModel().read(function(project) {
          var data = {};
          data['project'] = project;
          request().excel(data, "GLJ",function(success) {
            request().download(success.file);
            vueObj.$message({
              message: '导出成功！',
              type: 'info'
            });
          });
        }, function(err) {

        });
      },
      putTitle:function(command){
        var vueObj = this;
        if (command == "arrT") {
          vueObj.arrangeTitle();
        } else if (command == "delT") {
          vueObj.delTitle();
        }
      },
      exportExcel: function(command){
        var vueObj = this;
        if (command == "fill") {
          vueObj.exportFill();
        } else if (command == "quantities") {
          vueObj.exportQuantities();
        }
      },
      importExcel: function(command){
        this.excelType = command;
        this.dialogSelectExcel = true;
      },
      doImportExcel: function(){
        var vueObj = this;
        if (this.excelType == "fill") {
          vueObj.importFill();
        } else if (this.excelType == "quantities") {
          vueObj.importQuantities();
        }
      }
    },
  }

</script>
