<template>
  <div>
    <el-table
      class = "ui-mt20"
      :data="rateDetail"
      border
      height="408"
      style="width: 100%"
      @row-dblclick="">
      <el-table-column
        prop="rateCode"
        label="费用代码">
        <template scope="scope">
          <div class="readonly">
            <p>{{scope.row.rateCode}}</p>
          </div>
        </template>
      </el-table-column>
      <el-table-column
        prop="description"
        label="名称">
        <template scope="scope">
          <div class="readonly">
            <p>{{scope.row.description}}</p>
          </div>
        </template>
      </el-table-column>
      <el-table-column
        prop="baseAmount"
        label="计算基数">
        <template scope="scope">
          <div class="readonly">
            <p>{{scope.row.baseAmount}}</p>
          </div>
        </template>
      </el-table-column>
      <el-table-column
        prop="baseAmountRemark"
        label="基数说明"
        width="140">
        <template scope="scope">
          <div class="readonly">
            <p>{{scope.row.baseAmountRemark}}</p>
          </div>
        </template>
      </el-table-column>
      <el-table-column
        prop="ratio"
        label="费率(%)"
        width="140">
        <template scope="scope">
          <div class="readonly">
            <p>{{scope.row.ratio}}</p>
          </div>
        </template>
      </el-table-column>      
      <el-table-column
        prop="rateType"
        label="费用类别">
        <template scope="scope">
          <div class="readonly">
            <p>{{scope.row.rateType}}</p>
          </div>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
  import gbqModel from "../assets/js/gbq.model.js"; 
  import { bus } from '../assets/js/gbq.eventbus.js';  

  export default {
    name:'rateDetail',
    props: [],    
    methods: {      
      getRateDetailView: function (){
        this.rateDetail = gbqModel().getRateDetail(this.rateDictID);
      }
    },
    data: function(){
      return {   
        rateDictID: -1,
        rateDetail: [],             
      }
    },
    created: function(){      
      var vueObj = this;
      bus.$on('show-rateDetail', function(rateDictID){
        vueObj.rateDictID = rateDictID;
        vueObj.getRateDetailView();
      });
    },
  }

</script>