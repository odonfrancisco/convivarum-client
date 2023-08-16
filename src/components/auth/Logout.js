import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import query from '#query.js'

function Logout() {
  const Navigate = useNavigate('/')

  useEffect(() => {
    const logout = async () => {
      await query('/auth/logout')

      Navigate('/')
    }
    logout()
  })

  return <div></div>
}

export default Logout
