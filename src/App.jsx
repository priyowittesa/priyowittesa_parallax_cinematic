import { useCallback, useEffect, useState } from 'react'
import Lenis from 'lenis'
import { MotionConfig, motion, useScroll, useSpring } from 'motion/react'
import Hero from './Hero.jsx'
import Loader, { IntroReady } from './Loader.jsx'
import Work from './Work.jsx'
import { Intro, Experience, About, Contact, Footer } from './Sections.jsx'

function useSmoothScroll(enabled) {
  useEffect(() => {
    if (!enabled) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const lenis = new Lenis({ lerp: 0.1, anchors: true })
    let id
    const raf = (t) => {
      lenis.raf(t)
      id = requestAnimationFrame(raf)
    }
    id = requestAnimationFrame(raf)
    return () => {
      cancelAnimationFrame(id)
      lenis.destroy()
    }
  }, [enabled])
}

function ScrollBar() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 40, restDelta: 0.001 })
  return <motion.div className="topbar" style={{ scaleX }} aria-hidden="true" />
}

export default function App() {
  // The loader covers the page until it has loaded; the hero plays its entrance as the sheet falls.
  const [revealed, setRevealed] = useState(false)
  const [loading, setLoading] = useState(true)
  const reveal = useCallback(() => setRevealed(true), [])
  const finish = useCallback(() => setLoading(false), [])
  useSmoothScroll(!loading)

  useEffect(() => {
    // Always start at the top, and hold the page still while the loader is up.
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
    window.scrollTo(0, 0)
  }, [])
  useEffect(() => {
    document.documentElement.classList.toggle('is-loading', loading)
  }, [loading])

  return (
    <MotionConfig reducedMotion="user">
      {loading && <Loader onReveal={reveal} onDone={finish} />}
      <IntroReady.Provider value={revealed}>
      <a className="skip" href="#work">Skip to work</a>
      <ScrollBar />
      <main>
        <Hero />
        <Intro />
        <Experience />
        <Work />
        <About />
        <Contact />
      </main>
      <Footer />
      </IntroReady.Provider>
    </MotionConfig>
  )
}
