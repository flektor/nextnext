type Attribute = { name: string; value: string | null };

// Parses attributes from JSX
function parseAttributes(attrString: string): string[] {
  const attributes: string[] = [];
  const attrRegex = /([a-zA-Z0-9-]+)=\{?(.*?)\}?/g;
  let match;

  while ((match = attrRegex.exec(attrString)) !== null) {
    let [, name, value] = match;
    value = value.trim();

    if (name.startsWith("on")) {
      attributes.push(`elem.${name.toLowerCase()} = ${value};`); // Event listener
    } else {
      attributes.push(`elem.setAttribute("${name}", "${value}");`); // Regular attribute
    }
  }

  return attributes;
}

// Recursively parses JSX into JavaScript DOM creation code
export function parseJSX(jsxString: string): string {
  jsxString = jsxString.replace(/<([a-zA-Z0-9]+)([^>]*)\/>/g, "<$1$2></$1>"); // Convert self-closing tags

  return jsxString.replace(
    /<([a-zA-Z0-9]+)([^>]*)>(.*?)<\/\1>/gs,
    (match: string, tag: string, attrs: string, content: string) => {
      const attributes = parseAttributes(attrs).join("\n    ");

      // Split content into individual elements and text nodes
      const children = content
        .split(/(?=<[a-zA-Z])/g)
        .map(child =>
          child.trim().startsWith("<") ? parseJSX(child.trim()) : `document.createTextNode("${child.trim()}")`
        )
        .filter(Boolean) // Remove empty strings
        .join(",\n    ");

      return `(() => {
    const elem = document.createElement("${tag}");
    ${attributes}
    ${children ? `elem.append(${children});` : ""}
    return elem;
  })()`;
    }
  );
}

// Example JavaScript function
const onClick = () => console.log("Button clicked!");

// Example JSX-like input
const jsxCode = `<div class="container">
  <h1>Hello, World!</h1>
  <p>
    This is a <strong>nested</strong> example.
    <span style="color: red;">Deep inside</span>
    <button onClick={onClick}>Click Me</button>
  </p>
</div>`;

// Generate JavaScript code
const generatedJS: string = parseJSX(jsxCode);

console.log(generatedJS);

// export function parseJSX(jsxString:string) {
//   // Convert self-closing tags into full opening/closing form
//   jsxString = jsxString.replace(/<([a-zA-Z0-9]+)([^>]*)\/>/g, "<$1$2></$1>");

//   // Recursively parse JSX-like syntax
//   const template = document.createElement("template");
//   template.innerHTML = jsxString.trim();

//   function createElement(node:any) {
//     if (node.nodeType === 3) {
//       // If it's a text node, return it as-is
//       return document.createTextNode(node.nodeValue);
//     }

//     const element = document.createElement(node.nodeName.toLowerCase());

//     // Copy attributes
//     for (const attr of node.attributes) {
//       element.setAttribute(attr.name, attr.value);
//     }

//     // Recursively process child nodes
//     for (const child of node.childNodes) {
//       element.appendChild(createElement(child));
//     }

//     return element;
//   }

//   return createElement(template.content.firstChild);
// }

// // Example JSX-like input
// const jsxCode = `<div class="container">
//   <h1>Hello, World!</h1>
//   <button onclick="alert('Clicked!')">Click Me</button>
// </div>`;

// Parse and append the result to the page
// document.body.appendChild(parseJSX(jsxCode));


// function wrap(fn: (props:any)=> void) {
//   console.log(fn.arguments)
//     return `() => ${fn}(${fn})`;
// }

// export function parseJSX(jsxString: string) : HTMLElement | string | null {
//   if(jsxString==='undefined') return ''
   
//   return jsxString.replace(/<([a-zA-Z0-9]+)(.*?)>(.*?)<\/\1>/gs, (match, tag, attrs, content) => {

//     const element = `document.createElement('${tag}')`;
    
//     const attributes = attrs.trim().match(/([a-zA-Z0-9-]+)="(.*?)"/g) || [];
//     const attrAssignments = attributes.map((attr:string)  => {
//       const [key, value] = attr.split('=');
//       return `${element}.setAttribute('${key.trim()}', "${value.replace(/"/g, '').trim()}");`;
//     }).join('\n');
//     console.log(JSON.stringify(content))
//     const parsedJSX = parseJSX(content)
//     console.log(typeof parseJSX)

//     if(typeof parsedJSX === 'object' &&( element as any).ELEMENT_NODE) {
//       (element as any).append(parsedJSX)
//       return element
//     }

//     if(typeof parsedJSX !== 'string') {
//       console.error('eeeeeeeeeeee')
//       return 'undefined';
//     } 

//     const contentAssignment = parsedJSX.trim() ? `${element}.textContent = "${parsedJSX.trim()}";` : '';

//     return wrap(() => `{ 
//       const elem = ${element}; 
//       ${attrAssignments} 
//       ${contentAssignment} 
//       return elem; 
//     }`);
//   });
// }

// // Example JSX-like string
// const jsxCode = `<div class="container">
//   <span>Hello hello</span>
//   <ul class='list'>
//     <li class="list-item">Hello, World!</li>
//     <li class="list-item">Hello, World!</li>
//   <ul>
// </div>`;

// // This will return a function that creates the element
// console.log(parseJSX(jsxCode));

