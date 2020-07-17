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
  document.addEventListener("keydown", (e) => {
    if (e.code === "Space") {
      e.preventDefault();
    }
    if (e.code === "Space" && !pan) {
      setParentCursor(true);
      pan = true;
    }
  });
  document.addEventListener("keyup", (e) => {
    if (e.code === "Space" && pan) {
      e.preventDefault();
      setParentCursor(false);
      pan = false;
    }
  });
  return {start, end, move};
}

// src/zoom.js
function zoom_default(parent, state, render, pbox) {
  let focus = false;
  const SVG = () => {
    let svg2;
    const init = () => {
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
    return {init, destroy};
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
  document.addEventListener("keydown", (e) => {
    if (e.code === "KeyZ" && !focus) {
      setParentCursor(true);
      focus = true;
      svg.init();
    }
  });
  document.addEventListener("keyup", (e) => {
    if (e.code === "KeyZ" && focus) {
      setParentCursor(false);
      focus = false;
      svg.destroy();
    }
  });
}

// src/index.js
function src_default(options = {}) {
  console.log("enhance");
  let parent = null;
  let opts = {};
  let pbox = {};
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
  const init = (newParent) => {
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
    console.log(box);
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
    zoom_default(parent, state, render, pbox);
    addDragListeners();
  };
  const addDragListeners = () => {
    const dragger = drag_default(parent, state, render);
    parent.addEventListener("mousedown", dragger.start, false);
    parent.addEventListener("mousemove", dragger.move, false);
    parent.addEventListener("mouseup", dragger.end, false);
  };
  const render = () => {
    window.requestAnimationFrame(() => {
      state.element.style.transform = `translate3d(${state.xoff}px,${state.yoff}px,0px)
       scale(${state.scale})`;
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
  };
  setup();
  return {
    init,
    element,
    scale
  };
}
export {
  src_default as default
};
