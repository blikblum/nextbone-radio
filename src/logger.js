// Format debug text.
function debugText(warning, eventName, channelName) {
  return warning + (channelName ? ' on the ' + channelName + ' channel' : '') +
    ': "' + eventName + '"';
}

export const logger = {
  // Whether or not we're in DEBUG mode or not. DEBUG mode helps you
  // get around the issues of lack of warnings when events are mis-typed.
  DEBUG: false,

  // This is the method that's called when an unregistered event was called.
  // By default, it logs warning to the console. By overriding this you could
  // make it throw an Error, for instance. This would make firing a nonexistent event
  // have the same consequence as firing a nonexistent method on an Object.
  debugLog: function(warning, eventName, channelName) {
    if (this.DEBUG) {
      console.warn(debugText(warning, eventName, channelName));
    }
  },

  // Log information about the channel and event
  log: function(channelName, eventName, ...args) {
    console.log('[' + channelName + '] "' + eventName + '"', args);
  }
};
