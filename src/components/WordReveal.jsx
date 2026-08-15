import { useEffect, useState } from 'react'

/**
 * WordReveal — Editorial animated text component that reveals words sequentially.
 * text: string
 * className?: string
 * delay?: number (ms start delay)
 */
export default function WordReveal({ text, className = '', delay = 0 }) {
  const [visibleCount, setVisibleCount] = useState(0)
  const words = text.split(' ')

  useEffect(() => {
    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        setVisibleCount((prev) => {
          if (prev < words.length) return prev + 1
          clearInterval(interval)
          return prev
        })
      }, 70)
      return () => clearInterval(interval)
    }, delay)

    return () => clearTimeout(timer)
  }, [text, words.length, delay])

  return (
    <span className={`word-reveal ${className}`}>
      {words.map((word, i) => (
        <span
          key={i}
          className={`word-item ${i < visibleCount ? 'visible' : ''}`}
          style={{
            display: 'inline-block',
            marginRight: '0.28em',
            opacity: i < visibleCount ? 1 : 0,
            transform: i < visibleCount ? 'translateY(0)' : 'translateY(8px)',
            transition: 'opacity 300ms cubic-bezier(0.16, 1, 0.3, 1), transform 300ms cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {word}
        </span>
      ))}
    </span>
  )
}
