/**
 * MarqueeStrip — Horizontal ticker strip showcasing live delivery metrics
 * items: Array<string>
 */
export default function MarqueeStrip({ items }) {
  const content = items.join('   ✦   ')

  return (
    <div className="marquee-strip-wrap">
      <div className="marquee-strip-track">
        <span className="marquee-content">{content}   ✦   {content}   ✦   {content}</span>
      </div>
    </div>
  )
}
