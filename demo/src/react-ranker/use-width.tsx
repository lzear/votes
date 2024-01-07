import type { RefObject } from 'react'
import React, {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import _ from 'lodash-es'

const getSize = (el: HTMLDivElement | null) => (el ? el.offsetWidth : null)

export default function useWidth(ref: RefObject<HTMLDivElement>) {
  const [ComponentSize, setComponentSize] = useState(getSize(ref.current))
  const seet = useCallback(() => {
    if (ref.current) {
      setComponentSize(getSize(ref.current))
    }
  }, [ref])

  const handleResize = useMemo(
    () =>
      _.debounce(
        () => {
          if (ref.current) {
            setComponentSize(getSize(ref.current))
          }
        },
        250,
        { maxWait: 1000 },
      ),
    [ref],
  )

  useLayoutEffect(() => {
    seet()
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [handleResize, seet])

  return ComponentSize
}

export const WithWidth = <T extends { width: number }>(
  Comp: React.ComponentType<T>,
) =>
  function Render(props: Omit<T, 'width'>): React.ReactElement {
    const ref = useRef<HTMLDivElement>(null)
    const [componentSize, setComponentSize] = useState<number | null>(null)
    const seet = useCallback(() => {
      if (ref.current) {
        setComponentSize(getSize(ref.current))
      }
    }, [ref])
    const handleResize = useMemo(
      () =>
        _.debounce(
          () => {
            if (ref.current) {
              setComponentSize(getSize(ref.current))
            }
          },
          250,
          { maxWait: 1000 },
        ),
      [ref],
    )

    useLayoutEffect(() => {
      seet()
      handleResize()
      window.addEventListener('resize', handleResize)
      return () => {
        window.removeEventListener('resize', handleResize)
      }
    }, [handleResize, seet])

    return (
      <div ref={ref}>
        {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          componentSize && <Comp {...props} width={componentSize} />
        }
      </div>
    )
  }
