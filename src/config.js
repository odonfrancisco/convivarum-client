export const PROD = process.env.NODE_ENV === 'production'

export const HOUR = 3.6e6
export const SORT_TYPES = Object.entries(['enabled', 'action', 'contacted'])

export const SELECT_MS = {
  weeks: HOUR * 24 * 7,
  days: HOUR * 24,
  hours: HOUR,
}

export const FRIEND_FIELDS = obj =>
  [
    {
      name: 'name',
      type: 'text',
      check: value => (value.length < 3 ? 'Name should be at least 3 characters.' : null),
      default: obj?.name || '',
    },
    { name: 'action', type: 'select', enum: ['call', 'text', 'hang'], default: obj?.action },
    { name: 'enabled', type: 'checkbox', default: obj?.enabled || true },
    { name: 'details', type: 'text', default: obj?.details },
  ].map(obj => {
    if (!obj.key) obj.key = obj.name
    return obj
  })

export const USER_FIELDS = obj =>
  [
    {
      name: 'username',
      type: 'text',
      check: value => (value.length < 3 ? 'Username should be at least 3 characters.' : null),
      default: obj?.username || '',
    },
    { name: 'email', type: 'text', default: obj?.email || '' },
    ...Object.entries(obj.freq).map(([action, obj]) => ({
      key: `freq.${action}`,
      name: action,
      type: 'duration',
      default: obj.interval || 1,
    })),
  ].map(obj => {
    if (!obj.key) obj.key = obj.name
    return obj
  })
