import { useEffect, useRef } from 'react'

/*
  A negative "torch" over text: where the pointer shines, colours invert (the same difference
  blend as the project names in Selected work). The light has no edge: it is strongest at the
  pointer and fades out softly, follows with a little lag, swells slightly when the pointer moves
  fast, and stays on the pointer while the page scrolls under a still mouse.
*/
export default function Negative({ children, radius = 90 }) {
  const box = useRef(null)
  const light = useRef(null)

  useEffect(() => {
    const el = box.current
    const lamp = light.current
    if (!el || !lamp) return
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!fine || reduce) return

    let pointer = null // on screen
    let pos = null // eased position, relative to the text box
    let level = 0 // 0 = off, 1 = fully on
    let size = radius
    let lastMove = null
    let raf = 0

    const tick = () => {
      raf = 0
      const area = el.getBoundingClientRect()
      const target = pointer && { x: pointer.x - area.left, y: pointer.y - area.top }
      const inside = target &&
        target.x > -radius * 0.4 && target.x < area.width + radius * 0.4 &&
        target.y > -radius * 0.4 && target.y < area.height + radius * 0.4

      if (target) {
        if (!pos || level < 0.02) pos = { ...target } // appear where the pointer is, not slide in
        pos.x += (target.x - pos.x) * 0.2
        pos.y += (target.y - pos.y) * 0.2
      }
      level += ((inside ? 1 : 0) - level) * (inside ? 0.16 : 0.1)
      size += (radius - size) * 0.08

      if (pos) {
        lamp.style.setProperty('--lx', `${pos.x + radius * 1.5}px`)
        lamp.style.setProperty('--ly', `${pos.y + radius * 1.5}px`)
        lamp.style.setProperty('--lr', `${size}px`)
      }
      lamp.style.opacity = level.toFixed(3)

      const settling = target && (Math.abs(target.x - pos.x) + Math.abs(target.y - pos.y) > 0.3)
      if (settling || Math.abs((inside ? 1 : 0) - level) > 0.005 || Math.abs(radius - size) > 0.3) {
        raf = requestAnimationFrame(tick)
      }
    }
    // Off screen the text cannot be lit, so scrolling elsewhere on the page costs nothing here.
    let near = false
    const io = new IntersectionObserver(([e]) => { near = e.isIntersecting; schedule() }, { rootMargin: `${radius * 2}px` })
    io.observe(el)
    const schedule = () => { if (!raf && (near || level > 0.005)) raf = requestAnimationFrame(tick) }

    const onMove = (e) => {
      pointer = { x: e.clientX, y: e.clientY }
      if (lastMove) {
        // a quick flick widens the light a little, like a torch swung through the air
        const speed = Math.hypot(e.clientX - lastMove.x, e.clientY - lastMove.y)
        size = Math.min(radius * 1.35, size + speed * 0.6)
      }
      lastMove = pointer
      schedule()
    }
    const onOut = (e) => { if (!e.relatedTarget) { pointer = null; lastMove = null; schedule() } }

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('scroll', schedule, { passive: true }) // the text moves, the pointer does not
    document.addEventListener('pointerout', onOut)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('scroll', schedule)
      document.removeEventListener('pointerout', onOut)
      io.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [radius])

  return (
    <div className="neg" ref={box} style={{ '--neg-r': `${radius}px` }}>
      {children}
      <div className="neg__light" ref={light} aria-hidden="true" />
    </div>
  )
}
