import React, { useState, useEffect } from 'react'
import styled from '@emotion/styled'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import Box from '@mui/material/Box'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'

import query from '#query'
import DurationInput from './DurationInput'
import { FIELDS } from '#config.js'

const StyledForm = styled.div`
  max-width: 400px;
  margin: 0 auto;
  padding: 10px;
`

const makeFormData = fields =>
  fields.reduce((acc, field) => {
    acc[field.key] =
      field.default ||
      (field.type === 'select' ? field.enum[0] : field.type === 'checkbox' ? false : '')
    return acc
  }, {})

const getData = ({ type, obj }) => {
  const fields = FIELDS[type](obj)
  const formData = makeFormData(fields)

  return { fields, formData }
}

// Would be nice to have some sort of state where only one input form can be opened at a time when viewing the friends list
function InputForm({ type, obj, onFormSubmit, url, text, show = false }) {
  const [formData, setFormData] = useState({})
  const [fields, setFields] = useState([])
  const [showForm, setShowForm] = useState(show)
  const [validationErrors, setValidationErrors] = useState({})

  useEffect(() => {
    const updateForm = () => {
      const { fields, formData } = getData({ type, obj })
      setFields(fields)
      setFormData(formData)
    }
    updateForm()
  }, [type, obj])

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

    setShowForm(false)
    if (onFormSubmit) onFormSubmit(formData, response)
    if (!obj) {
      const { fields, formData } = getData({ type, obj })
      setFields(fields)
      setFormData(formData)
    }
  }

  const renderInput = field => {
    switch (field.type) {
      case 'text':
        return (
          <TextField
            fullWidth
            label={field.name}
            value={formData[field.key]}
            onChange={e => handleInputChange(field.key, e.target.value)}
          />
        )
      case 'checkbox':
        return (
          <FormControlLabel
            control={
              <Checkbox
                checked={formData[field.key]}
                onChange={e => handleInputChange(field.key, e.target.checked)}
              />
            }
            label={field.name}
          />
        )
      case 'select':
        return (
          <Select
            fullWidth
            value={formData[field.key]}
            onChange={e => handleInputChange(field.key, e.target.value)}
          >
            {field.enum.map(option => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
        )
      case 'duration':
        return (
          <DurationInput
            def={formData[field.key]}
            setFormData={setFormData}
            keyed={field.key}
            label={field.name}
          />
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
      {!show && (
        <Button
          style={{ marginTop: '20px' }}
          variant="text"
          color="secondary"
          onClick={() => setShowForm(false)}
        >
          Hide Form
        </Button>
      )}
    </StyledForm>
  ) : (
    <Button variant="contained" color="primary" onClick={() => setShowForm(true)}>
      {text}
    </Button>
  )
}

export default InputForm
