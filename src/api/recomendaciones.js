// API para manejar las recomendaciones y el archivo Recomendacion.txt
import fs from 'fs'
import path from 'path'

const ARCHIVO_RECOMENDACIONES = path.join(
  process.cwd(),
  'src/components/Recomendaciones/Recomendacion.txt',
)

export const recomendacionesAPI = {
  // Guardar recomendaciones en el archivo
  async guardarRecomendaciones(contenido) {
    try {
      await fs.promises.writeFile(ARCHIVO_RECOMENDACIONES, contenido, 'utf8')
      console.log('✅ Recomendaciones guardadas en Recomendacion.txt')
      return { success: true }
    } catch (error) {
      console.error('❌ Error guardando recomendaciones:', error)
      return { success: false, error: error.message }
    }
  },

  // Vaciar el archivo
  async vaciarRecomendaciones() {
    try {
      await fs.promises.writeFile(ARCHIVO_RECOMENDACIONES, '', 'utf8')
      console.log('✅ Archivo Recomendacion.txt vaciado')
      return { success: true }
    } catch (error) {
      console.error('❌ Error vaciando recomendaciones:', error)
      return { success: false, error: error.message }
    }
  },

  // Leer el contenido actual del archivo
  async leerRecomendaciones() {
    try {
      const contenido = await fs.promises.readFile(ARCHIVO_RECOMENDACIONES, 'utf8')
      return { success: true, contenido }
    } catch (error) {
      console.error('❌ Error leyendo recomendaciones:', error)
      return { success: false, error: error.message }
    }
  },
}
