let currentEffect = null;

export function createSignal(initialValue) {
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

export function effect(fn) {
  currentEffect = fn;
  fn();
  currentEffect = null;
}

export function defaultEffect(ref, value) {
  const elem = getComputedContent(value)
  ref.current.replaceWith(elem)
  ref.current = elem
}

export function debug(fn) {
  effect(() => console.log({ debugger: fn() }))
}
