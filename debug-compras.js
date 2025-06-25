// Debug script para verificar las compras en la base de datos
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://vcttfgjgvfqbfatehugp.supabase.co'
const supabaseKey =
  process.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZjdHRmZ2pndmZxYmZhdGVodWdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM3Nzg0ODUsImV4cCI6MjA0OTM1NDQ4NX0.QUOSo8p8WG_OLdgf02L4lN6dGjg7a-lQsJRJNpKDqas'

const supabase = createClient(supabaseUrl, supabaseKey)

async function debugCompras() {
  console.log('🔍 Verificando datos de compras en la base de datos...')

  try {
    // 1. Verificar tabla compras
    console.log('\n📋 1. Datos en tabla compras:')
    const { data: compras, error: comprasError } = await supabase
      .from('compras')
      .select('*')
      .limit(5)

    if (comprasError) {
      console.error('❌ Error en compras:', comprasError)
    } else {
      console.log('✅ Compras encontradas:', compras.length)
      compras.forEach((compra) => {
        console.log(
          `  - ID: ${compra.id_compra}, Usuario: ${compra.id_usuario}, Fecha: ${compra.fecha_compra}, Total: ${compra.precio_total}`,
        )
      })
    }

    // 2. Verificar tabla detalle_compras
    console.log('\n📦 2. Datos en tabla detalle_compras:')
    const { data: detalles, error: detallesError } = await supabase
      .from('detalle_compras')
      .select('*')
      .limit(10)

    if (detallesError) {
      console.error('❌ Error en detalle_compras:', detallesError)
    } else {
      console.log('✅ Detalles encontrados:', detalles.length)
      detalles.forEach((detalle) => {
        console.log(
          `  - ID: ${detalle.id_detalle}, Compra: ${detalle.id_compra}, Tipo: ${detalle.tipo_kit}, Item: ${detalle.id_item}, Cantidad: ${detalle.cantidad}`,
        )
      })
    }

    // 3. Verificar join entre compras y detalle_compras
    console.log('\n🔗 3. Join compras + detalle_compras:')
    const { data: comprasConDetalle, error: joinError } = await supabase
      .from('compras')
      .select(
        `
        id_compra,
        fecha_compra,
        precio_total,
        id_usuario,
        detalle_compras(
          id_detalle,
          tipo_kit,
          id_item,
          cantidad
        )
      `,
      )
      .limit(10)

    if (joinError) {
      console.error('❌ Error en join:', joinError)
    } else {
      console.log('✅ Join exitoso:', comprasConDetalle.length)
      comprasConDetalle.forEach((compra) => {
        console.log(
          `  - Compra ${compra.id_compra} (Usuario: ${compra.id_usuario}):`,
          compra.detalle_compras,
        )
        if (compra.detalle_compras && compra.detalle_compras.length > 0) {
          console.log(`    - Primer tipo_kit: ${compra.detalle_compras[0].tipo_kit}`)
        }
      })
    }

    // 3.5. Verificar un JOIN específico para el usuario 3 (que parece ser el que tiene más datos)
    console.log('\n👤 3.5. Join específico para usuario 3:')
    const { data: comprasUsuario3, error: usuario3Error } = await supabase
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
      .eq('id_usuario', 3)
      .order('fecha_compra', { ascending: false })

    if (usuario3Error) {
      console.error('❌ Error en compras usuario 3:', usuario3Error)
    } else {
      console.log('✅ Compras usuario 3:', comprasUsuario3.length)
      comprasUsuario3.forEach((compra) => {
        console.log(
          `  - Compra ${compra.id_compra}: ${compra.detalle_compras?.length || 0} detalles`,
        )
        compra.detalle_compras?.forEach((detalle) => {
          console.log(
            `    * Tipo: ${detalle.tipo_kit}, Item: ${detalle.id_item}, Cantidad: ${detalle.cantidad}`,
          )
        })
      })
    }

    // 5. Verificar casos problemáticos específicos
    console.log('\n🚨 5. Verificando casos problemáticos:')

    // Caso: Compra 6 - tipo escolar, item 8
    console.log('\n📋 Caso problemático: Compra 6')
    const { data: item8Escolar, error: item8EscolarError } = await supabase
      .from('escolar_items')
      .select('id_item, nombre, precio')
      .eq('id_item', 8)
      .single()

    if (item8EscolarError) {
      console.error('❌ Item 8 NO existe en escolar_items:', item8EscolarError.message)
    } else {
      console.log('✅ Item 8 encontrado en escolar_items:', item8Escolar)
    }

    // Verificar si item 8 existe en otras tablas
    const tablas = ['hogar_items', 'oficina_items', 'industria_items', 'montania_items']
    for (const tabla of tablas) {
      const { data: item8, error: item8Error } = await supabase
        .from(tabla)
        .select('id_item, nombre, precio')
        .eq('id_item', 8)
        .single()

      if (item8Error) {
        console.log(`❌ Item 8 NO existe en ${tabla}`)
      } else {
        console.log(`✅ Item 8 SÍ existe en ${tabla}:`, item8)
      }
    }
    // 4. Verificar tablas de items
    const tipos = ['escolar', 'hogar', 'oficina', 'industria', 'montania']
    console.log('\n🏷️ 4. Verificando tablas de items:')

    for (const tipo of tipos) {
      const { data: items, error: itemsError } = await supabase
        .from(`${tipo}_items`)
        .select('id_item, nombre, precio')
        .limit(3)

      if (itemsError) {
        console.error(`❌ Error en ${tipo}_items:`, itemsError)
      } else {
        console.log(`✅ ${tipo}_items: ${items.length} items`)
        items.forEach((item) => {
          console.log(`    - ID: ${item.id_item}, Nombre: ${item.nombre}, Precio: ${item.precio}`)
        })
      }
    }
  } catch (error) {
    console.error('💥 Error general:', error)
  }
}

debugCompras()
