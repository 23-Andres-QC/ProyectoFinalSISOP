import { ref, computed } from 'vue'
import { supabase } from '../supabase.js'

export function useAuth() {
  const loading = ref(false)
  const error = ref(null)
  const user = ref(null)
  const session = ref(null)

  // Estado de autenticación
  const isAuthenticated = computed(() => !!user.value)

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
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) throw signInError

      user.value = data.user
      session.value = data.session

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

      user.value = null
      session.value = null

      return { success: true }
    } catch (err) {
      error.value = err.message
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
        redirectTo: `${window.location.origin}/reset-password`,
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
        userValue: user.value,
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
  }
}
