export const PROD = process.env.NODE_ENV === 'production'

export const HOUR = 3.6e6
export const SORT_TYPES = ['enabled', 'action', 'contacted', 'current']
export const TYPE_INDEXES = SORT_TYPES.reduce((a, c, i) => ({ ...a, [c]: i }), {})

export const ACTIONS = ['convene', 'call', 'text']
export const SORT_ACTIONS = [...ACTIONS, 'all']
export const ACTION_INDEXES = SORT_ACTIONS.reduce((a, c, i) => ({ ...a, [c]: i }), {})

export const INVALID_SORT = SORT_ACTIONS.reduce(
  (a, c) => ({ ...a, [c]: ['action'].reduce((a, s) => ({ ...a, [s]: 1 }), {}) }),
  {},
)

export const SELECT_MS = {
  ...(!PROD && {
    seconds: HOUR / 60 / 60,
  }),
  days: HOUR * 24,
  weeks: HOUR * 24 * 7,
  months: HOUR * 24 * 30,
}

export const FIELDS = {
  user: obj => {
    const arr = [
      {
        name: 'username',
        type: 'text',
        check: value => (value.length < 3 ? 'Username should be at least 3 characters.' : null),
        default: obj?.username || '',
        value: obj?.username,
      },
      { name: 'email', type: 'text', default: obj?.email || '' },
      ...Object.entries(obj.action).map(([action, obj]) => ({
        key: `action.${action}.interval`,
        name: action,
        type: 'duration',
        default: obj.interval || 0,
      })),
      ...(!obj.next
        ? [
            {
              key: 'delayNext',
              name: 'Send first email',
              type: 'duration',
            },
          ]
        : []),
    ]

    return arr.map(obj => {
      if (!obj.key) obj.key = obj.name
      return obj
    })
  },
  friend: obj =>
    [
      {
        name: 'name',
        type: 'text',
        check: value => (value.length < 3 ? 'Name should be at least 3 characters.' : null),
        default: obj?.name || '',
      },
      { name: 'action', type: 'select', enum: ACTIONS, default: obj?.action },
      { name: 'enabled', type: 'checkbox', default: obj ? obj.enabled : true },
      { name: 'contacted', type: 'checkbox', default: obj?.contacted || false },

      { name: 'details', type: 'text', default: obj?.details },
    ].map(obj => {
      if (!obj.key) obj.key = obj.name
      return obj
    }),
}
