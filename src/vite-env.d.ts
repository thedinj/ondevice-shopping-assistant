/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_SHOW_DATABASE_RESET?: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}

