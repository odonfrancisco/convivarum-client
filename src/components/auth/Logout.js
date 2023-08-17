import React, { useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'

import query from '#query.js'
import UserContext from '#context/UserContext'

function Logout() {
  const Navigate = useNavigate('/')
  const { setUser } = useContext(UserContext)

  useEffect(() => {
    const logout = async () => {
      await query('/auth/logout')

      Navigate('/auth')
      setUser(null)
    }
    logout()
  }, [])

  return <div></div>
}

export default Logout
