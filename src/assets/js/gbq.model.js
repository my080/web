// 包含所有的业务逻辑和业务操作（禁止包含任何与dom相关的内容）
import request from "./gbq.request.js";
import ruleEngine from "./gbq.ruleEngine.js";
import region from "./gbq.region.js";

if (!window.indexedDB) {
  window.alert("Your browser doesn't support a stable version of IndexedDB. Such and such feature will not be available.");
}

var bqDBPool={};
var curProject=null;
var projectID=sessionStorage.getItem('projectID');

// 打开工程
function openProject(id, onSuccess, onError){    
  projectID = id;
  sessionStorage.setItem('projectID', projectID);    
  request().readProject(projectID, function(data){         
    curProject = data;
    curProject.rules = region().getRule(curProject.catalog);
    if(onSuccess){
      save(onSuccess, onError);      
    }        
  }, onError);
}

// 获取当前工程数据
function read(onSuccess, onError) {  
  if(curProject){
    onSuccess(curProject);
  }else{    
    var openRequest = window.indexedDB.open("GBQ", 400);
    openRequest.onerror = onError;
    openRequest.onsuccess = function(event) {
      var db = event.target.result;
      var store = db.transaction(["project"], "readonly").objectStore("project");    
      var request = store.get(projectID);
      request.onerror = onError;
      request.onsuccess = function(e){      
        curProject = e.target.result; 
        if(onSuccess){          
          onSuccess(curProject);
        };        
      }
    };    
    openRequest.onupgradeneeded = function(event) { 
      var db = event.target.result;
      if(!db.objectStoreNames.contains('project')){
        db.createObjectStore('project',{keyPath:"_id"});                
      }      
    };  
  }  
}

function toDecimal(value){
  if(isNaN(value)){
    return 0;
  }
  return Math.round(value * 100) / 100;    
}

// 保存当前工程到本地
function save(onSuccess, onError) {  
  if(curProject){
    // 删除不被引用的材料
    var resIDMap = {};
    curProject.data.lmmDetail.forEach(function(item){
      resIDMap[item.resID] = true;
    });
    curProject.data.resource = curProject.data.resource.filter(function(item){
      return resIDMap[item.id] == true;
    });       

    // 计算模型
    var rules = curProject.rules.slice(0, curProject.rules.length);
    region().addDynamicRules(curProject.data, rules);
    ruleEngine().calcModel(curProject.data, rules);   
         
      
    // 保存到indexDB
    var openRequest = window.indexedDB.open("GBQ", 400);
    openRequest.onerror = onError;
    openRequest.onsuccess = function(event) {
      var db = event.target.result;    
      var store = db.transaction(["project"], "readwrite").objectStore("project");
      var updateRequest = store.put(curProject);
      updateRequest.onerror = onError;
      updateRequest.onsuccess = function(e){
        if(onSuccess){
            onSuccess(curProject);
        }        
      };    
    };  
    openRequest.onupgradeneeded = function(event) { 
      var db = event.target.result;    
      if(!db.objectStoreNames.contains('project')){
        db.createObjectStore('project',{keyPath:"_id"});                          
      }     
    };
  }else{
    onError();
  }  
}

// 提交数据到服务器
function commit(onSuccess, onError){    
  request().updateProject(projectID, curProject, onSuccess, onError);
}

// 获取表数据 start
function getView(tableName) {
  if(!curProject.data[tableName]){
    curProject.data[tableName] = [];
    curProject.newID[tableName] = 1;
  }
  return curProject.data[tableName];  
}

function unique(array){ 
  var n = [array[0]]; //结果数组 
  //从第二项开始遍历 
  for(var i = 1; i < array.length; i++) { 
  //如果当前数组的第i项在当前数组中第一次出现的位置不是i， 
  //那么表示第i项是重复的，忽略掉。否则存入结果数组 
  if (array.indexOf(array[i]) == i) n.push(array[i]); 
  } 
  return n; 
}

// 移动记录 start
function moveRec(tableName, srcRec, dstRec, hasLevel, onSuccess, onError) {
  var table = curProject.data[tableName];
  var src = curProject.data[tableName].indexOf(srcRec);
  var dst = curProject.data[tableName].indexOf(dstRec);
  
  if(hasLevel){
    // 得到src要移动的记录条数(包含孩子一起移动)    
    var srcChild = 0;
    for(var i=src+1;i<table.length;i++){
      if(table[i].level>table[src].level){
        srcChild = srcChild + 1;
      }else{
        break;
      }
    }
    // 得到dst要移动的记录条数（包含孩子一起)
    var dstChild = 0;
    for(var i=dst+1;i<table.length;i++){
      if(table[i].level>table[src].level){
        dstChild = dstChild + 1;
      }else{
        break;
      }
    } 
    // 插入相应位置  
    if(dst > src){      
      curProject.data[tableName] = table.slice(0, src).concat(table.slice(dst, dst + dstChild + 1)).
        concat(table.slice(src + srcChild + 1, dst)).concat(table.slice(src, src + srcChild + 1)).concat(table.slice(dst + dstChild + 1));  
    }else{
      curProject.data[tableName] = table.slice(0, dst).concat(table.slice(src, src + srcChild + 1)).
        concat(table.slice(dst, dst + dstChild + 1)).concat(table.slice(dst + dstChild + 1, src)).concat(table.slice(src + srcChild + 1));
    }
  }else{     
    var temp = table[dst];
    table[dst] = table[src];
    table[src] = temp;
  }
  save(onSuccess, onError);
}

// 上移
function moveUp(tableName, recno, hasLevel, onSuccess, onError){
  var table = curProject.data[tableName];
  if(hasLevel){
    var level = table[recno].level;
    // 找到上一个同级节点的位置    
    for(var i=recno-1;i>=0;i--){
      if(table[i].level == level){        
        moveRec(tableName, table[recno], table[i], hasLevel, onSuccess, onError);
        break;
      }else if(table[i].level < level){
        break;
      }
    }    
  }else{
    if(recno > 0){
      moveRec(tableName, table[recno], table[recno - 1], hasLevel, onSuccess, onError);  
    }
  }  
}

// 下移
function moveDown(tableName, recno, hasLevel, onSuccess, onError){
  var table = curProject.data[tableName];
  if(hasLevel){
    var level = table[recno].level;
    // 找到下一个同级节点的位置    
    for(var i=recno+1;i<table.length;i++){
      if(table[i].level == level){
        moveRec(tableName, table[recno], table[i], hasLevel, onSuccess, onError);        
        break;
      }else if(table[i].level < level){
        break;
      }
    } 
  }else{        
    if (recno < table.length - 1) {
      moveRec(tableName, table[recno], table[recno + 1], hasLevel, onSuccess, onError);
    }  

  } 
}

function getColomnsSetting(tableName) {
  if (!curProject.colomnSetting) {
    curProject.colomnSetting = {};
  }
  return curProject.colomnSetting[tableName];
}

function setColomnSetting(tableName, setting) {
  curProject.colomnSetting[tableName] = JSON.parse(JSON.stringify(setting));
}

function getNewID(tableName){
  if(!curProject.newID){
    curProject.newID={};
  }
  if(!curProject.newID[tableName]){
    curProject.newID[tableName] = 1;
    curProject.data[tableName].forEach(function(item){
      curProject.newID[tableName] = Math.max(item.id + 1, curProject.newID[tableName]);
    });
  }
  var result = curProject.newID[tableName];
  curProject.newID[tableName] = curProject.newID[tableName] + 1;
  return result;
}

// 插入记录
function insertRec(tableName, record, recno){
  record.id = getNewID(tableName);  
  if(recno < 0){
    recno = curProject.data[tableName].length;
  };  
  curProject.data[tableName].splice(recno, 0, record);
}

function forceRateDict(rateDict, rateDetail){      
  var finded = curProject.data.rateDict.filter(function(item){
    return item.description == rateDict[0].Description;
  });

  if(finded.length == 0){  
    // 处理一下字段名称
    var newDict = rateDict.map(function(item){
      return {description: item.Description, rateDictID: item.Key};
    });
    var newDetail = rateDetail.map(function(item){
      return {description: item.Description, rateCode: item.RateCode, baseAmount: item.BaseAmount,
        baseAmountRemark: item.BaseAmountRemark, ratio: item.Ratio, rateType: item.RateType};
    });
    var [result, info] = compileCalcTable(
      newDetail, 'rateCode', 'baseAmount', 'ratio', 'total_expr', ['RGF', 'CLF','JXFC']);  
    if(result){
      insertRec('rateDict', newDict[0], -1);
      newDetail.forEach(function(item){
        item.rateDictID = newDict[0].id;
        insertRec('rateDetail', item, -1);
      });  
      return newDict[0].id
    }else{
      console.log('errInfo:' + info);
      return null;
    }                    
  }else{
    return finded[0].id;
  }
}

function forceResource(resObj){
  var finded = curProject.data.resource.filter(function(item){
    return item.code == resObj.Code;
  });
  if(finded.length == 0){
    var newRes = {};    
    newRes.code = resObj.Code;    
    newRes.description = resObj.Description;
    newRes.spec = resObj.Spec;
    newRes.unit = resObj.Unit;
    newRes.costTypeID = resObj.CostTypeID;    
    newRes.brand = resObj.Brand;
    newRes.wasteRate = resObj.WasteRate||null;
    newRes.rate = resObj.MarketRate;
    insertRec('resource', newRes, -1);    
    return newRes.id;
  }else{
    return finded[0].id;
  }
}

function isSameProject(pid) {
  if (curProject['_id'] == pid) {
    return true;
  } else {
    return false;
  }
}

// 通过id查找记录
function findByID(tableName, id){
  var list = curProject.data[tableName].filter(function(item){
    return item.id == id;
  });
  if(list.length > 0){
    return list[0];
  }
  else{
    return null;
  }
}

function savePreface(preface, onSuccess, onError){
  curProject.data.preface = preface;
  save(onSuccess, onError);
}

function saveProjectInfo(projectInfo, onSuccess, onError){
  curProject.data.projectInfo = projectInfo;
  save(onSuccess, onError); 
}

function saveProjectSpec(projectSpec, onSuccess, onError) {
  curProject.data['projectSpec'] = projectSpec;
  save(onSuccess, onError);
}

// 获取项目特征
function getProjectSpec(onSuccess) {
  request().getProjectSpec(curProject.catalogID, onSuccess);
}

// 获取清单库列表
function getBQDBs(onSuccess, onError){  
  request().getBQDBs(onSuccess);
}

function getBQDB(DBID, onSuccess, onError){
  if(bqDBPool[DBID]){    
    onSuccess(bqDBPool[DBID]);    
  }else{
    request().getBQDB(DBID, 
      function(data){
        bqDBPool[DBID]=data;
        if(onSuccess){
          onSuccess(bqDBPool[DBID]);  
        }        
      }, 
      onError);  
  }      
}

// 得到流水码
function getOrdCode(code, bqItemList){
  var len = code.length + 3;
  var max = 1;
  bqItemList.forEach(function(item){    
    if((item.type=='清单')&&item.code&&(item.code.length==len)){
      var temp = item.code.slice(0, len - 3);
      if(temp==code){
        max = Math.max(max, parseInt(item.code.substr(-3)) + 1);
      } 
    }    
  });  
  if(max>=100){
    return max.toString();
  }else if(max>=10){
    return '0' + max.toString();
  }else{
    return '00' + max.toString();
  }
}

//从清单库中插入清单
function insertBQItemFromDB(bqItemObj, lmmDetail, rateDict, rateDetail, recno, PID, onSuccess, onError){
  // 增加清单
  var bqItem = {};  
  bqItem.pid = PID;  
  bqItem.code = bqItemObj.Code + getOrdCode(bqItemObj.Code, curProject.data.bqItem);
  bqItem.description = bqItemObj.Description;
  bqItem.spec = bqItemObj.Spec;
  if(bqItemObj.ItemType){
    bqItem.itemType = bqItemObj.ItemType;  
  }else{
    bqItem.itemType = '普通';
  }  
  bqItem.workScope = bqItemObj.WorkScope;
  bqItem.unit = bqItemObj.Unit;
  bqItem.jlgz = bqItemObj.JLGZ;
  bqItem.type = '清单';
  bqItem.quantity = 0;  
  bqItem.sectionID = bqItemObj.SectionID;
  bqItem.sectionCode = bqItemObj.SectionCode;
  bqItem.sectionName = bqItemObj.SectionName;
  bqItem.RGF = bqItemObj.LaborRate||0;
  bqItem.JXFC = bqItemObj.MachineRate||0;
  bqItem.wasteRate = bqItemObj.WasteRate||null;
  
  // 增加单价构成    
  if(rateDict&&rateDetail){
    bqItem.rateDictID = forceRateDict(rateDict, rateDetail);  
  }else if(curProject.data.rateDict&&curProject.data.rateDict.length>0){
    bqItem.rateDictID = curProject.data.rateDict[0].id;
  }
  
  // 插入清单
  insertRec('bqItem', bqItem, recno);  
  // 增加含量  
  lmmDetail.forEach(function(item){
    var lmm = {};    
    lmm.resID = forceResource(item.resource);
    lmm.usage = item.UsageValue;
    lmm.bqItemID = bqItem.id;
    insertRec('lmmDetail', lmm, -1);    
  });        
  save(onSuccess, onError);
}

// 从清单库插入措施项目
function insertMeasureItemFromDB(bqItemObj, lmmDetail, rateDict, rateDetail, recno, PID, type, onSuccess, onError){
  // 增加清单
  var measureItem = {};  
  measureItem.pid = PID;  
  measureItem.code = bqItemObj.Code;
  measureItem.description = bqItemObj.Description;
  measureItem.spec = bqItemObj.Spec;
  measureItem.workScope = bqItemObj.WorkScope;
  measureItem.unit = bqItemObj.Unit;
  measureItem.jlgz = bqItemObj.JLGZ;
  measureItem.type = '清单';
  measureItem.baseAmount = '';
  measureItem.calcStyle = '按单价计算';
  measureItem.ratio = 0;
  measureItem.total = 0;
  measureItem.rate = bqItemObj.BaseRate||null;
  measureItem.RGF = bqItemObj.LaborRate||0;
  measureItem.JXFC = bqItemObj.MachineRate||0;
  measureItem.wasteRate = bqItemObj.Wastage||0;
  measureItem.isInStore = true;
  measureItem.itemType = type;
    
  // 插入清单
  insertRec('measureItem', measureItem, recno);  
        
  save(onSuccess, onError);
}

// 从清单库插入零星清单
function insertDayWorkFromDB(bqItemObj, lmmDetail, rateDict, rateDetail, recno, PID, onSuccess, onError){
  // 增加清单
  var dayWork = {};  
  dayWork.pid = PID;  
  dayWork.code = bqItemObj.Code;
  dayWork.description = bqItemObj.Description;
  dayWork.spec = bqItemObj.Spec;  
  dayWork.unit = bqItemObj.Unit;  
  dayWork.type = '清单';
  dayWork.rate = bqItemObj.BaseRate||0;
  dayWork.quantity = 0;  
  dayWork.total = 0;
    
  // 插入清单
  insertRec('dayWork', dayWork, recno);  
        
  save(onSuccess, onError);
}

function insertTSFItemFromDB(bqItemObj, lmmDetail, rateDict, rateDetail, recno, PID, onSuccess, onError){
  // 增加清单
  var tsfItem = {};  
  tsfItem.pid = PID;  
  tsfItem.code = bqItemObj.Code;
  tsfItem.description = bqItemObj.Description;
  tsfItem.spec = bqItemObj.Spec;  
  tsfItem.unit = bqItemObj.Unit;  
  tsfItem.type = '清单';
  tsfItem.rate = bqItemObj.BaseRate||0;
  tsfItem.quantity = 0;  
  tsfItem.total = 0;
  tsfItem.remark = bqItemObj.Remark;
  tsfItem.isInStore = true;
    
  // 插入清单
  insertRec('tsf', tsfItem, recno);  
        
  save(onSuccess, onError);
}

function insertTsfItem(recno, pid, onSuccess, onError){
  var tsfItem = {};  
  tsfItem.pid = pid;  
  tsfItem.code = '';
  tsfItem.description = '';
  tsfItem.spec = '';  
  tsfItem.unit = '';  
  tsfItem.type = '清单';
  tsfItem.rate = 0;
  tsfItem.quantity = 0;  
  tsfItem.total = 0;
  tsfItem.remark = '';
    
  // 插入清单
  insertRec('tsf', tsfItem, recno);  
        
  save(onSuccess, onError);  
}

function insertXzbdItem(recno, pid, onSuccess, onError){
  var xzbdItem = {};  
  xzbdItem.pid = pid;  
  xzbdItem.code = '';
  xzbdItem.description = '';
  xzbdItem.spec = '';  
  xzbdItem.unit = '';  
  xzbdItem.type = '清单';
  xzbdItem.xzbh = '';
  xzbdItem.weight = 0;
    
  // 插入清单
  insertRec('xzbd', xzbdItem, recno);  
        
  save(onSuccess, onError);  
}

function insertQtxmItemFromDB(bqItemObj, lmmDetail, rateDict, rateDetail, recno, PID, onSuccess, onError){
  // 增加清单
  var qtxmItem = {};  
  qtxmItem.pid = PID;  
  qtxmItem.code = bqItemObj.Code;
  qtxmItem.description = bqItemObj.Description;
  qtxmItem.spec = bqItemObj.Spec;  
  qtxmItem.unit = bqItemObj.Unit;  
  qtxmItem.type = '清单';
  qtxmItem.rate = bqItemObj.BaseRate||0;
  qtxmItem.quantity = 0;  
  qtxmItem.total = 0;
  qtxmItem.remark = bqItemObj.Remark;
  qtxmItem.isInStore = true;
    
  // 插入清单
  insertRec('qtxm', qtxmItem, recno);  
        
  save(onSuccess, onError);
}

function insertQtxmItem(recno, pid, onSuccess, onError){
  var qtxmItem = {};  
  qtxmItem.pid = pid;  
  qtxmItem.code = '';
  qtxmItem.description = '';
  qtxmItem.spec = '';  
  qtxmItem.unit = '';  
  qtxmItem.type = '清单';
  qtxmItem.rate = 0;
  qtxmItem.quantity = 0;  
  qtxmItem.total = 0;
  qtxmItem.remark = '';
    
  // 插入清单
  insertRec('qtxm', qtxmItem, recno);  
        
  save(onSuccess, onError);  
}


function insertMeasureItemTitle(recno, onSuccess, onError){
  var measureItem = {};  
  measureItem.pid = null;  
  measureItem.code = '';
  measureItem.description = '';
  measureItem.spec = '';
  measureItem.workSpace = '';
  measureItem.unit = '';
  measureItem.jlgz = '';
  measureItem.type = '分部';
  measureItem.baseAmount = '';
  measureItem.calcStyle = '';
  measureItem.ratio = 0;
  measureItem.total = 0;
  measureItem.itemType = '分部';
    
  // 插入清单
  insertRec('measureItem', measureItem, recno);
  save(onSuccess, onError);
}

function insertMeasureItem(recno, pid, type, onSuccess, onError){
  var measureItem = {};  
  measureItem.pid = pid;  
  measureItem.code = '';
  measureItem.description = '';
  measureItem.spec = '';
  measureItem.workSpace = '';
  measureItem.unit = '';
  measureItem.jlgz = '';
  measureItem.type = '清单';
  measureItem.baseAmount = '';
  measureItem.calcStyle = '按费率计算';
  measureItem.ratio = 0;
  measureItem.total = 0;
  measureItem.itemType = type;
    
  // 插入清单
  insertRec('measureItem', measureItem, recno);  
        
  save(onSuccess, onError);  
}


// 获取清单含量视图，需要加上材料的名称编码等
function getLmmDetailView(bqItemID){
  var lmm = curProject.data.lmmDetail.filter(function(item){
    return item.bqItemID == bqItemID;
  });
   
  return lmm.map(function(item){
    var viewItem = {};
    var resource = findByID('resource', item.resID);
    jQuery.extend(true, viewItem, resource, item);
    viewItem.id = item.id;
    return viewItem;
  });
}

// 获取单价构成
function getRateDetail(rateDictID){  
  return curProject.data.rateDetail.filter(function(item){
    return item.rateDictID == rateDictID;
  });  
}

// 删除清单
function delBQItem(recordList, onSuccess, onError){
  var idMap = {};
  recordList.forEach(function(item){
    idMap[item.id] = true;
  });  
  // 根据PID得到所有需要删除的清单ID
  curProject.data.bqItem.forEach(function(item){
    if(idMap[item.pid]){
      idMap[item.id] = true;
    }
  });
  // 删除清单下含量
  curProject.data.lmmDetail = curProject.data.lmmDetail.filter(function(item){
    return idMap[item.bqItemID] == undefined;
  });
  // 删除清单
  curProject.data.bqItem = curProject.data.bqItem.filter(function(item){
    return idMap[item.id] == undefined;
  });
  
  save(onSuccess, onError);
}

// 删除条目
function deleteItems (tableName, recordList, onSuccess, onError) {
  var idMap = {};
  recordList.forEach(function(item){
    idMap[item.id] = true;
  });

  curProject.data[tableName].forEach(function(item){
    if(idMap[item.pid]){
      idMap[item.id] = true;
    }
  });

  curProject.data[tableName] = curProject.data[tableName].filter(function(item){
    return idMap[item.id] == undefined;
  });
  save(onSuccess, onError);
}

// 零星项目的删除记录
function delDayWork(recordList, onSuccess, onError){
  var idMap = {};
  recordList.forEach(function(item){
    idMap[item.id] = true;
  });  
  // 根据PID得到所有需要删除的清单ID
  curProject.data.dayWork.forEach(function(item){
    if(idMap[item.pid]){
      idMap[item.id] = true;
    }
  });  
  // 删除清单
  curProject.data.dayWork = curProject.data.dayWork.filter(function(item){
    return idMap[item.id] == undefined;
  });
  
  save(onSuccess, onError);
}

// 删除措施
function delMeasureItem(recordList, onSuccess, onError){
  var idMap = {};
  recordList.forEach(function(item){
    idMap[item.id] = true;
  });  
  // 根据PID得到所有需要删除的清单ID
  curProject.data.measureItem.forEach(function(item){
    if(idMap[item.pid]){
      idMap[item.id] = true;
    }
  });  
  // 删除清单
  curProject.data.measureItem = curProject.data.measureItem.filter(function(item){
    return idMap[item.id] == undefined;
  });
  
  save(onSuccess, onError);  
}

// 插入含量
function insertLmmDetail(bqItemID, lmmDetailID, resourceList, onSuccess, onError){  
  var curIndex = -1;
  if(lmmDetailID>=0){
    curProject.data.lmmDetail.some(function(item, index){
      if(item.id==lmmDetailID){        
        curIndex = index;
        return true;
      }
    });  
  }
  
  resourceList.forEach(function(item){
    var lmm = {};      
    lmm.resID = forceResource(item);
    lmm.bqItemID = bqItemID;
    lmm.usage = 0;  
    if(curIndex!=-1){
      curIndex = curIndex + 1;  
    }    
    insertRec("lmmDetail", lmm, curIndex);            
  }); 
  save(onSuccess, onError);   
}

// 替换含量
function replaceLmmDetail(lmmDetailID, resource, onSuccess, onError){
  var curDetail = null;
  var curIndex = -1;
  curProject.data.lmmDetail.some(function(item, index){
    if(item.id==lmmDetailID){
      curDetail = item;
      curIndex = index;
      return true;
    } 
  });
  if(curDetail){
    var lmm = {};      
    lmm.resID = forceResource(resource);
    lmm.bqItemID = curDetail.bqItemID;
    lmm.usage = 0;  
    lmm.id = getNewID("lmmDetail");
    curProject.data.lmmDetail.splice(curIndex, 1, lmm);
    save(onSuccess, onError);  
  }else{
    if(onError){
      onError("找不到对应的含量记录");
    }
  }  
}

// 删除含量
function delLmmDetail(lmmDetail, onSuccess, onError){  
  var idMap = {};
  lmmDetail.forEach(function(item){
    idMap[item.id] = true;
  });
  curProject.data.lmmDetail = curProject.data.lmmDetail.filter(function(item){    
    return idMap[item.id] == undefined;
  });
  save(onSuccess, onError);
}

function updateLmmDetail(lmmDetail, onSuccess, onError) {
  for (var i = curProject.data.lmmDetail.length - 1; i >= 0; i--) {
    if (curProject.data.lmmDetail[i].id == lmmDetail.id) {
      curProject.data.lmmDetail[i].usage = lmmDetail.usage;
      break;
    }
  } 
  save(onSuccess, onError);
}

// 根据编码合并清单
function getBQItemMerge(){  
  var idx = {};
  var result = [];
  curProject.data.bqItem.forEach(function(item){
    if(item.type=='清单'&&idx[item.code]==undefined){
      var bqItemMerge = {};
      bqItemMerge.code = item.code;
      bqItemMerge.description = item.description;
      bqItemMerge.spec = item.spec;
      bqItemMerge.unit = item.unit;
      bqItemMerge.RGF = item.RGF;
      bqItemMerge.JXFC = item.JXFC;
      bqItemMerge.QTCLF = item.QTCLF;
      idx[item.code] = bqItemMerge;
      result.push(bqItemMerge);
    };
  });  
  return result;
}

// 保存合并清单
function saveBQItemMerge(bqItemMerge, onSuccess, onError){  
  var idx = {};
  bqItemMerge.forEach(function(item){
    idx[item.code] = item;
    item.RGF = parseFloat(item.RGF) + 0;
    item.QTCLF = parseFloat(item.QTCLF) + 0;
    item.JXFC = parseFloat(item.JXFC) + 0;
  });
  curProject.data.bqItem.forEach(function(item){
    if(item.type == '清单'){
      var mergeItem = idx[item.code];
      item.RGF = mergeItem.RGF;
      item.JXFC = mergeItem.JXFC;
      item.QTCLF = mergeItem.QTCLF;
    }    
  });    
  save(onSuccess, onError);  
}

// 粘贴分部分项记录，需要处理含量
function pasteBQItem(recordList, pasteRow, isCut, onSuccess, onError){
  // 获得所有需要复制的记录
  var idxMap = {};

  idxMap[recordList[0].id] = true;
  var first = recordList[0];
  for (var i = 1; i < recordList.length; i++) {
    if (recordList[i].level==first.level&&recordList[i].type!=first.type) {
      break;
    }
    if (recordList[i].level>=first.level) {
      idxMap[recordList[i].id] = true;
    } else {
      break;
    }
  }

  var copyRecords = [];
  curProject.data.bqItem.forEach(function(item){
    if(idxMap[item.id]){
      copyRecords.push(item);        
    }else if(idxMap[item.pid]){
      idxMap[item.id] = true;
      copyRecords.push(item);
    }
  });

  // 清单下不能copy分部
  if (pasteRow.type == '清单') {
    for (var i = copyRecords.length - 1; i >= 0; i--) {
      if (copyRecords[i].type == '分部') {
        return;
      }
    }
  }

  if(isCut){
    // 先判断当前选中行是否包含在删除的清单中
    if (idxMap[pasteRow.id]) {
      return;
    }        
    // 先去掉剪切的记录
    var table = curProject.data.bqItem.filter(function(item){
      return !idxMap[item.id];
    });
    // 修改选中节点中的顶级节点的pid
    copyRecords.forEach(function(item){
      if(!idxMap[item.pid]){
        if (pasteRow.type == '分部') {
          if (item.type == '分部') {
            item.pid = pasteRow.pid;
          } else {
            item.pid = pasteRow.id;        
          }
        } else {
          item.pid = pasteRow.pid;
        }
      }
    })
    var idx = table.indexOf(pasteRow)+1; 
    if (first.type=='分部'||pasteRow.type=='分部') {
      while(idx<curProject.data.bqItem.length&&curProject.data.bqItem[idx].level>pasteRow.level){
        idx=idx + 1;
      }
    }
    // 找到插入位置并插入记录
    
    if(idx >= 0){
      curProject.data.bqItem = table.slice(0, idx).concat(copyRecords).concat(table.slice(idx));
    }
  } else {
    var newIDMap = {};
    // 复制一份记录,并设置id和pid
    var list = copyRecords.map(function(item){
      var newItem = $.extend({}, item);
      newItem.id = getNewID('bqItem');
      newIDMap[item.id] = newItem.id;
      if(idxMap[item.pid]){
        newItem.pid = newIDMap[item.pid];
      }else{
        if (pasteRow.type == '分部') {
          if (item.type == '分部') {
            newItem.pid = pasteRow.pid;
          } else {
            newItem.pid = pasteRow.id;        
          }        
        } else {
          newItem.pid = pasteRow.pid;
        }
      }
      return newItem;
    });

    var idx = curProject.data.bqItem.indexOf(pasteRow)+1; 
    if (first.type=='分部'||pasteRow.type=='分部') {
      while(idx<curProject.data.bqItem.length&&curProject.data.bqItem[idx].level>pasteRow.level){
        idx=idx + 1;
      }
    }
    // 插入复制的记录
    curProject.data.bqItem = curProject.data.bqItem.slice(0, idx).concat(list).concat(curProject.data.bqItem.slice(idx));
    
    // 复制含量并插入
    var lmmList = [];
    curProject.data.lmmDetail.forEach(function(item){
      if(idxMap[item.bqItemID]){
        var newLmm = $.extend({}, item);
        newLmm.id = getNewID('lmmDetail');
        newLmm.bqItemID = newIDMap[item.bqItemID];
        lmmList.push(newLmm);
      }
    });
    curProject.data.lmmDetail = curProject.data.lmmDetail.concat(lmmList);
  }
  save(onSuccess, onError);
}

// 粘贴普通记录，不需要处理明细
function pasteItem(tableName, recordList, recno, isCut, onSuccess, onError){
  // 获得所有需要复制的记录
  var idxMap = {};
  idxMap[recordList[0].id] = true;
  var first = recordList[0];
  for (var i = 1; i < recordList.length; i++) {
    if (recordList[i].level==first.level&&recordList[i].type!=first.type) {
      break;
    }
    if (recordList[i].level>=first.level) {
      idxMap[recordList[i].id] = true;
    } else {
      break;
    }
  }
  
  var copyRecords = [];
  curProject.data[tableName].forEach(function(item){
    if(idxMap[item.id]){
      copyRecords.push(item);        
    }else if(idxMap[item.pid]){
      idxMap[item.id] = true;
      copyRecords.push(item);
    }
  });

  var pasteRow = curProject.data[tableName][recno];
  if (pasteRow.type == '清单') {
    for (var i = copyRecords.length - 1; i >= 0; i--) {
      if (copyRecords[i].type == '分部') {
        return;
      }
    }
  }

  if(isCut){
    if (idxMap[pasteRow.id]) {
      return;
    }          
    // 先去掉剪切的记录
    var table = curProject.data[tableName].filter(function(item){
      return !idxMap[item.id];
    });
    // 修改选中节点中的顶级节点的pid
    copyRecords.forEach(function(item){
      if(!idxMap[item.pid]){
        if (pasteRow.type == '分部') {
          if (item.type == '分部') {
            item.pid = pasteRow.pid;
          } else {
            item.pid = pasteRow.id;        
          }          
        } else {
          item.pid = pasteRow.pid;
        }        
      }
    });

    // 找到插入位置并插入记录
    var idx = table.indexOf(pasteRow)+1; 
    if (first.type=='分部'||pasteRow.type=='分部') {
      while(idx<curProject.data[tableName].length&&curProject.data[tableName][idx].level>pasteRow.level){
        idx=idx + 1;
      }
    }
    console.log(idx);
    if(idx >= 0){
      curProject.data[tableName] = table.slice(0, idx).concat(copyRecords).concat(table.slice(idx));
    }

  }else{
    var newIDMap = {};
    // 复制一份记录,并设置id和pid
    var list = copyRecords.map(function(item){
      var newItem = $.extend({}, item);
      newItem.id = getNewID(tableName);
      newIDMap[item.id] = newItem.id;
      if(idxMap[item.pid]){
        newItem.pid = newIDMap[item.pid];
      }else{
        if (pasteRow.type == '分部') {
          if (item.type == '分部') {
            newItem.pid = pasteRow.pid;
          } else {
            newItem.pid = pasteRow.id;        
          }          
        } else {
          newItem.pid = pasteRow.pid;
        }
      }
      return newItem;
    }); 

    // 插入复制的记录
    var idx = recno+1; 
    if (first.type=='分部'||pasteRow.type=='分部') {
      while(idx<curProject.data[tableName].length&&curProject.data[tableName][idx].level>pasteRow.level){
        idx=idx + 1;
      }
    }
    console.log(idx);
    curProject.data[tableName] = curProject.data[tableName].slice(0, idx).concat(list).concat(curProject.data[tableName].slice(idx));        
  }
  
  save(onSuccess, onError);
}



function insertOtherItemClass(description, baseAmount, onSuccess, onError){
  var newItem = {};
  newItem.description = description;
  newItem.baseAmount = baseAmount;
  newItem.calcStyle = '按费率计算';
  insertRec('otherItemClass', newItem, -1);
  save(onSuccess, onError);
}

function delOtherItemClass(id, onSuccess, onError){
  // 先删除其他项目
  curProject.data.otherItem = curProject.data.otherItem.filter(function(item){
    return item.classID != id;
  });
  // 在删除类别
  curProject.data.otherItemClass = curProject.data.otherItemClass.filter(function(item){
    return item.id != id;
  });  
  save(onSuccess, onError);
}

function insertOtherItem(classID, pid, recno, onSuccess, onError){  
  var newItem = {};
  newItem.classID = classID;
  newItem.pid = pid;
  newItem.baseAmount = '';
  newItem.ratio = 0;
  insertRec('otherItem', newItem, recno);
  save(onSuccess, onError);
}

function delOtherItem(recordList, onSuccess, onError){
  var idMap = {};
  recordList.forEach(function(item){
    idMap[item.id] = true;
  });  
  // 根据PID得到所有需要删除的清单ID
  curProject.data.otherItem.forEach(function(item){
    if(idMap[item.pid]){
      idMap[item.id] = true;
    }
  });  
  // 删除清单
  curProject.data.otherItem = curProject.data.otherItem.filter(function(item){
    return idMap[item.id] == undefined;
  });
  
  save(onSuccess, onError);  
}

function arrangeBQItem(onSuccess, onError){    
  // 删除所有分部
  curProject.data.bqItem = curProject.data.bqItem.filter(function(item){
    return item.type == '清单';
  });
  // 获取所有库中的清单
  var bqItems = curProject.data.bqItem.filter(function(item) {
    return item.itemType != '描述';
  });

  // 如果一条清单都不存在则返回
  if (bqItems.length == 0) {
    return;
  }

  // 找到所有描述清单的对应清单,描述清单分部要对应他的下一条清单
  var descItems = [];
  var bqToDescItem = {};
  curProject.data.bqItem.forEach(function(item) {
    if (item.itemType == '描述') {
      descItems.push(item);
    } else {
      if (descItems.length > 0) {
        bqToDescItem[item.id] = descItems.slice(0);
        descItems = [];
      }
    }
  }); 

  // 对库中清单按编码升序排序
  bqItems.sort(function(first, second) {
    return first.code > second.code ? 1 : (first.code < second.code ? -1 : 0);  
  });


  // 直接插入分部
  var tempBqItems = [];
  var section = {};
  var insertNo = {}; // 记录每条分部下一条应该插入的位置
  bqItems.forEach(function(item){
    item.level = 1;
    // 添加清单sectionID对应的分部
    if(section[item.sectionID]){
      item.pid = section[item.sectionID].id;
      tempBqItems.splice(insertNo[item.sectionID], 0, item);
      insertNo[item.sectionID] = insertNo[item.sectionID] + 1;
    }else{
      var newBQItem = {};
      newBQItem.code = item.sectionCode;
      newBQItem.description = item.sectionName;
      newBQItem.type = '分部';
      newBQItem.pid = null;
      newBQItem.sectionID = item.sectionID;
      newBQItem.RGF = 0;
      newBQItem.JXFC = 0;
      newBQItem.QTCLF = 0;
      newBQItem.id = getNewID('bqItem');
      newBQItem.level = 0;
      tempBqItems.push(newBQItem);
      item.pid = newBQItem.id;
      tempBqItems.push(item);
      section[item.sectionID] = newBQItem;
      insertNo[item.sectionID] = tempBqItems.length;
    }              
  });

  // 插入集中描述
  var newBQItems = [];
  for (var i = 0; i < tempBqItems.length; i++) {
    if (bqToDescItem[tempBqItems[i].id]) {
      bqToDescItem[tempBqItems[i].id].forEach(function(item) {
        item.pid = tempBqItems[i].pid;
      });
      newBQItems = newBQItems.concat(bqToDescItem[tempBqItems[i].id]);   
    }
    newBQItems.push(tempBqItems[i]);
  };
  // 如果集中描述在最后则直接拼接到最后
  if (descItems.length > 0) {
    descItems.forEach(function(item) {
      item.pid = newBQItems[newBQItems.length - 1].pid;
    });
    newBQItems = newBQItems.concat(descItems);
  }
  curProject.data.bqItem = newBQItems;

  save(onSuccess, onError);
}

function insertSummary(summary, order, onSuccess, onError){
  insertRec('summary', summary, order);
  save(onSuccess, onError);
}

function delSummary(selectItem, onSuccess, onError) {
  var idMap = {};
  
  selectItem.forEach(function(item){
    idMap[item.id] = true;
  }); 
  curProject.data.summary.filter(function(item){
    if(idMap[item.pid]){
      idMap[item.id] = true;
    }
  });
  curProject.data.summary = curProject.data.summary.filter(function(item){
    var is = idMap[item.id] == undefined;;
    return is;
  });
  save(onSuccess, onError);
}

function delBQItemTitle(onSuccess, onError){
  curProject.data.bqItem = curProject.data.bqItem.filter(function(item){
    return item.type == '清单';
  });
   curProject.data.bqItem.forEach(function(item){
    item.pid = null;
  });
  
  save(onSuccess, onError);
}

function insertBQItemTitle(record, recno, onSuccess, onError){
  record.type = '分部';
  insertRec('bqItem', record, recno);
  save(onSuccess, onError);
}

function insertDescItem(record, recno, onSuccess, onError){
  record.type = '清单';
  record.itemType = '描述';
  insertRec('bqItem', record, recno);
  save(onSuccess, onError);
}

function insertDayWorkTitle(record, recno, onSuccess, onError){
  insertRec('dayWork', record, recno);
  save(onSuccess, onError);
}

function insertTitle(tableName, record, recno, onSuccess, onError){
  insertRec(tableName, record, recno);
  save(onSuccess, onError);
}

function refBQItem(resID){
  var bqItemIDMap={};
  curProject.data.lmmDetail.forEach(function(item){        
    if(item.resID == resID){
      bqItemIDMap[item.bqItemID] = true;
    }
  });
  return curProject.data.bqItem.filter(function(item){
    return bqItemIDMap[item.id] == true;
  });
}

function getMacro(tableName, recordList){
  var result = [];
  if(tableName =='summary'){    
    result.push({'code':'FBFXF','description':'分部分项费','type':'sys','value':curProject.data.macro[0].FBFXF});    
    result.push({'code':'CS1','description':'措施一','type':'sys','value':curProject.data.macro[0].CS1});    
    result.push({'code':'CS2','description':'措施二','type':'sys','value':curProject.data.macro[0].CS2});
    if (curProject.catalog=='土建工程') {
      result.push({'code':'TSF','description':'土石方','type':'sys','value':curProject.data.macro[0].TSF});
    } 
    if (curProject.catalog=='消防工程') {
      result.push({'code':'QTXM','description':'其他项目','type':'sys','value':curProject.data.macro[0].QTXM});
    }
  }else if(tableName == 'rateDetail'){
    result.push({'code':'RGF','description':'人工费','type':'sys','value':0});
    result.push({'code':'CLF','description':'主材费','type':'sys','value':0});
    result.push({'code':'JXFC','description':'机械辅材费','type':'sys','value':0});
    result.push({'code':'SH','description':'定额损耗','type':'sys','value':0});       
  }
  recordList.forEach(function(item){
    if(item.rateCode!=null&&item.rateCode.length>0){
      result.push({'code':item.rateCode,'description':item.description,'value':item.total});
    }
  });
  return result;
}

function inertRateDetail(rateDictID, recno, onSuccess, onError){
  var newRecord = {};
  newRecord.rateDictID = rateDictID;
  insertRec('rateDetail', newRecord, recno);
  save(onSuccess, onError);
}

function delRateDetail(rateDictID, recordList, onSuccess, onError){
  // 收集需要删除的  
  var idMap = {};
  recordList.forEach(function(item){
    idMap[item.id] = true;
  });
  // 然后删除记录    
  curProject.data.rateDetail = curProject.data.rateDetail.filter(function(item){
    return idMap[item.id] == undefined;
  });  
  // 编译表达式
  var curRateDetail = curProject.data.rateDetail.filter(function(item){
    return item.rateDict == rateDictID;
  });
  gbqModel().save(onSuccess, onError);     
}

function isCodeUsed(codeList, exprList){
  var used = false;
  exprList.forEach(function(expr){
    if(!used){
      var [tokenArr, info] = ruleEngine().analyseExpr(expr);
      for(var i=0;i<tokenArr.length;i++){
        if(codeList.indexOf(tokenArr[i])>=0){
          used = true;
          break;
        }
      }
    }
  });
  return used;
}

function initExpr(expr){
  if(expr==null||expr==undefined){
    return '';
  }else{
    expr = expr.replace(/\s/g, '');
    expr = expr.replace(/[\r\n]/g, "");
    return expr;  
  } 
}

function checkToken(tokenArr, codeList, macroList){
  var result = true;
  var errInfo = '';
  tokenArr.every(function(token){
    // 如果不是数字，就需要检查
    if(token.length>0&&isNaN(token)&&!ruleEngine().isOperator(token))
    {
      if(codeList.indexOf(token)<0&&macroList.indexOf(token)<0){
        result = false;
        errInfo = '非法标识符:' + token;
        return false;
      }else{
        return true;
      } 
    }else{
      return true;
    }   
  });
  return [result, errInfo];
}


// 翻译基数说明
function buildBaseAmountRemark(table, baseAmountField, remarkField, macroTable){
  var codeMap = {};
  macroTable.forEach(function(item){
    codeMap[item.code]=item.description;
  });
  table.forEach(function(item){
    if(item[baseAmountField]){
      var [tokenArr, info] = ruleEngine().analyseExpr(item[baseAmountField]); 
      if(info.length==0){
        item[remarkField] = tokenArr.map(function(token){
          if(codeMap[token]){
            return codeMap[token];
          }else{
            return token;
          }
        }).join('');      
      }else{
        item[remarkField] = info;
      }  
    }    
  });  
}

// 根据行引用宏构造表达式
function compileCalcTable(table, codeField, baseAmountField, ratioField, totalExprField, macroList) {
  var errInfo = '';
  var result = true;
  
  // 初始化拓扑排序的数据结构
  var edgeArr = [];
  var nodeArr = []; 
  table.forEach(function(item) {
    if(item[codeField] && item[codeField].length > 0) {     
      nodeArr.push(item[codeField]);
    }
  });

  // 对baseAmountField进行词法分析，同时根据分析结果构造codeField构造引用关系图    
  var baseAmountResult = {};
  for(var i=0;i<table.length;i++){
    var item = table[i];
    item[baseAmountField] = initExpr(item[baseAmountField]);
    // 如果没有表达式，则不用处理
    if(item[baseAmountField].length == 0){      
      continue;
    }

    // 词法分析                       
    var [tokenArr, info] = ruleEngine().analyseExpr(item[baseAmountField]); 
    // 如果词法分析成功
    if(info.length==0){
      // 检查token      
      var [checkResult, checkInfo] = checkToken(tokenArr, nodeArr, macroList);
      // 如果检查通过，则添加引用关系，否则退出
      if(checkResult){
        var code = item[codeField];
        if(code&&code.length>0){
          tokenArr.forEach(function(token){
            if(nodeArr.indexOf(token)>=0){
              edgeArr.push({in: token, out: code});
            }
          });           
        };
        baseAmountResult[item.id] = tokenArr;
      }else{
        result = false;
        errInfo = checkInfo;
        break;
      }       
    }else{
      // 词法分析错误
      result = false;
      errInfo = info;
      break;
    }
  }
  // 生成totalExprField
  if(result){
    // 根据拓扑排序结果写入行的计算顺序,和totalExpr
    var sortArr = ruleEngine().topSort(nodeArr, edgeArr);  
    if(sortArr.length == nodeArr.length){
      table.forEach(function(item){
        item._calcOrder_ = sortArr.indexOf(item[codeField]);
      });

      // 根据排序解析totalField_expr
      var tempArr = table.slice(0);
      tempArr.sort(function(left, right){
        return left._calcOrder_ - right._calcOrder_;
      });
      // 顺序解析
      var codeMap = {};
      tempArr.forEach(function(item){
        var total_expr = '0';
        if(item[baseAmountField] && item[baseAmountField].length > 0){
          var tokenArr = baseAmountResult[item.id];
          if (tokenArr) {
            var newExpr = tokenArr.map(function(token){
            if(token in codeMap){
              return '(' + codeMap[token] + ')';
            }else{
              return token;
            }
            }).join('');
            if((item[ratioField]==null)||(item[ratioField]=='')||isNaN(item[ratioField])){
              item[ratioField] = '';
              total_expr = '(' + newExpr + ')';  
            } else {
              total_expr = '(' + newExpr + ')*(' + item[ratioField] + ')/100';    
            }
          }
        }
        item[totalExprField] = total_expr;    
        if(item.rateCode && item.rateCode.length > 0){
          codeMap[item.rateCode] = item[totalExprField];
        }        
      });             
    }else{
      result = false;
      errInfo = '表达式存在循环引用！';
    }   
  }

  return [result, errInfo];   
}

// 删除标段结构
function delBidNode(recordList, onSuccess, onError){
  var idMap = {};
  recordList.forEach(function(item){
    idMap[item.id] = true;
  });  
  // 根据PID得到所有需要删除的清单ID
  curProject.data.bidNode.forEach(function(item){
    if(idMap[item.pid]){
      idMap[item.id] = true;
    }
  });  
  // 删除标段结构
  curProject.data.bidNode = curProject.data.bidNode.filter(function(item){
    return idMap[item.id] == undefined;
  });

  curProject.data.bqItem.forEach(function(item){
    sumByBidNode(item, curProject.data.bidNode, 'quantity');
  });

  curProject.data.measureItem.forEach(function(item){
    sumByBidNode(item, curProject.data.bidNode, 'quantity');
  });
  
  save(onSuccess, onError);
}

function sumByBidNode(record, bidNode, fieldName){
  if (bidNode.length == 0) {
    return;
  }
  var bidNodeTree = []; 
  bidNode.forEach(function(item){
    var obj = {id:item.id, child:[]};
    if(item.pid==null){
      bidNodeTree.push(obj);
    }else if(bidNodeTree.length>0){
      bidNodeTree[bidNodeTree.length - 1].child.push(obj);
    }
  });
  var sum=0;
  bidNodeTree.forEach(function(item){
    if(item.child.length>0){
      var value = 0;
      item.child.forEach(function(child){
        if(record[fieldName + '_' + child.id]){
          record[fieldName + '_' + child.id] = parseFloat(record[fieldName + '_'+child.id]);                
        }else{
          record[fieldName + '_'+child.id] = 0;
        }        
        value = value + record[fieldName + '_' + child.id];
      });
      record[fieldName + '_'+item.id] = Math.round(value * 100000) / 100000; // 解决精度过长问题             
    }else{
      if(record[fieldName + '_' + item.id]){
        record[fieldName + '_' + item.id] = parseFloat(record[fieldName + '_'+item.id]);  
      }else{
        record[fieldName + '_'+item.id] = 0;
      }                        
    }        
    sum = sum + record[fieldName + '_'+item.id];     
  });  
  record[fieldName] = Math.round(sum * 100000) / 100000;  
}

function insertBidNode(record, recno, onSuccess, onError){
  insertRec('bidNode', record, recno);
  curProject.data.bqItem.forEach(function(item){
    sumByBidNode(item, curProject.data.bidNode, 'quantity');
  });
  curProject.data.measureItem.forEach(function(item){
    sumByBidNode(item, curProject.data.bidNode, 'quantity');
  });
  save(onSuccess, onError);
}

function recalcProjectSpec(record) {
  var bidNodeTree = []; 
  curProject.data.bidNode.forEach(function(item){
    var obj = {id:item.id, child:[]};
    if(item.pid==null){
      bidNodeTree.push(obj);
    }else if(bidNodeTree.length>0){
      bidNodeTree[bidNodeTree.length - 1].child.push(obj);
    }
  });

  var separator = '_'
  var projectSpec = 'attr' + separator;
  bidNodeTree.forEach(function(item){
    if(item.child.length>0){
      var value = 0;
      item.child.forEach(function(child){
        if(record[projectSpec + item.id + separator + child.id]){
          record[projectSpec + item.id + separator +child.id] = parseFloat(record[projectSpec+ item.id + separator + child.id]);                
        }else{
          record[projectSpec+ item.id + separator+child.id] = 0;
        }        
        value = value + record[projectSpec + item.id + separator + child.id];
      });
      record[projectSpec+item.id] = value;
    }else{
      if(record[projectSpec + item.id]){
        record[projectSpec + item.id] = parseFloat(record[projectSpec+item.id]);
      }else{
        record[projectSpec+item.id] = 0;
      }                        
    }  
  });
}

function queryDataByField(tableName, field, value) {
  var returnData = null;
  var tableData = curProject.data[tableName];
  for (var i = 0; i < tableData.length; i++) {
    var item = tableData[i];
    if (item[field] == value) {
      returnData = item;
      break;
    }
  }
  return returnData;
}

function setDataByField(tableName, field, tableItem) {
  var tableData = curProject.data[tableName];
  for (var i = 0; i < tableData.length; i++) {
    var item = tableData[i];
    if (item.code == tableItem.code) {
      tableData[i] = tableItem;
      break;
    }
  }
}

function setView(tableName, data) {
   curProject.data[tableName] = data.slice(0);
} 

function getCatalog() {  
  if (curProject) {
    return curProject.catalog; 
  } 
  return null;
}

function getFileName() {
  if (curProject) {
    return curProject.description;
  } 
  return null;
}

function changeFileName(newName) {
  if (curProject) {
    curProject.description = newName;
  }
  save();
}

function isProjectNull(){    
  return projectID==null||projectID==undefined||projectID.length==0;
}

function closeCurProject(){
  projectID = "";
  curProject = null;
  sessionStorage.setItem('projectID', projectID);
}

function doImportGBQ(srcProject, onSuccess, onError) {
  // 插入清单，并记录新的ID
    var bqItemIDMap = {};    
    srcProject.data.bqItem.forEach(function(item){
      var newItem = $.extend({}, item);
      newItem.id = getNewID("bqItem");
      bqItemIDMap[item.id] = newItem.id;
      if(item.pid){
        newItem.pid = bqItemIDMap[item.pid];
      }else{
        newItem.pid = null;
      }
      // 处理清单@quantity
      curProject.data.bidNode.forEach(function(bidNode){
        newItem['quantity_' + bidNode.id] = item['quantity_' + bidNodeIDMap[bidNode.id]];
      });
      curProject.data.bqItem.push(newItem);      
    });

    // 插入材料，并记录新的ID
    var resIDMap = {};
    // 建立材料编码hash，编码相同的材料不重复插入，并判断价格是否一致
    var resCodeHash = {};    
    curProject.data.resource.forEach(function(item){
      resCodeHash[item.code] = item;
    });
    
    srcProject.data.resource.forEach(function(item){      
      if(resCodeHash[item.code]){
        resIDMap[item.id] = resCodeHash[item.code].id;
      }else{
        var newItem = $.extend({}, item);
        newItem.id = getNewID('resource');
        resIDMap[item.id] = newItem.id;
        curProject.data.resource.push(newItem);
      }
    });

    // 插入含量
    srcProject.data.lmmDetail.forEach(function(item){
      var newItem = $.extend({}, item);
      newItem.id = getNewID('lmmDetail');
      newItem.bqItemID = bqItemIDMap[item.bqItemID];
      newItem.resID = resIDMap[item.resID];
      curProject.data.lmmDetail.push(newItem);
    });

    save(onSuccess, onError);               
}

function importGBQ(projectID, onConfirm, onMessage, onSuccess){
  // 获取要导入的工程
  request().readProject(projectID, function(data){   
    // 执行导入      
    var srcProject = data;
    // 检查bidNode
    var bidNodeIDMap = {};
    var nameMap = {};
    var isSameBidNode = true;
    if(curProject.data.bidNode.length==srcProject.data.bidNode.length){
      curProject.data.bidNode.forEach(function(item){
        nameMap[item.description] = item;
      });
      srcProject.data.bidNode.some(function(item){
        var matchItem = nameMap[item.description];
        if(matchItem){
          if(matchItem.level==item.level){
            bidNodeIDMap[matchItem.id] = item.id;
            return false;
          }else{
            isSameBidNode = false;
            return true;
          }          
        }else{
          isSameBidNode = false;
          return true;
        }
      });            
    }else{
      isSameBidNode = false;
    }
    // 不相同直接退出
    if(!isSameBidNode){
      onMessage('项目划分不一致，无法导入')
      return;
    }

  // 建立材料编码hash，编码相同的材料不重复插入，并判断价格是否一致
    var resCodeHash = {};
    curProject.data.resource.forEach(function(item){
      resCodeHash[item.code] = item;
    });
    
    if (srcProject.data.resource.every(function(item){      
      if(resCodeHash[item.code]){
        if(item.rate!=resCodeHash[item.code].rate){
          return false;  
        }
      }
      return true;
    })) {
      doImportGBQ(srcProject, onSuccess);
    } else {
      onConfirm(srcProject);
    }

  }, onMessage);
}

function checkBQItems(catalog) {
  return curProject.data.bqItem.filter(function(bqItem) {
    if (bqItem.type=='分部') {
      return false;
    }
    if (!bqItem.lockWasteRate && !(curProject.catalog=='门窗工程'||curProject.catalog=='幕墙工程'||curProject.catalog == '保温涂料工程') && !bqItem.wasteRate) {
      bqItem.isWasteRateEmpty = true;
      return true;
    }
    var lmmDetailList = curProject.data.lmmDetail.filter(function(lmmItem) {
      if (lmmItem.bqItemID == bqItem.id) {
        if (!lmmItem.usage||!(parseFloat(lmmItem.usage) > 0)) {
          return true;
        }
      }
      return false;
    });
    if (lmmDetailList.length > 0) {
      bqItem.isUsageEmpty = true;
      return true;
    }
    return false;
  });
}

export default function gbqModel(){  
	return {		
    closeCurProject: closeCurProject,
    isProjectNull: isProjectNull,
    // 打开项目文件
    openProject: openProject,
    // 读取模型
    read: read,
    // 保存模型
    save: save,
    // 提交模型
    commit: commit,    
    // 后面是业务相关方法   
    getView: getView,    
    moveRec: moveRec,   
    moveUp: moveUp,
    moveDown: moveDown,  
    pasteBQItem: pasteBQItem,  
    arrangeBQItem: arrangeBQItem,
    delBQItemTitle: delBQItemTitle,
    getBQDBs: getBQDBs,
    getBQDB: getBQDB,        
    savePreface: savePreface,
    saveProjectInfo: saveProjectInfo,        
    insertBQItemFromDB: insertBQItemFromDB,   
    insertBQItemTitle: insertBQItemTitle,             
    getLmmDetailView: getLmmDetailView,
    getRateDetail: getRateDetail,
    delBQItem: delBQItem,
    insertLmmDetail: insertLmmDetail,
    updateLmmDetail: updateLmmDetail,
    replaceLmmDetail: replaceLmmDetail,
    delLmmDetail: delLmmDetail,
    getBQItemMerge: getBQItemMerge,
    saveBQItemMerge: saveBQItemMerge,
    delMeasureItem: delMeasureItem,
    insertMeasureItemFromDB: insertMeasureItemFromDB,
    insertOtherItemClass: insertOtherItemClass,
    delOtherItemClass: delOtherItemClass,
    insertOtherItem: insertOtherItem,    
    delOtherItem: delOtherItem,
    refBQItem: refBQItem,
    delSummary: delSummary,
    insertSummary: insertSummary,
    getMacro: getMacro,
    inertRateDetail: inertRateDetail,
    delRateDetail: delRateDetail,
    isCodeUsed: isCodeUsed,
    insertMeasureItemTitle: insertMeasureItemTitle,
    insertMeasureItem: insertMeasureItem,
    buildBaseAmountRemark: buildBaseAmountRemark,
    compileCalcTable: compileCalcTable,
    delBidNode: delBidNode,
    insertBidNode: insertBidNode,
    insertDayWorkTitle: insertDayWorkTitle,
    insertDayWorkFromDB: insertDayWorkFromDB,
    unique: unique,
    pasteItem: pasteItem,
    delDayWork: delDayWork,
    insertDescItem: insertDescItem,
    getProjectSpec: getProjectSpec,
    recalcProjectSpec:recalcProjectSpec,
    saveProjectSpec:saveProjectSpec,
    sumByBidNode: sumByBidNode,
    getColomnsSetting: getColomnsSetting,
    setColomnSetting: setColomnSetting,
    setView: setView,
    getCatalog: getCatalog,
    deleteItems: deleteItems,
    insertTitle: insertTitle,
    insertTSFItemFromDB: insertTSFItemFromDB,
    insertTsfItem: insertTsfItem,
    insertQtxmItemFromDB: insertQtxmItemFromDB,
    insertQtxmItem: insertQtxmItem,
    insertXzbdItem: insertXzbdItem,
    importGBQ: importGBQ,
    doImportGBQ: doImportGBQ,
    checkBQItems: checkBQItems,
    queryDataByField: queryDataByField,
    setDataByField: setDataByField,
    isSameProject: isSameProject,
    getFileName: getFileName,
    changeFileName: changeFileName,
	}
}