//add port storage

class PortStorage{
	constructor(){
		this.ports = [];
	}
	addPort(port){
		this.ports.push(port);
		console.log(this.ports);
		//this.setOnDisonnectEvents();
	}
	setOnDisonnectEvents(){
		this.ports.forEach((port, i)=>{
			port.onDisconnect.addListener((port)=>{
				this.ports.splice(i, 1);
				this.setOnDisonnectEvents();
				console.log(this.ports);
			});
		});
	}
	sendPostMessage(data){
		this.ports.forEach((port, i)=>{
			try{
				port.postMessage(data);
			}catch(e){
				console.error(e);
				this.deletePort(i);
			}
		});
	}
	deletePort(portIndex){
		console.log(this.ports);
		this.ports.splice(portIndex, 1);
	}
}
console.log('start');
class Task{
	constructor(name, type, seconds){
		this.name = name;
		this.type = type;
		this.seconds = +seconds;
		this.isSuccessed = false;
		this.inProgress = false;
		this.id = undefined;
		console.log(this);
	}
	startTask(){
		if(this.type == "checkable"){
			this.isSuccessed = true;
			return;
		}
		this.inProgress = true;
		if(this.type == "atTheTime"){
			this.interval = setInterval(()=>{
				this.seconds = this.seconds - 1;
				if(this.seconds<= 0){
					clearInterval(this.interval);
					this.isSuccessed = true;
					this.inProgress = false;
					storage.sendChanges();
					return;
				}
				storage.sendChanges();
				console.log(this.seconds);
			}, 1000);
		}
	}
	stopTask(){
		this.inProgress = false;
		clearInterval(this.interval);
	}
}
class TaskStorage{
	constructor(){
		this.Storage = [];
		this.id = -1;
		this.sendChanges = undefined;
	}
	addTask(Task){
		Task.id = ++this.id;
		this.Storage.push(Task);
		if(this.sendChanges){
			this.sendChanges();
		}
	}
	startTask(TaskId){
		this.findTask(TaskId).startTask();
		if(this.sendChanges){
			this.sendChanges();
		}
	}
	stopTask(TaskId){
		this.findTask(TaskId).stopTask();
		if(this.sendChanges){
			this.sendChanges();
		}		
	}
	findTask(TaskId){
		var index;
		this.Storage.forEach((task, i)=>{
			if(task.id == TaskId){
				index = i;
			}
		});
		return this.Storage[index];
	}
	deleteTask(TaskId){
		var index;
		this.Storage.forEach((task)=>{
			if(task.id == TaskId){
				index = task.id
			}
		});
		this.Storage.splice(index, 1);
		if(this.sendChanges){
			this.sendChanges();
		}
	}
	editTask(Task){

	}
	onChanges(callback){
		if(callback){
			this.sendChanges=callback;
		}
	}
}
//del
var storage = new TaskStorage();
storage.addTask(new Task('progr','checkable'));
storage.addTask(new Task('eng','atTheTime', 10));
var portStorage = new PortStorage();
//del
chrome.runtime.onConnect.addListener(function(port){
	if(port.name === 'PlannerPage'){
		portStorage.addPort(port);
		storage.onChanges(function(){
			console.log('looks good');
			portStorage.sendPostMessage({
				type:"tasks", 
				tasks: storage.Storage
			});
			console.log('looks good2');
		});
		port.onMessage.addListener(function (message){
			console.log(message);
			if(message.type==='getTasks'){
				console.log('recieved');
				port.postMessage({
					type:"tasks", 
					tasks: storage.Storage
				});
			}
			if(message.type==='startTask'){
				storage.startTask(message.id);
			}
			if(message.type==='stopTask'){
				console.log('stop task' + message.id);
				storage.stopTask(message.id);
			}			
			if(message.type === "newTask"){
				console.log(message);
				storage.addTask(new Task(message.name, message.taskType, message.seconds));
			}
			if(message.type==="deleteTask"){
				storage.deleteTask(message.id);
			}		
		});
	}	
});