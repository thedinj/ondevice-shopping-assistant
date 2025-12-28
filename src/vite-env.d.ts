/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_DATABASE_TYPE?: string;
    readonly VITE_SEED_TEST_DATA?: string;
    readonly VITE_SHOW_DATABASE_RESET?: string;
    readonly VITE_OPENAI_API_KEY?: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}

