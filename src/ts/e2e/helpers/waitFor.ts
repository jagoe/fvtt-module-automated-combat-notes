export function waitFor(
  condition: () => boolean | Promise<boolean>,
  timeout: number = 500,
  retryInterval: number = 50,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const startTime = Date.now()

    const checkCondition = async () => {
      if (await condition()) {
        resolve()
      } else if (Date.now() - startTime > timeout) {
        reject(new Error('Timed out waiting for condition'))
      } else {
        setTimeout(checkCondition, retryInterval)
      }
    }

    checkCondition()
  })
}
