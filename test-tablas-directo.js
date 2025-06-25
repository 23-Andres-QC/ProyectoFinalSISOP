// Test directo para verificar acceso a todas las tablas de items
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vcttfgjgvfqbfatehugp.supabase.co'
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZjdHRmZ2pndmZxYmZhdGVodWdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM3Nzg0ODUsImV4cCI6MjA0OTM1NDQ4NX0.QUOSo8p8WG_OLdgf02L4lN6dGjg7a-lQsJRJNpKDqas'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testTodasLasTablas() {
  console.log('🧪 Test directo de acceso a todas las tablas de items...')

  const tablas = [
    'hogar_items',
    'escolar_items',
    'oficina_items',
    'industria_items',
    'montania_items',
  ]

  for (const tabla of tablas) {
    console.log(`\n📋 Probando tabla: ${tabla}`)

    try {
      // Test 1: Verificar si la tabla existe y tiene datos
      const { data: allItems, error: allError } = await supabase
        .from(tabla)
        .select('id_item, nombre, precio')
        .limit(5)

      if (allError) {
        console.error(`❌ Error accediendo a ${tabla}:`, allError)
        continue
      }

      console.log(`✅ ${tabla}: ${allItems.length} items encontrados`)
      allItems.forEach((item) => {
        console.log(`   - ID: ${item.id_item}, Nombre: "${item.nombre}", Precio: ${item.precio}`)
      })

      // Test 2: Probar consulta específica por ID (simular lo que hace la app)
      if (allItems.length > 0) {
        const primeraId = allItems[0].id_item
        console.log(`\n🔍 Test consulta específica para ${tabla} con ID ${primeraId}:`)

        const { data: itemEspecifico, error: especificoError } = await supabase
          .from(tabla)
          .select('nombre, precio')
          .eq('id_item', primeraId)
          .single()

        if (especificoError) {
          console.error(`❌ Error consulta específica ${tabla}:`, especificoError)
        } else {
          console.log(`✅ Item específico encontrado:`, itemEspecifico)
        }
      }
    } catch (err) {
      console.error(`💥 Error inesperado con ${tabla}:`, err)
    }
  }

  // Test 3: Simular exactamente lo que hace obtenerHistorialCompras
  console.log('\n🔄 Simulando obtenerHistorialCompras...')

  try {
    const { data: comprasTest, error: comprasError } = await supabase
      .from('compras')
      .select(
        `
        id_compra,
        fecha_compra,
        precio_total,
        detalle_compras(
          id_detalle,
          tipo_kit,
          id_item,
          cantidad
        )
      `,
      )
      .limit(3)

    if (comprasError) {
      console.error('❌ Error obteniendo compras:', comprasError)
      return
    }

    console.log('✅ Compras obtenidas:', comprasTest.length)

    for (const compra of comprasTest) {
      console.log(`\n📦 Compra ${compra.id_compra}:`)

      for (const detalle of compra.detalle_compras) {
        console.log(`   - Detalle: tipo_kit="${detalle.tipo_kit}", id_item=${detalle.id_item}`)

        // Simular mapeo y consulta
        const tipoParaBD = detalle.tipo_kit === 'montaña' ? 'montania' : detalle.tipo_kit
        const tablaItems = `${tipoParaBD}_items`

        console.log(`   - Consultando tabla: ${tablaItems}`)

        const { data: itemData, error: itemError } = await supabase
          .from(tablaItems)
          .select('nombre, precio')
          .eq('id_item', detalle.id_item)
          .single()

        if (itemError) {
          console.error(`   ❌ ERROR obteniendo item:`, itemError)
        } else {
          console.log(`   ✅ Item encontrado: "${itemData.nombre}" - S/${itemData.precio}`)
        }
      }
    }
  } catch (err) {
    console.error('💥 Error en simulación:', err)
  }
}

testTodasLasTablas()
