import { each } from 'underscore';
import { logger } from './logger';
import { Channel } from './channel';

export const Radio = {
  // Logs all events on this channel to the console. It sets an
  // internal value on the channel telling it we're listening,
  // then sets a listener on the Backbone.Events
  tuneIn: function(channelName) {
    var channel = Radio.channel(channelName);
    channel._tunedIn = true;
    channel.on('all', _partial(channelName));
    return this;
  },

  // Stop logging all of the activities on this channel to the console
  tuneOut: function(channelName) {
    var channel = Radio.channel(channelName);
    channel._tunedIn = false;
    channel.off('all', _partial(channelName));
    delete _logs[channelName];
    return this;
  },
  
  /*
  * Radio.channel
  * ----------------------
  * Get a reference to a channel by name.
  *
  */

  _channels: {},

  channel: function(channelName) {
    if (!channelName) {
      throw new Error('You must provide a name for the channel.');
    }

    if (Radio._channels[channelName]) {
      return Radio._channels[channelName];
    } else {
      return (Radio._channels[channelName] = new Channel(channelName));
    }
  },

  reset: function(channelName) {
    var channels = !channelName ? this._channels : [this._channels[channelName]];
    each(channels, function(channel) { channel.reset();});
  }
};

/*
 * tune-in
 * -------
 * Get console logs of a channel's activity
 *
 */

var _logs = {};

// This is to produce an identical function in both tuneIn and tuneOut,
// so that Backbone.Events unregisters it.
function _partial(channelName) {
  return _logs[channelName] || (_logs[channelName] = logger.log.bind(Radio, channelName));
}

/*
 * Top-level API
 * -------------
 * Supplies the 'top-level API' for working with Channels directly
 * from Backbone.Radio.
 *
 */

var methods = ['request', 'reply', 'replyOnce', 'stopReplying', 'on', 'off', 'listenTo', 'stopListening', 'once', 'listenToOnce', 'trigger'];

methods.forEach(methodName => {
  Radio[methodName] = function(channelName, ...args) {
    var channel = this.channel(channelName);
    return channel[methodName].apply(channel, args);
  };
});
