// WCAG contrast check for the main text/background pairs of the AstroMind palette.
// Glass surfaces are composited over the darkest-plausible and lightest-plausible page background.
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16))
const mix = (fg, bg, a) => fg.map((c, i) => Math.round(c * a + bg[i] * (1 - a)))
const lum = (rgb) => {
  const [r, g, b] = rgb.map((v) => {
    const s = v / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
const ratio = (a, b) => {
  const [l1, l2] = [lum(a), lum(b)].sort((x, y) => y - x)
  return (l1 + 0.05) / (l2 + 0.05)
}

const page = { void: hex('#070d1f'), navy: hex('#101d35'), indigo: hex('#2a2d6e') }
// .glass = rgb(23 45 74 / .55) + white 9% highlight at the top-left corner (worst case for light text)
const glass = (bg) => mix([255, 255, 255], mix(hex('#172d4a'), bg, 0.55), 0.09)

const pairs = [
  ['muted #a9b8d0 on glass/navy', hex('#a9b8d0'), glass(page.navy), 4.5],
  ['muted #a9b8d0 on glass/indigo', hex('#a9b8d0'), glass(page.indigo), 4.5],
  ['muted #a9b8d0 on void', hex('#a9b8d0'), page.void, 4.5],
  ['white on glass/indigo', hex('#f4f7fa'), glass(page.indigo), 4.5],
  ['btn-primary text #061024 on #55c6e8', hex('#061024'), hex('#55c6e8'), 4.5],
  ['btn-primary text #061024 on #9d7bfa', hex('#061024'), hex('#9d7bfa'), 4.5],
  ['badge info #7de3ff on glass', hex('#7de3ff'), mix(hex('#55c6e8'), glass(page.indigo), 0.15), 4.5],
  ['badge watch #ffb38f on glass', hex('#ffb38f'), mix(hex('#fc6d26'), glass(page.indigo), 0.15), 4.5],
  ['badge nominal #86efac on glass', hex('#86efac'), mix(hex('#4ade80'), glass(page.indigo), 0.15), 4.5],
  ['badge attention #fecaca on glass', hex('#fecaca'), mix(hex('#f87171'), glass(page.indigo), 0.15), 4.5],
  ['cyan #55c6e8 link text on glass', hex('#55c6e8'), glass(page.indigo), 4.5],
  ['orange text #ff8f57 on glass', hex('#ff8f57'), glass(page.navy), 4.5],
  ['symptom pill on: #070d1f on orange', hex('#070d1f'), hex('#fc6d26'), 4.5],
  ['btn-warn text #ff8f57 on glass', hex('#ff8f57'), glass(page.navy), 4.5],
]

let bad = 0
for (const [name, fg, bg, min] of pairs) {
  const r = ratio(fg, bg)
  const ok = r >= min
  if (!ok) bad++
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${r.toFixed(2)}:1  (min ${min})  ${name}`)
}
console.log(bad ? `${bad} pair(s) below AA` : 'all pairs meet AA')
process.exit(bad ? 1 : 0)
