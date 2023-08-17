import React, { useContext } from 'react'
import { NavLink } from 'react-router-dom'

// Update MUI imports
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import { ThemeProvider, createTheme } from '@mui/material/styles'

// Update icon imports
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted'
import VerifiedUser from '@mui/icons-material/VerifiedUser'
import LowPriorityIcon from '@mui/icons-material/LowPriority'

import UserContext from '#context/UserContext.js'

const theme = createTheme({
  palette: {
    secondary: {
      main: '#607d8b',
    },
  },
})

const NavButton = ({ link, icon, text }) => (
  <NavLink to={link}>
    <IconButton
      sx={{
        textDecoration: 'none',
        color: '#eeeeee',
      }}
    >
      <Grid container direction="column">
        <Grid item>{icon}</Grid>
        <Grid item>
          <Typography>{text}</Typography>
        </Grid>
      </Grid>
    </IconButton>
  </NavLink>
)

export default function NavBar() {
  const { user } = useContext(UserContext)

  return (
    <ThemeProvider theme={theme}>
      <AppBar color="secondary">
        <Grid container alignItems="center" justifyContent="flex-end">
          <Grid item xs>
            <Box ml={3}>
              <Typography
                variant="h4"
                sx={{
                  color: '#eeeeee',
                }}
              >
                Convivarum
              </Typography>
            </Box>
          </Grid>
          {user && (
            <Grid item xs={2}>
              <NavButton link={'/friends'} icon={<FormatListBulletedIcon />} text={'My Friends'} />
            </Grid>
          )}
          {user && (
            <Grid item xs={2}>
              <NavButton link={'/user'} icon={<VerifiedUser />} text={'Profile'} />
            </Grid>
          )}
          {user ? (
            <Grid item xs={2}>
              <NavButton link={'/logout'} icon={<LowPriorityIcon />} text={'Logout'} />
            </Grid>
          ) : (
            <Grid item xs={2}>
              <NavButton link={'/auth'} icon={<LowPriorityIcon />} text={'Login'} />
            </Grid>
          )}
        </Grid>
      </AppBar>
    </ThemeProvider>
  )
}
