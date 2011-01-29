LoaderModule = function(sandbox){
	return {
		init: function(){
			sandbox.listen('load-section', this.loadSection, this);
		},
		destroy: function(){
			
		},
		loadSection: function(data){
			switch(data.section){
				case 'module1':
					sandbox.loadHTML('module1/content.html', 'loaderContainer');
					break;
				case 'module2':
					sandbox.loadHTML('module2/content.html', 'loaderContainer');
					break;
			}
		}
	}
}