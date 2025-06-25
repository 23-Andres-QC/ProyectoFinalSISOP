import { useAuth } from '../composables/useAuth.js'

export const requireAuth = async (to, from, next) => {
  const { getCurrentSession } = useAuth()

  try {
    const session = await getCurrentSession()

    if (session) {
      next() // Usuario autenticado, continúa
    } else {
      next('/') // Redirige al login
    }
  } catch (error) {
    console.error('Error checking auth:', error)
    next('/') // En caso de error, redirige al login
  }
}

export const redirectIfAuthenticated = async (to, from, next) => {
  const { getCurrentSession } = useAuth()

  try {
    const session = await getCurrentSession()

    if (session) {
      next('/principal') // Usuario ya autenticado, redirige a página principal
    } else {
      next() // Usuario no autenticado, continúa al login
    }
  } catch (error) {
    console.error('Error checking auth:', error)
    next() // En caso de error, continúa
  }
}
