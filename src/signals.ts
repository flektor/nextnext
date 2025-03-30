let currentEffect: VoidFunction | null = null;

export function createSignal<T>(initialValue: T): [Function, Function] {
  let value = initialValue;
  let subscribers = new Set<VoidFunction>();

  function get() {
    if (currentEffect) {
      subscribers.add(currentEffect);
    }

    return value;
  }

  function set(newValue: any) {
    if (value === newValue) return;

    value = newValue;
    subscribers.forEach((fn) => fn());
  }

  return [get, set];
}

export function effect(fn: VoidFunction) {
  currentEffect = fn;
  fn();
  currentEffect = null;
}

export function debug(fn: VoidFunction) {
  effect(() => console.log({ debugger: fn() }))
} 