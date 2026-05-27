// ─────────────────────────────────────────────────────────────────────────────
// MOCK de pasarela de pago — entorno de desarrollo / pruebas
// En producción reemplazar crearSesionPago y verificarPago con las
// llamadas reales a la API de Flow: https://www.flow.cl/docs/api.html
// ─────────────────────────────────────────────────────────────────────────────

export const crearSesionPago = async ({ pagoId }) => {
  // Devuelve URL simulada; el frontend maneja la simulación de forma inline
  return `http://localhost:5173/pago-simulado?pagoId=${pagoId}`
}

export const verificarPago = async (token) => {
  // Mock: status 2 = aprobado en protocolo Flow
  return { status: 2, comercioOrden: token, flowOrder: `MOCK-${Date.now()}` }
}

export default { crearSesionPago, verificarPago }
