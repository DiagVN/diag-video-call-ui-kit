import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { createRouter, createWebHistory } from 'vue-router';
import { createI18n } from 'vue-i18n';
import App from './App.vue';
import { messages } from '@diagvn/video-call-ui-kit-v2';

// Register Agora extensions before creating adapter instances
// This is needed because dynamic imports may not work correctly in bundled apps
import { registerAgoraExtensions } from '@diagvn/agora-web-adapter-v2';
import VirtualBackgroundExtension from 'agora-extension-virtual-background';
import BeautyExtension from 'agora-extension-beauty-effect';

registerAgoraExtensions({
  VirtualBackgroundExtension,
  BeautyExtension,
  // Path to the directory containing WASM files (relative to public folder)
  virtualBackgroundWasmDir: '/wasms',
});

// Note: Base styles are auto-imported by the ui-kit-v2 package

// Routes
const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('./views/HomeView.vue'),
    },
    {
      path: '/simple',
      name: 'simple',
      component: () => import('./views/SimpleCallView.vue'),
    },
    {
      path: '/custom',
      name: 'custom',
      component: () => import('./views/CustomCallView.vue'),
    },
    {
      path: '/prejoin',
      name: 'prejoin',
      component: () => import('./views/PreJoinView.vue'),
    },
    {
      path: '/call',
      name: 'call',
      component: () => import('./views/InCallView.vue'),
    },
  ],
});

// i18n
const i18n = createI18n({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  messages,
});

// Create app
const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);
app.use(i18n);

app.mount('#app');
