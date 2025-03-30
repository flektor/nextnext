const logger = (enabled = true) => ({
  log: (...params) => enabled && console.log(...params)
})

function createElement(node, context, ref) {

  const runCode = (code) => eval(code.replace(/this\./g, "context."))

  // TODO FIX ? component as text node?
  if (node.type === "text" || node.type === "component") {
    const element = document.createTextNode(node.value);
    return element
  }

  node.effects && console.log({ withEFECTS: node })
  if (node.type === "reactive") {
    const { value, effects } = node


    const element = document.createTextNode(runCode(value, context));

    effect(() => element.textContent = runCode(value, context))
    // effects.map(effect => createEffect(effect, element, context)).forEach(runEffect => runEffect()); 

    return element
  }

  const { tag, children = [], props = {} } = node;
  const element = document.createElement(tag);

  // Iterate over props and handle them
  for (const [key, value] of Object.entries(props)) {
    if (key.startsWith("on")) {
      const eventType = key.slice(2).toLowerCase();
      element.addEventListener(eventType, value);
    } else if (key === "style") {
      try {
        const styleObject = JSON.parse(value);
        Object.assign(element.style, styleObject);
      } catch (error) {
        console.error("Invalid style JSON:", value);
      }
    } else if (key === 'ref') {
      // Attach the ref dynamically (this could be more complex depending on your needs)
      attachRef(ref, element);
    } else {
      element.setAttribute(key, value);
    }
  }

  // Handle children and append them, passing the context to child elements
  children.map(child => createElement(child, context, { current: null }, ref)).forEach(child => {
    try {
      element.appendChild(child);
    } catch (error) {
      console.error(error);
    }
  });

  return element;
}

function createEffect(effct, element, context) {
  return function () {
    effect(() => {
      try {
        console.log({ element })
        element.textContent = runCode(effct, context)
        // element.append(textNode, document.createElement('br'))
        // const result = new Function("{ context, element, effct }", `
        //   with (context) {
        //     console.log(count[0]())
        //     return effct
        //   }
        // `)({ context, element, effct });
      } catch (error) {
        console.error("Error in effect:", error);
      }
    });
  };
}