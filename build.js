#!/usr/bin/env node
const { build } = require("estrella");
build({
  entry: "src/index.js",
  outfile: "dist/enhance.js",
  bundle: true,
});
