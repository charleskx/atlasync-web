import { useEffect, useRef } from 'react'

type Handlers = Record<string, (data: unknown) => void>

export function useSSE(url: string | null, handlers: Handlers) {
  const handlersRef = useRef<Handlers>(handlers)
  handlersRef.current = handlers

  useEffect(() => {
    if (!url) return

    const es = new EventSource(url)

    const attached: Array<[string, (e: MessageEvent) => void]> = []

    for (const event of Object.keys(handlersRef.current)) {
      const listener = (e: MessageEvent) => {
        try {
          handlersRef.current[event]?.(JSON.parse(e.data))
        } catch {}
      }
      es.addEventListener(event, listener)
      attached.push([event, listener])
    }

    return () => {
      for (const [event, listener] of attached) {
        es.removeEventListener(event, listener)
      }
      es.close()
    }
  }, [url])
}
