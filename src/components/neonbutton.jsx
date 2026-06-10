// Wielokrotnie używany neonowy przycisk
// Props: children (tekst), onClick (akcja), color (kolor neonu)

function NeonButton({ children, onClick, color = 'var(--neon-blue)' }) {
  return (
    <button
      className="neon-button"
      onClick={onClick}
      style={{ color: color }}
    >
      {children}
    </button>
  )
}

export default NeonButton