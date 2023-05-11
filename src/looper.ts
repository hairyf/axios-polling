export function createLooper(fn: Function) {
  return (time = 1000) => setTimeout(fn, time)
}
