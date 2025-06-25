// Test para verificar que la columna precio_total existe y funciona
import { createClient } from '@supabase/supabase-js'

// Configuración de Supabase (usar las mismas credenciales que en tu app)
const supabaseUrl = 'https://bhqzovlbtdzowammsqha.supabase.co'
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJocXpvdmxidGR6b3dhbW1zcWhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzAyMzYzNDUsImV4cCI6MjA0NTgxMjM0NX0.P8iPxwHh5jR4v8mfK7K7bnGX1T5JNuQ1HRLFCz0mLo8'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testPrecioTotal() {
  console.log('🧪 Iniciando test de precio_total...')

  try {
    // 1. Verificar estructura de tabla compras
    console.log('\n📋 1. Verificando estructura de tabla compras...')
    const { data: compras, error: comprasError } = await supabase
      .from('compras')
      .select('id_compra, fecha_compra, precio_total')
      .limit(5)

    if (comprasError) {
      console.error('❌ Error consultando compras:', comprasError)
      return
    }

    console.log('✅ Compras encontradas:', compras?.length || 0)
    if (compras && compras.length > 0) {
      console.log('📊 Muestra de compras:')
      compras.forEach((compra, index) => {
        console.log(`  Compra ${index + 1}:`, {
          id: compra.id_compra,
          fecha: compra.fecha_compra,
          precio_total: compra.precio_total,
          tipo_precio: typeof compra.precio_total,
        })
      })
    }

    // 2. Verificar precios en items
    console.log('\n💰 2. Verificando precios en items...')
    const tablas = [
      'escolar_items',
      'hogar_items',
      'industria_items',
      'oficina_items',
      'montania_items',
    ]

    for (const tabla of tablas) {
      const { data: items, error: itemsError } = await supabase
        .from(tabla)
        .select('id_item, nombre, precio')
        .limit(3)

      if (itemsError) {
        console.warn(`⚠️ Error en ${tabla}:`, itemsError.message)
        continue
      }

      console.log(`✅ ${tabla}:`, items?.length || 0, 'items')
      if (items && items.length > 0) {
        items.forEach((item) => {
          console.log(`  - ${item.nombre}: S/${item.precio || 0}`)
        })
      }
    }
  } catch (error) {
    console.error('💥 Error en test:', error)
  }
}

// Ejecutar test
testPrecioTotal()
