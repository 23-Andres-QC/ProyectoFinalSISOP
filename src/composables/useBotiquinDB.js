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
    montaña: [], // Agregado para compatibilidad
    oficina: [],
  })

  // Inventario actual del usuario
  const inventarioActual = ref([])
  const historialInventarios = ref([])

  // Función auxiliar para verificar/obtener usuario autenticado
  const verificarAutenticacion = async () => {
    if (user.value) {
      return user.value
    }

    console.log('🔄 Verificando autenticación...')
    try {
      const { getCurrentSession } = useAuth()
      const session = await getCurrentSession()

      if (session?.user) {
        user.value = session.user
        console.log('✅ Usuario autenticado encontrado:', session.user.email)
        return session.user
      } else {
        console.log('❌ No hay sesión activa')
        return null
      }
    } catch (error) {
      console.error('❌ Error verificando autenticación:', error)
      return null
    }
  }

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

      // Verificar autenticación antes de cargar items
      const currentUser = await verificarAutenticacion()
      if (!currentUser) {
        console.log('⚠️ Usuario no autenticado, pero continuando con carga de items...')
        // Continuamos con la carga de items aunque no esté autenticado
        // ya que los items son públicos
      } else {
        console.log(`✅ Usuario autenticado: ${currentUser.email}`)
      }

      console.log(`📋 Estado inicial de itemsDisponibles.${tipo}:`, itemsDisponibles.value[tipo])

      // Mapear montaña a montania para el nombre de la tabla
      const tableName = tipo === 'montaña' ? 'montania' : tipo

      const { data, error: fetchError } = await supabase
        .from(`${tableName}_items`)
        .select('*')
        .order('nombre')

      if (fetchError) {
        console.error(`❌ Error en consulta para ${tipo}:`, fetchError)

        // Si hay error de tabla no encontrada, intentar poblar datos
        if (fetchError.code === 'PGRST106' || fetchError.message.includes('does not exist')) {
          console.log(`⚠️ Tabla ${tableName}_items no existe o está vacía, poblando datos...`)
          await poblarDatosEjemplo()

          // Intentar cargar de nuevo
          const { data: retryData, error: retryError } = await supabase
            .from(`${tableName}_items`)
            .select('*')
            .order('nombre')

          if (retryError) {
            throw retryError
          }

          itemsDisponibles.value[tipo] = retryData || []

          // Si es montaña, también poblar montania para compatibilidad
          if (tipo === 'montaña') {
            itemsDisponibles.value.montania = retryData || []
          } else if (tipo === 'montania') {
            itemsDisponibles.value.montaña = retryData || []
          }

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

        // Si es montaña, también poblar montania para compatibilidad
        if (tipo === 'montaña') {
          itemsDisponibles.value.montania = newData || []
        } else if (tipo === 'montania') {
          itemsDisponibles.value.montaña = newData || []
        }

        console.log(
          `📊 Estado final de itemsDisponibles.${tipo} (después de poblar):`,
          itemsDisponibles.value[tipo],
        )
        return newData
      }

      itemsDisponibles.value[tipo] = data || []

      // Si es montaña, también poblar montania para compatibilidad
      if (tipo === 'montaña') {
        itemsDisponibles.value.montania = data || []
      } else if (tipo === 'montania') {
        itemsDisponibles.value.montaña = data || []
      }

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

  // Función para poblar tablas con datos de ejemplo (solo si están vacías)
  const poblarDatosEjemplo = async () => {
    console.log('🌱 Verificando si necesita poblar datos de ejemplo...')

    // Como la BD ya tiene datos insertados, solo verificamos que existan
    // No insertamos datos de ejemplo para evitar duplicados
    const tipos = ['hogar', 'escolar', 'oficina', 'industria', 'montania']

    for (const tipo of tipos) {
      try {
        const { data: existingData } = await supabase
          .from(`${tipo}_items`)
          .select('id_item')
          .limit(1)

        if (existingData && existingData.length > 0) {
          console.log(`✅ ${tipo}_items ya tiene datos, saltando...`)
        } else {
          console.log(`⚠️ ${tipo}_items está vacía - la BD debería tener datos predefinidos`)
        }
      } catch (error) {
        console.error(`💥 Error verificando ${tipo}:`, error)
      }
    }
  }

  // Registrar nuevo inventario
  const registrarInventario = async (tipo, items) => {
    console.log('=== INICIO REGISTRO INVENTARIO ===')

    // Verificar autenticación de manera más robusta
    let currentUser = user.value

    if (!currentUser) {
      console.log('👤 Usuario no encontrado en estado local, obteniendo sesión actual...')
      try {
        const { getCurrentSession } = useAuth()
        const session = await getCurrentSession()
        console.log('📊 Sesión obtenida:', {
          hasSession: !!session,
          hasUser: !!session?.user,
          userEmail: session?.user?.email,
        })

        if (session?.user) {
          currentUser = session.user
          // Actualizar el estado local del usuario
          user.value = session.user
          console.log('✅ Usuario actualizado desde sesión:', currentUser.email)
        }
      } catch (sessionError) {
        console.error('❌ Error obteniendo sesión:', sessionError)
      }
    }

    // Si aún no hay usuario después de intentar obtener la sesión
    if (!currentUser) {
      console.error('❌ No se pudo obtener información del usuario autenticado')
      const errorMsg =
        'Debes estar autenticado para registrar un botiquín. Por favor, inicia sesión primero.'
      error.value = errorMsg
      throw new Error(errorMsg)
    }

    console.log('✅ Usuario autenticado confirmado:', currentUser.email)

    try {
      loading.value = true
      error.value = null

      console.log('📝 Iniciando registro de inventario:', {
        tipo,
        items,
        usuario: currentUser.email,
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
    const currentUser = await verificarAutenticacion()
    if (!currentUser) {
      console.log('❌ No hay usuario autenticado para cargar historial')
      return []
    }

    try {
      loading.value = true
      error.value = null

      console.log('=== CARGANDO HISTORIAL DE INVENTARIOS ===')

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

      console.log('📥 Datos RAW recibidos de la BD:', data)

      // Procesar datos para incluir nombres de items
      const historialProcesado = []

      for (const registro of data || []) {
        const detallesConNombres = []

        for (const detalle of registro.detalle_inventario) {
          // Mapear nombre de tabla para montaña/montania
          const tableName = detalle.tipo_kit === 'montaña' ? 'montania' : detalle.tipo_kit

          // Obtener nombre del item según el tipo
          const { data: itemData } = await supabase
            .from(`${tableName}_items`)
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

      console.log('📋 Historial procesado (antes de filtrar duplicados):', historialProcesado)

      // Filtrar duplicados - mantener solo botiquines únicos válidos
      const botiquinesUnicos = new Map()
      const historialFiltrado = []

      for (const registro of historialProcesado) {
        // Crear clave única basada en el contenido del botiquín (tipo_kit + items + cantidades)
        const detallesKey = registro.detalle_inventario
          .map((d) => `${d.tipo_kit}_${d.id_item}_${d.cantidad}`)
          .sort()
          .join('|')

        const fechaRegistro = new Date(registro.fecha_registro).getTime()

        // Si ya existe este botiquín, comparar fechas para mantener el más reciente
        if (botiquinesUnicos.has(detallesKey)) {
          const existente = botiquinesUnicos.get(detallesKey)
          const fechaExistente = new Date(existente.fecha_registro).getTime()

          // Si el registro actual es más reciente, reemplazar
          if (fechaRegistro > fechaExistente) {
            console.log(`🔄 Reemplazando duplicado más antiguo:`, {
              anterior: existente.id_registro,
              nuevo: registro.id_registro,
              fechaAnterior: existente.fecha_registro,
              fechaNueva: registro.fecha_registro,
            })
            botiquinesUnicos.set(detallesKey, registro)
          } else {
            console.log(`❌ Descartando duplicado más antiguo:`, {
              descartado: registro.id_registro,
              mantenido: existente.id_registro,
              fechaDescartada: registro.fecha_registro,
              fechaMantenida: existente.fecha_registro,
            })
          }
        } else {
          // Validar que el botiquín sea válido (tenga al menos un item)
          if (registro.detalle_inventario && registro.detalle_inventario.length > 0) {
            console.log(`✅ Botiquín válido agregado:`, {
              id: registro.id_registro,
              fecha: registro.fecha_registro,
              items: registro.detalle_inventario.length,
            })
            botiquinesUnicos.set(detallesKey, registro)
          } else {
            console.log(`❌ Descartando botiquín inválido (sin items):`, {
              id: registro.id_registro,
              fecha: registro.fecha_registro,
            })
          }
        }
      }

      // Convertir Map a array y ordenar por fecha descendente
      historialFiltrado.push(...Array.from(botiquinesUnicos.values()))
      historialFiltrado.sort((a, b) => new Date(b.fecha_registro) - new Date(a.fecha_registro))

      console.log('🔍 RESUMEN DE FILTRADO:')
      console.log(`📊 Total registros originales: ${historialProcesado.length}`)
      console.log(`✅ Botiquines únicos válidos: ${historialFiltrado.length}`)
      console.log(
        `❌ Duplicados/inválidos eliminados: ${historialProcesado.length - historialFiltrado.length}`,
      )
      console.log('📋 Historial FILTRADO final:', historialFiltrado)

      historialInventarios.value = historialFiltrado
      return historialFiltrado
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
    const currentUser = await verificarAutenticacion()
    if (!currentUser) {
      console.log('❌ No hay usuario autenticado para obtener inventario actual')
      return null
    }

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
          // Mapear nombre de tabla para montaña/montania
          const tableName = detalle.tipo_kit === 'montaña' ? 'montania' : detalle.tipo_kit

          // Obtener nombre del item según el tipo
          const { data: itemData } = await supabase
            .from(`${tableName}_items`)
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
  const crearOrdenCompra = async (items, tipoKit) => {
    // Verificar autenticación de manera más robusta
    let currentUser = user.value

    if (!currentUser) {
      console.log('👤 Usuario no encontrado para orden de compra, obteniendo sesión...')
      try {
        const { getCurrentSession } = useAuth()
        const session = await getCurrentSession()

        if (session?.user) {
          currentUser = session.user
          user.value = session.user
          console.log('✅ Usuario actualizado para orden de compra:', currentUser.email)
        }
      } catch (sessionError) {
        console.error('❌ Error obteniendo sesión para orden de compra:', sessionError)
      }
    }

    if (!currentUser) {
      const errorMsg = 'Debes estar autenticado para crear una orden de compra.'
      error.value = errorMsg
      throw new Error(errorMsg)
    }

    try {
      loading.value = true
      error.value = null

      console.log('📦 Creando orden de compra:', { items, tipoKit, usuario: currentUser.email })

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

      console.log('✅ Registro de compra creado:', compra)

      // Crear detalles de la compra - asegurar que tipo_kit esté incluido
      const detalles = items.map((item) => ({
        id_compra: compra.id_compra,
        tipo_kit: tipoKit, // Usar el tipo pasado como parámetro
        id_item: item.id_item,
        cantidad: item.cantidad,
      }))

      console.log('📋 Detalles de compra a insertar:', detalles)

      const { error: detallesError } = await supabase.from('detalle_compras').insert(detalles)

      if (detallesError) {
        console.error('❌ Error insertando detalles de compra:', detallesError)
        throw detallesError
      }

      console.log('✅ Orden de compra creada exitosamente')
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
    verificarAutenticacion,
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
