![Image of Enhance](enhance.png)

# enhance

**enhance.js** is a library to provide zooming and panning features to any dom element. Influenced by vectors tools like Figma, Sketch, and Autocad, enhance works well with a trackpad (pinch-to-zoom) or a mouse (scrollwheel).

The name "enhance" comes from the [canonical Blade Runner scene](https://www.youtube.com/watch?v=hHwjceFcF2Q).

## Getting started

`npm i @wavma/enhance`

`yarn add @wavma/enhance`

```javascript
import Enhance from "wavma-enhance";

// enhance needs a parent element to scale within
const parent = document.querySelector(".parent");

// the element is the actual dom object you want to zoom or pan
const element = document.querySelector(".element");

const enhance = Enhance(parent, { element });
```

## Options

```javascript
Enhance(parent, {
  element: element, // DOM element to focus on
  scale: "contain", // "contain", "cover", or 0.5, 1, 2.5 (float)
  max: 50, // Maximum zoom scale
  min: 0.1, // Minimum zoom scale
  position: "50 50", // "0 0", "100 100"
  offsetX: 0, // default X offset on load and reset
  offsetY: 0, // default Y offset on load and reset
  keyboard: true, // enable keyboard shortcuts
  trackpad: true, // enable trackpad pinch-to-zoom and pan
  pan: false, // enable panning by holding down spacebar and dragging on canvas
  window: false, // enable zoom window selection
});
```

## Methods

### `enhance.element`

Use this method to allow users to upload new images (often svg) or click on different dom elements to reset the zoom.

```javascript
// Retrieves the current element
const element = enhance.element();

// Sets a new element and by default resets the zoom
// Pass a second argument "false" to keep current zoom
enhance.element(newElement);
```

### `enhance.scale`

Use this method to create an input for users to manual type in their scale (often easier to think in percentage 0-100%) or a dropdown (ala Google Docs, Photoshop, etc).

```javascript
// Retrieves the current scale
const scale = enhance.scale();

// Sets a new scale
enhance.scale(1);
```

### `enhance.disable`

Use this method to

```javascript
// Removes all the event listeners
enhance.disable();

// Restarts the event listeners
enhance.enable();
```
