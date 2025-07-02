/**
 * SCRIPT PARA CONVERTIR USUARIO EN ADMIN
 * Copia y pega esto en la consola del navegador
 */

/* global supabase */

async function convertirEnAdmin(email) {
  console.log('🔧 Convirtiendo usuario en administrador:', email)

  try {
    // Actualizar el tipo de usuario a 'admin'
    const { data, error } = await supabase
      .from('usuarios')
      .update({ tipo_usuario: 'admin' })
      .eq('correo', email)
      .select()

    if (error) throw error

    console.log('✅ Usuario convertido en admin:', data)

    // Actualizar localStorage
    localStorage.setItem('tipo_usuario', 'admin')
    console.log('💾 localStorage actualizado')

    // Recargar página para aplicar cambios
    console.log('🔄 Recargando página...')
    setTimeout(() => {
      window.location.reload()
    }, 1000)

    return true
  } catch (error) {
    console.error('❌ Error convirtiendo usuario:', error)
    return false
  }
}

// Uso: convertirEnAdmin('tu-email@ejemplo.com')
window.convertirEnAdmin = convertirEnAdmin
console.log('🔧 Función cargada. Uso: convertirEnAdmin("tu-email@ejemplo.com")')
