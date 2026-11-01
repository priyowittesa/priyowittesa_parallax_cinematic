import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import { useMotionValueEvent, useReducedMotion, useScroll } from 'motion/react'
import { projects } from './data.js'
import ProjectTip from './ProjectTip.jsx'
import WorkIntro from './WorkIntro.jsx'

const N = projects.length
const SEGMENT = 120 // svh of scroll per project
// Phases inside one project's segment (0..1)
const GROW_END = 0.4
const SHRINK_START = 0.55
// The trailer that opens the scene (WorkIntro.jsx), in svh of scroll.
// About 11svh per card as the reel runs past, so one wheel notch moves it less than a card.
const INTRO = 150

const clamp01 = (v) => Math.min(1, Math.max(0, v))
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

/*
  One pinned scene. For each project the shot starts as a small grey square,
  grows to its own full width and height in colour, holds, then shrinks while
  the name rolls on to the next project.
*/
export default function Work() {
  const track = useRef(null)
  const stage = useRef(null)
  const intro = useRef(null)
  const area = useRef(null)
  const frame = useRef(null)
  const imgs = useRef([])
  const names = useRef(null)
  const dims = useRef({ W: 0, H: 0, S: 0, line: 0 })
  const [active, setActive] = useState(0)
  const activeRef = useRef(0)
  const parked = useRef(null)
  const sizeKeyOf = () => `${dims.current.W}:${dims.current.H}:${dims.current.S}`

  const reduce = useReducedMotion()
  const introLen = reduce ? 0 : INTRO
  const introFrac = introLen / (N * SEGMENT + introLen)
  const { scrollYProgress } = useScroll({ target: track, offset: ['start start', 'end end'] })

  const render = useCallback((all) => {
    const { W, H, S, line } = dims.current
    if (!W || !frame.current) return

    // First the trailer, then the projects, on one pinned stage.
    const inIntro = all < introFrac
    intro.current?.render(introFrac ? clamp01(all / introFrac) : 1)
    if (stage.current && stage.current.classList.contains('is-intro') !== inIntro) {
      stage.current.classList.toggle('is-intro', inIntro)
    }
    // While the trailer plays the scene behind it holds its first state: lay it out once, then leave it.
    if (inIntro && parked.current === sizeKeyOf()) return
    parked.current = inIntro ? sizeKeyOf() : null
    const p = introFrac ? clamp01((all - introFrac) / (1 - introFrac)) : all

    let pos = clamp01(p) * N
    let i = Math.min(Math.floor(pos), N - 1)
    let t = pos - i
    if (i === N - 1) t = Math.min(t, SHRINK_START) // the last shot stays open

    const grow = ease(clamp01(t / GROW_END))
    const shrink = i === N - 1 ? 0 : ease(clamp01((t - SHRINK_START) / (1 - SHRINK_START)))
    const g = grow * (1 - shrink) // 0 = small square, 1 = full size

    // Full size: the shot's own proportions, as large as the area allows.
    const proj = projects[i]
    const a = proj.w / proj.h
    let fw = W
    let fh = W / a
    if (fh > H) { fh = H; fw = H * a }
    const m = Math.min(fw, fh)
    const k = S / m
    const scale = k + (1 - k) * g
    const ix = ((fw - m) / 2) * (1 - g)
    const iy = ((fh - m) / 2) * (1 - g)

    const el = frame.current
    const sizeKey = `${i}:${W}:${H}`
    if (el.dataset.size !== sizeKey) {
      // Layout only changes when the shot or the window changes, not on every scroll frame.
      el.dataset.size = sizeKey
      el.style.width = `${fw}px`
      el.style.height = `${fh}px`
    }
    el.style.transform = `translate(-50%, -50%) scale(${scale})`
    el.style.clipPath = `inset(${iy}px ${ix}px)`

    const roll = `translateY(${-(i + shrink) * line}px)`
    names.current?.querySelectorAll('ul').forEach((ul) => (ul.style.transform = roll))

    const shown = Math.min(Math.round(i + shrink), N - 1)
    if (activeRef.current !== i) {
      activeRef.current = i
      imgs.current.forEach((im, j) => im && (im.style.opacity = j === i ? '1' : '0'))
    }
    setActive((prev) => (prev === shown ? prev : shown))
  }, [introFrac])

  useMotionValueEvent(scrollYProgress, 'change', render)

  useLayoutEffect(() => {
    const measure = () => {
      const box = area.current?.getBoundingClientRect()
      const li = names.current?.querySelector('li')
      if (!box) return
      dims.current = {
        W: box.width,
        H: box.height,
        S: Math.min(window.innerWidth * (window.innerWidth < 760 ? 0.62 : 0.31), 450, box.height * 0.7),
        line: li ? li.getBoundingClientRect().height : 0,
      }
      intro.current?.measure()
      render(scrollYProgress.get())
    }
    measure()
    document.fonts?.ready.then(measure)
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [render, scrollYProgress])

  const p = projects[active]

  // Tooltip with the project's links, opened where the visitor clicked.
  const [tip, setTip] = useState(null)
  const openTip = (e) => {
    e.stopPropagation()
    // Only once the visitor faces a project: the trailer before it is not clickable.
    if (stage.current?.classList.contains('is-intro')) return
    setTip({ i: activeRef.current, x: e.clientX, y: e.clientY })
  }
  const closeTip = useCallback(() => setTip(null), [])

  // Jump to a project, landing where its shot is open at full size.
  const goTo = (i) => {
    const el = track.current
    if (!el) return
    const hold = (GROW_END + SHRINK_START) / 2 // middle of the moment the shot is fully open
    const all = introFrac + (1 - introFrac) * Math.min(1, (i + hold) / N)
    const y = el.getBoundingClientRect().top + window.scrollY + all * (el.offsetHeight - window.innerHeight)
    const far = Math.abs(y - window.scrollY) / window.innerHeight
    if (window.__lenis) window.__lenis.scrollTo(y, { duration: Math.min(2.4, 0.9 + far * 0.08), easing: (t) => 1 - Math.pow(1 - t, 4) })
    else window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' })
  }

  return (
    <section className="work" id="work" aria-labelledby="work-h">
      <h2 id="work-h" className="display work__title">Selected work</h2>

      {/* Plain list for screen readers and keyboard users; the scene below is visual. */}
      <ul className="sr-only">
        {projects.map((q) => (
          <li key={q.name}>
            {q.title}: {q.desc}
            {q.links.map((l) => (
              <a key={l.href} href={l.href} target="_blank" rel="noreferrer"> {l.label} for {q.name}</a>
            ))}
          </li>
        ))}
      </ul>

      <div className="work__track" ref={track} style={{ height: `calc(${N * SEGMENT + introLen}svh + 100svh)` }}>
        <div className={`work__stage${introLen ? ' is-intro' : ''}`} ref={stage}>
          {introLen > 0 && <WorkIntro ref={intro} areaRef={area} stageRef={stage} />}
          <div className="work__area" ref={area} aria-hidden="true">
            <div className="work__frame" ref={frame} onClick={openTip}>
              {projects.map((q, i) => (
                <img
                  key={q.name}
                  ref={(el) => (imgs.current[i] = el)}
                  src={q.img}
                  alt=""
                  width={q.w}
                  height={q.h}
                  loading={i < 2 ? 'eager' : 'lazy'}
                  style={{ opacity: i === 0 ? 1 : 0 }}
                />
              ))}
            </div>

            {/* The name sits on top of the shot. Clicking it (or the shot) opens the project's links. */}
            <div className="work__name" ref={names} onClick={openTip}>
              <span className="work__mask">
                <ul>
                  {projects.map((q) => <li key={q.name} className="display">{q.name}</li>)}
                </ul>
              </span>
              <span className="work__mask work__mask--hot">
                <ul>
                  {projects.map((q) => <li key={q.name} className="display">{q.name}</li>)}
                </ul>
              </span>
            </div>
          </div>

          <div className="work__bar">
            <p className="work__fact" aria-hidden="true">{p.tags.join(' · ')}</p>
            {/* How far along the journey, one segment per project. Each one jumps to its project. */}
            <nav className="work__steps" aria-label="Projects">
              {projects.map((q, i) => (
                <button
                  key={q.name}
                  type="button"
                  className={`work__step${i < active ? ' is-done' : i === active ? ' is-now' : ''}`}
                  data-name={q.name}
                  aria-label={`${q.title}, project ${i + 1} of ${N}`}
                  aria-current={i === active ? 'step' : undefined}
                  onClick={() => goTo(i)}
                />
              ))}
            </nav>
            <p className="work__fact work__fact--r" aria-hidden="true">
              <span>Set in {p.font}</span>
              <span>{active + 1} of {N}</span>
            </p>
          </div>
        </div>
      </div>

      <ProjectTip tip={tip} onClose={closeTip} />
    </section>
  )
}
