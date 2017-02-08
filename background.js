//add port storage
console.log('start');
class Task{
	constructor(name, type, seconds){
		this.name = name;
		this.type = type;
		this.seconds = +seconds;
		this.isSuccessed = false;
		this.id = undefined;
		console.log(this);
	}
	startTask(){
		if(this.type == "checkable"){
			this.isSuccessed = true;
		}
		if(this.type == "atTheTime"){
			this.interval = setInterval(()=>{
				this.seconds = this.seconds - 1;
				if(this.seconds<= 0){
					clearInterval(this.interval);
					this.isSuccessed = true;
					storage.sendChanges();
					return;
				}
				storage.sendChanges();
				console.log(this.seconds);
			}, 1000);
		}
	}
	stopTask(){
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
		var index;
		this.Storage.forEach((task, i)=>{
			if(task.id == TaskId){
				index = i;
			}
		});
		this.Storage[index].startTask(this.onChanges);
		if(this.sendChanges){
			this.sendChanges();
		}
	}
	stopTask(TaskId){

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
//del
chrome.runtime.onConnect.addListener(function(port){
	if(port.name === 'PlannerPage'){
		storage.onChanges(function(){
			console.log('looks good');
			port.postMessage({
				type:"tasks", 
				tasks: storage.Storage
			});
			console.log('looks good2');
		});
		port.onMessage.addListener(function (message){
			if(message.type==='getTasks'){
				console.log('recieved');
				port.postMessage({
					type:"tasks", 
					tasks: storage.Storage
				});
			}
			if(message.type==='startTask'){
				console.log('start task' + message.id);
				storage.startTask(message.id);
			}			
		});
	}	
});