import { disableDefault } from "./events.js";
import drag from "./drag.js";
import zoom from "./zoom.js";
import keyboard from "./keyboard.js";

export default function(options = {}) {
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
    yoff: 0,
  };

  const setup = () => {
    const defaults = {
      scale: "contain", // "contain", "cover", or 0.5, 1, 2.5 (float)
      max: 50, // Maximum zoom scale, Firefox struggles past 5.
      min: 0.1, // Minimum zoom scale
      position: "50 50", // "0 0", "100 100"
      offset: 0, // default X, Y offset on load and reset
      keyboard: true, // enable keyboard shortcuts
      trackpad: true, // enable trackpad pinch-to-zoom and pan
      pan: false, // enable panning by holding down spacebar and dragging on canvas
      window: false, // enable zoom window selection
    };
    opts = Object.assign(defaults, options);

    if (options.parent) init(options.parent);
    if (options.element) element();
  };

  const enable = (newParent) => {
    parent = newParent;
    pbox = getBBox(newParent);

    if (options.element) element();
    addEventListeners();
  };

  const scaleFactor = (scale) => {
    return Math.sqrt(scale) * 0.02;
  };

  const getBBox = (el) => {
    if (el instanceof SVGElement) {
      return {
        x: parseFloat(el.getAttribute("x")) || 0,
        y: parseFloat(el.getAttribute("y")) || 0,
        width: parseFloat(el.getAttribute("width")),
        height: parseFloat(el.getAttribute("height")),
      };
    }
    return el.getBoundingClientRect();
  };

  const setElementSize = (el) => {
    let x, y, width, height;
    ({ x, y, width, height } = getBBox(el));
    setSize({ x, y, width, height });
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
    window.addEventListener("wheel", disableDefault, { passive: false });
    parent.addEventListener("wheel", touchPanZoom, { passive: false });

    shortcuts = keyboard(state, render, pbox);
    zoomcuts = zoom(parent, state, render, pbox);
    addDragListeners();
  };

  const removeEventListeners = () => {
    window.removeEventListener("wheel", disableDefault);
    parent.removeEventListener("wheel", touchPanZoom);
    shortcuts.unbind();
    zoomcuts.unbind();
    removeDragListeners();
  }

  const addDragListeners = () => {
    dragger = drag(parent, state, render);

    parent.addEventListener("mousedown", dragger.start, false);
    parent.addEventListener("mousemove", dragger.move, false);
    parent.addEventListener("mouseup", dragger.end, false);
  };

  const removeDragListeners = () => {
    dragger.unbind();

    parent.removeEventListener("mousedown", dragger.start);
    parent.removeEventListener("mousemove", dragger.move);
    parent.removeEventListener("mouseup", dragger.end);
  }

  const render = () => {
    window.requestAnimationFrame(() => {
      state.element.style.transform = `translate3d(${state.xoff}px,${
        state.yoff
      }px,0px)
       scale(${state.scale})`;
       if (state.scale && opts.track) {
         if (opts.trackRound === 'simple') opts.track.innerText = Number((state.scale).toFixed(1));
         else if (opts.trackRound === 'percent') opts.track.innerText = `${Number((state.scale * 100).toFixed(0))}%`;
       }
    });
  };

  // -------------------------------------------
  // Public methods
  // -------------------------------------------
  const element = (el, reset) => {
    if (!el) el = opts.element;
    state.element = el;

    if (!reset) {
      setElementSize(el);
    }
  };

  const scale = (factor) => {
    if (!factor) return state.scale;
  };

  const disable = () => {
    removeEventListeners();
    state.element.style.transform = '';
  }

  setup();
  return {
    enable,
    element,
    scale,
    disable
  };
}
