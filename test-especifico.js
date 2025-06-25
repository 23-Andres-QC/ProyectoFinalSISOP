// Test específico para verificar la compra escolar con item 8
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vcttfgjgvfqbfatehugp.supabase.co'
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZjdHRmZ2pndmZxYmZhdGVodWdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM3Nzg0ODUsImV4cCI6MjA0OTM1NDQ4NX0.QUOSo8p8WG_OLdgf02L4lN6dGjg7a-lQsJRJNpKDqas'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testEspecifico() {
  console.log('🧪 Test específico para compra escolar con item 8...')

  // Simular el mismo query que hace la aplicación
  console.log('\n1. Simulando query de la aplicación para compra 6:')

  const { data: compraData, error: compraError } = await supabase
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
    .eq('id_compra', 6)
    .single()

  if (compraError) {
    console.error('❌ Error obteniendo compra 6:', compraError)
    return
  }

  console.log('✅ Compra 6 obtenida:', compraData)

  // Procesar cada detalle como lo hace la aplicación
  for (const detalle of compraData.detalle_compras) {
    console.log(`\n2. Procesando detalle:`, detalle)

    // Aplicar la misma lógica de mapeo
    const mapearTipoParaBD = (tipo) => {
      return tipo === 'montaña' ? 'montania' : tipo
    }

    const tipoParaBD = mapearTipoParaBD(detalle.tipo_kit)
    const tablaItems = `${tipoParaBD}_items`

    console.log(
      `🔍 Buscando item ${detalle.id_item} en tabla ${tablaItems} (tipo original: ${detalle.tipo_kit})`,
    )

    const { data: itemData, error: itemError } = await supabase
      .from(tablaItems)
      .select('nombre, precio')
      .eq('id_item', detalle.id_item)
      .single()

    console.log(`📊 Resultado query - itemData:`, itemData, `itemError:`, itemError)

    if (itemError) {
      console.error(`❌ Error específico:`, itemError.message, itemError.details)
    } else {
      console.log(`✅ Item encontrado: ${itemData.nombre} - S/${itemData.precio}`)
    }
  }
}

testEspecifico()
