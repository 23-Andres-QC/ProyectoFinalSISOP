import { createClient } from '@supabase/supabase-js'

// Hardcode the Supabase credentials for testing
const supabaseUrl = 'https://kqmjzlgdidacrftqfqxd.supabase.co'
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtxbWp6bGdkaWRhY3JmdHFmcXhkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ0NTc1NTEsImV4cCI6MjA1MDAzMzU1MX0.0tLwQNc9mQ8iCXwvwNEYSwOUu_z7FnHF77_n5Pr2BgI'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testComprasData() {
  console.log('🔍 Testing compras data...')

  try {
    // 1. Check all compras
    const { data: compras, error: comprasError } = await supabase
      .from('compras')
      .select('*')
      .limit(5)

    if (comprasError) {
      console.error('❌ Error fetching compras:', comprasError)
      return
    }

    console.log('📊 Compras data (first 5):')
    compras.forEach((compra, i) => {
      console.log(
        `  ${i + 1}. ID: ${compra.id_compra}, Usuario: ${compra.id_usuario}, Fecha: ${compra.fecha_compra}, Total: ${compra.precio_total}`,
      )
    })

    // 2. Check detalle_compras for each compra
    for (const compra of compras) {
      const { data: detalles, error: detallesError } = await supabase
        .from('detalle_compras')
        .select('*')
        .eq('id_compra', compra.id_compra)

      if (detallesError) {
        console.error(`❌ Error fetching detalles for compra ${compra.id_compra}:`, detallesError)
        continue
      }

      console.log(`\n📋 Detalles para compra ${compra.id_compra}:`)
      detalles.forEach((detalle, j) => {
        console.log(
          `    ${j + 1}. Tipo: "${detalle.tipo_kit}", Item ID: ${detalle.id_item}, Cantidad: ${detalle.cantidad}`,
        )
      })

      // 3. For each detalle, try to get the item name
      for (const detalle of detalles) {
        const tipoParaBD = detalle.tipo_kit === 'montaña' ? 'montania' : detalle.tipo_kit
        const tabla = `${tipoParaBD}_items`

        console.log(`    🔍 Buscando item ${detalle.id_item} en tabla "${tabla}"...`)

        const { data: item, error: itemError } = await supabase
          .from(tabla)
          .select('nombre, precio')
          .eq('id_item', detalle.id_item)
          .single()

        if (itemError) {
          console.log(`    ❌ Error: ${itemError.message}`)
        } else {
          console.log(`    ✅ Item encontrado: "${item.nombre}" - S/${item.precio || 0}`)
        }
      }
    }
  } catch (error) {
    console.error('❌ Error general:', error)
  }
}

testComprasData()
