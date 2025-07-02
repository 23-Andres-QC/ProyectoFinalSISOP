import { requireAuth, redirectIfAuthenticated, requireAdmin } from '../middleware/auth.js'

const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        name: 'welcome',
        component: () => import('pages/WelcomePage.vue'),
      },
      {
        path: 'auth',
        name: 'auth',
        component: () => import('pages/AuthPage.vue'),
        beforeEnter: redirectIfAuthenticated,
      },
      {
        path: 'principal',
        name: 'principal',
        component: () => import('pages/IndexPage.vue'),
        beforeEnter: requireAuth,
      },
      {
        path: 'ac',
        component: () => import('src/pages/AccidentesPage.vue'),
        beforeEnter: requireAuth,
      },
      // Formularios de botiquín
      {
        path: 'botiquin-formulario',
        component: () => import('src/pages/BotiquinFormularioPage.vue'),
        beforeEnter: requireAuth,
      },
      // Formularios de botiquín para diferentes tipos (rutas legacy)
      {
        path: 'botiquin-frm-escolar',
        component: () => import('src/pages/BotiquinFormularioPage.vue'),
        beforeEnter: requireAuth,
      },
      {
        path: 'botiquin-frm-hogar',
        component: () => import('src/pages/BotiquinFormularioPage.vue'),
        beforeEnter: requireAuth,
      },
      {
        path: 'botiquin-frm-oficina',
        component: () => import('src/pages/BotiquinFormularioPage.vue'),
        beforeEnter: requireAuth,
      },
      {
        path: 'botiquin-frm-industria',
        component: () => import('src/pages/BotiquinFormularioPage.vue'),
        beforeEnter: requireAuth,
      },
      {
        path: 'botiquin-frm-montaña',
        component: () => import('src/pages/BotiquinFormularioPage.vue'),
        beforeEnter: requireAuth,
      },
      {
        path: 'botiquin-opciones',
        component: () => import('src/pages/BotiquinOpcionPage.vue'),
        beforeEnter: requireAuth,
      },
      {
        path: 'historial-compras',
        component: () => import('src/pages/HistorialReservasPage.vue'),
        beforeEnter: requireAuth,
      },
      {
        path: 'historial-botiquin',
        component: () => import('src/pages/HistorialBotiquinPage.vue'),
        beforeEnter: requireAuth,
      },
      {
        path: 'admin-simple',
        component: () => import('src/pages/AdminSimplePage.vue'),
        beforeEnter: requireAuth, // Solo requiere estar logueado
      },
      // Rutas de recomendaciones
      { path: 'hogar', component: () => import('components/RecomendacionTipo01/Hogar.vue') },
      { path: 'industria', component: () => import('components/RecomendacionTipo02/Oficina.vue') },
      { path: 'montaña', component: () => import('components/RecomendacionTipo03/Escolar.vue') },
      { path: 'oficina', component: () => import('components/RecomendacionTipo04/Industria.vue') },
      { path: 'escolar', component: () => import('components/RecomendacionTipo05/Montaña.vue') },
      { path: 'reco', component: () => import('components/Recomendaciones/Recomendacion.vue') },
    ],
  },

  // Rutas de autenticación (fuera del layout principal)
  { path: '/reset-password', component: () => import('pages/ResetPasswordPage.vue') },
  { path: '/chat', component: () => import('components/Recomendaciones/ChatBot.vue') },
  { path: '/reco1', component: () => import('components/Recomendaciones/Recomendacion.vue') },

  // Always leave this as last one
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
