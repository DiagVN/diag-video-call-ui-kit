/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AGORA_APP_ID: string;
  readonly VITE_TOKEN_SERVER_URL: string;
  readonly VITE_AGORA_CUSTOMER_ID: string;
  readonly VITE_AGORA_CUSTOMER_SECRET: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
