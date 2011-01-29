Sandbox = function(Core, moduleId){
	
	var listeners = {};

	return {
		/**
		 * Returns the actual relative url
		 */
		getActualURL: function(){
			return Core.actualURL.replace("#!/", "");
		},
		/**
		 * Return the DOM object selected if exists inside the module
		 * @param {Object} id
		 */
		getElementById: function(id){
			return Core.getElementByIdInModule(id, moduleId);
		},
		
		/**
		 * Loads the contents of url in container
		 * @param {Object} url
		 * @param {Object} container
		 */
		loadHTML: function(url, container, callback, data, method){
			var c = this.getElementById(container);
			if(c != null){
				this.load(url, data, function(result){
					if(result.status == "success"){
						Core.insertHTML(container, result.data);
						if(typeof(callback) == "function"){
							callback();
						}
					}
				}, method);
			}
		},
		
		
		/**
		 * Loads de current urls and executes callback function once finished
		 * @param {Object} url
		 * @param {Object} data
		 * @param {Object} callback
		 * @param {Object} method
		 */
		load: function(url, data, callback, method){
			if(typeof(method) == "undefined"){
				method = "GET";
			}
			
			Core.ajax(url, data, method, function(data){
				var result = {
					'status' : 'success',
					'data' : data
				};
				callback(result);
			}, function(error){
				var result = {
					'status' : 'error',
					'data' : error
				};
				callback(result);
			});
		},
		
		
		/**
		 * Sends a notification to all the modules
		 * @param {Object} notificationType
		 * @param {Object} data
		 */
		notifyAll: function(notificationType, data){
			Core.dispatchNotification(notificationType, data);
		},
		/**
		 * Sends a notification to the owner module
		 * @param {Object} notificationType
		 * @param {Object} data
		 */
		notify: function(notificationType, data){
			var l = listeners[notificationType];
			for(var i=0;i<l.length;i++){
				l[i].callback.call(l[i].listener, data);
			}
		},
		/**
		 * Add a callback listener for the especified notification
		 * and registers it over the Core listeners 
		 * @param {Object} notificationType
		 * @param {Object} callback
		 * @param {Object} listener
		 */
		listen: function(notificationType, callback, listener){
			if(!listeners.hasOwnProperty(notificationType)){
				listeners[notificationType] = [];
			}
			//FIX ME: check that listener does not exists
			listeners[notificationType].push({listener: listener, callback : callback});
			Core.addListener(notificationType, this);
		},
		/**
		 * Remove a listener of a notification
		 * @param {Object} notificationType
		 * @param {Object} listener
		 */
		endListen: function(notificationType, listener){
			//TODO...
			throw "Not implemented"
		}
	}
}