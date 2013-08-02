function log(msg) {
	//console.log(msg);
}

function getChild(n, t) {
    for (var i = 0; i < n.childNodes.length; i++) {
        var c = n.childNodes[i];
        if (c.tagName == t) {
            return c;
        }
    }
    return null;
}

function BulletMLError(msg) {
    this.name = 'BulletMLError';
    this.message = msg;
    this.description = this.name + ': message ' + this.message;
}
BulletMLError.prototype = new Error;

function BulletMLState(bulletml, nodes, params) {
    this.bulletml = bulletml;
    this.nodes = nodes;
    this.params = params;
}

function BulletMLRunnerImpl(state, runner) {
    this.state = state;
    this.isEnd = false;
    this.actIndex = 0;
    this.act = this.state.nodes[0];
    this.actTurn = -1;
    this.runner = runner;
    this.repeatStack = [];
    this.refStack = [];
    this.bulletDir = null;
    this.bulletSpd = null;
    this.prevDir = 0;
    this.prevSpd = 0;

    this.dirChangeVal = 0;
    this.dirChangeCnt = 0;
    this.spdChangeVal = 0;
    this.spdChangeCnt = 0;
    this.accelXVal = 0;
    this.accelXCnt = 0;
    this.accelYVal = 0;
    this.accelYCnt = 0;
}

BulletMLRunnerImpl.prototype.getNumberContent = function(n) {
    var e = n.textContent;
    e = e.replace(/\$rank/g, this.runner.obj.getRank());
    for (var i = 0; i < this.state.params.length; i++) {
        var reg = new RegExp('\\$' + (i + 1), 'g');
        var p = '(' + this.state.params[i] + ')';
        e = e.replace(reg, p);
    }
    while (e.match(/\$rand/)) {
        e = e.replace(/\$rand/, Math.random());
    }
    if (e.match(/[^-()+*\/0-9\. \n\t]/)) {
        throw new BulletMLError('Invalid expr: ' + n.textContent +
                                ' (=> ' + e + ')');
    }
    return eval(e);
}

BulletMLRunnerImpl.prototype.isTurnEnd = function() {
    return this.isEnd || this.actTurn > this.endTurn;
};

BulletMLRunnerImpl.prototype.getDirection = function(n, type) {
    var d = this.getNumberContent(n);
    if (!type) type = n.getAttribute('type');
    if (!type || type == 'aim') {
        d += this.runner.obj.getAimDirection();
    }
    else if (type == 'absolute') {
        if (this.runner.isHorizontal) {
            d -= 90;
        }
    }
    else if (type == 'sequence') {
        d += this.prevDir;
    }
    else if (type == 'relative') {
        d += this.runner.obj.getBulletDirection();
    }
    return d;
};

BulletMLRunnerImpl.prototype.setDirection = function(n) {
    var n = getChild(n, 'direction');
    if (n) {
        this.bulletDir = this.getDirection(n);
    }
};

BulletMLRunnerImpl.prototype.getSpeed = function(n, type) {
    var v = this.getNumberContent(n);
    if (!type) type = n.getAttribute('type');
    if (!type || type == 'absolute') {
    }
    else if (type == 'sequence') {
        v += this.prevSpd;
    }
    else if (type == 'relative') {
        v += this.runner.obj.getBulletSpeed();
    }
    return v;
};

BulletMLRunnerImpl.prototype.setSpeed = function(n) {
    var n = getChild(n, 'speed');
    if (n) {
        this.bulletSpd = this.getSpeed(n);
        //log('speed: '+ v);
    }
};

BulletMLRunnerImpl.prototype.getNextNode = function(n) {
    if (n.parentNode.tagName == 'bulletml' ||
        n == this.state.nodes[this.actIndex-1]) {
        var top = this.refStack[this.refStack.length - 1];
        if (top) {
            n = top[0];
            this.state.params = top[1];
            this.refStack.pop();
        }
        else {
            ++this.actIndex;
            if (n == this.state.nodes[this.actIndex]) {
                return this.state.nodes[this.actIndex];
            }
            else {
                this.isEnd = true;
                log('bulletml finished');
                return null;
            }
        }
    }
    var nn = n.nextSibling;
    if (!nn) {
        n = n.parentNode;
        if (n.tagName == 'repeat') {
            var top = this.repeatStack[this.repeatStack.length - 1];
            if (top) {
                top[0]--;
                if (top[0] > 0) {
                    nn = top[1];
                    return nn;
                }
                else {
                    this.repeatStack.pop();
                }
            }
            else {
                throw new BulletMLRunnerImpl(
                    'internal error: repeatStack is empty');
            }
        }
        nn = this.getNextNode(n);
    }
    return nn;
};

BulletMLRunnerImpl.prototype.calcAccel = function(xy, n, term) {
    var val = this.getNumberContent(n);

    var type = n.getAttribute('type');
    if (type == 'sequence') {
    }
    else if (type == 'relative') {
        val += this.runner.obj['getBulletSpeed' + xy]();
        val /= term;
    }
    else {
        val /= term;
    }

    this['accel' + xy + 'Val'] = val;
    this['accel' + xy + 'Cnt'] = term;
};

BulletMLRunnerImpl.prototype.run = function() {
    if (this.dirChangeCnt > 0) {
        this.dirChangeCnt--;
        var d = this.runner.obj.getBulletDirection() + this.dirChangeVal;
        this.runner.obj.doChangeDirection(d);
    }
    if (this.spdChangeCnt > 0) {
        this.spdChangeCnt--;
        var v = this.runner.obj.getBulletSpeed() + this.spdChangeVal;
        this.runner.obj.doChangeSpeed(v);
        //log(v);
    }
    if (this.accelXCnt > 0) {
        this.accelXCnt--;
        var v = this.runner.obj.getBulletSpeedX() + this.accelXVal;
        this.runner.obj.doAccelX(v);
        //log(v);
    }
    if (this.accelYCnt > 0) {
        this.accelYCnt--;
        var v = this.runner.obj.getBulletSpeedY() + this.accelYVal;
        this.runner.obj.doAccelY(v);
        //log(v);
    }

    if (this.isEnd) return;

    this.endTurn = this.runner.obj.getTurn();

    if (this.actTurn == -1) {
        this.actTurn = this.runner.obj.getTurn();
    }

    var cnt = 0;
    while (this.act && !this.isTurnEnd()) {
        var n = this.act;
        var t = n.tagName;
        //if (t) log('cmd@' + timer.tick + ': ' + t);
        if (!t || t == 'speed' || t == 'direction') {
            this.act = n.nextSibling;
        }
        else if (t == 'action') {
            this.act = n.firstChild;
        }
        else if (t == 'fire') {
            this.bulletSpd = null;
            this.bulletDir = null;
            this.setDirection(n);
            this.setSpeed(n);
            this.act = n.firstChild;
        }
        else if (t == 'bullet') {
            this.setDirection(n);
            this.setSpeed(n);

            if (!this.bulletSpd) {
                this.bulletSpd = this.runner.obj.getDefaultSpeed();
            }
            if (!this.bulletDir) {
                this.bulletDir = this.runner.obj.getAimDirection();
            }

            var acts = [];
            var children = n.childNodes;
            for (var i = 0; i < children.length; i++) {
                var c = children[i];
                var t = c.tagName;
                if (t == 'action' || t == 'actionRef') {
                    acts.push(c);
                }
            }

            this.prevDir = this.bulletDir;
            this.prevSpd = this.bulletSpd;
            if (acts.length > 0) {
                var state = new BulletMLState(this.runner.bulletml,
                                              acts,
                                              this.state.params);
                this.runner.obj.createBullet(state,
                                             this.bulletDir, this.bulletSpd);
            }
            else {
                this.runner.obj.createSimpleBullet(this.bulletDir,
                                                   this.bulletSpd);
            }
            this.act = null;
        }
        else if (t.match(/^([a-z]+)Ref$/)) {
            var type = RegExp.$1;
            var map = this.state.bulletml[type];
            if (!map) {
                throw new BulletMLError('Undefined ref tag: ' + t);
            }

            this.refStack.push([n, this.state.params]);

            var params = [];
            var children = n.childNodes;
            for (var i = 0; i < children.length; i++) {
                var c = children[i];
                if (c.tagName == 'param') {
                    params.push(this.getNumberContent(c));
                    log('param: '+params.join(','));
                }
            }
            this.state.params = params;

            var label = n.getAttribute('label');
            n = map[label];
            if (!n) {
                throw new BulletMLError(
                    'Undefined ' + type + ' label: ' + label);
            }
            this.act = n;
        }
        else if (t == 'wait') {
            this.actTurn += this.getNumberContent(n);
            this.act = null;
        }
        else if (t == 'changeSpeed') {
            var termNode = getChild(n, 'term');
            if (!termNode) {
                throw new BulletMLError('changeSpeed must have term');
            }
            var term = this.getNumberContent(termNode);
            if (term < 1) term = 1;

            var spdNode = getChild(n, 'speed');
            if (!spdNode) {
                throw new BulletMLError('changeSpeed must have speed');
            }
            var type = spdNode.getAttribute('type');

            var spd;
            if (type == 'sequence') {
                spd = this.getNumberContent(spdNode);
            }
            else {
                var speed = this.getSpeed(spdNode, type);
                var spdFirst = this.runner.obj.getBulletSpeed();
                spd = (speed - spdFirst) / term;
                log('changeSpd2: ' + speed + ',' + spdFirst);
            }

            this.spdChangeCnt = term;
            this.spdChangeVal = spd;
            log('changeSpd: ' + this.spdChangeCnt + ',' + this.spdChangeVal);

            this.act = null;
        }
        else if (t == 'changeDirection') {
            var termNode = getChild(n, 'term');
            if (!termNode) {
                throw new BulletMLError('changeDirection must have term');
            }
            var term = this.getNumberContent(termNode);
            if (term < 1) term = 1;

            var dirNode = getChild(n, 'direction');
            if (!dirNode) {
                throw new BulletMLError('changeDirection must have direction');
            }
            var type = dirNode.getAttribute('type');

            var dir;
            if (type == 'sequence') {
                dir = this.getNumberContent(dirNode);
            }
            else {
                var direction = this.getDirection(dirNode, type);
                var dirFirst = this.runner.obj.getBulletDirection();

                // I didn't see this logic...
                var dirSpace;
                var dirSpace1 = direction - dirFirst;
                var dirSpace2;
                if (dirSpace1 > 0) dirSpace2 = dirSpace1 - 360;
                else dirSpace2 = dirSpace1 + 360;
                if (Math.abs(dirSpace1) < Math.abs(dirSpace2)) {
                    dirSpace = dirSpace1;
                }
                else {
                    dirSpace = dirSpace2;
                }

                dir = dirSpace / term;
            }

            this.dirChangeCnt = term;
            this.dirChangeVal = dir;
            log('changeDir: ' + this.dirChangeCnt + ',' + this.dirChangeVal);

            this.act = null;
        }
        else if (t == 'accel') {
            var termNode = getChild(n, 'term');
            if (!termNode) {
                throw new BulletMLError('accel must have term');
            }
            var term = this.getNumberContent(termNode);
            if (term < 1) term = 1;

            var hNode = getChild(n, 'horizontal');
            var vNode = getChild(n, 'vertical');

            if (this.runner.isHorizontal) {
                if (vNode) this.calcAccel('X', vNode, term);
                if (hNode) this.calcAccel('Y', hNode, term);
            }
            else {
                if (hNode) this.calcAccel('X', hNode, term);
                if (vNode) this.calcAccel('Y', vNode, term);
            }

            this.act = null;
        }
        else if (t == 'repeat') {
            var times = getChild(n, 'times');
            if (!times) {
                throw new BulletMLError('repeat must have times');
            }
            var t = this.getNumberContent(times);

            var actionNode = getChild(n, 'action');
            if (!actionNode) {
                actionNode = getChild(n, 'actionRef');
                if (!actionNode) {
                    throw new BulletMLError(
                        'repeat must have action or actionRef');
                }
            }

            this.repeatStack.push([t, actionNode]);
            this.act = actionNode;
        }
        else if (t == 'vanish') {
            this.act = null;
            this.isEnd = true;
            this.runner.obj.doVanish();
            break;
        }

        if (!this.act) {
            this.act = this.getNextNode(n);
        }

        cnt++;
        if (cnt > 10000) {
            throw new BulletMLError('10000 commands were executed in this frame');
        }
    }

    //this.isEnd = true;
};

function BulletMLRunner(bulletml, state) {
    this.bulletml = bulletml;

    this.isHorizontal = false;
    if (bulletml.getAttribute('type') == 'horizontal') {
        this.isHorizontal = true;
    }

    if (state) {
        this.impls = [new BulletMLRunnerImpl(state, this)];
    }
    else {
        var types = ['action', 'fire', 'bullet'];
        for (var j = 0; j < 3; j++) {
            var t = types[j];
            bulletml[t] = {};
            var nodes = bulletml.getElementsByTagName(t);
            for (var i = 0; i < nodes.length; i++) {
                var n = nodes[i];
                var label = n.getAttribute('label');
                if (label) {
                    bulletml[t][label] = n;
                }
            }
        }

        this.impls = new Array();
        for (var label in bulletml.action) {
            if (label.match(/^top/)) {
                var state = new BulletMLState(bulletml,
                                              [bulletml.action[label]],
                                              []);
                this.impls.push(new BulletMLRunnerImpl(state, this));
            }
        }

        log('Actions: ' + this.impls.length);
    }
}

BulletMLRunner.prototype.run = function() {
    for (var i = 0; i < this.impls.length; i++) {
        this.impls[i].run();
    }
};
