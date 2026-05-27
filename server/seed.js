import 'dotenv/config'
import mongoose from 'mongoose'
import Usuario  from './src/models/Usuario.js'

await mongoose.connect(process.env.MONGODB_URI)
console.log('MongoDB conectado')

const usuarios = [
  {
    nombre:       'Administrador CODICH',
    correo:       'admin@codich.cl',
    passwordHash: 'Admin1234!',
    rol:          'administrador',
    estado:       'activo',
  },
  {
    nombre:       'Instructor Demo',
    correo:       'instructor@codich.cl',
    passwordHash: 'Instructor1234!',
    rol:          'instructor',
    estado:       'activo',
    especialidad: 'Diseño Industrial',
  },
]

for (const datos of usuarios) {
  const existe = await Usuario.findOne({ correo: datos.correo })
  if (existe) {
    console.log(`⚠  Ya existe: ${datos.correo}`)
    continue
  }
  const u = new Usuario(datos)
  await u.save()
  console.log(`✅ Creado [${u.rol}]: ${u.correo}`)
}

await mongoose.disconnect()
console.log('\nUsuarios disponibles:')
console.log('  Admin      → admin@codich.cl       / Admin1234!')
console.log('  Instructor → instructor@codich.cl  / Instructor1234!')
process.exit(0)
