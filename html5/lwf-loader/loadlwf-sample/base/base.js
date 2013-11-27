global.LWF.Script = global.LWF.Script || {};
global.LWF.Script["base"] = function() {
  var LWF = global.LWF.LWF;
  var Loader = global.LWF.Loader;
  var Movie = global.LWF.Movie;
  var Property = global.LWF.Property;
  var Point = global.LWF.Point;
  var Matrix = global.LWF.Matrix;
  var Color = global.LWF.Color;
  var ColorTransform = global.LWF.ColorTransform;
  var Tween = global.LWF.Tween;
  var _root;

  var fscommand = function(type, arg) {
    if (type === "event") {
      _root.lwf.dispatchEvent(arg, this);
    } else {
      throw Error("unknown fscommand");
    }
  };

  var trace = function(msg) {
    console.log(msg);
  };

  var Script = (function() {function Script() {}

    Script.prototype["init"] = function() {
      var movie = this;
      while (movie.parent !== null)
        movie = movie.parent.lwf.rootMovie;
      _root = movie;
    };

    Script.prototype["destroy"] = function() {
      _root = null;
    };

    Script.prototype["_root_0_1"] = function() {
      var attachNum = 0;
      var lwfLoader = this.lwf.privateData.lwfLoader;

      var self = this;
      function loadLWF(pSrc, imageMap){
        lwfLoader.loadLWF(self.lwf, pSrc, imageMap,null,function(pError, pLWF){
          self.attachLWF(pLWF, "lwf" + attachNum);
          attachNum++;
          pLWF.rootMovie.nextEnterFrame(function(){
            var movie = pLWF.rootMovie["chara"];
            var px = Math.random() * 200  - 100 + 160;
            var py = Math.random() * 50 + 220;
            var scale = 0.7
            movie.moveTo(px,py);
            movie.scaleTo(scale,scale);
          });

        });
      }

      this.button1.addEventListener("release",function(){
        var imageMap = {
          'atlas.png' : 'PARTS/parts1/atlas.png'
        };
        loadLWF("PARTS/parts1", imageMap);
      });

      this.button2.addEventListener("release",function(){
        var imageMap = {
          'atlas.png' : 'PARTS/parts2/atlas.png'
        };
        loadLWF("PARTS/parts2", imageMap);
      });

      this.button3.addEventListener("release",function(){
        var imageMap = {
          'atlas.png' : 'PARTS/parts3/atlas.png'
        };
        loadLWF("PARTS/parts3", imageMap);
      });
    };

    return Script;

  })();

  return new Script();
};
