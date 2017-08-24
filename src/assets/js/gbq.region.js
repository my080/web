var region = process.env.COMPANY;
function getRegion(){
  return region;
}

function getTabs(catalog){ 
  if(region=="RONGCHUANG"){
    var tabs =  [
      {path:'/xmhf', description:'项目划分'},
      {path:'/gcgk', description:'工程概况'},
      {path:'/fbfx', description:'分部分项清单'}];
    if (catalog == '土建工程') {
      tabs.push({path:'/tsf', description: '土石方'});
    } else if (catalog == '消防工程') {
      tabs.push({path:'/qtxm', description: '其他项目'});
    } else if (catalog == '门窗工程') {
      tabs.push({path:'/mc', description:'门窗量填报'});
    }
    tabs.push({path:'/cl', description:'材料清单'});
    if (catalog == '门窗工程' || catalog == '幕墙工程') {
      tabs.push({path:'/xzbd', description: '线重表单'});
    }
    return tabs.concat([
      {path:'/fl', description:'费率清单'},
      {path:'/cs', description:'措施清单'},
      {path:'/lxxm', description:'零星清单'},
      {path:'/fyhz', description:'费用汇总'},
      {path:'/bbfx', description:'报表分析'}
    ]); 
  }else{
    return [      
      {path:'/xmhf', description:'项目划分'},
      {path:'/gcgk', description:'工程概况'},
      {path:'/fbfx', description:'分部分项清单'},
      {path:'/mc', description:'门窗量填报'}, 
      {path:'/rjf', description:'人机费清单'},      
      {path:'/cl', description:'材料清单'},
      {path:'/fl', description:'费率清单'},
      {path:'/cs', description:'措施清单'},
      {path:'/qt', description:'其他清单'},
      {path:'/fyhz', description:'费用汇总'},
      {path:'/bbfx', description:'报表分析'},
    ];
  }  
}

function initProjectData(project){
  if(region=="RONGCHUANG"){
    project.data.macro = [{}];
    project.data.bidNode = [];
    project.data.dayWork = [];
    project.data.bqItem = [];
    project.data.lmmDetail = [];   
    project.data.rateDict = [
      {id:1,description:"费率清单"}
    ];
    project.data.rateDetail = [
      {id:1, rateDictID: 1, description: '人工费', rateCode: 'A', baseAmount: 'RGF',
        baseAmountRemark: '人工费', rateType: '人工费', total_expr:'RGF'},
      {id:2, rateDictID: 1, description: '材料费', rateCode: 'B', baseAmount: 'CLF*(1+SH)',
        baseAmountRemark: '材料费*(1+损耗)', rateType: '材料费', total_expr:'CLF*(1+SH)'},
      {id:3, rateDictID: 1, description: '机械及辅材费', rateCode: 'C', baseAmount: 'JXFC',
        baseAmountRemark: '机械辅材费',  rateType: '机械辅材费', total_expr:'JXFC'},
      {id:4, rateDictID: 1, description: '综合取费', rateCode: 'D', baseAmount: 'A+B+C',
        baseAmountRemark: '人工费+材料费+机械辅材费', ratio: 3, rateType: '综合取费', total_expr:'(RGF+CLF*(1+SH)+JXFC)*3/100'},
      {id:5, rateDictID: 1, description: '增值税', rateCode: 'E', baseAmount: 'A+B+C+D',
        baseAmountRemark: '人工费+材料费+机械辅材费+综合取费', ratio: 11, rateType: '税金', total_expr:'(RGF+CLF*(1+SH)+JXFC+(RGF+CLF*(1+SH)+JXFC)*3/100)*11/100'},
      {id:6, rateDictID: 1, description: '综合单价', rateCode: 'F', baseAmount: 'A+B+C+D+E',
        baseAmountRemark: '人工费+材料费+机械辅材费+综合取费+增值税', rateType: '综合单价', total_expr:'RGF+CLF*(1+SH)+JXFC+(RGF+CLF*(1+SH)+JXFC)*3/100+(RGF+CLF*(1+SH)+JXFC+(RGF+CLF*(1+SH)+JXFC)*3/100)*11/100'},
    ];
    project.data.measureItem = [];
    project.data.resource = [];  
    project.data.countTable = []; 
    project.data.summary = [
      {id:1, pid:null, rateCode:'A', rateType: '分部分项费', description:'直接费', baseAmount:'FBFXF', baseAmountRemark:'分部分项费', ratio: '', total: 100, total_expr: 'FBFXF'},
      {id:2, pid:null, rateCode:'B', rateType: '措施费一', description:'措施费一', baseAmount:'CS1', baseAmountRemark:'措施费一', ratio: '', total: 100, total_expr: 'CS1'},
      {id:3, pid:null, rateCode:'C', rateType: '措施费二', description:'措施费二', baseAmount:'CS2', baseAmountRemark:'措施费二', ratio: '', total: 100, total_expr: 'CS2'},      
      {id:4, pid:null, rateCode:'D', rateType: '总造价', description:'总报价金额', baseAmount:'A+B+C', baseAmountRemark:'总报价金额', ratio: '', total: 100, total_expr: 'FBFXF+CS1+CS2'}
    ];
    project.data.projectSpec = [];
    project.data.projectInfo = {
      purchasePlanName: '', //采购计划名称
      projectName: '',      //工程名称
      company: '',          //公司名称
      region: '',           //地域
      quality: '',          //质量
      Duration: '',         //工期
    };
    project.data.tsf = [];
    project.data.qtxm = [];
    project.data.xzbd = [];      
    project.data.preface = '编制说明：';
  }else{
    project.data.bidNode = [];
    project.data.macro = [{}];    
    project.data.bqItem = [];
    project.data.lmmDetail = [];   
    project.data.rateDict = [];
    project.data.rateDetail = [];
    project.data.measureItem = [];
    project.data.resource = [];
    project.data.otherItemClass = [
      {id: 1, description: '其他项目', total: 0, calcStyle:1},    
    ];
    project.data.otherItem = [];
    project.data.summary = [
      {id:1, pid:null, rateCode:'A', description:'分部分项费', baseAmount:'FBFXF', ratio: 100, total: 100, total_expr: 'FBFXF*100/100'},
      {id:2, pid:null, rateCode:'B', description:'措施项目费', baseAmount:'CSXMF', ratio: 100, total: 100, total_expr: 'CSXMF*100/100'},
      {id:3, pid:null, rateCode:'C', description:'其他项目费', baseAmount:'QTXMF', ratio: 100, total: 100, total_expr: 'QTXMF*100/100'},
      {id:4, pid:null, rateCode:'D', description:'总造价', baseAmount:'A+B+C', ratio: 100, total: 300, total_expr: '(FBFXF*100/100)+(CSXMF*100/100)+(QTXMF*100/100)'},
    ];
    project.data.projectInfo = {
      itemName: '',     //项目名称
      projectName: '',  //工程名称
      projectNum: '',   //项目编号
      region: '',       //地域
      province: '',     //省
      city: '',         //市
      plan: '',         //合同规划
      classify: '',     //供方分类
      providerName: '', //供方名称
      contractNum: '',  //合同编号
      contractName: '', //合同名
      items: []         //自定义添加的Items
    };      
    project.data.preface = '编制说明：';  
  }
}

function getRule(catalog){
  var rules=[];
  if(region=='RONGCHUANG'){
    rules = [
      "rateDict.totalExpr:=filterTable('rateDetail', ['rateDictID','rateType'], [this.id, '综合单价']).length>0?filterTable('rateDetail', ['rateDictID','rateType'], [this.id, '综合单价'])[0].total_expr:'0'",
      "rateDict.zhqfExpr:=filterTable('rateDetail', ['rateDictID','rateType'], [this.id, '综合取费']).length>0?filterTable('rateDetail', ['rateDictID','rateType'], [this.id, '综合取费'])[0].total_expr:'0'",
      "rateDict.outputTaxExpr:=filterTable('rateDetail', ['rateDictID','rateType'], [this.id, '税金']).length>0?filterTable('rateDetail', ['rateDictID','rateType'], [this.id, '税金'])[0].total_expr:'0'",
      "bqItem.total:=(this.type!='清单'||this.itemType=='描述') ? sumByField(filterTable('bqItem', ['pid'], [this.id]), 'total') : toDecimal(this.rate * this.quantity)",    
      "bqItem.lmmDetailCount:=(this.type!='清单'||this.itemType=='描述') ? 0 : filterTable('lmmDetail', ['bqItemID'], [this.id]).length",
      "bqItem.CLF:=(this.type!='清单'||this.itemType=='描述') ? null : (this.lmmDetailCount>0 ? (sumByField(filterTable('lmmDetail', ['bqItemID'], [this.id]), 'usageAmount')) : (this.tempCLF ? this.tempCLF : null))",        
      "bqItem.rate:=(this.type!='清单'||this.itemType=='描述') ? null : calcExpr(this, filterTable('rateDict', ['id'], [this.rateDictID])[0].totalExpr)",
      "bqItem.ZHQF:=(this.type!='清单'||this.itemType=='描述') ? null : calcExpr(this, filterTable('rateDict', ['id'], [this.rateDictID])[0].zhqfExpr)",
      "bqItem.SH:=(this.type!='清单'||this.itemType=='描述')? null : (this.wasteRate||0)/100",
      "bqItem.outputTax:=(this.type!='清单'||this.itemType=='描述') ? null : calcExpr(this, filterTable('rateDict', ['id'], [this.rateDictID])[0].outputTaxExpr)",
      "bqItem.level:=(this.pid==null||this.pid==undefined) ? 0 : filterTable('bqItem', ['id'], [this.pid])[0].level + 1",
      "bqItem.childCount:=filterTable('bqItem', ['pid'], [this.id]).length",
      "bqItem.baseRate:=(this.type!='清单'||this.itemType=='描述') ? null : toDecimal(this.RGF + this.JXFC + this.CLF*(1+this.wasteRate/100))",
      "lmmDetail.rate:=filterTable('resource', ['id'], [this.resID])[0].rate",
      "lmmDetail.wasteRate:=filterTable('resource', ['id'], [this.resID])[0].wasteRate",
      "lmmDetail.quantity:=(this.usage||0)*filterTable('bqItem', ['id'], [this.bqItemID])[0].quantity",
      "lmmDetail.costTypeID:=filterTable('resource', ['id'], [this.resID])[0].costTypeID",
      "lmmDetail.usageAmount:=(this.rate||0) * (this.usage||0)*(1+(this.wasteRate||0))",
      "resource.quantity:=sumByField(filterTable('lmmDetail', ['resID'], [this.id]), 'quantity')",
      "resource.total:=toDecimal((this.rate||0)*this.quantity)",
      "measureItem.level:=(this.pid==null||this.pid==undefined) ? 0 : filterTable('measureItem', ['id'], [this.pid])[0].level + 1",          
      "measureItem.childCount:=filterTable('measureItem', ['pid'], [this.id]).length",
      "measureItem.total:=(this.type!='清单'||this.childCount>0)?sumByField(filterTable('measureItem', ['pid'], [this.id]), 'total'):toDecimal(this.rate*this.quantity)",  
      "macro.FBFXF:=sumByField(filterTable('bqItem', ['pid'], [null]), 'mutiTotal')",
      "macro.CSXMF:=sumByField(filterTable('measureItem', ['pid'], [null]), 'mutiTotal')",      
      "macro.LXXMF:=sumByField(filterTable('dayWork', ['pid'], [null]), 'total')",          
      "macro.CS1:=sumByField(filterTable('measureItem', ['description'], ['措施一']), 'mutiTotal')",
      "macro.CS2:=sumByField(filterTable('measureItem', ['description'], ['措施二']), 'mutiTotal')",
      "macro.RGF:=sumByField(filterTable('bqItem', ['type'], ['清单']), 'RGF')",
      "macro.JXFC:=sumByField(filterTable('bqItem', ['type'], ['清单']), 'JXFC')",
      "macro.CLF:=sumByField(filterTable('bqItem', ['type'], ['清单']), 'CLF')", 
      "macro.TSF:=sumByField(filterTable('tsf', ['type'], ['清单']), 'total')",
      "macro.QTXM:=sumByField(filterTable('qtxm', ['type'], ['清单']), 'total')", 
      "summary.total:=calcExpr(macro, this.total_expr)",            
      "bidNode.childCount:=filterTable('bidNode', ['pid'], [this.id]).length",
      "bidNode.level:=(this.pid==null||this.pid==undefined) ? 0 : filterTable('bidNode', ['id'], [this.pid])[0].level + 1",
      "dayWork.childCount:=filterTable('dayWork', ['pid'], [this.id]).length",
      "dayWork.level:=(this.pid==null||this.pid==undefined) ? 0 : filterTable('dayWork', ['id'], [this.pid])[0].level + 1",
      "dayWork.total:=this.type!='清单' ? sumByField(filterTable('dayWork', ['pid'], [this.id]), 'total') : toDecimal(this.rate * this.quantity)",
      "tsf.childCount:=filterTable('tsf', ['pid'], [this.id]).length",
      "tsf.level:=(this.pid==null||this.pid==undefined) ? 0 : filterTable('tsf', ['id'], [this.pid])[0].level + 1",
      "tsf.total:=this.type!='清单' ? sumByField(filterTable('tsf', ['pid'], [this.id]), 'total') : toDecimal(this.rate * this.quantity)",
      "qtxm.childCount:=filterTable('qtxm', ['pid'], [this.id]).length",
      "qtxm.level:=(this.pid==null||this.pid==undefined) ? 0 : filterTable('qtxm', ['id'], [this.pid])[0].level + 1",
      "qtxm.total:=this.type!='清单' ? sumByField(filterTable('qtxm', ['pid'], [this.id]), 'total') : toDecimal(this.rate * this.quantity)",
      "xzbd.level:=(this.pid==null||this.pid==undefined) ? 0 : filterTable('xzbd', ['id'], [this.pid])[0].level + 1",          
      "xzbd.childCount:=filterTable('xzbd', ['pid'], [this.id]).length",
    ];
  }else{
    rules = [
      "bqItem.total:=this.type=='分部' ? sumByField(filterTable('bqItem', ['pid'], [this.id]), 'total') : toDecimal(this.rate * this.quantity)",    
      "bqItem.CLF:=this.type=='分部'? null : sumByField(filterTable('lmmDetail', ['bqItemID'], [this.id]), 'usageAmount')",        
      "bqItem.rate:=this.type=='分部' ? null : calcExpr(this, filterTable('rateDetail', ['rateDictID', 'rateType'], [this.rateDictID, '综合单价'])[0].total_expr)",
      "bqItem.level:=(this.pid==null||this.pid==undefined) ? 0 : filterTable('bqItem', ['id'], [this.pid])[0].level + 1",
      "lmmDetail.rate:=filterTable('resource', ['id'], [this.resID])[0].rate",
      "lmmDetail.quantity:=this.usage*filterTable('bqItem', ['id'], [this.bqItemID])[0].quantity",
      "lmmDetail.costTypeID:=filterTable('resource', ['id'], [this.resID])[0].costTypeID",
      "lmmDetail.usageAmount:=this.rate * this.usage",
      "resource.quantity:=sumByField(filterTable('lmmDetail', ['resID'], [this.id]), 'quantity')",
      "resource.total:=toDecimal(this.rate*this.quantity)",
      "measureItem.level:=(this.pid==null||this.pid==undefined) ? 0 : filterTable('measureItem', ['id'], [this.pid])[0].level + 1",
      "measureItem.baseAmount_Value:=calcExpr(macro, this.baseAmount)",    
      "measureItem.total:=this.type=='分部'?sumByField(filterTable('measureItem', ['pid'], [this.id]), 'total'):(this.calcStyle=='按费率计算'?toDecimal(this.baseAmount_Value*this.ratio/100):toDecimal(this.ratio*this.quantity))",
      "otherItemClass.total:=sumByField(filterTable('otherItem', ['classID','pid'], [this.id,null]), 'total')",
      "otherItem.calcStyle:=filterTable('otherItemClass', ['id'], [this.classID])[0].calcStyle",
      "otherItem.baseAmount_Value:=calcExpr(macro, this.baseAmount)",
      "otherItem.total:=sumByField(filterTable('otherItem', ['pid'], [this.id]), 'total') + toDecimal(this.baseAmount_Value*this.ratio/100)",
      "otherItem.level:=(this.pid==null||this.pid==undefined) ? 0 : filterTable('otherItem', ['id'], [this.pid])[0].level + 1",
      "macro.FBFXF:=sumByField(filterTable('bqItem', ['pid'], [null]), 'total')",
      "macro.CSXMF:=sumByField(filterTable('measureItem', ['pid'], [null]), 'total')",
      "macro.QTXMF:=sumByField(filterTable('otherItemClass', ['description'], ['其他项目']), 'total')",
      "macro.LXXMF:=sumByField(filterTable('otherItemClass', ['description'], ['零星项目']), 'total')",    
      "macro.RGF:=sumByField(filterTable('bqItem', ['type'], ['清单']), 'RGF')",
      "macro.JXFC:=sumByField(filterTable('bqItem', ['type'], ['清单']), 'JXFC')",
      "macro.CLF:=sumByField(filterTable('bqItem', ['type'], ['清单']), 'CLF')",    
      "summary.total:=calcExpr(macro, this.total_expr)",
      "bqItem.childCount:=filterTable('bqItem', ['pid'], [this.id]).length",
      "measureItem.childCount:=filterTable('measureItem', ['pid'], [this.id]).length",
      "otherItem.childCount:=filterTable('otherItem', ['pid'], [this.id]).length",
    ];
  }
  return rules.map(function(item){
    var sLeft, sRight, sTableName, sFieldName;
    [sLeft, sRight] = item.split(':=');
    [sTableName, sFieldName] = sLeft.split('.');
    return {
      'tableName': sTableName,
      'fieldName': sFieldName,
      'expr': sRight
    };
  });   
}

function addDynamicRules(data, rules){  
  if(region=='RONGCHUANG'){            
    if(data.bidNode&&data.bidNode.length>0){
      // 添加total_字段的计算
      var expr = "(this.type!='清单'||this.itemType=='描述'||this.childCount>0)?sumByField(filterTable('@tableName', ['pid'], [this.id]), 'total_@nodeID') : toDecimal(this.rate*this.quantity_@nodeID)";
      data.bidNode.forEach(function(node){      
        rules.push({tableName: 'bqItem', fieldName: 'total_' + node.id, 
          expr: expr.replace('@tableName', 'bqItem').split('@nodeID').join(node.id)});      
        rules.push({tableName: 'measureItem', fieldName: 'total_' + node.id, 
          expr: expr.replace('@tableName', 'measureItem').split('@nodeID').join(node.id)});
      });      
      // 处理倍数的计算          
      var mutiExpr = data.bidNode.map(function(node){
        if(node.pid==null&&node.count){                
          return 'this.total_' + node.id + '*' + node.count;  
        }else{
          return 0;
        }        
      }).join('+');      
      rules.push({tableName: 'bqItem', fieldName: 'mutiTotal', expr: mutiExpr});
      rules.push({tableName: 'measureItem', fieldName: 'mutiTotal', expr: mutiExpr});  
    }else{
      rules.push({tableName: 'bqItem', fieldName: 'mutiTotal', expr: 'this.total'});
      rules.push({tableName: 'measureItem', fieldName: 'mutiTotal', expr: 'this.total'});
    }    
  }  
  return rules;   
}

export default function region(){
  return {
    getRegion: getRegion,
    getTabs: getTabs,
    getRule: getRule,
    initProjectData: initProjectData,
    addDynamicRules: addDynamicRules
  }
}