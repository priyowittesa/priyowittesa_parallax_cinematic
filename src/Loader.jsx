import { createContext, useContext, useEffect, useRef } from 'react'
import { animate } from 'motion/react'
import { projects } from './data.js'

/*
  Opening screen, built from the P mark.
  1. An empty screen, then the mark draws itself: the bowl is traced, the three dots land.
  2. While the page loads, the three dots of the stem pulse in turn, like a typing indicator.
  3. When it is ready, the last dot turns orange, becomes a window onto the page, and the camera
     flies into it until the window fills the screen.
*/

// Whether the page behind the loader may play its entrance.
export const IntroReady = createContext(true)
export const useIntroReady = () => useContext(IntroReady)

// The mark on its 1024 grid (same geometry as Mark.jsx).
const DOTS = [225, 515, 800]
const DOT_X = 320
const DOT_R = 80
const BOWL = 'M456 225H558A145 145 0 0 1 558 515H456'
const VIEW = 1024

const MIN_TIME = 2400 // the mark is always seen whole, even on a warm cache
const MAX_TIME = 8000 // never hold the visitor longer than this

const wait = (ms) => new Promise((r) => setTimeout(r, ms))
const loadImage = (src) =>
  new Promise((res) => { const im = new Image(); im.onload = im.onerror = () => res(); im.src = src })

export default function Loader({ onReveal, onDone }) {
  const root = useRef(null)
  const logo = useRef(null)
  const bowl = useRef(null)
  const dots = useRef([])
  const status = useRef(null)

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let alive = true
    const running = []
    const run = (...args) => { const a = animate(...args); running.push(a); return a }

    const start = performance.now()
    let loaded = false
    Promise.race([
      Promise.all([
        document.fonts?.ready ?? Promise.resolve(),
        loadImage('/img/portrait.jpg'),
        loadImage(projects[0].img),
      ]),
      wait(MAX_TIME),
    ]).then(() => { loaded = true })

    const sequence = async () => {
      const [d1, d2, d3] = dots.current

      if (reduce) {
        // The mark is simply there; when ready, the screen fades away.
        bowl.current.setAttribute('stroke-dashoffset', '0')
        dots.current.forEach((d) => { d.style.opacity = '1' })
        while (alive && !loaded) await wait(100)
        status.current.textContent = 'Loaded'
        onReveal()
        await run(root.current, { opacity: 0 }, { duration: 0.3 }).finished
        onDone()
        return
      }

      // 1. Empty, then the mark draws itself.
      await wait(350)
      if (!alive) return
      run(bowl.current, { strokeDashoffset: [1, 0] }, { duration: 1, ease: [0.65, 0, 0.35, 1] })
      const lands = [d1, d2, d3].map((d, i) =>
        run(d, { scale: [0, 1], opacity: [0, 1] }, { type: 'spring', bounce: 0.45, duration: 0.7, delay: 0.3 + i * 0.12 })
      )
      await Promise.all(lands.map((a) => a.finished))

      // 2. Pulse the stem while the page loads.
      while (alive && (!loaded || performance.now() - start < MIN_TIME)) {
        const wave = [d1, d2, d3].map((d, i) =>
          run(d, { y: [0, -54, 0] }, { duration: 0.56, delay: i * 0.12, ease: [0.45, 0, 0.55, 1] })
        )
        await Promise.all(wave.map((a) => a.finished))
        await wait(140)
      }
      if (!alive) return
      status.current.textContent = 'Loaded'

      // 3. The last dot gathers itself, turns orange...
      d3.classList.add('loader__dot--hot')
      await run(d3, { scale: [1, 1.18, 1] }, { duration: 0.42, ease: [0.34, 1.56, 0.64, 1] }).finished
      await wait(120)
      if (!alive) return

      // ...and becomes a window. The camera flies into it until it fills the screen.
      const box = logo.current.getBoundingClientRect()
      const unit = box.width / VIEW
      const cx = box.left + DOT_X * unit
      const cy = box.top + DOTS[2] * unit
      const r0 = DOT_R * unit
      const far = Math.max(Math.hypot(cx, cy), Math.hypot(innerWidth - cx, cy), Math.hypot(cx, innerHeight - cy), Math.hypot(innerWidth - cx, innerHeight - cy))
      const lnS = Math.log((far * 1.04) / r0)

      const hole = (r) => {
        const m = `radial-gradient(circle at ${cx}px ${cy}px, transparent ${r}px, #000 ${r + 0.75}px)`
        root.current.style.maskImage = m
        root.current.style.webkitMaskImage = m
      }
      hole(r0)
      d3.style.visibility = 'hidden' // the page now shows exactly where the dot was

      let revealed = false
      const fly = run(0, 1, {
        duration: 1.6,
        ease: [0.76, 0, 0.24, 1],
        onUpdate: (t) => {
          const z = Math.exp(t * lnS) // zoom in log space, so the speed feels even
          logo.current.style.transform = `scale(${z})`
          hole(r0 * z)
          if (!revealed && t > 0.18) { revealed = true; onReveal() }
        },
      })
      await fly.finished
      if (alive) onDone()
    }
    sequence()

    return () => { alive = false; running.forEach((a) => a.stop()) }
  }, [onReveal, onDone])

  return (
    <div className="loader" ref={root}>
      <svg
        className="loader__logo"
        ref={logo}
        viewBox={`0 0 ${VIEW} ${VIEW}`}
        aria-hidden="true"
        style={{ transformOrigin: `${(DOT_X / VIEW) * 100}% ${(DOTS[2] / VIEW) * 100}%` }}
      >
        <path ref={bowl} className="loader__bowl" d={BOWL} pathLength="1" strokeDasharray="1" strokeDashoffset="1" />
        {DOTS.map((cy, i) => (
          <circle key={cy} ref={(el) => (dots.current[i] = el)} className="loader__dot" cx={DOT_X} cy={cy} r={DOT_R} />
        ))}
      </svg>
      <p className="sr-only" role="status" ref={status}>Loading the portfolio</p>
    </div>
  )
}
