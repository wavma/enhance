# enhance

enhance.js is a library to provide zooming and panning features to any dom element. Influenced by vectors tools like Figma, Sketch, and Autocad enhance works well with a trackpad (pin-to-zoom) or a mouse (scrollwheel).

## Getting started

`npm i wavma-enhance`

`yarn add wavma-enhance`

```
import enhance from "wavma-enhance"

const canvas = document.querySelector('.canvas');
const element = document.querySelector('.object');

ehance(canvas, { element });
```
