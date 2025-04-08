import { Node } from "./parser/jsxParser";
import { effect } from "./signals";

export function createElement(node: Node, context: any, ref: any): Text | HTMLElement

export function createEffect(effct: any, element: any, context: any): VoidFunction