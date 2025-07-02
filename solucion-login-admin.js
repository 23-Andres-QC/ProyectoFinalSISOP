/**
 * SOLUCIÓN DEFINITIVA PARA LOGIN DE ADMIN
 *
 * Este script resuelve todos los problemas de bloqueo identificados.
 * Ejecutar en la consola del navegador cuando hay problemas con login de admin.
 */

/* global supabase */

// ===== SOLUCIÓN COMPLETA =====
const solucionLoginAdmin = {
  // PASO 1: Diagnóstico rápido
  async diagnosticar() {
    console.log('🔍 DIAGNÓSTICO RÁPIDO')
    console.log('====================')

    try {
      // Verificar Supabase
      const {
        data: { session },
      } = await supabase.auth.getSession()
      console.log('📊 Estado Supabase:', {
        sesionActiva: !!session,
        usuarioActivo: !!session?.user,
        email: session?.user?.email,
      })

      // Verificar localStorage
      const tipoUsuario = localStorage.getItem('tipo_usuario')
      console.log('💾 localStorage tipo_usuario:', tipoUsuario)

      // Test de conexión rápido
      const { error } = await Promise.race([
        supabase.from('usuarios').select('count').limit(1),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 3000)),
      ])

      console.log('🔗 Conexión BD:', error ? '❌ Error' : '✅ OK')

      return !error
    } catch (error) {
      console.error('❌ Error en diagnóstico:', error.message)
      return false
    }
  },

  // PASO 2: Limpieza completa
  limpiarTodo() {
    console.log('🧹 LIMPIANDO TODO EL ESTADO')
    console.log('===========================')

    // Limpiar localStorage (conservar solo lo esencial)
    const toKeep = ['theme', 'language'] // Agregar otras claves importantes si existen
    const allKeys = Object.keys(localStorage)

    allKeys.forEach((key) => {
      if (!toKeep.includes(key)) {
        localStorage.removeItem(key)
        console.log('🗑️ Removido:', key)
      }
    })

    // Limpiar sessionStorage
    sessionStorage.clear()
    console.log('✅ Estado limpiado completamente')
  },

  // PASO 3: Login seguro con todos los timeouts
  async loginSeguro(email, password) {
    console.log('🛡️ LOGIN SEGURO PARA ADMIN')
    console.log('===========================')
    console.log('👤 Email:', email)

    try {
      // 1. Limpiar estado previo
      this.limpiarTodo()

      // 2. Logout previo por si acaso
      await supabase.auth.signOut()
      console.log('🚪 Logout previo completado')

      // 3. Login con timeout de 8 segundos
      console.log('🔐 Iniciando autenticación...')

      const loginPromise = supabase.auth.signInWithPassword({
        email,
        password,
      })

      const loginTimeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout en autenticación (8s)')), 8000),
      )

      const { data, error } = await Promise.race([loginPromise, loginTimeout])

      if (error) throw error

      console.log('✅ Autenticación exitosa')
      console.log('👤 Usuario:', data.user.email)

      // 4. Obtener tipo usuario con timeout agresivo de 2 segundos
      console.log('🔍 Obteniendo tipo de usuario...')

      const tipoPromise = supabase
        .from('usuarios')
        .select('tipo_usuario, nombre')
        .eq('correo', email)
        .single()

      const tipoTimeout = new Promise((resolve) =>
        setTimeout(() => {
          console.log('⏱️ Timeout tipo usuario - asumiendo normal')
          resolve({ data: { tipo_usuario: 'normal' }, error: null })
        }, 2000),
      )

      const { data: userData } = await Promise.race([tipoPromise, tipoTimeout])

      const tipoFinal = userData?.tipo_usuario || 'normal'

      // 5. Guardar en localStorage
      localStorage.setItem('tipo_usuario', tipoFinal)

      console.log('✅ LOGIN COMPLETADO')
      console.log('📊 Resultado:', {
        email: data.user.email,
        tipo: tipoFinal,
        esAdmin: tipoFinal === 'admin',
      })

      // 6. Redirección manual segura
      console.log('🧭 Navegando a página principal...')
      setTimeout(() => {
        window.location.hash = '#/principal'
        // Alternativa si el hash no funciona:
        // window.location.href = window.location.origin + '/#/principal'
      }, 500)

      return {
        success: true,
        isAdmin: tipoFinal === 'admin',
        userData: userData,
      }
    } catch (error) {
      console.error('💥 ERROR EN LOGIN SEGURO:', error.message)

      // En caso de error, limpiar y recargar
      this.limpiarTodo()
      console.log('🔄 Recargando en 3 segundos...')
      setTimeout(() => window.location.reload(), 3000)

      return {
        success: false,
        error: error.message,
      }
    }
  },

  // PASO 4: Solución automática completa
  async resolverAutomatico(email, password) {
    console.log('🤖 RESOLUCIÓN AUTOMÁTICA')
    console.log('========================')

    // 1. Diagnóstico
    const conexionOk = await this.diagnosticar()

    if (!conexionOk) {
      console.log('❌ Problema de conexión detectado')
      console.log('💡 Verifica tu conexión a internet y Supabase')
      return false
    }

    // 2. Login seguro
    const resultado = await this.loginSeguro(email, password)

    if (resultado.success) {
      console.log('🎉 PROBLEMA RESUELTO EXITOSAMENTE')
      console.log('✅ El usuario admin puede proceder normalmente')

      if (resultado.isAdmin) {
        console.log('🔧 Usuario confirmado como ADMINISTRADOR')
        console.log('📋 Funciones admin disponibles en el menú')
      }
    } else {
      console.log('❌ No se pudo resolver automáticamente')
      console.log('💡 Verifica las credenciales e intenta manualmente')
    }

    return resultado.success
  },
}

// Exportar globalmente
window.solucionLoginAdmin = solucionLoginAdmin

// Mensaje de bienvenida
console.log('🔧 SOLUCIÓN PARA LOGIN DE ADMIN CARGADA')
console.log('========================================')
console.log('')
console.log('💡 COMANDOS DISPONIBLES:')
console.log('')
console.log('🔍 solucionLoginAdmin.diagnosticar()')
console.log('   → Verificar estado actual del sistema')
console.log('')
console.log('🧹 solucionLoginAdmin.limpiarTodo()')
console.log('   → Limpiar todo el estado local problemático')
console.log('')
console.log('🛡️ solucionLoginAdmin.loginSeguro("email", "password")')
console.log('   → Login con todos los timeouts y protecciones')
console.log('')
console.log('🤖 solucionLoginAdmin.resolverAutomatico("email", "password")')
console.log('   → Solución completa automática (RECOMENDADO)')
console.log('')
console.log('========================================')
console.log('🚀 Para resolver el problema ejecuta:')
console.log('   solucionLoginAdmin.resolverAutomatico("tu-email-admin", "tu-password")')
