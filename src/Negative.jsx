import { useEffect, useRef } from 'react'

/*
  Text with a negative lens: a circle follows the pointer and shows the same text in
  inverted colours (page colour on ink). It is a copy of the text clipped to the circle,
  so it works in either mood and never changes the layout.
*/
export default function Negative({ children, radius = 92 }) {
  const box = useRef(null)

  useEffect(() => {
    const el = box.current
    if (!el) return
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!fine || reduce) return

    let target = null
    let pos = null
    let raf = 0
    const tick = () => {
      raf = 0
      if (!target) return
      pos.x += (target.x - pos.x) * 0.22
      pos.y += (target.y - pos.y) * 0.22
      el.style.setProperty('--nx', `${pos.x}px`)
      el.style.setProperty('--ny', `${pos.y}px`)
      if (Math.abs(target.x - pos.x) + Math.abs(target.y - pos.y) > 0.3) raf = requestAnimationFrame(tick)
    }
    const onMove = (e) => {
      const r = el.getBoundingClientRect()
      target = { x: e.clientX - r.left, y: e.clientY - r.top }
      if (!pos) pos = { ...target }
      if (!raf) raf = requestAnimationFrame(tick)
    }
    const onEnter = (e) => {
      const r = el.getBoundingClientRect()
      pos = { x: e.clientX - r.left, y: e.clientY - r.top }
      target = { ...pos }
      el.style.setProperty('--nx', `${pos.x}px`)
      el.style.setProperty('--ny', `${pos.y}px`)
      el.classList.add('neg--on')
    }
    const onLeave = () => el.classList.remove('neg--on')

    el.addEventListener('pointerenter', onEnter)
    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerleave', onLeave)
    return () => {
      el.removeEventListener('pointerenter', onEnter)
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerleave', onLeave)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <div className="neg" ref={box} style={{ '--nr': `${radius}px` }}>
      {children}
      <div className="neg__copy" aria-hidden="true">{children}</div>
    </div>
  )
}
