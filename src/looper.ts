export function createLooper(fn: () => void) {
  return (time = 1000) => setTimeout(fn, time)
}
