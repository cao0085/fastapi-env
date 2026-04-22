import { useEffect, useRef } from 'react'
import abcjs from 'abcjs'

export default function AbcRenderer({ notation }) {
  const ref = useRef(null)

  useEffect(() => {
    if (!notation || !ref.current) return
    abcjs.renderAbc(ref.current, notation, {
      responsive: 'resize',
      staffwidth: 600,
      scale: 1.2,
      stafftopmargin: 10,
    })
  }, [notation])

  if (!notation) return null

  return <div ref={ref} className="abc-renderer" />
}
