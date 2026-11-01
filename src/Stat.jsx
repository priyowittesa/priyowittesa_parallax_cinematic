import { useEffect, useRef, useState } from 'react'
import { animate, motion, useInView, useReducedMotion } from 'motion/react'
import { EASE_OUT } from './motion.jsx'

/* One figure: the panel opens from the left, the number rises out of its line and counts up, then the label. */
export default function Stat({ index, to, format, label }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.6 })
  const reduce = useReducedMotion()
  const [value, setValue] = useState(reduce ? to : 0)
  const delay = index * 0.14

  useEffect(() => {
    if (!inView || reduce) return
    const controls = animate(0, to, {
      duration: 1.2,
      delay: delay + 0.3,
      ease: EASE_OUT,
      onUpdate: (v) => setValue(v),
    })
    return () => controls.stop()
  }, [inView, reduce, to, delay])

  const shown = reduce || inView
  return (
    <div ref={ref} className="stat">
      <motion.span
        className="stat__bg"
        aria-hidden="true"
        initial={reduce ? false : { scaleX: 0 }}
        animate={shown ? { scaleX: 1 } : undefined}
        transition={{ duration: 0.8, ease: [0.65, 0, 0.35, 1], delay }}
      />
      <p className="stat__n">
        <span className="stat__mask">
          <motion.span
            initial={reduce ? false : { y: '110%' }}
            animate={shown ? { y: '0%' } : undefined}
            transition={{ duration: 0.8, ease: EASE_OUT, delay: delay + 0.25 }}
          >
            {format(value)}
          </motion.span>
        </span>
      </p>
      <motion.p
        className="stat__l"
        initial={reduce ? false : { opacity: 0, y: 12 }}
        animate={shown ? { opacity: 1, y: 0 } : undefined}
        transition={{ duration: 0.6, ease: EASE_OUT, delay: delay + 0.5 }}
      >
        {label}
      </motion.p>
    </div>
  )
}
