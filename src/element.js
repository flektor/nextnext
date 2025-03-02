export function createElement(node) {
  if (typeof node === "string") {
    return document.createTextNode(node);
  }

  const { tag, children = [], attributes = {} } = node;
  const element = document.createElement(tag);

  for (const [key, value] of Object.entries(attributes)) {

    if (key.startsWith("on")) {
      element.setAttribute(key.toLowerCase(), `(${value})(event)`);

    } else if (key === "style") {
      try {
        const styleObject = JSON.parse(value);
        Object.assign(element.style, styleObject);
        console.log(element)
      } catch (error) {
        console.error("Invalid style JSON:", value);
      }
    } else {
      element.setAttribute(key, value);
    }
  }
  
  children.map(createElement).forEach(child => element.appendChild(child));
  return element;
}