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

    // Test de tablas de items
    const tipos = ['escolar', 'hogar', 'oficina', 'industria', 'montania']

    for (const tipo of tipos) {
      console.log(`\n📋 Probando tabla ${tipo}_items...`)

      const { data, error } = await supabase.from(`${tipo}_items`).select('*').limit(5)

      if (error) {
        console.error(`❌ Error en ${tipo}_items:`, error)
      } else {
        console.log(`✅ ${tipo}_items: ${data.length} items encontrados`)
        if (data.length > 0) {
          console.log('   Primeros items:', data.map((item) => item.nombre).slice(0, 3))
        }
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
