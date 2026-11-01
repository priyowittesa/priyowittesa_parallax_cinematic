import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { projects } from './data.js'
import ProjectTip from './ProjectTip.jsx'

/*
  Selected work as a pile of disposable-camera prints, scattered across the table: large and
  medium prints, each at its own angle, some overlapping the next, the way photos land when you
  tip them out of the envelope. Click one for its links.
*/

const N = projects.length
const pad = (n) => String(n).padStart(2, '0')

// Small colour copies of the shots (public/img/print), so fifteen prints stay light to decode.
const print = (src) => src.replace(/^\/img\/(.+)\.(png|jpe?g)$/, '/img/print/$1.webp')

/*
  The scatter, on a board 100 units wide (1 unit = 1% of its width). One spread of six prints:
  two large, four medium. Spreads alternate with their mirror image down the page, so the layout
  looks random but never leaves a hole. x, y and w are in units, r is the tilt in degrees.
*/
const SPREAD = [
  { x: 0, y: 0, w: 35, r: -3 },
  { x: 40, y: 5, w: 27, r: 2.5 },
  { x: 72, y: 0, w: 28, r: -1.8 },
  { x: 35, y: 30, w: 35, r: 1.8 },
  { x: 2, y: 34, w: 28, r: 2.4 },
  { x: 75, y: 30, w: 25, r: -2.6 },
]
const SPREAD_H = 60
const place = (i) => {
  const k = Math.floor(i / SPREAD.length)
  const s = SPREAD[i % SPREAD.length]
  const flip = k % 2 === 1
  return {
    x: flip ? 100 - s.x - s.w : s.x,
    y: s.y + k * SPREAD_H,
    w: s.w,
    r: flip ? -s.r : s.r,
    big: s.w >= 34,
  }
}
const SPOTS = projects.map((_, i) => place(i))
// A print is about 0.74 of its width tall, plus its caption strip.
const BOARD_H = Math.max(...SPOTS.map((s) => s.y + s.w * 0.74 + 4))

// How far each print travels against the scroll (px over the whole section): the big ones lie
// lower on the table and move less, the medium ones a little more, each a touch different.
const depthOf = (i, s) => (s.big ? 18 : 42) + (i % 3) * 12

// The light catching a glossy print follows the pointer across the photo.
const moveGloss = (e) => {
  const photo = e.currentTarget.querySelector('.print__photo')
  const gloss = photo?.querySelector('.print__gloss')
  if (!gloss) return
  const r = photo.getBoundingClientRect()
  gloss.style.transform = `translate3d(${(e.clientX - r.left - r.width).toFixed(1)}px, ${(e.clientY - r.top - r.height).toFixed(1)}px, 0)`
}

function Print({ p, i, s, progress, wide, reduce, onOpen }) {
  const depth = wide && !reduce ? depthOf(i, s) : 0
  const lift = useTransform(progress, [0, 1], [depth, -depth])
  // Each print lands from a little higher and more crooked, then settles where it lies.
  const toss = (i % 2 ? 1 : -1) * 7
  const delay = (i % 3) * 0.08

  return (
    <motion.li
      className={`spot${s.big ? ' spot--big' : ''}`}
      style={{ '--x': s.x, '--y': s.y, '--w': s.w, '--rot': `${s.r}deg`, '--i': i }}
      initial="off"
      whileInView="on"
      viewport={{ once: true, amount: 0.3 }}
      variants={{
        off: reduce ? { opacity: 0 } : { opacity: 0, y: 60, scale: 1.08, rotate: s.r + toss },
        on: reduce
          ? { opacity: 1, transition: { duration: 0.3 } }
          : {
              opacity: 1, y: 0, scale: 1, rotate: s.r,
              transition: {
                opacity: { duration: 0.3, delay },
                default: { type: 'spring', bounce: 0.3, duration: 0.9, delay },
              },
            },
      }}
    >
      {/* Depth while scrolling, then a slow idle drift, then the hover lift: one layer each. */}
      <motion.div className="spot__depth" style={{ y: lift }}>
        <div className="spot__drift">
          <button
            type="button"
            className={`print${i % 2 ? ' print--b' : ''}`}
            onClick={onOpen}
            onPointerMove={moveGloss}
            aria-haspopup="dialog"
            aria-label={`${p.title}. ${p.tags.join(', ')}. Open links`}
          >
            <span className="print__photo">
              <img
                src={print(p.img)}
                alt=""
                width={800}
                height={600}
                loading="lazy"
                decoding="async"
                onError={(e) => {
                  const im = e.currentTarget
                  if (!im.dataset.full) { im.dataset.full = '1'; im.src = p.img }
                }}
              />
              {/* The photo develops once it lands: it starts as bare paper and the picture comes up through it. */}
              <motion.span
                className="print__dev"
                aria-hidden="true"
                variants={{
                  off: { opacity: 1 },
                  on: { opacity: 0, transition: { duration: reduce ? 0.2 : 1.6, delay: reduce ? 0 : delay + 0.45, ease: [0.23, 1, 0.32, 1] } },
                }}
              />
              <span className="print__gloss" aria-hidden="true" />
              <span className="print__stamp" aria-hidden="true">{pad(i + 1)} · {pad(N)}</span>
            </span>
            <span className="print__label display" aria-hidden="true">{p.name}</span>
            <span className="print__foot" aria-hidden="true">
              <span>{p.tags[0]}</span>
              <span>{p.font}</span>
            </span>
          </button>
        </div>
      </motion.div>
    </motion.li>
  )
}

const useWide = () => {
  const [wide, setWide] = useState(() => typeof window !== 'undefined' && window.innerWidth >= 1100)
  useEffect(() => {
    const onResize = () => setWide(window.innerWidth >= 1100)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  return wide
}

export default function Work() {
  const reduce = useReducedMotion()
  const wide = useWide()
  const board = useRef(null)
  const { scrollYProgress } = useScroll({ target: board, offset: ['start end', 'end start'] })
  const [tip, setTip] = useState(null)
  const closeTip = useCallback(() => setTip(null), [])

  // The idle drift only plays while the pile is on screen and the page is still: during a scroll
  // the parallax is already moving every print, and running both costs a style pass per frame.
  useEffect(() => {
    const el = board.current
    if (!el) return
    let timer = 0
    let near = false
    const io = new IntersectionObserver(([e]) => {
      near = e.isIntersecting
      el.classList.toggle('is-still', near)
    })
    io.observe(el)
    const onScroll = () => {
      if (!near) return
      if (el.classList.contains('is-still')) el.classList.remove('is-still')
      clearTimeout(timer)
      timer = setTimeout(() => el.classList.add('is-still'), 160)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => { io.disconnect(); clearTimeout(timer); window.removeEventListener('scroll', onScroll) }
  }, [])

  const open = (i) => (e) => {
    e.stopPropagation()
    // A keyboard press has no pointer position: open it from the middle of the print instead.
    if (e.detail === 0) {
      const r = e.currentTarget.getBoundingClientRect()
      setTip({ i, x: r.left + r.width / 2, y: r.top + r.height * 0.4 })
    } else {
      setTip({ i, x: e.clientX, y: e.clientY })
    }
  }

  return (
    <section className="work" id="work" aria-labelledby="work-h">
      <header className="work__head">
        <h2 id="work-h" className="display work__title">Selected work</h2>
        <p className="work__lead">
          {N} projects, straight out of the envelope. Pick a print to open its prototype or case study.
        </p>
      </header>

      <div className="pile">
        <ol className="pile__board" ref={board} style={{ '--board-h': BOARD_H }}>
          {projects.map((p, i) => (
            <Print
              key={p.name}
              p={p}
              i={i}
              s={SPOTS[i]}
              progress={scrollYProgress}
              wide={wide}
              reduce={reduce}
              onOpen={open(i)}
            />
          ))}
        </ol>
      </div>

      <ProjectTip tip={tip} onClose={closeTip} />
    </section>
  )
}
