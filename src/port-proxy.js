/*globals fdom:true, handleEvents, eachProp */
/*jslint indent:2, white:true, sloppy:true, browser:true */
if (typeof fdom === 'undefined') {
  fdom = {};
}
fdom.port = fdom.port || {};

/**
 * A freedom port for a user-accessable proxy.
 * @class Proxy
 * @extends Port
 * @uses handleEvents
 * @param {Object} interfaceCls The proxy interface exposed by this proxy.
 * @constructor
 */
fdom.port.Proxy = function(interfaceCls) {
  this.id = fdom.port.Proxy.nextId();
  this.interfaceCls = interfaceCls;
  handleEvents(this);
  
  this.emits = {};
};

/**
 * Receive incoming messages for this proxy.
 * @method onMessage
 * @param {String} source The source of the message.
 * @param {Object} message The received message.
 */
fdom.port.Proxy.prototype.onMessage = function(source, message) {
  if (source === 'control' && message.reverse) {
    this.emitChannel = message.channel;
    this.emit(this.emitChannel, {
      type: 'channel announcement',
      channel: message.reverse
    });
    this.emit('start');
  } else if (source === 'control' && message.channel) {
    this.controlChannel = message.channel;
  } else if (source === 'default') {
    if (!this.emitChannel && message.channel) {
      this.emitChannel = message.channel;
      this.emit('start');
      return;
    }
    if (message.to) {
      if (this.emits[message.to]) {
        this.emits[message.to](message.type, message.message);
      } else {
        fdom.debug.warn('Could not deliver message, no such interface.');
      }
    } else {
      eachProp(this.emits, function(iface) {
        iface(message.type, message.message);
      });
    }
  }
};

/**
 * Create a proxy.Interface associated with this proxy.
 * an interface is returned, and is passed three arguments
 * at construction: onMsg: function(binder) is allows registration
 * of a function to be called when messages for this interface arrive.
 * emit: function(msg) allows this interface to emit messages,
 * id: string is the Identifier for this interface.
 */
fdom.port.Proxy.prototype.getInterface = function() {
  var Iface = this.getInterfaceConstructor();
  return new Iface();
};

/**
 * Provides a bound class for creating a proxy.Interface associated
 * with this proxy. This partial level of construction can be used
 * to allow the proxy to be used as a provider for another API.
 */
fdom.port.Proxy.prototype.getInterfaceConstructor = function() {
  var id = fdom.port.Proxy.nextId();
  return this.interfaceCls.bind({}, function(id, binder) {
    this.emits[id] = binder;
  }.bind(this, id), this.doEmit.bind(this), id);  
};

fdom.port.Proxy.prototype.doEmit = function(msg) {
  if (this.emitChannel) {
    this.emit(this.emitChannel, msg);
  } else {
    this.once('start', this.doEmit.bind(this, msg));
  }
};

/**
 * Get the textual description of this port.
 * @method toString
 * @return The description of this port.
 */
fdom.port.Proxy.prototype.toString = function() {
  if (this.emitChannel) {
    return "[Proxy " + this.emitChannel + "]";
  } else {
    return "[unbound Proxy]";
  }
};

/**
 * Get the next ID for a proxy channel.
 * @method nextId
 * @static
 * @private
 */
fdom.port.Proxy.nextId = function() {
  if (!fdom.port.Proxy.id) {
    fdom.port.Proxy.id = 1;
  }
  return (fdom.port.Proxy.id += 1);
};
