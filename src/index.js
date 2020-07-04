import paramsInvalid from "./params-invalid.js";
import { disableDefault, drag, zoom } from "./events.js";

export default function(parent, options) {
  console.log("enhance");
  let opts = {};
  let pbox = {};
  const state = {
    scale: 1,
    element: null,
    xoff: 0,
    yoff: 0,
  };

  const init = () => {
    if (paramsInvalid(parent, options)) return;
    pbox = getBBox(parent);

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

    element();
    addEventListeners();
  };

  const scaleFactor = (scale) => {
    return Math.sqrt(scale) * 0.02;
  };

  const getBBox = (el) => {
    const box = el.getBoundingClientRect();

    return box;
    // return {
    //   x: parseFloat(element.getAttribute("x")),
    //   y: parseFloat(element.getAttribute("y")),
    //   width: parseFloat(element.getAttribute("width")),
    //   height: parseFloat(element.getAttribute("height")),
    // };
  };

  const setElementSize = (el) => {
    let x, y, width, height;
    ({ x, y, width, height } = getBBox(el));

    const deltaWidth = (pbox.width - opts.offset * 2) / width;
    const deltaHeight = (pbox.height - options.offset * 2) / height;

    if (deltaWidth < deltaHeight) {
      state.scale = deltaWidth;
      state.xoff = pbox.width - width * state.scale - opts.offset;
      state.yoff = (pbox.height - height * state.scale) / 2;
    } else {
      state.scale = deltaHeight;
      state.xoff = (pbox.width - width * state.scale) / 2;
      state.yoff = pbox.height - height * state.scale - opts.offset;
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

    addDragListeners();
    addZoomListeners();
  };

  const addDragListeners = () => {
    const dragger = drag(parent, state, render);

    parent.addEventListener("mousedown", dragger.start, false);
    parent.addEventListener("mousemove", dragger.move, false);
    parent.addEventListener("mouseup", dragger.end, false);
  };

  const addZoomListeners = () => {
    const zoomer = zoom(parent, state, render);
  };

  const render = () => {
    window.requestAnimationFrame(() => {
      state.element.style.transform = `translate3d(${state.xoff}px,${
        state.yoff
      }px,0px) scale(${state.scale})`;
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

  const scale = (factor) => {};

  init();
  return {
    element,
    scale,
  };
}
