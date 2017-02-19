//todo timer
//add icons and delete, add, edit 


class TaskStates{
	constructor(tasksFromBG){
		this.idCounter = 0;
		if(tasksFromBG){
			this.updateTasks(tasksFromBG)
		}else{
			this.tasks = [];
		}
	}
	convertTask(taskFromBG){
		var newTask={};
		newTask = taskFromBG;
		newTask.idUI = this.idCounter;
		this.idCounter++;
		if(taskFromBG.type=='atTheTime'){
			var minutes = taskFromBG.seconds/60;
			minutes = Math.floor(minutes);
			var seconds = taskFromBG.seconds % 60;
			if(seconds < 10){
				seconds = '0' + seconds;
			}
			var hours = minutes/60;
			hours = Math.floor(hours);
			minutes = minutes % 60;
			if(minutes < 10){
				minutes = '0' + minutes;
			}
			newTask.hours = hours;
			newTask.minutes = minutes;
			newTask.seconds = seconds;
		}
		console.log(newTask);
		return newTask;
	}
	updateTasks(tasksFromBG){
		this.tasks = [];	
		this.idCounter = 0;
		tasksFromBG.forEach((task)=>{
			this.tasks.push(this.convertTask(task));
		});
		this.updateUI();
	}
	getIdbyidUI(idUI){
		idUI = +idUI;
		var resId;
		this.tasks.forEach((task)=>{
			if(idUI==task.idUI){
				resId =  task.id;
			}
		});
		return resId;
	}
	getTaskbyidUI(idUI){
		idUI = +idUI;
		var res;
		this.tasks.forEach((task)=>{
			if(idUI==task.idUI){
				res =  task;
			}
		});
		return res;		
	}
	updateUI(){
		console.log(this.tasks);
		$('.task').remove();
		for(var i = 0; i<this.tasks.length;i++){
			var buttonText;
			var statusContainer;
			var classStatus;
			if(this.tasks[i].inProgress){
				buttonText = `<button type="button" class = "btn btn-info start-stop-Task">Stop</button>`
			}else{
				buttonText = `<button type="button" class = "btn btn-info start-stop-Task">Start</button>`
			}
			if(this.tasks[i].type=='atTheTime'){
				classStatus = `
					<span class="hours">${this.tasks[i].hours}:</span><span class="minutes">${this.tasks[i].minutes}:</span><span class="seconds">${this.tasks[i].seconds}</span>
				`
			}else{
				classStatus = ``;
			}
			if(this.tasks[i].isSuccessed){
				statusContainer = `
					<span class = "task-status task-status-successfull">
					<span class="glyphicon glyphicon-ok" aria-hidden="true"></span>
						complete
					</span>	
				`
			}else{
				statusContainer = `
					<span class = "task-status task-status-unfulfilled">
					<span class="glyphicon glyphicon-remove-sign" aria-hidden="true"></span>
						uncomplete
					</span>	

					<span class="time time-sector">
						${classStatus}
						${buttonText}
					</span>
				`
			}
			if(this.tasks[i].isSuccessed){
				buttonText = ``;
			}
			if(this.tasks[i].type=='checkable'){
			}
			
			var container = `
			<div href="#" class = "list-group-item list-group-item-action task" >
				<span class = "idUI">${this.tasks[i].idUI}</span>

				<span class="task-name">${this.tasks[i].name}
				</span>

				<span class="right-side">
					${statusContainer}
					<span class="task-operations">
						<div class="task-operation">
							<span class="glyphicon glyphicon-edit edit-Task" aria-hidden="true"></span>
						</div>

						<div class="task-operation">
							<span class="glyphicon glyphicon-remove-sign delete-Task" aria-hidden="true"></span>
						</div>

					</span>
				</span>
			</div>`																
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
		}else{
			var id = +$('#idField').text();
			postEditedTask(name, hours, minutes, type, id, backgroundPageConnection);
		}
		$('#closeModal').click();
	});
	$('#closeModal').click(function(){
		$('#taskName').val('');
		$('#taskHours').val('');
		$('#taskMinutes').val('');
		if($('#idField').length!=0){
			$('#idField').remove();
		}

	});

	$('.edit-Task').click(function(){
		var id = getTaskId(self, '.edit-task')
		//$('#taskName').val(taskStorage[]);

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
		$('.edit-Task').click(function(){
			console.log('edit');
			var parent = $(this).closest('.task');
			var idUI = $(parent).find('.idUI').text();
			var id = taskStorage.getIdbyidUI(idUI);
			var task = taskStorage.getTaskbyidUI(idUI);
			var container = `<span id = "idField">${id}<span>`;
			$('.modal-footer').append(container);
			$('#idField').hide();
			$('#taskName').val(task.name);
			$('#taskHours').val(task.hours);
			$('#taskMinutes').val(task.minutes);

			var inputs = $('.form-new-Task input[name="taskType"]');
			for(var i = 0; i< inputs.length; i++){
				if($(inputs[i]).val()== task.type){
					$(inputs[i]).click();
				}
			}
			
			$('#add-task').click();
		});

		$('.delete-Task').click(function(){
			var parent = $(this).closest('.task');
			var idUI = $(parent).find('.idUI').text();
			var id = taskStorage.getIdbyidUI(idUI);
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
			var parent = $(this).closest('.task');
			var idUI = $(parent).find('.idUI').text();
			var id = taskStorage.getIdbyidUI(idUI);
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
	function postEditedTask(name, hours, minutes, type, id, background){
		var seconds = ((+hours*60)+minutes)*60;
		console.log(seconds);
		background.postMessage({
		 	type: 'editedTask',
		 	id: id,
		 	name: name,
		 	seconds: seconds,
		 	taskType: type
		});
	}
});