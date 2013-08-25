/*globals fdom:true, handleEvents, mixin, isAppContext, Worker */
/*jslint indent:2, white:true, node:true, sloppy:true, browser:true */
if (typeof fdom === 'undefined') {
  fdom = {};
}
fdom.port = fdom.port || {};

/**
 * @constructor
 */
fdom.port.Worker = function() {
  this.id = 'Worker ' + Math.random();
  this.config = {};

  handleEvents(this);
};

fdom.port.Worker.prototype.start = function() {
  if (isAppContext()) {
    this.setupListener();
  } else {
    this.setupWorker();
  }
};

fdom.port.Worker.prototype.toString = function() {
  return "[" + this.id + "]";
};

fdom.port.Worker.prototype.setupListener = function() {
  this.obj = this.config.global;
  this.config.global.addEventListener('message', function(msg) {
    this.debug.push('worker got msg: ' + JSON.stringify(msg.data));
    this.emitMessage(msg.data.flow, msg.data.message);
  }.bind(this), true);
  this.emit('started');
};

fdom.port.Worker.prototype.emitMessage = function(flow, message) {
  console.log('emitting message ' + flow + ': ' + JSON.stringify(message));
  if (flow === 'control' && this.controlChannel) {
    console.log('redirecting message to control channel.');
    flow = this.controlChannel;
  }
  this.emit(flow, message);
};

fdom.port.Worker.prototype.setupWorker = function() {
  var worker, blob;
  if (typeof (window.Blob) !== typeof (Function)) {
    worker = new Worker(this.config.source);
  } else {
    blob = new window.Blob([this.config.src], {type: 'text/javascript'});
    worker = new Worker(window.URL.createObjectURL(blob));
  }
  worker.addEventListener('message', function(worker, msg) {
      console.log('from worker: ', msg.data);
    if (!this.obj) {
      this.obj = worker;
      this.emit('started');
    }
    this.emitMessage(msg.data.flow, msg.data.message);
  }.bind(this, worker), true);
};

fdom.port.Worker.prototype.onMessage = function(flow, message) {
  if (flow === 'control' && !this.controlChannel) {
    if (!this.controlChannel && message.channel) {
      this.debug = message.config.global.debugLog;
      this.controlChannel = message.channel;
      mixin(this.config, message.config);
      this.start();
    }
  } else {
    if (this.obj) {
      this.debug.push('worker got msg: ' + flow + JSON.stringify(message));
      console.log('message sent to worker: ', flow, message);
      this.obj.postMessage({
        flow: flow,
        message: message
      });
    } else {
      this.once('started', this.onMessage.bind(this, flow, message));
    }
  }
};
