/**
 * Script para limpiar estado y resolver problemas de login
 * Ejecutar en la consola del navegador cuando hay problemas
 */

/* global supabase */

const fixLoginIssues = {
  // Limpiar todo el estado local
  clearAllState() {
    console.log('🧹 Limpiando estado local...')

    // Limpiar localStorage
    const keysToKeep = [] // No conservar nada problemático
    const allKeys = Object.keys(localStorage)

    allKeys.forEach((key) => {
      if (!keysToKeep.includes(key)) {
        localStorage.removeItem(key)
        console.log('🗑️ Removido:', key)
      }
    })

    // Limpiar sessionStorage
    sessionStorage.clear()
    console.log('🗑️ SessionStorage limpiado')

    console.log('✅ Estado local limpiado')
  },

  // Logout forzado de Supabase
  async forceLogout() {
    console.log('🚪 Forzando logout de Supabase...')

    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      console.log('✅ Logout exitoso')
      this.clearAllState()

      // Recargar página
      setTimeout(() => {
        console.log('🔄 Recargando página...')
        window.location.reload()
      }, 1000)
    } catch (error) {
      console.error('❌ Error en logout:', error)
      // Limpiar de todas formas
      this.clearAllState()
      window.location.reload()
    }
  },

  // Test de login simple y seguro
  async safeLogin(email, password) {
    console.log('🛡️ Intentando login seguro para:', email)

    try {
      // Limpiar estado previo
      this.clearAllState()

      // Hacer logout por si acaso
      await supabase.auth.signOut()

      console.log('🔐 Iniciando login...')

      // Login con timeout
      const loginPromise = supabase.auth.signInWithPassword({
        email,
        password,
      })

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout en login')), 10000),
      )

      const { data, error } = await Promise.race([loginPromise, timeoutPromise])

      if (error) throw error

      console.log('✅ Login exitoso:', data.user.email)

      // Obtener tipo usuario con timeout agresivo
      console.log('🔍 Obteniendo tipo usuario...')

      const userTypePromise = supabase
        .from('usuarios')
        .select('tipo_usuario')
        .eq('correo', email)
        .single()

      const userTimeoutPromise = new Promise((resolve) =>
        setTimeout(() => {
          console.log('⏱️ Timeout obteniendo tipo - usando "normal"')
          resolve({ data: { tipo_usuario: 'normal' }, error: null })
        }, 3000),
      )

      const { data: userData, error: userError } = await Promise.race([
        userTypePromise,
        userTimeoutPromise,
      ])

      const tipoUsuario = userData?.tipo_usuario || 'normal'

      // Guardar en localStorage
      localStorage.setItem('tipo_usuario', tipoUsuario)

      console.log('✅ Login completo:', {
        email: data.user.email,
        tipo: tipoUsuario,
        esAdmin: tipoUsuario === 'admin',
      })

      // Navegar manualmente
      console.log('🧭 Navegando a /principal...')
      window.location.href = window.location.origin + '/#/principal'

      return true
    } catch (error) {
      console.error('💥 Error en login seguro:', error)

      // Limpiar y recargar en caso de error
      this.clearAllState()
      setTimeout(() => window.location.reload(), 2000)

      return false
    }
  },

  // Diagnóstico completo
  async diagnose() {
    console.log('🔍 Ejecutando diagnóstico completo...')
    console.log('=====================================')

    // 1. Estado actual de Supabase
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      console.log('📊 Sesión Supabase:', {
        haySession: !!session,
        hayUsuario: !!session?.user,
        email: session?.user?.email,
      })
    } catch (error) {
      console.error('❌ Error obteniendo sesión:', error)
    }

    // 2. Estado localStorage
    console.log('💾 localStorage:')
    Object.keys(localStorage).forEach((key) => {
      console.log(`  ${key}: ${localStorage.getItem(key)}`)
    })

    // 3. Test básico de DB
    try {
      console.log('🔗 Probando conexión DB...')
      const { data, error } = await Promise.race([
        supabase.from('usuarios').select('count').limit(1),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout conexión')), 5000)),
      ])

      if (error) throw error
      console.log('✅ Conexión DB OK')
    } catch (error) {
      console.error('❌ Error conexión DB:', error)
    }

    console.log('=====================================')
    console.log('🏁 Diagnóstico completado')
  },
}

// Corregir typo en safeLogin
fixLoginIssues.safeLogin = async function (email, password) {
  console.log('🛡️ Intentando login seguro para:', email)

  try {
    // Limpiar estado previo
    this.clearAllState()

    // Hacer logout por si acaso
    await supabase.auth.signOut()

    console.log('🔐 Iniciando login...')

    // Login con timeout
    const loginPromise = supabase.auth.signInWithPassword({
      email,
      password,
    })

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout en login')), 10000),
    )

    const { data, error } = await Promise.race([loginPromise, timeoutPromise])

    if (error) throw error

    console.log('✅ Login exitoso:', data.user.email)

    // Obtener tipo usuario con timeout agresivo
    console.log('🔍 Obteniendo tipo usuario...')

    const userTypePromise = supabase
      .from('usuarios')
      .select('tipo_usuario')
      .eq('correo', email)
      .single()

    const userTimeoutPromise = new Promise((resolve) =>
      setTimeout(() => {
        console.log('⏱️ Timeout obteniendo tipo - usando "normal"')
        resolve({ data: { tipo_usuario: 'normal' }, error: null })
      }, 3000),
    )

    const { data: userData, error: userError } = await Promise.race([
      userTypePromise,
      userTimeoutPromise,
    ])

    const tipoUsuario = userData?.tipo_usuario || 'normal'

    // Guardar en localStorage
    localStorage.setItem('tipo_usuario', tipoUsuario)

    console.log('✅ Login completo:', {
      email: data.user.email,
      tipo: tipoUsuario,
      esAdmin: tipoUsuario === 'admin',
    })

    // Navegar manualmente
    console.log('🧭 Navegando a /principal...')
    window.location.href = window.location.origin + '/#/principal'

    return true
  } catch (error) {
    console.error('💥 Error en login seguro:', error)

    // Limpiar y recargar en caso de error
    this.clearAllState()
    setTimeout(() => window.location.reload(), 2000)

    return false
  }
}

// Exportar globalmente
window.fixLoginIssues = fixLoginIssues

console.log('🔧 Herramientas de reparación cargadas')
console.log('💡 Comandos disponibles:')
console.log('  fixLoginIssues.diagnose() - Diagnosticar problemas')
console.log('  fixLoginIssues.forceLogout() - Logout forzado y limpieza')
console.log('  fixLoginIssues.safeLogin("email", "password") - Login seguro')
console.log('  fixLoginIssues.clearAllState() - Limpiar estado local')
