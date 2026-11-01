import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Stagger, Part, EASE_OUT } from './motion.jsx'
import Assemble from './Assemble.jsx'
import Stat from './Stat.jsx'
import Mark from './Mark.jsx'
import Negative from './Negative.jsx'
import { experience, skills, skillShots, records, person } from './data.js'
import { usePeek } from './Peek.jsx'
import Wordmark from './Wordmark.jsx'

/* ---------- Intro ---------- */
export function Intro() {
  return (
    <section className="section" aria-labelledby="intro-h">
      <Stagger className="grid12 intro">
        <Part className="intro__head">
          <h2 id="intro-h" className="h2">Trained as an engineer</h2>
        </Part>
        <Part className="intro__text">
          <Negative>
          <p>
            I design enterprise software for management, finance and field operations at PT. Altimeda Cipta Visitama,
            usually three or four projects at once, from Design Thinking research to the last high&#8209;fidelity screen.
          </p>
          <p>
            Before design I studied Software Engineering at Telkom University and built REST APIs in Node.js and MongoDB,
            so I design with the developer's side of the work in mind, and talk to clients, Project Managers and
            developers in their own terms.
          </p>
          </Negative>
        </Part>
        <Mark>
          <figcaption className="intro__note">
            <strong>The P mark</strong>
            Three points and one curve on a single 160-unit module, drawn the way I build interfaces: parts first,
            then the system that holds them.
          </figcaption>
        </Mark>
        <div className="intro__stats">
          <Stat index={0} to={100} format={(v) => `${Math.round(v)}+`}
            label="screens held together by one design system, built from scratch" />
          <Stat index={1} to={4} format={(v) => `${Math.round(v * 0.75)}–${Math.round(v)}`}
            label="features a day on high-priority requests, against a normal one to two" />
          <Stat index={2} to={1} format={() => '1 week'}
            label="to deliver each of two client projects, start to finish" />
        </div>
      </Stagger>
    </section>
  )
}

/* ---------- Experience: one item per poster line ---------- */
export function Experience() {
  const [open, setOpen] = useState(0)
  return (
    <section className="section exp" id="experience" aria-labelledby="exp-h">
      <Stagger>
        <Part as="h2" id="exp-h" className="exp__head display">Experience</Part>
        <ul>
          {experience.map((e, i) => {
            const isOpen = open === i
            return (
              <Part as="li" className="exp__item" key={e.short}>
                <button
                  type="button"
                  className="exp__btn"
                  aria-expanded={isOpen}
                  aria-controls={`exp-${i}`}
                  onClick={() => setOpen(isOpen ? -1 : i)}
                >
                  <span className="exp__name display">{e.short}</span>
                  <span className="exp__when">
                    {e.when}
                    <span className="exp__plus" aria-hidden="true" />
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={`exp-${i}`}
                      className="exp__panel"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.45, ease: EASE_OUT }}
                    >
                      <div className="exp__body">
                        <p className="exp__role">
                          {e.title}
                          <span>{e.place}</span>
                        </p>
                        <ul className="exp__points">
                          {e.points.map((pt) => (
                            <li key={pt}>{pt}</li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Part>
            )
          })}
        </ul>
      </Stagger>
    </section>
  )
}

/* ---------- About: side facts, wide paragraph ---------- */
export function About() {
  const peek = usePeek(skillShots)
  return (
    <section className="section about" id="about" aria-labelledby="about-h" style={{ background: 'var(--surface)' }}>
      <Assemble text="I turn user and business needs into practical digital products, from the first research note to a design system of more than 100 screens.">
        <h2 id="about-h" className="h2">About</h2>
      </Assemble>
      <Stagger className="about__row">
        <Part as="dl" className="facts">
          <div><dt>Based in</dt><dd>Jakarta Timur, Indonesia</dd></div>
          <div><dt>Studied</dt><dd>Software Engineering, Telkom University, 2019–2023</dd></div>
          <div><dt>Works in</dt><dd>Agile, Scrum, Goal Directed Design</dd></div>
        </Part>
        <Part>
          <p className="about__para">
            At Altimeda that means Design Thinking research, user flows, wireframes, prototypes and high-fidelity
            screens, and design systems built from scratch so a product of more than 100 screens still reads as one
            thing.
          </p>
          <p className="about__para">
            At Xendit I designed two payment features in a Scrum team, after studying five to six competitor products,
            and tested two to three alternatives for each with Product Managers.
          </p>
        </Part>
      </Stagger>

      <Stagger className="about__row">
        <Part as="p" className="about__label">Skills</Part>
        <Part className="lists" onPointerEnter={peek.warm}>
          {skills.map((s) => (
            <div key={s.group}>
              <h3>{s.group}</h3>
              <ul>{s.items.map((it) => <li key={it} className="skill" {...peek.bind(it)}>{it}</li>)}</ul>
            </div>
          ))}
        </Part>
        {peek.layer}
      </Stagger>

      <Stagger className="about__row">
        <Part as="p" className="about__label">Record</Part>
        <Part className="lists lists--2 rec">
          {records.map((r) => (
            <div key={r.group}>
              <h3>{r.group}</h3>
              <ul>{r.items.map(([a, b]) => <li key={a}><span>{a}</span><span>{b}</span></li>)}</ul>
            </div>
          ))}
        </Part>
      </Stagger>
    </section>
  )
}

/* ---------- Contact: display rows ---------- */
const Arrow = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
)

export function Contact() {
  const subject = encodeURIComponent('A project for you')
  const body = encodeURIComponent('Hi Danda,\n\nI would like to talk about a project:\n\n')
  return (
    <section className="contact" id="contact" aria-labelledby="contact-h">
      <Stagger>
        <Part as="h2" id="contact-h" className="h2">Let's work together</Part>
        <Part>
          <a className="row" href={`mailto:${person.email}`}>
            <span className="row__t">{person.email}</span>
            <small>Email</small>
          </a>
          <a className="row" href={person.phoneHref}>
            <span className="row__t">{person.phone}</span>
            <small>Phone</small>
          </a>
          <div className="row">
            <span className="row__social">
              {person.social.map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noreferrer">{s.label}</a>
              ))}
            </span>
          </div>
          <div className="row">
            <span>{person.city}</span>
          </div>
          <a className="row row--go" href={`mailto:${person.email}?subject=${subject}&body=${body}`}>
            <span>Start a project</span>
            <span className="go"><Arrow /></span>
          </a>
        </Part>
      </Stagger>
    </section>
  )
}

/* ---------- Footer: columns above, wordmark below ---------- */
export function Footer() {
  return (
    <footer className="footer">
      <div className="footer__cols">
        <div>
          <h2>Contact</h2>
          <ul>
            <li><a href={`mailto:${person.email}`}>{person.email}</a></li>
            <li><a href={person.phoneHref}>{person.phone}</a></li>
          </ul>
        </div>
        <div>
          <h2>Pages</h2>
          <ul>
            <li><a href="#work">Work</a></li>
            <li><a href="#experience">Experience</a></li>
            <li><a href="#about">About</a></li>
            <li><a href="#top">Back to top</a></li>
          </ul>
        </div>
        <div>
          <h2>Elsewhere</h2>
          <ul>
            {person.social.map((s) => (
              <li key={s.label}><a href={s.href} target="_blank" rel="noreferrer">{s.label}</a></li>
            ))}
          </ul>
        </div>
        <div>
          <h2>Resume</h2>
          <ul>
            <li><a href={person.resume} target="_blank" rel="noreferrer">Download the CV</a></li>
            <li>UI/UX Designer</li>
            <li>Jakarta Timur, Indonesia</li>
          </ul>
        </div>
      </div>
      <div className="footer__word">
        <svg className="w-desk" viewBox="0 0 1000 78" role="img" aria-label="Priyowittesa">
          <text x="0" y="76" textLength="1000" lengthAdjust="spacingAndGlyphs" fontFamily="Unbounded, sans-serif" fontWeight="800" fontSize="104">PRIYOWITTESA</text>
        </svg>
        <svg className="w-phone" viewBox="0 0 1000 380" role="img" aria-label="Priyowittesa">
          <text x="0" y="176" textLength="1000" lengthAdjust="spacingAndGlyphs" fontFamily="Unbounded, sans-serif" fontWeight="800" fontSize="232">PRIYO</text>
          <text x="0" y="372" textLength="1000" lengthAdjust="spacingAndGlyphs" fontFamily="Unbounded, sans-serif" fontWeight="800" fontSize="168">WITTESA</text>
        </svg>
        <p className="footer__legal">
          <span className="footer__copy">© 2026 <Wordmark className="footer__logo" label="I Komang Danda Priyowittesa" /></span>
          <span>Built with React, Motion and Lenis</span>
        </p>
      </div>
    </footer>
  )
}
