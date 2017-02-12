//todo timer
//add icons and delete, add, edit 


class TaskStates{
	constructor(tasksFromBG){
		if(tasksFromBG){
			this.updateTasks(tasksFromBG)
		}else{
			this.tasks = [];
		}
	}
	updateTasks(tasksFromBG){
		this.tasks = [];	
		tasksFromBG.forEach((task)=>{
			this.tasks.push(task);
		});
		this.updateUI()
	}
	updateUI(){
		console.log(this.tasks);
		$('.task').remove();
		for(var i = 0; i<this.tasks.length;i++){
			var status;
			var seconds;
			if(!this.tasks[i].seconds||this.tasks[i].seconds<=0){
				seconds = '';
				if(this.tasks[i].isSuccessed){
					status = "Complete"
				}else{
					status = "Uncomplete"
				}
			}else{
				status = this.tasks[i].seconds/60;
				status = Math.floor(status);
				seconds = this.tasks[i].seconds % 60;
				if(seconds==0){
					seconds = '00';
				}
			}
			var buttonText;
			if(this.tasks[i].inProgress){
				buttonText = 'Stop'
			}else{
				buttonText = 'Start'
			}
			if(this.tasks[i].isSuccessed){
				buttonText = '';
			}
			var container = `
			<li class="task clearfix">
				${this.tasks[i].name}
				<button class="delete-Task">delete</button>
				<button class="edit-Task">edit</button>
				<span class="right-side-Task">
					<div class = "timeset"><span class="minutes">${status} :</span> <span class="seconds">${seconds}</span> </div>
					<button class = "start-stop-Task">${buttonText}</button>
				</span>
			</li>`
			$($('.tasks-list')[0]).append(container);
		}
	}
}
$(document).ready(function(){
	var taskStorage = new TaskStates();
	console.log(taskStorage.tasks);
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
		if(message.type=="tasks"){
			console.log(message.tasks);
			console.log(taskStorage);
			taskStorage.updateTasks(message.tasks);
			setEventEmitters(backgroundPageConnection);
		}
		if(message.type=="taskStarted"){
			console.log('started task ' + message.taskId);
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


	$('#submit').click(function(){

		var name = $('#taskName').val();
		var hours = +$('#taskHours').val();
		var minutes = +$('#taskMinutes').val();
		var type = $('.form-new-Task input[name="taskType"]:checked').val();
		var result = validateTask(name, hours, minutes, type);
		console.log($('#idField'));
		if($('#idField').length==0){
			postNewTask(name, hours, minutes, type, backgroundPageConnection);
		}
		$('#closeModal').click();
	});
	$('#closeModal').click(function(){
		$('#taskName').val('');
		$('#taskHours').val('');
		$('#taskMinutes').val('');

	});

	$('.edit-Task').click(function(){
		var id = getTaskId(self, '.edit-task')
		$('#taskName').val(taskStorage[]);

		$('#add-task').click();
	});

	$('.taskTypeInput').click(function(){
		console.log('inp');
		if($(this).attr('value') =='checkable'){
			$('#taskHours').attr('disabled', true);
			$('#taskMinutes').attr('disabled', true);
		}
		if($(this).attr('value') == 'atTheTime'){
			$('#taskHours').attr('disabled', false);
			$('#taskMinutes').attr('disabled', false);
		}
	});

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
		$('.delete-Task').click(function(){
			var id = $(this).parent().parent().attr('id');
			backgroundPageConnection.postMessage({
				type: 'deleteTask',
				id: id
			});
		});
		function getTaskId(self, selector){
			var index;
			var elems = $(selector);
			console.log(elems);
			for(var i = 0; i<elems.length; i++){
				if(elems[i] == self){
					index = i;
				}
			}
			console.log(index);
			var id = taskStorage.tasks[index].id;
			return id;
		}
		$('.start-stop-Task').click(function(){
			var id = getTaskId(this, '.start-stop-Task');
			console.log('id');
			console.log($(this).text());
			if($(this).text()=="Start"){
				backgroundPageConnection.postMessage({
					type: 'startTask',
					id: id
				});
			}else{
				backgroundPageConnection.postMessage({
					type: 'stopTask',
					id: id
				});
			}
		}); 
	}
	function validateTask(name, hours, minutes, type){
		var validateErrors = {};
		if(name.length > 40){
			validateErrors.name = false;
		}
		if(type=='atTheTime'){	
			if(hours < 0){
				validateErrors.hours = false;
			}
			if(minutes > 59 || minutes<0){
				validateErrors.name = false;
			}
		}
		console.log(validateErrors);
		return validateErrors;
	}

	function postNewTask(name, hours, minutes, type, background){
		 var seconds = ((+hours*60)+minutes)*60;
		 console.log(seconds);
		 background.postMessage({
		 	type: 'newTask',
		 	name: name,
		 	seconds: seconds,
		 	taskType: type
		 });
	}
});