import crypto from 'crypto'

const FLOW_API_URL    = process.env.FLOW_API_URL    || 'https://sandbox.flow.cl/api'
const FLOW_API_KEY    = process.env.FLOW_API_KEY    || ''
const FLOW_SECRET_KEY = process.env.FLOW_SECRET_KEY || ''

function firmarParametros(params) {
  const sorted = Object.keys(params).sort().reduce((acc, key) => {
    acc[key] = params[key]
    return acc
  }, {})
  const cadena = Object.entries(sorted).map(([k, v]) => `${k}${v}`).join('')
  return crypto.createHmac('sha256', FLOW_SECRET_KEY).update(cadena).digest('hex')
}

export const crearSesionPago = async ({ pagoId, monto, concepto, correoUsuario }) => {
  const params = {
    apiKey:       FLOW_API_KEY,
    commerceOrder: pagoId,
    subject:      concepto,
    amount:       monto,
    email:        correoUsuario,
    urlConfirmation: `${process.env.CLIENT_URL?.replace('5173', '3001') || 'http://localhost:3001'}/api/membresia/webhook`,
    urlReturn:    `${process.env.CLIENT_URL || 'http://localhost:5173'}/membresia/resultado`,
  }
  params.s = firmarParametros(params)

  const body = new URLSearchParams(params)
  const resp = await fetch(`${FLOW_API_URL}/payment/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  })

  if (!resp.ok) throw new Error(`Flow error: ${resp.status}`)
  const json = await resp.json()
  return `${json.url}?token=${json.token}`
}

export const verificarPago = async (token) => {
  const params = { apiKey: FLOW_API_KEY, token }
  params.s = firmarParametros(params)

  const qs = new URLSearchParams(params)
  const resp = await fetch(`${FLOW_API_URL}/payment/getStatus?${qs}`)
  if (!resp.ok) throw new Error(`Flow error al verificar: ${resp.status}`)
  return resp.json()
}

export default { crearSesionPago, verificarPago }
