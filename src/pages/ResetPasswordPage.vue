<template>
  <q-layout view="lHh Lpr lFf">
    <q-page class="flex flex-center auth-page">
      <q-card class="auth-card q-pa-lg">
        <q-card-section class="text-center">
          <div class="auth-logo q-mb-md">
            <q-avatar size="80px" color="primary" text-color="white">
              <q-icon name="lock_reset" size="40px" />
            </q-avatar>
          </div>
          <div class="text-h5 text-weight-medium q-mb-xs">Restablecer Contraseña</div>
          <div class="text-subtitle2 text-grey-6">Ingresa tu nueva contraseña</div>
        </q-card-section>

        <q-card-section>
          <q-form @submit.prevent="handlePasswordUpdate" class="q-gutter-md">
            <q-input
              v-model="newPassword"
              label="Nueva contraseña (mínimo 6 caracteres)"
              :type="showPassword ? 'text' : 'password'"
              outlined
              :rules="[
                (val) => !!val || 'La contraseña es requerida',
                (val) => val.length >= 6 || 'Mínimo 6 caracteres',
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

            <q-input
              v-model="confirmPassword"
              label="Confirmar nueva contraseña"
              :type="showConfirmPassword ? 'text' : 'password'"
              outlined
              :rules="[
                (val) => !!val || 'Confirma tu contraseña',
                (val) => val === newPassword || 'Las contraseñas no coinciden',
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
              label="Actualizar Contraseña"
              color="primary"
              size="lg"
              class="full-width"
              :loading="loading"
              :disable="loading"
            />
          </q-form>

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

        <q-card-section class="text-center">
          <q-btn
            flat
            label="Volver al inicio de sesión"
            color="primary"
            @click="$router.push('/auth')"
          />
        </q-card-section>
      </q-card>
    </q-page>
  </q-layout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth.js'

const router = useRouter()

// Estados del componente
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const successMessage = ref('')

// Campos del formulario
const newPassword = ref('')
const confirmPassword = ref('')

// Composable de autenticación
const { loading, error, updatePassword } = useAuth()

// Verificar que el usuario tiene sesión válida para resetear contraseña
onMounted(() => {
  // Aquí podrías verificar si hay un token de reset válido
  // Por ahora, asumimos que el usuario llegó aquí a través del enlace de email
})

// Manejar actualización de contraseña
const handlePasswordUpdate = async () => {
  successMessage.value = ''

  const result = await updatePassword(newPassword.value)

  if (result.success) {
    successMessage.value =
      'Contraseña actualizada exitosamente. Serás redirigido al inicio de sesión.'

    // Redirigir después de 2 segundos
    setTimeout(() => {
      router.push('/auth')
    }, 2000)
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

@media (max-width: 600px) {
  .auth-card {
    margin: 16px;
    max-width: none;
  }
}
</style>
