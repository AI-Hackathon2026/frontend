/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
  readonly VITE_EXPRESS_SERVER_URL?: string;
  readonly VITE_USE_API_PROXY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
