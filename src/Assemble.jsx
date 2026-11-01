import { useLayoutEffect, useRef } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'

// Same "random" layout on every visit, so the scattered state is designed, not noise.
function seeded(i, salt) {
  const x = Math.sin((i + 1) * 12.9898 + salt * 78.233) * 43758.5453
  return x - Math.floor(x)
}

const easeOut = (t) => 1 - Math.pow(1 - t, 3)

function Word({ text, i, total, progress, scatter, wordRef }) {
  // Each word settles in its own window, early words a little sooner.
  const start = 0.02 + (i / total) * 0.32 + seeded(i, 3) * 0.12
  const end = Math.min(start + 0.4, 0.9)
  const amount = (p) => 1 - easeOut(Math.min(1, Math.max(0, (p - start) / (end - start))))
  const x = useTransform(progress, (p) => (scatter.current[i]?.dx ?? 0) * amount(p))
  const y = useTransform(progress, (p) => (scatter.current[i]?.dy ?? 0) * amount(p))
  const rotate = useTransform(progress, (p) => (seeded(i, 4) * 2 - 1) * 5 * amount(p))
  return (
    <motion.span ref={wordRef} className="assemble__word" style={{ x, y, rotate }}>
      {text}
    </motion.span>
  )
}

/* A statement whose words start scattered over the screen and fall into place as the visitor scrolls. */
export default function Assemble({ text, children }) {
  const ref = useRef(null)
  const stage = useRef(null)
  const spans = useRef([])
  const scatter = useRef([])
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const words = text.split(' ')

  // Give every word its own cell on a jittered grid that covers the screen, then store how far
  // that is from where the word sits in the finished sentence.
  useLayoutEffect(() => {
    if (reduce) return
    const measure = () => {
      const box = stage.current
      if (!box) return
      const W = box.clientWidth
      const H = box.clientHeight
      const pad = (parseFloat(getComputedStyle(box).paddingLeft) || 16) + 12
      const top = 150
      const bottom = H - 40
      const n = words.length
      const cols = W < 700 ? 3 : 5
      const rows = Math.ceil(n / cols)
      const cw = (W - pad * 2) / cols
      const ch = (bottom - top) / rows
      // A fixed shuffle of the cells.
      const cells = [...Array(cols * rows).keys()].sort((a, b) => seeded(a, 7) - seeded(b, 7))
      scatter.current = spans.current.map((el, i) => {
        if (!el) return { dx: 0, dy: 0 }
        const c = cells[i]
        const col = c % cols
        const row = Math.floor(c / cols)
        const w = el.offsetWidth
        const h = el.offsetHeight
        let tx = pad + col * cw + seeded(i, 5) * Math.max(0, cw - w)
        let ty = top + row * ch + seeded(i, 6) * Math.max(0, ch - h)
        tx = Math.min(Math.max(tx, pad), W - pad - w)
        ty = Math.min(Math.max(ty, top), bottom - h)
        return { dx: tx - el.offsetLeft, dy: ty - el.offsetTop }
      })
      // Nudge the progress value so the words redraw at their new offsets.
      scrollYProgress.set(scrollYProgress.get() + 1e-9)
    }
    measure()
    document.fonts?.ready.then(measure)
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [reduce, text])

  if (reduce) {
    return (
      <div className="assemble assemble--still">
        <div className="assemble__stage">
          {children}
          <p className="assemble__text">{text}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="assemble" ref={ref}>
      <div className="assemble__stage" ref={stage}>
        {children}
        <p className="assemble__text" aria-label={text}>
          {words.map((w, i) => (
            <Word
              key={i}
              text={w}
              i={i}
              total={words.length}
              progress={scrollYProgress}
              scatter={scatter}
              wordRef={(el) => (spans.current[i] = el)}
            />
          ))}
        </p>
      </div>
    </div>
  )
}
