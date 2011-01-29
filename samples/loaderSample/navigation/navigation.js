NavigationModule = function(sandbox){
	return {
		init: function(){
			sandbox.listen('url-changed', this.navigateTo, this);
			sandbox.listen('ajax-send', this.ajaxSend, this);
			sandbox.listen('ajax-complete', this.ajaxComplete, this);
		},
		destroy: function(){
			
		},
		navigateTo: function(data){
			switch(data.url) {
			case 'module1':
			    sandbox.notifyAll('load-section', {section : 'module1'});
				break;
			case 'module2':
				sandbox.notifyAll('load-section', {section : 'module2'});
				break;
			}
		},
		
		ajaxSend: function(data){
			var message = $(sandbox.getElementById("message"));
			$(message).text("Cargando: " + data.url).show();
		},
		ajaxComplete: function(data){
			var message = $(sandbox.getElementById("message"));
			$(message).fadeOut(800);
		}
	}
}
