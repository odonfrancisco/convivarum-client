import { useNavigate } from 'react-router-dom'
import React, { useState, useContext } from 'react'

import query from '#query.js'
import UserContext from '#context/UserContext.js'
import { PROD } from '#config.js'

export default function AuthComponent() {
  const Navigate = useNavigate()
  const { setUser } = useContext(UserContext)

  const [isLogin, setIsLogin] = useState(true) // Toggle between login and sign-up
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async event => {
    event.preventDefault()

    if (!username || !password || (!isLogin && email)) {
      // toast
      return
    }

    const payload = {
      username,
      password,
      ...(!isLogin && { email }),
    }
    const res = await query(`/auth/${isLogin ? 'login' : 'signup'}`, { method: 'post', payload })
    if (res.success) {
      Navigate('/friends')
      setUser(res.user)

      setUsername('')
      setEmail('')
      setPassword('')

      if (!PROD) console.log('Logged in successfully')
    } else {
      if (!PROD) console.log('Login unsuccessful')

      // toast
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
    </div>
  )
}
