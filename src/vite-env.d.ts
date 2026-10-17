/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Optional default OAuth 2.0 client ID for an X developer app (public client). Not a secret. */
  readonly VITE_X_CLIENT_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
