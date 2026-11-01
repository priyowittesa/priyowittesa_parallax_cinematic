import { useEffect, useRef } from 'react'

/*
  "Touching water" on the hero name.
  Each line of the name gets an SVG displacement filter. The displacement map is a neutral grey
  field (no movement) with one patch of concentric rings that follows the cursor, so only the
  letters near the pointer bend, as if seen through a ripple. The ripple's strength follows the
  pointer's speed and settles back to calm.
*/

const RINGS = 3.5

// Concentric rings in red/green (x/y displacement) that fade to neutral grey at the edge.
function ringMap() {
  const n = 48
  let stops = ''
  for (let i = 0; i <= n; i++) {
    const t = i / n
    const amp = 120 * Math.pow(1 - t, 1.3) * Math.min(1, t * 6)
    const a = t * Math.PI * 2 * RINGS
    const r = Math.round(128 + amp * Math.sin(a))
    const g = Math.round(128 + amp * Math.cos(a))
    stops += `<stop offset="${(t * 100).toFixed(2)}%" stop-color="rgb(${r},${g},128)"/>`
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><defs><radialGradient id="g" cx="50%" cy="50%" r="50%">${stops}</radialGradient></defs><rect width="400" height="400" fill="url(#g)"/></svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

/* The SVG that holds one filter per line. Rendered once, invisible. */
export function WaterFilters({ ids }) {
  const map = useRef(ringMap())
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true" focusable="false">
      <defs>
        {ids.map((id) => (
          <filter
            key={id}
            id={id}
            x="-5%" y="-20%" width="110%" height="140%"
            primitiveUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodColor="rgb(128,128,128)" result="calm" />
            <feImage href={map.current} x="-1000" y="-1000" width="0" height="0" preserveAspectRatio="none" result="rings" />
            <feComposite in="rings" in2="calm" operator="over" result="map" />
            <feDisplacementMap in="SourceGraphic" in2="map" scale="0" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        ))}
      </defs>
    </svg>
  )
}

/*
  Drives the filters. `lines` are refs to the elements that carry `filter: url(#id)`,
  `ids` the matching filter ids, `area` the element whose pointer events we listen to.
*/
export function useWater(area, lines, ids, enabled) {
  useEffect(() => {
    const el = area.current
    if (!el || !enabled) return
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!fine || reduce) return

    const parts = ids.map((id) => {
      const f = document.getElementById(id)
      return { img: f?.querySelector('feImage'), disp: f?.querySelector('feDisplacementMap') }
    })

    let target = null // pointer in viewport coordinates
    let pos = null // eased ripple centre
    let last = null
    let energy = 0
    let raf = 0
    let t0 = performance.now()

    const onMove = (e) => {
      target = { x: e.clientX, y: e.clientY }
      if (!pos) pos = { ...target }
      if (last) {
        const speed = Math.hypot(e.clientX - last.x, e.clientY - last.y)
        energy = Math.min(1, energy + speed / 60)
      }
      last = target
      if (!raf) raf = requestAnimationFrame(tick)
    }
    const onLeave = () => { last = null }

    const tick = (now) => {
      raf = 0
      if (!target) return
      pos.x += (target.x - pos.x) * 0.2
      pos.y += (target.y - pos.y) * 0.2
      energy *= 0.94
      const wobble = 1 + 0.18 * Math.sin((now - t0) / 90)
      let alive = energy > 0.01

      lines.forEach((ref, i) => {
        const node = ref.current
        const p = parts[i]
        if (!node || !p.img || !p.disp) return
        const r = node.getBoundingClientRect()
        const radius = r.height * 0.85
        // The filter works in the line's own coordinates (its top-left is 0,0).
        const lx = pos.x - r.left
        const ly = pos.y - r.top
        p.img.setAttribute('x', lx - radius)
        p.img.setAttribute('y', ly - radius)
        p.img.setAttribute('width', radius * 2)
        p.img.setAttribute('height', radius * 2)
        p.disp.setAttribute('scale', (energy * r.height * 0.6 * wobble).toFixed(2))
      })

      if (alive) raf = requestAnimationFrame(tick)
      else parts.forEach((p) => p.disp?.setAttribute('scale', '0'))
    }

    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerleave', onLeave)
    return () => {
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerleave', onLeave)
      cancelAnimationFrame(raf)
    }
  }, [area, lines, ids, enabled])
}
