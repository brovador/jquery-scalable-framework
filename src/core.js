Core = (function() {
	var moduleData = {};
	var listeners = {};
	var loadedScripts = {};
	
	/*
	 * URL Changing listener
	 * 
	 */
	window.setInterval(function(){
		var newURL = document.location.hash;
		var q = {};
		
		var queryString = "";
		var queryIndex = document.location.hash.indexOf("?");
		if(queryIndex != -1){
			newURL = newURL.substring(0,queryIndex);
			queryString = document.location.hash.substring(queryIndex + 1, document.location.hash.length);
		}
		if(Core.sendNotifications && (newURL != Core.actualURL || queryString != Core.actualQueryString)){
			Core.actualURL = newURL;
			Core.actualQueryString = queryString;
			
			if (queryString != ""){
				var attrs =  queryString.split("&");
				for(var i=0;i<attrs.length;i++){
					var parts = attrs[i].split("=");
					if(parts.length == 2){
						q[parts[0]] = parts[1];
					}
					else{
						q[parts[0]] = null;
					}
				}
			}
			Core.dispatchNotification('url-changed', {url: newURL.replace("#!/", ""), query: q});
			
		}
	},300);
	
	/*
	 * onclick event binding to prevent anchor default behaviour
	 */
	$(document).click(function(event){
		if(event.target.type == "A"){
			var $anchor = $(event.target);
			Core.updateHash($anchor.attr("href"));
		}
	});
	
	/*
	 * AJAX requests events
	 */
	$(document).ajaxSend(function(e, xhr, settings){
		Core.dispatchNotification('ajax-send', {url : settings.url, data: settings.data});
	});
	$(document).ajaxSuccess(function(e, xhr, settings){
		Core.dispatchNotification('ajax-success', {url : settings.url, data: settings.data});
	});
	$(document).ajaxError(function(e, xhr, settings){
		Core.dispatchNotification('ajax-error', {url : settings.url, data: settings.data});
	});
	$(document).ajaxComplete(function(e, xhr, settings){
		Core.dispatchNotification('ajax-complete', {url : settings.url, data: settings.data});
	});
	
	var cache = {};
	
	return {
		actualURL: null,
		actualQueryString: null,
		debug: function(data){
			$("#debug").append(data);
		},
		
		/*
		 * URL CHANGE
		 */
		updateHash : function(url, queryData){
			if(typeof(queryData) == "object"){
				queryData = $.param(queryData);
			}
			if(typeof(queryData) == "string"){
				url += "?" + queryData;					
			}
			
			if(url.startsWith("#")){
				document.location.hash = "/" + url;	
			}
			else{
				document.location.href = url;
			}
		},
		
		/*
		 * DOM ACCESS
		 */
		/**
		 * Return the DOM element if is inside the module, if not return null
		 * @param {Object} id
		 * @param {Object} moduleId
		 */
		getElementByIdInModule: function(id, moduleId){
			var module = moduleData[moduleId];
			
			var result = $("#" + module.mainContainer.id)
			if(id != module.mainContainer.id){
				var result = $(" #" + id, result);
			}
			if(result.length > 0){
				result = result[0];
			}
			else{
				result = null;
			}
			return result;
		},
		/**
		 * Inserts the htmlData inside de DOM object with the id selected
		 * @param {Object} id
		 * @param {Object} htmlData
		 */
		insertHTML: function(id, htmlData){
			$("#" + id).html(htmlData);
		},

		/**
		 * Loads urls with data, using the selected method (GET or POST) and calls
		 * onSuccess or onFail callback
		 * @param {Object} url
		 * @param {Object} data
		 * @param {Object} method
		 * @param {Object} onSuccess
		 * @param {Object} onFail
		 */
		ajax: function(url, data, method, onSuccess, onFail){
			$.ajax({
				url: url,
				data: data,
				type: method,
				cache: true,
				success: function(data){
					onSuccess(data);
				},
				error: function(request, status, error){
					onFail(error);
				}
			})
		},
		
		
		/*
		 * EVENT HANDLING
		 */
		/**
		 * Ad a new sandbox listener for a notification
		 * @param {Object} notificationType
		 * @param {Object} sandbox
		 */
		addListener: function(notificationType, sandbox){
			if(!listeners.hasOwnProperty(notificationType)){
				listeners[notificationType] = [];
			}
			// FIX ME: check if sandbox exists in array
			listeners[notificationType].push(sandbox);
		},
		/**
		 * Remove a sandbox listener of a notification
		 * @param {Object} notificationType
		 * @param {Object} sandbox
		 */
		removeListener: function(notificationType, sandbox){
			//TODO
			throw "Not implemented"
		},
		/**
		 * Dispatch a notification over the listeners
		 * @param {Object} notificationType
		 * @param {Object} data
		 */
		dispatchNotification: function(notificationType, data){
			if(!this.sendNotifications){
				return;
			}
			var l = listeners[notificationType];
			if(typeof(l) != "undefined"){
				for(var i=0;i<l.length;i++){
					l[i].notify(notificationType, data);
				}
			}
		},
		/**
		 * Starts the notification system
		 */
		sendNotifications: false,
		
		/*
		 * MODULE REGISTRATION
		 */
		/**
		 * Load asyncrhonously a script or a list of scripts expressed as package
		 * @param {Object} pkgList
		 * @param {Object} onComplete
		 */
		require: function(pkgList, onComplete){
			var loadDone = function(){
				var allLoaded = true;
				for(var pkg in loadedScripts){
					if(loadedScripts[pkg] == 0){
						allLoaded = false;
						break;
					}
				}
				if(allLoaded && typeof(onComplete) == "function"){
					onComplete();
				}
			}
			
			if(typeof(pkgList) == 'string'){
				pkgList = [pkgList];
			}
			
			for(var i=0;i<pkgList.length;i++){
				var pkg = pkgList[i];
				if(!loadedScripts.hasOwnProperty(pkg)){
					loadedScripts[pkg] = 0;
				}
			}
			for(var i=0;i<pkgList.length;i++){
				var pkg = pkgList[i];
				if(loadedScripts[pkg] == 0){
					var scriptURL = './' + pkg.replace(/\./g,'/') + '.js';
					var self = this;
					var loadScript = function(scriptPkg){
						$.getScript(scriptURL, function(){
							loadedScripts[scriptPkg] = 1;
							loadDone();
						});
					}
					loadScript(pkg);
				}
			}
			loadDone();
		},
		/**
		 * Register a new module
		 * @param {Object} moduleId
		 * @param {Object} creator
		 */
		register: function(moduleId, creator, mainContainer){
			moduleData[moduleId] = {
				creator: creator,
				instance: null,
				mainContainer: mainContainer
			}
		},
		/**
		 * Start the specified module
		 * @param {Object} moduleId
		 */
		start: function(moduleId){
			moduleData[moduleId].instance = moduleData[moduleId].creator(new Sandbox(this, moduleId));
			moduleData[moduleId].instance.init();
		},
		
		/**
		 * Stop the specified module
		 * @param {Object} moduleId
		 */
		stop: function(moduleId){
			var data = moduleData[moduleId];
			if(data.instance){
				data.instance.destroy();
				data.instance = null;
			}
		},
		/**
		 * Start all the modules
		 */
		startAll: function(){
			for(var moduleId in moduleData){
				if(moduleData.hasOwnProperty(moduleId)){
					this.start(moduleId);
				}
			}
		},
		/**
		 * Stop all the modules 
		 */
		stopAll: function(){
			for(var moduleId in moduleData){
				if(moduleData.hasOwnProperty(moduleId)){
					this.stop(moduleId);
				}
			}
		}
	}
	
})();

String.prototype.startsWith = function(str) {return (this.match("^"+str)==str)}
