//
console.log('start');
class Task{
	constructor(name, type, minutes){
		this.name = name;
		this.type = type;
		this.minutes = +minutes;
		this.isSuccessed = false;
		this.id = undefined;
	}
	startTask(){
		if(this.type = "checkable"){
			this.isSuccessed = true;
		}
		if(this.type="atTheTime"){
			this.interval = setInterval(()=>{
				if(this.minutes<= 0){
					clearInterval(this.interval);
					this.isSuccessed = true;
				}
				this.minutes = this.minutes - 1;
				storage.onChanges();
				console.log(this.minutes);
			}, 6000);
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
	}
	addTask(Task){
		Task.id = ++this.id;
		this.Storage.push(Task);
		this.onChanges();
	}
	startTask(TaskId){
		this.Storage[TaskId].startTask(this.onChanges);
		this.onChanges();
	}
	deleteTask(TaskId){
		var index;
		this.Storage.forEach((task)=>{
			if(task.id == TaskId){
				index = task.id
			}
		});
		this.Storage.splice(index, 1);
		this.onChanges();
	}
	onChanges(callback){
		console.log(callback);
		if(callback){
			callback();
		}
	}
}
//del
var storage = new TaskStorage();
storage.addTask(new Task('progr','checkable'));
storage.addTask(new Task('eng','atTheTime', 20));
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