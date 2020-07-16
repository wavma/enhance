import hotkeys from "./hotkeys.esm.js";

export default function(state, render, pbox) {
  hotkeys("command+=,command+-,command+0", (e, handler) => {
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
}
