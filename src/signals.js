let currentEffect = null;

function createSignal(initialValue) {
  let value = initialValue;
  let subscribers = new Set();

  function get() {
    if (currentEffect) {
      subscribers.add(currentEffect);
    }

    return value;
  }

  function set(newValue) {
    if (value === newValue) return;

    value = newValue;
    subscribers.forEach((fn) => fn());
  }

  return [get, set];
}

function effect(fn) {
  currentEffect = fn;
  fn();
  currentEffect = null;
}

function debug(fn) {
  effect(() => console.log({ debugger: fn() }))
}

function elem({ type, initValues, events, effects }) {
  const element = document.createElement(type);

  element.context = new Object();

  for (let key in initValues) {
    const attribute = initValues[key]
    if (typeof attribute === 'function') continue;

    element[key] = initValues[key];

    const signal = createSignal(attribute);
    element.context[key] = signal

    // console.log(signal)

    element[`${key}`] = signal[0]()
    effect(signal[0]);
  }

  for (let key in events) {
    const event = events[key];
    if (typeof event !== 'function') continue;

    element[key] = (event) => events[key]({ event, context: element.context })
  }


  // for(let effekt of effects) {

  //   if(!effekt.arguments || effect.arguments.length === 0) {
  //     effect(()=>effekt(element.state));
  //     continue;
  //   }
  //   effect(effekt);
  // }
  return element;
}
