import React, { useContext, useState } from 'react'
import formatDistance from 'date-fns/formatDistance'
import styled from '@emotion/styled'
import Button from '@mui/material/Button'

import UserContext from '#context/UserContext.js'
import InputForm from '#components/util/Input.js'
import { USER_FIELDS } from '#config'
import parseActionInterval from '#fn/parseActionInterval.js'

const UserDetailsContainer = styled.div`
  max-width: 600px;
  margin: 0 auto;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
  border-radius: 5px;
`

const UserDetail = styled.div`
  margin-bottom: 20px;
`

const FreqDetail = styled.div`
  margin-left: 20px;
`

const ActionDetail = ({ user, action }) => {
  return (
    <FreqDetail>
      <strong>{action}: </strong>
      Last -{' '}
      {!user.action[action].last ? 'never' : formatDistance(user.action[action].last, Date.now())},
      Interval - {parseActionInterval({ val: user.action[action].interval })}
    </FreqDetail>
  )
}

// Missing small details like re-fetching/updating the existing user in context on successful call
function UserProfile() {
  const { user } = useContext(UserContext)

  const [editingMode, setEditingMode] = useState(false)

  if (!user) return <div></div>

  return (
    <div>
      <Button onClick={() => setEditingMode(!editingMode)} variant="outlined">
        {editingMode ? 'Done' : 'Edit'}
      </Button>

      {editingMode ? (
        <InputForm
          text="Edit thyself"
          fields={USER_FIELDS(user)}
          // onFormSubmit
          show={true}
          url={'/user/update'}
        />
      ) : (
        <UserDetailsContainer>
          <UserDetail>
            <strong>Username:</strong> {user.username}
          </UserDetail>

          <UserDetail>
            <strong>Email:</strong> {user.email}
          </UserDetail>

          <UserDetail>
            <strong>Actions:</strong>
            {['call', 'text', 'hang'].map(action => (
              <ActionDetail action={action} user={user} />
            ))}
          </UserDetail>
        </UserDetailsContainer>
      )}
    </div>
  )
}

export default UserProfile
