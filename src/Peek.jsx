import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, useMotionValue, useSpring } from 'motion/react'

/*
  A picture that follows the pointer while it rests on a skill, as an example of that skill.
  Pictures are linked from open collections, not stored in the project.
*/

const W = 260
const H = 180
const OFFSET = 22

export function usePeek(shots) {
  const [key, setKey] = useState(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 420, damping: 34, mass: 0.5 })
  const sy = useSpring(y, { stiffness: 420, damping: 34, mass: 0.5 })
  const enabled = useRef(false)
  const warmed = useRef(false)

  useEffect(() => {
    enabled.current =
      window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }, [])

  // Load every picture the first time the pointer comes near the lists, so hovering feels instant.
  const warm = useCallback(() => {
    if (warmed.current || !enabled.current) return
    warmed.current = true
    Object.values(shots).forEach((s) => { const im = new Image(); im.src = s.src })
  }, [shots])

  const place = (e, jump) => {
    // Keep the card inside the window: flip to the left of the pointer near the right edge.
    const left = e.clientX + OFFSET + W > window.innerWidth - 16 ? e.clientX - OFFSET - W : e.clientX + OFFSET
    const top = Math.min(Math.max(e.clientY - H - OFFSET, 16), window.innerHeight - H - 16)
    x.set(left); y.set(top)
    if (jump) { sx.jump(left); sy.jump(top) }
  }

  const bind = (name) =>
    shots[name]
      ? {
          onPointerEnter: (e) => { if (!enabled.current) return; place(e, key === null); setKey(name) },
          onPointerMove: (e) => enabled.current && place(e, false),
          onPointerLeave: () => setKey(null),
        }
      : {}

  const layer = <PeekLayer shot={key ? shots[key] : null} name={key} x={sx} y={sy} />
  return { bind, warm, layer }
}

function PeekLayer({ shot, name, x, y }) {
  return createPortal(
    <AnimatePresence>
      {shot && (
        <motion.div
          className="peek"
          aria-hidden="true"
          style={{ x, y, width: W }}
          initial={{ opacity: 0, scale: 0.86, rotate: -3 }}
          animate={{ opacity: 1, scale: 1, rotate: 0, transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] } }}
          exit={{ opacity: 0, scale: 0.92, transition: { duration: 0.14, ease: 'easeIn' } }}
        >
          <div className="peek__img" style={{ height: H }}>
            <AnimatePresence initial={false}>
              <motion.img
                key={shot.src}
                src={shot.src}
                alt=""
                initial={{ opacity: 0, scale: 1.08 }}
                animate={{ opacity: 1, scale: 1, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } }}
                exit={{ opacity: 0, transition: { duration: 0.2 } }}
              />
            </AnimatePresence>
          </div>
          <p className="peek__cap">
            <span>{name}</span>
            <span className="peek__credit">{shot.credit}</span>
          </p>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}
