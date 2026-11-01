import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'motion/react'
import { projects } from './data.js'

const WIDTH = 340
const GAP = 18

const Arrow = () => (
  <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
    <path d="M4.5 11.5l7-7M6 4.5h5.5V10" />
  </svg>
)

/*
  The project's links, opened at the point the visitor clicked.
  It closes on scroll, on Escape and on a click anywhere else.
*/
export default function ProjectTip({ tip, onClose }) {
  const box = useRef(null)

  useEffect(() => {
    if (!tip) return
    const startY = window.scrollY
    const onScroll = () => { if (Math.abs(window.scrollY - startY) > 4) onClose() }
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    const onDown = (e) => { if (box.current && !box.current.contains(e.target)) onClose() }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('wheel', onClose, { passive: true })
    window.addEventListener('touchmove', onClose, { passive: true })
    window.addEventListener('keydown', onKey)
    window.addEventListener('pointerdown', onDown)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('wheel', onClose)
      window.removeEventListener('touchmove', onClose)
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('pointerdown', onDown)
    }
  }, [tip, onClose])

  let style = null
  let below = false
  if (tip) {
    const vw = window.innerWidth
    const w = Math.min(WIDTH, vw - 32)
    const left = Math.min(Math.max(tip.x - w / 2, 16), vw - 16 - w)
    below = tip.y < 320 // not enough room above the click
    style = {
      width: w,
      left,
      top: below ? tip.y + GAP : undefined,
      bottom: below ? undefined : window.innerHeight - tip.y + GAP,
      transformOrigin: `${tip.x - left}px ${below ? '0%' : '100%'}`,
    }
  }
  const p = tip ? projects[tip.i] : null

  return createPortal(
    <AnimatePresence>
      {tip && (
        <motion.div
          key={`${tip.i}-${tip.x}-${tip.y}`}
          ref={box}
          className="tip"
          role="dialog"
          aria-label={`${p.title} links`}
          style={style}
          initial={{ opacity: 0, scale: 0.94, y: below ? -6 : 6 }}
          animate={{ opacity: 1, scale: 1, y: 0, transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] } }}
          exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.12, ease: 'easeIn' } }}
        >
          <p className="tip__title">{p.title}</p>
          <p className="tip__tags">{p.tags.join(' · ')} · {p.font}</p>
          <p className="tip__desc">{p.desc}</p>
          {p.links.length > 0 ? (
            <div className="tip__actions">
              {p.links.map((l, i) => (
                <a
                  key={l.href}
                  className={`tip__btn${i === 0 ? ' tip__btn--main' : ''}`}
                  href={l.href}
                  target="_blank"
                  rel="noreferrer"
                  onClick={onClose}
                >
                  {l.label} <Arrow />
                </a>
              ))}
            </div>
          ) : (
            <p className="tip__none">No prototype link for this project.</p>
          )}
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}
