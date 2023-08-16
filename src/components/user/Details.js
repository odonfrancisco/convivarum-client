import React, { useEffect, useState } from 'react'

import query from '#query.js'

function UserProfile() {
  const [user, setUser] = useState()

  useEffect(() => {
    const fetchUser = async () => {
      const res = await query('/user/get')
      setUser(res.data)
    }

    fetchUser()
  })

  if (!user) return <div></div>

  return (
    <div>
      <div>{user._id}</div>
    </div>
  )
}

export default UserProfile
