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
	updateTasks(tasksFromBG){
		this.tasks = [];	
		this.idCounter = 0;
		tasksFromBG.forEach((task)=>{
			var newTask = {};
			newTask = task;
			newTask.idUI = this.idCounter;
			this.tasks.push(task);
			this.idCounter++;
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
				resId =  task;
			}
		});
		return res;		
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
				status = status + ':';
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
			<div href="#" class = "list-group-item list-group-item-action task" >
				<span class = "idUI">${this.tasks[i].idUI}</span>

				<span class="task-name">${this.tasks[i].name}
				</span>

				<span class="right-side">

					<span class = "task-status task-status-unfulfilled">
					<span class="glyphicon glyphicon-ok" aria-hidden="true"></span>
						uncomplete
					</span>	

					<span class="time time-sector">
						<span class="minutes">${status}</span><span class="seconds">${seconds}</span>
						<button type="button" class = "btn btn-info start-stop-Task">${buttonText}</button>
					</span>

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
			var parent = $(this).closest('.task');
			var idUI = $(parent).find('.idUI').text();
			var id = taskStorage.getIdbyidUI(idUI);
			var task = taskStorage.getTaskbyidUI(idUI);
			var container = `<span id = "idField">${id}<span>`;
			$('.modal-footer').append(container);
			$('#idField').hide();
			$('#taskName').val(task.name);
			$('#taskHours').val('');
			$('#taskMinutes').val('');
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
			var id = getTaskId(this, '.start-stop-Task');
			console.log('id');
			console.log(id);
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