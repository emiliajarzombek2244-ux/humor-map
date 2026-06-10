import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { VIDEOS } from '../data/videos'
import { calculateUserColor } from '../utils/colorCalculator'
import NeonButton from '../components/NeonButton'

function PixelFace({ value, color }) {
  if (value === 1) return (
    <svg viewBox="0 0 100 80" width="80" height="64" style={{ filter: `drop-shadow(0 0 10px ${color})` }}>
      <circle cx="32" cy="32" r="7" fill={color}/>
      <circle cx="68" cy="32" r="7" fill={color}/>
      <path d="M 20 64 Q 50 48 80 64" fill="none" stroke={color} strokeWidth="7" strokeLinecap="round"/>
      <path d="M 18 18 Q 32 6 46 18" fill="none" stroke={color} strokeWidth="5" strokeLinecap="round"/>
      <path d="M 54 18 Q 68 6 82 18" fill="none" stroke={color} strokeWidth="5" strokeLinecap="round"/>
    </svg>
  )
  if (value === 2) return (
    <svg viewBox="0 0 100 80" width="80" height="64" style={{ filter: `drop-shadow(0 0 10px ${color})` }}>
      <circle cx="32" cy="32" r="7" fill={color}/>
      <circle cx="68" cy="32" r="7" fill={color}/>
      <path d="M 20 58 Q 50 58 80 58" fill="none" stroke={color} strokeWidth="7" strokeLinecap="round"/>
    </svg>
  )
  if (value === 3) return (
    <svg viewBox="0 0 100 80" width="80" height="64" style={{ filter: `drop-shadow(0 0 10px ${color})` }}>
      <circle cx="32" cy="32" r="7" fill={color}/>
      <circle cx="68" cy="32" r="7" fill={color}/>
      <path d="M 18 48 Q 50 70 82 48" fill="none" stroke={color} strokeWidth="7" strokeLinecap="round"/>
    </svg>
  )
  if (value === 4) return (
    <svg viewBox="0 0 100 80" width="80" height="64" style={{ filter: `drop-shadow(0 0 10px ${color})` }}>
      <path d="M 18 30 Q 32 14 46 30" fill="none" stroke={color} strokeWidth="7" strokeLinecap="round"/>
      <path d="M 54 30 Q 68 14 82 30" fill="none" stroke={color} strokeWidth="7" strokeLinecap="round"/>
      <path d="M 16 50 Q 50 74 84 50" fill="none" stroke={color} strokeWidth="7" strokeLinecap="round"/>
      <path d="M 6 34 Q 0 48 6 56" fill="none" stroke={color} strokeWidth="5" strokeLinecap="round" opacity="0.6"/>
      <path d="M 94 34 Q 100 48 94 56" fill="none" stroke={color} strokeWidth="5" strokeLinecap="round" opacity="0.6"/>
    </svg>
  )
  return null
}

const FACE_LABELS = {
  1: 'wcale',
  2: 'trochę',
  3: 'śmieszne',
  4: 'bardzo!',
}

const SLIDER_COLORS = {
  1: '#FF003C',
  2: '#FFE600',
  3: '#88FF00',
  4: '#00FF88',
}

const POINTS = [1, 2, 3, 4]

function QuizScreen({ onFinish }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [ratings, setRatings] = useState({ A: [], B: [], C: [], D: [], E: [] })
  const [sliderValue, setSliderValue] = useState(2)
  const videoRef = useRef(null)

  const currentVideo = VIDEOS[currentIndex]
  const progress = (currentIndex / VIDEOS.length) * 100
  const color = SLIDER_COLORS[sliderValue]

  const handleRate = (score) => {
    const category = currentVideo.category
    const newRatings = {
      ...ratings,
      [category]: [...ratings[category], score]
    }
    setRatings(newRatings)

    if (currentIndex + 1 < VIDEOS.length) {
      setCurrentIndex(prev => prev + 1)
      setSliderValue(2)
      if (videoRef.current) videoRef.current.load()
    } else {
      const userColor = calculateUserColor(newRatings)
      onFinish({ ratings: newRatings, color: userColor })
    }
  }

  return (
    <div style={styles.container}>

      {/* Pasek postępu */}
      <div style={styles.progressBar}>
        <motion.div
          style={styles.progressFill}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      {/* Licznik */}
      <p style={styles.counter}>{currentIndex + 1} / {VIDEOS.length}</p>

      {/* Wideo */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.25 }}
          style={styles.videoWrapper}
        >
          <video
            ref={videoRef}
            src={currentVideo.src}
            style={styles.video}
            autoPlay
            controls
            playsInline
          />
        </motion.div>
      </AnimatePresence>

      {/* Sekcja oceniania */}
      <div style={styles.ratingContainer}>
        <p style={styles.ratingLabel}>Jak bardzo Cię to rozśmieszyło?</p>

        {/* Buźka — szybka zamiana bez AnimatePresence */}
        <div style={{ textAlign: 'center', minHeight: '80px' }}>
          <PixelFace value={sliderValue} color={color} />
          <span style={{
            fontSize: '0.7rem',
            color: color,
            fontFamily: 'var(--font-display)',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            textShadow: `0 0 10px ${color}`,
            display: 'block',
            marginTop: '0.2rem',
            transition: 'color 0.1s ease',
          }}>
            {FACE_LABELS[sliderValue]}
          </span>
        </div>

        {/* Suwak — biała linia z 4 punktami */}
        <div style={styles.sliderTrack}>
          <div style={styles.sliderLine} />

          <div style={{
            ...styles.sliderFill,
            width: `${((sliderValue - 1) / 3) * 100}%`,
            background: color,
            boxShadow: `0 0 8px ${color}`,
          }} />

          {POINTS.map((point, i) => {
            const isActive = sliderValue >= point
            const isSelected = sliderValue === point
            return (
              <motion.button
                key={point}
                onClick={() => setSliderValue(point)}
                whileTap={{ scale: 0.85 }}
                style={{
                  ...styles.sliderPoint,
                  left: `${(i / 3) * 100}%`,
                  background: isActive ? color : '#000',
                  border: `2px solid ${isActive ? color : 'rgba(255,255,255,0.4)'}`,
                  boxShadow: isSelected
                    ? `0 0 12px ${color}, 0 0 24px ${color}88`
                    : isActive
                    ? `0 0 6px ${color}`
                    : 'none',
                  width: isSelected ? '22px' : '16px',
                  height: isSelected ? '22px' : '16px',
                  marginLeft: isSelected ? '-11px' : '-8px',
                  marginTop: isSelected ? '-11px' : '-8px',
                }}
              />
            )
          })}
        </div>

        {/* Etykiety */}
        <div style={styles.pointLabels}>
          {POINTS.map(point => (
            <span
              key={point}
              style={{
                fontSize: '0.6rem',
                color: sliderValue === point ? color : 'rgba(255,255,255,0.2)',
                fontFamily: 'var(--font-display)',
                letterSpacing: '0.05em',
                transition: 'color 0.1s',
              }}
            >
              {FACE_LABELS[point]}
            </span>
          ))}
        </div>

        <NeonButton
          onClick={() => handleRate(sliderValue)}
          color={color}
        >
          Dalej →
        </NeonButton>
      </div>

    </div>
  )
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    height: '100dvh',
    padding: '0.75rem 1rem',
    gap: '0.4rem',
    overflow: 'hidden',
  },
  progressBar: {
    width: '100%',
    maxWidth: '600px',
    height: '3px',
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '999px',
  },
  progressFill: {
    height: '100%',
    background: 'var(--neon-blue)',
    borderRadius: '999px',
    boxShadow: '0 0 8px var(--neon-blue)',
  },
  counter: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: '0.75rem',
    letterSpacing: '0.2em',
  },
  videoWrapper: {
    width: '100%',
    maxWidth: '600px',
    borderRadius: '16px',
    overflow: 'hidden',
    border: '1px solid rgba(0,195,255,0.15)',
    flex: 1,
    maxHeight: '55vh',
  },
  video: {
    width: '100%',
    height: '100%',
    display: 'block',
    background: '#000',
    objectFit: 'cover',
  },
  ratingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.6rem',
    width: '100%',
    maxWidth: '400px',
  },
  ratingLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: '0.8rem',
    letterSpacing: '0.05em',
    textAlign: 'center',
  },
  sliderTrack: {
    position: 'relative',
    width: '100%',
    height: '22px',
    display: 'flex',
    alignItems: 'center',
    marginTop: '0.25rem',
  },
  sliderLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: '2px',
    background: 'rgba(255,255,255,0.2)',
    borderRadius: '999px',
  },
  sliderFill: {
    position: 'absolute',
    left: 0,
    height: '2px',
    borderRadius: '999px',
    transition: 'width 0.15s ease, background 0.15s ease',
  },
  sliderPoint: {
    position: 'absolute',
    top: '50%',
    borderRadius: '50%',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    zIndex: 2,
  },
  pointLabels: {
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '-0.2rem',
  },
}

export default QuizScreen