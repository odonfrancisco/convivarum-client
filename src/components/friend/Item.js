import React, { useState, useEffect } from 'react'
import formatDistance from 'date-fns/formatDistance'
import Box from '@mui/material/Box'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import MenuIcon from '@mui/icons-material/Menu'

import InputForm from '#components/util/Input.js'
import { FRIEND_FIELDS } from '#config'

function FriendItemComponent({ friend, onSubmit, isEditing }) {
  return (
    <div key={friend._id}>
      <ListItem
        key={friend._id}
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
      >
        <Box>
          <Typography variant="h6">{friend.name}</Typography>
          {/* <Typography variant="body1" sx={{ mt: 0.5 }}>
            {friend.details}
          </Typography> */}
          <Typography variant="body2" sx={{ mt: 0.5 }}>
            Contacted: {String(friend.contacted)}
          </Typography>
          {friend.lastContacted && (
            <Typography variant="body2" sx={{ mt: 0.5 }}>
              Last Contacted: {formatDistance(friend.lastContacted, Date.now())}
            </Typography>
          )}
          <Typography variant="body2" sx={{ mt: 0.5 }}>
            {String(friend.action)}
          </Typography>
        </Box>
      </ListItem>{' '}
      {isEditing && (
        <div>
          <InputForm
            text="Edit"
            // Should just fetch the individual friend instead of the entire array in order to reduce api load
            onFormSubmit={onSubmit}
            url={`/friend/update/${friend._id}`}
            fields={FRIEND_FIELDS(friend)}
          />
        </div>
      )}
    </div>
  )
}

export default function ListItemComponent({ k, v, collapse, fetchFriends, editingMode }) {
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
