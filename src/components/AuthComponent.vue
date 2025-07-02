<template>
  <q-layout view="lHh Lpr lFf">
    <q-page class="flex flex-center auth-page">
      <q-card class="auth-card q-pa-lg">
        <q-card-section class="text-center">
          <div class="auth-logo q-mb-md">
            <q-avatar size="80px" color="primary" text-color="white">
              <q-icon name="medical_services" size="40px" />
            </q-avatar>
          </div>
          <div class="text-h5 text-weight-medium q-mb-xs">
            {{
              isLoginMode
                ? 'Iniciar Sesión'
                : isRecoveryMode
                  ? 'Recuperar Contraseña'
                  : 'Crear Cuenta'
            }}
          </div>
          <div class="text-subtitle2 text-grey-6">
            {{
              isLoginMode
                ? 'Accede a tu cuenta'
                : isRecoveryMode
                  ? 'Te enviaremos un enlace de recuperación'
                  : 'Regístrate para comenzar'
            }}
          </div>
        </q-card-section>

        <q-card-section>
          <!-- Modo de recuperación de contraseña -->
          <q-form
            v-if="isRecoveryMode"
            @submit.prevent="handlePasswordRecovery"
            class="q-gutter-md"
          >
            <q-input
              v-model="email"
              label="Correo electrónico"
              type="email"
              outlined
              :rules="[
                (val) => !!val || 'El correo es requerido',
                (val) => /.+@.+\..+/.test(val) || 'Correo inválido',
              ]"
              class="q-mb-md"
            >
              <template #prepend>
                <q-icon name="email" />
              </template>
            </q-input>

            <q-btn
              type="submit"
              label="Enviar enlace de recuperación"
              color="primary"
              size="lg"
              class="full-width"
              :loading="loading"
              :disable="loading"
            />
          </q-form>

          <!-- Modo de login/registro -->
          <q-form v-else @submit.prevent="handleSubmit" class="q-gutter-md">
            <!-- Campo nombre solo para registro -->
            <q-input
              v-if="!isLoginMode"
              v-model="nombre"
              label="Nombre completo"
              outlined
              :rules="[(val) => !!val || 'El nombre es requerido']"
              class="q-mb-md"
            >
              <template #prepend>
                <q-icon name="person" />
              </template>
            </q-input>

            <q-input
              v-model="email"
              label="Correo electrónico"
              type="email"
              outlined
              :rules="[
                (val) => !!val || 'El correo es requerido',
                (val) => /.+@.+\..+/.test(val) || 'Correo inválido',
              ]"
              class="q-mb-md"
            >
              <template #prepend>
                <q-icon name="email" />
              </template>
            </q-input>

            <q-input
              v-model="password"
              :label="isLoginMode ? 'Contraseña' : 'Contraseña (mínimo 6 caracteres)'"
              :type="showPassword ? 'text' : 'password'"
              outlined
              :rules="[
                (val) => !!val || 'La contraseña es requerida',
                (val) => isLoginMode || val.length >= 6 || 'Mínimo 6 caracteres',
              ]"
              class="q-mb-md"
            >
              <template #prepend>
                <q-icon name="lock" />
              </template>
              <template #append>
                <q-icon
                  :name="showPassword ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  @click="showPassword = !showPassword"
                />
              </template>
            </q-input>

            <!-- Confirmar contraseña solo para registro -->
            <q-input
              v-if="!isLoginMode"
              v-model="confirmPassword"
              label="Confirmar contraseña"
              :type="showConfirmPassword ? 'text' : 'password'"
              outlined
              :rules="[
                (val) => !!val || 'Confirma tu contraseña',
                (val) => val === password || 'Las contraseñas no coinciden',
              ]"
              class="q-mb-md"
            >
              <template #prepend>
                <q-icon name="lock" />
              </template>
              <template #append>
                <q-icon
                  :name="showConfirmPassword ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  @click="showConfirmPassword = !showConfirmPassword"
                />
              </template>
            </q-input>

            <q-btn
              type="submit"
              :label="isLoginMode ? 'Iniciar Sesión' : 'Crear Cuenta'"
              color="primary"
              size="lg"
              class="full-width"
              :loading="loading"
              :disable="loading"
            />
          </q-form>

          <!-- Enlaces de navegación -->
          <div v-if="!isRecoveryMode" class="auth-links q-mt-lg">
            <!-- Enlace de recuperación de contraseña solo en modo login -->
            <div v-if="isLoginMode" class="text-center q-mb-md">
              <q-btn
                flat
                label="¿Olvidaste tu contraseña?"
                color="primary"
                size="sm"
                @click="isRecoveryMode = true"
                class="text-decoration-underline"
              />
            </div>

            <!-- Separador -->
            <q-separator class="q-my-md" />

            <!-- Enlaces de cambio entre login y registro -->
            <div class="text-center">
              <span class="text-grey-6">
                {{ isLoginMode ? '¿No tienes una cuenta?' : '¿Ya tienes una cuenta?' }}
              </span>
              <br />
              <q-btn
                flat
                :label="isLoginMode ? 'Crear cuenta nueva' : 'Iniciar sesión'"
                color="primary"
                @click="toggleMode"
                class="text-weight-medium q-mt-xs"
              />
            </div>
          </div>

          <!-- Enlace para volver desde recuperación -->
          <div v-else class="text-center q-mt-lg">
            <q-separator class="q-my-md" />
            <q-btn flat label="← Volver al inicio de sesión" color="primary" @click="backToLogin" />
          </div>

          <!-- Mostrar errores -->
          <q-banner v-if="error" class="bg-negative text-white q-mt-md" rounded>
            <template #avatar>
              <q-icon name="error" />
            </template>
            {{ error }}
          </q-banner>

          <!-- Mensaje de éxito -->
          <q-banner v-if="successMessage" class="bg-positive text-white q-mt-md" rounded>
            <template #avatar>
              <q-icon name="check_circle" />
            </template>
            {{ successMessage }}
          </q-banner>
        </q-card-section>
      </q-card>
    </q-page>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth.js'

const router = useRouter()

// Estados del componente
const isLoginMode = ref(true)
const isRecoveryMode = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const successMessage = ref('')

// Campos del formulario
const nombre = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')

// Composable de autenticación
const { loading, error, signUp, signIn, resetPassword } = useAuth()

// Alternar entre modo login y registro
const toggleMode = () => {
  isLoginMode.value = !isLoginMode.value
  error.value = null
  successMessage.value = ''
  // Limpiar campos
  nombre.value = ''
  email.value = ''
  password.value = ''
  confirmPassword.value = ''
}

// Volver al login desde recuperación
const backToLogin = () => {
  isRecoveryMode.value = false
  isLoginMode.value = true
  error.value = null
  successMessage.value = ''
  // Limpiar campos
  email.value = ''
  password.value = ''
}

// Manejar envío del formulario
const handleSubmit = async () => {
  successMessage.value = ''

  if (isLoginMode.value) {
    // Iniciar sesión
    console.log('🔐 Intentando iniciar sesión...')
    const result = await signIn(email.value, password.value)

    if (result.success) {
      console.log('✅ Login exitoso - redirigiendo a /principal')

      // Simplificar: todos van a /principal inicialmente
      // Los admins pueden acceder a sus funciones desde los menús
      setTimeout(() => {
        router.push('/principal')
      }, 100) // Pequeño delay para asegurar que todo se complete
    } else {
      console.error('❌ Error en login:', result.error)
    }
  } else {
    // Registrarse
    const result = await signUp(email.value, password.value, {
      nombre: nombre.value,
    })

    if (result.success) {
      successMessage.value =
        'Cuenta creada exitosamente. Revisa tu correo para confirmar tu cuenta.'
      // Limpiar formulario
      nombre.value = ''
      email.value = ''
      password.value = ''
      confirmPassword.value = ''
    }
  }
}

// Manejar recuperación de contraseña
const handlePasswordRecovery = async () => {
  successMessage.value = ''

  const result = await resetPassword(email.value)

  if (result.success) {
    successMessage.value = 'Se ha enviado un enlace de recuperación a tu correo electrónico.'
    email.value = ''
  }
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.auth-card {
  width: 100%;
  max-width: 400px;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.95);
}

.auth-logo {
  margin-bottom: 20px;
}

.auth-links {
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  padding-top: 16px;
}

.text-decoration-underline {
  text-decoration: underline;
}

@media (max-width: 600px) {
  .auth-card {
    margin: 16px;
    max-width: none;
  }
}
</style>
