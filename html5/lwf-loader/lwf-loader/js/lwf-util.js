/** Utility object */
window.Utility = {};

/**
 * Determine which renderer to use for current running environment
 * All Android 4.x device will use css renderer except for Android Chrome
 * All iOS devices will run on canvas renderer
 * @return {string}
 */
window.Utility.autoSelectRenderer = function() {
  var userAgent = navigator.userAgent;

  /** Android 2.1 does not work with Canvas, force to use CSS renderer */
  if (/Android 2\.1/.test(userAgent)) {
    return 'useWebkitCSSRenderer';
  }

  /** Android 4.x devices are recommended to run with CSS renderer except for Chrome*/
  if (/Android 4/.test(userAgent)) {
    if (/Chrome/.test(userAgent)) {
      return 'useCanvasRenderer';
    } else {
      return 'useWebkitCSSRenderer';
    }
  }

  return 'useCanvasRenderer';
};

(function(global) {
  'use strict';

  /* overriding console methods */
  var myTargets = ['log', 'warn', 'error'];
  var deviceNativeConsoleFunction = {
    log: global.console.log,
    warn: global.console.warn,
    error: global.console.error
  };

  var myFakeFunction = {
    log: fakeConsoleLog,
    warn: fakeConsoleWarn,
    error: fakeConsoleError
  };

  var i;
  var listLength;
  var prop;

  for (i = 0, listLength = myTargets.length; i < listLength; ++i) {
    prop = myTargets[i];
    global.console[prop] = myFakeFunction[prop];
  }

  /**
   * Self-defined console function to display logs
   * to use this feature, include 'window['LWFLOADER_ENABLE_DEBUG'] = true;' in your file
   * @return {*}
   */
  function fakeConsoleLog() {
    if (!global.LWFLOADER_ENABLE_DEBUG) {
      return;
    }

    if (/Android/.test(navigator.userAgent)) {
      // currently only support one argument
      if (arguments.length > 1 && /(%o)/.test(arguments[0])) {
        var newMsg = '';
        var targetParams = ['privateData', 'data', 'url', 'width', 'height'];
        for (var i = 0; i < arguments.length; i++) {
          var str = '';
          for (var prop in arguments[i]) {
            if (targetParams.indexOf(prop) !== -1) {
              str += prop + '=' + arguments[i][prop] + '\n';
            }
          }
          newMsg += str;
        }
        arguments[0] = arguments[0].replace(/%o/, newMsg);
      }
    }

    return deviceNativeConsoleFunction.log.apply(global.console, arguments);
  }

  /**
   * Self-defined console function to display warnings
   * to use this feature, include 'window['LWFLOADER_ENABLE_DEBUG'] = true;' in your file
   * @return {*}
   */
  function fakeConsoleWarn() {
    if (!global.LWFLOADER_ENABLE_DEBUG) {
      return;
    }
    return deviceNativeConsoleFunction.warn.apply(global.console, arguments);
  }

  /**
   * Self-defined console function to display error logs
   * to use this feature, include 'window['LWFLOADER_ENABLE_DEBUG'] = true;' in your file
   * @return {*}
   */
  function fakeConsoleError() {
    if (!global.LWFLOADER_ENABLE_DEBUG) {
      return;
    }
    return deviceNativeConsoleFunction.error.apply(global.console, arguments);
  }
})(window);
