import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import NeonButton from '../components/NeonButton'

const GENDER_OPTIONS = [
  { value: 'kobieta',   label: 'Kobieta' },
  { value: 'mezczyzna', label: 'Mężczyzna' },
  { value: 'inne',      label: 'Inne / Wolę nie podawać' },
]

function WelcomeScreen({ onStart }) {
  const [formData, setFormData] = useState({
    name: '', age: '', gender: '', city: 'brak'
  })
  const [genderOpen, setGenderOpen] = useState(false)

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const selectGender = (value) => {
    setFormData(prev => ({ ...prev, gender: value }))
    setGenderOpen(false)
  }

  const isValid = formData.name && formData.age && formData.gender

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      style={styles.container}
    >
      <h1 className="neon-text" style={styles.title}>
        HUMOR MAP
      </h1>

      <p style={styles.subtitle}>
        Odkryj swój unikalny kolor humoru
      </p>

      <div style={styles.form}>

        {/* Imię i Wiek */}
        <div style={styles.row}>
          <div style={styles.field}>
            <label style={styles.label}>Imię</label>
            <input
              className="neon-input"
              name="name"
              placeholder="Imię"
              value={formData.name}
              onChange={handleChange}
              style={styles.input}
            />
          </div>
          <div style={{ ...styles.field, maxWidth: '90px' }}>
            <label style={styles.label}>Wiek</label>
            <input
              className="neon-input"
              name="age"
              type="number"
              placeholder="Wiek"
              min="10"
              max="99"
              value={formData.age}
              onChange={handleChange}
              style={styles.input}
            />
          </div>
        </div>

        {/* Płeć */}
        <div style={styles.field}>
          <label style={styles.label}>Płeć</label>
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setGenderOpen(p => !p)}
              style={{
                ...styles.input,
                ...styles.dropdownBtn,
                borderColor: formData.gender ? 'var(--neon-blue)' : 'rgba(0,195,255,0.3)',
                color: formData.gender ? '#fff' : 'rgba(255,255,255,0.25)',
              }}
            >
              {formData.gender
                ? GENDER_OPTIONS.find(o => o.value === formData.gender)?.label
                : 'Wybierz płeć'}
              <span style={{ marginLeft: 'auto', opacity: 0.5 }}>
                {genderOpen ? '▲' : '▼'}
              </span>
            </button>
            <AnimatePresence>
              {genderOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.15 }}
                  style={styles.dropdown}
                >
                  {GENDER_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => selectGender(opt.value)}
                      style={{
                        ...styles.dropdownOption,
                        color: formData.gender === opt.value ? 'var(--neon-blue)' : 'rgba(255,255,255,0.7)',
                        background: formData.gender === opt.value ? 'rgba(0,195,255,0.08)' : 'transparent',
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <NeonButton
          onClick={() => isValid && onStart(formData)}
          color={isValid ? 'var(--neon-green)' : 'rgba(255,255,255,0.2)'}
        >
          Rozpocznij Quiz →
        </NeonButton>

      </div>
    </motion.div>
  )
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100dvh',
    gap: '0.6rem',
    padding: '1rem',
    overflow: 'hidden',
  },
  title: {
    color: 'var(--neon-purple)',
    fontSize: 'clamp(1.8rem, 8vw, 3rem)',
    textAlign: 'center',
    whiteSpace: 'nowrap',
    lineHeight: 1.1,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: '0.1em',
    fontSize: '0.7rem',
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.6rem',
    width: '100%',
    maxWidth: '400px',
    marginTop: '0.25rem',
  },
  row: {
    display: 'flex',
    gap: '0.6rem',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.2rem',
    flex: 1,
    position: 'relative',
  },
  label: {
    fontSize: '0.6rem',
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.35)',
    paddingLeft: '0.5rem',
  },
  input: {
    padding: '0.5rem 0.8rem',
    fontSize: '0.85rem',
  },
  dropdownBtn: {
    width: '100%',
    background: 'rgba(255,255,255,0.04)',
    border: '2px solid',
    borderRadius: '999px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    fontFamily: 'var(--font-body)',
    textAlign: 'left',
  },
  dropdown: {
    position: 'absolute',
    top: 'calc(100% + 6px)',
    left: 0,
    right: 0,
    background: '#0a0a0a',
    border: '1px solid rgba(0,195,255,0.3)',
    borderRadius: '16px',
    overflow: 'hidden',
    zIndex: 100,
    boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
  },
  dropdownOption: {
    width: '100%',
    padding: '0.6rem 1rem',
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontFamily: 'var(--font-body)',
    textAlign: 'left',
    transition: 'background 0.15s',
  },
}

export default WelcomeScreen