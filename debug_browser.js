// Script de debug para verificar estado del usuario y validaciones
// Ejecutar esto en la consola del navegador

console.log('=== DEBUG USUARIO Y VALIDACIONES ===')

// Verificar usuario actual
import { useAuth } from './src/composables/useAuth.js'
import { useBotiquinDB } from './src/composables/useBotiquinDB.js'

const { user, getUserType, isUserAdmin } = useAuth()
const { verificarTiposExistentes, puedeRegistrarTipo } = useBotiquinDB()

// Función de debug principal
const debugUsuario = async () => {
  try {
    console.log('1. Usuario actual:', user.value)

    console.log('2. Verificando tipo de usuario...')
    const userType = await getUserType()
    console.log('   Tipo de usuario:', userType)

    console.log('3. Verificando si es admin...')
    const isAdmin = await isUserAdmin()
    console.log('   Es administrador:', isAdmin)

    console.log('4. Verificando tipos de botiquines existentes...')
    const tiposExistentes = await verificarTiposExistentes()
    console.log('   Tipos existentes:', tiposExistentes)

    console.log('5. Verificando si puede registrar "hogar"...')
    const puedeHogar = await puedeRegistrarTipo('hogar')
    console.log('   Puede registrar hogar:', puedeHogar)

    console.log('6. Verificando si puede registrar "oficina"...')
    const puedeOficina = await puedeRegistrarTipo('oficina')
    console.log('   Puede registrar oficina:', puedeOficina)
  } catch (error) {
    console.error('Error en debug:', error)
  }
}

// Ejecutar debug
debugUsuario()

// También crear funciones globales para debug manual
window.debugUsuario = debugUsuario
window.debugAuth = { getUserType, isUserAdmin }
window.debugBotiquin = { verificarTiposExistentes, puedeRegistrarTipo }

console.log('=== FUNCIONES DE DEBUG DISPONIBLES ===')
console.log('- debugUsuario(): Ejecuta todo el debug')
console.log('- debugAuth.getUserType(): Obtiene tipo de usuario')
console.log('- debugAuth.isUserAdmin(): Verifica si es admin')
console.log('- debugBotiquin.verificarTiposExistentes(): Lista tipos existentes')
console.log('- debugBotiquin.puedeRegistrarTipo("tipo"): Verifica si puede registrar tipo')
