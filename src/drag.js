export default function(parent, state, render) {
  let active = false;
  let pan = false;
  let currentX;
  let currentY;
  let initialX;
  let initialY;

  const start = (e) => {
    if (!pan) return;
    parent.style.cursor = "grabbing";
    initialX = e.clientX - state.xoff;
    initialY = e.clientY - state.yoff;

    active = true;
  };

  const end = (e) => {
    if (!pan) return;
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
    panning
      ? (parent.style.cursor = "grab")
      : (parent.style.cursor = "default");
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

  const unbind = () => {
    document.removeEventListener("keydown", keydownHandler);
    document.removeEventListener("keyup", keyupHandler);
  }

  return { start, end, move, unbind };
}
