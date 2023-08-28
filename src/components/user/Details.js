import React, { useContext, useState } from 'react'
import formatDistance from 'date-fns/formatDistance'
import styled from '@emotion/styled'
import Button from '@mui/material/Button'
import LowPriorityIcon from '@mui/icons-material/LowPriority'

import UserContext from '#context/UserContext.js'
import InputForm from '#components/util/Input.js'
import parseActionInterval from '#fn/parseActionInterval.js'
import NavButton from '#components/util/NavButton.js'

import { ACTIONS } from '#config'

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
  margin-bottom: 20px; // space between each action detail
`

const ActionTitle = styled.strong`
  display: block;
  margin-bottom: 10px;
`

const ActionSubDetail = styled.div`
  margin-left: 40px; // to give it the outline effect
`

const ActionDetail = ({ user, action }) => {
  return (
    <FreqDetail>
      <ActionTitle>{action}</ActionTitle>
      <ActionSubDetail>
        Last:{' '}
        {!user.action[action].last
          ? 'never'
          : `${formatDistance(user.action[action].last, Date.now())} ago`}
      </ActionSubDetail>
      <ActionSubDetail>
        Interval: {parseActionInterval({ val: user.action[action].interval })}
      </ActionSubDetail>
    </FreqDetail>
  )
}

// Missing small details like re-fetching/updating the existing user in context on successful call
function UserProfile() {
  const { user, getUser } = useContext(UserContext)

  const [editingMode, setEditingMode] = useState(false)

  if (!user) return <div></div>

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button onClick={() => setEditingMode(!editingMode)} variant="outlined">
          {editingMode ? 'Done' : 'Edit'}
        </Button>

        <NavButton
          link={'/logout'}
          icon={<LowPriorityIcon color="red" htmlColor="red" />}
          text={'Logout'}
          textColor="red"
        />
      </div>

      {editingMode ? (
        <InputForm
          text="Edit thyself"
          type="user"
          obj={user}
          onFormSubmit={() => {
            getUser()
            setEditingMode(false)
          }}
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
            <strong>Next email:</strong> {user.next > Date.now() ? `in${' '}` : ''}
            {user.next ? formatDistance(user.next, Date.now()) : 'Not yet set'}
            {Date.now() > user.next ? ' ago' : ''}
          </UserDetail>

          <UserDetail>
            <strong>Actions:</strong>
            {ACTIONS.map(action => (
              <ActionDetail action={action} user={user} />
            ))}
          </UserDetail>
        </UserDetailsContainer>
      )}
    </div>
  )
}

export default UserProfile
