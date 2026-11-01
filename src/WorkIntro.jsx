import { forwardRef, useCallback, useImperativeHandle, useRef } from 'react'
import { projects } from './data.js'

/*
  The trailer before Selected work: it tells the visitor a long journey is coming, then shows it.
  1. "14 projects ahead" rises in while the shots deal in from the dark.
  2. The whole reel runs past as a 3D coverflow, the caption naming each shot.
  3. The reel rewinds hard to the first project, stretched by its own speed.
  4. The first shot crops to the square that opens the Selected work scene, so the hand-over is seamless.
  It lives inside the work scene's own pinned stage and is driven by the first part of its scroll,
  so the square lands exactly where, and when, the scene starts.
*/

const N = projects.length
const clamp01 = (v) => Math.min(1, Math.max(0, v))
const seg = (p, a, b) => clamp01((p - a) / (b - a))
const inOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const expoInOut = (t) => (t === 0 || t === 1 ? t : t < 0.5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2)
const outCubic = (t) => 1 - Math.pow(1 - t, 3)

// Write a style only when it changed, so a scroll frame touches as little as possible.
const set = (el, prop, value) => {
  const memo = el.__memo || (el.__memo = {})
  if (memo[prop] === value) return
  memo[prop] = value
  el.style[prop] = value
}
// Small grey copies of the shots for the reel (public/img/reel): far less to decode and composite.
const thumb = (src) => src.replace(/^\/img\/(.+)\.(png|jpe?g)$/, '/img/reel/$1.webp')

// Screens of scroll the work scene takes (see Work.jsx: 120svh per project + one screen).
const SCREENS = Math.round((N * 120 + 100) / 100)

const WorkIntro = forwardRef(function WorkIntro({ areaRef, stageRef }, ref) {
  const deck = useRef(null)
  const cards = useRef([])
  const head = useRef(null)
  const headNow = useRef(null)
  const caption = useRef(null)
  const note = useRef(null)
  const dims = useRef({ cw: 0, ch: 0, S: 0, gap: 0 })
  const render = useCallback((p) => {
    const { cw, ch, S, gap } = dims.current
    if (!cw) return

    // Where the reel stands, in cards: runs 0 -> last, holds, rewinds hard to 0.
    const run = inOut(seg(p, 0.1, 0.66))
    const rewind = expoInOut(seg(p, 0.7, 0.84))
    const o = run * (N - 1) * (1 - rewind)
    const whip = Math.sin(Math.PI * seg(p, 0.7, 0.84)) // strongest mid-rewind
    const land = outCubic(seg(p, 0.86, 1)) // first shot becomes the scene's square

    cards.current.forEach((el, i) => {
      if (!el) return
      const deal = outCubic(seg(p, 0.0 + Math.min(i, 5) * 0.018, 0.12 + Math.min(i, 5) * 0.018))
      const d = i - o
      const ad = Math.abs(d)
      let x = d * gap
      let rot = Math.max(-62, Math.min(62, -d * 34))
      let scale = 1 - Math.min(ad, 4) * 0.11
      let op = clamp01(4.6 - ad) * deal
      let z = -Math.min(ad, 5) * 120 - (1 - deal) * 900

      // Rewind: everything streaks left, stretched by speed.
      const stretch = 1 + whip * 0.35
      const skew = -whip * 14

      if (i === 0) {
        // Crop 4:3 to a square and grow to the scene's square size.
        const cut = ((cw - ch) / 2) * land
        set(el, 'clipPath', cut > 0.05 ? `inset(0px ${cut.toFixed(1)}px)` : 'none')
        scale = scale + ((S / ch) - scale) * land
        rot *= 1 - land
        z *= 1 - land
      } else {
        op *= 1 - land
      }

      // Cards out of sight skip the compositor entirely, and are not moved.
      const shown = op > 0.003
      // 'inherit', not 'visible': the reel as a whole is hidden once the projects start.
      set(el, 'visibility', shown ? 'inherit' : 'hidden')
      if (!shown) return
      set(el, 'opacity', op.toFixed(3))
      set(el, 'transform',
        `translate(-50%, -50%) translate3d(${x.toFixed(1)}px, 0, ${z.toFixed(1)}px) ` +
        `rotateY(${rot.toFixed(2)}deg) skewX(${skew.toFixed(2)}deg) scale(${(scale * stretch).toFixed(4)}, ${scale.toFixed(4)})`)
      set(el, 'zIndex', String(100 - Math.round(ad)))
    })

    // Words: the promise, then the turn.
    const inT = outCubic(seg(p, 0.0, 0.1))
    const outT = seg(p, 0.66, 0.74)
    const nowIn = outCubic(seg(p, 0.74, 0.82))
    const nowOut = seg(p, 0.9, 0.98)
    set(head.current, 'transform', `translateY(${((1 - inT) * 110 + outT * -110).toFixed(2)}%)`)
    set(headNow.current, 'transform', `translateY(${((1 - nowIn) * 110 + nowOut * -110).toFixed(2)}%)`)
    set(note.current, 'opacity', (1 - land).toFixed(3))
    set(caption.current, 'opacity', (1 - land).toFixed(3))

    const k = Math.min(N - 1, Math.max(0, Math.round(o)))
    if (caption.current.dataset.k !== String(k)) {
      caption.current.dataset.k = String(k)
      caption.current.textContent = `${projects[k].name}, ${k + 1} of ${N}`
    }
  }, [])

  const measure = useCallback(() => {
      const box = areaRef.current?.getBoundingClientRect()
      const stage = stageRef.current?.getBoundingClientRect()
      if (!box || !stage) return
      // The deck covers the scene's picture area exactly, so both share one centre.
      Object.assign(deck.current.style, {
        left: `${box.left - stage.left}px`, top: `${box.top - stage.top}px`,
        width: `${box.width}px`, height: `${box.height}px`,
      })
      // The same square as the work scene's first state (Work.jsx).
      const S = Math.min(window.innerWidth * (window.innerWidth < 760 ? 0.62 : 0.31), 450, box.height * 0.7)
      const ch = S * 0.82
      const cw = ch * (4 / 3)
      dims.current = { cw, ch, S, gap: cw * 0.62 }
      cards.current.forEach((el) => { if (el) { el.style.width = `${cw}px`; el.style.height = `${ch}px` } })
  }, [areaRef, stageRef])

  useImperativeHandle(ref, () => ({ render, measure }), [render, measure])

  return (
    <div className="reel" aria-hidden="true">
      <div className="reel__deck" ref={deck}>
        <div className="reel__words">
          <p className="reel__line display"><span ref={head}>{N} projects ahead</span></p>
          <p className="reel__line display"><span ref={headNow}>One at a time</span></p>
        </div>
        {projects.map((q, i) => (
          <div className={`reel__card${i === 0 ? ' reel__card--lead' : ''}`} key={q.name} ref={(el) => (cards.current[i] = el)}>
            <img
              src={thumb(q.img)}
              alt=""
              decoding="async"
              width={q.w}
              height={q.h}
              // A new project without its small copy yet falls back to the full shot, greyed by CSS.
              onError={(e) => {
                const im = e.currentTarget
                if (im.dataset.full) return
                im.dataset.full = '1'
                im.src = q.img
              }}
            />
          </div>
        ))}
      </div>
      <div className="work__bar reel__bar">
        <p className="work__fact" ref={note}>A long scroll: about {SCREENS} screens, one project at a time.</p>
        <p className="work__fact work__fact--r" ref={caption}>{projects[0].name}, 1 of {N}</p>
      </div>
    </div>
  )
})

export default WorkIntro
