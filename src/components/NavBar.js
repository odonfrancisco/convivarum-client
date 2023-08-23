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

import NavButton from '#components/util/NavButton.js'
import UserContext from '#context/UserContext.js'

const theme = createTheme({
  palette: {
    secondary: {
      main: '#607d8b',
    },
  },
})

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
              <NavButton link={'/friends'} icon={<FormatListBulletedIcon />} text={'Friends'} />
            </Grid>
          )}
          {user && (
            <Grid item xs={2}>
              <NavButton link={'/user'} icon={<VerifiedUser />} text={'Profile'} />
            </Grid>
          )}
        </Grid>
      </AppBar>
    </ThemeProvider>
  )
}
