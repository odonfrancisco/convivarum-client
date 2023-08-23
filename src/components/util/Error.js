import { useEffect } from 'react'

// Don't know if passing down the setError fn is good practice, or if i should use a local state for the error component itself?
export default function Error({ error, setError }) {
  useEffect(() => {
    const refreshErr = () => {
      setTimeout(() => setError(''), 2e3)
    }
    if (error) refreshErr()
  }, [error, setError])

  return <div>{error && <span style={{ color: 'red' }}>{error}</span>}</div>
}
