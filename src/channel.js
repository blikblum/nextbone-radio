import { extend, once, isFunction } from 'lodash-es';
import { Events } from 'nextbone';
import { logger } from './logger';

var eventSplitter = /\s+/;

// An internal method used to handle Radio's method overloading for Requests.
// It's borrowed from Backbone.Events. It differs from Backbone's overload
// API (which is used in Backbone.Events) in that it doesn't support space-separated
// event names.
function eventsApi(obj, action, name, rest) {
  if (!name) {
    return false;
  }

  var results = {};

  // Handle event maps.
  if (typeof name === 'object') {
    for (var key in name) {
      var result = obj[action].apply(obj, [key, name[key]].concat(rest));
      eventSplitter.test(key) ? extend(results, result) : results[key] = result;
    }
    return results;
  }

  // Handle space separated event names.
  if (eventSplitter.test(name)) {
    var names = name.split(eventSplitter);
    for (var i = 0, l = names.length; i < l; i++) {
      results[names[i]] = obj[action].apply(obj, [names[i]].concat(rest));
    }
    return results;
  }

  return false;
}

// An optimized way to execute callbacks.
function callHandler(callback, context, args) {
  switch (args.length) {
    case 0: return callback.call(context);
    case 1: return callback.call(context, args[0]);
    case 2: return callback.call(context, args[0], args[1]);
    case 3: return callback.call(context, args[0], args[1], args[2]);
    default: return callback.apply(context, args);
  }
}

// A helper used by `off` methods to the handler from the store
function removeHandler(store, name, callback, context) {
  var event = store[name];
  if (
     (!callback || (callback === event.callback || callback === event.callback._callback)) &&
     (!context || (context === event.context))
  ) {
    delete store[name];
    return true;
  }
}

function removeHandlers(store, name, callback, context) {
  store || (store = {});
  var names = name ? [name] : Object.keys(store);
  var matched = false;

  for (var i = 0, length = names.length; i < length; i++) {
    name = names[i];

    // If there's no event by this name, log it and continue
    // with the loop
    if (!store[name]) {
      continue;
    }

    if (removeHandler(store, name, callback, context)) {
      matched = true;
    }
  }

  return matched;
}

function makeCallback(callback) {
  if (isFunction(callback)) {
    return callback;
  }
  var result = function() { return callback; };
  result._callback = callback;
  return result;
}


/*
 * Channel
 * ----------------------
 * A Channel is an object that extends from Nextbone.Events
 *
 */

export class Channel extends Events {
  constructor(channelName) {
    super();
    this.channelName = channelName;
  }

  // Make a request
  request(name, ...args) {
    var results = eventsApi(this, 'request', name, args);
    if (results) {
      return results;
    }
    var channelName = this.channelName;
    var requests = this._requests;

    // Check if we should log the request, and if so, do it
    if (channelName && this._tunedIn) {
      logger.log.apply(this, [channelName, name].concat(args));
    }

    // If the request isn't handled, log it in DEBUG mode and exit
    if (requests && (requests[name] || requests['default'])) {
      var handler = requests[name] || requests['default'];
      args = requests[name] ? args : arguments;
      return callHandler(handler.callback, handler.context, args);
    } else {
      logger.debugLog('An unhandled request was fired', name, channelName);
    }
  }

  // Set up a handler for a request
  reply(name, callback, context) {
    if (eventsApi(this, 'reply', name, [callback, context])) {
      return this;
    }

    this._requests || (this._requests = {});

    if (this._requests[name]) {
      logger.debugLog('A request was overwritten', name, this.channelName);
    }

    this._requests[name] = {
      callback: makeCallback(callback),
      context: context || this
    };

    return this;
  }

  // Set up a handler that can only be requested once
  replyOnce(name, callback, context) {
    if (eventsApi(this, 'replyOnce', name, [callback, context])) {
      return this;
    }

    var self = this;

    var fn = once(function() {
      self.stopReplying(name);
      return makeCallback(callback).apply(this, arguments);
    });

    return this.reply(name, fn, context);
  }

  // Remove handler(s)
  stopReplying(name, callback, context) {
    if (eventsApi(this, 'stopReplying', name)) {
      return this;
    }

    // Remove everything if there are no arguments passed
    if (!name && !callback && !context) {
      delete this._requests;
    } else if (!removeHandlers(this._requests, name, callback, context)) {
      logger.debugLog('Attempted to remove the unregistered request', name, this.channelName);
    }

    return this;
  }

  // Remove all handlers from the messaging systems of this channel
  reset() {
    this.off();
    this.stopListening();
    this.stopReplying();
    return this;
  }
}
