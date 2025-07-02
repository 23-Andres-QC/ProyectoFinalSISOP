import { ref, computed } from 'vue'
import { supabase } from '../supabase.js'

export function useAuth() {
  const loading = ref(false)
  const error = ref(null)
  const user = ref(null)
  const session = ref(null)

  // Estado de autenticación
  const isAuthenticated = computed(() => !!user.value)

  // Inicializar estado del usuario al cargar el composable
  const initializeAuth = async () => {
    try {
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession()
      session.value = currentSession
      user.value = currentSession?.user || null
      console.log('🔄 Auth inicializado:', {
        hasSession: !!currentSession,
        hasUser: !!user.value,
        userEmail: user.value?.email,
      })
    } catch (error) {
      console.error('Error inicializando auth:', error)
      session.value = null
      user.value = null
    }
  }

  // Inicializar inmediatamente
  initializeAuth()

  // Registro de usuario
  const signUp = async (email, password, userData = {}) => {
    loading.value = true
    error.value = null

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData,
          emailRedirectTo: `http://www.saludesan.lat`,
          site_url: `http://www.saludesan.lat`,
        },
      })

      if (signUpError) throw signUpError

      // Si el registro es exitoso, también registrar en la tabla usuarios
      if (data.user) {
        const { error: insertError } = await supabase.from('usuarios').insert([
          {
            nombre: userData.nombre || 'Usuario',
            correo: email,
            contrasena: 'hash_handled_by_supabase', // Supabase maneja el hash
          },
        ])

        if (insertError) {
          console.warn('Error al insertar en tabla usuarios:', insertError.message)
        }
      }

      return { success: true, data }
    } catch (err) {
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  // Inicio de sesión
  const signIn = async (email, password) => {
    loading.value = true
    error.value = null

    try {
      console.log('🔐 Iniciando sesión para:', email)

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) throw signInError

      user.value = data.user
      session.value = data.session

      console.log('✅ Autenticación exitosa')

      // Obtener información completa del usuario desde la tabla usuarios con timeout
      try {
        console.log('🔍 Obteniendo información completa del usuario...')
        const userTypePromise = supabase
          .from('usuarios')
          .select('id_usuario, nombre, correo, tipo_usuario, fecha_creacion')
          .eq('correo', email)
          .single()

        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout obteniendo datos usuario')), 3000),
        )

        const { data: userData, error: userError } = await Promise.race([
          userTypePromise,
          timeoutPromise,
        ])

        if (!userError && userData) {
          // Guardar información completa del usuario
          localStorage.setItem('userData', JSON.stringify(userData))
          localStorage.setItem('tipo_usuario', userData.tipo_usuario || 'cliente')
          console.log('✅ Datos completos del usuario guardados:', userData)
          // Emitir evento para notificar cambio de tipo de usuario
          window.dispatchEvent(new CustomEvent('tipoUsuarioChanged'))
        } else {
          console.warn('⚠️ No se pudo obtener datos usuario completos, usando datos básicos')
          const basicUserData = {
            correo: email,
            tipo_usuario: 'cliente',
            nombre: email.split('@')[0],
          }
          localStorage.setItem('userData', JSON.stringify(basicUserData))
          localStorage.setItem('tipo_usuario', 'cliente')
          window.dispatchEvent(new CustomEvent('tipoUsuarioChanged'))
        }
      } catch (typeError) {
        console.error(
          '❌ Error obteniendo datos usuario (usando datos básicos):',
          typeError.message,
        )
        const basicUserData = {
          correo: email,
          tipo_usuario: 'cliente',
          nombre: email.split('@')[0],
        }
        localStorage.setItem('userData', JSON.stringify(basicUserData))
        localStorage.setItem('tipo_usuario', 'cliente')
        window.dispatchEvent(new CustomEvent('tipoUsuarioChanged'))
      }

      return { success: true, data }
    } catch (err) {
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  // Cerrar sesión
  const signOut = async () => {
    loading.value = true
    error.value = null

    try {
      const { error: signOutError } = await supabase.auth.signOut()

      if (signOutError) throw signOutError

      // Limpiar estado local
      user.value = null
      session.value = null

      // Limpiar datos de usuario guardados
      localStorage.removeItem('tipo_usuario')
      localStorage.removeItem('userData')

      // Emitir eventos personalizados para notificar los cambios
      window.dispatchEvent(new CustomEvent('userLoggedOut'))
      window.dispatchEvent(new CustomEvent('tipoUsuarioChanged'))

      // Limpiar almacenamiento local (excepto las recomendaciones que se limpiarán por el evento)
      const recomendaciones = localStorage.getItem('recomendacionesActuales')
      localStorage.clear()
      sessionStorage.clear()

      // Las recomendaciones se limpiarán por el evento userLoggedOut
      console.log('✅ Sesión cerrada y datos limpiados')
      return { success: true }
    } catch (err) {
      error.value = err.message
      console.error('❌ Error al cerrar sesión:', err)
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  // Recuperar contraseña
  const resetPassword = async (email) => {
    loading.value = true
    error.value = null

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `http://www.saludesan.lat/reset-password`,
        emailRedirectTo: `http://www.saludesan.lat/reset-password`,
        site_url: `http://www.saludesan.lat`,
      })

      if (resetError) throw resetError

      return { success: true }
    } catch (err) {
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  // Actualizar contraseña
  const updatePassword = async (newPassword) => {
    loading.value = true
    error.value = null

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (updateError) throw updateError

      return { success: true }
    } catch (err) {
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  // Obtener usuario actual
  const getCurrentUser = async () => {
    try {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser()
      user.value = currentUser
      return currentUser
    } catch (err) {
      console.error('Error al obtener usuario:', err)
      return null
    }
  }

  // Obtener sesión actual
  const getCurrentSession = async () => {
    try {
      console.log('🔍 Obteniendo sesión actual...')
      const {
        data: { session: currentSession },
        error: sessionError,
      } = await supabase.auth.getSession()

      if (sessionError) {
        console.error('❌ Error obteniendo sesión:', sessionError)
        throw sessionError
      }

      console.log('📊 Sesión obtenida:', {
        hasSession: !!currentSession,
        hasUser: !!currentSession?.user,
        userEmail: currentSession?.user?.email,
      })

      session.value = currentSession
      user.value = currentSession?.user || null

      console.log('✅ Estado actualizado:', {
        userValue: !!user.value,
        userEmail: user.value?.email,
      })

      return currentSession
    } catch (err) {
      console.error('💥 Error al obtener sesión:', err)
      session.value = null
      user.value = null
      return null
    }
  }

  // Obtener tipo de usuario
  const getUserType = async () => {
    try {
      console.log('🔍 Obteniendo tipo de usuario...')

      if (!user.value) {
        console.log('❌ No hay usuario autenticado')
        return 'normal'
      }

      console.log('📧 Usuario actual:', user.value.email)

      const { data: userData, error } = await supabase
        .from('usuarios')
        .select('tipo_usuario')
        .eq('correo', user.value.email)
        .single()

      if (error) {
        console.error('❌ Error obteniendo tipo de usuario:', error)
        return 'normal'
      }

      const tipoUsuario = userData?.tipo_usuario || 'normal'
      console.log('✅ Tipo de usuario obtenido:', tipoUsuario)

      return tipoUsuario
    } catch (error) {
      console.error('❌ Error en getUserType:', error)
      return 'normal'
    }
  }

  // Verificar si el usuario actual es administrador
  const isUserAdmin = async () => {
    try {
      console.log('🔍 Verificando si usuario es admin...')

      // Aplicar timeout para evitar bloqueos
      const userType = await Promise.race([
        getUserType(),
        new Promise((resolve) => {
          setTimeout(() => {
            console.log('⏱️ Timeout en verificación de admin - asumiendo usuario normal')
            resolve('normal')
          }, 5000)
        }),
      ])

      const isAdmin = userType === 'admin'
      console.log('✅ Resultado verificación admin:', { userType, isAdmin })

      return isAdmin
    } catch (error) {
      console.error('❌ Error verificando tipo de usuario:', error)
      return false
    }
  }

  // Escuchar cambios de autenticación
  const initAuthListener = () => {
    return supabase.auth.onAuthStateChange((event, newSession) => {
      session.value = newSession
      user.value = newSession?.user || null
    })
  }

  return {
    loading,
    error,
    user,
    session,
    isAuthenticated,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    getCurrentUser,
    getCurrentSession,
    initAuthListener,
    initializeAuth,
    getUserType,
    isUserAdmin,
  }
}
