import { ref } from 'vue'
import { supabase } from '../supabase'
import { useAuth } from './useAuth'

export function useBotiquinDB() {
  const { user } = useAuth()
  const loading = ref(false)
  const error = ref(null)

  // Items disponibles por tipo de botiquín
  const itemsDisponibles = ref({
    escolar: [],
    hogar: [],
    industria: [],
    montania: [],
    oficina: [],
  })

  // Inventario actual del usuario
  const inventarioActual = ref([])
  const historialInventarios = ref([])

  // Función auxiliar para obtener el ID del usuario interno
  const obtenerIdUsuarioInterno = async () => {
    if (!user.value) {
      throw new Error('Usuario no autenticado')
    }

    console.log('Buscando usuario interno para:', user.value.email)

    const { data: usuarioExistente, error: buscarError } = await supabase
      .from('usuarios')
      .select('id_usuario')
      .eq('correo', user.value.email)
      .single()

    if (buscarError && buscarError.code !== 'PGRST116') {
      console.error('Error buscando usuario:', buscarError)
      throw buscarError
    }

    if (usuarioExistente) {
      console.log('Usuario encontrado:', usuarioExistente)
      return usuarioExistente.id_usuario
    } else {
      console.log('Creando nuevo usuario en tabla personalizada')
      // Crear usuario en tabla personalizada
      const { data: nuevoUsuario, error: crearError } = await supabase
        .from('usuarios')
        .insert({
          nombre: user.value.user_metadata?.full_name || user.value.email.split('@')[0],
          correo: user.value.email,
          contrasena: 'auth_supabase', // Placeholder ya que usa Supabase Auth
        })
        .select('id_usuario')
        .single()

      if (crearError) {
        console.error('Error creando usuario:', crearError)
        throw crearError
      }

      console.log('Nuevo usuario creado:', nuevoUsuario)
      return nuevoUsuario.id_usuario
    }
  }

  // Cargar items disponibles según el tipo
  const cargarItemsDisponibles = async (tipo) => {
    try {
      loading.value = true
      error.value = null

      console.log(`🔄 Cargando items para tipo: ${tipo}`)
      console.log(`📋 Estado inicial de itemsDisponibles.${tipo}:`, itemsDisponibles.value[tipo])

      const { data, error: fetchError } = await supabase
        .from(`${tipo}_items`)
        .select('*')
        .order('nombre')

      if (fetchError) {
        console.error(`❌ Error en consulta para ${tipo}:`, fetchError)

        // Si hay error de tabla no encontrada, intentar poblar datos
        if (fetchError.code === 'PGRST106' || fetchError.message.includes('does not exist')) {
          console.log(`⚠️ Tabla ${tipo}_items no existe o está vacía, poblando datos...`)
          await poblarDatosEjemplo()

          // Intentar cargar de nuevo
          const { data: retryData, error: retryError } = await supabase
            .from(`${tipo}_items`)
            .select('*')
            .order('nombre')

          if (retryError) {
            throw retryError
          }

          itemsDisponibles.value[tipo] = retryData || []
          console.log(
            `📊 Estado final de itemsDisponibles.${tipo} (retry):`,
            itemsDisponibles.value[tipo],
          )
          return retryData
        }

        throw fetchError
      }

      console.log(`✅ Datos recibidos para ${tipo}:`, data)

      // Si no hay datos, poblar con ejemplos
      if (!data || data.length === 0) {
        console.log(`⚠️ No hay datos en ${tipo}_items, poblando...`)
        await poblarDatosEjemplo()

        // Cargar de nuevo después de poblar
        const { data: newData } = await supabase.from(`${tipo}_items`).select('*').order('nombre')

        itemsDisponibles.value[tipo] = newData || []
        console.log(
          `📊 Estado final de itemsDisponibles.${tipo} (después de poblar):`,
          itemsDisponibles.value[tipo],
        )
        return newData
      }

      itemsDisponibles.value[tipo] = data || []
      console.log(`📊 Estado final de itemsDisponibles.${tipo}:`, itemsDisponibles.value[tipo])

      return data
    } catch (err) {
      error.value = err.message
      console.error(`💥 Error cargando items de ${tipo}:`, err)
      return []
    } finally {
      loading.value = false
    }
  }

  // Función para poblar tablas con datos de ejemplo
  const poblarDatosEjemplo = async () => {
    console.log('🌱 Poblando datos de ejemplo...')

    const itemsEjemplo = {
      hogar: [
        'Termómetro digital',
        'Gasas estériles grandes',
        'Vendas elásticas variadas',
        'Alcohol isopropílico 70%',
        'Algodón hidrófilo',
        'Curitas variadas',
        'Tijeras médicas',
        'Pinzas de precisión',
        'Guantes de nitrilo',
        'Desinfectante',
        'Ibuprofeno 400mg',
        'Paracetamol 500mg',
        'Antihistamínico (loratadina)',
        'Pomada antibiótica',
        'Suero fisiológico',
      ],
      escolar: [
        'Termómetro digital',
        'Gasas estériles',
        'Vendas elásticas',
        'Alcohol isopropílico',
        'Algodón',
        'Curitas',
        'Tijeras pequeñas',
        'Pinzas',
        'Guantes desechables',
        'Desinfectante en spray',
        'Analgésicos (ibuprofeno)',
        'Antihistamínicos',
        'Crema antibiótica',
        'Suero fisiológico',
        'Bolsa de hielo instantáneo',
      ],
      oficina: [
        'Termómetro infrarrojo',
        'Gasas estériles',
        'Vendas adhesivas',
        'Alcohol en gel',
        'Algodón',
        'Curitas profesionales',
        'Tijeras de oficina',
        'Pinzas metálicas',
        'Guantes desechables',
        'Desinfectante de manos',
        'Analgésicos básicos',
        'Antiácidos',
        'Pomada para quemaduras',
        'Gotas para ojos',
        'Spray desinfectante',
      ],
      industria: [
        'Termómetro industrial',
        'Gasas estériles de gran tamaño',
        'Vendas compresivas',
        'Alcohol industrial',
        'Algodón industrial',
        'Parches hemostáticos',
        'Tijeras trauma',
        'Pinzas quirúrgicas',
        'Guantes de alta resistencia',
        'Desinfectante industrial',
        'Analgésicos potentes',
        'Antiespasmódicos',
        'Crema para quemaduras químicas',
        'Suero fisiológico en ampolla',
        'Manta ignífuga',
      ],
      montania: [
        'Termómetro resistente',
        'Gasas impermeables',
        'Vendas cohesivas',
        'Alcohol en sachets',
        'Algodón compacto',
        'Parches de emergencia',
        'Tijeras multiuso',
        'Pinzas multiherramienta',
        'Guantes térmicos',
        'Toallitas desinfectantes',
        'Analgésicos de altura',
        'Medicamento para mal de altura',
        'Crema solar factor 50+',
        'Suero en polvo',
        'Manta térmica reflectante',
      ],
    }

    for (const [tipo, items] of Object.entries(itemsEjemplo)) {
      try {
        console.log(`📝 Poblando ${tipo}_items...`)

        // Verificar si ya hay datos
        const { data: existingData } = await supabase
          .from(`${tipo}_items`)
          .select('id_item')
          .limit(1)

        if (existingData && existingData.length > 0) {
          console.log(`✅ ${tipo}_items ya tiene datos, saltando...`)
          continue
        }

        // Insertar datos
        const itemsParaInsertar = items.map((nombre) => ({ nombre }))
        const { error } = await supabase.from(`${tipo}_items`).insert(itemsParaInsertar)

        if (error) {
          console.error(`❌ Error poblando ${tipo}_items:`, error)
        } else {
          console.log(`✅ ${tipo}_items poblado con ${items.length} items`)
        }
      } catch (error) {
        console.error(`💥 Error procesando ${tipo}:`, error)
      }
    }
  }

  // Registrar nuevo inventario
  const registrarInventario = async (tipo, items) => {
    console.log('=== INICIO REGISTRO INVENTARIO ===')
    console.log('Estado de autenticación:', {
      user: user.value,
      userEmail: user.value?.email,
      userExists: !!user.value,
    })

    // Intentar obtener la sesión actual si no hay usuario
    if (!user.value) {
      console.log('Usuario no encontrado, obteniendo sesión actual...')
      try {
        const { getCurrentSession } = useAuth()
        const session = await getCurrentSession()
        console.log('Sesión obtenida:', {
          hasSession: !!session,
          hasUser: !!session?.user,
          userEmail: session?.user?.email,
        })

        // Verificar si ahora tenemos usuario
        console.log('Usuario después de obtener sesión:', user.value)

        if (!user.value && session?.user) {
          // Forzar actualización del usuario directamente
          user.value = session.user
          console.log('Usuario actualizado directamente:', user.value.email)
        }
      } catch (sessionError) {
        console.error('Error obteniendo sesión:', sessionError)
      }
    }

    if (!user.value) {
      console.error('❌ Usuario no autenticado después de intentar restaurar sesión')
      throw new Error('Usuario no autenticado. Por favor, cierra sesión y vuelve a iniciar sesión.')
    }

    console.log('✅ Usuario autenticado:', user.value.email)

    try {
      loading.value = true
      error.value = null

      console.log('📝 Iniciando registro de inventario:', {
        tipo,
        items,
        usuario: user.value.email,
      })

      // Obtener ID del usuario interno
      console.log('🔍 Obteniendo ID usuario interno...')
      const id_usuario_interno = await obtenerIdUsuarioInterno()
      console.log('✅ ID usuario interno obtenido:', id_usuario_interno)

      // Crear registro principal
      console.log('📊 Creando registro principal...')
      const registroData = {
        id_usuario: id_usuario_interno,
      }
      console.log('📤 Datos a insertar en registro_inventario:', registroData)

      const { data: registro, error: registroError } = await supabase
        .from('registro_inventario')
        .insert(registroData)
        .select()
        .single()

      if (registroError) {
        console.error('❌ Error al crear registro principal:', registroError)
        throw registroError
      }

      console.log('✅ Registro principal creado:', registro)

      // Crear detalles del inventario
      console.log('📋 Preparando detalles del inventario...')
      const detalles = items.map((item) => ({
        id_registro: registro.id_registro,
        tipo_kit: tipo,
        id_item: item.id_item,
        cantidad: item.cantidad,
      }))

      console.log('📤 Detalles a insertar en detalle_inventario:', detalles)

      const { data: detallesInsertados, error: detallesError } = await supabase
        .from('detalle_inventario')
        .insert(detalles)
        .select()

      if (detallesError) {
        console.error('❌ Error al insertar detalles:', detallesError)
        throw detallesError
      }

      console.log('✅ Detalles insertados:', detallesInsertados)
      console.log('🎉 Registro completado exitosamente')

      await cargarHistorialInventarios()
      return registro
    } catch (err) {
      error.value = err.message
      console.error('Error registrando inventario:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Actualizar inventario existente
  const actualizarInventario = async (idRegistro, items) => {
    try {
      loading.value = true
      error.value = null

      // Eliminar detalles existentes
      const { error: deleteError } = await supabase
        .from('detalle_inventario')
        .delete()
        .eq('id_registro', idRegistro)

      if (deleteError) throw deleteError

      // Insertar nuevos detalles
      if (items.length > 0) {
        const detalles = items.map((item) => ({
          id_registro: idRegistro,
          tipo_kit: item.tipo_kit,
          id_item: item.id_item,
          cantidad: item.cantidad,
        }))

        const { error: insertError } = await supabase.from('detalle_inventario').insert(detalles)

        if (insertError) throw insertError
      }

      await cargarHistorialInventarios()
    } catch (err) {
      error.value = err.message
      console.error('Error actualizando inventario:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Cargar historial de inventarios del usuario
  const cargarHistorialInventarios = async () => {
    if (!user.value) return []

    try {
      loading.value = true
      error.value = null

      // Obtener ID del usuario interno
      const id_usuario_interno = await obtenerIdUsuarioInterno()

      const { data, error: fetchError } = await supabase
        .from('registro_inventario')
        .select(
          `
          *,
          detalle_inventario (
            *
          )
        `,
        )
        .eq('id_usuario', id_usuario_interno)
        .order('fecha_registro', { ascending: false })

      if (fetchError) throw fetchError

      // Procesar datos para incluir nombres de items
      const historialProcesado = []

      for (const registro of data || []) {
        const detallesConNombres = []

        for (const detalle of registro.detalle_inventario) {
          // Obtener nombre del item según el tipo
          const { data: itemData } = await supabase
            .from(`${detalle.tipo_kit}_items`)
            .select('nombre')
            .eq('id_item', detalle.id_item)
            .single()

          detallesConNombres.push({
            ...detalle,
            nombre_item: itemData?.nombre || 'Item desconocido',
          })
        }

        historialProcesado.push({
          ...registro,
          detalle_inventario: detallesConNombres,
        })
      }

      historialInventarios.value = historialProcesado
      return historialProcesado
    } catch (err) {
      error.value = err.message
      console.error('Error cargando historial:', err)
      return []
    } finally {
      loading.value = false
    }
  }

  // Eliminar inventario
  const eliminarInventario = async (idRegistro) => {
    try {
      loading.value = true
      error.value = null

      const { error: deleteError } = await supabase
        .from('registro_inventario')
        .delete()
        .eq('id_registro', idRegistro)

      if (deleteError) throw deleteError

      await cargarHistorialInventarios()
    } catch (err) {
      error.value = err.message
      console.error('Error eliminando inventario:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Obtener inventario específico
  const obtenerInventario = async (idRegistro) => {
    try {
      const { data, error: fetchError } = await supabase
        .from('registro_inventario')
        .select(
          `
          *,
          detalle_inventario (
            *
          )
        `,
        )
        .eq('id_registro', idRegistro)
        .single()

      if (fetchError) throw fetchError

      return data
    } catch (err) {
      error.value = err.message
      console.error('Error obteniendo inventario:', err)
      throw err
    }
  }

  // Obtener inventario actual del usuario por tipo
  const obtenerInventarioActual = async (tipo) => {
    if (!user.value) return null

    try {
      loading.value = true
      error.value = null

      // Obtener ID del usuario interno
      const id_usuario_interno = await obtenerIdUsuarioInterno()

      const { data, error: fetchError } = await supabase
        .from('registro_inventario')
        .select(
          `
          *,
          detalle_inventario!inner (
            *
          )
        `,
        )
        .eq('id_usuario', id_usuario_interno)
        .eq('detalle_inventario.tipo_kit', tipo)
        .order('fecha_registro', { ascending: false })
        .limit(1)
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') throw fetchError

      if (data) {
        // Procesar datos para incluir nombres de items
        const detallesConNombres = []

        for (const detalle of data.detalle_inventario) {
          // Obtener nombre del item según el tipo
          const { data: itemData } = await supabase
            .from(`${detalle.tipo_kit}_items`)
            .select('nombre')
            .eq('id_item', detalle.id_item)
            .single()

          detallesConNombres.push({
            ...detalle,
            nombre_item: itemData?.nombre || 'Item desconocido',
          })
        }

        return {
          ...data,
          detalle_inventario: detallesConNombres,
        }
      }

      return null
    } catch (err) {
      error.value = err.message
      console.error('Error obteniendo inventario actual:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  // Crear orden de compra
  const crearOrdenCompra = async (items) => {
    if (!user.value) {
      throw new Error('Usuario no autenticado')
    }

    try {
      loading.value = true
      error.value = null

      // Obtener ID del usuario interno
      const id_usuario_interno = await obtenerIdUsuarioInterno()

      // Crear registro de compra
      const { data: compra, error: compraError } = await supabase
        .from('compras')
        .insert({
          id_usuario: id_usuario_interno,
        })
        .select()
        .single()

      if (compraError) throw compraError

      // Crear detalles de la compra
      const detalles = items.map((item) => ({
        id_compra: compra.id_compra,
        tipo_kit: item.tipo_kit,
        id_item: item.id_item,
        cantidad: item.cantidad,
      }))

      const { error: detallesError } = await supabase.from('detalle_compras').insert(detalles)

      if (detallesError) throw detallesError

      return compra
    } catch (err) {
      error.value = err.message
      console.error('Error creando orden de compra:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    itemsDisponibles,
    inventarioActual,
    historialInventarios,
    cargarItemsDisponibles,
    registrarInventario,
    actualizarInventario,
    cargarHistorialInventarios,
    eliminarInventario,
    obtenerInventario,
    obtenerInventarioActual,
    crearOrdenCompra,
  }
}
