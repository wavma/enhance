// src/events.js
const disableDefault = (e) => {
  (e.ctrlKey || e.metaKey) && e.preventDefault();
};

// src/drag.js
function drag_default(parent, state, render) {
  let active = false;
  let pan = false;
  let currentX;
  let currentY;
  let initialX;
  let initialY;
  const start = (e) => {
    if (!pan)
      return;
    parent.style.cursor = "grabbing";
    initialX = e.clientX - state.xoff;
    initialY = e.clientY - state.yoff;
    active = true;
  };
  const end = (e) => {
    if (!pan)
      return;
    parent.style.cursor = "grab";
    initialX = currentX;
    initialY = currentY;
    active = false;
  };
  const move = (e) => {
    if (active && pan) {
      e.preventDefault();
      currentX = e.clientX - initialX;
      currentY = e.clientY - initialY;
      state.xoff = currentX;
      state.yoff = currentY;
      render();
    }
  };
  const setParentCursor = (panning) => {
    panning ? parent.style.cursor = "grab" : parent.style.cursor = "default";
  };
  const keydownHandler = (e) => {
    if (e.code === "Space") {
      e.preventDefault();
    }
    if (e.code === "Space" && !pan) {
      setParentCursor(true);
      pan = true;
    }
  };
  const keyupHandler = (e) => {
    if (e.code === "Space" && pan) {
      e.preventDefault();
      setParentCursor(false);
      pan = false;
    }
  };
  document.addEventListener("keydown", keydownHandler);
  document.addEventListener("keyup", keyupHandler);
  const unbind2 = () => {
    document.removeEventListener("keydown", keydownHandler);
    document.removeEventListener("keyup", keyupHandler);
  };
  return {start, end, move, unbind: unbind2};
}

// src/zoom.js
function zoom_default(parent, state, render, pbox) {
  let focus = false;
  const SVG = () => {
    let svg2;
    const init2 = () => {
      svg2 = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg2.style = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 10;
      `;
      parent.appendChild(svg2);
      addEventListeners();
    };
    const svgPoint = (elem, x, y) => {
      let p = svg2.createSVGPoint();
      p.x = x;
      p.y = y;
      return p.matrixTransform(elem.getScreenCTM().inverse());
    };
    const handleMouseDown = (event) => {
      const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      const start = svgPoint(svg2, event.clientX, event.clientY);
      const color = "#0018ed";
      const drawRect = (e) => {
        let p = svgPoint(svg2, e.clientX, e.clientY);
        let w = Math.abs(p.x - start.x);
        let h = Math.abs(p.y - start.y);
        if (p.x > start.x) {
          p.x = start.x;
        }
        if (p.y > start.y) {
          p.y = start.y;
        }
        rect.setAttributeNS(null, "x", Math.round(p.x));
        rect.setAttributeNS(null, "y", Math.round(p.y));
        rect.setAttributeNS(null, "width", Math.round(w));
        rect.setAttributeNS(null, "height", Math.round(h));
        rect.setAttributeNS(null, "fill", color);
        rect.setAttributeNS(null, "fill-opacity", "0.2");
        rect.setAttributeNS(null, "stroke", color);
        rect.setAttributeNS(null, "stroke-width", "0.75");
        svg2.appendChild(rect);
      };
      const endDraw = (e) => {
        const check = rect.getAttribute("width") > 0 && rect.getAttribute("height") > 0;
        if (check)
          transformZoomWindow(rect);
        svg2.removeEventListener("mousemove", drawRect);
        svg2.removeEventListener("mouseup", endDraw);
        svg2.remove();
      };
      svg2.addEventListener("mousemove", drawRect);
      svg2.addEventListener("mouseup", endDraw);
    };
    const addEventListeners = () => {
      svg2.addEventListener("mousedown", handleMouseDown);
    };
    const destroy = () => {
      svg2.removeEventListener("mousedown", handleMouseDown);
      svg2.remove();
    };
    return {init: init2, destroy};
  };
  let svg = SVG();
  const transformZoomWindow = (element) => {
    const el = element.cloneNode();
    const pointX = parseFloat(element.getAttribute("x"));
    const pointY = parseFloat(element.getAttribute("y"));
    const newX = (pointX - state.xoff) / state.scale;
    const newY = (pointY - state.yoff) / state.scale;
    const newW = parseFloat(element.getAttribute("width")) / state.scale;
    const newH = parseFloat(element.getAttribute("height")) / state.scale;
    el.setAttribute("x", newX);
    el.setAttribute("y", newY);
    el.setAttribute("width", newW);
    el.setAttribute("height", newH);
    setZoom({
      x: newX,
      y: newY,
      width: newW,
      height: newH
    });
  };
  const setZoom = (box = {}) => {
    const deltaWidth = pbox.width / box.width;
    const deltaHeight = pbox.height / box.height;
    if (deltaWidth < deltaHeight) {
      state.scale = deltaWidth;
      state.xoff = pbox.width - (box.width + box.x) * state.scale;
      state.yoff = pbox.height / 2 - (box.height + box.y) * state.scale + box.height / 2 * state.scale;
    } else {
      state.scale = deltaHeight;
      state.xoff = pbox.width / 2 - (box.width + box.x) * state.scale + box.width / 2 * state.scale;
      state.yoff = pbox.height - (box.height + box.y) * state.scale;
    }
    render();
  };
  const setParentCursor = (focusing) => {
    focusing ? parent.style.cursor = "zoom-in" : parent.style.cursor = "default";
  };
  const keyDown = (e) => {
    if (e.code === "KeyZ" && !focus) {
      setParentCursor(true);
      focus = true;
      svg.init();
    }
  };
  const keyUp = (e) => {
    if (e.code === "KeyZ" && focus) {
      setParentCursor(false);
      focus = false;
      svg.destroy();
    }
  };
  document.addEventListener("keydown", keyDown);
  document.addEventListener("keyup", keyUp);
  return {
    unbind: function() {
      document.removeEventListener("keydown", keyDown);
      document.removeEventListener("keyup", keyUp);
    }
  };
}

// node_modules/hotkeys-js/dist/hotkeys.esm.js
/*!
 * hotkeys-js v3.8.1
 * A simple micro-library for defining and dispatching keyboard shortcuts. It has no dependencies.
 * 
 * Copyright (c) 2020 kenny wong <wowohoo@qq.com>
 * http://jaywcjlove.github.io/hotkeys
 * 
 * Licensed under the MIT license.
 */
var isff = typeof navigator !== "undefined" ? navigator.userAgent.toLowerCase().indexOf("firefox") > 0 : false;
function addEvent(object, event, method) {
  if (object.addEventListener) {
    object.addEventListener(event, method, false);
  } else if (object.attachEvent) {
    object.attachEvent("on".concat(event), function() {
      method(window.event);
    });
  }
}
function getMods(modifier, key) {
  var mods = key.slice(0, key.length - 1);
  for (var i = 0; i < mods.length; i++) {
    mods[i] = modifier[mods[i].toLowerCase()];
  }
  return mods;
}
function getKeys(key) {
  if (typeof key !== "string")
    key = "";
  key = key.replace(/\s/g, "");
  var keys = key.split(",");
  var index = keys.lastIndexOf("");
  for (; index >= 0; ) {
    keys[index - 1] += ",";
    keys.splice(index, 1);
    index = keys.lastIndexOf("");
  }
  return keys;
}
function compareArray(a1, a2) {
  var arr1 = a1.length >= a2.length ? a1 : a2;
  var arr2 = a1.length >= a2.length ? a2 : a1;
  var isIndex = true;
  for (var i = 0; i < arr1.length; i++) {
    if (arr2.indexOf(arr1[i]) === -1)
      isIndex = false;
  }
  return isIndex;
}
var _keyMap = {
  backspace: 8,
  tab: 9,
  clear: 12,
  enter: 13,
  return: 13,
  esc: 27,
  escape: 27,
  space: 32,
  left: 37,
  up: 38,
  right: 39,
  down: 40,
  del: 46,
  delete: 46,
  ins: 45,
  insert: 45,
  home: 36,
  end: 35,
  pageup: 33,
  pagedown: 34,
  capslock: 20,
  "⇪": 20,
  ",": 188,
  ".": 190,
  "/": 191,
  "`": 192,
  "-": isff ? 173 : 189,
  "=": isff ? 61 : 187,
  ";": isff ? 59 : 186,
  "'": 222,
  "[": 219,
  "]": 221,
  "\\": 220
};
var _modifier = {
  "⇧": 16,
  shift: 16,
  "⌥": 18,
  alt: 18,
  option: 18,
  "⌃": 17,
  ctrl: 17,
  control: 17,
  "⌘": 91,
  cmd: 91,
  command: 91
};
var modifierMap = {
  16: "shiftKey",
  18: "altKey",
  17: "ctrlKey",
  91: "metaKey",
  shiftKey: 16,
  ctrlKey: 17,
  altKey: 18,
  metaKey: 91
};
var _mods = {
  16: false,
  18: false,
  17: false,
  91: false
};
var _handlers = {};
for (var k = 1; k < 20; k++) {
  _keyMap["f".concat(k)] = 111 + k;
}
var _downKeys = [];
var _scope = "all";
var elementHasBindEvent = [];
var code = function code2(x) {
  return _keyMap[x.toLowerCase()] || _modifier[x.toLowerCase()] || x.toUpperCase().charCodeAt(0);
};
function setScope(scope) {
  _scope = scope || "all";
}
function getScope() {
  return _scope || "all";
}
function getPressedKeyCodes() {
  return _downKeys.slice(0);
}
function filter(event) {
  var target = event.target || event.srcElement;
  var tagName = target.tagName;
  var flag = true;
  if (target.isContentEditable || (tagName === "INPUT" || tagName === "TEXTAREA" || tagName === "SELECT") && !target.readOnly) {
    flag = false;
  }
  return flag;
}
function isPressed(keyCode) {
  if (typeof keyCode === "string") {
    keyCode = code(keyCode);
  }
  return _downKeys.indexOf(keyCode) !== -1;
}
function deleteScope(scope, newScope) {
  var handlers;
  var i;
  if (!scope)
    scope = getScope();
  for (var key in _handlers) {
    if (Object.prototype.hasOwnProperty.call(_handlers, key)) {
      handlers = _handlers[key];
      for (i = 0; i < handlers.length; ) {
        if (handlers[i].scope === scope)
          handlers.splice(i, 1);
        else
          i++;
      }
    }
  }
  if (getScope() === scope)
    setScope(newScope || "all");
}
function clearModifier(event) {
  var key = event.keyCode || event.which || event.charCode;
  var i = _downKeys.indexOf(key);
  if (i >= 0) {
    _downKeys.splice(i, 1);
  }
  if (event.key && event.key.toLowerCase() === "meta") {
    _downKeys.splice(0, _downKeys.length);
  }
  if (key === 93 || key === 224)
    key = 91;
  if (key in _mods) {
    _mods[key] = false;
    for (var k2 in _modifier) {
      if (_modifier[k2] === key)
        hotkeys[k2] = false;
    }
  }
}
function unbind(keysInfo) {
  if (!keysInfo) {
    Object.keys(_handlers).forEach(function(key) {
      return delete _handlers[key];
    });
  } else if (Array.isArray(keysInfo)) {
    keysInfo.forEach(function(info) {
      if (info.key)
        eachUnbind(info);
    });
  } else if (typeof keysInfo === "object") {
    if (keysInfo.key)
      eachUnbind(keysInfo);
  } else if (typeof keysInfo === "string") {
    for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }
    var scope = args[0], method = args[1];
    if (typeof scope === "function") {
      method = scope;
      scope = "";
    }
    eachUnbind({
      key: keysInfo,
      scope,
      method,
      splitKey: "+"
    });
  }
}
var eachUnbind = function eachUnbind2(_ref) {
  var key = _ref.key, scope = _ref.scope, method = _ref.method, _ref$splitKey = _ref.splitKey, splitKey = _ref$splitKey === void 0 ? "+" : _ref$splitKey;
  var multipleKeys = getKeys(key);
  multipleKeys.forEach(function(originKey) {
    var unbindKeys = originKey.split(splitKey);
    var len = unbindKeys.length;
    var lastKey = unbindKeys[len - 1];
    var keyCode = lastKey === "*" ? "*" : code(lastKey);
    if (!_handlers[keyCode])
      return;
    if (!scope)
      scope = getScope();
    var mods = len > 1 ? getMods(_modifier, unbindKeys) : [];
    _handlers[keyCode] = _handlers[keyCode].map(function(record) {
      var isMatchingMethod = method ? record.method === method : true;
      if (isMatchingMethod && record.scope === scope && compareArray(record.mods, mods)) {
        return {};
      }
      return record;
    });
  });
};
function eventHandler(event, handler, scope) {
  var modifiersMatch;
  if (handler.scope === scope || handler.scope === "all") {
    modifiersMatch = handler.mods.length > 0;
    for (var y in _mods) {
      if (Object.prototype.hasOwnProperty.call(_mods, y)) {
        if (!_mods[y] && handler.mods.indexOf(+y) > -1 || _mods[y] && handler.mods.indexOf(+y) === -1) {
          modifiersMatch = false;
        }
      }
    }
    if (handler.mods.length === 0 && !_mods[16] && !_mods[18] && !_mods[17] && !_mods[91] || modifiersMatch || handler.shortcut === "*") {
      if (handler.method(event, handler) === false) {
        if (event.preventDefault)
          event.preventDefault();
        else
          event.returnValue = false;
        if (event.stopPropagation)
          event.stopPropagation();
        if (event.cancelBubble)
          event.cancelBubble = true;
      }
    }
  }
}
function dispatch(event) {
  var asterisk = _handlers["*"];
  var key = event.keyCode || event.which || event.charCode;
  if (!hotkeys.filter.call(this, event))
    return;
  if (key === 93 || key === 224)
    key = 91;
  if (_downKeys.indexOf(key) === -1 && key !== 229)
    _downKeys.push(key);
  ["ctrlKey", "altKey", "shiftKey", "metaKey"].forEach(function(keyName) {
    var keyNum = modifierMap[keyName];
    if (event[keyName] && _downKeys.indexOf(keyNum) === -1) {
      _downKeys.push(keyNum);
    } else if (!event[keyName] && _downKeys.indexOf(keyNum) > -1) {
      _downKeys.splice(_downKeys.indexOf(keyNum), 1);
    } else if (keyName === "metaKey" && event[keyName] && _downKeys.length === 3) {
      if (!(event.ctrlKey || event.shiftKey || event.altKey)) {
        _downKeys = _downKeys.slice(_downKeys.indexOf(keyNum));
      }
    }
  });
  if (key in _mods) {
    _mods[key] = true;
    for (var k2 in _modifier) {
      if (_modifier[k2] === key)
        hotkeys[k2] = true;
    }
    if (!asterisk)
      return;
  }
  for (var e in _mods) {
    if (Object.prototype.hasOwnProperty.call(_mods, e)) {
      _mods[e] = event[modifierMap[e]];
    }
  }
  if (event.getModifierState && !(event.altKey && !event.ctrlKey) && event.getModifierState("AltGraph")) {
    if (_downKeys.indexOf(17) === -1) {
      _downKeys.push(17);
    }
    if (_downKeys.indexOf(18) === -1) {
      _downKeys.push(18);
    }
    _mods[17] = true;
    _mods[18] = true;
  }
  var scope = getScope();
  if (asterisk) {
    for (var i = 0; i < asterisk.length; i++) {
      if (asterisk[i].scope === scope && (event.type === "keydown" && asterisk[i].keydown || event.type === "keyup" && asterisk[i].keyup)) {
        eventHandler(event, asterisk[i], scope);
      }
    }
  }
  if (!(key in _handlers))
    return;
  for (var _i = 0; _i < _handlers[key].length; _i++) {
    if (event.type === "keydown" && _handlers[key][_i].keydown || event.type === "keyup" && _handlers[key][_i].keyup) {
      if (_handlers[key][_i].key) {
        var record = _handlers[key][_i];
        var splitKey = record.splitKey;
        var keyShortcut = record.key.split(splitKey);
        var _downKeysCurrent = [];
        for (var a2 = 0; a2 < keyShortcut.length; a2++) {
          _downKeysCurrent.push(code(keyShortcut[a2]));
        }
        if (_downKeysCurrent.sort().join("") === _downKeys.sort().join("")) {
          eventHandler(event, record, scope);
        }
      }
    }
  }
}
function isElementBind(element) {
  return elementHasBindEvent.indexOf(element) > -1;
}
function hotkeys(key, option, method) {
  _downKeys = [];
  var keys = getKeys(key);
  var mods = [];
  var scope = "all";
  var element = document;
  var i = 0;
  var keyup = false;
  var keydown = true;
  var splitKey = "+";
  if (method === void 0 && typeof option === "function") {
    method = option;
  }
  if (Object.prototype.toString.call(option) === "[object Object]") {
    if (option.scope)
      scope = option.scope;
    if (option.element)
      element = option.element;
    if (option.keyup)
      keyup = option.keyup;
    if (option.keydown !== void 0)
      keydown = option.keydown;
    if (typeof option.splitKey === "string")
      splitKey = option.splitKey;
  }
  if (typeof option === "string")
    scope = option;
  for (; i < keys.length; i++) {
    key = keys[i].split(splitKey);
    mods = [];
    if (key.length > 1)
      mods = getMods(_modifier, key);
    key = key[key.length - 1];
    key = key === "*" ? "*" : code(key);
    if (!(key in _handlers))
      _handlers[key] = [];
    _handlers[key].push({
      keyup,
      keydown,
      scope,
      mods,
      shortcut: keys[i],
      method,
      key: keys[i],
      splitKey
    });
  }
  if (typeof element !== "undefined" && !isElementBind(element) && window) {
    elementHasBindEvent.push(element);
    addEvent(element, "keydown", function(e) {
      dispatch(e);
    });
    addEvent(window, "focus", function() {
      _downKeys = [];
    });
    addEvent(element, "keyup", function(e) {
      dispatch(e);
      clearModifier(e);
    });
  }
}
var _api = {
  setScope,
  getScope,
  deleteScope,
  getPressedKeyCodes,
  isPressed,
  filter,
  unbind
};
for (var a in _api) {
  if (Object.prototype.hasOwnProperty.call(_api, a)) {
    hotkeys[a] = _api[a];
  }
}
if (typeof window !== "undefined") {
  var _hotkeys = window.hotkeys;
  hotkeys.noConflict = function(deep) {
    if (deep && window.hotkeys === hotkeys) {
      window.hotkeys = _hotkeys;
    }
    return hotkeys;
  };
  window.hotkeys = hotkeys;
}
var hotkeys_esm_default = hotkeys;

// src/keyboard.js
function keyboard_default(state, render, pbox) {
  hotkeys_esm_default("command+=,command+-,command+0", (e, handler) => {
    e.preventDefault();
    const clientX = pbox.width / 2;
    const clientY = pbox.height / 2;
    const xs = (clientX - state.xoff) / state.scale;
    const ys = (clientY - state.yoff) / state.scale;
    switch (handler.key) {
      case "command+=":
        state.scale *= 1.25;
        break;
      case "command+-":
        state.scale /= 1.25;
        break;
      case "command+0":
        state.scale = 1;
        break;
    }
    if (handler.key === "command+0") {
      state.xoff = xPos;
      state.yoff = yPos;
    } else {
      state.xoff = clientX - xs * state.scale;
      state.yoff = clientY - ys * state.scale;
    }
    render();
    return false;
  });
  const unbind2 = () => {
    hotkeys_esm_default.unbind();
  };
  return {
    unbind: unbind2
  };
}

// src/index.js
function src_default(options = {}) {
  let parent = null;
  let opts = {};
  let pbox = {};
  let shortcuts = null;
  let zoomcuts = null;
  let dragger = null;
  const state = {
    scale: 1,
    element: null,
    xoff: 0,
    yoff: 0
  };
  const setup = () => {
    const defaults = {
      scale: "contain",
      max: 50,
      min: 0.1,
      position: "50 50",
      offset: 0,
      keyboard: true,
      trackpad: true,
      pan: false,
      window: false
    };
    opts = Object.assign(defaults, options);
    if (options.parent)
      init(options.parent);
    if (options.element)
      element();
  };
  const enable = (newParent) => {
    parent = newParent;
    pbox = getBBox(newParent);
    if (options.element)
      element();
    addEventListeners();
  };
  const scaleFactor = (scale2) => {
    return Math.sqrt(scale2) * 0.02;
  };
  const getBBox = (el) => {
    if (el instanceof SVGElement) {
      return {
        x: parseFloat(el.getAttribute("x")) || 0,
        y: parseFloat(el.getAttribute("y")) || 0,
        width: parseFloat(el.getAttribute("width")),
        height: parseFloat(el.getAttribute("height"))
      };
    }
    return el.getBoundingClientRect();
  };
  const setElementSize = (el) => {
    let x, y, width, height;
    ({x, y, width, height} = getBBox(el));
    setSize({x, y, width, height});
  };
  const setSize = (box = {}) => {
    const deltaWidth = (pbox.width - opts.offset * 2) / box.width;
    const deltaHeight = (pbox.height - options.offset * 2) / box.height;
    if (deltaWidth < deltaHeight) {
      state.scale = deltaWidth;
      state.xoff = pbox.width - (box.width - box.x) * state.scale - opts.offset;
      state.yoff = (pbox.height - box.height * state.scale) / 2;
    } else {
      state.scale = deltaHeight;
      state.xoff = (pbox.width - box.width * state.scale) / 2;
      state.yoff = pbox.height - box.height * state.scale - opts.offset;
    }
    render();
  };
  const touchPanZoom = (e) => {
    e.preventDefault();
    if (e.ctrlKey || e.metaKey) {
      const xs = (e.clientX - pbox.x - state.xoff) / state.scale;
      const ys = (e.clientY - pbox.y - state.yoff) / state.scale;
      state.scale -= e.deltaY * scaleFactor(state.scale);
      state.scale = Math.min(Math.max(state.scale, opts.min), opts.max);
      state.xoff = e.clientX - pbox.x - xs * state.scale;
      state.yoff = e.clientY - pbox.y - ys * state.scale;
    } else {
      state.xoff -= e.deltaX;
      state.yoff -= e.deltaY;
    }
    render();
  };
  const addEventListeners = () => {
    window.addEventListener("wheel", disableDefault, {passive: false});
    parent.addEventListener("wheel", touchPanZoom, {passive: false});
    shortcuts = keyboard_default(state, render, pbox);
    zoomcuts = zoom_default(parent, state, render, pbox);
    addDragListeners();
  };
  const removeEventListeners = () => {
    window.removeEventListener("wheel", disableDefault);
    parent.removeEventListener("wheel", touchPanZoom);
    shortcuts.unbind();
    zoomcuts.unbind();
    removeDragListeners();
  };
  const addDragListeners = () => {
    dragger = drag_default(parent, state, render);
    parent.addEventListener("mousedown", dragger.start, false);
    parent.addEventListener("mousemove", dragger.move, false);
    parent.addEventListener("mouseup", dragger.end, false);
  };
  const removeDragListeners = () => {
    dragger.unbind();
    parent.removeEventListener("mousedown", dragger.start);
    parent.removeEventListener("mousemove", dragger.move);
    parent.removeEventListener("mouseup", dragger.end);
  };
  const render = () => {
    window.requestAnimationFrame(() => {
      state.element.style.transform = `translate3d(${state.xoff}px,${state.yoff}px,0px)
       scale(${state.scale})`;
      if (state.scale && opts.track) {
        if (opts.trackRound === "simple")
          opts.track.innerText = Number(state.scale.toFixed(1));
        else if (opts.trackRound === "percent")
          opts.track.innerText = `${Number((state.scale * 100).toFixed(0))}%`;
      }
    });
  };
  const element = (el, reset) => {
    if (!el)
      el = opts.element;
    state.element = el;
    if (!reset) {
      setElementSize(el);
    }
  };
  const scale = (factor) => {
    if (!factor)
      return state.scale;
  };
  const disable = () => {
    removeEventListeners();
    state.element.style.transform = "";
    if (opts.track)
      opts.track.innerText = "";
  };
  setup();
  return {
    enable,
    element,
    scale,
    disable
  };
}
export {
  src_default as default
};
