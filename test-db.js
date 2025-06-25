// Test simple para verificar la conexión con Supabase y los datos
import { supabase } from './src/supabase.js'

async function testDatabase() {
  console.log('🔍 Probando conexión con Supabase...')

  try {
    // Test de conexión básica
    const { error: testError } = await supabase.from('usuarios').select('count(*)')

    if (testError) {
      console.error('❌ Error de conexión:', testError)
      return
    }

    console.log('✅ Conexión exitosa')

    // Test de tablas de items y precios
    const tipos = ['escolar', 'hogar', 'oficina', 'industria', 'montania']

    for (const tipo of tipos) {
      console.log(`\n📋 Probando tabla ${tipo}_items...`)

      const { data, error } = await supabase
        .from(`${tipo}_items`)
        .select('id_item, nombre, precio')
        .limit(5)

      if (error) {
        console.error(`❌ Error en ${tipo}_items:`, error)
      } else {
        console.log(`✅ ${tipo}_items: ${data.length} items encontrados`)
        if (data.length > 0) {
          console.log('   Items con precios:')
          data.forEach((item) => {
            console.log(`   - ${item.nombre}: S/${item.precio || 0}`)
          })
        }
      }
    }

    // Test de tabla compras y precio_total
    console.log(`\n💰 Probando tabla compras y precio_total...`)
    const { data: compras, error: comprasError } = await supabase
      .from('compras')
      .select('id_compra, fecha_compra, precio_total')
      .limit(5)

    if (comprasError) {
      console.error(`❌ Error en compras:`, comprasError)
    } else {
      console.log(`✅ compras: ${compras.length} compras encontradas`)
      if (compras.length > 0) {
        console.log('   Compras con precio_total:')
        compras.forEach((compra) => {
          console.log(
            `   - Compra #${compra.id_compra}: S/${compra.precio_total || 0} (${compra.fecha_compra})`,
          )
        })
      }
    }
  } catch (err) {
    console.error('💥 Error general:', err)
  }
}

// Ejecutar test si se ejecuta directamente
if (import.meta.url === new URL(import.meta.resolve('.'), import.meta.url).href) {
  testDatabase()
}

export { testDatabase }
