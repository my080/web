<template>  
  <div id="tableGrid2-grid" class="tableGrid"></div>    
</template>

<script>    
  import handsontable from "handsontable";  

  export default {
    name:'tableGrid2',
    props: [], 
    created: function(){
      var vueObj = this;
      // 注册renderer
      this.$on('show-grid', function(recordList, fieldList, getEditStyle, asTree, getAlignment, fixedColLeft){
        vueObj.recordList = recordList;        
        vueObj.fieldList = fieldList;                
        vueObj.getEditStyle = getEditStyle;
        vueObj.asTree = asTree;
        vueObj.fixedColLeft = fixedColLeft;
        vueObj.getAlignment = getAlignment;
        vueObj.buildGrid();        
      });    
      this.$on('set-current-row', function(row){  
        var index = vueObj.viewList.indexOf(row);
        vueObj.gridObj.selectCell(index, vueObj.asTree?2:1);                         
      });           
      this.$on('set-row-collapse', function(record, collapse){
        var index = vueObj.recordList.indexOf(record);
        if(index>=0){
          var curLevel = record.level;        
          vueObj.collapseID[record.id] = collapse;
          // 所有子记录保持一致        
          for(var i=index + 1;i<vueObj.recordList.length;i++){
            if(vueObj.recordList[i].level>curLevel){            
              vueObj.collapseID[vueObj.recordList[i].id] = collapse;
            }else{
              break;
            }
          };
          vueObj.buildGrid();
        }                
      });                
    },           
    data: function(){
      return {              
        isMutiHead: false,
        titleRowCount: 1,
        collapseID: {},
        gridObj: null,
        recordList: [],
        viewList: [],
        fieldList: [],        
        getRowClass: null,
        getEditStyle: null,                
        asTree: false,
        fixedColLeft: 0,
        getAlignment: null,
        params: {}
      }
    },  
    methods: {      
      getSelected: function(){
        if(this.gridObj&&this.viewList){
          var range = this.gridObj.getSelected();          
          if(range){
            var top = Math.min(range[0], range[2]);
            var bottom = Math.max(range[0], range[2]);            
            if(top > this.titleRowCount - 1){
              return this.viewList.slice(top, bottom + 1);  
            }else{
              return [];
            }            
          }else{
            return [];
          }  
        }else{
          return [];
        }
      },
      getCurrentRecord: function(){
        if(this.gridObj){
          var range = this.gridObj.getSelected();
          if(range){
            if(range[0]>this.titleRowCount - 1){
              return this.viewList[range[0]];  
            }else{
              return null;
            }            
          }else{
            return null;
          }  
        }else{
          return null;
        }
      },
      buildIconHtml: function(func, row, prop, className){
        return '<i func="'+func+'" class="'+className+'" row="'+row+'" prop="'+prop+'"></i>';        
      },     
      foldTr: function(row, prop, event){               
        var curRecord = this.viewList[row];        
        var curLevel = curRecord.level;        
        this.collapseID[curRecord.id] = !this.collapseID[curRecord.id];
        // 所有子记录保持一致                
        var nindex = this.recordList.indexOf(curRecord);
        if(nindex>=0){
          for(var i=nindex + 1;i<this.recordList.length;i++){
            if(this.recordList[i].level>curLevel){            
              this.collapseID[this.recordList[i].id] = this.collapseID[curRecord.id];              
            }else{
              break;
            }
          };     
        }        
        this.buildGrid();                   
      },
      btnClick: function(row, prop, event){
        var record = this.viewList[row];        
        this.$emit('btn-click', record, prop);
      },
      editButtonClick: function(row, prop, event){
        var record = this.viewList[row];                
        this.$emit('editButton-click', event.clientY, record, prop);
      },
      treeRenderer: function(instance, td, row, col, prop, value, cellProperties){        
        var record = this.viewList[row];  
        if(record.childCount>0){
          var className = (this.collapseID[record.id]?'el-icon-add ':'el-icon-reduce ') 
            + ' Level' + record.level;
          value = value||' ';
          var htmlStr = this.buildIconHtml('foldTr', row, prop, className) + value;          
          $(td).html(htmlStr);
        }else{
          var className = ' Level' + record.level;
          value = value||' ';
          var htmlStr = this.buildIconHtml('', row, prop, className) + value;          
          $(td).html(htmlStr);
        }                
      },
      rownoRenderer: function(instance, td, row, col, prop, value, cellProperties){          
        var record = this.viewList[row];
        $(td).html(this.recordList.indexOf(record) + 1);
      },  
      btnRenderer: function(instance, td, row, col, prop, value, cellProperties){             
        var htmlStr = this.buildIconHtml('btnClick', row, prop, 'el-icon-view');        
        $(td).html(htmlStr);           
        $(td).addClass('htCenter').addClass('htMiddle');                
      },    
      editButtonRenderer: function(instance, td, row, col, prop, value, cellProperties){               
        value = value||' ';       
        var htmlStr = value + this.buildIconHtml('editButtonClick', row, prop, 'el-icon-edit');
        $(td).html(htmlStr);        
      },
      bgColorRender: function(instance, td, row, col, prop, value, cellProperties){        
        var bgColor = instance.getSourceDataAtRow(row)["color"];
        if(bgColor){
          $(td).parent().addClass(bgColor);
        }
        $(td).html(value);     
      },
      getProp: function (row, col, prop){
        var cellProperties = {};   
        if(row<this.titleRowCount){          
          cellProperties.readOnly = true;
          cellProperties.className = 'htCenter htMiddle';
        }else{
          var record = this.viewList[row]; 
          var editStyle = this.getEditStyle(record, prop);  
          if(prop=='fixedCol'){
            cellProperties.renderer=this.rownoRenderer;
          }else if(col==1&&this.asTree){
            cellProperties.renderer=this.treeRenderer;  
          }
          
          if(editStyle=='readonly'){
            cellProperties.readOnly = true;
          }else if(editStyle=='check'){
            cellProperties.type = 'checkbox';
            cellProperties.className = 'htCenter htMiddle';
          }else if(editStyle=='btn'){            
            cellProperties.renderer = this.btnRenderer;
            cellProperties.readOnly = true;
          }else if(editStyle=='editButton'){
            cellProperties.renderer = this.editButtonRenderer;
          }else if (editStyle=='readonlyCheck') {
            cellProperties.readOnly = true;
            cellProperties.type = 'checkbox';
            cellProperties.className = 'htCenter htMiddle';
          }

          // 把那个颜色render加载这里吧
          if (prop=='spec') {
            cellProperties.renderer = this.bgColorRender;
          }

          if (this.getAlignment) {
            cellProperties.className = this.getAlignment(row, prop);
          }       
        }
        return cellProperties;
      },
      field2Column: function(field){
        var column = {};
        column.data = field.prop;
        if(field.options&&field.options.length>0){
          column.editor = 'select';
          column.selectOptions = field.options.map(function(op){return op.value;});
        }
        return column;
      },
      buildGridParams: function(){
        var vueObj = this;
        // 判断是否多级表头，最多二级
        vueObj.isMutiHead = false;
        var list = [{label:'#',prop:'fixedCol'}].concat(vueObj.fieldList);        
        list.forEach(function(item){
          if(item.childList&&item.childList.length>0){
            vueObj.isMutiHead = true;
          }
        });
        vueObj.titleRowCount = vueObj.isMutiHead?2:1;
        // 获取列prop和列宽
        var mColumns=[];
        var mColWidths = [];          
        var title = vueObj.isMutiHead?[{},{}]:[{}];
        var mergeCells = [];  
        var index = 0;
        list.forEach(function(item){  
          if(item.hide){
            return;
          }        

          if(vueObj.isMutiHead){
            if(item.childList&&item.childList.length>0){
              mergeCells.push({row:0, col:index, rowspan: 1, colspan:item.childList.length});              
              title[0][item.childList[0].prop] = item.label;
              item.childList.forEach(function(child){                
                mColumns.push(vueObj.field2Column(child));
                mColWidths.push(child.width);
                title[1][child.prop] = child.label;
                index = index + 1;
              });  
            }else{
              mColumns.push(vueObj.field2Column(item));                            
              mColWidths.push(item.width);    
              title[0][item.prop] = item.label;
              mergeCells.push({row:0, col:index, rowspan: 2, colspan:1});
              index = index + 1; 
            } 
          }else{
            mColumns.push(vueObj.field2Column(item));    
            mColWidths.push(item.width);    
            title[0][item.prop] = item.label;                        
          } 

        });

        // 获得属性      
        vueObj.viewList = title.concat(vueObj.recordList.filter(function(item){
          return !(item.pid&&vueObj.collapseID[item.pid]);
        }));       
        vueObj.params = {
          data: vueObj.viewList,
          colWidths: mColWidths,
          columns: mColumns,
          maxRows: vueObj.viewList.length,
          rowHeaders: false,
          colHeaders: false,   
          fillHandle: false, 
          mergeCells: mergeCells,      
          cells: vueObj.getProp, 
          outsideClickDeselects: false,
          fixedColumnsLeft: vueObj.fixedColLeft,
          viewportColumnRenderingOffset: 500,  
          // 选中行｛
          currentRowClassName: 'currentRow',
          // ｝选中行
          fixedRowsTop: vueObj.titleRowCount,          
        };
      },
      buildGrid: function(){
        var vueObj = this;        
        vueObj.buildGridParams();
        if(!vueObj.gridObj){
          vueObj.gridObj =new handsontable(vueObj.$el, vueObj.params);

          // 处理表头事件
          vueObj.gridObj.addHook('afterOnCellMouseDown', function(event, coords, TD){
            if(coords.row<vueObj.titleRowCount){
              vueObj.$emit('header-click', vueObj.params.columns[coords.col].data);
            }            
          });
          // 绑定修改后事件
          vueObj.gridObj.addHook('afterChange', function(changes, source){
            if(changes){
              changes.forEach(function(change){
                if(change[2]!=change[3]){                  
                  vueObj.$emit('after-update', vueObj.viewList[change[0]], change[1], change[2]);  
                }              
              });                        
            };            
          });         
          // 提供选中事件，同时不允许选中表头行
          vueObj.gridObj.addHook('afterSelectionEnd', function(r, c, r2, c2){ 
            var top=Math.min(r, r2);           
            if(top>=vueObj.titleRowCount){              
              vueObj.$emit('selection-change', vueObj.getSelected());  
              vueObj.$emit('current-change', vueObj.getCurrentRecord());              
            }else{              
              vueObj.gridObj.deselectCell();
            }            
          });             
          // 处理右键
          var contextmenu = vueObj.gridObj.getPlugin("contextMenu");  
          contextmenu.eventManager.addEventListener(vueObj.gridObj.rootElement, 'contextmenu', 
            function(event) {                
              event.preventDefault();  
              vueObj.$emit('row-contextmenu', event);                
            });   
          // 默认选择一个单元格
          if(vueObj.recordList.length>0){            
            vueObj.gridObj.selectCell(vueObj.titleRowCount, vueObj.asTree?2:1);     
          }          
          // 添加表格中的事件代理          
          $(vueObj.$el).on("click","i",function(event){
            var func = event.currentTarget.getAttribute('func');
            var row = event.currentTarget.getAttribute('row');
            var prop = event.currentTarget.getAttribute('prop');            
            if(func in vueObj){
              vueObj[func](row, prop, event);
            }
          });   
        }else{
          vueObj.gridObj.updateSettings(vueObj.params);          
        }        
      }
    },      
  }
</script>
