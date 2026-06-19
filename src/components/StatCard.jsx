import './StatCard.css'

// StatCard shows one statistic — used 4 times on the dashboard
// Props: icon (Bootstrap icon class), label (small text), value (big number), color (purple/blue/green/orange)
const StatCard = ({ icon, label, value, color }) => {
  return (
    // stat-card--purple, stat-card--blue etc. change the icon background colour
    <div className={`stat-card stat-card--${color}`}>

      {/* icon box — background colour comes from the color prop */}
      <div className="stat-card__icon">
        <i className={`bi ${icon}`}></i>
      </div>

      <div className="stat-card__content">
        {/* label is the small text like "Total Notes" */}
        <p className="stat-card__label">{label}</p>
        {/* value is the big number like "5" or "85%" */}
        <h3 className="stat-card__value">{value}</h3>
      </div>
    </div>
  )
}

export default StatCard
