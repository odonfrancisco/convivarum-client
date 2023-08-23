import React from 'react'
import { NavLink } from 'react-router-dom'

// Update MUI imports
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'

const NavButton = ({ link, icon, text, textColor }) => (
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
          <Typography color={textColor}>{text}</Typography>
        </Grid>
      </Grid>
    </IconButton>
  </NavLink>
)

export default NavButton
