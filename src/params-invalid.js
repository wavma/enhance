export default function(parent, options) {
  if (!parent || !(parent instanceof Element)) {
    console.error(
      "You need to pass a parent element into enhance\n\n %cconst enhance = Enhance(%cparent%c, {element})",
      "color: white",
      "color: red",
      "color: white"
    );
    return true;
  }
  if (!options || !(options instanceof Object)) {
    console.error(
      "You need to pass an options object as the second argument into enhance\n\n %cconst enhance = Enhance(parent, %c{element}%c)",
      "color: white",
      "color: red",
      "color: white"
    );
    return true;
  }
  if (!options.element) {
    console.error(
      "You need to pass an element option into enhance\n\n %cconst enhance = Enhance(parent, %c{element}%c)",
      "color: white",
      "color: red",
      "color: white"
    );
    return true;
  }
  return false;
}
