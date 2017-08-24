import request from "./gbq.request.js";
import region from "./gbq.region.js"
   
//获取新建模板时的专业分类列表
function getTempletCatalog(onSuccess, onError){	  
  request().getCatalog(onSuccess, onError);
}

//获取用户工程列表
function getAllProject(onSuccess, onError){
  request().getProject(request().getLoginInfo().userName, onSuccess, onError);  
}


//新建模板工程
function createTemplet(catalogID, catalog, projectname, onSuccess, onError){
	var contentObj = {
    'catalogID': catalogID,
    'catalog': catalog,
    'description': projectname,
    'data': {},
    'userID': request().getLoginInfo().userName
  };
  region().initProjectData(contentObj);
  request().newTemplet(contentObj, onSuccess, onError);
}

//删除模板工程
function delProject(projectid, onSuccess, onError){
	request().delProject(projectid, onSuccess, onError);  
}

function copyProject(projectid, onSuccess, onError) {
  request().copyProject(projectid, onSuccess, onError);
}

//修改模板工程名称
function updateTemplateName(projectid, projectnewname, onSuccess, onError){
  request().readProject(projectid, function(data){
      if (data) {
        let project = data;
        project.description = projectnewname;
        request().updateProject(projectid, project, onSuccess, onError);
      }
  }, function(){

  });
}

//获取模板工程列表
function getTemplet(onSuccess, onError){
	request().getTemplet(onSuccess, onError);  
}

//获取招标工程列表
function getZBFile(onSuccess, onError){
  request().getZBFile(onSuccess, onError);  
}

// 新建投标书
function createTB(projectname, zbID, onSuccess, onError){
  var contentObj = {    
    'description': projectname,
    'zid': zbID,    
    'userID': request().getLoginInfo().userName
  };  
  request().newTB(contentObj, onSuccess, onError);
}

//新建招标书
function createZB(projectname, templateid, onSuccess, onError){
  var contentObj = {    
    'description': projectname,
    'tid': templateid,    
    'userID': request().getLoginInfo().userName
  };  
  request().newZB(contentObj, onSuccess, onError);  
}

function getPermission(){
  return request().getLoginInfo().permission;
}

function shareProject(projectID, userID, onSuccess, onError){
  var contentObj = {
    'projectID': projectID,
    'userID': userID 
  };
  request().shareProject(contentObj, onSuccess, onError);
}

function getUserList(onSuccess, onError){
  request().getUserList(onSuccess, onError);
}

export default function projectManager(){  
  return {        
    getPermission: getPermission,
    getTempletCatalog: getTempletCatalog,
    getAllProject: getAllProject,
    createTemplet: createTemplet,
    delProject: delProject,
    copyProject: copyProject,
    updateTemplateName: updateTemplateName,   
    getTemplet: getTemplet,
    getZBFile: getZBFile,
    createTB: createTB,
    createZB: createZB,
    shareProject: shareProject,
    getUserList: getUserList,
  }
}