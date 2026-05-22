export const verifyRole = (...rolesPermitidos) => (req, res, next) => {
  if (!rolesPermitidos.includes(req.usuario?.rol))
    return res.status(403).json({ mensaje: 'Acceso denegado. No tienes permisos para esta acción.' })
  next()
}
