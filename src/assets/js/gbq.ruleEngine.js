// 拓扑排序
function topSort(nodeArr, edgeArr){
	// 初始化入度表
	var degreeTable = {};
	nodeArr.forEach(function(item){
		degreeTable[item] = 0;
	});	
	// 循环所有边，得到入度表
	edgeArr.forEach(function(item){
		degreeTable[item.out] ++;	 
	});	
	// 得到所有入度为0的节点
	var result = [];
	var zeroList = [];
	nodeArr.forEach(function(item){
		if(degreeTable[item]==0){
			zeroList.push(item);
		}
	});
	// 不断取出一个入度为0的节点放入结果，并修改入度表	
	while(zeroList.length>0){		
		var nodeCode = zeroList[0];
		zeroList.splice(0, 1);
		result.push(nodeCode);
		// 循环所有边，修改入度表
		edgeArr.forEach(function(item){
			if(item.in == nodeCode){				
				degreeTable[item.out]--;
				if(degreeTable[item.out] == 0){
					zeroList.push(item.out);
				}
			}			
		});		
	}
	return result;
}

// 判断一个字符是否是计算操作符
function isOperator(ch){
	return (ch=='+')||(ch=='-')||(ch=='*')||(ch=='/')||(ch=='(')||(ch==')');
}

// 对表达式进行词法分析
var exprCache = {};
function analyseExpr(expr){	
	if(exprCache[expr]){		
		return exprCache[expr];
	}else{
		var idx = 0;	
		var result = [];
		var errInfo  = '';	
		while(idx < expr.length) {	
			var ch = expr[idx];			
			if(isOperator(ch)){
				var token = ch;
				idx = idx + 1;
				result.push(token);
			}else{
				var token = ch;
				idx = idx + 1;			
				while((idx<expr.length)&&!isOperator(expr[idx])) {
					token = token + expr[idx];
					idx = idx + 1;
				}					
				result.push(token);			
			}
		}
		exprCache[expr] = [result, errInfo];
		return exprCache[expr];
	}	
}

function calcModel(modelData, rules){		
	// 复制数据		
	var db = JSON.parse(JSON.stringify(modelData));				
	var macro = db.macro[0];		
	// 列表求和函数
	var sumByField = function(list, fieldName) {
		var sum = 0;
		if(list&&list.length>0) {
			sum = list.reduce(function(sum, item) {
				return sum + item[fieldName];
			}, 0);
		}
		return Math.round(sum * 100000) / 100000;  // 保留小数为了解决精度过长问题
	};

	// 列表过滤函数，通过建立索引加快速度
	var indexHash = {};
	var filterTable = function(tableName, fieldNameArr, valueArr) {
		if(fieldNameArr.length == 0){
			return db[tableName];
		}

		var sValueDemiter = '@_@';
		var sKey = tableName + '.' + fieldNameArr.join('_');
		var sValue = valueArr.join(sValueDemiter);
		// 如果没有索引，则建立
		if(indexHash[sKey] === undefined) {
			var hash = {};
			db[tableName].forEach(function(record, idx) {
				var m = fieldNameArr.map(function(fieldName) {
					return record[fieldName];
				}).join(sValueDemiter);
				if(hash[m] === undefined) {
					hash[m] = [];
				}
				hash[m].push(record);
			});
			indexHash[sKey] = hash;
		}
		// 返回列表
		if(indexHash[sKey][sValue] !== undefined) {
			return indexHash[sKey][sValue];
		} else {
			return [];
		}
	};

	// 根据一个记录和表达式进行计算
	var calcExpr = function (obj, expr){				
		if(expr==null||expr.length==0){
			return 0;
		}else{			
			var [tokenArr, info] = analyseExpr(expr);	
			if(info.length>0){
				return 0
			}else{
				var newExpr = '';
				tokenArr.forEach(function(token){
					if(token in obj){
						newExpr = newExpr + obj[token];
					}else{
						newExpr = newExpr + token;
					}
				});			
				var value = eval(newExpr);	
				value = Math.round(value*100)/100;
				return value;
			}					
		}			
	}

	// 保留两位小数
	var toDecimal = function(value){
		if(isNaN(value)){
      		return 0;
    	}
    return Math.round(value * 100) / 100;    
	}

	
	// 通过设置getter函数添加计算字段,this._@fieldName_=null是为了消除循环引用
	var sCodeFmt = "db.@tableName.forEach(function(v){v.__defineGetter__('@fieldName', function(){if(this._@fieldName_==undefined){this._@fieldName_=null;this._@fieldName_=@expr;};return this._@fieldName_;})});";
	rules.forEach(function(rule) {
		var sCode = sCodeFmt.replace('@tableName', rule.tableName).replace('@expr', rule.expr).split('@fieldName').join(rule.fieldName);						
		eval(sCode);
	});
	
	// 写回原来的数据
	rules.forEach(function(rule) {
		modelData[rule.tableName].forEach(function(record, idx) {		
			try{
				record[rule.fieldName] = db[rule.tableName][idx][rule.fieldName];
			}	catch(e){
				record[rule.fieldName] = 0;
				console.log(e);
			}			
		});
	});	
}

export default function ruleEngine(){  
	return {		
		isOperator: isOperator,
		topSort: topSort,		
    	calcModel: calcModel,
    	analyseExpr: analyseExpr
	}
}
