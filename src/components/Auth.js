import { useNavigate } from 'react-router-dom'
import React, { useState, useContext } from 'react'

import query from '#query.js'
import Error from '#components/util/Error.js'
import UserContext from '#context/UserContext.js'

export default function AuthComponent() {
  const Navigate = useNavigate()
  const { setUser } = useContext(UserContext)

  const [isLogin, setIsLogin] = useState(true) // Toggle between login and sign-up
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async event => {
    event.preventDefault()

    if (!username || !password || (!isLogin && !email)) {
      setError('Please complete all fields')
      return
    }

    const payload = {
      username,
      password,
      ...(!isLogin && { email }),
    }
    for (const key of Object.keys(payload))
      if (key !== 'password') payload[key] = payload[key].toLowerCase()

    const res = await query(`/auth/${isLogin ? 'login' : 'signup'}`, { method: 'post', payload })
    if (res.success) {
      Navigate('/friends')
      setUser(res.user)

      setUsername('')
      setEmail('')
      setPassword('')
    } else if (res.err) {
      setError(res.err.response.data.err.message)
    } else {
      setError('Error attempting to login. Please try again')
    }
  }

  return (
    <div>
      <h1>{isLogin ? 'Login' : 'Sign Up'}</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Username:</label>
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
          />
        </div>

        {!isLogin && ( // Only show email field for sign-up
          <div>
            <label>Email:</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
        )}

        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>

        <div>
          <button type="submit">{isLogin ? 'Login' : 'Sign Up'}</button>
        </div>
      </form>

      <button onClick={() => setIsLogin(!isLogin)}>
        {isLogin ? 'Switch to Sign Up' : 'Switch to Login'}
      </button>

      <Error error={error} setError={setError} />
    </div>
  )
}
