/** Performance helpers */

export function debounce<F extends (...args: any[]) => any>(fn: F, delay: number) {
  let timer: any
  return function(this: any, ...args: Parameters<F>) {
    clearTimeout(timer)
    timer = setTimeout(()=> fn.apply(this, args), delay)
  } as F
}

export function throttle<F extends (...args: any[]) => any>(fn: F, limit: number) {
  let inThrottle = false
  let lastArgs: any[] | null = null
  return function(this: any, ...args: Parameters<F>) {
    if (!inThrottle) {
      fn.apply(this, args)
      inThrottle = true
      setTimeout(()=>{
        inThrottle = false
        if (lastArgs) {
          fn.apply(this, lastArgs)
          lastArgs = null
        }
      }, limit)
    } else {
      lastArgs = args
    }
  } as F
}
