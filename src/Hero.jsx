import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, useScroll, useTransform } from 'motion/react'
import { EASE_OUT } from './motion.jsx'
import { WaterFilters, useWater } from './Water.jsx'
import { useIntroReady } from './Loader.jsx'

const WATER_IDS = ['water-1', 'water-2']
import { person } from './data.js'

function useJakartaTime() {
  const fmt = () =>
    new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Jakarta', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date())
  const [time, setTime] = useState(fmt)
  useEffect(() => {
    const id = setInterval(() => setTime(fmt()), 15000)
    return () => clearInterval(id)
  }, [])
  const hour = Number(time.slice(0, 2))
  const status = hour >= 9 && hour < 18 ? 'probably in Figma' : hour >= 23 || hour < 7 ? 'probably asleep' : 'off the clock'
  return { time, status }
}

export function MoodToggle() {
  const [mood, setMood] = useState(() => document.documentElement.dataset.mood || 'dark')
  const next = mood === 'dark' ? 'light' : 'dark'

  const apply = (value) => {
    document.documentElement.dataset.mood = value
    try { localStorage.setItem('mood', value) } catch (e) { /* storage may be blocked */ }
  }

  const toggle = (e) => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!document.startViewTransition || reduce) {
      apply(next)
      setMood(next)
      return
    }
    // The new theme grows as a circle from the button that was pressed.
    const r = e.currentTarget.getBoundingClientRect()
    const x = r.left + 7
    const y = r.top + r.height / 2
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y))
    document.documentElement.classList.add('mood-switching')
    const t = document.startViewTransition(() => apply(next))
    t.ready.then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: 650, easing: 'cubic-bezier(0.65, 0, 0.35, 1)', pseudoElement: '::view-transition-new(root)' }
      )
    })
    t.finished.finally(() => document.documentElement.classList.remove('mood-switching'))
    setMood(next)
  }

  return (
    <button type="button" className="mood" onClick={toggle} aria-label={`Change the mood to ${next}`}>
      <span className="mood__dot" aria-hidden="true" />
      <span><span className="mood__long">Change the </span>mood</span>
    </button>
  )
}

// The entrance waits until the loader has started to fall away.
const line = (delay, go) => ({
  initial: { y: '105%' },
  animate: go ? { y: '0%' } : undefined,
  transition: { duration: 0.8, ease: EASE_OUT, delay },
})

export default function Hero() {
  const ref = useRef(null)
  const { time, status } = useJakartaTime()
  const go = useIntroReady()
  // The line masks are only needed for the entrance; afterwards the ripple may spill outside them.
  const [ready, setReady] = useState(false)
  const line1 = useRef(null)
  const line2 = useRef(null)
  const lines = useMemo(() => [line1, line2], [])
  useWater(ref, lines, WATER_IDS, ready)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const imgY = useTransform(scrollYProgress, [0, 1], ['0%', '14%'])

  return (
    <header
      className={`hero${ready ? ' hero--ready' : ''}`}
      ref={ref}
      id="top"
    >
      <WaterFilters ids={WATER_IDS} />
      <div className="hero__media" aria-hidden="true">
        <motion.img
          src="/img/portrait.jpg"
          alt=""
          width="1536"
          height="2048"
          fetchpriority="high"
          style={{ y: imgY }}
          initial={{ scale: 1.12 }}
          animate={go ? { scale: 1.02 } : undefined}
          transition={{ duration: 2.2, ease: EASE_OUT }}
        />
        <div className="hero__scrim" />
      </div>

      <div className="hero__bar">
        <nav aria-label="Main">
          <ul>
            <li className="hide-phone"><a className="tlink" href="#experience">Experience</a></li>
            <li><a className="tlink" href="#work">Work</a></li>
            <li><a className="tlink" href="#about">About</a></li>
            <li><a className="tlink" href="#contact">Contact</a></li>
          </ul>
        </nav>
        <MoodToggle />
      </div>

      <h1>
        <span className="hero__line hero__line--1 display">
          <motion.span ref={line1} {...line(0.08, go)} style={{ filter: `url(#${WATER_IDS[0]})` }}>
            Priyo
          </motion.span>
        </span>
        <span className="hero__line hero__line--2 display">
          <motion.span
            ref={line2}
            {...line(0.19, go)}
            style={{ filter: `url(#${WATER_IDS[1]})` }}
            onAnimationComplete={() => setReady(true)}
          >
            wittesa
          </motion.span>
        </span>
      </h1>

      <motion.div
        className="hero__mid"
        initial={{ opacity: 0, y: 18 }}
        animate={go ? { opacity: 1, y: 0 } : undefined}
        transition={{ duration: 0.7, ease: EASE_OUT, delay: 0.45 }}
      >
        <p className="hero__lede">
          I Komang Danda Priyowittesa, a UI/UX designer in Jakarta. I design enterprise software for management,
          finance and field operations.
        </p>
        <p className="hero__meta">
          <span>Currently UI/UX Designer at PT. Altimeda Cipta Visitama</span>
          <span>
            Jakarta, <time>{time}</time> WIB, {status}
          </span>
        </p>
        <a className="btn" href="#work">
          See the work <span className="arrow" aria-hidden="true">→</span>
        </a>
      </motion.div>
    </header>
  )
}

export { person }
