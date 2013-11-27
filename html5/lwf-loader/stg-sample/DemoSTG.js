global.LWF.Script = global.LWF.Script || {};
global.LWF.Script["DemoSTG"] = function() {
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
		//-----include file:root/0/lwf_script.js-----//
		
		/**
		* Created with JetBrains WebStorm.
		* User: masao.kajikawa
		* Date: 13/03/18
		* Time: 23:03
		* To change this template use File | Settings | File Templates.
		*/
		/// <reference path="../Import.d.ts"/>
		var Bar = (function () {
		    /**
		    *
		    * @param pBarParentMC
		    * @param pBarMCName
		    */
		    function Bar(pBarParentMC) {
		        this.mc = pBarParentMC;
		        this._bar = this.mc["bar"];
		        this.enterFrameFunc = function () {
		        };
		    }
		    /**
		    * 即座に値を変更
		    * @param pScale    変更後の値スケール
		    * @param pRelative aScaleが相対値か
		    */
		    Bar.prototype.change = function (pScale, pRelative) {
		        if (typeof pRelative === "undefined") { pRelative = false; }
		        if (1 < pScale) {
		            pScale = 1;
		        }
		        if (pScale < 0) {
		            pScale = 0;
		        }
		        if (pRelative === false) {
		            this._bar.scaleX = pScale;
		        } else {
		            this._bar.scaleX += pScale;
		        }
		    };
		
		    /**
		    * フレームを基準にアニメーションさせる
		    * @param pScale    変更後のスケール
		    * @param pFrame   変更完了までのフレーム数
		    * @param pEasing  イージング
		    * @param pRelative aScaleが相対値か
		    * @param pOnComplete    完了後の実行関数
		    * @param pFuncTarget  関数の実行場所
		    */
		    Bar.prototype.changeByFrame = function (pScale, pFrame, pEasing, pRelative, pOnComplete, pFuncTarget) {
		        if (typeof pEasing === "undefined") { pEasing = null; }
		        if (typeof pRelative === "undefined") { pRelative = false; }
		        if (typeof pOnComplete === "undefined") { pOnComplete = null; }
		        if (typeof pFuncTarget === "undefined") { pFuncTarget = null; }
		        if (pEasing === null) {
		            pEasing = Tween.Easing.Linear.None;
		        }
		        var value = (pRelative === false) ? pScale : this._bar.scaleX + pScale;
		        if (1 < value) {
		            value = 1;
		        }
		        if (value < 0) {
		            value = 0;
		        }
		
		        this._barTween = this._bar.addTween().easing(pEasing).to({ scaleX: value }, pFrame).onUpdate(this.enterFrameFunc).onComplete(function () {
		            if (pOnComplete !== null) {
		                if (pFuncTarget !== null) {
		                    pOnComplete.call(pFuncTarget);
		                } else {
		                    pOnComplete();
		                }
		            }
		        }).start();
		    };
		
		    /**
		    *スピードを基準にアニメーションさせる
		    * @param pScale  変更後のスケール
		    * @param pSpeed  1フレームごとの変化スピード(正の値)
		    * @param pRelative aScaleが相対値か
		    * @param pOnComplete   コールバック関数
		    * @param pFuncTarget  関数の実行対象
		    */
		    Bar.prototype.changeBySpeed = function (pScale, pSpeed, pRelative, pOnComplete, pFuncTarget) {
		        if (typeof pRelative === "undefined") { pRelative = false; }
		        if (typeof pOnComplete === "undefined") { pOnComplete = null; }
		        if (typeof pFuncTarget === "undefined") { pFuncTarget = null; }
		        var value = (pRelative === false) ? pScale : this._bar.scaleX + pScale;
		        if (1 < value) {
		            value = 1;
		        }
		        if (value < 0) {
		            value = 0;
		        }
		        var frame = Math.ceil(value / pSpeed);
		
		        this._barTween = this._bar.addTween().to({ scaleX: value }, frame).onUpdate(this.enterFrameFunc).onComplete(function () {
		            if (pOnComplete !== null) {
		                if (pFuncTarget !== null) {
		                    pOnComplete.call(pFuncTarget);
		                } else {
		                    pOnComplete();
		                }
		            }
		        }).start();
		    };
		
		    Bar.prototype.stopBarTween = function () {
		        this._barTween.stop();
		    };
		
		    Bar.prototype.getPer = function () {
		        return this._bar.scaleX;
		    };
		    return Bar;
		})();
		/**
		* Created with JetBrains WebStorm.
		* User: masao.kajikawa
		* Date: 13/03/26
		* Time: 18:41
		* To change this template use File | Settings | File Templates.
		*/
		/// <reference path="../Import.d.ts"/>
		var BitmapText = (function () {
		    /**
		    *ビットマップテキストクラス
		    * @param pWidth　　　　　　表示領域幅
		    * @param pHeight           表示領域高さ
		    * @param pSrcLinkageName   フォント格納MCリンケージ名
		    * @param pParent           親にするMC
		    * @param pText             テキスト内容
		    * @param pSize             テキストサイズ
		    * @param pSpacing          スペーシング
		    * @param pAlign            横整列
		    * @param pVerticalAlign    縦整列
		    * @param pHorizontalRatio  水平比率
		    */
		    function BitmapText(pWidth, pHeight, pSrcLinkageName, pParent, pText, pSize, pSpacing, pAlign, pVerticalAlign, pHorizontalRatio) {
		        if (typeof pText === "undefined") { pText = ""; }
		        if (typeof pSize === "undefined") { pSize = 24; }
		        if (typeof pSpacing === "undefined") { pSpacing = 0; }
		        if (typeof pAlign === "undefined") { pAlign = BitmapText.ALIGN_LEFT; }
		        if (typeof pVerticalAlign === "undefined") { pVerticalAlign = BitmapText.ALIGN_TOP; }
		        if (typeof pHorizontalRatio === "undefined") { pHorizontalRatio = 1; }
		        this._charMCs = [];
		        this._charData = new Array();
		        this._length = 0;
		        this._pivotX = 0;
		        this._pivotY = 0;
		        this._currentX = 0;
		        this._currentY = 0;
		        this._width = pWidth;
		        this._height = pHeight;
		        this.mc = pParent.attachMovie(BitmapText.emptyMovieLinkage, "bitmaptext" + BitmapText.CREATE_NO);
		        BitmapText.CREATE_NO++;
		        this._srcName = pSrcLinkageName;
		        this._lock = false;
		        this._lineWidth = [];
		        this._charMCs = [];
		
		        //初期プロパティ
		        this._text = "";
		        this._size = pSize;
		        this._spacing = pSpacing;
		        this._align = pAlign;
		        this._verticalAlign = pVerticalAlign;
		        this._group = 0;
		
		        if (pText !== "") {
		            this.setText(pText);
		        }
		    }
		    /**
		    * bitmapTextの破棄
		    */
		    BitmapText.prototype.dispose = function () {
		        this.mc.removeMovieClip();
		        this._charMCs = null;
		        this._charData = null;
		    };
		
		    /**
		    * transform基準点X変更
		    * @param pX
		    */
		    BitmapText.prototype.setPivotX = function (pX) {
		        this._pivotX = -pX;
		        if (this._lock === false) {
		            this.relocation();
		        }
		    };
		
		    /**
		    * transform基準点Y変更
		    * @param pY
		    */
		    BitmapText.prototype.setPivotY = function (pY) {
		        this._pivotY = -pY;
		        if (this._lock === false) {
		            this.relocation();
		        }
		    };
		
		    /**
		    * transform基準点を中心に
		    */
		    BitmapText.prototype.setPivotCenter = function () {
		        this._pivotX = -this._width * 0.5;
		        this._pivotY = -this._height * 0.5;
		        if (this._lock === false) {
		            this.relocation();
		        }
		    };
		
		    /**
		    *テキストのセット
		    * @param pText
		    */
		    BitmapText.prototype.setText = function (pText) {
		        this._text = String(pText);
		        if (this._lock === false) {
		            this.checkLength();
		        }
		    };
		
		    /**
		    *テキストの取得
		    * @returns {string}
		    */
		    BitmapText.prototype.getText = function () {
		        return this._text;
		    };
		
		    /**
		    *サイズのセット
		    * @param pSize
		    */
		    BitmapText.prototype.setSize = function (pSize) {
		        this._size = pSize;
		        if (this._lock === false) {
		            this.relocation();
		        }
		    };
		
		    /**
		    *サイズの取得
		    * @returns {number}
		    */
		    BitmapText.prototype.getSize = function () {
		        return this._size;
		    };
		
		    /**
		    *整列のセット
		    * @param pAlign
		    */
		    BitmapText.prototype.setAlign = function (pAlign) {
		        this._align = pAlign;
		        if (this._lock === false) {
		            this.resetAlign();
		        }
		    };
		
		    /**
		    *整列の取得
		    * @returns {string}
		    */
		    BitmapText.prototype.getAlign = function () {
		        return this._align;
		    };
		
		    /**
		    *縦整列のセット
		    * @param pVerticalAlign
		    */
		    BitmapText.prototype.setVerticalAlign = function (pVerticalAlign) {
		        this._verticalAlign = pVerticalAlign;
		        if (this._lock === false) {
		            this.resetAlign();
		        }
		    };
		
		    /**
		    * 縦整列の取得
		    * @returns {string}
		    */
		    BitmapText.prototype.getVerticalAlign = function () {
		        return this._verticalAlign;
		    };
		
		    /**
		    *スペーシングのセット
		    * @param pSpace
		    */
		    BitmapText.prototype.setSpacing = function (pSpace) {
		        this._spacing = pSpace;
		        if (this._lock === false) {
		            this.relocation();
		        }
		    };
		
		    /**
		    *スペーシングの取得
		    * @returns {number}
		    */
		    BitmapText.prototype.getSpacing = function () {
		        return this._spacing;
		    };
		
		    /**
		    *幅の変更
		    * @param pWidth
		    */
		    BitmapText.prototype.setWidth = function (pWidth) {
		        this._width = pWidth;
		        if (this._lock === false) {
		            this.relocation();
		        }
		    };
		
		    /**
		    *幅の取得
		    * @returns {number}
		    */
		    BitmapText.prototype.getWidth = function () {
		        return this._width;
		    };
		
		    /**
		    *高さの変更
		    * @param pHeight
		    */
		    BitmapText.prototype.setHeight = function (pHeight) {
		        this._height = pHeight;
		        if (this._lock === false) {
		            this.relocation();
		        }
		    };
		
		    /**
		    *高さの取得
		    * @returns {number}
		    */
		    BitmapText.prototype.getHeight = function () {
		        return this._height;
		    };
		
		    /**
		    *ロックをかけてプロパティを変更されても更新しない
		    */
		    BitmapText.prototype.lock = function () {
		        this._lock = true;
		    };
		
		    /**
		    *ロックを解除して更新処理を行う
		    */
		    BitmapText.prototype.unlock = function () {
		        this._lock = false;
		        this.checkLength();
		    };
		
		    /**
		    * 文字数の取得(特殊文字は省く)
		    * @returns {number}
		    */
		    BitmapText.prototype.getLength = function () {
		        return this.getTextLength(this._text);
		    };
		
		    /* -------------------------------------------------------
		    [処理手順]          [実行]          [関連]
		    文字数確認        checkLength     setText
		    MCのリセット      resetMC
		    文字のセット      resetText
		    整列&幅計算       resetAlign      setAlign
		    配置処理          relocation      setSpace, setScale
		    
		    ------------------------------------------------------- */
		    /**
		    *文字数チェック
		    */
		    BitmapText.prototype.checkLength = function () {
		        //特殊文字は文字数にカウントしない
		        var textLen = this.getTextLength(this._text);
		        if (textLen === this._length) {
		            this.resetText();
		        } else {
		            this.resetMC(this._length, textLen);
		        }
		    };
		
		    /**
		    * MC数の調整
		    * @param pOldLen  以前の文字数
		    * @param pNewLen   新しい文字数
		    */
		    BitmapText.prototype.resetMC = function (pOldLen, pNewLen) {
		        this._length = pNewLen;
		        var i;
		        if (pOldLen < pNewLen) {
		            for (i = pOldLen; i < pNewLen; i++) {
		                this._charMCs.push(this.mc.attachMovie(this._srcName, "charMC" + i));
		            }
		        } else {
		            for (i = pOldLen; pNewLen < i; i--) {
		                this._charMCs[i - 1].removeMovieClip();
		                this._charMCs.length--;
		            }
		        }
		        this.resetText();
		    };
		
		    /**
		    *テキストのセット
		    */
		    BitmapText.prototype.resetText = function () {
		        //クリア
		        this._maxHeight = 0;
		        this._group = 0;
		        this._charData = [];
		        var i;
		        var len = this._text.length;
		        var mcNum = 0;
		        for (i = 0; i < len; i++) {
		            var word = this._text.substr(i, 1);
		
		            if (word === " ") {
		                this._charData.push([null, 0, 0]);
		            } else if (word === "　") {
		                this._charData.push([null, 1, 1]);
		            } else if (word === "@") {
		                i++;
		                word = this._text.substr(i, 1);
		                switch (word) {
		                    case "0":
		                        this._group = 0;
		                        break;
		                    case "1":
		                        this._group = 1;
		                        break;
		                    case "2":
		                        this._group = 2;
		                        break;
		                    case "3":
		                        this._group = 3;
		                        break;
		                    case "4":
		                        this._group = 4;
		                        break;
		                    case "5":
		                        this._group = 5;
		                        break;
		                    case "6":
		                        this._group = 6;
		                        break;
		                    case "7":
		                        this._group = 7;
		                        break;
		                    case "8":
		                        this._group = 8;
		                        break;
		                    case "9":
		                        this._group = 9;
		                        break;
		                }
		            } else {
		                //通常文字処理
		                //MC取得
		                var mc = this._charMCs[mcNum];
		                mcNum++;
		
		                //フレーム移動
		                var code = this._text.charCodeAt(i);
		                mc.gotoAndStop("s_" + code + "_" + this._group);
		
		                var frame = mc.currentFrame;
		
		                if (frame === -1) {
		                    throw new Error("not found bitmapText sizeData! unicode:" + code + ", char:" + word + ", group:" + this._group + ", text:" + this._text);
		                }
		                var width = (mc).SIZE[frame - 2][0];
		                var height = (mc).SIZE[frame - 2][1];
		                if (this._maxHeight < height) {
		                    this._maxHeight = height;
		                }
		
		                //格納
		                this._charData.push([mc, width, height]);
		            }
		        }
		        this.relocation();
		    };
		
		    /**
		    *配置処理
		    */
		    BitmapText.prototype.relocation = function () {
		        var scale = this._size / this._maxHeight;
		        var i;
		        var len = this._charData.length;
		        this._lineWidth[0] = 0;
		        for (i = 0; i < len; i++) {
		            var mc = this._charData[i][0];
		            if (mc !== null) {
		                //通常処理
		                mc.scaleX = scale;
		                mc.scaleY = scale;
		                this._lineWidth[0] += this._charData[i][1] * scale + this._spacing;
		            } else {
		                if (this._charData[i][1] === 0) {
		                    //半角スペース
		                    this._lineWidth[0] += (this._size * scale) * 0.5 + this._spacing;
		                } else {
		                    //全角スペース
		                    this._lineWidth[0] += this._size * scale + this._spacing;
		                }
		            }
		        }
		        this._lineWidth[0] -= this._spacing;
		        this.resetAlign();
		    };
		
		    /**
		    *整列処理
		    */
		    BitmapText.prototype.resetAlign = function () {
		        var scale = this._size / this._maxHeight;
		        this._currentX = this._pivotX;
		        this._currentY = this._pivotY;
		        switch (this._align) {
		            case BitmapText.ALIGN_LEFT:
		                break;
		            case BitmapText.ALIGN_CENTER:
		                this._currentX += this._width * 0.5 - this._lineWidth[0] * 0.5;
		                break;
		            case BitmapText.ALIGN_RIGHT:
		                this._currentX += this._width - this._lineWidth[0];
		                break;
		        }
		        switch (this._verticalAlign) {
		            case BitmapText.ALIGN_TOP:
		                break;
		            case BitmapText.ALIGN_CENTER:
		                this._currentY += this._height * 0.5 - this._maxHeight * 0.5 * scale;
		                break;
		            case BitmapText.ALIGN_BOTTOM:
		                this._currentY += this._height - this._maxHeight * scale;
		                break;
		        }
		
		        //配置
		        var i;
		        var len = this._charData.length;
		        for (i = 0; i < len; i++) {
		            var mc = this._charData[i][0];
		            if (mc !== null) {
		                //通常処理
		                mc.x = this._currentX;
		                mc.y = (this._maxHeight - this._charData[i][2]) + this._currentY;
		                this._currentX += this._charData[i][1] * scale + this._spacing;
		            } else {
		                if (this._charData[i][1] === 0) {
		                    //半角スペース
		                    this._currentX += (this._size * scale) * 0.5 + this._spacing;
		                } else {
		                    //全角スペース
		                    this._currentX += this._size * scale + this._spacing;
		                }
		            }
		        }
		    };
		
		    /**
		    * 特殊文字を省いた文字数を返す
		    * @param pText カウント対象
		    */
		    BitmapText.prototype.getTextLength = function (pText) {
		        var length = pText.length;
		        while (pText.indexOf("@") !== -1) {
		            pText = pText.replace("@", "");
		            length -= 2;
		        }
		        while (pText.indexOf(" ") !== -1) {
		            pText = pText.replace(" ", "");
		            length--;
		        }
		        while (pText.indexOf("　") !== -1) {
		            pText = pText.replace("　", "");
		            length--;
		        }
		        return length;
		    };
		    BitmapText.emptyMovieLinkage = "movieclip";
		    BitmapText.CREATE_NO = 0;
		
		    BitmapText.ALIGN_RIGHT = "right";
		    BitmapText.ALIGN_CENTER = "center";
		    BitmapText.ALIGN_LEFT = "left";
		    BitmapText.ALIGN_TOP = "top";
		    BitmapText.ALIGN_BOTTOM = "bottom";
		    return BitmapText;
		})();
		/**
		* Created with JetBrains WebStorm.
		* User: masao.kajikawa
		* Date: 13/07/11
		* Time: 15:58
		* To change this template use File | Settings | File Templates.
		*/
		/// <reference path="../Import.d.ts"/>
		var ButtonMovie = (function () {
		    /**
		    * ボタン用MCを制御するためのクラス。
		    * 必ず下記のラベルとボタンインスタンスを配置
		    * ENABLED,DISABLED以外はアニメーションの有無に関わらず終了フレームに下記のコマンドを記述すること
		    * this.dispatchEvent("end");
		    *
		    * label:ENABLED
		    * label:PRESS
		    * label:RELEASE
		    * label:ROLL_OVER
		    * label:ROLL_OUT
		    * label:DISABLED
		    * 全フレームにインスタンス名"hit"のボタンインスタンスが存在するようにする
		    * @param pButton   ボタンMCのリンケージ名か　ボタンMC
		    * @param pAttachTarget リンケージ名を参照してattachする場合のattach対象
		    */
		    function ButtonMovie(pButton, pAttachTarget) {
		        if (typeof pAttachTarget === "undefined") { pAttachTarget = null; }
		        //param
		        this._enabled = true;
		        this._eventHandlers = new Object();
		        this._animateAble = true;
		        if (pAttachTarget === null) {
		            // get mc
		            this._mc = pButton;
		        } else {
		            //attach mc
		            var linkage = pButton;
		            this._mc = pAttachTarget.attachMovie(linkage, linkage + ButtonMovie.attachNum);
		            ButtonMovie.attachNum++;
		        }
		
		        //必要インスタンスのチェック
		        this.checkInstance(pButton, pAttachTarget);
		
		        //button
		        this._mc.gotoAndStop("ENABLED");
		        this._button = this._mc["hit"];
		
		        //ステータス
		        this._status = ButtonMovie.ENABLED;
		
		        //リスナー設定
		        var self = this;
		
		        //初期イベント
		        self._eventHandlers["press"] = function () {
		        };
		        self._eventHandlers["release"] = function () {
		        };
		        self._eventHandlers["rollOut"] = function () {
		        };
		        self._eventHandlers["rollOver"] = function () {
		        };
		
		        //press
		        this._button.addEventListener("press", function () {
		            if (self._enabled === true) {
		                if (self._animateAble === true) {
		                    self._mc.gotoAndPlay("PRESS");
		                }
		                self._eventHandlers["press"]();
		                self._status = ButtonMovie.PRESS;
		            }
		            self._mc.addEventListener("end", function () {
		                self._mc.clearEventListener("end");
		                self._mc.stop();
		            });
		        });
		
		        //release
		        this._button.addEventListener("release", function () {
		            if (self._enabled === true) {
		                if (self._animateAble === true) {
		                    self._mc.gotoAndPlay("RELEASE");
		                }
		                self._eventHandlers["release"]();
		                self._status = ButtonMovie.RELEASE;
		            }
		            self._mc.addEventListener("end", function () {
		                self._mc.clearEventListener("end");
		                if (self._enabled === true) {
		                    self._mc.gotoAndStop("ENABLED");
		                } else {
		                    self._mc.gotoAndStop("DISABLED");
		                }
		            });
		        });
		
		        //roll over
		        this._button.addEventListener("rollOver", function () {
		            if (self._enabled === true) {
		                if (self._animateAble === true) {
		                    self._mc.gotoAndPlay("ROLL_OVER");
		                }
		                self._eventHandlers["rollOver"]();
		                self._status = ButtonMovie.ROLL_OVER;
		            }
		            self._mc.addEventListener("end", function () {
		                self._mc.clearEventListener("end");
		                self._mc.stop();
		            });
		        });
		
		        //roll out
		        this._button.addEventListener("rollOut", function () {
		            if (self._enabled === true) {
		                if (self._animateAble === true) {
		                    self._mc.gotoAndPlay("ROLL_OUT");
		                }
		                self._eventHandlers["rollOut"]();
		                self._status = ButtonMovie.ROLL_OUT;
		            }
		            self._mc.addEventListener("end", function () {
		                self._mc.clearEventListener("end");
		                self._mc.stop();
		            });
		        });
		    }
		    /**
		    * イベントの設定
		    * @param pButtonEvent
		    * @param func
		    */
		    ButtonMovie.prototype.setEventListener = function (pButtonEvent, func) {
		        this._eventHandlers[pButtonEvent] = func;
		    };
		
		    /**
		    * ボタンの有効状態
		    * @param pEnabled
		    */
		    ButtonMovie.prototype.setEnabled = function (pEnabled) {
		        if (this._enabled !== pEnabled) {
		            this._enabled = pEnabled;
		            if (this._mc.playing === false) {
		                if (this._enabled === true) {
		                    this._mc.gotoAndStop("ENABLED");
		                } else {
		                    this._mc.gotoAndStop("DISABLED");
		                }
		            }
		        }
		    };
		
		    ButtonMovie.prototype.setVisible = function (pVisible) {
		        this._mc.visible = pVisible;
		    };
		
		    ButtonMovie.prototype.getMC = function () {
		        return this._mc;
		    };
		
		    ButtonMovie.prototype.setAnimate = function (pBool) {
		        this._animateAble = pBool;
		    };
		
		    /**
		    *テキストの配置
		    * @param pText テキスト
		    * @param pTextName テキストのインスタンス名
		    */
		    ButtonMovie.prototype.setText = function (pText, pTextName) {
		        this._mc[pTextName] = pText;
		    };
		
		    ButtonMovie.prototype.checkInstance = function (pButton, pAttachTarget) {
		        if (this._mc === null) {
		            throw new Error("failed baseMovie! arg1:" + pButton + " ,arg2:" + pAttachTarget);
		        }
		
		        if (this._mc["hit"] === null) {
		            throw new Error("failed hitArea!");
		        }
		    };
		    ButtonMovie.attachNum = 0;
		
		    ButtonMovie.ENABLED = 0;
		    ButtonMovie.PRESS = 1;
		    ButtonMovie.RELEASE = 2;
		    ButtonMovie.ROLL_OVER = 3;
		    ButtonMovie.ROLL_OUT = 4;
		    ButtonMovie.DISABLED = 5;
		    return ButtonMovie;
		})();
		/**
		* Created by musuka on 13/11/04.
		*/
		/// <reference path="../Import.d.ts"/>
		var Game = (function () {
		    function Game(pBaseMovie) {
		        this._score = 0;
		        this._touchFlag = false;
		        this._base = pBaseMovie;
		    }
		    Game.prototype.init = function () {
		        this._bulletManager = new BulletManager(this._base);
		        this._enemyManager = new EnemyManager(this._base, this._bulletManager);
		        this._stage = new Stage(this._enemyManager);
		
		        this._player = new Player(this._base["player"], this._bulletManager);
		        this._player.init();
		        this._stageBack = this._base["stageBack"];
		        this._button = this._base["button"];
		
		        //handler
		        this._setButtonHandler();
		        this._setEnterFrameHandler();
		    };
		
		    Game.prototype._setButtonHandler = function () {
		        var self = this;
		
		        //button
		        this._button.addEventListener("press", function () {
		            self._touchFlag = true;
		        });
		        this._button.addEventListener("release", function () {
		            self._touchFlag = false;
		        });
		    };
		
		    Game.prototype._setEnterFrameHandler = function () {
		        var self = this;
		
		        //enterFrame
		        this._base.addEventListener("enterFrame", function () {
		            self._enterFrameHandler();
		        });
		    };
		
		    Game.prototype._enterFrameHandler = function () {
		        this._player.update(this._touchFlag);
		        this._enemyManager.update();
		        this._bulletManager.update();
		        this._stage.update();
		        this._score += this._enemyManager.getDownNum();
		        this._base["textScore"] = "score:" + this._score;
		        this._stage.setSpan(100 - this._score);
		        this._moveStageBack();
		    };
		
		    Game.prototype._moveStageBack = function () {
		        this._stageBack.x -= 10;
		        if (this._stageBack.x < -320 - 160) {
		            this._stageBack.x += 320;
		        }
		    };
		    return Game;
		})();
		/**
		* Created by musuka on 13/11/04.
		*/
		/// <reference path="../../Import.d.ts"/>
		var Stage = (function () {
		    function Stage(pEnemyManager) {
		        this._lifeSpanMin = 3;
		        this._lifeSpanMax = 100;
		        this._lifeCount = 100;
		        this._enemyManager = pEnemyManager;
		    }
		    Stage.prototype.update = function () {
		        if (this._lifeCount <= 0) {
		            this._lifeCount = Math.floor(Math.random() * (this._lifeSpanMax - this._lifeSpanMin) + this._lifeSpanMin);
		            this._enemyManager.create("class_Enemy", 40);
		        } else {
		            this._lifeCount--;
		        }
		    };
		
		    Stage.prototype.setSpan = function (pValue) {
		        this._lifeSpanMax = pValue;
		        if (this._lifeSpanMax < this._lifeSpanMin) {
		            this._lifeSpanMax = this._lifeSpanMin;
		        }
		    };
		    return Stage;
		})();
		/**
		* Created by musuka on 13/11/04.
		*/
		/// <reference path="../../Import.d.ts"/>
		var Player = (function () {
		    function Player(pPlayerMovie, pBulletManager) {
		        //param
		        this._vecX = 0;
		        this._vecY = 0;
		        this._gravity = 0.5;
		        this._shootInterval = 3;
		        this._shootCount = 0;
		        this._attachNo = 0;
		        this._movie = pPlayerMovie;
		        this._bulletManager = pBulletManager;
		    }
		    Player.prototype.init = function () {
		    };
		
		    Player.prototype.update = function (pRocketFlag) {
		        if (pRocketFlag === true) {
		            this._applyRocket();
		        }
		        this._applyGravity();
		        this._checkMoveArea();
		        this._applyVector();
		
		        //shoot
		        this._shoot();
		    };
		
		    Player.prototype.shootAnimation = function () {
		        var shootWave = this._movie.attachMovie("class_ShootWave", "shootWave" + this._attachNo);
		        shootWave.x = 40;
		        this._attachNo++;
		    };
		
		    Player.prototype._applyGravity = function () {
		        if (this._vecY < 8) {
		            this._vecY += this._gravity;
		        }
		    };
		
		    Player.prototype._applyVector = function () {
		        this._movie.x += this._vecX;
		        this._movie.y += this._vecY;
		    };
		
		    Player.prototype._applyRocket = function () {
		        this._vecY -= 1;
		    };
		
		    Player.prototype._shoot = function () {
		        if (this._shootCount <= 0) {
		            this._shootCount = this._shootInterval;
		
		            //shootWave
		            this.shootAnimation();
		
		            //bullet
		            var bullet = this._bulletManager.create("class_Bullet", 0);
		            bullet.moveTo(this._movie.x + 40, this._movie.y);
		            bullet.setVector(20, 0);
		        } else {
		            this._shootCount--;
		        }
		    };
		
		    /**
		    * 移動可能範囲にいるか
		    * @private
		    */
		    Player.prototype._checkMoveArea = function () {
		        var movedY = this._movie.y + this._vecY;
		        if ((-180 < movedY && movedY < 150) === false) {
		            this._vecY = 0;
		        }
		    };
		    return Player;
		})();
		/**
		* Created by musuka on 13/11/04.
		*/
		/// <reference path="../../Import.d.ts"/>
		var Enemy = (function () {
		    function Enemy(pEnemyMovie, pBulletManager, pRadius) {
		        this._vecX = 0;
		        this._vecY = 0;
		        this._deleteFlag = false;
		        //param
		        this._life = 3;
		        this._movie = pEnemyMovie;
		        this._bulletManager = pBulletManager;
		        this._radius = pRadius;
		    }
		    Enemy.prototype.moveTo = function (pX, pY) {
		        this._movie.x = pX;
		        this._movie.y = pY;
		    };
		
		    Enemy.prototype.setVector = function (pVecX, pVecY) {
		        this._vecX = pVecX;
		        this._vecY = pVecY;
		    };
		
		    Enemy.prototype.update = function () {
		        this._applyVector();
		        if (this._bulletHitTest() === true) {
		            this.damage(1);
		        }
		
		        //deleteFlag
		        this._deleteFlag = this._checkOutStageArea();
		        if (this._deleteFlag === false) {
		            this._deleteFlag = (this._life <= 0);
		        }
		    };
		
		    Enemy.prototype.remove = function () {
		        if (this._life <= 0) {
		            var self = this;
		            this._movie.gotoAndStop("down");
		            this._movie.addEventListener("complete", function () {
		                self._movie.removeMovieClip();
		            });
		        } else {
		            this._movie.removeMovieClip();
		        }
		    };
		
		    Enemy.prototype.damage = function (pValue) {
		        this._life -= pValue;
		    };
		
		    Enemy.prototype._applyVector = function () {
		        this._movie.x += this._vecX;
		        this._movie.y += this._vecY;
		    };
		
		    Enemy.prototype._checkOutStageArea = function () {
		        if ((-200 < this._movie.x && this._movie.x < 200) === false) {
		            if ((-240 < this._movie.x && this._movie.x < 240) === false) {
		                return true;
		            }
		        }
		        return false;
		    };
		
		    Enemy.prototype._bulletHitTest = function () {
		        var bullets = this._bulletManager.getBullets();
		        var i;
		        var len = bullets.length;
		        var radius2 = this._radius * this._radius;
		        for (i = 0; i < len; i++) {
		            var bulletX = bullets[i].getX();
		            var bulletY = bullets[i].getY();
		            var distance2 = (bulletX - this._movie.x) * (bulletX - this._movie.x) + (bulletY - this._movie.y) * (bulletY - this._movie.y);
		            if (distance2 <= radius2) {
		                bullets[i].hit();
		                this._bulletManager.createHitEffect("class_HitEffect", bulletX, bulletY);
		                return true;
		            }
		        }
		        return false;
		    };
		
		    Enemy.prototype.getDeleteFlag = function () {
		        return this._deleteFlag;
		    };
		
		    Enemy.prototype.getLife = function () {
		        return this._life;
		    };
		    return Enemy;
		})();
		/**
		* Created by musuka on 13/11/04.
		*/
		/// <reference path="../../Import.d.ts"/>]
		var EnemyManager = (function () {
		    function EnemyManager(pAttachTarget, pBulletManager) {
		        this._enemies = [];
		        this._attachNo = 0;
		        this._downNum = 0;
		        this._movie = pAttachTarget;
		        this._bulletManager = pBulletManager;
		    }
		    EnemyManager.prototype.create = function (pEnemyLinkage, pRadius) {
		        var enemy = new Enemy(this._movie.attachMovie(pEnemyLinkage, pEnemyLinkage + this._attachNo), this._bulletManager, pRadius);
		        this._attachNo++;
		        enemy.moveTo(200, Math.random() * 280 - 140);
		        enemy.setVector(-3, 0);
		        this._enemies.push(enemy);
		    };
		
		    EnemyManager.prototype.update = function () {
		        var i;
		        var len = this._enemies.length;
		        for (i = 0; i < len; i++) {
		            this._enemies[i].update();
		            if (this._enemies[i].getDeleteFlag() === true) {
		                this._enemies[i].remove();
		                if (this._enemies[i].getLife() <= 0) {
		                    this._downNum++;
		                }
		                this._enemies.splice(i, 1);
		                i--;
		                len--;
		            }
		        }
		    };
		
		    EnemyManager.prototype.getDownNum = function () {
		        var num = this._downNum;
		        this._downNum = 0;
		        return num;
		    };
		    return EnemyManager;
		})();
		/**
		* Created by musuka on 13/11/04.
		*/
		/// <reference path="../../Import.d.ts"/>
		var Bullet = (function () {
		    /**
		    *
		    * @param pBulletMovie
		    * @param pType 0:プレイヤー 1:敵
		    */
		    function Bullet(pBulletMovie, pType) {
		        this._deleteFlag = false;
		        this._hitNum = 1;
		        this._movie = pBulletMovie;
		        this._type = pType;
		    }
		    Bullet.prototype.update = function () {
		        this._movie.x += this._vecX;
		        this._movie.y += this._vecY;
		
		        //deleteCheck
		        this._deleteFlag = this._checkOutStageArea();
		        if (this._deleteFlag === false) {
		            this._deleteFlag = (this._hitNum <= 0);
		        }
		    };
		
		    Bullet.prototype.remove = function () {
		        this._movie.removeMovieClip();
		    };
		
		    Bullet.prototype._checkOutStageArea = function () {
		        if ((-180 < this._movie.x && this._movie.x < 180) === false) {
		            if ((-240 < this._movie.x && this._movie.x < 240) === false) {
		                return true;
		            }
		        }
		        return false;
		    };
		
		    Bullet.prototype.hit = function () {
		        this._hitNum--;
		    };
		
		    Bullet.prototype.setVector = function (pVecX, pVecY) {
		        this._vecX = pVecX;
		        this._vecY = pVecY;
		    };
		
		    Bullet.prototype.moveTo = function (pX, pY) {
		        this._movie.x = pX;
		        this._movie.y = pY;
		    };
		
		    Bullet.prototype.getDeleteFlag = function () {
		        return this._deleteFlag;
		    };
		
		    Bullet.prototype.getX = function () {
		        return this._movie.x;
		    };
		
		    Bullet.prototype.getY = function () {
		        return this._movie.y;
		    };
		    return Bullet;
		})();
		/**
		* Created by musuka on 13/11/04.
		*/
		/// <reference path="../../Import.d.ts"/>
		var BulletManager = (function () {
		    function BulletManager(pAttachMovie) {
		        this._bullets = [];
		        this._attachNo = 0;
		        this._movie = pAttachMovie;
		    }
		    BulletManager.prototype.create = function (pBulletLinkage, pType) {
		        var bulletMovie = this._movie.attachMovie(pBulletLinkage, pBulletLinkage + this._attachNo);
		        this._attachNo++;
		        var bullet = new Bullet(bulletMovie, pType);
		        this._bullets.push(bullet);
		        return bullet;
		    };
		
		    BulletManager.prototype.createHitEffect = function (pHitEffectLinkage, pX, pY) {
		        var movie = this._movie.attachMovie(pHitEffectLinkage, pHitEffectLinkage + this._attachNo);
		        movie.moveTo(pX, pY);
		    };
		
		    BulletManager.prototype.update = function () {
		        var i;
		        var len = this._bullets.length;
		        for (i = 0; i < len; i++) {
		            this._bullets[i].update();
		            if (this._bullets[i].getDeleteFlag() === true) {
		                this._bullets[i].remove();
		                this._bullets.splice(i, 1);
		                i--;
		                len--;
		            }
		        }
		    };
		
		    BulletManager.prototype.getBullets = function () {
		        return this._bullets;
		    };
		    return BulletManager;
		})();
		/**
		* Created by musuka on 13/11/03.
		*/
		/// <reference path="Import.d.ts"/>
		var Main = (function () {
		    function Main(pRootMovie) {
		        Main.rootMovie = pRootMovie;
		        this.fitStageSize();
		
		        var game = new Game(pRootMovie["base"]);
		        game.init();
		    }
		    Main.prototype.fitStageSize = function () {
		        var stage = Main.rootMovie.lwf.stage;
		        Main.stageSize = Main.rootMovie.lwf.getStageSize();
		        Main.stageScale = 320 / Main.stageSize.width;
		    };
		    return Main;
		})();
		
		new Main(this);
	};

	Script.prototype["class_Enemy_0_2"] = function() {
			this.stop();
	};

	Script.prototype["class_HitEffect_7_1"] = function() {
			this.removeMovieClip();
	};

	Script.prototype["class_ShootWave_6_1"] = function() {
			this.removeMovieClip();
	};

	Script.prototype["elemMovie_enemyBreak_14_1"] = function() {
			this.parent.dispatchEvent("complete");
	};

	Script.prototype["elemMovie_rocketBurner_0_1"] = function() {
			this.blendMode = "add";
	};

	return Script;

	})();

	return new Script();
};
