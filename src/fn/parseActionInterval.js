import { SELECT_MS } from '#config'

export default function parseActionInterval({ val, setSelectValue, setNumberValue }) {
  for (const [select, ms] of Object.entries(SELECT_MS)) {
    if (parseInt(val, 10) % ms === 0) {
      const parsedVal = parseInt(val, 10) / ms
      if (setSelectValue && setNumberValue) {
        setSelectValue(select)
        setNumberValue(parsedVal)
      } else {
        return `${parsedVal} ${select}`
      }
      break
    }
  }
}
