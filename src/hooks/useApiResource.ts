import { useEffect, useState, type Dispatch, type SetStateAction } from 'react'

interface UseApiResourceOptions<T> {
  enabled?: boolean
  initialData?: T | null
}

interface ApiResourceState<T> {
  data: T | null
  error: Error | null
  isLoading: boolean
  refresh: () => Promise<T | null>
  setData: Dispatch<SetStateAction<T | null>>
}

export function useApiResource<T>(
  loader: () => Promise<T>,
  options?: UseApiResourceOptions<T>,
): ApiResourceState<T> {
  const [data, setData] = useState<T | null>(options?.initialData ?? null)
  const [error, setError] = useState<Error | null>(null)
  const [isLoading, setIsLoading] = useState(Boolean(options?.enabled ?? true))

  const refresh = async () => {
    if (options?.enabled === false) {
      setIsLoading(false)
      return data
    }

    setIsLoading(true)
    setError(null)

    try {
      const nextData = await loader()
      setData(nextData)
      return nextData
    } catch (caughtError) {
      const nextError =
        caughtError instanceof Error
          ? caughtError
          : new Error('Unable to load DevGenome data.')
      setError(nextError)
      return null
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void refresh()
    // loader is expected to be stable at call sites
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options?.enabled])

  return {
    data,
    error,
    isLoading,
    refresh,
    setData,
  }
}
