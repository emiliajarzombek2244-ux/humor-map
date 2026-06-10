import { motion } from 'framer-motion'
import NeonButton from '../components/NeonButton'
import { CATEGORY_COLORS } from '../data/videos'
import { calculateUserGradient } from '../utils/colorCalculator'

function ResultScreen({ userData, quizResult, onShowMap }) {

  const getDominantCategory = () => {
    const ratings = quizResult.ratings
    let best = null
    let bestAvg = -1
    for (const cat in ratings) {
      const scores = ratings[cat]
      if (scores.length === 0) continue
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length
      if (avg > bestAvg) { bestAvg = avg; best = cat }
    }
    return best
  }

  const dominantCategory = getDominantCategory()
  const categoryInfo = CATEGORY_COLORS[dominantCategory]
  const userColor = categoryInfo?.hex || quizResult.color
  const userGradient = calculateUserGradient(quizResult.ratings)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      style={styles.container}
    >
      {/* Imię użytkownika — duże i świecące */}
      <motion.h2
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="neon-text"
        style={{
          color: userColor,
          fontSize: 'clamp(2.5rem, 12vw, 4rem)',
          textShadow: `0 0 20px ${userColor}, 0 0 60px ${userColor}88`,
          textAlign: 'center',
          letterSpacing: '0.08em',
        }}
      >
        {userData?.name}
      </motion.h2>

      {/* Badge dominującej kategorii */}
      {categoryInfo && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            ...styles.categoryBadge,
            borderColor: categoryInfo.hex,
          }}
        >
          <span style={styles.categoryLabel}>Twój humor to:</span>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.1rem',
            fontWeight: 800,
            color: categoryInfo.hex,
            textShadow: `0 0 15px ${categoryInfo.hex}`,
          }}>
            {categoryInfo.name}
          </span>
        </motion.div>
      )}

      <div style={{ height: '1rem' }} />

      {/* Kula z gradientem */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.8, type: 'spring' }}
        style={{
          ...styles.colorOrb,
          background: userGradient,
          boxShadow: `0 0 40px ${userColor}88, 0 0 80px ${userColor}44`,
        }}
      />

      <div style={{ height: '1rem' }} />

      {/* Paski kategorii */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        style={styles.categoryList}
      >
        {Object.entries(quizResult.ratings).map(([cat, scores]) => {
          if (!scores.length) return null
          const avg = scores.reduce((a, b) => a + b, 0) / scores.length
          const info = CATEGORY_COLORS[cat]
          const barWidth = Math.round((avg / 4) * 100)
          return (
            <div key={cat} style={styles.categoryRow}>
              <div style={{
                ...styles.colorDot,
                background: info.hex,
                boxShadow: `0 0 6px ${info.hex}`,
              }}/>
              <span style={{ color: info.hex, fontSize: '0.7rem', flex: 1 }}>
                {info.name}
              </span>
              <div style={styles.barBg}>
                <div style={{
                  ...styles.barFill,
                  width: `${barWidth}%`,
                  background: info.hex,
                  boxShadow: `0 0 4px ${info.hex}`,
                }}/>
              </div>
              <span style={{ color: info.hex, fontSize: '0.65rem', minWidth: '24px', textAlign: 'right' }}>
                {avg.toFixed(1)}
              </span>
            </div>
          )
        })}
      </motion.div>

      <div style={{ height: '1.5rem' }} />

      {/* Przycisk */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.0 }}
        style={{ width: '100%', maxWidth: '280px' }}
      >
        <NeonButton onClick={onShowMap} color={userColor}>
          Zobacz Globalną Mapę
        </NeonButton>
      </motion.div>

    </motion.div>
  )
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100dvh',
    gap: '0.5rem',
    padding: '1.5rem 1rem',
    overflowY: 'auto',
  },
  colorOrb: {
    width: '140px',
    height: '140px',
    borderRadius: '50%',
    flexShrink: 0,
  },
  categoryBadge: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.3rem',
    border: '1px solid',
    padding: '0.75rem 2rem',
    borderRadius: '999px',
    width: '100%',
    maxWidth: '320px',
  },
  categoryLabel: {
    fontSize: '0.6rem',
    letterSpacing: '0.2em',
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.3)',
  },
  categoryList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.45rem',
    width: '100%',
    maxWidth: '360px',
  },
  categoryRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  colorDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    flexShrink: 0,
  },
  barBg: {
    flex: 1,
    height: '3px',
    background: 'rgba(255,255,255,0.08)',
    borderRadius: '999px',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: '999px',
  },
}

export default ResultScreen