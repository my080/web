<template>  
    <el-table
      class="tableGrid"
      ref="mainGrid"
      highlight-current-row
      :data="recordList"
      :selectedRows="selectedRows"
      :row-class-name="rowClassName"
      :row-style='rowStyle'  
      :row-key='rowKey'
      height="100%"
      border      
      style="width: 100%;height:100%"
      oncontextmenu=return(false)
      @header-click='headClick'
      @current-change='currentChange'
      @cell-click="cellClick"
      @row-click='rowClick'          
      @row-contextmenu="contextMenu">
      <el-table-column v-if="showRecNo"
        fixed
        align="center"
        type="index"
        width="55">
      </el-table-column>
      <el-table-column 
        v-if="!field.hide"
        v-for="(field, index) in fieldList"           
        header-align="center"
        :align=field.align
        :prop=field.prop
        :label=field.label
        :width=field.width>    
        <el-table-column            
          v-if="field.childList&&field.childList.length>0"       
          v-for="child in field.childList"       
          header-align="center"
          :prop=child.prop
          :label=child.label
          :width=child.width>       

          <template scope="scope">     
          <div v-if="child.childList==null||child.childList.length==0" class="edit">
            <el-input  type="text" v-model="scope.row[child.prop]"  @blur="onBlur(scope.row, child)">                 
            </el-input>
          </div>  
          </template>

          <el-table-column         
            v-for="leaf in child.childList"  
            header-align="center"     
            :prop=leaf.prop
            :label=leaf.label
            :width=leaf.width>    
            <template scope="scope">        
            <div class="edit">
              <el-input type="text" v-model="scope.row[leaf.prop]" @blur="onBlur(scope.row, leaf)"></el-input>
            </div>    
            </template>
          </el-table-column>                           
        </el-table-column>
        

        <template scope="scope">                   
          <template v-if="asTree&&(index==0)&&(scope.row.childCount>0)">
            <div class="edit">
              <p>
                <i :class="collapseID[scope.row.id]?'el-icon-add':'el-icon-reduce'"  
                v-on:click="foldTr(scope.$index)" ></i>
                <span><el-input class="icon-input_inner" v-model="scope.row[field.prop]" @blur="onBlur(scope.row, field)"></el-input></span>
              </p>
            </div>
          </template>                     
          <template v-else-if="editStyle(scope.row, field)=='text'">
            <div class="edit">
              <el-input type="textarea" autosize v-model="scope.row[field.prop]" @blur="onBlur(scope.row, field)"></el-input>
            </div>
          </template>
          <template v-else-if="editStyle(scope.row, field)=='check'">
            <div class="check">
              <el-checkbox  v-model="scope.row[field.prop]" @change="selectChange(scope.row, field)"></el-checkbox>
            </div>
          </template>
          <template v-else-if="editStyle(scope.row, field)=='btn'">
            <div class="middle readonly">
              <p><i class="el-icon-view" @click="btnClick(scope.row, field)"></i></p>
            </div>
          </template>          
          <template v-else-if="editStyle(scope.row, field)=='select'">
            <el-select class="edit" v-model="scope.row[field.prop]" placeholder="请选择" clearable @input="selectChange(scope.row, field)">
              <el-option
                v-for="item in field.options"
                :key="item.value"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
          </template>      
          <template v-else-if="editStyle(scope.row, field)=='editButton'">
            <div class="edit">
              <el-input                 
                autosize v-model="scope.row[field.prop]" 
                placeholder="" 
                icon="edit"     
                @blur="onBlur(scope.row, field)"           
                @click="handleIconClick($event, scope.row, field)"></el-input>
            </div>
          </template>     
          <template v-else>
            <div class="readonly">
              <pre>{{scope.row[field.prop]}}</pre>
            </div>
          </template>
        </template>     
        
      </el-table-column>
    </el-table>  
</template>

<script>    
  export default {
    name:'tableGrid',
    props: ['recordList', 'fieldList', 'showRecNo', 'getRowClass', 'getEditStyle', 'asTree'],
    created: function(){
      var vueObj = this;
      this.$on('set-current-row', function(row){                   
        vueObj.setCurrent(row);
      });
      this.$on('set-current-rowno', function(rowno){                   
        if(rowno>=0&&rowno<vueObj.recordList.length){
          vueObj.setCurrent(vueObj.recordList[rowno]);  
        }else{
          vueObj.selectedRows=[];
        }        
      });      
      this.$on('set-row-collapse', function(index, collapse){
        if(index<0||index>=vueObj.recordList.length){
          return;
        }
        var curRecord = vueObj.recordList[index];        
        var curLevel = curRecord.level;        
        vueObj.collapseID[curRecord.id] = collapse;
        // 所有子记录保持一致        
        for(var i=index + 1;i<vueObj.recordList.length;i++){
          if(vueObj.recordList[i].level>curLevel){            
            vueObj.collapseID[vueObj.recordList[i].id] = collapse;
          }else{
            break;
          }
        };
      });     
    },    
    mounted: function(){
      var vueObj = this;       

      $('.tableGrid').on("change","textarea",function(){
        vueObj.hasChanged = true;
      });    
      $('.tableGrid').on("change","input",function(){
        vueObj.hasChanged = true;
      });      

      $(".el-table__body-wrapper").off("scroll.loadScroll");
      $(".el-table__body-wrapper").on("scroll.loadScroll",function(){
        if(!vueObj.isLoading){                  
          var scrollTop = $(this).scrollTop();          
          var clientHeight = $(this)[0].clientHeight;
          var scrollHeight = $(this)[0].scrollHeight;
          // 往下滚
          if(scrollTop > vueObj.lastTop){
            // 如果到底
            if(scrollTop + clientHeight == scrollHeight){
              vueObj.showTop = vueObj.recordList.length - 50;
              vueObj.showBottom = vueObj.recordList.length;
            }
            else if(scrollTop + clientHeight > scrollHeight - 200){
              vueObj.showTop = Math.min(vueObj.showTop + 10, vueObj.recordList.length - 50);
              vueObj.showBottom = Math.min(vueObj.showBottom + 10, vueObj.recordList.length);
            }
          }
          // 往上滚
          else if(scrollTop < vueObj.lastTop){
            // 如果到顶部
            if(scrollTop == 0){
              vueObj.showTop = 0;
              vueObj.showBottom = 50;
            }
            else if(scrollTop < 200){
              vueObj.showTop = Math.max(vueObj.showTop - 10, 0);
              vueObj.showBottom = Math.max(vueObj.showBottom - 10, 50);
            } 
          }                   
          // 保存当前位置
          vueObj.lastTop = scrollTop;                                        
        }
      });   
    },
    data: function(){
      return {              
        selectedRows: [], 
        selectedID: {},  
        collapseID: {},     
        curRow: '',
        lastTop: 0,
        showTop: 0,
        showBottom: 50,        
        hasChanged: false
      }
    },  
    methods: {    
      cellClick: function(row, column, cell, event){
        this.$emit('cell-click', row, column, cell, event);      
      },      
      onBlur: function(row, field){        
        if(this.hasChanged){
          this.$emit('after-update', row, field);      
        }
        
        this.hasChanged = false;   
      },
      headClick: function(column, event){
        this.$emit('header-click', column, event);
      },
      handleIconClick: function(event, row, column){        
        this.$emit('editButton-click', event.clientY, row, column);
      },
      foldTr: function(index){        
        var curRecord = this.recordList[index];        
        var curLevel = curRecord.level;        
        this.collapseID[curRecord.id] = !this.collapseID[curRecord.id];
        // 所有子记录保持一致        
        for(var i=index + 1;i<this.recordList.length;i++){
          if(this.recordList[i].level>curLevel){            
            this.collapseID[this.recordList[i].id] = this.collapseID[curRecord.id];
          }else{
            break;
          }
        };
                
        // 通过设置当前行来触发rowstyle
        this.$refs.mainGrid.setCurrentRow();
      },
      rowKey: function(row){        
        return row.id;
      },
      rowStyle: function(row, index){        
        if(index>this.showBottom||index<this.showTop){          
          return 'display:none;';
        }else{          
          if(row.pid&&this.collapseID[row.pid]){
            return 'display:none;';
          }else{
            return '';  
          }          
        }
      },
      setCurrent: function(row){     
        if(row==null||row==undefined){
          this.$refs.mainGrid.setCurrentRow();
          this.selectedRows=[];  
        }else{
          this.$refs.mainGrid.setCurrentRow(row);  
          this.selectedRows=[];
          this.selectedRows.push(row);
        }                 
      },  
      contextMenu: function(row, event){
        this.$emit('row-contextmenu', row, event);        
      },
      rowClassName: function(row, index){        
        // 初始化
        var vueObj = this;
        var className='';

        // 选中边框条件判断
        if(vueObj.selectedRows.indexOf(row)>=0){
          className = 'selection';
          if (vueObj.selectedRows.length == 1) {            
            className = className + " selection_start selection_end";
          } else {
            // 第一行
            if (index == 0 || vueObj.selectedRows.indexOf(vueObj.recordList[index - 1]) < 0) {                        
              className = className + " selection_start";
            }
            // 最后一行
            if (index == vueObj.recordList.length - 1 || vueObj.selectedRows.indexOf(vueObj.recordList[index + 1]) < 0) {
              className = className + " selection_end";             
            }
          }
        }
                
        // 处理级别        
        if('level' in row){
         className = className + ' Level' + row.level;
        }

        // 处理回调
        if(this.getRowClass){
          className = className + ' ' + this.getRowClass(row);
        }

        return className;        
      },
      editStyle: function(row, column){        
        if(row!=this.curRow && !column.visible){
          return 'readonly';
        }else if(this.getEditStyle){
          return this.getEditStyle(row, column);
        }else{
          return 'readonly';  
        }        
      },
      btnClick: function(row, column){        
        this.$emit('btn-click', row, column);
      },
      rowClick: function(row, event, column){
        var vueObj = this;
        if(event.ctrlKey){
          var idx = this.selectedRows.indexOf(row);
          if(idx==-1){
            this.selectedRows.push(row);
          }
          else{
            this.selectedRows.splice(idx, 1);
          }
        }
        else if(event.shiftKey && this.selectedRows.length==1){
          window.getSelection().removeAllRanges();
          var lastIdx = this.recordList.indexOf(this.selectedRows[0]);
          var idx = this.recordList.indexOf(row);
          var [top, bottom] = lastIdx<idx ? [lastIdx, idx] : [idx, lastIdx];                    
          this.selectedRows = this.recordList.slice(top, bottom+1);     
        }
        else{
          this.selectedRows=[];
          this.selectedRows.push(row);
        }
        this.$emit('selection-change', this.selectedRows);        
      },
      currentChange: function(currentRow, oldCurrentRow){
        if (this.selectedRows.length > 1 && (event.ctrlKey || event.shiftKey)) {
          return;
        }
        this.curRow = currentRow;
        if(currentRow!=oldCurrentRow){
          this.$emit('current-change', currentRow, oldCurrentRow);
        }             
      },
      selectChange: function(row, field){        
        this.$emit('after-update', row, field);
      },       
      innerTableSelect: function(row){
        console.log(row);
      },
    },
      
  }
</script>
