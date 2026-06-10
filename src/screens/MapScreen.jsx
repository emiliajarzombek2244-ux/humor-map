import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { CATEGORY_COLORS } from '../data/videos'

const AGE_GROUPS = [
  { id: 'kids',    label: '0–12',  min: 0,  max: 12 },
  { id: 'teens',   label: '13–17', min: 13, max: 17 },
  { id: 'young',   label: '18–30', min: 18, max: 30 },
  { id: 'adults',  label: '31–40', min: 31, max: 40 },
  { id: 'middle',  label: '41–55', min: 41, max: 55 },
  { id: 'seniors', label: '55+',   min: 56, max: 99 },
]

const GENDERS = [
  { id: 'kobieta',   label: 'Kobiety' },
  { id: 'mezczyzna', label: 'Mężczyźni' },
  { id: 'inne',      label: 'Inne' },
]

const FILTER_TABS = ['WIEK', 'PŁEĆ']

const userMatchesFilters = (user, activeAgeGroups, activeGenders) => {
  const ageMatch = AGE_GROUPS
    .filter(g => activeAgeGroups.includes(g.id))
    .some(g => user.age >= g.min && user.age <= g.max)
  const genderMatch = activeGenders.includes(user.gender)
  return ageMatch && genderMatch
}

const getDominantCat = (user) => {
  const scores = {
    A: user.score_a || 0,
    B: user.score_b || 0,
    C: user.score_c || 0,
    D: user.score_d || 0,
    E: user.score_e || 0,
  }
  return Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0]
}

function MapScreen({ currentUser }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeAgeGroups, setActiveAgeGroups] = useState(AGE_GROUPS.map(g => g.id))
  const [activeGenders, setActiveGenders] = useState(GENDERS.map(g => g.id))
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [filterTab, setFilterTab] = useState('WIEK')

  const opacityRef = useRef({})
  const animFrameRef = useRef(null)
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const usersRef = useRef([])

  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase
        .from('users_results')
        .select('*')
      if (!error) {
        usersRef.current = data || []
        setUsers(data || [])
        const initial = {}
        data.forEach(u => { initial[u.id] = 1.0 })
        opacityRef.current = initial
      }
      setLoading(false)
    }
    fetchUsers()
  }, [])

  const getCategoryStats = () => {
    const filtered = users.filter(u =>
      userMatchesFilters(u, activeAgeGroups, activeGenders)
    )
    const counts = { A: 0, B: 0, C: 0, D: 0, E: 0 }
    filtered.forEach(u => { counts[getDominantCat(u)]++ })
    return { counts, total: filtered.length }
  }

  const getUserPosition = (user, width, height) => {
    const warm  = (user.score_b || 0) * 0.6 + (user.score_a || 0) * 0.4
    const cool  = (user.score_c || 0) * 0.5 + (user.score_e || 0) * 0.5
    const green =  user.score_d || 0
    const totalX = (warm + cool) || 1
    const totalY = (green + warm) || 1
    const x = (warm / totalX) * width * 0.8 + width * 0.1
    const y = (1 - green / totalY) * height * 0.8 + height * 0.1
    return { x, y }
  }

  const drawCanvas = () => {
    if (!canvasRef.current || !containerRef.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const width = canvas.width
    const height = canvas.height
    ctx.fillStyle = '#000000'
    ctx.fillRect(0, 0, width, height)
    usersRef.current.forEach(user => {
      const opacity = opacityRef.current[user.id] || 0
      if (opacity < 0.01) return
      const { x, y } = getUserPosition(user, width, height)
      const color = user.color || '#ffffff'
      const r = parseInt(color.slice(1, 3), 16)
      const g = parseInt(color.slice(3, 5), 16)
      const b = parseInt(color.slice(5, 7), 16)
      const grad = ctx.createRadialGradient(x, y, 0, x, y, 250)
      grad.addColorStop(0,   `rgba(${r},${g},${b}, ${0.5 * opacity})`)
      grad.addColorStop(0.4, `rgba(${r},${g},${b}, ${0.2 * opacity})`)
      grad.addColorStop(1,   `rgba(${r},${g},${b}, 0)`)
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, width, height)
    })
  }

  const animateOpacity = (activeAge, activeGender) => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    const tick = () => {
      let stillAnimating = false
      usersRef.current.forEach(user => {
        const target = userMatchesFilters(user, activeAge, activeGender) ? 1.0 : 0.0
        const current = opacityRef.current[user.id] || 0
        const diff = target - current
        if (Math.abs(diff) > 0.01) {
          opacityRef.current[user.id] = current + diff * 0.12
          stillAnimating = true
        } else {
          opacityRef.current[user.id] = target
        }
      })
      drawCanvas()
      if (stillAnimating) animFrameRef.current = requestAnimationFrame(tick)
    }
    animFrameRef.current = requestAnimationFrame(tick)
  }

  useEffect(() => {
    if (!users.length || !canvasRef.current || !containerRef.current) return
    const canvas = canvasRef.current
    canvas.width = containerRef.current.clientWidth
    canvas.height = containerRef.current.clientHeight
    drawCanvas()
  }, [users])

  const handleToggleAge = (id) => {
    const newActive = activeAgeGroups.includes(id)
      ? activeAgeGroups.filter(g => g !== id)
      : [...activeAgeGroups, id]
    setActiveAgeGroups(newActive)
    animateOpacity(newActive, activeGenders)
  }

  const handleToggleGender = (id) => {
    const newActive = activeGenders.includes(id)
      ? activeGenders.filter(g => g !== id)
      : [...activeGenders, id]
    setActiveGenders(newActive)
    animateOpacity(activeAgeGroups, newActive)
  }

  const getCurrentUserPosition = () => {
    if (!currentUser || !containerRef.current) return null
    const width = containerRef.current.clientWidth
    const height = containerRef.current.clientHeight
    return getUserPosition(currentUser, width, height)
  }

  const currentPos = getCurrentUserPosition()
  const { counts, total: activeTotal } = getCategoryStats()

  return (
    <div ref={containerRef} style={styles.container}>

      <canvas ref={canvasRef} style={styles.canvas} />

      <div style={styles.header}>
        <p className="neon-text" style={styles.headerLine1}>GLOBALNA</p>
        <p className="neon-text" style={styles.headerLine2}>MAPA HUMORU</p>
        <p style={styles.subtitle}>
          {loading ? 'Ładowanie...' : `${activeTotal} osób`}
        </p>
      </div>

      {currentPos && currentUser && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5, type: 'spring' }}
          style={{
            ...styles.currentDot,
            left: currentPos.x,
            top: currentPos.y,
            background: currentUser.color,
            boxShadow: `0 0 10px ${currentUser.color}, 0 0 30px ${currentUser.color}, 0 0 60px ${currentUser.color}88`,
          }}
        />
      )}

      <div style={styles.bottomLeft}>

        <AnimatePresence>
          {filtersOpen && (
            <motion.div
              initial={{ opacity: 0, scaleY: 0 }}
              animate={{ opacity: 1, scaleY: 1 }}
              exit={{ opacity: 0, scaleY: 0 }}
              transition={{ duration: 0.25 }}
              style={styles.filterPanel}
            >
              {/* Zakładki */}
              <div style={styles.tabRow}>
                {FILTER_TABS.map(tab => (
                  <button
                    key={tab}
                    onClick={() => setFilterTab(tab)}
                    style={{
                      ...styles.tab,
                      color: filterTab === tab ? 'var(--neon-blue)' : 'rgba(255,255,255,0.3)',
                      borderBottom: filterTab === tab
                        ? '1px solid var(--neon-blue)'
                        : '1px solid transparent',
                    }}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {filterTab === 'WIEK' && (
                <div style={styles.chipColumn}>
                  {AGE_GROUPS.map(g => {
                    const active = activeAgeGroups.includes(g.id)
                    return (
                      <label key={g.id} style={{ cursor: 'pointer' }}>
                        <input type="checkbox" checked={active}
                          onChange={() => handleToggleAge(g.id)}
                          style={{ display: 'none' }} />
                        <span style={{
                          ...styles.chip,
                          borderColor: active ? 'var(--neon-blue)' : 'rgba(255,255,255,0.15)',
                          color: active ? 'var(--neon-blue)' : 'rgba(255,255,255,0.35)',
                          boxShadow: active ? '0 0 8px rgba(0,195,255,0.3)' : 'none',
                          background: active ? 'rgba(0,195,255,0.06)' : 'transparent',
                        }}>
                          {g.label}
                        </span>
                      </label>
                    )
                  })}
                </div>
              )}

              {filterTab === 'PŁEĆ' && (
                <div style={styles.chipColumn}>
                  {GENDERS.map(g => {
                    const active = activeGenders.includes(g.id)
                    return (
                      <label key={g.id} style={{ cursor: 'pointer' }}>
                        <input type="checkbox" checked={active}
                          onChange={() => handleToggleGender(g.id)}
                          style={{ display: 'none' }} />
                        <span style={{
                          ...styles.chip,
                          borderColor: active ? 'var(--neon-green)' : 'rgba(255,255,255,0.15)',
                          color: active ? 'var(--neon-green)' : 'rgba(255,255,255,0.35)',
                          boxShadow: active ? '0 0 8px rgba(0,255,136,0.3)' : 'none',
                          background: active ? 'rgba(0,255,136,0.06)' : 'transparent',
                        }}>
                          {g.label}
                        </span>
                      </label>
                    )
                  })}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => setFiltersOpen(p => !p)}
          style={{
            ...styles.filterBtn,
            borderColor: filtersOpen ? 'var(--neon-blue)' : 'rgba(255,255,255,0.2)',
            color: filtersOpen ? 'var(--neon-blue)' : 'rgba(255,255,255,0.45)',
            boxShadow: filtersOpen ? '0 0 10px rgba(0,195,255,0.3)' : 'none',
          }}
        >
          {filtersOpen ? '✕ FILTRY' : 'FILTRY'}
        </button>

        <div style={styles.legendPanel}>
          <p style={styles.panelTitle}>KOLORY HUMORU</p>
          {Object.entries(CATEGORY_COLORS).map(([cat, info]) => {
            const count = counts[cat] || 0
            const pct = activeTotal > 0 ? Math.round((count / activeTotal) * 100) : 0
            return (
              <div key={cat} style={styles.legendRow}>
                <div style={{
                  ...styles.legendDot,
                  background: info.hex,
                  boxShadow: `0 0 5px ${info.hex}`,
                }}/>
                <span style={{ color: info.hex, fontSize: '0.62rem', flex: 1 }}>
                  {info.name}
                </span>
                <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.6rem', marginRight: '6px' }}>
                  {count} os.
                </span>
                <span style={{
                  color: info.hex,
                  fontSize: '0.62rem',
                  fontFamily: 'var(--font-display)',
                  minWidth: '30px',
                  textAlign: 'right',
                }}>
                  {pct}%
                </span>
              </div>
            )
          })}

          {currentUser && (
            <>
              <div style={styles.divider}/>
              <div style={styles.legendRow}>
                <div style={{
                  ...styles.legendDot,
                  background: currentUser.color,
                  boxShadow: `0 0 8px ${currentUser.color}`,
                }}/>
                <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.62rem' }}>
                  Twój kolor
                </span>
              </div>
            </>
          )}
        </div>

        <button
          onClick={() => window.location.reload()}
          style={styles.replayBtn}
        >
          ZAGRAJ PONOWNIE
        </button>

      </div>

    </div>
  )
}

const styles = {
  container: {
    position: 'relative',
    width: '100%',
    height: '100dvh',
    overflow: 'hidden',
    background: '#000',
  },
  canvas: {
    position: 'absolute',
    top: 0, left: 0,
    width: '100%',
    height: '100%',
    zIndex: 0,
  },
  header: {
    position: 'absolute',
    top: '1.2rem',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 10,
    textAlign: 'center',
    pointerEvents: 'none',
    whiteSpace: 'nowrap',
  },
  headerLine1: {
    color: 'var(--neon-purple)',
    fontSize: '1.4rem',
    letterSpacing: '0.2em',
    lineHeight: 1.1,
  },
  headerLine2: {
    color: 'var(--neon-purple)',
    fontSize: '1.4rem',
    letterSpacing: '0.2em',
    lineHeight: 1.1,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: '0.8rem',
    letterSpacing: '0.1em',
    marginTop: '0.3rem',
    fontFamily: 'var(--font-body)',
  },
  currentDot: {
    position: 'absolute',
    width: '14px',
    height: '14px',
    borderRadius: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: 5,
  },
  bottomLeft: {
    position: 'absolute',
    bottom: '1.25rem',
    left: '1rem',
    right: '1rem',
    zIndex: 20,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '0.5rem',
  },
  filterBtn: {
    background: 'rgba(0,0,0,0.5)',
    backdropFilter: 'blur(8px)',
    border: '1px solid',
    borderRadius: '999px',
    padding: '0.4rem 0.9rem',
    fontSize: '0.62rem',
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    letterSpacing: '0.12em',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  filterPanel: {
    background: 'rgba(0,0,0,0.6)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '16px',
    padding: '0.85rem 1rem',
    minWidth: '200px',
    transformOrigin: 'bottom left',
  },
  tabRow: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '0.75rem',
  },
  tab: {
    background: 'transparent',
    border: 'none',
    borderBottom: '1px solid transparent',
    padding: '0.2rem 0.4rem',
    fontSize: '0.55rem',
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    letterSpacing: '0.1em',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  chipColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.3rem',
  },
  chip: {
    display: 'block',
    border: '1px solid',
    borderRadius: '999px',
    padding: '4px 12px',
    fontSize: '0.68rem',
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    transition: 'all 0.2s ease',
    cursor: 'pointer',
    textAlign: 'center',
  },
  panelTitle: {
    fontSize: '0.55rem',
    letterSpacing: '0.2em',
    color: 'rgba(255,255,255,0.25)',
    marginBottom: '0.4rem',
  },
  legendPanel: {
    background: 'rgba(0,0,0,0.45)',
    backdropFilter: 'blur(8px)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '16px',
    padding: '0.75rem 1rem',
    width: '100%',
  },
  legendRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    marginBottom: '0.3rem',
  },
  legendDot: {
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    flexShrink: 0,
  },
  divider: {
    height: '1px',
    background: 'rgba(255,255,255,0.07)',
    margin: '0.25rem 0',
  },
  replayBtn: {
    background: 'rgba(0,0,0,0.45)',
    backdropFilter: 'blur(8px)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '999px',
    padding: '0.4rem 0.9rem',
    fontSize: '0.62rem',
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    letterSpacing: '0.12em',
    color: 'rgba(255,255,255,0.35)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    alignSelf: 'center',
    width: '100%',
  },
}

export default MapScreen