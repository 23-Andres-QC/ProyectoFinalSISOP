import { requireAuth, redirectIfAuthenticated } from '../middleware/auth.js'

const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('pages/AuthPage.vue'),
        beforeEnter: redirectIfAuthenticated,
      },
      {
        path: 'principal',
        component: () => import('pages/IndexPage.vue'),
        beforeEnter: requireAuth,
      },
      {
        path: 'ac',
        component: () => import('src/pages/AccidentesPage.vue'),
        beforeEnter: requireAuth,
      },
      {
        path: 'botiquin-opciones',
        component: () => import('src/pages/BotiquinOpcionPage.vue'),
        beforeEnter: requireAuth,
      },
      {
        path: 'botiquin-formulario/oficina',
        component: () => import('src/pages/BotiquinFrmOficina.vue'),
        beforeEnter: requireAuth,
      },
      {
        path: 'botiquin-formulario/escolar',
        component: () => import('src/pages/BotiquinFrmEscolar.vue'),
        beforeEnter: requireAuth,
      },
      {
        path: 'botiquin-formulario/hogar',
        component: () => import('src/pages/BotiquinFrmHogar.vue'),
        beforeEnter: requireAuth,
      },
      {
        path: 'botiquin-formulario/industrias',
        component: () => import('src/pages/BotiquinFrmIndustrias.vue'),
        beforeEnter: requireAuth,
      },
      {
        path: 'botiquin-formulario/montaña',
        component: () => import('src/pages/BotiquinFrmMontaña.vue'),
        beforeEnter: requireAuth,
      },
      {
        path: 'botiquin',
        component: () => import('src/pages/BotiquinyAccidentesPage.vue'),
        beforeEnter: requireAuth,
      },
      {
        path: 'historial-compras',
        component: () => import('src/pages/HistorialComprasPage.vue'),
        beforeEnter: requireAuth,
      },
      {
        path: 'admin/ordenes',
        component: () => import('src/pages/AdminOrdenesPage.vue'),
        beforeEnter: requireAuth,
      },
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
  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
