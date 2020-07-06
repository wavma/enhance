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

  document.addEventListener("keydown", (e) => {
    if (e.code === "Space" && !pan) {
      setParentCursor(true);
      pan = true;
    }
  });

  document.addEventListener("keyup", (e) => {
    if (e.code === "Space" && pan) {
      setParentCursor(false);
      pan = false;
    }
  });

  return { start, end, move };
}
