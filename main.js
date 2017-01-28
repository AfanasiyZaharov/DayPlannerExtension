
$(document).ready(function(){
	console.log('wrote');
	var backgroundPageConnection;
	backgroundPageConnection = chrome.runtime.connect({
		name: "PlannerPage"
	});
	backgroundPageConnection.postMessage({
		type: "getTasks"
	});
	backgroundPageConnection.onMessage.addListener(function(message){
		if(message.type="tasks"){
			console.log(message.tasks);
			addTasks(message.tasks);
		}
	});
	$(document).keypress(function(e){
		console.log(e);
		if(e.which==99){
			var background = chrome.extension.getBackgroundPage();
			console.log(background);
			console.log('asddsa');
			chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {

				var active = tabs[0].id;
	          	console.log(active);
	            // Set the URL to the Local-NTP (New Tab Page)
				chrome.tabs.update(active, { url: "chrome-search://local-ntp/local-ntp.html" }, function() { });
			});
		}
	});


});
function addTasks(tasks){
	for(var i = 0; i<tasks.length;i++){
		var container = `<li>${tasks[i].name}   <i>${tasks[i].time}</i></li>`
		$($('.tasks-list')[0]).append(container);
	}
}

//			