import React, { useState, useEffect } from 'react'
import formatDistance from 'date-fns/formatDistance'
import Box from '@mui/material/Box'
import List from '@mui/material/List'
import Tooltip from '@mui/material/Tooltip'
import ListItem from '@mui/material/ListItem'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import MenuIcon from '@mui/icons-material/Menu'
import ChangeCircle from '@mui/icons-material/ChangeCircle'

import InputForm from '#components/util/Input.js'
import query from '#query.js'
import { ACTIONS } from '#config'

// Object of itemTypes -> sort
const hideItem = {
  action: ACTIONS.reduce((a, c) => ({ ...a, [c]: 1 }), {}),
  lastContacted: { current: true },
  contacted: { contacted: true, current: true, enabled: true },
  details: { contacted: true, action: true, enabled: true },
}

function FriendItemComponent({ sort, friend, onSubmit, isEditing }) {
  return (
    <div key={friend._id}>
      <ListItem
        key={friend._id}
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
      >
        <Box>
          <Typography variant="h6">{friend.name}</Typography>
          {!hideItem.details[sort.type] && (
            <Typography variant="body1" sx={{ mt: 0.5 }}>
              {friend.details}
            </Typography>
          )}{' '}
          {/* Right now this one doesn't even appear */}
          {!hideItem.contacted[sort.type] && (
            <Typography variant="body2" sx={{ mt: 0.5 }}>
              Contacted: {String(friend.contacted)}
            </Typography>
          )}{' '}
          {friend.lastContacted && !hideItem.lastContacted[sort.type] && (
            <Typography variant="body2" sx={{ mt: 0.5 }}>
              Last Contacted: {formatDistance(friend.lastContacted, Date.now())} ago
            </Typography>
          )}
          {!hideItem.action[sort.action] && (
            <Typography variant="body2" sx={{ mt: 0.5 }}>
              {String(friend.action)}
            </Typography>
          )}
        </Box>
      </ListItem>{' '}
      {isEditing && (
        <div>
          <InputForm
            text="Edit"
            // Should just fetch the individual friend instead of the entire array in order to reduce api load
            onFormSubmit={onSubmit}
            url={`/friend/update/${friend._id}`}
            type="friend"
            obj={friend}
          />
        </div>
      )}
    </div>
  )
}

export default function ListItemComponent({
  action,
  arr,
  collapse,
  fetchFriends,
  editingMode,
  sort,
}) {
  const [innerCollapse, setInnerCollapse] = useState(collapse)

  const handleCollapseToggle = async () => {
    setInnerCollapse(v => !v)
  }

  const handleChangeCurrent = async () => {
    const ext = `/friend/changeCurrent?action=${action}`
    const res = await query(ext)

    if (res) fetchFriends()
  }

  useEffect(() => {
    const inferNext = () => {
      if (collapse) setInnerCollapse(true)
      else setInnerCollapse(false)
    }

    inferNext()
  }, [collapse])

  return (
    <div>
      <Typography variant="h6">
        {action}{' '}
        <IconButton onClick={handleCollapseToggle}>
          <MenuIcon />
        </IconButton>
        {sort.type === 'current' && editingMode && (
          <Tooltip title="Change current">
            <IconButton onClick={handleChangeCurrent}>
              <ChangeCircle />
            </IconButton>
          </Tooltip>
        )}
      </Typography>
      {!innerCollapse && (
        <List>
          {arr.map(friend => (
            <FriendItemComponent
              friend={friend}
              onSubmit={fetchFriends}
              isEditing={editingMode}
              sort={sort}
            />
          ))}
        </List>
      )}
    </div>
  )
}
