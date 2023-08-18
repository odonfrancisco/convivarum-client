import axios from 'axios'

const baseUrl =
  process.env.NODE_ENV === 'production'
    ? 'http://api.odonfrancis.co/api'
    : 'http://localhost:8080/api'

export default async function query(ext, { method = 'get', payload } = {}) {
  try {
    const fullUrl = `${baseUrl}${ext}`
    const opts = {
      url: fullUrl,
      method,
      withCredentials: true,
      data: payload,
    }
    const res = await axios(opts)
    // const res = await axios[method](fullUrl, /* payload, */ { withCredentials: true })

    return res?.data
  } catch (err) {
    // toast
    console.log('op')
    return { err }
  }
}
