import React, { useState } from 'react'
import styled from '@emotion/styled'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import Box from '@mui/material/Box'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'

import query from '#query'

const StyledForm = styled.div`
  max-width: 400px;
  margin: 0 auto;
  padding: 10px;
`

function InputButton({ fields, onFormSubmit, url, text }) {
  const initialState = fields.reduce((acc, field) => {
    acc[field.name] =
      field.default ||
      (field.type === 'select' ? field.enum[0] : field.type === 'checkbox' ? false : '')
    return acc
  }, {})

  const [formData, setFormData] = useState(initialState)
  const [showForm, setShowForm] = useState(false)
  const [validationErrors, setValidationErrors] = useState({})

  const handleInputChange = (name, value) => {
    setFormData(prevData => ({ ...prevData, [name]: value }))

    // If a check function exists for this field, run it
    if (fields.find(field => field.name === name && field.check)) {
      const isInvalid = fields.find(field => field.name === name).check(value)
      setValidationErrors(prevErrors => ({
        ...prevErrors,
        [name]: isInvalid,
      }))
    }
  }

  const handleSubmit = async () => {
    // Ensure no validation errors
    const hasErrors = Object.values(validationErrors).some(error => error)
    if (hasErrors) {
      alert('Fix the errors before submitting.')
      return
    }

    const response = await query(url, { method: 'post', payload: formData })

    // Handle response as needed...

    onFormSubmit(formData, response)
    setShowForm(false)
  }

  const renderInput = field => {
    switch (field.type) {
      case 'text':
        return (
          <TextField
            fullWidth
            label={field.name}
            value={formData[field.name]}
            onChange={e => handleInputChange(field.name, e.target.value)}
          />
        )
      case 'checkbox':
        return (
          <FormControlLabel
            control={
              <Checkbox
                checked={formData[field.name]}
                onChange={e => handleInputChange(field.name, e.target.checked)}
              />
            }
            label={field.name}
          />
        )
      case 'select':
        return (
          <Select
            fullWidth
            value={formData[field.name]}
            onChange={e => handleInputChange(field.name, e.target.value)}
          >
            {field.enum.map(option => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
        )
      default:
        return null
    }
  }

  return showForm ? (
    <StyledForm>
      <Box component="form" display="flex" flexDirection="column" gap={2}>
        {fields
          .map(field => !field.disable && <Box key={field.name}>{renderInput(field)}</Box>)
          .filter(f => f)}
        <Button variant="contained" color="primary" onClick={handleSubmit}>
          Submit
        </Button>
      </Box>
      <Button variant="text" color="secondary" onClick={() => setShowForm(false)}>
        Hide Form
      </Button>
    </StyledForm>
  ) : (
    <Button variant="contained" color="primary" onClick={() => setShowForm(true)}>
      {text}
    </Button>
  )
}

export default InputButton
