import React, { useState, useEffect } from 'react'
import styled from '@emotion/styled'
import Box from '@mui/material/Box'
import List from '@mui/material/List'
import Button from '@mui/material/Button'
import ListItem from '@mui/material/ListItem'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import InputButton from '#components/util/Input.js'
import IconButton from '@mui/material/IconButton'
import MenuIcon from '@mui/icons-material/Menu'

import query from '#query.js'
import { SORT_TYPES } from '#config'

const StyledContainer = styled(Box)`
  max-width: 400px;
  margin: 0 auto;
  padding: 10px;
`

const fields = obj => [
  { name: '_id', disable: true, default: obj?._id },
  {
    name: 'name',
    type: 'text',
    check: value => (value.length < 3 ? 'Name should be at least 3 characters.' : null),
    default: obj?.name || '',
  },
  { name: 'action', type: 'select', enum: ['call', 'text', 'hang'], default: obj?.action },
  { name: 'enabled', type: 'checkbox', default: obj?.enabled || true },
  { name: 'details', type: 'text', default: obj?.details },
]

function FriendItemComponent({ friend, onSubmit, isEditing }) {
  return (
    <div key={friend._id}>
      <ListItem
        key={friend._id}
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
      >
        <Box>
          <Typography variant="h6">{friend.name}</Typography>
          <Typography variant="body1" sx={{ mt: 0.5 }}>
            {friend.details}
          </Typography>
          <Typography variant="body2" sx={{ mt: 0.5 }}>
            Contacted: {String(friend.contacted)}
          </Typography>
        </Box>
      </ListItem>{' '}
      {isEditing && (
        <div>
          <InputButton
            text="Edit"
            // Should just fetch the individual friend instead of the entire array in order to reduce api load
            onFormSubmit={onSubmit}
            url={`/friend/update/${friend._id}`}
            fields={fields(friend)}
          />
        </div>
      )}
    </div>
  )
}

const ListItemComponent = ({ k, v, collapse, fetchFriends, editingMode }) => {
  const [innerCollapse, setInnerCollapse] = useState(collapse)
  const [manuallyToggled, setManuallyToggled] = useState(false)

  const handleCollapseToggle = async () => {
    setInnerCollapse(v => !v)
    setManuallyToggled(true)
  }

  useEffect(() => {
    const inferNext = () => {
      if (collapse) setInnerCollapse(true)
      else setInnerCollapse(false)

      setManuallyToggled(false)
    }

    inferNext()
  }, [collapse])

  return (
    <div>
      <Typography variant="h6">
        {k}{' '}
        <IconButton onClick={handleCollapseToggle}>
          <MenuIcon />
        </IconButton>
      </Typography>
      {(manuallyToggled ? !innerCollapse : !collapse || !innerCollapse) && (
        <List>
          {v.map(friend => (
            <FriendItemComponent friend={friend} onSubmit={fetchFriends} isEditing={editingMode} />
          ))}
        </List>
      )}
    </div>
  )
}

function FriendList() {
  const [friends, setFriends] = useState({ enabled: [], disabled: [] })
  const [loading, setLoading] = useState(true)
  const [editingMode, setEditingMode] = useState(false)
  const [collapse, setCollapse] = useState(true)
  const [sort, setSort] = useState(SORT_TYPES[1])
  const [error, setError] = useState(null)

  const fetchFriends = async sort => {
    const res = await query(`/friend/get${sort ? `?sort=${sort}` : ''}`)

    if (res.data) {
      setFriends(res.data)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFriends()
  }, [])

  const onFormSubmit = (formData, apiRes) => {
    fetchFriends()
  }

  const updateSort = async () => {
    const newSort = SORT_TYPES[parseInt(sort[0], 10) + 1] || SORT_TYPES[0]

    setSort(newSort)
    // Should just sort internally instead of calling APi. too much unecessary load
    await fetchFriends(newSort[1])
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
          {sort[1]}
        </Button>
        <Button onClick={() => setCollapse(!collapse)} variant="outlined">
          {collapse ? 'Expand' : 'Collapse'}
        </Button>
        <Button onClick={() => setEditingMode(!editingMode)} variant="outlined">
          {editingMode ? 'Done' : 'Edit'}
        </Button>
      </Box>

      {Object.entries(friends).map(([k, v]) =>
        v.length ? (
          <ListItemComponent
            k={k}
            v={v}
            fetchFriends={fetchFriends}
            editingMode={editingMode}
            collapse={collapse}
          />
        ) : (
          ''
        ),
      )}

      <Box mt={3}>
        <InputButton
          text="Add Friend"
          fields={fields()}
          onFormSubmit={onFormSubmit}
          url={'/friend/create'}
        />
      </Box>
    </StyledContainer>
  )
}

export default FriendList
