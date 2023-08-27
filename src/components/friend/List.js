import React, { useState, useEffect } from 'react'
import styled from '@emotion/styled'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'

import query from '#query.js'
import { SORT_TYPES, SORT_INDEXES } from '#config.js'
import InputForm from '#components/util/Input.js'
import ListItemComponent from '#components/friend/Item.js'

const StyledContainer = styled(Box)`
  max-width: 400px;
  margin: 0 auto;
  padding: 10px;
`

function FriendList() {
  const [friends, setFriends] = useState({})
  const [loading, setLoading] = useState(true)
  const [editingMode, setEditingMode] = useState(false)
  const [collapse, setCollapse] = useState(true)
  const [sort, setSort] = useState(SORT_TYPES[1])
  const [error] = useState(null)

  // I agree i shouldn't be calling fetchFriends this often
  const fetchFriends = async sort => {
    const res = await query(`/friend/get${sort ? `?sort=${sort}` : ''}`)

    if (res.data) {
      setFriends(res.data)
      setLoading(false)
    }
  }

  useEffect(() => {
    // Should just sort internally instead of calling APi. too much unecessary load
    fetchFriends(sort)
  }, [sort])

  // Should just fetch the individual friend edited
  const onFormSubmit = () => {
    fetchFriends(sort)
  }

  const updateSort = async () => {
    const newSort = SORT_TYPES[SORT_INDEXES[sort] + 1] || SORT_TYPES[0]

    setSort(newSort)
  }

  if (loading)
    return (
      <Box display="flex" justifyContent="center">
        <CircularProgress />
      </Box>
    )
  if (error)
    return (
      <Box display="flex" justifyContent="center">
        <Typography variant="h6">Error: {error}</Typography>
      </Box>
    )

  return (
    <StyledContainer>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Typography variant="h4" gutterBottom>
          Your Friends
        </Typography>

        <Button onClick={updateSort} variant="outlined">
          {/* Need to omit the 'current' sort when none exist for it. will accomplish after i begin sorting friends on frontend */}
          {sort}
        </Button>
        <Button onClick={() => setCollapse(!collapse)} variant="outlined">
          {collapse ? 'Expand' : 'Collapse'}
        </Button>
        <Button onClick={() => setEditingMode(!editingMode)} variant="outlined">
          {editingMode ? 'Done' : 'Edit'}
        </Button>
      </Box>

      {Object.entries(friends).map(([action, arr]) =>
        arr.length ? (
          <ListItemComponent
            action={action}
            arr={arr}
            fetchFriends={onFormSubmit}
            editingMode={editingMode}
            collapse={collapse}
            sort={sort}
          />
        ) : (
          ''
        ),
      )}

      <Box mt={3}>
        <InputForm
          text="Add Friend"
          type="friend"
          onFormSubmit={onFormSubmit}
          url={'/friend/create'}
        />
      </Box>
    </StyledContainer>
  )
}

export default FriendList
