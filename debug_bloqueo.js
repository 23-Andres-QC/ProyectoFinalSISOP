// Script de debug simple para la consola del navegador
// Ejecutar paso a paso para identificar dónde se bloquea
// Este script debe ejecutarse en la consola del navegador donde supabase está disponible

/* global supabase */

console.log('=== DEBUG BLOQUEO ADMIN ===')

// Paso 1: Verificar usuario actual
async function debugPaso1() {
  console.log('1. Verificando usuario actual...')
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    console.log('Usuario:', user?.email)
    return user
  } catch (error) {
    console.error('Error paso 1:', error)
    return null
  }
}

// Paso 2: Verificar tabla usuarios
async function debugPaso2(user) {
  console.log('2. Verificando en tabla usuarios...')
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .select('id_usuario, nombre, correo, tipo_usuario')
      .eq('correo', user.email)
      .single()

    console.log('Datos usuario:', data)
    console.log('Error:', error)
    return data
  } catch (error) {
    console.error('Error paso 2:', error)
    return null
  }
}

// Paso 3: Verificar inventarios básicos (con timeout)
async function debugPaso3(userData) {
  console.log('3. Verificando inventarios básicos...')
  try {
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout en consulta inventarios')), 3000),
    )

    const queryPromise = supabase
      .from('inventario_botiquin')
      .select('id_inventario, fecha_registro')
      .eq('id_usuario', userData.id_usuario)

    const { data, error } = await Promise.race([queryPromise, timeoutPromise])

    console.log('Inventarios:', data)
    console.log('Error:', error)
    return data
  } catch (error) {
    console.error('Error paso 3:', error)
    return null
  }
}

// Paso 4: Probar verificación de tipos con timeout agresivo
async function debugPaso4(userData) {
  console.log('4. Probando verificación de tipos (con timeout de 2s)...')
  try {
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout en verificación tipos')), 2000),
    )

    // Simulamos la consulta que se hace en verificarTiposExistentes
    const queryPromise = supabase
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
      .eq('id_usuario', userData.id_usuario)
      .limit(5)

    const { data, error } = await Promise.race([queryPromise, timeoutPromise])

    console.log('Tipos encontrados:', data)
    console.log('Error:', error)
    return data
  } catch (error) {
    console.error('Error paso 4 (esperado si hay timeout):', error)
    return null
  }
}

// Ejecutar debug completo
async function debugCompleto() {
  console.log('Iniciando debug completo...')

  const user = await debugPaso1()
  if (!user) return

  const userData = await debugPaso2(user)
  if (!userData) return

  const inventarios = await debugPaso3(userData)
  const tipos = await debugPaso4(userData)

  console.log('=== RESUMEN DEBUG ===')
  console.log('Usuario:', user.email)
  console.log('Tipo:', userData.tipo_usuario)
  console.log('Es admin:', userData.tipo_usuario === 'admin')
  console.log('Inventarios:', inventarios?.length || 0)
  console.log('Verificación tipos completada:', !!tipos)

  if (userData.tipo_usuario === 'admin') {
    console.log('🔧 ADMIN DETECTADO: No debería ejecutarse verificación de tipos duplicados')
  }
}

// Probar específicamente el flujo de admin en BotiquinOpcionPage
async function debugFlujoBotiquinOpciones() {
  console.log('🔧 Probando flujo específico de BotiquinOpcionPage...')

  const user = await debugPaso1()
  if (!user) return

  const userData = await debugPaso2(user)
  if (!userData) return

  console.log('📊 Simulando lógica de BotiquinOpcionPage...')

  // Verificar si es admin con timeout (como en el componente)
  const isAdminPromise = userData.tipo_usuario === 'admin'
  const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve(false), 2000))

  const isAdmin = await Promise.race([Promise.resolve(isAdminPromise), timeoutPromise])

  console.log('✅ ¿Es admin?', isAdmin)

  if (isAdmin) {
    console.log('🎯 FLUJO ADMIN: No debería verificar tipos duplicados')
    console.log('✅ Carga debería completarse rápidamente')
  } else {
    console.log('👤 FLUJO USUARIO NORMAL: Verificará tipos duplicados')
    await debugPaso4(userData)
  }
}

// Exponer funciones globalmente
window.debugPaso1 = debugPaso1
window.debugPaso2 = debugPaso2
window.debugPaso3 = debugPaso3
window.debugPaso4 = debugPaso4
window.debugCompleto = debugCompleto
window.debugFlujoBotiquinOpciones = debugFlujoBotiquinOpciones

console.log('Funciones disponibles:')
console.log('- debugPaso1(): Verificar usuario')
console.log('- debugPaso2(user): Verificar tabla usuarios')
console.log('- debugPaso3(userData): Verificar inventarios')
console.log('- debugPaso4(userData): Verificar tipos con timeout')
console.log('- debugCompleto(): Ejecutar todo')
console.log('- debugFlujoBotiquinOpciones(): Probar flujo específico')

console.log('Ejecuta: debugFlujoBotiquinOpciones()')
