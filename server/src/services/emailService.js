import nodemailer from 'nodemailer'
import Usuario    from '../models/Usuario.js'

const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST || 'smtp.gmail.com',
  port:   parseInt(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export const enviarComprobante = async ({ usuarioId, pago }) => {
  const usuario = await Usuario.findById(usuarioId)
  if (!usuario) return

  await transporter.sendMail({
    from:    process.env.EMAIL_FROM || 'CODICH <no-reply@codich.cl>',
    to:      usuario.correo,
    subject: 'Comprobante de pago — CODICH',
    html: `
      <h2>¡Pago confirmado!</h2>
      <p>Hola <strong>${usuario.nombre}</strong>,</p>
      <p>Tu pago ha sido procesado exitosamente.</p>
      <ul>
        <li>Monto: <strong>$${pago.monto.toLocaleString('es-CL')} CLP</strong></li>
        <li>Concepto: ${pago.concepto}</li>
        <li>ID Transacción: ${pago.idTransaccion}</li>
        <li>Fecha: ${new Date().toLocaleDateString('es-CL')}</li>
      </ul>
      <p>Gracias por confiar en CODICH.</p>
    `,
  })
}

export const enviarBienvenida = async ({ correo, nombre }) => {
  await transporter.sendMail({
    from:    process.env.EMAIL_FROM || 'CODICH <no-reply@codich.cl>',
    to:      correo,
    subject: 'Bienvenido/a a CODICH',
    html: `
      <h2>Bienvenido/a, ${nombre}</h2>
      <p>Tu cuenta en la plataforma CODICH ha sido creada exitosamente.</p>
      <p>Ya puedes iniciar sesión y explorar las tutorías disponibles.</p>
    `,
  })
}

export const enviarResetPassword = async ({ correo, nombre, enlace }) => {
  await transporter.sendMail({
    from:    process.env.EMAIL_FROM || 'CODICH <no-reply@codich.cl>',
    to:      correo,
    subject: 'Recuperación de contraseña — CODICH',
    html: `
      <h2>Hola, ${nombre}</h2>
      <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta CODICH.</p>
      <p>Haz clic en el siguiente enlace para crear una nueva contraseña (válido por <strong>1 hora</strong>):</p>
      <p><a href="${enlace}" style="color:#4f46e5">${enlace}</a></p>
      <p>Si no solicitaste esto, puedes ignorar este correo con seguridad.</p>
    `,
  })
}

export default { enviarComprobante, enviarBienvenida, enviarResetPassword }
