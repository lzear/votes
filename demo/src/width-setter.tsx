import React, { useLayoutEffect, useState } from 'react'
import { useStore } from './store'
import { selectSetWidth } from './store/selectors'

export const useElementWidth = (el: HTMLElement | null) => {
  const [width, setWidth] = useState<number | undefined>()
  useLayoutEffect(() => {
    const handleResize = () => el && setWidth(el.offsetWidth)
    window.addEventListener('resize', handleResize)
    handleResize()
    return () => window.removeEventListener('resize', handleResize)
  }, [el])

  return width
}

const useWidth = () => {
  const setScreenWidth = useStore(selectSetWidth)

  useLayoutEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth - 40)
    window.addEventListener('resize', handleResize)
    handleResize()
    return () => window.removeEventListener('resize', handleResize)
  }, [setScreenWidth])
}

export const WidthSetter: React.FC = () => {
  useWidth()
  return null
}
