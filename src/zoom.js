export default function(parent, state, render) {
  let focus = false;

  const SVG = () => {
    let svg;

    const init = () => {
      svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.style = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 10;
      `;
      parent.appendChild(svg);
      addEventListeners();
    };

    const svgPoint = (elem, x, y) => {
      let p = svg.createSVGPoint();
      p.x = x;
      p.y = y;
      return p.matrixTransform(elem.getScreenCTM().inverse());
    };
    const addEventListeners = () => {
      svg.addEventListener("mousedown", (event) => {
        const rect = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "rect"
        );

        const start = svgPoint(svg, event.clientX, event.clientY);
        const color = "#0018ed";

        const drawRect = (e) => {
          let p = svgPoint(svg, e.clientX, e.clientY);
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

          svg.appendChild(rect);
        };

        const endDraw = (e) => {
          const temp =
            rect.getAttribute("width") > 0 && rect.getAttribute("height") > 0;

          if (temp) {
            // zoom.element(rect);
            rect.remove();
          }

          svg.removeEventListener("mousemove", drawRect);
          svg.removeEventListener("mouseup", endDraw);
        };

        svg.addEventListener("mousemove", drawRect);
        svg.addEventListener("mouseup", endDraw);
      });
    };
    const remove = () => {
      svg.remove();
    };

    return { init, remove };
  };
  let svg = SVG();

  const setParentCursor = (focusing) => {
    focusing
      ? (parent.style.cursor = "zoom-in")
      : (parent.style.cursor = "default");
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
      svg.remove();
    }
  });
}
