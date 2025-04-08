let currentEffect: VoidFunction | null = null;

export function createSignal<T>(initialValue: T): [Function, Function]

export function effect(fn: VoidFunction): void

export function debug(fn: VoidFunction): void 