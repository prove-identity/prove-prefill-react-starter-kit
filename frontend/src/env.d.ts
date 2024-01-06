/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_APP_TITLE: string
    readonly VITE_APP_ENV: string;
    readonly VITE_APP_BASE_API_URL: string;
    readonly VITE_APP_CONTINUE_AUTH_URL_PROD: string;
    readonly VITE_APP_CONTINUE_AUTH_URL_SANDBOX: string;
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv
  }