function workerRequest(worker: ServiceWorker, request: string): Promise<boolean> {
  return new Promise((resolve) => {
    const channel = new MessageChannel()
    function finish(ready: boolean) {
      window.clearTimeout(timeout)
      channel.port1.close()
      resolve(ready)
    }
    const timeout = window.setTimeout(() => finish(false), 20_000)
    channel.port1.onmessage = (event) => finish(event.data === true)
    worker.postMessage(request, [channel.port2])
  })
}

export function supportsOfflinePlay() {
  return import.meta.env.PROD && window.isSecureContext && 'serviceWorker' in navigator
}

export async function offlinePlayReady() {
  const worker = navigator.serviceWorker.controller
  return worker ? workerRequest(worker, 'check-offline') : false
}

export async function prepareOfflinePlay() {
  if (!navigator.onLine) return false
  const workers = navigator.serviceWorker
  const registration = await workers.register(`${import.meta.env.BASE_URL}offline-worker.js`, { updateViaCache: 'none' })
  const installing = registration.installing ?? registration.waiting
  if (installing || !workers.controller) {
    await new Promise<void>((resolve, reject) => {
      function finish(error?: Error) {
        window.clearTimeout(timeout)
        workers.removeEventListener('controllerchange', check)
        installing?.removeEventListener('statechange', check)
        if (error) reject(error)
        else resolve()
      }
      function check() {
        if (workers.controller && (!installing || workers.controller === installing)) finish()
        else if (installing?.state === 'redundant') finish(new Error('Offline installation failed.'))
      }
      const timeout = window.setTimeout(() => finish(new Error('Offline installation timed out.')), 30_000)
      workers.addEventListener('controllerchange', check)
      installing?.addEventListener('statechange', check)
      check()
    })
  }

  const worker = workers.controller
  return worker ? workerRequest(worker, 'prepare-offline') : false
}
