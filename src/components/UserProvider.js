import React, { useState } from 'react'
import UserContext from '#context/UserContext.js'

import query from '#query.js'

function UserProvider({ children }) {
  const [user, setUser] = useState(null)

  const getUser = async () => {
    const res = await query('/user/get')
    if (res.data) setUser(res.data)
  }

  return <UserContext.Provider value={{ user, setUser, getUser }}>{children}</UserContext.Provider>
}

export default UserProvider
