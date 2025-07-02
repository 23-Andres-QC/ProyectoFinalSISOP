import { ref } from 'vue'
import { supabase } from '../supabase'
import { useAuth } from './useAuth'

export function useBotiquinDB() {
  const { user, getCurrentSession } = useAuth()
  const loading = ref(false)
  const error = ref(null)

  // Función auxiliar para mapear tipos de UI a BD
  const mapearTipoParaBD = (tipo) => {
    return tipo === 'montaña' ? 'montania' : tipo
  }

  // Función auxiliar para mapear tipos de BD a UI
  const mapearTipoParaUI = (tipo) => {
    console.log(`🔄 mapearTipoParaUI: "${tipo}" -> "${tipo === 'montania' ? 'montaña' : tipo}"`)
    return tipo === 'montania' ? 'montaña' : tipo
  }

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
    console.log('🔄 Verificando autenticación...')
    console.log('👤 Estado inicial del usuario:', {
      hasUser: !!user.value,
      userEmail: user.value?.email,
      userMetadata: user.value?.user_metadata,
    })

    // Si ya tenemos usuario y es válido, devolverlo
    if (user.value && user.value.email) {
      console.log('✅ Usuario ya disponible:', user.value.email)
      return user.value
    }

    try {
      // Intentar obtener la sesión actual usando la función importada
      console.log('🔍 Obteniendo sesión desde useAuth...')

      const session = await getCurrentSession()

      console.log('📊 Resultado de getCurrentSession:', {
        hasSession: !!session,
        hasUser: !!session?.user,
        userEmail: session?.user?.email,
      })

      if (session?.user) {
        console.log('✅ Usuario autenticado encontrado:', {
          email: session.user.email,
          metadata: session.user.user_metadata,
        })
        return session.user
      } else {
        console.log('❌ No hay sesión activa o usuario en la sesión')
        return null
      }
    } catch (error) {
      console.error('❌ Error verificando autenticación:', error)
      return null
    }
  }

  // Función auxiliar para obtener el ID del usuario interno
  const obtenerIdUsuarioInterno = async () => {
    console.log('🔍 Iniciando obtenerIdUsuarioInterno...')

    // Verificar autenticación primero
    const currentUser = await verificarAutenticacion()

    if (!currentUser) {
      console.error('❌ No hay usuario autenticado en obtenerIdUsuarioInterno')
      throw new Error('Usuario no autenticado')
    }

    console.log('📋 Buscando usuario interno para:', {
      email: currentUser.email,
      id: currentUser.id,
      metadata: currentUser.user_metadata,
    })

    try {
      const { data: usuarioExistente, error: buscarError } = await supabase
        .from('usuarios')
        .select('id_usuario')
        .eq('correo', currentUser.email)
        .single()

      if (buscarError && buscarError.code !== 'PGRST116') {
        console.error('❌ Error buscando usuario:', buscarError)
        throw buscarError
      }

      if (usuarioExistente) {
        console.log('✅ Usuario encontrado en BD:', usuarioExistente)
        return usuarioExistente.id_usuario
      } else {
        console.log('📝 Creando nuevo usuario en tabla personalizada...')
        // Crear usuario en tabla personalizada
        const { data: nuevoUsuario, error: crearError } = await supabase
          .from('usuarios')
          .insert({
            nombre: currentUser.user_metadata?.full_name || currentUser.email.split('@')[0],
            correo: currentUser.email,
            contrasena: 'auth_supabase', // Placeholder ya que usa Supabase Auth
          })
          .select('id_usuario')
          .single()

        if (crearError) {
          console.error('❌ Error creando usuario:', crearError)
          throw crearError
        }

        console.log('✅ Nuevo usuario creado:', nuevoUsuario)
        return nuevoUsuario.id_usuario
      }
    } catch (err) {
      console.error('💥 Error completo en obtenerIdUsuarioInterno:', err)
      throw err
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
      const tableName = mapearTipoParaBD(tipo)

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

    // Verificar autenticación usando la función centralizada
    const currentUser = await verificarAutenticacion()

    // Si aún no hay usuario después de verificar autenticación
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

      // Verificar si el usuario puede registrar este tipo de botiquín
      console.log('🔍 Verificando si puede registrar tipo de botiquín...')

      try {
        const verificacion = await Promise.race([
          puedeRegistrarTipo(tipo),
          new Promise((resolve) =>
            setTimeout(() => resolve({ puedeRegistrar: true, debug: 'timeout_validation' }), 3000),
          ),
        ])

        if (!verificacion.puedeRegistrar && !verificacion.debug) {
          const errorMsg = verificacion.yaExiste
            ? `Ya tienes registrado un botiquín de tipo "${tipo}". Solo puedes tener un botiquín de cada tipo.`
            : verificacion.maxTiposAlcanzado
              ? 'Has alcanzado el máximo de 5 tipos de botiquines diferentes. No puedes registrar más tipos.'
              : 'No puedes registrar este tipo de botiquín en este momento.'

          console.error('❌ No puede registrar tipo:', {
            tipo,
            verificacion,
            error: errorMsg,
          })

          error.value = errorMsg
          throw new Error(errorMsg)
        }

        if (verificacion.debug) {
          console.log('⚠️ Validación omitida por timeout - continuando con registro')
        } else {
          console.log('✅ Puede registrar tipo de botiquín:', verificacion)
        }
      } catch (validationError) {
        console.error('❌ Error en validación (continuando):', validationError)
        // Continuar con el registro aunque falle la validación
      }

      // Obtener ID del usuario interno
      console.log('🔍 Obteniendo ID usuario interno...')
      const id_usuario_interno = await obtenerIdUsuarioInterno()
      console.log('✅ ID usuario interno obtenido:', id_usuario_interno)

      // Crear registro principal en inventario_botiquin
      console.log('📊 Creando registro principal...')
      const registroData = {
        id_usuario: id_usuario_interno,
      }
      console.log('📤 Datos a insertar en inventario_botiquin:', registroData)

      const { data: registro, error: registroError } = await supabase
        .from('inventario_botiquin')
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

      // Mapear tipo para compatibilidad con BD (montaña -> montania)
      const tipoParaBD = mapearTipoParaBD(tipo)
      console.log('🔄 Tipo mapeado:', { tipoOriginal: tipo, tipoParaBD })

      const detalles = items.map((item) => ({
        id_inventario: registro.id_inventario,
        id_producto: item.id_item,
        cantidad: item.cantidad,
      }))

      console.log('📤 Detalles a insertar en detalle_inventario_botiquin:', detalles)

      const { data: detallesInsertados, error: detallesError } = await supabase
        .from('detalle_inventario_botiquin')
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
  const actualizarInventario = async (idInventario, items) => {
    try {
      loading.value = true
      error.value = null

      // Eliminar detalles existentes (ajustar campo a id_inventario)
      const { error: deleteError } = await supabase
        .from('detalle_inventario_botiquin')
        .delete()
        .eq('id_inventario', idInventario)

      if (deleteError) throw deleteError

      // Insertar nuevos detalles
      if (items.length > 0) {
        const detalles = items.map((item) => ({
          id_inventario: idInventario,
          id_producto: item.id_item, // id_item en frontend = id_producto en BD
          cantidad: item.cantidad,
        }))

        console.log('📋 Actualizando con detalles mapeados:', detalles)

        const { error: insertError } = await supabase
          .from('detalle_inventario_botiquin')
          .insert(detalles)

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
          const tableName = mapearTipoParaBD(detalle.tipo_kit)

          // Obtener nombre del item según el tipo
          const { data: itemData } = await supabase
            .from(`${tableName}_items`)
            .select('nombre')
            .eq('id_item', detalle.id_item)
            .single()

          detallesConNombres.push({
            ...detalle,
            // Mapear tipo de vuelta para mostrar en UI (montania -> montaña)
            tipo_kit: mapearTipoParaUI(detalle.tipo_kit),
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

  // Obtener inventario específico por ID para edición
  const obtenerInventarioPorId = async (idInventario) => {
    const currentUser = await verificarAutenticacion()
    if (!currentUser) {
      console.log('❌ No hay usuario autenticado para obtener inventario por ID')
      return null
    }

    try {
      loading.value = true
      error.value = null

      console.log('🔍 Obteniendo inventario por ID:', idInventario)

      const { data, error: fetchError } = await supabase
        .from('inventario_botiquin') // CAMBIO: era registro_inventario
        .select(
          `
          *,
          detalle_inventario_botiquin (
            *
          )
        `,
        )
        .eq('id_inventario', idInventario)
        .single()

      if (fetchError) throw fetchError

      if (data) {
        console.log('📥 Datos del inventario obtenido:', data)

        // Procesar datos para incluir nombres de items
        const detallesConNombres = []

        for (const detalle of data.detalle_inventario_botiquin) {
          // Obtener nombre del item según el tipo
          const { data: itemData } = await supabase
            .from('productos')
            .select('nombre')
            .eq('id_producto', detalle.id_producto)
            .single()

          detallesConNombres.push({
            ...detalle,
            nombre_item: itemData?.nombre || 'Item desconocido',
          })
        }

        const inventarioCompleto = {
          ...data,
          detalle_inventario: detallesConNombres,
          items: detallesConNombres.map((item) => ({
            id_item: item.id_producto,
            nombre: item.nombre_item,
            cantidad: item.cantidad,
          })),
        }

        console.log('✅ Inventario completo procesado:', inventarioCompleto)
        return inventarioCompleto
      }

      return null
    } catch (err) {
      error.value = err.message
      console.error('Error obteniendo inventario por ID:', err)
      return null
    } finally {
      loading.value = false
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

      // Mapear tipo para consulta en BD
      const tipoParaBD = mapearTipoParaBD(tipo)
      console.log('🔍 Buscando inventario actual:', { tipoOriginal: tipo, tipoParaBD })

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
        .eq('detalle_inventario.tipo_kit', tipoParaBD)
        .order('fecha_registro', { ascending: false })
        .limit(1)
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') throw fetchError

      if (data) {
        // Procesar datos para incluir nombres de items
        const detallesConNombres = []

        for (const detalle of data.detalle_inventario) {
          // Mapear nombre de tabla para montaña/montania
          const tableName = mapearTipoParaBD(detalle.tipo_kit)

          // Obtener nombre del item según el tipo
          const { data: itemData } = await supabase
            .from(`${tableName}_items`)
            .select('nombre')
            .eq('id_item', detalle.id_item)
            .single()

          detallesConNombres.push({
            ...detalle,
            // Mapear tipo de vuelta para mostrar en UI (montania -> montaña)
            tipo_kit: mapearTipoParaUI(detalle.tipo_kit),
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

      // Mapear tipo para compatibilidad con BD (montaña -> montania)
      const tipoParaBD = mapearTipoParaBD(tipoKit)
      console.log('🔄 Tipo mapeado para compra:', { tipoOriginal: tipoKit, tipoParaBD })

      // Calcular precio total obteniendo precios de los items
      let precioTotal = 0
      const detallesConPrecio = []

      for (const item of items) {
        try {
          // Obtener precio del item
          const tablaItems = `${tipoParaBD}_items`
          const { data: itemData, error: itemError } = await supabase
            .from(tablaItems)
            .select('precio')
            .eq('id_item', item.id_item)
            .single()

          if (itemError) {
            console.warn(`Error obteniendo precio para item ${item.id_item}:`, itemError)
          }

          const precio = itemData?.precio || 0
          const subtotal = item.cantidad * precio
          precioTotal += subtotal

          detallesConPrecio.push({
            id_compra: compra.id_compra,
            tipo_kit: tipoParaBD,
            id_item: item.id_item,
            cantidad: item.cantidad,
          })

          console.log(`💰 Item ${item.id_item}: ${item.cantidad} x S/${precio} = S/${subtotal}`)
        } catch (err) {
          console.warn(`Error obteniendo precio para item ${item.id_item}:`, err)
          // Continuar sin precio
          detallesConPrecio.push({
            id_compra: compra.id_compra,
            tipo_kit: tipoParaBD,
            id_item: item.id_item,
            cantidad: item.cantidad,
          })
        }
      }

      console.log(`💰 Precio total calculado: S/${precioTotal}`)

      // Actualizar el registro de compra con el precio total
      const { error: updateError } = await supabase
        .from('compras')
        .update({ precio_total: precioTotal })
        .eq('id_compra', compra.id_compra)

      if (updateError) {
        console.error('❌ Error actualizando precio total:', updateError)
        throw updateError
      }

      console.log('📋 Detalles de compra a insertar:', detallesConPrecio)

      const { error: detallesError } = await supabase
        .from('detalle_compras')
        .insert(detallesConPrecio)

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

  // Función para obtener historial de compras del usuario
  const obtenerHistorialCompras = async (filtros = {}) => {
    if (!user.value) {
      const errorMsg = 'Debes estar autenticado para ver el historial de compras.'
      error.value = errorMsg
      throw new Error(errorMsg)
    }

    try {
      loading.value = true
      error.value = null

      console.log('Obteniendo historial de compras del usuario:', user.value.email)

      // Obtener ID del usuario interno
      const id_usuario_interno = await obtenerIdUsuarioInterno()
      console.log('ID usuario interno obtenido:', id_usuario_interno)

      // Primero obtenemos las compras básicas
      let query = supabase
        .from('compras')
        .select(
          `
          id_compra,
          id_usuario,
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
        .eq('id_usuario', id_usuario_interno)
        .order('fecha_compra', { ascending: false })

      // Aplicar filtros si existen
      if (filtros.estado) {
        // Nota: No veo campo estado en la tabla compras,
        // por ahora ignoramos este filtro
        console.warn('Filtro por estado no disponible en la estructura actual')
      }

      if (filtros.tipo_kit) {
        // Filtrar a nivel de detalle_compras
        query = query.eq('detalle_compras.tipo_kit', filtros.tipo_kit)
      }

      const { data: compras, error: comprasError } = await query

      if (comprasError) {
        console.error('❌ Error obteniendo historial de compras:', comprasError)
        throw comprasError
      }

      console.log('✅ Historial de compras obtenido RAW:', compras)

      // Debug MUY detallado de cada compra - NUEVO
      console.log('\n=== DEBUG DETALLADO DE DATOS RAW ===')
      compras.forEach((compra, index) => {
        console.log(`\n📋 COMPRA ${index + 1}:`)
        console.log(`  ID: ${compra.id_compra}`)
        console.log(`  Fecha: ${compra.fecha_compra}`)
        console.log(`  Precio Total: ${compra.precio_total}`)
        console.log(`  Número de detalles: ${compra.detalle_compras?.length || 0}`)

        if (compra.detalle_compras && compra.detalle_compras.length > 0) {
          compra.detalle_compras.forEach((detalle, detalleIndex) => {
            console.log(`    📦 DETALLE ${detalleIndex + 1}:`)
            console.log(`      id_detalle: ${detalle.id_detalle}`)
            console.log(`      tipo_kit: "${detalle.tipo_kit}" (tipo: ${typeof detalle.tipo_kit})`)
            console.log(`      id_item: ${detalle.id_item}`)
            console.log(`      cantidad: ${detalle.cantidad}`)
            console.log(`      Detalle completo:`, detalle)
          })
        } else {
          console.log(`    ⚠️ No hay detalles para esta compra`)
        }
      })
      console.log('=== FIN DEBUG DETALLADO ===\n')

      // Debug detallado de cada compra
      compras.forEach((compra, index) => {
        console.log(`\n📋 Compra ${index + 1} - Detalles:`, {
          id_compra: compra.id_compra,
          fecha_compra: compra.fecha_compra,
          precio_total: compra.precio_total,
          detalle_compras: compra.detalle_compras,
        })

        compra.detalle_compras?.forEach((detalle, detalleIndex) => {
          console.log(`  📦 Detalle ${detalleIndex + 1}:`, {
            id_detalle: detalle.id_detalle,
            tipo_kit: detalle.tipo_kit,
            id_item: detalle.id_item,
            cantidad: detalle.cantidad,
          })
        })
      })

      // Debug: verificar los valores de precio_total
      compras.forEach((compra, index) => {
        console.log(`Compra ${index + 1}:`, {
          id_compra: compra.id_compra,
          fecha_compra: compra.fecha_compra,
          precio_total: compra.precio_total,
          tipo_precio_total: typeof compra.precio_total,
          detalle_compras_count: compra.detalle_compras?.length || 0,
        })
      })

      // Ahora necesitamos enriquecer los datos con información de los items
      const comprasEnriquecidas = await Promise.all(
        compras.map(async (compra) => {
          const detallesEnriquecidos = await Promise.all(
            compra.detalle_compras.map(async (detalle) => {
              try {
                console.log(`\n🔍 PROCESANDO DETALLE INDIVIDUAL:`)
                console.log(`  Detalle RAW:`, detalle)
                console.log(`  tipo_kit RAW: "${detalle.tipo_kit}"`)
                console.log(`  Tipo de tipo_kit: ${typeof detalle.tipo_kit}`)
                console.log(`  Es undefined: ${detalle.tipo_kit === undefined}`)
                console.log(`  Es null: ${detalle.tipo_kit === null}`)
                console.log(`  Es string vacío: ${detalle.tipo_kit === ''}`)

                // Si tipo_kit es undefined o null, intentar detectarlo
                let tipoKit = detalle.tipo_kit
                if (!tipoKit) {
                  console.log(`⚠️ tipo_kit es falsy para item ${detalle.id_item}, detectando...`)
                  tipoKit = await detectarTipoKit(detalle.id_item)
                  if (!tipoKit) {
                    console.error(`❌ No se pudo detectar tipo para item ${detalle.id_item}`)
                    return {
                      ...detalle,
                      tipo_kit: 'desconocido',
                      item_name: `Item ${detalle.id_item} (tipo desconocido)`,
                      price: 0,
                      subtotal: 0,
                    }
                  }
                  console.log(`✅ Tipo detectado para item ${detalle.id_item}: ${tipoKit}`)
                } else {
                  console.log(`✅ tipo_kit existe: "${tipoKit}"`)
                }

                // Obtener información del item según su tipo (mapear montaña -> montania)
                const tipoParaBD = mapearTipoParaBD(tipoKit)
                const tablaItems = `${tipoParaBD}_items`
                console.log(
                  `🔍 Buscando item ${detalle.id_item} en tabla ${tablaItems} (tipo original: ${tipoKit})`,
                )

                const { data: itemData, error: itemError } = await supabase
                  .from(tablaItems)
                  .select('nombre, precio')
                  .eq('id_item', detalle.id_item)
                  .single()

                console.log(`📊 Resultado query - itemData:`, itemData, `itemError:`, itemError)

                if (itemError) {
                  console.warn(
                    `❌ No se pudo obtener item ${detalle.id_item} de ${tablaItems} (tipo: ${tipoKit} -> ${tipoParaBD}):`,
                    itemError,
                  )
                  return {
                    ...detalle,
                    tipo_kit: tipoKit, // Usar el tipo detectado o original
                    item_name: `Item ${detalle.id_item} (${tipoKit})`, // Incluir tipo para debug
                    price: 0,
                    subtotal: 0,
                  }
                }

                console.log(`✅ Item encontrado: ${itemData.nombre} - S/${itemData.precio || 0}`)

                const precio = itemData.precio || 0
                const subtotal = detalle.cantidad * precio

                return {
                  ...detalle,
                  tipo_kit: tipoKit, // Usar el tipo detectado o original
                  item_name: itemData.nombre,
                  price: precio,
                  subtotal: subtotal,
                }
              } catch (err) {
                console.warn(
                  `❌ Error procesando detalle ${detalle.id_item} (tipo: ${detalle.tipo_kit || 'undefined'}):`,
                  err,
                )
                return {
                  ...detalle,
                  tipo_kit: detalle.tipo_kit || 'error', // Usar tipo original o 'error' si no existe
                  item_name: `Error: Item ${detalle.id_item}`,
                  price: 0,
                  subtotal: 0,
                }
              }
            }),
          )

          // Calcular el total de los items dinámicamente si no hay precio_total en BD
          const totalCalculado = detallesEnriquecidos.reduce(
            (sum, detalle) => sum + (detalle.subtotal || 0),
            0,
          )
          const totalFinal = compra.precio_total > 0 ? compra.precio_total : totalCalculado

          console.log(
            `Compra ${compra.id_compra}: precio_total BD = ${compra.precio_total}, calculado = ${totalCalculado}, final = ${totalFinal}`,
          )

          // Debug del tipo antes de asignarlo
          const tipoOriginal = compra.detalle_compras[0]?.tipo_kit
          const tipoEnriquecido = detallesEnriquecidos[0]?.tipo_kit

          // Determinar el tipo con más validaciones
          let tipoFinal = 'desconocido'

          // NUEVO: Siempre usar el tipo original si está disponible, no depender del enriquecimiento
          if (compra.detalle_compras.length > 0 && compra.detalle_compras[0]?.tipo_kit) {
            tipoFinal = mapearTipoParaUI(compra.detalle_compras[0].tipo_kit)
          } else if (detallesEnriquecidos.length > 0 && detallesEnriquecidos[0]?.tipo_kit) {
            tipoFinal = mapearTipoParaUI(detallesEnriquecidos[0].tipo_kit)
          }

          console.log(`🔍 Debug tipo para compra ${compra.id_compra}:`, {
            tipoOriginal,
            tipoEnriquecido,
            tipoFinal,
            detallesEnriquecidosLength: detallesEnriquecidos.length,
            detalleComprasLength: compra.detalle_compras.length,
            detallesEnriquecidos: detallesEnriquecidos,
            detalleCompras: compra.detalle_compras,
          })

          // NUEVO: Debug adicional si el tipo final es 'desconocido'
          if (tipoFinal === 'desconocido') {
            console.error(`❌ ALERT: Tipo desconocido para compra ${compra.id_compra}!`, {
              tipoOriginal,
              tipoEnriquecido,
              detalleCompras: compra.detalle_compras,
              detallesEnriquecidos,
            })
            // También mostrar alert para debug en UI
            alert(
              `TIPO DESCONOCIDO para compra ${compra.id_compra}!\nTipo original: ${tipoOriginal}\nTipo enriquecido: ${tipoEnriquecido}`,
            )
          }

          const compraFinal = {
            id: compra.id_compra,
            created_at: compra.fecha_compra,
            status: 'pending', // Por defecto, ya que no hay campo estado
            type: tipoFinal,
            total: totalFinal,
            items: detallesEnriquecidos.map((detalle) => ({
              id: detalle.id_item,
              item_name: detalle.item_name,
              quantity: detalle.cantidad,
              price: detalle.price,
              subtotal: detalle.subtotal,
            })),
            // Verificar si es compra de hoy
            isToday: new Date(compra.fecha_compra).toDateString() === new Date().toDateString(),
          }

          console.log(`📊 Compra final mapeada:`, compraFinal)
          return compraFinal
        }),
      )

      return comprasEnriquecidas
    } catch (err) {
      console.error('❌ Error obteniendo historial de compras:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Función para actualizar una compra
  const actualizarCompra = async (id_compra, nuevosItems, nuevoTotal = 0) => {
    if (!user.value) {
      const errorMsg = 'Debes estar autenticado para actualizar compras.'
      error.value = errorMsg
      throw new Error(errorMsg)
    }

    try {
      loading.value = true
      error.value = null

      console.log('🔄 Actualizando compra:', { id_compra, nuevosItems, nuevoTotal })

      // Verificar que la compra existe y pertenece al usuario
      const id_usuario_interno = await obtenerIdUsuarioInterno()

      const { data: compra, error: verificarError } = await supabase
        .from('compras')
        .select('*')
        .eq('id_compra', id_compra)
        .eq('id_usuario', id_usuario_interno)
        .single()

      if (verificarError || !compra) {
        throw new Error('No se encontró la compra o no tienes permisos para editarla')
      }

      // Permitir editar compras del día actual (no hay campo estado en la estructura actual)
      const esHoy = new Date(compra.fecha_compra).toDateString() === new Date().toDateString()
      if (!esHoy) {
        throw new Error('Solo puedes editar compras del día actual')
      }

      // Eliminar detalles anteriores
      const { error: eliminarError } = await supabase
        .from('detalle_compras')
        .delete()
        .eq('id_compra', id_compra)

      if (eliminarError) throw eliminarError

      // Insertar nuevos detalles
      const nuevosDetalles = nuevosItems.map((item) => ({
        id_compra: id_compra,
        tipo_kit: item.tipo_kit,
        id_item: item.id_item,
        cantidad: item.cantidad,
      }))

      const { error: detallesError } = await supabase.from('detalle_compras').insert(nuevosDetalles)

      if (detallesError) throw detallesError

      console.log('✅ Compra actualizada exitosamente')
      return true
    } catch (err) {
      console.error('❌ Error actualizando compra:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Función de debug para obtener una compra específica
  const debugObtenerCompra = async (idCompra) => {
    try {
      console.log('DEBUG: Obteniendo compra específica:', idCompra)

      const { data: compra, error } = await supabase
        .from('compras')
        .select(
          `
          id_compra,
          id_usuario,
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
        .eq('id_compra', idCompra)
        .single()

      if (error) {
        console.error('❌ Error obteniendo compra:', error)
        return null
      }

      console.log('✅ Compra obtenida:', {
        id_compra: compra.id_compra,
        fecha_compra: compra.fecha_compra,
        precio_total: compra.precio_total,
        tipo_precio_total: typeof compra.precio_total,
        valor_precio_total: compra.precio_total,
        detalles_count: compra.detalle_compras?.length || 0,
      })

      return compra
    } catch (err) {
      console.error('💥 Error en debugObtenerCompra:', err)
      return null
    }
  }

  // Función auxiliar para detectar tipo de kit basado en id_item cuando tipo_kit es undefined
  const detectarTipoKit = async (id_item) => {
    console.log(`🔍 Detectando tipo de kit para item ${id_item}...`)

    const tipos = ['hogar', 'escolar', 'oficina', 'industria', 'montania']

    for (const tipo of tipos) {
      try {
        const { data, error } = await supabase
          .from(`${tipo}_items`)
          .select('id_item')
          .eq('id_item', id_item)
          .single()

        if (!error && data) {
          console.log(`✅ Item ${id_item} encontrado en tabla ${tipo}_items`)
          return tipo
        }
      } catch (err) {
        // Continuar con el siguiente tipo
        console.log(`⚠️ Item ${id_item} no encontrado en ${tipo}_items`)
      }
    }

    console.log(`❌ No se pudo detectar tipo para item ${id_item}`)
    return null
  }

  // Obtener productos por tipo desde la tabla 'productos'
  const obtenerProductos = async (tipo) => {
    try {
      loading.value = true
      error.value = null
      // Consulta directa a la tabla productos filtrando por tipo
      const { data, error: fetchError } = await supabase
        .from('productos')
        .select('*')
        .eq('tipo', tipo)
        .order('nombre')
      if (fetchError) throw fetchError
      return data || []
    } catch (err) {
      error.value = err.message
      console.error('Error obteniendo productos:', err)
      return []
    } finally {
      loading.value = false
    }
  }

  // Registrar una reserva de botiquín (con cálculo de monto_total)
  const reservarBotiquinDB = async (items, tipo) => {
    // Verificar autenticación
    const currentUser = await verificarAutenticacion()
    if (!currentUser) {
      const errorMsg = 'Debes estar autenticado para reservar un botiquín.'
      error.value = errorMsg
      throw new Error(errorMsg)
    }
    try {
      loading.value = true
      error.value = null
      // Obtener ID del usuario interno
      const id_usuario_interno = await obtenerIdUsuarioInterno()
      // Calcular monto_total sumando los precios de los productos seleccionados
      let monto_total = 0
      for (const item of items) {
        const { data: prod, error: prodError } = await supabase
          .from('productos')
          .select('precio')
          .eq('id_producto', item.id_producto)
          .single()
        if (!prodError && prod && prod.precio) {
          monto_total += (prod.precio || 0) * (item.cantidad || 0)
        }
      }
      // Crear registro principal en reserva_botiquin (con monto_total)
      const { data: reserva, error: reservaError } = await supabase
        .from('reserva_botiquin')
        .insert({ id_usuario: id_usuario_interno, monto_total })
        .select()
        .single()
      if (reservaError) throw reservaError
      // Insertar detalles en detalle_reserva_botiquin (usar id_producto)
      const detalles = items.map((item) => ({
        id_reserva: reserva.id_reserva,
        id_producto: item.id_producto,
        cantidad: item.cantidad,
      }))
      const { error: detallesError } = await supabase
        .from('detalle_reserva_botiquin')
        .insert(detalles)
      if (detallesError) throw detallesError
      return reserva
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Obtener historial combinado de botiquines y reservas
  const obtenerHistorialBotiquinesYReservas = async () => {
    const currentUser = await verificarAutenticacion()
    if (!currentUser) return []
    const id_usuario_interno = await obtenerIdUsuarioInterno()
    // Botiquines (join para traer tipo y nombre del producto)
    const { data: botiquines } = await supabase
      .from('inventario_botiquin')
      .select(
        `
        id_inventario, fecha, id_usuario,
        detalle_inventario_botiquin(
          id_producto, cantidad,
          producto:productos(id_producto, nombre, tipo)
        )
      `,
      )
      .eq('id_usuario', id_usuario_interno)
      .order('fecha', { ascending: false })
    // Reservas (join para traer tipo y nombre del producto)
    const { data: reservas } = await supabase
      .from('reserva_botiquin')
      .select(
        `
        id_reserva, fecha, monto_total, id_usuario,
        detalle_reserva_botiquin(
          id_producto, cantidad,
          producto:productos(id_producto, nombre, tipo)
        )
      `,
      )
      .eq('id_usuario', id_usuario_interno)
      .order('fecha', { ascending: false })
    // Unificar y marcar tipo
    const historial = []
    for (const b of botiquines || []) {
      // Mapear productos para incluir tipo y nombre
      const productos = (b.detalle_inventario_botiquin || []).map((d) => ({
        id_producto: d.id_producto,
        cantidad: d.cantidad,
        tipo: d.producto?.tipo || '',
        nombre: d.producto?.nombre || '',
      }))
      historial.push({
        tipo: 'botiquin',
        id: b.id_inventario,
        fecha: b.fecha,
        productos,
      })
    }
    for (const r of reservas || []) {
      // Mapear productos para incluir tipo y nombre
      const productos = (r.detalle_reserva_botiquin || []).map((d) => ({
        id_producto: d.id_producto,
        cantidad: d.cantidad,
        tipo: d.producto?.tipo || '',
        nombre: d.producto?.nombre || '',
      }))
      historial.push({
        tipo: 'reserva',
        id: r.id_reserva,
        fecha: r.fecha,
        productos,
        monto_total: r.monto_total,
      })
    }
    // Ordenar por fecha descendente
    historial.sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
    return historial
  } // Verificar qué tipos de botiquines ya tiene registrados el usuario
  const verificarTiposExistentes = async () => {
    try {
      console.log('🔍 Verificando tipos de botiquines existentes...')

      const currentUser = await verificarAutenticacion()
      if (!currentUser) {
        console.log('❌ No hay usuario autenticado para verificar tipos')
        return []
      }

      // Obtener ID del usuario interno con timeout más agresivo
      const id_usuario_interno = await Promise.race([
        obtenerIdUsuarioInterno(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout obteniendo ID usuario')), 3000),
        ),
      ])

      console.log('👤 ID usuario interno:', id_usuario_interno)

      // Hacer una consulta optimizada con JOIN directo para obtener todos los tipos
      const { data, error: fetchError } = await Promise.race([
        supabase
          .from('inventario_botiquin')
          .select(
            `
            id_inventario,
            detalle_inventario_botiquin!inner (
              productos!inner (
                tipo_botiquin
              )
            )
          `,
          )
          .eq('id_usuario', id_usuario_interno)
          .limit(20), // Limitar resultados
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout en consulta tipos')), 3000),
        ),
      ])

      if (fetchError) {
        console.error('❌ Error al verificar tipos existentes:', fetchError)
        return []
      }

      console.log('📥 Inventarios encontrados:', data?.length || 0)

      // Extraer tipos únicos de la respuesta
      const tiposExistentes = new Set()

      for (const inventario of data || []) {
        for (const detalle of inventario.detalle_inventario_botiquin || []) {
          if (detalle.productos?.tipo_botiquin) {
            const tipoUI = mapearTipoParaUI(detalle.productos.tipo_botiquin)
            tiposExistentes.add(tipoUI)
            console.log(`  ➕ Tipo encontrado: ${detalle.productos.tipo_botiquin} -> ${tipoUI}`)
          }
        }
      }

      const tiposArray = Array.from(tiposExistentes)
      console.log('✅ Tipos de botiquines existentes:', tiposArray)

      return tiposArray
    } catch (error) {
      console.error('❌ Error verificando tipos existentes:', error)
      // No lanzar error, solo retornar array vacío para no bloquear la UI
      return []
    }
  }

  // Verificar si un usuario puede registrar un tipo específico de botiquín
  const puedeRegistrarTipo = async (tipo) => {
    try {
      const tiposExistentes = await verificarTiposExistentes()
      const tipoNormalizado = tipo.toLowerCase()

      // Verificar si ya tiene este tipo registrado
      const yaExiste = tiposExistentes.some((t) => t.toLowerCase() === tipoNormalizado)

      console.log(`🔍 ¿Puede registrar tipo "${tipo}"?`, {
        yaExiste,
        tiposExistentes,
        totalTipos: tiposExistentes.length,
      })

      return {
        puedeRegistrar: !yaExiste,
        yaExiste,
        tiposExistentes,
        totalTipos: tiposExistentes.length,
        maxTiposAlcanzado: tiposExistentes.length >= 5,
      }
    } catch (error) {
      console.error('❌ Error verificando si puede registrar tipo:', error)
      return {
        puedeRegistrar: false,
        yaExiste: false,
        tiposExistentes: [],
        totalTipos: 0,
        maxTiposAlcanzado: false,
        error: error.message,
      }
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
    obtenerInventarioPorId,
    obtenerInventarioActual,
    crearOrdenCompra,
    debugObtenerCompra,
    obtenerHistorialCompras,
    actualizarCompra,
    obtenerProductos,
    reservarBotiquinDB,
    obtenerHistorialBotiquinesYReservas,
    verificarTiposExistentes,
    puedeRegistrarTipo,
  }
}
