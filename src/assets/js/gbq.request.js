/**
 * Created by lums-a on 2017/5/4.
 * 所有请求数据，请求相关的都放到这里面
 */
'use strict';

var projectID;
var loginInfo = JSON.parse(sessionStorage.getItem('loginInfoStr'));

// 登陆
function login(userName, password, onSuccess, onError) {
  var params = {};
  params.userName = userName;
  params.password = password;
  $.ajax({
    url: process.env.API_ROOT + 'login',
    type: 'POST',
    dataType: 'json',
    data: JSON.stringify(params),
    beforeSend: function(request) {
      request.setRequestHeader("Content-Type", 'application/json');
    },
    success: function (data) {
      if(onSuccess){
        loginInfo = data;
        sessionStorage.setItem('loginInfoStr', JSON.stringify(loginInfo));
        onSuccess();
      }
    },
    error: function(XMLHttpRequest, textStatus, errorThrown){
      if(onError){
        onError();
      }
      console.log(XMLHttpRequest, textStatus, errorThrown, JSON.stringify(errorThrown));
    }
  });
}

// 登出
function logout(){
  sessionStorage.removeItem('loginInfoStr');
  loginInfo=null;
  projectID='';
}

// 获取登陆信息
function getLoginInfo(){
  return loginInfo;
}

 /* 获取模板类别列表 */
function getCatalog(onSuccess, onError){
  $.ajax({
    url: process.env.API_ROOT + 'qdk/catalogs',
    type: 'GET',
    dataType: 'json',
    beforeSend: function(request) {
      request.setRequestHeader("Content-Type", 'application/json');
      request.setRequestHeader('If-Modified-Since', 0);
    },
    success: function (data) {
      if(onSuccess){
        onSuccess(data);
      }
    },
    error: function(XMLHttpRequest, textStatus, errorThrown){
      if(onError){
        onError();
      }
      console.log(XMLHttpRequest, textStatus, errorThrown, JSON.stringify(errorThrown));
    }
  })
}

function getProjectSpec(catalogId, onSuccess, onError) {
  $.ajax({
    url: process.env.API_ROOT + 'qdk/projectspec/' + catalogId,
    type: 'GET',
    dataType: 'json',
    beforeSend: function(request) {
      request.setRequestHeader("Content-Type", 'application/json');  
      request.setRequestHeader('If-Modified-Since', 0);    
    },
    success: function (data) {
      if(onSuccess){
        onSuccess(data);
      }
    },
    error: function(XMLHttpRequest, textStatus, errorThrown){
      if(onError){
        onError(JSON.stringify(errorThrown));
      }
      console.log(XMLHttpRequest, textStatus, errorThrown, JSON.stringify(errorThrown));
    }
  });
}

/* 获取模板列表 */
function getTemplet(onSuccess, onError){
  $.ajax({
    url: process.env.API_ROOT + 'project/templet',
    type: 'GET',
    dataType: 'json',
    beforeSend: function(request) {
      request.setRequestHeader("Content-Type", 'application/json');
      request.setRequestHeader('If-Modified-Since', 0);
    },
    success: function (data) {
      if(onSuccess){
        onSuccess(data);
      }
    },
    error: function(XMLHttpRequest, textStatus, errorThrown){
      if(onError){
        onError();
      }
      console.log(XMLHttpRequest, textStatus, errorThrown, JSON.stringify(errorThrown));
    }
  })
}

/* 获取招标文件列表 */
function getZBFile(onSuccess, onError){
  $.ajax({
    url: process.env.API_ROOT + 'project/zb',
    type: 'GET',
    dataType: 'json',
    beforeSend: function(request) {
      request.setRequestHeader("Content-Type", 'application/json');
      request.setRequestHeader('If-Modified-Since', 0);
    },
    success: function (data) {
      if(onSuccess){
        onSuccess(data);
      }
    },
    error: function(XMLHttpRequest, textStatus, errorThrown){
      if(onError){
        onError();
      }
      console.log(XMLHttpRequest, textStatus, errorThrown, JSON.stringify(errorThrown));
    }
  })
}

/* 获取用户项目列表 */
function getProject(userName, onSuccess, onError){
  $.ajax({
    url: process.env.API_ROOT + 'project/list/' + userName,
    type: 'GET',
    dataType: 'json',
    beforeSend: function(request) {
      request.setRequestHeader("Content-Type", 'application/json');
      request.setRequestHeader('If-Modified-Since', 0);
    },
    success: function (data) {
      if(onSuccess){
        onSuccess(data);
      }
    },
    error: function(XMLHttpRequest, textStatus, errorThrown){
      if(onError){
        onError();
      }
      console.log(XMLHttpRequest, textStatus, errorThrown, JSON.stringify(errorThrown));
    }
  })
}

/* 新建模板 */
function newTemplet(templet, onSuccess, onError){
  $.ajax({
    url: process.env.API_ROOT + 'project/templet/create',
    type: 'POST',
    dataType: 'text',
    data: JSON.stringify(templet),
    beforeSend: function(request) {
      request.setRequestHeader("Content-Type", 'application/json');
    },
    success: function (data) {
      if(onSuccess){
        onSuccess(data);
      }
    },
    error: function(XMLHttpRequest, textStatus, errorThrown){
      if(onError){
        onError();
      }
      console.log(XMLHttpRequest, textStatus, errorThrown, JSON.stringify(errorThrown));
    }
  })
}


/* 新建招标项目 */
function newZB(data, onSuccess, onError){
  $.ajax({
    url: process.env.API_ROOT + 'project/zb/create',
    type: 'POST',
    dataType: 'text',
    data: JSON.stringify(data),
    beforeSend: function(request) {
      request.setRequestHeader("Content-Type", 'application/json');
    },
    success: function (data) {
      if(onSuccess){
        onSuccess(data);
      }
    },
    error: function(XMLHttpRequest, textStatus, errorThrown){
      if(onError){
        onError();
      }
      console.log(XMLHttpRequest, textStatus, errorThrown, JSON.stringify(errorThrown));
    }
  })
}

function download(url, onSuccess, onError) {
  url = process.env.API_ROOT + url;
  console.log(url);
  var form=$("<form>");//定义一个form表单
  form.attr("style","display:none");
  form.attr("target","");
  form.attr("method","post");
  form.attr("action",url);
  var input1=$("<input>");
  input1.attr("type","hidden");
  input1.attr("name","exportData");
  input1.attr("value",(new Date()).getMilliseconds());
  $("body").append(form);//将表单放置在web中
  form.append(input1);
  form.submit();//表单提交
}

function excel(data, type, onSuccess, onError) {
  $.ajax({
    url: process.env.API_ROOT + 'project/exportexcel/' + type,
    type: 'POST',
    dataType: 'json',
    data: JSON.stringify(data),
    beforeSend: function(request) {
      request.setRequestHeader("Content-Type", 'application/json');
    },
    success: function (data) {
      if(onSuccess){
        onSuccess(data);
      }
    },
    error: function(XMLHttpRequest, textStatus, errorThrown){
      if(onError){
        onError();
      }
      console.log(XMLHttpRequest, textStatus, errorThrown, JSON.stringify(errorThrown));
    }
  })
}

/* 新建投标项目 */
function newTB(data, onSuccess, onError){
  $.ajax({
    url: process.env.API_ROOT + 'project/tb/create',
    type: 'POST',
    dataType: 'text',
    data: JSON.stringify(data),
    beforeSend: function(request) {
      request.setRequestHeader("Content-Type", 'application/json');
    },
    success: function (data) {
      if(onSuccess){
        onSuccess(data);
      }
    },
    error: function(XMLHttpRequest, textStatus, errorThrown){
      if(onError){
        onError();
      }
      console.log(XMLHttpRequest, textStatus, errorThrown, JSON.stringify(errorThrown));
    }
  })
}


/* 删除项目 */
function delProject(projectID, onSuccess, onError){
  $.ajax({
    url: process.env.API_ROOT + 'project/delete/' + projectID,
    type: 'POST',
    dataType: 'text',
    beforeSend: function(request) {
      request.setRequestHeader("Content-Type", 'application/json');
    },
    success: function (data) {
      if(onSuccess){
        onSuccess(data);
      }
    },
    error: function(XMLHttpRequest, textStatus, errorThrown){
      if(onError){
        onError();
      }
      console.log(XMLHttpRequest, textStatus, errorThrown, JSON.stringify(errorThrown));
    }
  })
}

/* 读取项目 */
function readProject(projectID, onSuccess, onError){
  $.ajax({
    url: process.env.API_ROOT + 'project/read/' + projectID,
    type: 'GET',
    dataType: 'json',
    beforeSend: function(request) {
      request.setRequestHeader("Content-Type", 'application/json');
      request.setRequestHeader('If-Modified-Since', 0);
    },
    success: function (data) {      
      if(onSuccess){
        onSuccess(data);
      }
    },
    error: function(XMLHttpRequest, textStatus, errorThrown){
      if(onError){
        onError();
      }
      console.log(XMLHttpRequest, textStatus, errorThrown, JSON.stringify(errorThrown));
    }
  })
}

/* 读取项目 */
function copyProject(projectID, onSuccess, onError){
  $.ajax({
    url: process.env.API_ROOT + 'project/copy/' + projectID,
    type: 'POST',
    dataType: 'text',
    beforeSend: function(request) {
      request.setRequestHeader("Content-Type", 'application/json');
    },
    success: function (data) {
      if(onSuccess){
        onSuccess(data);
      }
    },
    error: function(XMLHttpRequest, textStatus, errorThrown){
      if(onError){
        onError();
      }
      console.log(XMLHttpRequest, textStatus, errorThrown, JSON.stringify(errorThrown));
    }
  })
}


/* 修改项目信息 */
function updateProject(projectID, model, onSuccess, onError){
  $.ajax({
    url: process.env.API_ROOT + 'project/update/' + projectID,
    type: 'POST',
    dataType: 'text',
    data: JSON.stringify(model),
    beforeSend: function(request) {
      request.setRequestHeader("Content-Type", 'application/json');
    },
    success: function (data) {
      if(onSuccess){
        onSuccess(data);
      }
    },
    error: function(XMLHttpRequest, textStatus, errorThrown){
      if(onError){
        onError();
      }
      console.log(XMLHttpRequest, textStatus, errorThrown, JSON.stringify(errorThrown));
    }
  })
}

// 获取清单库列表
function getBQDBs(onSuccess, onError){
  $.ajax({
    url: process.env.API_ROOT + 'qdk/list',
    type: 'GET',
    dataType: 'json',
    beforeSend: function(request) {
      request.setRequestHeader("Content-Type", 'application/json');
    },
    success: function (data) {
      if(onSuccess){
        onSuccess(data);
      }
    },
    error: function(XMLHttpRequest, textStatus, errorThrown){
      if(onError){
        onError();
      }
      console.log(XMLHttpRequest, textStatus, errorThrown, JSON.stringify(errorThrown));
    }
  })
}

// 获取清单库数据
function getBQDB(dbID, onSuccess, onError){
  $.ajax({
    url: process.env.API_ROOT + 'qdk/read/' + dbID,
    type: 'GET',
    dataType: 'json',
    beforeSend: function(request) {
      request.setRequestHeader("Content-Type", 'application/json');
    },
    success: function (data) {
      // 设置清单的章节名称和专业名称，方便后面分部整理
      var sectionName = {};
      var sectionCode = {};
      var tradeName = {};
      data.Section.forEach(function(item){
        sectionName[item.Key] = item.Description;
        sectionCode[item.Key] = item.Code;
      });
      data.Trade.forEach(function(item){
        tradeName[item.Key] = item.Description;
      });
      data.BQItem.forEach(function(item){
        item.SectionName = sectionName[item.SectionID];
        item.SectionCode = sectionCode[item.SectionID];
        item.TradeName = tradeName[item.TradeID];
      });
      if(onSuccess){
        onSuccess(data);
      }
    },
    error: function(XMLHttpRequest, textStatus, errorThrown){
      if(onError){
        onError();
      }
      console.log(XMLHttpRequest, textStatus, errorThrown, JSON.stringify(errorThrown));
    }
  })
}

function shareProject(contentObj, onSuccess, onError){
  $.ajax({
    url: process.env.API_ROOT + 'project/share/',
    type: 'POST',
    dataType: 'text',
    data: JSON.stringify(contentObj),
    beforeSend: function(request) {
      request.setRequestHeader("Content-Type", 'application/json');
    },
    success: function (data) {
      if(onSuccess){
        onSuccess(data);
      }
    },
    error: function(XMLHttpRequest, textStatus, errorThrown){
      if(onError){
        onError();
      }
      console.log(XMLHttpRequest, textStatus, errorThrown, JSON.stringify(errorThrown));
    }
  });
}

function getUserList(onSuccess, onError){
  $.ajax({
    url: process.env.API_ROOT + 'qdk/userlist/',
    type: 'GET',
    dataType: 'json',
    beforeSend: function(request) {
      request.setRequestHeader("Content-Type", 'application/json');
    },
    success: function (data) {        
      if(onSuccess){
        onSuccess(data);
      }
    },
    error: function(XMLHttpRequest, textStatus, errorThrown){
      if(onError){
        onError();
      }
      console.log(XMLHttpRequest, textStatus, errorThrown, JSON.stringify(errorThrown));
    }
  })
}

function getRegionAndRateDate(onSuccess, onError){
  $.ajax({
    url: process.env.API_ROOT + 'qdk/regionRateDate/',
    type: 'GET',
    dataType: 'json',
    beforeSend: function(request) {
      request.setRequestHeader("Content-Type", 'application/json');
    },
    success: function (data) {        
      if(onSuccess){
        onSuccess(data);
      }
    },
    error: function(XMLHttpRequest, textStatus, errorThrown){
      if(onError){
        onError();
      }
      console.log(XMLHttpRequest, textStatus, errorThrown, JSON.stringify(errorThrown));
    }
  })
}

function getMarketRate(regionDate, onSuccess, onError){
  $.ajax({
    url: process.env.API_ROOT + 'qdk/marketRate/',
    type: 'POST',
    dataType: 'json',
    data: JSON.stringify(regionDate),
    beforeSend: function(request) {
      request.setRequestHeader("Content-Type", 'application/json');
    },
    success: function (data) {
      if(onSuccess){
        onSuccess(data);
      }
    },
    error: function(XMLHttpRequest, textStatus, errorThrown){
      if(onError){
        onError();
      }
      console.log(XMLHttpRequest, textStatus, errorThrown, JSON.stringify(errorThrown));
    }
  })
}

// 获取自定义宏代码 end
export default function request() {
  return {
    login: login,
    logout: logout,
    getLoginInfo: getLoginInfo,
    getCatalog: getCatalog,
    getTemplet: getTemplet,
    getZBFile: getZBFile,
    getProject: getProject,
    newTemplet: newTemplet,
    newZB: newZB,
    newTB: newTB,
    excel: excel,
    download: download,
    delProject: delProject,
    readProject: readProject,
    updateProject: updateProject,
    copyProject: copyProject,
    getBQDBs: getBQDBs,
    getBQDB: getBQDB,
    getProjectSpec: getProjectSpec,
    shareProject: shareProject,
    getUserList: getUserList,
    getRegionAndRateDate: getRegionAndRateDate,
    getMarketRate: getMarketRate
  }
}
