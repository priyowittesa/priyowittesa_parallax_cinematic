import { motion } from 'motion/react'

export const EASE_OUT = [0.22, 1, 0.36, 1]

const group = {
  hidden: {},
  show: { transition: { staggerChildren: 0.075, delayChildren: 0.05 } },
}
const part = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE_OUT } },
}

/* A section's parts enter one after another (heading, text, picture) when it scrolls in. */
export function Stagger({ as = 'div', amount = 0.15, children, ...rest }) {
  const Tag = motion[as]
  return (
    <Tag variants={group} initial="hidden" whileInView="show" viewport={{ once: true, amount }} {...rest}>
      {children}
    </Tag>
  )
}

export function Part({ as = 'div', children, ...rest }) {
  const Tag = motion[as]
  return (
    <Tag variants={part} {...rest}>
      {children}
    </Tag>
  )
}
