
function TaskList(element){
  this.element = element;

  var task_input_elem;
  var task_list_elem;

  var task_list = [];
  var task_input;

  this.addTask = function(name){
    element = document.createElement('tr');
    task = new Task(name, element);
    task.state.inner_elem.addEventListener('click', e_taskstate_onclick_listener);

    task_list.push(task);
    task_list_elem.appendChild(element);
  }

  this.removeTask = function(element) {
    document.removeChild(element);
    for (i in task_list) {
      if (task_list[i].element == element) {
        //task_list.remove(task);
      }
    }
  }

  this.stopAllTasks = function(){
    for (i in task_list){
      task_list[i].state.stop();
    }
  }

  var render = (function() {
    this.element.innerHTML = '';
    var table = document.createElement('table');
    table.setAttribute('class', 'task_list table table-striped');
    var table_head = document.createElement('thead');
    table_head.innerHTML = '\
          <tr>\
            <td class="start_timestamp">\
              timestamp\
            </td>\
            <td class="task_name">\
              task name\
            </td>\
            <td class="elapsed_time">\
              elapsed time\
            </td>\
            <td class="start_stop">\
            </td>\
          </tr>';
    table.appendChild(table_head);
    task_list_elem  = document.createElement('tbody');
    table.appendChild(task_list_elem);

    task_input_elem = document.createElement('div');
    task_input_elem.setAttribute('class', 'task_input');
    task_input = new TaskInput(task_input_elem);
    task_input.inner_elem.onkeydown = e_taskinput_onkeydown;

    element.appendChild(table);
    element.appendChild(task_input_elem);
  }).bind(this);

  var e_taskinput_onkeydown = (function (e) {
    if (e.keyCode == 13) {
      var name = e.currentTarget.value;
      this.stopAllTasks();
      this.addTask(name);
    }
  }).bind(this);

  var e_taskstate_onclick_listener = (function (e) {
    //race conditions
    //this.stopAllTasks();
    console.log('e_taskstate_onclick_listener');
  }).bind(this);

  render();

}

function Task(name, element){
  var name_elem      = document.createElement('td');
  var timestamp_elem = document.createElement('td');
  var timeelaps_elem = document.createElement('td');
  var state_elem     = document.createElement('td');

  this.element    = element;
  this.timestamp  = new TaskTimestamp(timestamp_elem);
  this.name       = new TaskName(name, name_elem);
  this.timeelaps  = new TaskTimeelaps(timeelaps_elem);
  this.state      = new TaskState(state_elem, this.timeelaps);

  element.appendChild(timestamp_elem);
  element.appendChild(name_elem);
  element.appendChild(timeelaps_elem);
  element.appendChild(state_elem);
}

function TaskName(name, element){
  this.element = element;
  var strName;

  this.setName = function(str){
    strName = str;
    render();
  }

  this.getName = function(){
    return strName;
  }

  var render = (function(){
    this.element.innerHTML = strName;
  }).bind(this);

  this.setName(name);
}

function TaskTimestamp(element){
  this.element = element;
  var time = new Date();

  /**
  * @param {Date} datetime
  */
  this.setTime = function(datetime){
    time = datetime;
    render();
  }

  /**
  * @return {Date}
  */
  this.getTime = function(){
    return time;
  }

  var getTimeString = function(){
    return time.format("HH:MM");
  }

  var render = function(){
    element.innerHTML = getTimeString();
  }

  this.setTime(new Date);
}

function TaskState(element, timeelaps){
  this.element = element;
  this.inner_elem;
  var state = 'stopped';

  this.start = function(){
    if (this.isStopped()){
      state = 'started';
      render();
      timeelaps.mark_border();
    }
  }

  this.isStarted = function(){
    if (state == 'started')
      return true;
    else
      return false;
  }

  this.stop = function(){
    if (this.isStarted()){
      state = 'stopped';
      render();
      timeelaps.mark_border();
    }
  }

  this.isStopped = function(){
    if (state == 'stopped')
      return true;
    else
      return false;
  }

  var render = (function() {
    this.element.innerHTML = '';
    var button = document.createElement('input');
    if ( this.isStarted() )
      button.setAttribute('value', 'Stop');
    else if ( this.isStopped() )
      button.setAttribute('value', 'Start');
    else 
      button.setAttribute('value', this.state);
    button.setAttribute('type', 'submit');
    button.onclick = e_taskstate_onclick;
    this.element.appendChild(button);
    this.inner_elem = button;
  }).bind(this);

  var e_taskstate_onclick = (function (e) {
    if ( this.isStarted() )
      this.stop();
    else if ( this.isStopped() )
      this.start();
    else 
      console.warn('state is undefined', this);
    console.log('e_taskstate_onclick');
  }).bind(this);

  render();
  this.start();
}

function TaskTimeelaps(element) {
  this.element = element;

  var time_marks = [];
  var timer;

  this.mark_border = function(){
    time_marks.push(new Date());
    render();
    if (!is_border_closed())
      timer = setInterval(function(){render()}, 100);
    else 
      clearInterval(timer);
  }

  var get_elapsed_time = function(){
    var acc_time = 0;
    for (var i = 0; i < time_marks.length; i = i+2){
      if (time_marks[i+1] == null)
        acc_time += (new Date()) - time_marks[i];
      else
        acc_time += time_marks[i+1] - time_marks[i];
    }
    return acc_time;
  }

  var is_border_closed = function(){
    if (time_marks.length % 2 == 0)
      return true;
    else 
      return false;
  }

  var render = (function(){
    this.element.innerHTML = diffDuration(get_elapsed_time());
  }).bind(this);

}

function TaskInput(element) {
  this.element    = element;
  this.inner_elem;

  var render = (function(){
    var input = document.createElement('input');
    input.setAttribute('id', 'task_name');
    this.element.appendChild(input);
    this.inner_elem = input;
  }).bind(this);

  render();
}

var e_start_timestamp_onclick = function (e) {
  var time_elem   = e.currentTarget;
  var time_string = time_elem.innerHTML;
  var time_input  = document.createElement('input');
  input.value = time_string;
  time_elem.parentNode.replaceChild(input, time_elem);
}

onReady(function () {
  var timer_elem = document.getElementById('timer');
  var timer = new TaskList(timer_elem);

  document.getElementsByClassName('start_timestamp').onclick = e_start_timestamp_onclick;
});