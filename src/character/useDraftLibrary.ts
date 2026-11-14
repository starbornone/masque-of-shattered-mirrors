import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { loadDraftLibrary, storeDraftLibrary } from './library'
import type { DraftLibrary } from './library'

const saveDelay = 350
type DraftSave = ReturnType<typeof loadDraftLibrary> & { dirty: boolean; saving: boolean }

export function useDraftLibrary(startLevel: number) {
  const [state, setState] = useState<DraftSave>(() => ({
    ...loadDraftLibrary(startLevel), dirty: false, saving: false,
  }))
  const latest = useRef(state)
  const timer = useRef<number | undefined>(undefined)

  const update = useCallback((next: DraftSave) => {
    latest.current = next
    setState(next)
  }, [])

  const write = useCallback((library: DraftLibrary) => {
    const current = latest.current
    const result = current.problem === 'unreadable'
      ? { problem: 'unreadable' } as const
      : storeDraftLibrary(library, current.saved)
    if (result.problem) {
      update({ ...current, problem: result.problem, saving: false })
      return false
    }
    update({ library, saved: result.saved, problem: null, dirty: false, saving: false })
    return true
  }, [update])

  const flush = useCallback(() => {
    window.clearTimeout(timer.current)
    timer.current = undefined
    const current = latest.current
    return !current.dirty || write(current.library)
  }, [write])

  function queue(change: (library: DraftLibrary) => DraftLibrary) {
    const current = latest.current
    const canSave = current.problem !== 'changed' && current.problem !== 'unreadable'
    window.clearTimeout(timer.current)
    update({ ...current, library: change(current.library), dirty: true, saving: canSave })
    if (canSave) timer.current = window.setTimeout(flush, saveDelay)
  }

  function commit(change: (library: DraftLibrary) => DraftLibrary) {
    window.clearTimeout(timer.current)
    timer.current = undefined
    return write(change(latest.current.library))
  }

  useEffect(() => () => window.clearTimeout(timer.current), [])

  useLayoutEffect(() => {
    if (!state.dirty) return
    function leave(event: BeforeUnloadEvent) {
      if (flush()) return
      event.preventDefault()
      event.returnValue = true
    }
    function visibilityChanged() {
      if (document.visibilityState === 'hidden') flush()
    }
    window.addEventListener('beforeunload', leave)
    document.addEventListener('visibilitychange', visibilityChanged)
    return () => {
      window.removeEventListener('beforeunload', leave)
      document.removeEventListener('visibilitychange', visibilityChanged)
    }
  }, [state.dirty, flush])

  return { ...state, queue, commit, flush }
}
