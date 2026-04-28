import { useCallback, useEffect, useState } from 'react'
import { EMPTY_PROGRESS, loadProgress, saveProgress } from '../lib/progressRepository.js'

export function useUserProgress(progressKey) {
  const [progress, setProgress] = useState(EMPTY_PROGRESS)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')

    loadProgress(progressKey)
      .then(nextProgress => {
        if (!cancelled) setProgress(nextProgress)
      })
      .catch(loadError => {
        if (!cancelled) setError(loadError.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [progressKey])

  const updateProgress = useCallback((updater) => {
    setProgress(current => {
      const next = typeof updater === 'function' ? updater(current) : updater
      saveProgress(progressKey, next).catch(saveError => setError(saveError.message))
      return next
    })
  }, [progressKey])

  return { progress, updateProgress, loading, error }
}
