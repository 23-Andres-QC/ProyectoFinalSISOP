const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/LoginPage.vue') },
      { path: 'principal', component: () => import('pages/IndexPage.vue') },
      { path: 'ac', component: () => import('src/pages/AccidentesPage.vue') },
      { path: '/botiquin', component: () => import('src/pages/BotiquinyAccidentesPage.vue') },
      { path: '/hogar', component: () => import('components/RecomendacionTipo01/Hogar.vue') },
      { path: '/industria', component: () => import('components/RecomendacionTipo02/Oficina.vue') },
      { path: '/montaña', component: () => import('components/RecomendacionTipo03/Escolar.vue') },
      { path: '/oficina', component: () => import('components/RecomendacionTipo04/Industria.vue') },
      { path: '/escolar', component: () => import('components/RecomendacionTipo05/Montaña.vue') },
      { path: '/reco', component: () => import('components/Recomendaciones/Recomendacion.vue') },
    ],
  },

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
