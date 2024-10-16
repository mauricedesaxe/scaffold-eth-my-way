/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly NETWORK: string;
  // Add other env variables here
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
