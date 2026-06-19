import './Shimmer.css'

// Shimmer is a reusable loading placeholder
// It shows an animated grey bar while real content is loading
// All props have default values so it works even without any props
const Shimmer = ({ width = '100%', height = '20px', borderRadius = '6px', className = '' }) => {
  return (
    <div
      // shimmer-box has the grey gradient animation from Shimmer.css
      // className prop lets us add extra spacing classes like mb-2
      className={`shimmer-box ${className}`}
      style={{ width, height, borderRadius }}
    />
  )
}

export default Shimmer
