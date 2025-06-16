const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/LoginPage.vue') },
      { path: 'principal', component: () => import('pages/IndexPage.vue') },
      { path: 'botiquin', component: () => import('pages/BotiquinPage.vue') },
    ],
  },

  { path: '/tip1', component: () => import('components/RecomendacionTipo01/Hogar.vue') },
  { path: '/tip2', component: () => import('components/RecomendacionTipo02/Oficina.vue') },
  { path: '/tip3', component: () => import('components/RecomendacionTipo03/Escolar.vue') },
  { path: '/tip4', component: () => import('components/RecomendacionTipo04/Industria.vue') },
  { path: '/tip5', component: () => import('components/RecomendacionTipo05/Montaña.vue') },
  { path: '/ac', component: () => import('pages/VentanaAccidentesPage.vue') },
  { path: '/chat', component: () => import('components/Recomendaciones/ChatBot.vue') },
  { path: '/reco', component: () => import('components/Recomendaciones/Recomendacion.vue') },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
