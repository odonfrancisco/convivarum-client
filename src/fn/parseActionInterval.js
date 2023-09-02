import { SELECT_MS } from '#config'

export default function parseActionInterval({ val, setSelectValue, setNumberValue }) {
  if (!val) {
    if (setNumberValue) setNumberValue(val)
    return 'none'
  }

  for (const [select, ms] of Object.entries(SELECT_MS).reverse()) {
    if (parseInt(val, 10) % ms === 0) {
      const parsedVal = val / ms
      if (setSelectValue && setNumberValue) {
        setSelectValue(select)
        setNumberValue(parsedVal)
      } else {
        const interval = select.slice(0, parsedVal === 1 ? select.length - 1 : select.length)
        return `${parsedVal} ${interval}`
      }
      break
    }
  }
}
