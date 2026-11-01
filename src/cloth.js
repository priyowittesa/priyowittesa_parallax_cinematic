/*
  A sheet of cloth that drops off the screen.
  Verlet physics on a grid (gravity, stretch and bend constraints, air resistance against the
  cloth's own normals), drawn with WebGL: the loader is painted onto the sheet as its texture and
  every vertex is lit, so folds catch the light and the back of the fabric turns darker.
*/

const VS = `
attribute vec2 a_pos;
attribute vec2 a_uv;
attribute vec2 a_light;
varying vec2 v_uv;
varying vec2 v_light;
void main() {
  v_uv = a_uv;
  v_light = a_light;
  gl_Position = vec4(a_pos, 0.0, 1.0);
}`

const FS = `
precision mediump float;
uniform sampler2D u_tex;
varying vec2 v_uv;
varying vec2 v_light;
void main() {
  vec3 c = texture2D(u_tex, v_uv).rgb;
  gl_FragColor = vec4(c * v_light.x + vec3(v_light.y), 1.0);
}`

function shader(gl, type, src) {
  const s = gl.createShader(type)
  gl.shaderSource(s, src)
  gl.compileShader(s)
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s))
  return s
}

// Light from the upper left, in front of the screen. The flat sheet faces the viewer (normal 0,0,-1).
const L = (() => { const v = [-0.35, -0.55, -0.76]; const n = Math.hypot(...v); return v.map((x) => x / n) })()
const H = (() => { const v = [L[0], L[1], L[2] - 1]; const n = Math.hypot(...v); return v.map((x) => x / n) })()
const FLAT_DIFFUSE = -L[2]
const FLAT_SPEC = Math.pow(-H[2], 48)

export function createCloth(canvas) {
  const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: true })
  if (!gl) return null

  const prog = gl.createProgram()
  gl.attachShader(prog, shader(gl, gl.VERTEX_SHADER, VS))
  gl.attachShader(prog, shader(gl, gl.FRAGMENT_SHADER, FS))
  gl.linkProgram(prog)
  gl.useProgram(prog)
  const loc = (n) => gl.getAttribLocation(prog, n)

  let W = 0, Ht = 0, cols = 0, rows = 0, n = 0
  let P, Q, pin, rest, cons, uv, light, clip
  const posBuf = gl.createBuffer()
  const uvBuf = gl.createBuffer()
  const lightBuf = gl.createBuffer()
  const idxBuf = gl.createBuffer()
  let indexCount = 0
  const tex = gl.createTexture()

  function setup(width, height) {
    W = width; Ht = height
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = Math.round(W * dpr)
    canvas.height = Math.round(Ht * dpr)
    gl.viewport(0, 0, canvas.width, canvas.height)

    cols = 34
    rows = Math.max(14, Math.round((cols - 1) * (Ht / W)) + 1)
    n = cols * rows
    P = new Float32Array(n * 3) // position
    Q = new Float32Array(n * 3) // previous position
    pin = new Float32Array(n) // time at which a point lets go (Infinity = never pinned)
    uv = new Float32Array(n * 2)
    light = new Float32Array(n * 2)
    clip = new Float32Array(n * 2)
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const i = r * cols + c
      const x = (c / (cols - 1)) * W, y = (r / (rows - 1)) * Ht
      P[i * 3] = Q[i * 3] = x
      P[i * 3 + 1] = Q[i * 3 + 1] = y
      uv[i * 2] = c / (cols - 1)
      uv[i * 2 + 1] = r / (rows - 1)
      pin[i] = r === 0 ? 0 : -1
    }

    // Constraints: [a, b, rest length, stiffness]. Neighbours hold the weave, skip-one links resist bending.
    const list = []
    const link = (a, b, k) => {
      const dx = P[b * 3] - P[a * 3], dy = P[b * 3 + 1] - P[a * 3 + 1]
      list.push(a, b, Math.hypot(dx, dy), k)
    }
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const i = r * cols + c
      if (c + 1 < cols) link(i, i + 1, 1)
      if (r + 1 < rows) link(i, i + cols, 1)
      if (c + 2 < cols) link(i, i + 2, 0.18)
      if (r + 2 < rows) link(i, i + cols * 2, 0.18)
    }
    cons = new Float32Array(list)

    const idx = []
    for (let r = 0; r < rows - 1; r++) for (let c = 0; c < cols - 1; c++) {
      const i = r * cols + c
      idx.push(i, i + 1, i + cols, i + 1, i + cols + 1, i + cols)
    }
    const Idx = n > 65535 ? Uint32Array : Uint16Array
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, idxBuf)
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Idx(idx), gl.STATIC_DRAW)
    indexCount = idx.length

    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuf)
    gl.bufferData(gl.ARRAY_BUFFER, uv, gl.STATIC_DRAW)
  }

  function setTexture(source) {
    gl.bindTexture(gl.TEXTURE_2D, tex)
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  }

  // Perspective onto the screen, lighting from vertex normals.
  const F = 1500
  function render() {
    const cx = W / 2, cy = Ht / 2
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const i = r * cols + c
      const x = P[i * 3], y = P[i * 3 + 1], z = P[i * 3 + 2]
      const s = F / Math.max(200, F + z)
      clip[i * 2] = ((cx + (x - cx) * s) / W) * 2 - 1
      clip[i * 2 + 1] = 1 - ((cy + (y - cy) * s) / Ht) * 2

      const l = c > 0 ? i - 1 : i, rr = c < cols - 1 ? i + 1 : i
      const u = r > 0 ? i - cols : i, d = r < rows - 1 ? i + cols : i
      const ax = P[rr * 3] - P[l * 3], ay = P[rr * 3 + 1] - P[l * 3 + 1], az = P[rr * 3 + 2] - P[l * 3 + 2]
      const bx = P[d * 3] - P[u * 3], by = P[d * 3 + 1] - P[u * 3 + 1], bz = P[d * 3 + 2] - P[u * 3 + 2]
      // normal = a x b, pointing at the viewer (negative z) for the flat sheet
      let nx = ay * bz - az * by, ny = az * bx - ax * bz, nz = ax * by - ay * bx
      const len = Math.hypot(nx, ny, nz) || 1
      nx /= -len; ny /= -len; nz /= -len
      const facing = nz < 0 // front of the fabric toward the viewer
      const dif = Math.abs(nx * L[0] + ny * L[1] + nz * L[2]) / FLAT_DIFFUSE
      const spec = Math.pow(Math.max(0, Math.abs(nx * H[0] + ny * H[1] + nz * H[2])), 48) - FLAT_SPEC
      light[i * 2] = Math.min(1.35, 0.3 + 0.7 * dif) * (facing ? 1 : 0.55)
      light[i * 2 + 1] = Math.max(0, spec) * 0.28
    }
    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT)
    bind(posBuf, clip, 'a_pos')
    bind(uvBuf, null, 'a_uv')
    bind(lightBuf, light, 'a_light')
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, idxBuf)
    gl.drawElements(gl.TRIANGLES, indexCount, n > 65535 ? gl.UNSIGNED_INT : gl.UNSIGNED_SHORT, 0)
  }
  function bind(buf, data, name) {
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    if (data) gl.bufferData(gl.ARRAY_BUFFER, data, gl.DYNAMIC_DRAW)
    const a = loc(name)
    gl.enableVertexAttribArray(a)
    gl.vertexAttribPointer(a, 2, gl.FLOAT, false, 0, 0)
  }
  if (n === 0) { /* set up on first size() */ }

  /*
    The drop: a breeze ripples the pinned sheet, the pins let go from the centre outwards so the
    middle sags first, then gravity takes it while the air folds it.
  */
  function drop({ onFrame, onDone }) {
    const G = 2900
    const BREEZE = 0.38 // seconds of ripple before the first pin lets go
    const SPREAD = 0.26 // seconds for the release to reach the corners
    for (let c = 0; c < cols; c++) {
      const u = Math.abs(c / (cols - 1) - 0.5) * 2
      pin[c] = BREEZE + Math.pow(u, 1.4) * SPREAD + (u > 0.97 ? 0.12 : 0)
    }
    const dt = 1 / 120
    let t = 0
    let last = performance.now()
    let raf = 0
    const vel = new Float32Array(n * 3)

    const normalAt = (i, out) => {
      const c = i % cols, r = (i / cols) | 0
      const l = c > 0 ? i - 1 : i, rr = c < cols - 1 ? i + 1 : i
      const u = r > 0 ? i - cols : i, d = r < rows - 1 ? i + cols : i
      const ax = P[rr * 3] - P[l * 3], ay = P[rr * 3 + 1] - P[l * 3 + 1], az = P[rr * 3 + 2] - P[l * 3 + 2]
      const bx = P[d * 3] - P[u * 3], by = P[d * 3 + 1] - P[u * 3 + 1], bz = P[d * 3 + 2] - P[u * 3 + 2]
      let nx = ay * bz - az * by, ny = az * bx - ax * bz, nz = ax * by - ay * bx
      const len = Math.hypot(nx, ny, nz) || 1
      out[0] = nx / len; out[1] = ny / len; out[2] = nz / len
    }
    const nrm = [0, 0, 0]

    const step = () => {
      t += dt
      for (let i = 0; i < n; i++) {
        const k = i * 3
        const pinned = pin[i] >= 0 && t < pin[i]
        const vx = P[k] - Q[k], vy = P[k + 1] - Q[k + 1], vz = P[k + 2] - Q[k + 2]
        vel[k] = vx; vel[k + 1] = vy; vel[k + 2] = vz
        if (pinned) { Q[k] = P[k]; Q[k + 1] = P[k + 1]; Q[k + 2] = P[k + 2]; continue }
        const r = (i / cols) | 0, c = i % cols
        let ax = 0, ay = t > BREEZE ? G : G * 0.15, az = 0
        // The breeze: a wave pushing the cloth toward the viewer, travelling across the sheet.
        const wave = Math.sin(c * 0.35 - t * 14 + r * 0.22)
        az += -900 * (0.55 + 0.45 * wave) * Math.exp(-t * 1.6) * (r / rows)
        // Air resistance against the face of the cloth: this is what billows and folds it.
        normalAt(i, nrm)
        const vn = (vx * nrm[0] + vy * nrm[1] + vz * nrm[2]) / dt
        const drag = 2.2 * (0.8 + 0.4 * Math.sin(c * 0.5 + r * 0.31))
        ax -= drag * vn * nrm[0]; ay -= drag * vn * nrm[1]; az -= drag * vn * nrm[2]
        const damp = 0.992
        Q[k] = P[k]; Q[k + 1] = P[k + 1]; Q[k + 2] = P[k + 2]
        P[k] += vx * damp + ax * dt * dt
        P[k + 1] += vy * damp + ay * dt * dt
        P[k + 2] += vz * damp + az * dt * dt
      }
      for (let it = 0; it < 5; it++) {
        for (let j = 0; j < cons.length; j += 4) {
          const a = cons[j], b = cons[j + 1], len = cons[j + 2], k = cons[j + 3]
          const ia = a * 3, ib = b * 3
          const dx = P[ib] - P[ia], dy = P[ib + 1] - P[ia + 1], dz = P[ib + 2] - P[ia + 2]
          const d = Math.hypot(dx, dy, dz) || 1
          const diff = ((d - len) / d) * 0.5 * k
          const pa = pin[a] >= 0 && t < pin[a], pb = pin[b] >= 0 && t < pin[b]
          const wa = pa ? 0 : pb ? 2 : 1, wb = pb ? 0 : pa ? 2 : 1
          P[ia] += dx * diff * wa; P[ia + 1] += dy * diff * wa; P[ia + 2] += dz * diff * wa
          P[ib] -= dx * diff * wb; P[ib + 1] -= dy * diff * wb; P[ib + 2] -= dz * diff * wb
        }
      }
    }

    const frame = (now) => {
      let elapsed = Math.min(0.05, (now - last) / 1000)
      last = now
      while (elapsed > 0) { step(); elapsed -= dt }
      render()
      onFrame?.(t)
      let top = Infinity
      for (let i = 0; i < n; i++) top = Math.min(top, P[i * 3 + 1] * (F / Math.max(200, F + P[i * 3 + 2])))
      if (top > Ht * 1.15 || t > 4) { gl.clear(gl.COLOR_BUFFER_BIT); onDone?.(); return }
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
  }

  return {
    size: setup,
    setTexture,
    render,
    drop,
  }
}

/* Paints the loader as it looks on screen: ground, linen, then every piece of text and the bar. */
export function paintSheet(root, { bg, fabric, width, height }) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  const cv = document.createElement('canvas')
  cv.width = Math.round(width * dpr)
  cv.height = Math.round(height * dpr)
  const ctx = cv.getContext('2d')
  ctx.scale(dpr, dpr)
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, width, height)
  if (fabric?.complete && fabric.naturalWidth) {
    // same as CSS "center / cover" with soft-light blending
    const s = Math.max(width / fabric.naturalWidth, height / fabric.naturalHeight)
    const w = fabric.naturalWidth * s, h = fabric.naturalHeight * s
    ctx.globalCompositeOperation = 'soft-light'
    ctx.drawImage(fabric, (width - w) / 2, (height - h) / 2, w, h)
    ctx.globalCompositeOperation = 'source-over'
  }
  if (!root) return cv

  for (const el of root.querySelectorAll('[data-paint="box"]')) {
    const r = el.getBoundingClientRect()
    ctx.fillStyle = getComputedStyle(el).backgroundColor
    ctx.fillRect(r.left, r.top, r.width, r.height) // the rect already includes any scale
  }
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const text = node.textContent.replace(/ /g, ' ')
    if (!text.trim()) continue
    const el = node.parentElement
    if (el.closest('.sr-only')) continue
    const cs = getComputedStyle(el)
    const range = document.createRange()
    range.selectNodeContents(node)
    const rect = range.getClientRects()[0]
    if (!rect) continue
    ctx.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`
    if ('letterSpacing' in ctx) ctx.letterSpacing = cs.letterSpacing === 'normal' ? '0px' : cs.letterSpacing
    ctx.fillStyle = cs.color
    ctx.textBaseline = 'alphabetic'
    const str = cs.textTransform === 'uppercase' ? text.toUpperCase() : text
    const m = ctx.measureText(str)
    ctx.fillText(str, rect.left, rect.top + m.fontBoundingBoxAscent)
  }
  return cv
}
