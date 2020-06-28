# enhance

enhance.js is a library to provide zooming and panning features to any dom element. Influenced by vectors tools like Figma, Sketch, and Autocad enhance works well with a trackpad (pin-to-zoom) or a mouse (scrollwheel).

## Getting started

`npm i wavma-enhance`

`yarn add wavma-enhance`

```javascript
import enhance from "wavma-enhance"

const canvas = document.querySelector('.canvas');
const element = document.querySelector('.object');

enhance(canvas, { element });
```

## Options

```javascript
enhance(canvas, { 
  element: element, // DOM element to focus on
  init: "fit", // "fit", "fill", "full" or "100" (percent)
  offsetX: 0, // default X offset on load and reset
  offsetY: 0, // default Y offset on load and reset
  keyboard: true, // enable keyboard shortcuts
  trackpad: true, // enable trackpad pinch-to-zoom and pan
  pan: false, // enable panning by holding down spacebar and dragging on canvas
  window: false, // enable zoom window selection
});
```
