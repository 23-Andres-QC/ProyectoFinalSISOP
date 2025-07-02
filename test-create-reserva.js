// Test directo de la función createReserva
import { useBotiquin } from './src/composables/useBotiquin.js'

// Simular datos de prueba
const productosEjemplo = [
  {
    id_producto: 1,
    nombre: 'Producto Test 1',
    precio: 10.5,
    cantidad: 2,
  },
  {
    id_producto: 2,
    nombre: 'Producto Test 2',
    precio: 15.75,
    cantidad: 1,
  },
]

const montoTotal = 36.75

async function testCreateReserva() {
  console.log('🧪 Probando función createReserva...')

  try {
    const { createReserva } = useBotiquin()

    console.log('📦 Datos de prueba:')
    console.log('- Productos:', productosEjemplo)
    console.log('- Monto total:', montoTotal)

    const resultado = await createReserva(productosEjemplo, montoTotal)

    console.log('✅ Reserva creada exitosamente!')
    console.log('🎯 Resultado:', resultado)
  } catch (error) {
    console.error('❌ Error al crear reserva:', error.message)
    console.error('📝 Detalles completos:', error)
  }
}

testCreateReserva()
