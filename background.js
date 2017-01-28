//todo: add a storage for some tasks
// add calendar
//add a message system
//a feature to add some tasks.

var test = "test";
class Task{
	Task( description, type, avalaibleSites, unavalaibleSites, timeset){
		this.description = description;
		this.type = type;
		this.avalaibleSites = avalaibleSites;
		this.unavalaibleSites = unavalaibleSites;
		this.timeset = timeset;
		this.isExist = false;
	}
	isTaskForThisDay(date){
		return this.timeset.isMatch(date);
	}
}
class TasksStorage{
	TasksStorage(tasks){
		this.Storage = [];
		this.Storage.push(tasks);
	}
	getTaskForDate(date){
		var matchedTasks = [];
		for(var i = 0; i<this.Storage.length; i++){
			if(this.Storage[i].isTaskForThisDay(date)){
				matchedTasks.push(this.Storage[i]);
			}
		}
		return matchedTasks;
	}

}
class Timeset{
	Timeset(startDate, period, endDate, type){
		this.startDate = startDate;
		this.period = period;
		this.endDate = endDate;
		this.type = type;
	}
	isMatch(date){
		if(this.startDate.getFullYear()==date.getFullYear()&&
		this.startDate.getMonth()==date.getMonth()&&
		this.startDate.getDate()==date.getDate()){
			return true;
		}
		if(type="hourly"){
			if(period!==0){
				return true;
			}
		}

	}
}

chrome.runtime.onConnect.addListener(function(port){
		if(port.name === 'PlannerPage'){
			port.onMessage.addListener(function (message){
				if(message.type==='getTasks'){
					console.log('recieved');
					port.postMessage({
						type:"tasks", 
						tasks: [{name: "programming", time:"1 hour"}, {name: "english", time:"1 hour"}]
					});
				}
			});
		}	
	})