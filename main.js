//todo timer
//add icons and delete, add, edit 
$(document).ready(function(){
	writeDate();
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
			setEventEmitters(backgroundPageConnection);
		}
		if(message.type="taskStarted"){
			console.log('started task ' + message.taskId);
			});
		}
	});
	$(document).keypress(function(e){
		console.log(e);
		if(e.which==99){
			var background = chrome.extension.getBackgroundPage();
			chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
				var active = tabs[0].id;
	          	console.log(active);
				chrome.tabs.update(active, { url: "chrome-search://local-ntp/local-ntp.html" }, function() { });
			});
		}
	});
	$('#addTask').click(function(){
		console.log('new task');
	});

});
function addTasks(tasks){
	$('.task').remove();
	for(var i = 0; i<tasks.length;i++){
		var status;
		if(!tasks[i].minutes){
			if(tasks[i].isSuccessed){
				status = "Complete"
			}else{
				status = "Uncomplete"
			}
		}else{
			status = tasks[i].minutes;
		}
		var container = `
		<li class="task clearfix" id = "${tasks[i].id}">
			${tasks[i].name} 
			<span>
				<div class = "timeset"><span class="minutes">${status} :</span> <span class="seconds">00</span> </div>
				<button class = "start-stop-Task">Start</button>
			</span>
		</li>`
		$($('.tasks-list')[0]).append(container);
	}
}

function getDate(){
	var today = new Date();
	var dd = today.getDate();
	var mm = today.getMonth()+1; 
	var yyyy = today.getFullYear();

	if(dd<10) {
	    dd='0'+dd
	} 

	if(mm<10) {
	    mm='0'+mm
	} 

	today = dd+'/'+mm+'/'+yyyy;
	return today;
}
function writeDate(){
	$('.date-container').append(getDate());
}
function setEventEmitters(backgroundPageConnection){
	$('.start-stop-Task').click(function(){
		var id = $(this).parent().parent().attr('id');
		console.log('id');
		backgroundPageConnection.postMessage({
			type: 'startTask',
			id: id
		});
	}); 
}
function startTimer(id){
	var elems = $('.task');
	elems.forEach((elem)=>{
		if(+$(elem).attr('id')==id){
			var seconds = +$(elem).find('.seconds');
			var minutes = +$(elem).find('.minutes');
			setInterval(()=>{
				if(seconds<=0){

				}
				seconds--;
			});
		}
	});
}