import { useRef, useState } from 'react'
import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react'

/*
  The P mark, drawn as a technical drawing that assembles while it scrolls past.
  The mark is three points and one curve on the same 160-unit module: the dots are 160 across,
  the bowl is a 160-wide stroke whose arms line up with the first two dots.
  First the construction lines draw in, then each part slides in from its own depth and locks
  into place. The pointer tilts the parts like layers at different distances.
*/

const DOTS = [
  { cy: 225, from: { x: -230, y: -170 }, range: [0.1, 0.5], depth: 16 },
  { cy: 515, from: { x: -320, y: 30 }, range: [0.16, 0.56], depth: 26 },
  { cy: 800, from: { x: -140, y: 250 }, range: [0.22, 0.62], depth: 38 },
]
const BOWL = { from: { x: 320, y: -80, r: 90 }, range: [0.14, 0.6], depth: 22 }
const BOWL_PATH = 'M456 225H558A145 145 0 0 1 558 515H456'
const outCubic = (t) => 1 - Math.pow(1 - t, 3)

function usePart(progress, range, from, depth, mx, my) {
  const t = useTransform(progress, range, [0, 1], { clamp: true, ease: outCubic })
  const x = useTransform(() => from.x * (1 - t.get()) + mx.get() * depth)
  const y = useTransform(() => from.y * (1 - t.get()) + my.get() * depth)
  const rotate = useTransform(t, [0, 1], [from.r || 0, 0])
  const opacity = useTransform(t, [0, 0.35], [0, 1])
  return { x, y, rotate, opacity }
}

function Dot({ progress, d, mx, my }) {
  const s = usePart(progress, d.range, d.from, d.depth, mx, my)
  return <motion.circle cx="320" cy={d.cy} r="80" className="mark__part" style={s} />
}

export default function Mark({ children }) {
  const track = useRef(null)
  const reduce = useReducedMotion()
  // Desktop: the drawing is pinned in a tall column, and assembles from an empty sheet once the
  // visitor has reached the section (column top near the top of the screen) until the pin releases.
  // Phone: no pin, it assembles while it crosses the screen.
  const [phone] = useState(() => window.matchMedia('(max-width: 760px)').matches)
  const { scrollYProgress } = useScroll({
    target: track,
    offset: phone ? ['start 0.8', 'end 0.85'] : ['start 0.12', 'end end'],
  })
  const assembled = useMotionValue(1) // reduced motion: the drawing is simply finished
  const progress = reduce ? assembled : scrollYProgress

  // Pointer position over the drawing, -1..1, softened.
  const rawX = useMotionValue(0)
  const rawY = useMotionValue(0)
  const mx = useSpring(rawX, { stiffness: 120, damping: 20, mass: 0.6 })
  const my = useSpring(rawY, { stiffness: 120, damping: 20, mass: 0.6 })
  const onMove = (e) => {
    if (reduce || e.pointerType !== 'mouse') return
    const r = e.currentTarget.getBoundingClientRect()
    rawX.set(((e.clientX - r.left) / r.width) * 2 - 1)
    rawY.set(((e.clientY - r.top) / r.height) * 2 - 1)
  }
  const onLeave = () => { rawX.set(0); rawY.set(0) }

  const bowl = usePart(progress, BOWL.range, BOWL.from, BOWL.depth, mx, my)

  // Construction lines draw first, then step back once the parts are in place.
  const draw = useTransform(progress, [0.03, 0.32], [0, 1], { clamp: true })
  const guideFade = useTransform(progress, [0.62, 0.76], [1, 0.45], { clamp: true })
  const gx = useTransform(() => mx.get() * -8)
  const gy = useTransform(() => my.get() * -8)
  const labels = useTransform(progress, [0.3, 0.42], [0, 1], { clamp: true })

  return (
    <figure className="intro__fig" ref={track}>
     <div className="intro__pin">
     <div className="mark" onPointerMove={onMove} onPointerLeave={onLeave}>
      <svg
        viewBox="0 0 1024 1024"
        role="img"
        aria-label="The P mark of Priyowittesa: three dots stacked as the stem and one curve as the bowl"
      >
        <defs>
          <pattern id="mark-grid" width="80" height="80" patternUnits="userSpaceOnUse" x="0" y="25">
            <path d="M80 0H0V80" fill="none" className="mark__grid" />
          </pattern>
        </defs>
        <rect x="-40" y="-40" width="1104" height="1104" fill="url(#mark-grid)" />

        <motion.g className="mark__guides" style={{ x: gx, y: gy, opacity: guideFade }}>
          {/* stem axis and the two lines the bowl's arms share with the dots */}
          <motion.path d="M320 80V950" style={{ pathLength: draw }} />
          <motion.path d="M150 225H860" style={{ pathLength: draw }} />
          <motion.path d="M150 515H860" style={{ pathLength: draw }} />
          {/* outlines of every part */}
          {DOTS.map((d) => (
            <motion.circle key={d.cy} cx="320" cy={d.cy} r="80" style={{ pathLength: draw }} />
          ))}
          <motion.path d="M456 145H558A225 225 0 0 1 558 595H456Z" style={{ pathLength: draw }} />
          <motion.path d="M456 305H558A65 65 0 0 1 558 435H456" style={{ pathLength: draw }} />
          {/* centre of the arc */}
          <motion.path d="M538 370H578M558 350V390" style={{ pathLength: draw }} />
          {/* dimensions */}
          <motion.g style={{ opacity: labels }}>
            <path d="M190 225V515M178 225H202M178 515H202" />
            <text x="172" y="378" textAnchor="end">290</text>
            <path d="M240 940H400M240 928V952M400 928V952" />
            <text x="320" y="985" textAnchor="middle">Ø 160</text>
            <path d="M558 370L740 188" />
            <text x="752" y="182">r 145</text>
          </motion.g>
        </motion.g>

        <g>
          <motion.path d={BOWL_PATH} className="mark__part mark__bowl" style={bowl} />
          {DOTS.map((d) => (
            <Dot key={d.cy} progress={progress} d={d} mx={mx} my={my} />
          ))}
        </g>
      </svg>
     </div>
     {children}
     </div>
    </figure>
  )
}
