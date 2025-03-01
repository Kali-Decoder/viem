import type { ErrorType } from '../../errors/utils.js'

export type WithTimeoutErrorType = ErrorType

export function withTimeout<TData>(
  fn: ({
    signal,
  }: { signal: AbortController['signal'] | null }) => Promise<TData>,
  {
    errorInstance = new Error('timed out'),
    timeout,
    signal,
  }: {
    // The error instance to throw when the timeout is reached.
    errorInstance?: Error | undefined
    // The timeout (in ms).
    timeout: number
    // Whether or not the timeout should use an abort signal.
    signal?: boolean | undefined
  },
): Promise<TData> {
  return new Promise((resolve, reject) => {
    ;(async () => {
      let timeoutId!: Timer
      try {
        const controller = new AbortController()
        if (timeout > 0) {
          timeoutId = setTimeout(() => {
            if (signal) {
              controller.abort()
            } else {
              reject(errorInstance)
            }
          }, timeout)
        }
        resolve(await fn({ signal: controller?.signal || null }))
      } catch (err) {
        if ((err as Error)?.name === 'AbortError') reject(errorInstance)
        reject(err)
      } finally {
        clearTimeout(timeoutId)
      }
    })()
  })
}
