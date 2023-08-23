import { useState, useEffect } from 'react'
import {
  TextField,
  Select,
  MenuItem,
  InputAdornment,
  FormControl,
  InputLabel,
  Box,
} from '@mui/material'

import { SELECT_MS } from '#config'
import parseActionInterval from '#fn/parseActionInterval'

export default function DurationInput({ keyed, label, def = 0, setFormData }) {
  const [numberValue, setNumberValue] = useState(def)
  const [selectValue, setSelectValue] = useState('hours')

  useEffect(() => {
    parseActionInterval({ val: def, setNumberValue, setSelectValue })
  }, [def])

  const updateFormData = ({ select = selectValue, ms = numberValue } = {}) => {
    setFormData(prev => ({ ...prev, [keyed]: ms * SELECT_MS[select] }))
  }

  const handleNumberChange = e => {
    const value = parseInt(e.target.value, 10)
    const up = value < 0 ? 0 : value
    setNumberValue(up)
    // Why do i have to do this? Why can't i just grab numberValue inside updateFormData?
    updateFormData({ ms: up })
  }

  return (
    <Box display="flex" alignItems="center" gap={2}>
      <TextField
        label={label}
        type="number"
        value={numberValue}
        onChange={handleNumberChange}
        variant="outlined"
        InputProps={{
          endAdornment: <InputAdornment position="end">{selectValue}</InputAdornment>,
          min: 0,
          max: 999,
          inputMode: 'numeric',
        }}
      />

      <FormControl variant="outlined">
        <InputLabel>Unit</InputLabel>
        <Select
          value={selectValue}
          onChange={e => {
            setSelectValue(e.target.value)
            updateFormData({ select: e.target.value })
          }}
          label="Unit"
        >
          <MenuItem value="hours">Hours</MenuItem>
          <MenuItem value="days">Days</MenuItem>
          <MenuItem value="weeks">Weeks</MenuItem>
        </Select>
      </FormControl>
    </Box>
  )
}
