import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import { createRouter, createWebHistory } from 'vue-router'
import { createVideoCallI18n } from '@diag/video-call-ui-kit'

import App from './App.vue'
import PreJoinView from './views/PreJoinView.vue'
import InCallView from './views/InCallView.vue'

// Router
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'PreJoin', component: PreJoinView },
    { path: '/call', name: 'InCall', component: InCallView }
  ]
})

// i18n
const defaultLang = (import.meta.env.VITE_DEFAULT_LANGUAGE || 'vi') as 'vi' | 'en'
const i18n = createI18n(createVideoCallI18n({}, defaultLang))

// Pinia
const pinia = createPinia()

// Create and mount app
const app = createApp(App)

app.use(pinia)
app.use(router)
app.use(i18n)

app.mount('#app')
