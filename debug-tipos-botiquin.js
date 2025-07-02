// Debug script para verificar tipos de botiquin
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://jrntyzskkgfxoukxtepv.supabase.co'
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpybnR5enNra2dmeG91a3h0ZXB2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU1OTEzNzMsImV4cCI6MjA1MTE2NzM3M30.TjFMlvZ2kRo2Q7sQfBhR-2qLqTMfqwYROAKSZQvqFu4'

const supabase = createClient(supabaseUrl, supabaseKey)

async function debugTiposBotiquin() {
  console.log('=== DEBUG TIPOS DE BOTIQUIN ===')

  try {
    // 1. Verificar estructura de la tabla productos
    console.log('\n1. Verificando productos únicos por tipo:')
    const { data: productos, error: prodError } = await supabase
      .from('productos')
      .select('id_producto, nombre, tipo_botiquin')
      .order('tipo_botiquin')

    if (prodError) {
      console.error('Error obteniendo productos:', prodError)
      return
    }

    console.log('Productos por tipo:')
    const tiposProductos = {}
    productos.forEach((p) => {
      if (!tiposProductos[p.tipo_botiquin]) {
        tiposProductos[p.tipo_botiquin] = []
      }
      tiposProductos[p.tipo_botiquin].push(p.nombre)
    })

    Object.keys(tiposProductos).forEach((tipo) => {
      console.log(`  ${tipo}: ${tiposProductos[tipo].length} productos`)
    })

    // 2. Verificar inventarios de usuarios
    console.log('\n2. Verificando inventarios por usuario:')
    const { data: inventarios, error: invError } = await supabase
      .from('inventario_botiquin')
      .select(
        `
        id_inventario,
        id_usuario,
        fecha_creacion,
        detalle_inventario_botiquin (
          id_producto,
          productos (
            nombre,
            tipo_botiquin
          )
        )
      `,
      )
      .order('fecha_creacion', { ascending: false })

    if (invError) {
      console.error('Error obteniendo inventarios:', invError)
      return
    }

    console.log(`Total de inventarios: ${inventarios.length}`)

    // Agrupar por usuario
    const inventariosPorUsuario = {}
    inventarios.forEach((inv) => {
      if (!inventariosPorUsuario[inv.id_usuario]) {
        inventariosPorUsuario[inv.id_usuario] = []
      }

      // Extraer tipos de este inventario
      const tiposEnInventario = new Set()
      inv.detalle_inventario_botiquin.forEach((detalle) => {
        if (detalle.productos?.tipo_botiquin) {
          tiposEnInventario.add(detalle.productos.tipo_botiquin)
        }
      })

      inventariosPorUsuario[inv.id_usuario].push({
        id_inventario: inv.id_inventario,
        fecha: inv.fecha_creacion,
        tipos: Array.from(tiposEnInventario),
        productos: inv.detalle_inventario_botiquin.length,
      })
    })

    // Mostrar resumen por usuario
    Object.keys(inventariosPorUsuario).forEach((userId) => {
      const inventarios = inventariosPorUsuario[userId]
      console.log(`\nUsuario ${userId}:`)

      // Tipos únicos del usuario
      const todosLosTipos = new Set()
      inventarios.forEach((inv) => {
        inv.tipos.forEach((tipo) => todosLosTipos.add(tipo))
      })

      console.log(
        `  Tipos únicos: ${Array.from(todosLosTipos).join(', ')} (${todosLosTipos.size} tipos)`,
      )
      console.log(`  Total inventarios: ${inventarios.length}`)

      // Verificar duplicados por tipo
      const tiposPorInventario = {}
      inventarios.forEach((inv) => {
        inv.tipos.forEach((tipo) => {
          if (!tiposPorInventario[tipo]) {
            tiposPorInventario[tipo] = []
          }
          tiposPorInventario[tipo].push(inv.id_inventario)
        })
      })

      // Mostrar si hay duplicados
      Object.keys(tiposPorInventario).forEach((tipo) => {
        const inventarioIds = tiposPorInventario[tipo]
        if (inventarioIds.length > 1) {
          console.log(
            `    ⚠️  DUPLICADO - Tipo "${tipo}" en inventarios: ${inventarioIds.join(', ')}`,
          )
        }
      })
    })

    // 3. Verificar usuarios específicos
    console.log('\n3. Verificando usuarios de la tabla usuarios:')
    const { data: usuarios, error: userError } = await supabase
      .from('usuarios')
      .select('id_usuario, correo_electronico, tipo_usuario')

    if (userError) {
      console.error('Error obteniendo usuarios:', userError)
      return
    }

    console.log(`Total usuarios registrados: ${usuarios.length}`)
    usuarios.forEach((user) => {
      const inventariosUsuario = inventariosPorUsuario[user.id_usuario] || []
      console.log(
        `  ${user.correo_electronico} (${user.tipo_usuario}): ${inventariosUsuario.length} inventarios`,
      )
    })
  } catch (error) {
    console.error('Error general:', error)
  }
}

// Ejecutar debug
debugTiposBotiquin()
