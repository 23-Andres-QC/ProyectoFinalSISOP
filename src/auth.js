import { useAuth } from './composables/useAuth.js'

const { initAuthListener, getCurrentSession } = useAuth()

// Inicializar listener de autenticación
let unsubscribe = null

export const initializeAuth = () => {
  // Obtener sesión actual al iniciar la app
  getCurrentSession()

  // Escuchar cambios de autenticación
  const { data } = initAuthListener()
  unsubscribe = data.subscription.unsubscribe

  return unsubscribe
}

export const cleanupAuth = () => {
  if (unsubscribe) {
    unsubscribe()
  }
}
