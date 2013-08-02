#
# Copyright (C) 2013 GREE, Inc.
#
# This software is provided 'as-is', without any express or implied
# warranty.  In no event will the authors be held liable for any damages
# arising from the use of this software.
#
# Permission is granted to anyone to use this software for any purpose,
# including commercial applications, and to alter it and redistribute it
# freely, subject to the following restrictions:
#
# 1. The origin of this software must not be misrepresented; you must not
#    claim that you wrote the original software. If you use this software
#    in a product, an acknowledgment in the product documentation would be
#    appreciated but is not required.
# 2. Altered source versions must be plainly marked as such, and must not be
#    misrepresented as being the original software.
# 3. This notice may not be removed or altered from any source distribution.
#

unless window.requestAnimationFrame?
  for vendor in ['webkit', 'moz']
    window.requestAnimationFrame = window[vendor+'RequestAnimationFrame']
    break if window.requestAnimationFrame?
unless window.requestAnimationFrame?
  lastTime = 0
  window.requestAnimationFrame = (callback, element) ->
    currTime = new Date().getTime()
    lastTime = currTime if lastTime is 0
    timeToCall = Math.max(0, 16 - (currTime - lastTime))
    timeoutCallback = ->
      callback(currTime + timeToCall)
    id = window.setTimeout(timeoutCallback, timeToCall)
    lastTime = currTime + timeToCall
    return id

game = null
keyState = []
timer = {}

class Obj
  constructor:(@x, @y, @d, @v, name) ->
    @alive = true
    @bitmap = null
    @x0 = @sx0 = 0
    @y0 = @sy0 = 0
    @x1 = @sx1 = game.width
    @y1 = @sy1 = game.height
    @attachBitmap(name) if name

  attachBitmap:(name) ->
    @bitmap = game.attachBitmap(name)
    @bitmap.regX = @bitmap.width / 2
    @bitmap.regY = @bitmap.height / 2
    @x0 += @bitmap.regX
    @y0 += @bitmap.regY
    @x1 -= @bitmap.regX
    @y1 -= @bitmap.regY
    @sx0 -= @bitmap.regX
    @sy0 -= @bitmap.regY
    @sx1 += @bitmap.regX
    @sy1 += @bitmap.regY
    return

  move: ->
    return

  draw: ->
    if @bitmap
      @bitmap.x = @x
      @bitmap.y = @y
    return

  ensureBounded: ->
    if @x < @x0
      @x = @x0
    else if @x > @x1
      @x = @x1
    if @y < @y0
      @y = @y0
    else if @y > @y1
      @y = @y1
    return

  checkBounded: ->
    if @x < @sx0 or @x > @sx1 or @y < @sy0 or @y > @sy1
      @doVanish()
    return

  doVanish: ->
    @alive = false
    game.detachBitmap(@bitmap)
    @bitmap = null
    return

class Shot extends Obj
  constructor:(x, y, d, v, name = 'w') ->
    super(x, y, d, v, name)

  move: ->
    r = Math.PI * @d / 180
    @x += Math.sin(r) * @v
    @y -= Math.cos(r) * @v
    @checkBounded()
    return

class Player extends Obj
  constructor: ->
    super(game.width / 2, 350, 0, 0, 'r')

  move: ->
    v = if keyState[90] then 1 else 2
    d = -1
    if keyState[38]
      if keyState[39]
        d = 45
      else if keyState[37]
        d = -45
      else
        d = 0
    else if keyState[40]
      if keyState[39]
        d = 135
      else if keyState[37]
        d = -135
      else
        d = 180
    else if keyState[39]
      d = 90
    else if keyState[37]
      d = -90

    if d isnt -1
      r = Math.PI * d / 180
      @x += Math.sin(r) * v
      @y -= Math.cos(r) * v
      @ensureBounded()
    return

class Enemy extends Obj
  constructor:(@runner, x, y, d, v, name) ->
    super(x, y, d, v, name)
    @isBoss = name is 'g'
    @runner.obj = @

  move: ->
    return unless @alive

    @runner.run()
    r = Math.PI * @d / 180
    @x += Math.sin(r) * @v
    @y += -Math.cos(r) * @v

    if @isBoss
      @ensureBounded()
    else
      @checkBounded()
    return

  getRank: ->
    return 0

  getTurn: ->
    return timer.tick

  getDefaultSpeed: ->
    return 1

  getAimDirection: ->
    dx = game.player.x - @x
    dy = game.player.y - @y
    return Math.atan2(dx, -dy) * 180 / Math.PI

  getBulletSpeedX: ->
    r = Math.PI * @d / 180
    return Math.sin(r) * @v

  getBulletSpeedY: ->
    r = Math.PI * @d / 180
    return -Math.cos(r) * @v

  getBulletDirection: ->
    return @d

  getBulletSpeed: ->
    return @v

  createSimpleBullet:(d, v) ->
    shot = new Shot(@x, @y, d, v)
    game.objs.push(shot)
    return

  createBullet:(state, d, v) ->
    runner = new BulletMLRunner(state.bulletml, state)
    hasFire = (state.nodes[0].getElementsByTagName('fire') or
      state.nodes[0].getElementsByTagName('fireRef'))
    color = hasFire ? 'wg' : 'wr'
    shot = new Enemy(runner, @x, @y, d, v, color, false)
    objs.push(shot)
    return

  doChangeDirection:(@d) ->
    return

  doChangeSpeed:(@v) ->
    return

  doAccelX:(vx) ->
    vy = @getBulletSpeedY()
    @v = Math.sqrt(vx * vx + vy * vy)
    @d = Math.atan2(vx, -vy) * 180 / Math.PI
    return

  doAccelY:(vy) ->
    vx = this.getBulletSpeedX()
    @v = Math.sqrt(vx * vx + vy * vy)
    @d = Math.atan2(vx, -vy) * 180 / Math.PI
    return

class Game
  constructor:(@touchDelegate, @stage, stats, @width, @height, @xml) ->
    @requests = []

    @stats = new Stats()
    stats.appendChild(@stats.domElement)

    LWF.useWebGLRenderer()
    #LWF.useCanvasRenderer()

  requestLWF:(lwfName, onload) ->
    if lwfName.match(/(.*\/)([^\/]+)/)
      prefix = RegExp.$1
      lwfName = RegExp.$2
    else
      prefix = ""

    @requests.push({
      lwf:lwfName,
      prefix:prefix,
      stage:@stage,
      onload:onload,
    })
    return

  loadLWFs:(onloadall) ->
    LWF.ResourceCache.get().loadLWFs(@requests, onloadall)
    @requests = []
    return

  load:(lwfName) ->
    @requestLWF(lwfName, (lwf) => @lwf = lwf)
    @loadLWFs((errors) => @init() unless errors?)
    return

  attachBitmap:(name) ->
    path = "ball_#{name}.png"
    cache = @bitmapCache[name]
    if cache?.length > 0
      bitmap = cache.pop()
      bitmap.visible = true
    else
      bitmap = @world.attachBitmap(path, @bitmapCount++)
    return bitmap

  detachBitmap:(bitmap) ->
    bitmap.visible = false
    @bitmapCache[bitmap.name] ?= []
    @bitmapCache[bitmap.name].push(bitmap)
    return

  getTime: ->
    return Date.now() / 1000.0

  inputPoint:(e) ->
    x = e.clientX + document.body.scrollLeft +
      document.documentElement.scrollLeft - @stage.offsetLeft
    y = e.clientY + document.body.scrollTop +
      document.documentElement.scrollTop - @stage.offsetTop
    @lwf.inputPoint(x, y)
    return

  inputPress:(e) ->
    @inputPoint(e)
    @lwf.inputPress()
    return

  inputRelease:(e) ->
    @inputPoint(e)
    @lwf.inputRelease()
    return

  onmove:(e) =>
    do (e) =>
      @inputQueue.push(() => @inputPoint(e))
      return
    return
  onpress:(e) =>
    do (e) =>
      @inputQueue.push(() => @inputPress(e))
      return
    return
  onrelease:(e) =>
    do (e) =>
      @inputQueue.push(() => @inputRelease(e))
      return
    return

  init: ->
    @inputQueue = []
    @lwf.rendererFactory.fitForHeight(@lwf)
    @from = @getTime()

    timer.tick = 0

    @world = @lwf.rootMovie.attachEmptyMovie("world")
    @bitmapCache = {}
    @bitmapCount = 0

    @objs = []

    @player = new Player
    @objs.push(@player)

    @runner = new BulletMLRunner(@xml)
    enemy = new Enemy(@runner, @width / 2, 100, 0, 0, 'g')
    @objs.push(enemy)

    @exec()

    ###
    @touchDelegate.addEventListener("mousedown", @onpress, false)
    @touchDelegate.addEventListener("mousemove", @onmove, false)
    @touchDelegate.addEventListener("mouseup", @onrelease, false)
    @touchDelegate.addEventListener("touchstart", @onpress, false)
    @touchDelegate.addEventListener("touchmove", @onmove, false)
    @touchDelegate.addEventListener("touchend", @onrelease, false)
    ###
    return

  exec: ->
    ++timer.tick
    time = @getTime()
    tick = time - @from
    @from = time
    input() for input in @inputQueue
    @inputQueue = []

    for obj in @objs
      obj.move() if obj.alive

    if timer.tick % 20 is 0
      nobjs = []
      nobjs.push(obj) for obj in @objs
      @objs = nobjs

    for obj in @objs
      obj.draw() if obj.alive

    @lwf.exec(tick)
    @lwf.render()

    @stats.update()

    requestAnimationFrame(=> @exec())
    return

window.onload = ->
  div = document.getElementById("touchDelegate")
  stage = document.getElementById("stage")
  stats = document.getElementById("stats")
  w = stage.width
  h = stage.height
  stage.style.width = stage.width + "px"
  stage.style.height = stage.height + "px"
  stage.width *= window.devicePixelRatio
  stage.height *= window.devicePixelRatio

  src = "test.xml"
  xhr = new XMLHttpRequest()
  xhr.onreadystatechange = ->
    if xhr.readyState is 4
      unless xhr.responseXML?
        throw new Error("#{xhr.status}:#{src}")
      else
        xml = xhr.responseXML.getElementsByTagName('bulletml')[0]
        game = new Game(div, stage, stats, w, h, xml)
        game.load("game.lwf")
        window.game = game
  xhr.open('GET', src, true)
  if (xhr.overrideMimeType)
    xhr.overrideMimeType("application/xml")
  xhr.send(null)
  return

document.onkeydown = (ev) ->
  keyState[ev.keyCode] = 1 if ev?

document.onkeyup = (ev) ->
  return unless ev
  keyState[ev.keyCode] = 0 if ev?

