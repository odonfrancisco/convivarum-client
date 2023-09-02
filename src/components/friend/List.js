import _ from 'lodash'
import React, { useState, useEffect, useCallback } from 'react'
import styled from '@emotion/styled'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import CloseFullscreen from '@mui/icons-material/CloseFullscreen'
import OpenInFull from '@mui/icons-material/OpenInFull'
import Edit from '@mui/icons-material/Edit'
import EditOff from '@mui/icons-material/EditOff'

import query from '#query.js'
import { SORT_TYPES, TYPE_INDEXES, ACTIONS, SORT_ACTIONS, INVALID_SORT } from '#config.js'
import InputForm from '#components/util/Input.js'
import ListItemComponent from '#components/friend/Item.js'
import { mutUpdate } from '#fn/objectFns'
import { ACTION_INDEXES } from '#config'

const StyledContainer = styled(Box)`
  max-width: 400px;
  margin: 0 auto;
  padding: 10px;
`

const sortTypes = {
  enabled: {
    fields: ['enabled', 'disabled'],
    check: doc => (doc.enabled ? 'enabled' : 'disabled'),
  },
  action: {
    fields: ACTIONS,
    // check: doc => doc.action,
  },
  contacted: {
    fields: ['contacted', 'to be contacted'],
    check: doc => (doc.contacted ? 'contacted' : 'to be contacted'),
  },
  current: {
    fields: ['current'],
    check: doc => (doc.current && doc.action ? 'current' : ''),
  },
}

const filterFriends = arr => {
  const filteredObj = {}
  const friends = {}

  for (const doc of arr) {
    const { action, _id } = doc
    doc.paths = []
    friends[_id] = doc

    for (const obj of Object.values(sortTypes)) {
      const { check } = obj

      const field = check && check(doc)
      if (!field) continue

      // Pushing _ids instead of the doc itself in order to not duplicate data (since a doc would exist inside two arrays.
      //  one for the all sort and another for the action sort)
      const actSortInd = mutUpdate.push(filteredObj, [action, field], _id)
      const sortInd = mutUpdate.push(filteredObj, ['all', field], _id)
      friends[_id].paths.push([`${action}.${field}`, actSortInd])
      friends[_id].paths.push([`all.${field}`, sortInd])
    }
  }

  return { obj: filteredObj, friends }
}

const getFields = (fields, actionSort) =>
  typeof fields === 'function' ? fields(actionSort) : fields

const makeKey = sort => `${sort.action}.${sort.type}`

const makeFriendsList = ({ filteredObj, friendsObj, sort }) => {
  const ret = {}

  for (const field of getFields(sortTypes[sort.type].fields, sort.action)) {
    const key = makeKey({ ...sort, type: field })
    if (_.get(filteredObj, key)) ret[field] = _.get(filteredObj, key, []).map(id => friendsObj[id])
  }

  return ret
}

function FriendList() {
  const [friendsList, setFriendsList] = useState({})
  const [filteredObj, setFilteredObj] = useState({})
  const [friends, setFriends] = useState({})
  const [loading, setLoading] = useState(true)
  const [editingMode, setEditingMode] = useState(false)
  const [collapse, setCollapse] = useState(false)
  const [sort, setSort] = useState({ action: SORT_ACTIONS[0], type: SORT_TYPES[3] })
  const [error] = useState(null)

  const fetchFriends = useCallback(async () => {
    const res = await query(`/friend/get`)

    if (res.data) {
      const filtered = filterFriends(res.data)

      setFriends(filtered.friends)
      setFilteredObj(filtered.obj)
      setFriendsList(
        makeFriendsList({ filteredObj: filtered.obj, friendsObj: filtered.friends, sort }),
      )

      setLoading(false)
    }
  }, [sort])

  useEffect(() => {
    fetchFriends()
  }, [fetchFriends])

  // Should just fetch the individual friend edited & update its respective paths
  const onFormSubmit = () => {
    fetchFriends()
  }

  const updateSort = async type => {
    const [sortObj, indexObj] =
      type === 'action' ? [SORT_ACTIONS, ACTION_INDEXES] : [SORT_TYPES, TYPE_INDEXES]
    const newSort = sortObj[indexObj[sort[type]] + 1] || sortObj[0]

    setSort(obj => {
      obj[type] = newSort
      return obj
    })
    if (_.get(INVALID_SORT, makeKey({ ...sort, [type]: newSort }))) return updateSort(type)
    setFriendsList(
      makeFriendsList({ filteredObj, friendsObj: friends, sort: { ...sort, [type]: newSort } }),
    )
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
      <Box display="flex" flexDirection="column">
        {/* First Row: Typography and first Button */}
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h4" gutterBottom>
            Your Friends
          </Typography>
          <Button onClick={() => updateSort('action')} variant="outlined">
            {sort.action}
          </Button>
        </Box>

        {/* Second Row: Remaining Buttons */}
        <Box display="flex" alignItems="center" justifyContent="flex-end">
          <Button onClick={() => updateSort('type')} variant="outlined">
            {/* Need to omit the 'current' sort when none exist for it. 
      will accomplish after i begin sorting friends on frontend */}
            {sort.type}
          </Button>
          <Button onClick={() => setCollapse(!collapse)} variant="outlined">
            {collapse ? <OpenInFull /> : <CloseFullscreen />}
          </Button>
          <Button onClick={() => setEditingMode(!editingMode)} variant="outlined">
            {editingMode ? <EditOff /> : <Edit />}
          </Button>
        </Box>
      </Box>

      {Object.entries(friendsList).map(([action, arr]) =>
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
