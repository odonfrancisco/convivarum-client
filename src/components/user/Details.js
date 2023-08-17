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
            <strong>Frequency:</strong>
            <FreqDetail>
              <strong>Call: </strong>
              Last - {!user.freq.call.last ? 'never' : formatDistance(user.freq.call.last)},
              Interval - {parseActionInterval({ val: user.freq.call.interval })}
            </FreqDetail>
            <FreqDetail>
              <strong>Text: </strong>
              Last - {!user.freq.text.last ? 'never' : formatDistance(user.freq.text.last)},
              Interval - {parseActionInterval({ val: user.freq.text.interval })}
            </FreqDetail>
            <FreqDetail>
              <strong>Hang: </strong>
              Last - {!user.freq.hang.last ? 'never' : formatDistance(user.freq.hang.last)},
              Interval - {parseActionInterval({ val: user.freq.hang.interval })}
            </FreqDetail>
          </UserDetail>
        </UserDetailsContainer>
      )}
    </div>
  )
}

export default UserProfile
