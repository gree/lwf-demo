(function(global) {
  'use strict';

  /** current useragent */
  var userAgent = navigator.userAgent;

  /** Whether currently running on iOS @type {boolean} */
  var isiOS = (/iPhone/.test(userAgent) || /iPod/.test(userAgent) || /iPad/.test(userAgent));

  /** Whether currently running on Android @type {boolean} */
  var isAndroid = (/Android/.test(userAgent));

  /** Whether currently running on SP  @type {boolean} */
  var isSp = isiOS || isAndroid;

  /** Whether currently running on Chrome */
  var isChrome = /Chrome/.test(userAgent);

  /** Whether touch event is enabled, by default this refers whether currently running on SP */
  var isTouchEventEnabled = isSp;

  /** Turn off Web Worker on Android native browser, allow it runs on Android Chrome  @type {boolean} */
  var useWebWorker = !isAndroid || isChrome;

  /** preventDefault() might cause unstable Android bugs */
  var isPreventDefaultEnabled = /(iPhone|iPad)/.test(userAgent) || /Android *(4|3)\..*/.test(userAgent);

  /** For displaying debug FPS information */
  var debugInfoElementId = 0;

  /** @type {Object} */
  if (typeof global.performance === 'undefined') {
    global.performance = {};
  }
  global.performance.now = global.performance.now ||
    global.performance.webkitNow ||
    global.performance.mozNow ||
    global.performance.oNow ||
    global.performance.msNow ||
    Date.now;

  /** @type {function} */
  global.requestAnimationFrame = global.requestAnimationFrame ||
    global.webkitRequestAnimationFrame ||
    global.mozRequestAnimationFrame ||
    global.oRequestAnimationFrame ||
    global.msRequestAnimationFrame;

  if (global.requestAnimationFrame === undefined) {
    (function() {
      var vsync = 1000 / 60;
      var t0 = global.performance.now();
      global.requestAnimationFrame = function(myCallback) {
        var t1 = global.performance.now();
        var duration = t1 - t0;
        var d = vsync - ((duration > vsync) ? duration % vsync : duration);
        return global.setTimeout(function() {
          t0 = global.performance.now();
          myCallback();
        }, d);
      };
    })();
  }

  /**
   * create LWF stage
   * @param {string} renderer
   * @return {*}
   */
  function createStage(renderer) {
    var stage;

    if (renderer === 'useCanvasRenderer' || renderer === 'useWebGLRenderer') {
      stage = document.createElement('canvas');
    } else {
      stage = document.createElement('div');
    }

    stage.width = stage.height = 0;
    return stage;
  }

  /**
   * create LWF Loader
   * @class LWF Loader class
   * @property {object} initializeHooks Hook function lists
   * @property {object} requests requests function lists
   * @property {boolean} pausing set true to pause animation
   * @property {int} loadingCounter counter shows the loading progress
   * @property {boolean} debug whether displays debug information
   * @property {int} currentFPS current running FPS
   * @property {object} backgroundColor if undefined, the default backgroundColor will be used
   * @property {string} resizeMode fitForWidth or fitForHeight
   * @property {boolean} resizeStretch whether stretch resource to fit the window
   * @property {string} displayDivId id of element playing LWF resource
   * @property {int} widthLimit limit value for the width of resource
   * @property {int} heightLimit limit value for the height of resource
   * @return {*}
   * @constructor
   */
  function LwfLoader() {
    /** public members */
    this.initializeHooks = [];
    this.requests = [];
    this.pausing = false;
    this.loadingCounter = 0;
    this.debug = false;
    this.backgroundColor = null;
    this.resizeMode = 'fitForWidth';
    this.resizeStretch = null;
    this.displayDivId = null;
    this.widthLimit = 0;
    this.heightLimit = 0;
    this.useLargeImage = false;

    this.rootOffset = {
      x: 0,
      y: 0
    };

    /** private members */
    var renderer = null;
    var currentFPS = 0;

    /**
     * return the current renderer name in string, null if undefined
     * @return {string} current renderer being used
     */
    this.getRenderer = function() {
      return renderer;
    };

    /**
     * Set loader's rendering mode to given renderer.
     * @param {string} myRenderer renderer to set
     */
    this.setRenderer = function(myRenderer) {
      /** if renderer is already defined and initialized, we do not allow multiple definition */
      if (renderer) {
        throw new Error('cannot use multiple renderer! LWF has been initialized for ' + renderer + ' renderer.');
      } else {
        if (myRenderer === 'canvas') {
          myRenderer = 'useCanvasRenderer';
        } else if (myRenderer === 'webkitcss') {
          myRenderer = 'useWebkitCSSRenderer';
        } else if (myRenderer === 'webgl') {
          myRenderer = 'useWebGLRenderer';
        }

        if(myRenderer && myRenderer.match(/use.+Renderer/i)) {
          renderer = myRenderer;
        }
      }
    };

    /**
     * return the current FPS
     * @return {int} current FPS
     */
    this.getCurrentFPS = function() {
      if (isNaN(currentFPS)) {
        console.error('[LWF] FPS is not properly defined');
      }
      return currentFPS;
    };

    /**
     * set the current FPS
     * @param {int} current FPS
     */
    this.setCurrentFPS = function(fps) {
      if (isNaN(fps)) {
        console.error('[LWF] FPS is not properly defined');
      }
      currentFPS = fps;
    };

    return this;
  }

  /**
   * check if currently running under LWFS environment
   * @return {Boolean} if currently running under lwfs, return true
   * @private
   */
  LwfLoader.prototype.isLwfsEnvironment_ = function() {
    return global.testlwf_settings;
  };

  /**
   * Add hook functions that will be bound to corresponding functions before LWF is played.
   * @param {function} hook functions
   */
  LwfLoader.prototype.addInitializeHook = function(hook) {
    if (!_.isFunction(hook)) {
      return;
    }
    this.initializeHooks.push(hook);
  };

  /**
   * stop playing LWF
   */
  LwfLoader.prototype.pause = function() {
    this.pausing = true;
  };

  /**
   * Resume playing LWF from pause state.
   */
  LwfLoader.prototype.resume = function() {
    this.pausing = false;
  };

  /**
   * Generates function that takes LWF resource name as an input and
   * returns the path corresponding to it based on previously defined lwfMap array.
   * If lwfMap is not defined, this function will call getLwfPath_ function directly.
   * If input is a function, return directly. Otherwise, it tries to set path from the previous set lwfMap array.
   * This function is used to generate path retriever gets the correct LWF path name in a flexible way.
   * @param {object} myLoaderData loader instance data
   * @return {function} function generates lwf path
   * @private
   */
  LwfLoader.prototype.getLwfMapper_ = function(myLoaderData) {
    if (myLoaderData.lwfMap === null) {
      return _.bind(this.getLwfPath_, this);
    }

    var lwfMap = myLoaderData.lwfMap;
    if (_.isObject(lwfMap)) {
      if (_.isFunction(lwfMap)) {
        return lwfMap;
      }

      return function(lwfId) {
        var path = lwfId;
        if (lwfMap.hasOwnProperty(lwfId)) {
          path = lwfMap[lwfId];
        }
        if (!/\.lwf$/.test(path)) {
          path += '.lwf';
        }
        return path;
      };
    }
    throw new Error('unsupported lwfMap');
  };

  /**
   * get LWF path from ID (OBSOLETED. should be used for backward compatibility only)
   * @param {number} lwfId LWF id
   * @return {String} LWF path
   * @private
   */
  LwfLoader.prototype.getLwfPath_ = function(lwfId) {
    var path;

    var myLwfId = lwfId;
    if (lwfId.indexOf('/') >= 0) {
      myLwfId = lwfId.substring(lwfId.lastIndexOf('/') + 1);
    }

    if (this.isLwfsEnvironment_()) {
      path = myLwfId + '.lwf';
    } else {
      path = lwfId + '/_/' + myLwfId + '.lwf';
    }
    return path;
  };

  /**
   * Generates function that takes image name as an input and returns the path corresponding to it.
   * If input is a function, return directly. Otherwise, it tries to set path from the previous set imageMap array.
   * ImageMap will be passed into LWF directly.
   * @param {object} imageMap image map data
   * @return {Function} function to replace path by maps
   * @private
   */
  LwfLoader.prototype.getImageMapper_ = function(imageMap) {
    if (_.isFunction(imageMap)) {
      return imageMap;
    }

    return function(pImageId) {
      return imageMap[pImageId] ? imageMap[pImageId] : pImageId;
    };
  };

  /**
   * Sets the LwfLoader display setting from input parameters.
   * @param {object} object array containing display related parameters
   */
  LwfLoader.prototype.setDisplaySetting = function(lwfDisplaySetting) {
    if (lwfDisplaySetting.renderer) {
      this.setRenderer(lwfDisplaySetting.renderer);
    }
    this.resizeMode = lwfDisplaySetting.resizeMode || this.resizeMode;
    this.resizeStretch = lwfDisplaySetting.resizeStretch || this.resizeStretch;
    this.displayDivId = lwfDisplaySetting.displayDivId || this.displayDivId;
    this.widthLimit = lwfDisplaySetting.widthLimit || this.widthLimit;
    this.heightLimit = lwfDisplaySetting.heightLimit || this.heightLimit;
    this.useLargeImage = lwfDisplaySetting.useLargeImage || this.useLargeImage;
  };

  /**
   * handle exceptions
   * @param {object} myException exception object
   * @param {object} myLoaderData loaderData
   * @private
   */
  LwfLoader.prototype.handleException_ = function(myException, myLoaderData) {
    var map = myLoaderData.pageTransitionMap;
    var url = null;
    if (map.hasOwnProperty('error')) {
      url = map.error;
    } else if (_.size(map) > 0) {
      url = _.find(map, function() {return true;});
    }

    var handlers = myLoaderData.handler;
    if (handlers === null || handlers.exception === undefined) {
      if (confirm('LWF exception. \n' + myException.stack + '\n reload?')) {
        location.reload();
      }
    } else if (_.isFunction(handlers.exception)) {
      handlers.exception(myException, url);
    }
    console.error('[LWF] exception: %s', myException.stack);
  };

  /**
   * handle load error
   * @param {object} settings
   * @param {object} myLoaderData
   * @private
   */
  LwfLoader.prototype.handleLoadError_ = function(settings, myLoaderData) {
    var map = myLoaderData.pageTransitionMap;
    var url = null;
    if (!map.hasOwnProperty('error')) {
      url = map.error;
    } else if (_.size(map) > 0) {
      url = _.find(map, function() {return true;});
    }

    var handler = myLoaderData.handler;
    if (handler === null || handler.loadError === undefined) {
      if (confirm('LWF load error. \n reload?')) {
        location.reload();
      }
    } else if (_.isFunction(handler.loadError)) {
      handler.loadError(settings, url);
    }

    /** output error information to frontend */
    console.error('[LWF] load error: %o', settings.error);
    console.error('[LWF] loaded count: %d/%d', settings.loadedCount, settings.total);
  };

  /**
   * start to play root LWF
   * @param {object} lwf LWF root instance
   */
  LwfLoader.prototype.onLoad = function(lwf) {
    var setting = this;
    var privateData = setting.privateData;
    var myLoaderData = privateData._loaderData;
    var loader = myLoaderData.loader;
    var stageEventReceiver = myLoaderData.stageEventReceiver;

    /** remove circular reference */
    setting.privateData = null;

    if (!lwf) {
      loader.handleLoadError_(this, myLoaderData);
      return;
    }

    if (_.isFunction(myLoaderData.callback.onLoad)) {
      myLoaderData.callback.onLoad(lwf);
    }

    var onExec, onMove, onPress, onRelease, onGestureEnd;
    var stage = this.stage;
    var widthInit = 0, heightInit = 0;
    var stageScale = 1;
    var stageWidth = 0;
    var stageHeight = 0;
    var t0 = global.performance.now();

    /** for FPS display */
    var execCount = 0;
    var t0_60 = t0;
    var fps_num60 = 0;

    lwf.rootMovie.moveTo(loader.rootOffset.x, loader.rootOffset.y);

    /**
     * loading handler, set the required information for LWF files
     */
    onExec = function() {
      try {
        if (!lwf) {
          return;
        }

        var devicePixelRatio = global.devicePixelRatio;
        if (loader.getRenderer() === 'useWebkitCSSRenderer') {
          devicePixelRatio = 1;
        }

        var width = lwf.width;
        var height = lwf.height;
        var innerWidth = global.innerWidth;
        var innerHeight = global.innerHeight;

        if (isAndroid) {
          /** fix innerWidth/Height for old Android devices */
          if (global.innerWidth > global.screen.width) {
            innerWidth = global.screen.width;
          }
          if (global.innerHeight > global.screen.height) {
            innerHeight = global.screen.height;
          }
        }

        if (width > innerWidth || myLoaderData.resizeStretch) {
          width = innerWidth;
        }
        if (height > innerHeight || myLoaderData.resizeStretch) {
          height = innerHeight;
        }

        if (widthInit !== width || heightInit !== height) {
          if (setting.fitForWidth) {
            if (setting.widthLimit) {
              width = (width > setting.widthLimit) ? setting.widthLimit : width;
            }
            stageWidth = Math.round(width);
            stageHeight = Math.round(width * lwf.height / lwf.width);
          } else {
            if (setting.heightLimit) {
              height = (height > setting.heightLimit) ? setting.heightLimit : height;
            }
            stageWidth = Math.round(height * lwf.width / lwf.height);
            stageHeight = Math.round(height);
          }

          stageEventReceiver.style.width = stage.style.width = stageWidth + 'px';
          stageEventReceiver.style.height = stage.style.height = stageHeight + 'px';

          stageEventReceiver.width = stage.width = Math.floor(stageWidth * devicePixelRatio);
          stageEventReceiver.height = stage.height = Math.floor(stageHeight * devicePixelRatio);
          if (setting.fitForWidth) {
            stageScale = stageWidth / stage.width;
            lwf.property.clear();
            lwf.fitForWidth(stage.width, stage.height);
          } else {
            stageScale = stageHeight / stage.height;
            lwf.property.clear();
            lwf.fitForHeight(stage.width, stage.height);
          }
          widthInit = width;
          heightInit = height;

          /** set the external div size */
          if (loader.displayDivId) {
            var windowDiv = document.getElementById(loader.displayDivId);
            windowDiv.style.width = stageWidth + 'px';
            windowDiv.style.height = stageHeight + 'px';
          }
        }

        var t1 = global.performance.now();
        var dt = t1 - t0;
        t0 = t1;
        if (!loader.pausing) {
          lwf.exec(dt / 1000);
          lwf.render();
        }

        global.requestAnimationFrame(onExec);
        if (execCount % 60 === 0) {
          fps_num60 = Math.round(60000.0 / (t1 - t0_60));
          t0_60 = t1;
          execCount = 0;
        }
        if (loader.debug || myLoaderData.debug) {
          var divElement = document.getElementById('lwf_info' + myLoaderData.debugInfoElementId);
          divElement.innerHTML = fps_num60 + 'fps';
        }
        execCount++;
        loader.setCurrentFPS(fps_num60);
      } catch (myException) {
        loader.handleException_(myException, myLoaderData);
      }
    };

    /**
     * touch move handler
     * @param {object} myEvent touch event
     */
    onMove = function(myEvent) {
      try {
        if (isPreventDefaultEnabled) {
          myEvent.preventDefault();
        }
        if (!lwf) {
          return;
        }

        var touchX, touchY;
        var stageRect = stage.getBoundingClientRect();

        if (isTouchEventEnabled) {
          var myTouch = myEvent.touches[0];
          touchX = myTouch.pageX;
          touchY = myTouch.pageY;
        } else {
          touchX = myEvent.clientX;
          touchY = myEvent.clientY;
        }

        if (isSp) {
          touchX -= stage.offsetLeft;
          touchY -= stage.offsetTop;
          touchX = touchX - stageRect.left - window.scrollX;
          touchY = touchY - stageRect.top - window.scrollY;
        } else {
          touchX -= stageRect.left;
          touchY -= stageRect.top;
        }

        touchX /= stageScale;
        touchY /= stageScale;

        lwf.inputPoint(touchX, touchY);
      } catch (myException) {
        loader.handleException_(myException, myLoaderData);
      }
    };

    /**
     * touch press handler
     * @param {object} myEvent touch event
     */
    onPress = function(myEvent) {
      try {
        if (isPreventDefaultEnabled) {
          myEvent.preventDefault();
        }
        if (!lwf) {
          return;
        }

        var touchX, touchY;
        var stageRect = stage.getBoundingClientRect();

        if (isTouchEventEnabled) {
          var myTouch = myEvent.touches[0];
          touchX = myTouch.pageX;
          touchY = myTouch.pageY;
        } else {
          touchX = myEvent.clientX;
          touchY = myEvent.clientY;
        }

        if (isSp) {
          touchX -= stage.offsetLeft;
          touchY -= stage.offsetTop;
          touchX = touchX - stageRect.left - window.scrollX;
          touchY = touchY - stageRect.top - window.scrollY;
        } else {
          touchX -= stageRect.left;
          touchY -= stageRect.top;
        }

        touchX /= stageScale;
        touchY /= stageScale;

        lwf.inputPoint(touchX, touchY);
        lwf.inputPress();
      } catch (myException) {
        loader.handleException_(myException, myLoaderData);
      }
    };

    /**
     * touch release handler
     * @param {object} myEvent touch event
     */
    onRelease = function(myEvent) {
      try {
        if (isPreventDefaultEnabled) {
          myEvent.preventDefault();
        }
        if (!lwf) {
          return;
        }
        lwf.inputRelease();
      } catch (myException) {
        loader.handleException_(myException, myLoaderData);
      }
    };

    /**
     * touch gesture end handler, mainly for development purpose
     * @param {object} myEvent touch event
     */
    onGestureEnd = function(myEvent) {
      try {
        /* for development */
        if (!lwf) {
          return;
        }

        /** force to reload page from browser*/
        global.location.reload(true);
      } catch (myException) {
        loader.handleException_(myException, myLoaderData);
      }
    };

    global.requestAnimationFrame(onExec);

    /** event handling */
    if (isTouchEventEnabled) {
      /** handle special behaviour of touch event on certain devices */
      if (isAndroid && (isChrome || / SC-0/.test(userAgent))) {
        document.body.addEventListener('touchstart', function() {});
      }

      if (isiOS && (loader.debug || myLoaderData.debug)) {
        stageEventReceiver.addEventListener('gestureend', onGestureEnd, false);
      }
      stageEventReceiver.addEventListener('touchmove', onMove, false);
      stageEventReceiver.addEventListener('touchstart', onPress, false);
      stageEventReceiver.addEventListener('touchend', onRelease, false);
    } else {
      stageEventReceiver.addEventListener('mousemove', onMove, false);
      stageEventReceiver.addEventListener('mousedown', onPress, false);
      stageEventReceiver.addEventListener('mouseup', onRelease, false);
    }

    /** button event */
    _.each(myLoaderData.buttonEventMap, function(handler, button_name) {
      if (_.isFunction(handler)) {
        handler = {
          'release' : handler
        };
      } else {
        _.each(handler, function(h, button_event) {
          if (!_.isFunction(h)) {
            throw new Error('button event [' + button_event + '@' + button_name + '] is not a function!');
          }
        });
      }
      lwf.setButtonEventHandler(button_name, handler);
    });

    /** fscommand related */
    var fsCommands = {};
    var registerFsCommands = function(k, f) {
      if (!fsCommands.hasOwnProperty(k)) {
        fsCommands[k] = [];
      }
      fsCommands[k].push(f);
    };

    if (_.isObject(myLoaderData.fsCommandMap)) {
      _.each(myLoaderData.fsCommandMap, function(v, k) {
        if (_.isFunction(v)) {
          registerFsCommands(k, v);
        }
      });
    }
    if (_.isObject(myLoaderData.pageTransitionMap)) {
      _.each(myLoaderData.pageTransitionMap, function(v, k) {
        if (_.isString(v)) {
          registerFsCommands(k, function() {
            document.location.href = v;
          });
        } else if (_.isFunction(v)) {
          registerFsCommands(k, function() {
            v(k);
          });
        }
      });
    }

    registerFsCommands = null;

    _.each(fsCommands, function(myFunctions, myCmd) {
      lwf.setEventHandler(myCmd, function(myMovie, myButton) {
        var myLength = myFunctions.length;
        for (var i = 0; i < myLength; ++i) {
          myFunctions[i](myMovie, myButton);
        }
      });
    });

    fsCommands = null;
  };

  /**
   * load and play LWF using given parameters
   * @param {object} targetElem target DOM element
   * @param {object} lwfParam sets LWF parameters using optional params
   * @return {*}
   */
  LwfLoader.prototype.playLWF = function(targetElem, lwfParam) {

    /** for backward compatibility, accept parameters by reading attribute values */
    var lwfDisplaySetting = targetElem.getAttribute('data-lwf-display_setting');

    if (lwfDisplaySetting) {
      lwfDisplaySetting = JSON.parse(lwfDisplaySetting);
      this.setDisplaySetting(lwfDisplaySetting);
    }

    /* prepare LWF renderer */
    var LWF, cache;
    LWF = global.LWF;

    /** if renderer is not manually defined, auto-select the optimal renderer*/
    if (!this.getRenderer()) {
      this.setRenderer(global.Utility.autoSelectRenderer());
    }

    var lwfRenderer = this.getRenderer();

    /** call the corresponding rendering function in LWF library */
    if (lwfRenderer) {
      LWF[lwfRenderer]();
    } else {
      throw new Error('Renderer parameters are not properly set');
    }

    cache = LWF.ResourceCache.get();

    /** enable debug options */
    if (this.debug) {
      global.LWFLOADER_ENABLE_DEBUG = true;
    }

    /**
     * prepare parameters that will be passed into LWF,
     * by default it reads parameters previously stored in lwfDefaultParam
     */
    var myLwfParam = _.isObject(global.lwfDefaultParam) ? _.clone(global.lwfDefaultParam) : {};

    /** set load event handler */
    myLwfParam.onload = this.onLoad;

    /** background color setting*/
    if (this.backgroundColor) {
      myLwfParam.setBackgroundColor = this.backgroundColor;
    } else {
      myLwfParam.useBackgroundColor = true;
    }

    myLwfParam.fitForHeight = false;
    myLwfParam.fitForWidth = false;

    /** display related setting */
    if (this.resizeMode === 'fitForWidth') {
      myLwfParam.fitForWidth = true;
    } else if (this.resizeMode === 'fitForHeight') {
      myLwfParam.fitForHeight = true;
    }

    myLwfParam.resizeStretch = this.resizeStretch;
    myLwfParam.widthLimit = this.widthLimit;
    myLwfParam.heightLimit = this.heightLimit;

    /** web worker setting, only available on Chrome or non-Android devices*/
    myLwfParam.worker = useWebWorker;

    /** handle buggy css behaviour in certain devices */
    if (isAndroid && / SC-0/.test(userAgent) && lwfRenderer === 'useWebkitCSSRenderer') {
      myLwfParam.quirkyClearRect = true;
    }

    /** force to disable use3D on Android devices */
    if (isAndroid) {
      myLwfParam.use3D = false;
    }

    /** prepare LWF or lwf-loader required data */
    myLwfParam.privateData = {};
    myLwfParam.pos = null;
    myLwfParam.imageMap = {};
    myLwfParam.soundMap = {};
    myLwfParam.pageTransitionMap = {};
    myLwfParam.buttonEventMap = {};
    myLwfParam.fsCommandMap = {};
    myLwfParam.handler = {};
    myLwfParam.callback = {};
    myLwfParam.lwfMap = null;

    /** helper function converts first character of input to uppercase*/
    var convertToUpperCase = function(matched) {
      return matched.charAt(1).toUpperCase();
    };

    for (var i = 0; i < targetElem.attributes.length; i++) {
      var elemAttr = targetElem.attributes[i];
      if (elemAttr.name && elemAttr.name.indexOf('data-lwf-') === 0) {
        var lwfParamName = elemAttr.name.slice('data-lwf-'.length);
        lwfParamName = lwfParamName.replace(/_./g, convertToUpperCase);

        /** 'data-lwf-display_setting' is reserved */
        if (lwfParamName === 'displaySetting') {
          continue;
        }

        var lwfParamValue = elemAttr.value;
        try {
          if (lwfParamValue.charAt(0) === '{') {
            lwfParamValue = JSON.parse(lwfParamValue);
          }
        } catch (myException) {
          /**
           * exception case handling JSON.parse failure
           * ignore exception at current version
           */
        }
        myLwfParam[lwfParamName] = lwfParamValue;
      }
    }

    /**
     * turn this.useLargeImage to true
     * for displaying high-resolution images on certain devices
     * this should only be applied to devices with devicePixelRatio = 2
     * */
    if (global.devicePixelRatio === 2 && this.useLargeImage) {
      myLwfParam.imageSuffix = '_@2x';
    }

    /** 'data-lwf' is alias of 'data-lwf-lwf' */
    if (!myLwfParam.hasOwnProperty('lwf')) {
      var lwfFileName = targetElem.getAttribute('data-lwf');
      if (_.isString(lwfFileName)) {
        myLwfParam.lwf = lwfFileName;
      }
    }

    /** copy 'name' property to 'lwf' to keep backward compatibility */
    if (myLwfParam.hasOwnProperty('name')) {
      myLwfParam.lwf = myLwfParam.name;
    }

    if (_.isObject(lwfParam)) {
      _.extend(myLwfParam, lwfParam);
    }

    /** set(extend) LWF parameters by initialize hooks */
    if (this.initializeHooks.length > 0) {
      var func = function(v) {
        if (_.isFunction(v)) {
          var results = v.call(this, targetElem);
          for (var key in results) {
            if (results.hasOwnProperty(key)) {
              _.extend(myLwfParam[key], results[key]);
            }
          }
        }
      };

      _.each(this.initializeHooks, _.bind(func, this));
    }
    this.initializeHooks = [];

    /** check lwf file name */
    if (!myLwfParam.hasOwnProperty('lwf')) {
      throw new Error('[LWF] no LWF input');
    }

    /** Initialize loader-data parameters*/
    var myLoaderData = {};
    myLoaderData.debugInfoElementId = ++debugInfoElementId;
    myLoaderData.setting = myLwfParam;
    myLoaderData.loader = this;
    myLoaderData.debug = false;
    myLoaderData.soundMap = null;
    myLoaderData.pageTransitionMap = null;
    myLoaderData.buttonEventMap = null;
    myLoaderData.fsCommandMap = null;
    myLoaderData.handler = null;
    myLoaderData.callback = null;
    myLoaderData.stageEventReceiver = null;
    myLoaderData.lwfMap = null;
    myLoaderData.debug = this.debug;

    if (!myLwfParam.privateData.hasOwnProperty('lwfLoader')) {
      /** for backward compatibility */
      myLwfParam.privateData.lwfLoader = this; /* pass loader object to LWF */
    }

    myLwfParam.imageMap = this.getImageMapper_(myLwfParam.imageMap);

    if (!_.isEmpty(myLwfParam.soundMap)) {
      myLoaderData.soundMap = myLwfParam.soundMap;
    }
    delete myLwfParam.soundMap;

    if (_.isObject(myLwfParam.pageTransitionMap)) {
      myLoaderData.pageTransitionMap = myLwfParam.pageTransitionMap;
    }
    delete myLwfParam.pageTransitionMap;

    myLoaderData.buttonEventMap = myLwfParam.buttonEventMap;
    delete myLwfParam.buttonEventMap;

    if (!_.isEmpty(myLwfParam.fsCommandMap)) {
      myLoaderData.fsCommandMap = myLwfParam.fsCommandMap;
    }
    delete myLwfParam.fsCommandMap;

    if (!_.isEmpty(myLwfParam.handler)) {
      myLoaderData.handler = myLwfParam.handler;
    }
    delete myLwfParam.handler;

    myLoaderData.callback = myLwfParam.callback;
    delete myLwfParam.callback;

    myLoaderData.lwfMap = myLwfParam.lwfMap;
    delete myLwfParam.lwfMap;

    myLoaderData.resizeStretch = myLwfParam.resizeStretch;
    delete myLwfParam.resizeStretch;

    if (this.isLwfsEnvironment_()) {
      var lwfPath;
      if (myLwfParam.prefix) {
        lwfPath = myLwfParam.prefix + myLwfParam.lwf;
      } else {
        lwfPath = myLwfParam.lwf;
      }
      myLwfParam.prefix = lwfPath.slice(0, lwfPath.lastIndexOf('/') + 1);
      delete myLwfParam.imagePrefix;
      myLwfParam.lwf = lwfPath.slice(lwfPath.lastIndexOf('/') + 1);
    }

    var pos = {};
    pos.position = 'absolute';
    pos.top = 0;
    pos.left = 0;

    _.extend(pos, myLwfParam.pos);
    delete myLwfParam.pos;

    /** prepare LWF stage */
    if (targetElem.style.position === 'static' ||
      targetElem.style.position === '')
    {
      targetElem.style.position = 'relative';
    }
    var stage = createStage(lwfRenderer);
    stage.style.position = pos.position;
    stage.style.top = pos.top + 'px';
    stage.style.left = pos.left + 'px';
    stage.style.zIndex = targetElem.style.zIndex + 1;
    targetElem.appendChild(stage);

    /** use event receiver for avoiding Galaxy S3's translateZ bug */
    var stageEventReceiver = null;
    if (isSp) {
      stageEventReceiver = document.createElement('div');
      stageEventReceiver.style.position = 'absolute';
      stageEventReceiver.style.top = pos.top + 'px';
      stageEventReceiver.style.left = pos.left + 'px';
      stageEventReceiver.style.zIndex = stage.style.zIndex + 1;
      targetElem.appendChild(stageEventReceiver);
    } else {
      stageEventReceiver = stage;
    }
    myLwfParam.stage = stage;
    myLoaderData.stageEventReceiver = stageEventReceiver;

    /** for displaying debug information during runtime */
    if (this.debug || myLoaderData.debug) {
      var divElement = document.createElement('div');
      divElement.id = 'lwf_info' + debugInfoElementId;
      divElement.style.position = pos.position;
      divElement.style.top = pos.top + 'px';
      divElement.style.left = pos.left + 'px';
      divElement.style.color = 'white';
      divElement.style.zIndex = 10000;
      targetElem.appendChild(divElement);
    }

    if (!myLwfParam.lwf) {
      console.error('[LWF] no LWF input');
      return;
    }
    myLoaderData.useLwfJs = /\.lwf.js(\?.*)?$/.test(myLwfParam.lwf);

    if (myLwfParam.hasOwnProperty('_loaderData')) {
      throw new Error('cannot use \'_loaderData\' property that used by lwf-loader!');
    }

    myLwfParam.privateData._loaderData = myLoaderData;

    cache.loadLWF(myLwfParam);
  };

  /**
   * request LWF to attach
   * when child LWF is attached to parent, this function will be called
   * this methods attempts to inherit parent's lwf-loader instance's parameters
   * @param {object} lwf parent LWF instance
   * @param {number} lwfId LWF ID
   * @param {object} imageMap LWF image map
   * @param {object} privateData LWF private data
   * @param {function} myCallback callback to return attach LWF instance
   */
  LwfLoader.prototype.requestLWF_ = function(lwf, lwfId, imageMap, privateData, myCallback) {
    var lwfInput = {};

    /** for LWFS environment, inherit parents' settings from window.testlwf_settings*/
    if (this.isLwfsEnvironment_()) {
      var lwfParam = _.clone(window.testlwf_settings);

      var prefix;
      if (lwfParam.prefix) {
        prefix = lwfParam.prefix + lwfId + '/_/';
      } else {
        prefix = document.location.pathname;
        prefix = prefix.replace(lwf.name, lwfId);
        prefix = prefix.slice(0, prefix.lastIndexOf('/') + 1) + '_/';
      }
      lwfParam.prefix = prefix;
      delete lwfParam.imagePrefix;

      lwfInput = this.getLwfPath_(lwfId);
      if (!lwfInput) {
        console.error('[LWF] no LWF input');
        myCallback('no LWF input', null);
        return null;
      }
      lwfParam.lwf = lwfInput;
      if (isAndroid) {
        lwfParam.lwf += '.js';
      }
      lwfParam.parentLWF = lwf;
      lwfParam.stage = lwf.stage;
      lwfParam.worker = useWebWorker;
      lwfParam.active = false;

      if (imageMap) {
        lwfParam.imageMap = this.getImageMapper_(imageMap);
      }
      if (privateData) {
        lwfParam.privateData = privateData;
      }

      lwfParam.onload = function(childLwf) {
        var loader = this.privateData.lwfLoader;
        if (!childLwf) {
          loader.handleLoadError_(this);
          return myCallback(this.error, childLwf);
        }
        return myCallback(null, childLwf);
      };

    } else {
      /** use data and loader parameters stored in parent LWF instance*/
      var parentPrivateData = lwf.privateData;
      if ('undefined' === typeof parentPrivateData) {
        console.error('[LWF] Parent private data is not found');
        myCallback('no parents data found', null);
        return null;
      }

      var myLoaderData = _.clone(parentPrivateData._loaderData);
      if ('undefined' === typeof myLoaderData) {
        console.error('[LWF] Parent Loader data is not found');
        myCallback('no loader parameters to inherit');
        return null;
      }

      var parentLwfParam = myLoaderData.setting;
      lwfParam = _.clone(parentLwfParam); /* inherit from parent LWF */

      /* child LWFs are rendered using their own size. */
      lwfParam.fitForHeight = lwfParam.fitForWidth = false;
      myLoaderData.setting = lwfParam;

      lwfInput = null;
      try {
        lwfInput = (this.getLwfMapper_(myLoaderData))(lwfId);
      } catch (myException) {
        this.handleException_(myException, myLoaderData);
      }

      if (!lwfInput) {
        console.error('[LWF] no LWF input');
        myCallback('no LWF input', null);
        return null;
      }
      lwfParam.lwf = lwfInput;
      if (myLoaderData.useLwfJs) {
        lwfParam.lwf += '.js';
      }

      lwfParam.parentLWF = lwf;
      lwfParam.stage = lwf.stage;
      lwfParam.worker = useWebWorker;
      lwfParam.active = false;

      if (imageMap) {
        lwfParam.imageMap = this.getImageMapper_(imageMap);
      }
      if (privateData) {
        privateData._loaderData = myLoaderData;
        lwfParam.privateData = privateData;

        if (privateData.prefix) {
          lwfParam.prefix = privateData.prefix;
        }

        if (privateData.imagePrefix) {
          lwfParam.imagePrefix = privateData.imagePrefix;
        }
      }

      lwfParam.onload = function(childLwf) {
        var loader = myLoaderData.loader;
        if (!childLwf) {
          loader.handleLoadError_(this, myLoaderData);
          return myCallback(this.error, childLwf);
        }
        return myCallback(null, childLwf);
      };
    }
    return lwfParam;
  };

  /**
   * Sets up parameters for given LWF data and store it in requests array
   * Stored requests will be loaded via loadLWFs function
   * @param {object} lwf parent LWF instance
   * @param {number} lwfId LWF ID
   * @param {object} imageMap LWF image map
   * @param {object} privateData LWF private data
   * @param {function} myCallback callback to return attach LWF instance
   */
  LwfLoader.prototype.requestLWF = function(lwf, lwfId, imageMap, privateData, myCallback) {
    var lwfParam = this.requestLWF_(lwf, lwfId, imageMap, privateData, myCallback);
    if (_.isNull(lwfParam)) {
      return;
    }
    this.requests.push(lwfParam);
  };

  /**
   * Load external LWF resource to attach on current running LWF.
   * @param {object} lwf parent LWF instance
   * @param {number} lwfId LWF ID
   * @param {object} imageMap LWF image map
   * @param {object} privateData LWF private data
   * @param {function} myCallback callback to return attach LWF instance
   */
  LwfLoader.prototype.loadLWF = function(lwf, lwfId, imageMap, privateData, myCallback) {
    var lwfParam = this.requestLWF_(lwf, lwfId, imageMap, privateData, myCallback);
    if (_.isNull(lwfParam)) {
      return;
    }
    var LWF = global.LWF;
    var cache = LWF.ResourceCache.get();
    cache.loadLWF(lwfParam);
  };

  /**
   * Call LWF's loadLWFs function via loader.
   * @param {function} myCallback callback to return all LWF instances
   */
  LwfLoader.prototype.loadLWFs = function(myCallback) {
    var LWF = global.LWF;
    var cache = LWF.ResourceCache.get();
    cache.loadLWFs(this.requests, myCallback);
    this.requests = [];
  };

  /** set lwf-loader parameters */
  global.LwfLoader = LwfLoader;
})(window);
