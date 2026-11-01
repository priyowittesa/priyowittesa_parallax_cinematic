import { createContext, useContext, useEffect, useRef } from 'react'
import { createCloth, paintSheet } from './cloth.js'
import { projects } from './data.js'

/*
  Opening screen.
  1. A full-screen sheet counts real loading (fonts, the portrait, the first shots) to 100.
  2. Meanwhile "hello" decodes from one language into the next, and lands on "Halo".
  3. At 100 the sheet becomes real cloth (see cloth.js): a breeze ripples it, the pins let go
     from the centre out, and it falls and folds away with the greeting still printed on it.
*/

// Whether the page behind the loader may play its entrance.
export const IntroReady = createContext(true)
export const useIntroReady = () => useContext(IntroReady)

const GREETINGS = [
  ['Hello', 'English'],
  ['Hola', 'Español'],
  ['Bonjour', 'Français'],
  ['Ciao', 'Italiano'],
  ['Привет', 'Русский'],
  ['Olá', 'Português'],
  ['Merhaba', 'Türkçe'],
  ['Hallo', 'Deutsch'],
  ['Om Swastyastu', 'Basa Bali'],
]
const HOME = ['Halo', 'Bahasa Indonesia']

const MIN_TIME = 3200 // long enough to read a handful of greetings
const MAX_TIME = 9000 // never hold the visitor longer than this
const SCRAMBLE = 300
const HOLD = 260
const POOL = 'ABCDEFGHIJKLMNOPQRSTUVWXYZАБВГДЕЖЗИКЛМНОПРСТУФ'

const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

function loadImage(src) {
  return new Promise((res) => {
    const im = new Image()
    im.onload = im.onerror = () => res()
    im.src = src
  })
}

/* Writes a word into `el`, each letter settling from random characters, left to right. */
function scrambleTo(el, word, duration) {
  return new Promise((resolve) => {
    const from = el.textContent || ''
    const len = Math.max(word.length, from.length)
    const start = performance.now()
    const step = (now) => {
      const t = Math.min(1, (now - start) / duration)
      let out = ''
      for (let i = 0; i < len; i++) {
        const settle = (i + 1) / (len + 1) // later letters settle later
        if (t >= settle * 0.85 + 0.15) out += word[i] ?? ''
        else if (word[i] === ' ' || (i >= word.length && t > 0.5)) out += word[i] ?? ''
        else out += POOL[(Math.random() * POOL.length) | 0]
      }
      el.textContent = out
      if (t < 1) requestAnimationFrame(step)
      else { el.textContent = word; resolve() }
    }
    requestAnimationFrame(step)
  })
}

export default function Loader({ onReveal, onDone }) {
  const root = useRef(null)
  const content = useRef(null)
  const gl = useRef(null)
  const pct = useRef(null)
  const bar = useRef(null)
  const word = useRef(null)
  const lang = useRef(null)
  const status = useRef(null)

  useEffect(() => {
    const reduce = reduceMotion()
    let alive = true
    let done = 0
    let stopDrop = null
    const fabric = new Image()
    fabric.src = '/img/fabric.jpg'
    const jobs = [
      document.fonts?.ready ?? Promise.resolve(),
      loadImage('/img/fabric.jpg'),
      loadImage('/img/portrait.jpg'),
      loadImage(projects[0].img),
      loadImage(projects[1].img),
    ]
    jobs.forEach((j) => j.then(() => { done += 1 }))

    // Greetings cycle until loading completes, then settle on "Halo".
    let finished = false
    const cycle = async () => {
      if (reduce) { word.current.textContent = HOME[0]; lang.current.textContent = HOME[1]; return }
      let i = 0
      while (alive && !finished) {
        const [w, l] = GREETINGS[i % GREETINGS.length]
        lang.current.textContent = l
        await scrambleTo(word.current, w, SCRAMBLE)
        await new Promise((r) => setTimeout(r, HOLD))
        i += 1
      }
    }
    cycle()

    // Counter: follows real loading, but never faster than MIN_TIME so the greetings can be read.
    const start = performance.now()
    let shown = 0
    let raf = 0
    const tick = (now) => {
      const t = now - start
      const all = done === jobs.length
      const cap = all ? 1 : Math.min(0.92, 0.15 + 0.75 * (done / jobs.length))
      const target = t > MAX_TIME ? 1 : Math.min(cap, reduce ? 1 : t / MIN_TIME)
      shown += (target - shown) * 0.14
      if (target === 1 && shown > 0.996) shown = 1
      pct.current.textContent = Math.round(shown * 100)
      bar.current.style.transform = `scaleX(${shown})`
      if (shown < 1) raf = requestAnimationFrame(tick)
      else finish()
    }
    raf = requestAnimationFrame(tick)

    const finish = async () => {
      finished = true
      status.current.textContent = 'Loaded'
      if (reduce) { onReveal(); onDone(); return } // no fall, the page simply appears
      lang.current.textContent = HOME[1]
      await scrambleTo(word.current, HOME[0], SCRAMBLE + 120)
      await new Promise((r) => setTimeout(r, 480)) // a beat on "Halo" before the drop
      if (!alive) return

      const width = window.innerWidth
      const height = window.innerHeight
      let cloth = null
      try { cloth = createCloth(gl.current) } catch (e) { cloth = null }

      if (!cloth) {
        // No WebGL: the sheet simply slides away.
        root.current.classList.add('loader--slide')
        setTimeout(() => alive && onReveal(), 350)
        setTimeout(() => alive && onDone(), 1100)
        return
      }

      // Swap the page sheet for the cloth in the same frame, so the change cannot be seen.
      const bg = getComputedStyle(root.current).backgroundColor
      cloth.size(width, height)
      cloth.setTexture(paintSheet(content.current, { bg, fabric, width, height }))
      cloth.render()
      root.current.classList.add('loader--cloth')

      let revealed = false
      stopDrop = cloth.drop({
        onFrame: (t) => { if (!revealed && t > 0.7) { revealed = true; onReveal() } },
        onDone: () => { if (!revealed) onReveal(); onDone() },
      })
    }

    return () => { alive = false; cancelAnimationFrame(raf); stopDrop?.() }
  }, [onReveal, onDone])

  return (
    <div className="loader" ref={root}>
      <canvas className="loader__gl" ref={gl} aria-hidden="true" />
      <div className="loader__content" ref={content}>
        <p className="loader__name">I Komang Danda Priyowittesa</p>
        <div className="loader__hello" aria-hidden="true">
          <p className="loader__word display" ref={word}>&nbsp;</p>
          <p className="loader__lang" ref={lang}>&nbsp;</p>
        </div>
        <p className="loader__count display" aria-hidden="true">
          <span ref={pct}>0</span>%
        </p>
        <div className="loader__track" data-paint="box" aria-hidden="true">
          <div className="loader__bar" data-paint="box" ref={bar} />
        </div>
        <p className="sr-only" role="status" ref={status}>Loading the portfolio</p>
      </div>
    </div>
  )
}
