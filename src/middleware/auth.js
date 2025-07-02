import { useAuth } from '../composables/useAuth.js'

export const requireAuth = async (to, from, next) => {
  console.log('🔒 requireAuth middleware - iniciando para ruta:', to.path)
  const { getCurrentSession } = useAuth()

  try {
    console.log('🔍 requireAuth - obteniendo sesión...')
    const session = await getCurrentSession()

    console.log('📊 requireAuth - resultado de sesión:', {
      hasSession: !!session,
      hasUser: !!session?.user,
      userEmail: session?.user?.email,
      toPath: to.path,
      fromPath: from.path,
    })

    if (session) {
      console.log('✅ requireAuth - usuario autenticado, continuando a:', to.path)
      next() // Usuario autenticado, continúa
    } else {
      console.log('❌ requireAuth - usuario no autenticado, redirigiendo a login')
      next('/') // Redirige al login
    }
  } catch (error) {
    console.error('💥 requireAuth - error checking auth:', error)
    next('/') // En caso de error, redirige al login
  }
}

export const redirectIfAuthenticated = async (to, from, next) => {
  const { getCurrentSession } = useAuth()

  try {
    console.log('🔍 Verificando si el usuario ya está autenticado...')
    const session = await getCurrentSession()

    console.log('📊 Estado de autenticación:', {
      hasSession: !!session,
      hasUser: !!session?.user,
      userEmail: session?.user?.email,
      fromPath: from.path,
      toPath: to.path,
    })

    if (session) {
      console.log('✅ Usuario ya autenticado, redirigiendo a /principal')
      next('/principal') // Usuario ya autenticado, redirige a página principal
    } else {
      console.log('❌ Usuario no autenticado, mostrando página de login')
      next() // Usuario no autenticado, continúa al login
    }
  } catch (error) {
    console.error('Error checking auth:', error)
    next() // En caso de error, continúa
  }
}

export const requireAdmin = (to, from, next) => {
  console.log('🔐 requireAdmin middleware - verificando permisos para:', to.path)

  const tipoUsuario = localStorage.getItem('tipo_usuario')
  console.log('👤 Tipo usuario desde localStorage:', tipoUsuario)

  // Verificación simple y rápida usando solo localStorage
  if (tipoUsuario === 'admin') {
    console.log('✅ Acceso admin autorizado')
    next()
  } else {
    console.log('❌ Acceso denegado - redirigiendo a /principal')
    next('/principal')
  }
}
