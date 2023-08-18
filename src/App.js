// React
import React, { useState, useContext, useEffect } from 'react'
// import { Switch, Route, Redirect } from 'react-router-dom'
import { Routes, Route, useNavigate } from 'react-router-dom'
import Container from '@mui/material/Container'
import Box from '@mui/material/Box'

import '#styles/App.css'
import query from '#query.js'
import { PROD } from '#config.js'

import UserContext from '#context/UserContext.js'
import NavBar from '#components/NavBar.js'
import Auth from '#components/Auth.js'
import List from '#components/friend/List.js'
import Logout from '#components/auth/Logout.js'
import UserProfile from '#components/user/Details.js'

let i = 0
function App() {
  const Navigate = useNavigate()
  const { setUser } = useContext(UserContext)
  const [redirect] = useState()

  useEffect(() => {
    async function checkUserStatus() {
      const res = await query('/auth/loggedin')

      if (res.success) {
        // Navigate('/friends')
        if (!PROD) console.log(`times checked loggedin: ${++i}`)
        setUser(res.user)
      } else {
        if (!PROD) console.log(`User not logged in ${++i}`)
        Navigate('/auth')
      }
    }

    checkUserStatus()
  }, [Navigate, setUser])

  return (
    <Container disableGutters>
      {redirect}
      <NavBar />
      <Box mt={13}>
        <Container>
          <Routes>
            <Route exact path="/auth" element={<Auth />} />
            <Route exact path="/user" element={<UserProfile />} />
            <Route exact path="/friends" element={<List />} />
            <Route exact path="/logout" element={<Logout />} />
          </Routes>
        </Container>
      </Box>
    </Container>
  )
}

export default App
