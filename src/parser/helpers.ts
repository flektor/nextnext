
export function isReactive(text: string, signals: string[]) {
  for (const signal of signals) {
    if (text.includes(signal)) {
      return true
    }
  }

  return false
}
