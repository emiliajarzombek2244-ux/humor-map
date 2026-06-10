import { CATEGORY_COLORS } from '../data/videos'

export function calculateUserColor(ratings) {
  const averages = {}
  for (const category in ratings) {
    const scores = ratings[category]
    if (scores.length === 0) continue
    averages[category] = scores.reduce((a, b) => a + b, 0) / scores.length
  }

  if (Object.keys(averages).length === 0) return '#FF003C'

  const maxAvg = Math.max(...Object.values(averages))

  // Bardzo agresywne ważenie — różnica 1 punktu = 8x mniejsza waga
  const weights = {}
  for (const cat in averages) {
    const diff = maxAvg - averages[cat]
    weights[cat] = Math.pow(0.12, diff)
  }

  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0) || 1

  let totalR = 0, totalG = 0, totalB = 0
  for (const category in weights) {
    const weight = weights[category]
    const hex = CATEGORY_COLORS[category].hex
    totalR += parseInt(hex.slice(1, 3), 16) * weight
    totalG += parseInt(hex.slice(3, 5), 16) * weight
    totalB += parseInt(hex.slice(5, 7), 16) * weight
  }

  let finalR = Math.round(totalR / totalWeight)
  let finalG = Math.round(totalG / totalWeight)
  let finalB = Math.round(totalB / totalWeight)

  // Zawsze pchnij do pełnej jasności
  const maxChannel = Math.max(finalR, finalG, finalB) || 1
  const scale = 255 / maxChannel
  finalR = Math.min(255, Math.round(finalR * scale))
  finalG = Math.min(255, Math.round(finalG * scale))
  finalB = Math.min(255, Math.round(finalB * scale))

  const toHex = (n) => n.toString(16).padStart(2, '0')
  return `#${toHex(finalR)}${toHex(finalG)}${toHex(finalB)}`
}

export function calculateUserGradient(ratings) {
  const averages = {}
  for (const category in ratings) {
    const scores = ratings[category]
    if (scores.length === 0) continue
    averages[category] = scores.reduce((a, b) => a + b, 0) / scores.length
  }

  const maxAvg = Math.max(...Object.values(averages))

  const weights = {}
  for (const cat in averages) {
    const diff = maxAvg - averages[cat]
    weights[cat] = Math.pow(0.12, diff)
  }

  // Filtruj kategorie z wagą poniżej 1% — nie pokazuj ich w gradiencie
  const entries = Object.entries(weights).filter(([, w]) => w > 0.01)
  if (entries.length === 0) return '#FF003C'
  if (entries.length === 1) return CATEGORY_COLORS[entries[0][0]].hex

  // Sortuj od największej wagi
  entries.sort((a, b) => b[1] - a[1])

  const total = entries.reduce((a, [, w]) => a + w, 0) || 1

  const smoothStops = []
  let pos = 0

  entries.forEach(([cat, weight], i) => {
    const pct = (weight / total) * 100
    const color = CATEGORY_COLORS[cat].hex
    const nextCat = entries[(i + 1) % entries.length][0]
    const nextColor = CATEGORY_COLORS[nextCat].hex
    smoothStops.push(`${color} ${pos.toFixed(1)}%`)
    smoothStops.push(`${nextColor} ${(pos + pct).toFixed(1)}%`)
    pos += pct
  })

  return `conic-gradient(from 0deg, ${smoothStops.join(', ')})`
}