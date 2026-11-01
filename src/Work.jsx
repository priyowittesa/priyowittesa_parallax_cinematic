import { useCallback, useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { projects } from './data.js'
import ProjectTip from './ProjectTip.jsx'

/*
  Selected work as a darkroom drying line. Every project is a disposable-camera print, pegged to a
  string. The string runs in a Z down the section: left to right along a row, back across on a
  diagonal, then left to right again, so the eye reads the work in that order.
*/

const N = projects.length
const pad = (n) => String(n).padStart(2, '0')

// Small colour copies of the shots (public/img/print), so fifteen prints stay light to decode.
const print = (src) => src.replace(/^\/img\/(.+)\.(png|jpe?g)$/, '/img/print/$1.webp')

// Each print hangs a little crooked, the way pegged photos do. Fixed, so it never jumps between visits.
const TILT = [-2.6, 1.8, -1.2, 2.4, 1.1, -2.1, 2.8, -1.6, 0.9, -2.8, 1.5, -0.9, 2.2, -1.9, 1.2]
const tilt = (i) => TILT[i % TILT.length]

// The rope sags between its ends: a quadratic curve from (0, 2) through (50, 22) to (100, 2) on a
// 100 x 20 box. A peg sits on the rope wherever its column's centre falls.
const ROPE = 'M0 2 Q50 22 100 2'
const sagAt = (t) => (2 + 40 * t * (1 - t)) / 20 // 0..1 of the rope box height

const columnsFor = (w) => (w < 640 ? 2 : w < 1100 ? 3 : 4)

function useColumns() {
  const [cols, setCols] = useState(() => (typeof window === 'undefined' ? 4 : columnsFor(window.innerWidth)))
  useEffect(() => {
    const onResize = () => setCols(columnsFor(window.innerWidth))
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  return cols
}

const LINE_EASE = [0.77, 0, 0.175, 1]

export default function Work() {
  const cols = useColumns()
  const reduce = useReducedMotion()
  const [tip, setTip] = useState(null)
  const closeTip = useCallback(() => setTip(null), [])

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

  const rows = []
  for (let k = 0; k < N; k += cols) rows.push(projects.slice(k, k + cols).map((p, j) => ({ p, i: k + j })))

  return (
    <section className="work" id="work" aria-labelledby="work-h">
      <header className="work__head">
        <h2 id="work-h" className="display work__title">Selected work</h2>
        <p className="work__lead">
          {N} projects, hung up to dry. Pick a print to open its prototype or case study.
        </p>
      </header>

      <div className="line" style={{ '--cols': cols }}>
        {rows.map((row, r) => (
          <motion.ol
            key={`${cols}-${r}`}
            className="line__row"
            start={row[0].i + 1}
            initial="off"
            whileInView="on"
            viewport={{ once: true, amount: 0.25 }}
          >
            {/* The rope across this row, and the diagonal that carries it down to the next. */}
            <motion.svg
              className="line__rope"
              viewBox="0 0 100 20"
              preserveAspectRatio="none"
              aria-hidden="true"
              variants={{
                off: { clipPath: reduce ? 'inset(0 0% 0 0)' : 'inset(0 100% 0 0)' },
                on: { clipPath: 'inset(0 0% 0 0)', transition: { duration: 0.9, ease: LINE_EASE } },
              }}
            >
              <path d={ROPE} vectorEffect="non-scaling-stroke" />
            </motion.svg>
            {r < rows.length - 1 && (
              <motion.svg
                className="line__turn"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                aria-hidden="true"
                variants={{
                  off: { clipPath: reduce ? 'inset(0 0 0% 0)' : 'inset(0 0 100% 0)' },
                  on: { clipPath: 'inset(0 0 0% 0)', transition: { duration: 0.8, delay: 0.7, ease: LINE_EASE } },
                }}
              >
                <path d="M100 0 L0 100" vectorEffect="non-scaling-stroke" />
              </motion.svg>
            )}

            {row.map(({ p, i }, c) => {
              const rot = tilt(i)
              const delay = 0.25 + c * 0.08
              return (
                <motion.li
                  key={p.name}
                  className="slot"
                  style={{ '--hang': sagAt((c + 0.5) / cols), '--rot': `${rot}deg` }}
                  variants={{
                    off: reduce ? { opacity: 0 } : { opacity: 0, y: -28, rotate: rot - 9 },
                    on: reduce
                      ? { opacity: 1, transition: { duration: 0.3, delay: c * 0.05 } }
                      : {
                          opacity: 1, y: 0, rotate: rot,
                          transition: {
                            opacity: { duration: 0.25, delay },
                            default: { type: 'spring', bounce: 0.42, duration: 1.1, delay },
                          },
                        },
                  }}
                >
                  <span className="peg" aria-hidden="true" />
                  <button
                    type="button"
                    className={`print${i % 2 ? ' print--b' : ''}`}
                    onClick={open(i)}
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
                      <span className="print__stamp" aria-hidden="true">{pad(i + 1)} · {pad(N)}</span>
                    </span>
                    <span className="print__label display" aria-hidden="true">{p.name}</span>
                    <span className="print__foot" aria-hidden="true">
                      <span>{p.tags[0]}</span>
                      <span>{p.font}</span>
                    </span>
                  </button>
                </motion.li>
              )
            })}
          </motion.ol>
        ))}
      </div>

      <ProjectTip tip={tip} onClose={closeTip} />
    </section>
  )
}
