<template>
  <q-page class="q-pa-md">
    <!-- Verificacion de acceso -->
    <div v-if="!esAdmin" class="text-center q-pa-xl">
      <q-icon name="warning" size="80px" color="orange" />
      <h4 class="text-orange">Acceso Denegado</h4>
      <p>Solo administradores pueden acceder a esta pagina.</p>
      <q-btn color="primary" label="Volver al Inicio" @click="$router.push('/principal')" />
    </div>

    <!-- Panel Admin -->
    <div v-else>
      <div class="row items-center q-mb-lg">
        <q-icon name="admin_panel_settings" size="40px" color="primary" class="q-mr-md" />
        <div>
          <h3 class="q-ma-none">Panel de Administracion</h3>
          <p class="text-grey-7 q-ma-none">Gestion completa del sistema</p>
        </div>
      </div>

      <!-- Informacion del Admin -->
      <q-card class="q-mb-lg">
        <q-card-section>
          <h5 class="q-mt-none">Estado del Administrador</h5>
          <div class="row q-gutter-md">
            <div class="col-md-4">
              <q-item>
                <q-item-section avatar>
                  <q-icon name="person" color="primary" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Email</q-item-label>
                  <q-item-label caption>{{ userEmail }}</q-item-label>
                </q-item-section>
              </q-item>
            </div>
            <div class="col-md-4">
              <q-item>
                <q-item-section avatar>
                  <q-icon name="verified_user" color="positive" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Tipo de Usuario</q-item-label>
                  <q-item-label caption>{{ tipoUsuario }}</q-item-label>
                </q-item-section>
              </q-item>
            </div>
            <div class="col-md-4">
              <q-item>
                <q-item-section avatar>
                  <q-icon name="schedule" color="info" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Ultimo Acceso</q-item-label>
                  <q-item-label caption>{{ fechaAcceso }}</q-item-label>
                </q-item-section>
              </q-item>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Funciones Administrativas -->
      <div class="row q-gutter-md">
        <!-- Gestion de Usuarios -->
        <div class="col-md-6 col-sm-12">
          <q-card class="full-height">
            <q-card-section>
              <div class="row items-center q-mb-sm">
                <q-icon name="group" size="32px" color="primary" class="q-mr-sm" />
                <div>
                  <h6 class="q-ma-none">Gestion de Usuarios</h6>
                  <p class="text-grey-7 q-ma-none text-caption">Administrar cuentas de usuario</p>
                </div>
              </div>
            </q-card-section>
            <q-card-actions>
              <q-btn color="primary" label="Ver Usuarios" icon="people" @click="verUsuarios" />
            </q-card-actions>
          </q-card>
        </div>

        <!-- Gestion de Productos -->
        <div class="col-md-6 col-sm-12">
          <q-card class="full-height">
            <q-card-section>
              <div class="row items-center q-mb-sm">
                <q-icon name="inventory" size="32px" color="green" class="q-mr-sm" />
                <div>
                  <h6 class="q-ma-none">Gestion de Productos</h6>
                  <p class="text-grey-7 q-ma-none text-caption">
                    Administrar catalogo de productos
                  </p>
                </div>
              </div>
            </q-card-section>
            <q-card-actions>
              <q-btn color="green" label="Ver Productos" icon="list" @click="verProductos" />
            </q-card-actions>
          </q-card>
        </div>

        <!-- Gestion de Ordenes -->
        <div class="col-md-6 col-sm-12">
          <q-card class="full-height">
            <q-card-section>
              <div class="row items-center q-mb-sm">
                <q-icon name="receipt_long" size="32px" color="orange" class="q-mr-sm" />
                <div>
                  <h6 class="q-ma-none">Gestion de Ordenes</h6>
                  <p class="text-grey-7 q-ma-none text-caption">Administrar reservas y pedidos</p>
                </div>
              </div>
            </q-card-section>
            <q-card-actions>
              <q-btn color="orange" label="Ver Ordenes" icon="shopping_cart" @click="verOrdenes" />
            </q-card-actions>
          </q-card>
        </div>
      </div>

      <!-- Modal Usuarios -->
      <q-dialog v-model="mostrarUsuarios" maximized>
        <q-card>
          <q-card-section class="row items-center q-pb-none">
            <div class="text-h6">Gestion de Usuarios</div>
            <q-space />
            <q-btn icon="close" flat round dense v-close-popup />
          </q-card-section>
          <q-card-section>
            <q-table
              :rows="usuarios"
              :columns="columnasUsuarios"
              row-key="id_usuario"
              :loading="loading"
            >
              <template v-slot:body-cell-acciones="props">
                <q-td :props="props">
                  <q-btn-dropdown color="primary" label="Cambiar Tipo">
                    <q-list>
                      <q-item
                        clickable
                        v-close-popup
                        @click="cambiarTipoUsuario(props.row, 'admin')"
                      >
                        <q-item-section>Admin</q-item-section>
                      </q-item>
                      <q-item
                        clickable
                        v-close-popup
                        @click="cambiarTipoUsuario(props.row, 'cliente')"
                      >
                        <q-item-section>Cliente</q-item-section>
                      </q-item>
                    </q-list>
                  </q-btn-dropdown>
                </q-td>
              </template>
            </q-table>
          </q-card-section>
        </q-card>
      </q-dialog>

      <!-- Modal Productos -->
      <q-dialog v-model="mostrarProductos" maximized>
        <q-card>
          <q-card-section class="row items-center q-pb-none">
            <div class="text-h6">Gestion de Productos</div>
            <q-space />
            <q-btn color="primary" label="Nuevo Producto" icon="add" @click="nuevoProducto" />
            <q-btn icon="close" flat round dense v-close-popup />
          </q-card-section>
          <q-card-section>
            <q-table :rows="productos" :columns="columnasProductos" row-key="id" :loading="loading">
              <template v-slot:body-cell-acciones="props">
                <q-td :props="props">
                  <q-btn flat color="primary" icon="edit" @click="editarProducto(props.row)" />
                  <q-btn
                    flat
                    color="negative"
                    icon="delete"
                    @click="confirmarEliminarProducto(props.row)"
                  />
                </q-td>
              </template>
            </q-table>
          </q-card-section>
        </q-card>
      </q-dialog>

      <!-- Modal Ordenes -->
      <q-dialog v-model="mostrarOrdenes" maximized>
        <q-card>
          <q-card-section class="row items-center q-pb-none">
            <div class="text-h6">Gestion de Ordenes</div>
            <q-space />
            <q-btn icon="close" flat round dense v-close-popup />
          </q-card-section>
          <q-card-section>
            <q-table :rows="ordenes" :columns="columnasOrdenes" row-key="id" :loading="loading">
              <template v-slot:body-cell-estado="props">
                <q-td :props="props">
                  <q-chip
                    :color="getEstadoColor(props.row.estado)"
                    text-color="white"
                    :label="props.row.estado"
                  />
                </q-td>
              </template>
              <template v-slot:body-cell-acciones="props">
                <q-td :props="props">
                  <q-btn-dropdown color="primary" label="Cambiar Estado">
                    <q-list>
                      <q-item
                        clickable
                        v-close-popup
                        @click="cambiarEstado(props.row, 'por_revisar')"
                      >
                        <q-item-section>Por Revisar</q-item-section>
                      </q-item>
                      <q-item clickable v-close-popup @click="cambiarEstado(props.row, 'revisado')">
                        <q-item-section>Revisado</q-item-section>
                      </q-item>
                      <q-item
                        clickable
                        v-close-popup
                        @click="cambiarEstado(props.row, 'finalizado')"
                      >
                        <q-item-section>Finalizado</q-item-section>
                      </q-item>
                    </q-list>
                  </q-btn-dropdown>
                </q-td>
              </template>
            </q-table>
          </q-card-section>
        </q-card>
      </q-dialog>

      <!-- Modal Formulario Producto -->
      <q-dialog v-model="mostrarModalProducto">
        <q-card style="min-width: 500px">
          <q-card-section>
            <div class="text-h6">{{ editandoProducto ? 'Editar Producto' : 'Nuevo Producto' }}</div>
          </q-card-section>
          <q-card-section>
            <q-form @submit="guardarProducto">
              <q-input
                v-model="productoForm.item"
                label="Nombre del Producto"
                filled
                required
                class="q-mb-md"
              />
              <q-input
                v-model="productoForm.precio_unitario"
                label="Precio"
                type="number"
                step="0.01"
                filled
                required
                class="q-mb-md"
              />
              <q-select
                v-model="productoForm.tipo_kit"
                :options="tiposKit"
                label="Tipo de Kit"
                filled
                required
                class="q-mb-md"
              />

              <div class="row q-gutter-sm">
                <q-btn
                  type="submit"
                  color="primary"
                  :label="editandoProducto ? 'Actualizar' : 'Crear'"
                  :loading="loading"
                />
                <q-btn flat label="Cancelar" v-close-popup @click="limpiarFormProducto" />
              </div>
            </q-form>
          </q-card-section>
        </q-card>
      </q-dialog>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAdminDB } from '../composables/useAdminDB'

const router = useRouter()
const $q = useQuasar()

// Datos del admin y acceso
const esAdmin = ref(false)
const userEmail = ref('')
const tipoUsuario = ref('')
const fechaAcceso = ref('')

// Estados de los modales
const mostrarUsuarios = ref(false)
const mostrarProductos = ref(false)
const mostrarOrdenes = ref(false)
const mostrarModalProducto = ref(false)
const mostrarEstadisticas = ref(false)

// Datos
const usuarios = ref([])
const productos = ref([])
const ordenes = ref([])
const estadisticas = ref(null)

// Formularios
const productoForm = ref({
  item: '',
  precio_unitario: '',
  tipo_kit: '',
})
const editandoProducto = ref(false)
const productoEditando = ref(null)

// Opciones
const tiposKit = ['hogar', 'oficina', 'escolar', 'industria', 'montana']

// Composables
const {
  loading,
  obtenerUsuarios,
  actualizarTipoUsuario,
  eliminarUsuario,
  obtenerTodosLosProductos,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
  obtenerTodasLasOrdenes,
  cambiarEstadoOrden,
  obtenerEstadisticas,
} = useAdminDB()

// Columnas de tablas
const columnasUsuarios = [
  { name: 'nombre', align: 'left', label: 'Nombre', field: 'nombre', sortable: true },
  { name: 'correo', align: 'left', label: 'Email', field: 'correo', sortable: true },
  { name: 'tipo_usuario', align: 'center', label: 'Tipo', field: 'tipo_usuario', sortable: true },
  {
    name: 'fecha_creacion',
    align: 'center',
    label: 'Fecha Registro',
    field: 'fecha_creacion',
    sortable: true,
  },
  { name: 'acciones', align: 'center', label: 'Acciones', field: 'acciones' },
]

const columnasProductos = [
  { name: 'item', align: 'left', label: 'Producto', field: 'item', sortable: true },
  { name: 'tipo_kit', align: 'center', label: 'Tipo', field: 'tipo_kit', sortable: true },
  {
    name: 'precio_unitario',
    align: 'right',
    label: 'Precio',
    field: 'precio_unitario',
    sortable: true,
    format: (val) => `$${val}`,
  },
  { name: 'acciones', align: 'center', label: 'Acciones', field: 'acciones' },
]

const columnasOrdenes = [
  { name: 'id', align: 'center', label: 'ID', field: 'id', sortable: true },
  {
    name: 'usuario_nombre',
    align: 'left',
    label: 'Usuario',
    field: 'usuario_nombre',
    sortable: true,
  },
  { name: 'fecha', align: 'center', label: 'Fecha', field: 'fecha', sortable: true },
  {
    name: 'total',
    align: 'right',
    label: 'Total',
    field: 'total',
    sortable: true,
    format: (val) => `$${val}`,
  },
  { name: 'estado', align: 'center', label: 'Estado', field: 'estado', sortable: true },
  { name: 'acciones', align: 'center', label: 'Acciones', field: 'acciones' },
]

// Metodos de verificacion y configuracion
const verificarAccesoAdmin = () => {
  try {
    console.log('🔍 Verificando acceso admin...')

    const userData = localStorage.getItem('userData')
    const tipoUsuarioLS = localStorage.getItem('tipo_usuario')

    console.log('📦 userData desde localStorage:', userData)
    console.log('👤 tipo_usuario desde localStorage:', tipoUsuarioLS)

    if (!userData) {
      console.log('❌ No hay userData en localStorage')
      esAdmin.value = false
      return
    }

    const user = JSON.parse(userData)
    console.log('🔍 Usuario parseado:', user)
    console.log('🔍 Tipo de usuario del objeto:', user.tipo_usuario)

    esAdmin.value = user.tipo_usuario === 'admin'
    userEmail.value = user.correo || user.email || 'N/A'
    tipoUsuario.value = user.tipo_usuario || 'N/A'
    fechaAcceso.value = new Date().toLocaleString()

    console.log('✅ Es admin?:', esAdmin.value)
    console.log('📧 Email:', userEmail.value)
    console.log('👤 Tipo usuario:', tipoUsuario.value)

    if (!esAdmin.value) {
      console.log('❌ Acceso denegado - no es admin')
      mostrarNotificacion('Acceso denegado. Solo administradores pueden acceder.', 'negative')
      setTimeout(() => router.push('/principal'), 2000)
    } else {
      console.log('✅ Acceso permitido - es admin')
    }
  } catch (error) {
    console.error('💥 Error verificando acceso admin:', error)
    esAdmin.value = false
  }
}

// Metodos de notificacion
const mostrarNotificacion = (mensaje, tipo = 'positive') => {
  $q.notify({
    message: mensaje,
    type: tipo,
    position: 'top',
    timeout: 3000,
  })
}

// Metodos de usuarios
const verUsuarios = async () => {
  try {
    usuarios.value = await obtenerUsuarios()
    mostrarUsuarios.value = true
  } catch (error) {
    mostrarNotificacion('Error al cargar usuarios: ' + error.message, 'negative')
  }
}

const cambiarTipoUsuario = async (usuario, nuevoTipo) => {
  try {
    await actualizarTipoUsuario(usuario.id_usuario, nuevoTipo)
    mostrarNotificacion(`Tipo de usuario actualizado a ${nuevoTipo}`, 'positive')
    usuarios.value = await obtenerUsuarios()
  } catch (error) {
    mostrarNotificacion('Error al cambiar tipo de usuario: ' + error.message, 'negative')
  }
}

const confirmarEliminarUsuario = (usuario) => {
  $q.dialog({
    title: 'Confirmar Eliminacion',
    message: `¿Estas seguro de eliminar al usuario "${usuario.nombre}"? Esta accion no se puede deshacer.`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      await eliminarUsuario(usuario.id_usuario)
      mostrarNotificacion('Usuario eliminado correctamente', 'positive')
      usuarios.value = await obtenerUsuarios()
    } catch (error) {
      mostrarNotificacion('Error al eliminar usuario: ' + error.message, 'negative')
    }
  })
}

// Metodos de productos
const verProductos = async () => {
  try {
    productos.value = await obtenerTodosLosProductos()
    mostrarProductos.value = true
  } catch (error) {
    mostrarNotificacion('Error al cargar productos: ' + error.message, 'negative')
  }
}

const nuevoProducto = () => {
  limpiarFormProducto()
  editandoProducto.value = false
  mostrarModalProducto.value = true
}

const editarProducto = (producto) => {
  productoForm.value = { ...producto }
  editandoProducto.value = true
  productoEditando.value = producto
  mostrarModalProducto.value = true
}

const guardarProducto = async () => {
  try {
    if (editandoProducto.value) {
      await actualizarProducto(productoEditando.value, productoForm.value)
      mostrarNotificacion('Producto actualizado correctamente', 'positive')
    } else {
      await crearProducto(productoForm.value)
      mostrarNotificacion('Producto creado correctamente', 'positive')
    }

    mostrarModalProducto.value = false
    limpiarFormProducto()
    productos.value = await obtenerTodosLosProductos()
  } catch (error) {
    mostrarNotificacion('Error al guardar producto: ' + error.message, 'negative')
  }
}

const confirmarEliminarProducto = (producto) => {
  $q.dialog({
    title: 'Confirmar Eliminacion',
    message: `¿Estas seguro de eliminar el producto "${producto.item}"? Esta accion no se puede deshacer.`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      await eliminarProducto(producto)
      mostrarNotificacion('Producto eliminado correctamente', 'positive')
      productos.value = await obtenerTodosLosProductos()
    } catch (error) {
      mostrarNotificacion('Error al eliminar producto: ' + error.message, 'negative')
    }
  })
}

const limpiarFormProducto = () => {
  productoForm.value = {
    item: '',
    precio_unitario: '',
    tipo_kit: '',
  }
  editandoProducto.value = false
  productoEditando.value = null
}

// Metodos de ordenes
const verOrdenes = async () => {
  try {
    ordenes.value = await obtenerTodasLasOrdenes()
    mostrarOrdenes.value = true
  } catch (error) {
    mostrarNotificacion('Error al cargar ordenes: ' + error.message, 'negative')
  }
}

const cambiarEstado = async (orden, nuevoEstado) => {
  try {
    await cambiarEstadoOrden(orden.id, nuevoEstado)
    mostrarNotificacion(`Estado de orden cambiado a ${nuevoEstado}`, 'positive')
    ordenes.value = await obtenerTodasLasOrdenes()
  } catch (error) {
    mostrarNotificacion('Error al cambiar estado: ' + error.message, 'negative')
  }
}

const getEstadoColor = (estado) => {
  switch (estado) {
    case 'por_revisar':
      return 'orange'
    case 'revisado':
      return 'blue'
    case 'finalizado':
      return 'green'
    default:
      return 'grey'
  }
}

// Metodos de estadisticas
const verEstadisticas = async () => {
  try {
    estadisticas.value = await obtenerEstadisticas()
    mostrarEstadisticas.value = true
  } catch (error) {
    mostrarNotificacion('Error al cargar estadisticas: ' + error.message, 'negative')
  }
}

const verReportes = () => {
  verEstadisticas()
}

// Inicializacion
onMounted(() => {
  verificarAccesoAdmin()
})
</script>

<style scoped>
.full-height {
  height: 100%;
}
</style>
