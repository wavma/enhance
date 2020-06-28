![Image of Enhance](enhance.png)

# enhance

**enhance.js** is a library to provide zooming and panning features to any dom element. Influenced by vectors tools like Figma, Sketch, and Autocad, enhance works well with a trackpad (pinch-to-zoom) or a mouse (scrollwheel).

The name "enhance" comes from the [canonical Blade Runner scene](https://www.youtube.com/watch?v=hHwjceFcF2Q).

## Getting started

`npm i wavma-enhance`

`yarn add wavma-enhance`

```javascript
import enhance from "wavma-enhance";

const canvas = document.querySelector('.canvas');
const element = document.querySelector('.object');

enhance(canvas, { element });
```

## Options

```javascript
enhance(canvas, { 
  element: element,   // DOM element to focus on
  size: "contain",    // "contain", "cover", or "50", "100", "200" (percent)
  position: "50 50",  // "0 0", "100 100" 
  offsetX: 0,         // default X offset on load and reset
  offsetY: 0,         // default Y offset on load and reset
  keyboard: true,     // enable keyboard shortcuts
  trackpad: true,     // enable trackpad pinch-to-zoom and pan
  pan: false,         // enable panning by holding down spacebar and dragging on canvas
  window: false,      // enable zoom window selection
});
```
